from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session, select
from pydantic import BaseModel
import bcrypt as _bcrypt
from jose import jwt

try:
    from ..database import get_session
    from ..models import User
    from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import User
    from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS
    from deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class UserPublic(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None


class AdminSetupRequest(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode('utf-8'), _bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """
    Standard OAuth2 password flow.
    Accepts application/x-www-form-urlencoded with 'username' and 'password'.
    Returns a JWT Bearer token valid for ACCESS_TOKEN_EXPIRE_HOURS hours.
    """
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated admin user."""
    return current_user


@router.post("/setup-admin", response_model=UserPublic, status_code=201)
def setup_admin(data: AdminSetupRequest, session: Session = Depends(get_session)):
    """Creates the first admin user. Returns 409 if any user already exists."""
    existing = session.exec(select(User)).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Admin já existe. Endpoint desabilitado após o primeiro setup.",
        )

    admin = User(
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        is_active=True,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin
