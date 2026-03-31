from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship


class QuoteStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    CANCELED = "CANCELED"
    COMPLETED = "COMPLETED"


class SaleStatus(str, Enum):
    PENDENTE = "Pendente"
    CONCLUIDA = "Concluída"
    CANCELADA = "Cancelada"

# Products
class ProductBase(SQLModel):
    name: str = Field(index=True)
    category: str = Field(index=True)
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_active: bool = True

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sales: List["SaleItem"] = Relationship(back_populates="product")

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int

# Users (Admin)
class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool = True

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

# Sales & Clients
class ClientBase(SQLModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class Client(ClientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sales: List["Sale"] = Relationship(back_populates="client")

class Sale(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.utcnow)
    client_id: Optional[int] = Field(default=None, foreign_key="client.id")
    client: Optional[Client] = Relationship(back_populates="sales")
    items: List["SaleItem"] = Relationship(back_populates="sale")
    total_amount: float
    # New enriched fields
    discount_percent: float = Field(default=0.0)
    payment_method: Optional[str] = Field(default="Dinheiro")  # Dinheiro, Pix, Cartão, Fiado
    status: str = Field(default=SaleStatus.CONCLUIDA)  # Pendente, Concluída, Cancelada
    delivery_date: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)


class SaleItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sale_id: Optional[int] = Field(default=None, foreign_key="sale.id")
    sale: Optional[Sale] = Relationship(back_populates="items")
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    product: Optional[Product] = Relationship(back_populates="sales")
    quantity: int
    unit_price: float

# Quotes
class Quote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: Optional[int] = Field(default=None, foreign_key="client.id")
    customer_name: str
    phone: str
    city: str
    address: Optional[str] = None
    notes: Optional[str] = None
    status: str = Field(default=QuoteStatus.PENDING)  # PENDING, APPROVED, CANCELED, COMPLETED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    items: List["QuoteItem"] = Relationship(back_populates="quote")

class QuoteItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quote_id: Optional[int] = Field(default=None, foreign_key="quote.id")
    quote: Optional[Quote] = Relationship(back_populates="items")
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    # We snapshot the name in case product is deleted/changed, but beneficial to link to Product too
    product_name_snapshot: str 
    quantity: int

# Company Settings
class CompanySettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(default="Viveiro de Mudas")
    whatsapp: str = Field(default="5511999999999")
    whatsapp_display: str = Field(default="(11) 99999-9999")
    email: str = Field(default="contato@viveirodemudas.com.br")
    address: str = Field(default="Rua das Flores, 123 - Jardim Primavera, São Paulo - SP")
    instagram: Optional[str] = Field(default=None)
    facebook: Optional[str] = Field(default=None)
    opening_hours: Optional[str] = Field(default="Seg-Sáb: 8h às 18h")
    logo_url: Optional[str] = Field(default=None)
    cnpj: Optional[str] = Field(default=None)
