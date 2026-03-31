"""
Shared FastAPI dependencies.
Import get_current_user into any router that needs JWT protection.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

try:
    from .database import get_session
    from .models import User
    from .config import SECRET_KEY, ALGORITHM
except ImportError:
    from database import get_session
    from models import User
    from config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """
    Validates JWT Bearer token and returns the active User.
    Raises HTTP 401 if the token is missing, invalid, or the user is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou sessão expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.username == username)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user
