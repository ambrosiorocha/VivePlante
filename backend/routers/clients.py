from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
try:
    from ..database import get_session
    from ..models import Client, User
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import Client, User
    from deps import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=Client)
def create_client(
    client: Client,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    session.add(client)
    session.commit()
    session.refresh(client)
    return client

@router.get("/", response_model=List[Client])
def read_clients(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    clients = session.exec(select(Client).offset(offset).limit(limit)).all()
    return clients

@router.get("/{client_id}", response_model=Client)
def read_client(client_id: int, session: Session = Depends(get_session)):
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.get("/{client_id}/sales-summary")
def get_client_sales_summary(client_id: int, session: Session = Depends(get_session)):
    """Returns how many sales the client has and if any are pending."""
    from models import Sale
    sales = session.exec(select(Sale).where(Sale.client_id == client_id)).all()
    pending = [s for s in sales if s.status == "Pendente"]
    return {
        "total_sales": len(sales),
        "pending_sales": len(pending),
    }

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    from models import Sale, Quote
    # Block if client has pending sales
    sales = session.exec(select(Sale).where(Sale.client_id == client_id)).all()
    pending_sales = [s for s in sales if s.status == "Pendente"]
    if pending_sales:
        raise HTTPException(
            status_code=400,
            detail=f"Cliente possui {len(pending_sales)} venda(s) com status 'Pendente'. Conclua ou cancele antes de excluir."
        )

    # Block if client has pending quotes
    quotes = session.exec(select(Quote).where(Quote.customer_id == client_id)).all()
    pending_quotes = [q for q in quotes if q.status == "PENDING"]
    if pending_quotes:
        raise HTTPException(
            status_code=400,
            detail=f"Cliente possui {len(pending_quotes)} pedido(s) pendente(s). Finalize ou cancele antes de excluir."
        )

    session.delete(client)
    session.commit()
    return {"ok": True}


@router.get("/{client_id}/quotes")
def get_client_quotes(client_id: int, session: Session = Depends(get_session)):
    from models import Quote, QuoteItem, Product
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    quotes = session.exec(select(Quote).where(Quote.customer_id == client_id).order_by(Quote.created_at.desc())).all()
    
    result = []
    for quote in quotes:
        items_data = []
        total = 0.0
        for item in quote.items:
            product = session.get(Product, item.product_id)
            price = product.price if product else 0.0
            total += price * item.quantity
            items_data.append({
                "product_name": item.product_name_snapshot,
                "quantity": item.quantity,
                "unit_price": price
            })
        result.append({
            "id": quote.id,
            "status": quote.status,
            "created_at": quote.created_at.isoformat(),
            "items": items_data,
            "total_estimated": total,
            "notes": quote.notes
        })
    
    return result


class ClientUpdate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    address: str = ""

@router.put("/{client_id}", response_model=Client)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.name = client_data.name
    client.email = client_data.email
    client.phone = client_data.phone
    client.address = client_data.address
    session.add(client)
    session.commit()
    session.refresh(client)
    return client
