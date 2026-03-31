from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

try:
    from ..database import get_session
    from ..models import Product, ProductCreate, ProductRead, User
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import Product, ProductCreate, ProductRead, User
    from deps import get_current_user

from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["products"])


class ProductPublic(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_active: bool = True
    price: Optional[float] = None  # shown to logged-in customers on the frontend


# ─── PUBLIC ───────────────────────────────────────────────────────────────────

@router.get("/public", response_model=List[ProductPublic])
def read_products_public(
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    products = session.exec(
        select(Product).where(Product.is_active == True).offset(offset).limit(limit)
    ).all()
    return products


@router.get("/{product_id}", response_model=ProductRead)
def read_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ─── PROTECTED (admin only) ───────────────────────────────────────────────────

@router.get("/", response_model=List[ProductRead])
def read_products(
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(select(Product).offset(offset).limit(limit)).all()


@router.post("/", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_product = Product.from_orm(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product: ProductCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    product_data = product.dict(exclude_unset=True)
    for key, value in product_data.items():
        setattr(db_product, key, value)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"ok": True}
