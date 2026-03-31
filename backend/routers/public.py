from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
try:
    from ..database import get_session
    from ..models import Client, ClientBase
except ImportError:
    from database import get_session
    from models import Client, ClientBase

router = APIRouter(prefix="/public", tags=["public"])

class LeadRegister(BaseModel):
    name: str
    phone: str
    city: str
    email: str | None = None
    address: str | None = None

@router.post("/register")
def register_lead(lead_data: LeadRegister, session: Session = Depends(get_session)):
    # Check if client already exists by phone (simple MVP check)
    existing_client = session.exec(select(Client).where(Client.phone == lead_data.phone)).first()
    
    if existing_client:
        return {"client_id": existing_client.id, "message": "Bem-vindo de volta!"}
    
    new_client = Client(
        name=lead_data.name,
        phone=lead_data.phone,
        email=lead_data.email,
        address=f"{lead_data.address} - {lead_data.city}" if lead_data.address else lead_data.city
    )
    session.add(new_client)
    session.commit()
    session.refresh(new_client)
    
    return {"client_id": new_client.id, "message": "Cadastro realizado com sucesso!"}
