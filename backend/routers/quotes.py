from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

try:
    from ..database import get_session
    from ..models import Quote, QuoteItem, Product, Sale, SaleItem, Client, QuoteStatus
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import Quote, QuoteItem, Product, Sale, SaleItem, Client, QuoteStatus
    from deps import get_current_user

router = APIRouter(prefix="/quotes", tags=["quotes"])


class QuoteItemCreate(BaseModel):
    product_id: int
    quantity: int


class QuoteCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: str
    phone: str
    city: str
    address: Optional[str] = None
    items: List[QuoteItemCreate]
    notes: Optional[str] = None


class ConvertPayload(BaseModel):
    payment_method: str = "Dinheiro"
    discount_percent: float = 0.0
    notes: Optional[str] = None
    delivery_date: Optional[str] = None


# ─── PUBLIC: Customer submits a quote from the website ────────────────────────

@router.post("/")
def create_quote(quote_data: QuoteCreate, session: Session = Depends(get_session)):
    quote = Quote(
        customer_id=quote_data.customer_id,
        customer_name=quote_data.customer_name,
        phone=quote_data.phone,
        city=quote_data.city,
        address=quote_data.address,
        notes=quote_data.notes,
        status=QuoteStatus.PENDING,
    )
    session.add(quote)
    session.commit()
    session.refresh(quote)

    for item in quote_data.items:
        product = session.get(Product, item.product_id)
        product_name = product.name if product else "Produto Desconhecido"
        quote_item = QuoteItem(
            quote_id=quote.id,
            product_id=item.product_id,
            product_name_snapshot=product_name,
            quantity=item.quantity,
        )
        session.add(quote_item)

    session.commit()
    return {"quote_id": quote.id, "message": "Orçamento criado com sucesso"}


# ─── PROTECTED: Admin endpoints ───────────────────────────────────────────────

@router.get("/")
def list_quotes(
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    query = select(Quote).order_by(Quote.created_at.desc())
    if status:
        query = query.where(Quote.status == status)
    return session.exec(query).all()


@router.get("/{quote_id}")
def get_quote_details(
    quote_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    quote = session.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    items = []
    total_estimated = 0.0
    for item in quote.items:
        product = session.get(Product, item.product_id)
        unit_price = product.price if product else 0.0
        total_estimated += unit_price * item.quantity
        items.append({
            "product_id": item.product_id,
            "product_name": item.product_name_snapshot,
            "quantity": item.quantity,
            "current_price": unit_price,
        })

    return {"quote": quote, "items": items, "total_estimated": total_estimated}


@router.put("/{quote_id}/status")
def update_quote_status(
    quote_id: int,
    status: str,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    quote = session.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    quote.status = status
    quote.updated_at = datetime.utcnow()
    session.add(quote)
    session.commit()
    return {"ok": True}


@router.post("/{quote_id}/convert")
def convert_to_sale(
    quote_id: int,
    payload: ConvertPayload = ConvertPayload(),
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Atomically converts a PENDING quote into a Sale.
    Performs full pre-validation before touching any data.
    Returns HTTP 409 with item-level detail if stock is insufficient.
    """
    quote = session.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    # ── Pre-validation: check quote state ────────────────────────────────────
    if quote.status in (QuoteStatus.COMPLETED, QuoteStatus.CANCELED):
        raise HTTPException(
            status_code=400,
            detail=f"Orçamento não pode ser convertido (status atual: {quote.status})",
        )

    # ── Pre-validation: check stock for ALL items before touching anything ───
    stock_errors = []
    items_snapshot = list(quote.items)  # freeze before any session changes

    for q_item in items_snapshot:
        product = session.get(Product, q_item.product_id)
        if not product:
            stock_errors.append({
                "product_id": q_item.product_id,
                "product_name": q_item.product_name_snapshot,
                "error": "Produto não encontrado (pode ter sido removido)",
                "requested": q_item.quantity,
                "available": 0,
            })
        elif product.stock_quantity < q_item.quantity:
            stock_errors.append({
                "product_id": q_item.product_id,
                "product_name": product.name,
                "requested": q_item.quantity,
                "available": product.stock_quantity,
            })

    if stock_errors:
        raise HTTPException(
            status_code=409,
            detail={"message": "Estoque insuficiente", "items": stock_errors},
        )

    # ── All checks passed — now perform the atomic operation ─────────────────

    # 1. Create or resolve client
    client_id = quote.customer_id
    if not client_id:
        existing = session.exec(
            select(Client).where(Client.phone == quote.phone)
        ).first()
        if existing:
            client_id = existing.id
        else:
            new_client = Client(
                name=quote.customer_name,
                phone=quote.phone,
                address=f"{quote.address or ''} - {quote.city}".strip(" -"),
            )
            session.add(new_client)
            session.flush()  # get new_client.id without committing
            client_id = new_client.id

    # 2. Calculate total and deduct stock
    total_amount = 0.0
    sale_items_data = []

    for q_item in items_snapshot:
        product = session.get(Product, q_item.product_id)
        # Product existence is guaranteed by pre-validation above
        product.stock_quantity -= q_item.quantity
        session.add(product)

        line_price = product.price * q_item.quantity
        total_amount += line_price
        sale_items_data.append({
            "product": product,
            "quantity": q_item.quantity,
            "unit_price": product.price,
        })

    # 3. Apply discount
    discount_amount = total_amount * (payload.discount_percent / 100)
    total_with_discount = total_amount - discount_amount

    # 4. Build notes
    extra_notes = f"Gerado via Orçamento #{quote.id}."
    if quote.notes:
        extra_notes += f" {quote.notes}"
    if payload.notes:
        extra_notes += f" {payload.notes}"

    # 5. Create Sale
    sale = Sale(
        client_id=client_id,
        total_amount=total_with_discount,
        discount_percent=payload.discount_percent,
        payment_method=payload.payment_method,
        delivery_date=payload.delivery_date,
        status="Concluída",
        notes=extra_notes,
    )
    session.add(sale)
    session.flush()  # get sale.id

    # 6. Create SaleItems
    for data in sale_items_data:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=data["product"].id,
            quantity=data["quantity"],
            unit_price=data["unit_price"],
        )
        session.add(sale_item)

    # 7. Mark quote as completed
    quote.status = QuoteStatus.COMPLETED
    quote.updated_at = datetime.utcnow()
    session.add(quote)

    # 8. Single commit — all or nothing
    session.commit()

    return {
        "sale_id": sale.id,
        "total_amount": total_with_discount,
        "message": "Orçamento convertido em venda com sucesso",
    }
