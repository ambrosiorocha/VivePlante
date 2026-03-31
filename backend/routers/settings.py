from fastapi import APIRouter, Depends
from sqlmodel import Session, select
try:
    from ..database import get_session
    from ..models import CompanySettings, User
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import CompanySettings, User
    from deps import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    whatsapp: Optional[str] = None
    whatsapp_display: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    opening_hours: Optional[str] = None
    logo_url: Optional[str] = None
    cnpj: Optional[str] = None

def get_or_create_settings(session: Session) -> CompanySettings:
    settings = session.exec(select(CompanySettings)).first()
    if not settings:
        settings = CompanySettings()
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return settings

@router.get("/")
def read_settings(session: Session = Depends(get_session)):
    return get_or_create_settings(session)

@router.put("/")
def update_settings(
    data: SettingsUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    settings = get_or_create_settings(session)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
