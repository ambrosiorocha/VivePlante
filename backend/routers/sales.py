from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from typing import List, Optional

try:
    from ..database import get_session
    from ..models import Sale, SaleItem, Product, Client, User
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import Sale, SaleItem, Product, Client, User
    from deps import get_current_user

from pydantic import BaseModel

router = APIRouter(prefix="/sales", tags=["sales"])


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    client_id: Optional[int] = None
    items: List[SaleItemCreate]
    discount_percent: float = 0.0
    payment_method: Optional[str] = "Dinheiro"
    status: str = "Concluída"
    delivery_date: Optional[str] = None
    notes: Optional[str] = None


# ─── PROTECTED: all sales endpoints require auth ──────────────────────────────

@router.get("/", response_model=List[dict])
def read_sales(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Returns paginated sales list.
    Uses selectinload for Sale.items and SaleItem.product to avoid N+1 queries.
    """
    statement = (
        select(Sale)
        .options(
            selectinload(Sale.items).selectinload(SaleItem.product),
            selectinload(Sale.client),
        )
        .order_by(Sale.date.desc())
        .limit(limit)
        .offset(offset)
    )
    sales = session.exec(statement).all()

    result = []
    for sale in sales:
        client_name = sale.client.name if sale.client else "Consumidor Final"
        items_display = [
            {
                "product_name": item.product.name if item.product else "Produto Removido",
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
            }
            for item in sale.items
        ]
        result.append({
            "id": sale.id,
            "client_name": client_name,
            "client_id": sale.client_id,
            "date": sale.date,
            "total_amount": sale.total_amount,
            "items": items_display,
            "discount_percent": sale.discount_percent,
            "payment_method": sale.payment_method,
            "status": sale.status,
            "delivery_date": sale.delivery_date,
            "notes": sale.notes,
        })
    return result


@router.post("/")
def create_sale(
    sale_data: SaleCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    total_amount = 0.0
    sale_items_data = []

    for item in sale_data.items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {product.name} (Restam {product.stock_quantity})",
            )
        product.stock_quantity -= item.quantity
        session.add(product)
        total_amount += product.price * item.quantity
        sale_items_data.append({"product": product, "quantity": item.quantity, "unit_price": product.price})

    subtotal = total_amount
    discount_amount = subtotal * (sale_data.discount_percent / 100)
    total_amount = subtotal - discount_amount

    sale = Sale(
        client_id=sale_data.client_id,
        total_amount=total_amount,
        discount_percent=sale_data.discount_percent,
        payment_method=sale_data.payment_method,
        status=sale_data.status,
        delivery_date=sale_data.delivery_date,
        notes=sale_data.notes,
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)

    for data in sale_items_data:
        session.add(SaleItem(
            sale_id=sale.id,
            product_id=data["product"].id,
            quantity=data["quantity"],
            unit_price=data["unit_price"],
        ))
    session.commit()

    return {"sale_id": sale.id, "total_amount": total_amount, "message": "Venda registrada com sucesso"}


@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    for item in sale.items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock_quantity += item.quantity
            session.add(product)

    for item in sale.items:
        session.delete(item)
    session.delete(sale)
    session.commit()
    return {"ok": True}


@router.put("/{sale_id}")
def update_sale(
    sale_id: int,
    sale_data: SaleCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Revert old items
    items_to_delete = list(sale.items)
    sale.items = []
    for item in items_to_delete:
        product = session.get(Product, item.product_id)
        if product:
            product.stock_quantity += item.quantity
            session.add(product)
        session.delete(item)
    session.flush()

    # Process new items
    total_amount = 0.0
    sale_items_data = []
    for item in sale_data.items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {product.name} (Restam {product.stock_quantity})",
            )
        product.stock_quantity -= item.quantity
        session.add(product)
        total_amount += product.price * item.quantity
        sale_items_data.append({"product": product, "quantity": item.quantity, "unit_price": product.price})

    subtotal = total_amount
    discount_amount = subtotal * (sale_data.discount_percent / 100)
    total_amount = subtotal - discount_amount

    sale.client_id = sale_data.client_id
    sale.total_amount = total_amount
    sale.discount_percent = sale_data.discount_percent
    sale.payment_method = sale_data.payment_method
    sale.status = sale_data.status
    sale.delivery_date = sale_data.delivery_date
    sale.notes = sale_data.notes
    session.add(sale)

    for data in sale_items_data:
        session.add(SaleItem(
            sale_id=sale.id,
            product_id=data["product"].id,
            quantity=data["quantity"],
            unit_price=data["unit_price"],
        ))
    session.commit()
    return {"sale_id": sale.id, "total_amount": total_amount, "message": "Venda atualizada com sucesso"}


@router.post("/{sale_id}/reopen")
def reopen_sale(
    sale_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Re-opens a completed sale: returns stock and sets status to Pendente."""
    sale = session.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    if sale.status != "Concluída":
        raise HTTPException(
            status_code=400,
            detail=f"Somente vendas 'Concluídas' podem ser reabertas (status atual: {sale.status})",
        )
    for item in sale.items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock_quantity += item.quantity
            session.add(product)
    sale.status = "Pendente"
    session.add(sale)
    session.commit()
    return {"ok": True, "message": "Venda reaberta. Estoque devolvido."}
