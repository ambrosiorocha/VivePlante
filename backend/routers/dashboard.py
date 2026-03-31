from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from collections import defaultdict
try:
    from ..database import get_session
    from ..models import Product, Sale, SaleItem, Client, User
    from ..deps import get_current_user
except ImportError:
    from database import get_session
    from models import Product, Sale, SaleItem, Client, User
    from deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    total_products = session.exec(select(func.count(Product.id))).one()
    total_sales = session.exec(select(func.count(Sale.id))).one()
    total_revenue = session.exec(select(func.sum(Sale.total_amount))).one() or 0.0
    total_clients = session.exec(select(func.count(Client.id))).one()
    low_stock = session.exec(select(Product).where(Product.stock_quantity < 5)).all()

    return {
        "total_products": total_products,
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "total_clients": total_clients,
        "low_stock_count": len(low_stock),
    }

@router.get("/monthly-revenue")
def get_monthly_revenue(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns revenue grouped by month (last 12 months)."""
    sales = session.exec(select(Sale)).all()
    monthly = defaultdict(float)
    for sale in sales:
        if sale.date:
            key = sale.date.strftime("%Y-%m")
            monthly[key] += sale.total_amount
    # Sort and return last 12 months
    sorted_months = sorted(monthly.items())[-12:]
    return [
        {"month": m, "label": _month_label(m), "revenue": round(v, 2)}
        for m, v in sorted_months
    ]

@router.get("/top-products")
def get_top_products(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns top 5 products by quantity sold."""
    items = session.exec(select(SaleItem)).all()
    product_totals: dict[int, dict] = {}
    for item in items:
        pid = item.product_id
        if pid not in product_totals:
            product = session.get(Product, pid)
            product_totals[pid] = {
                "name": product.name if product else f"Produto #{pid}",
                "quantity": 0,
                "revenue": 0.0
            }
        product_totals[pid]["quantity"] += item.quantity
        product_totals[pid]["revenue"] += item.unit_price * item.quantity

    sorted_products = sorted(product_totals.values(), key=lambda x: x["quantity"], reverse=True)[:5]
    return sorted_products

@router.get("/low-stock")
def get_low_stock(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns products with stock below 5."""
    products = session.exec(
        select(Product).where(Product.stock_quantity < 5).where(Product.is_active == True)
    ).all()
    return [{"id": p.id, "name": p.name, "stock": p.stock_quantity, "category": p.category} for p in products]

@router.get("/client-history/{client_id}")
def get_client_history(
    client_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns all sales for a specific client."""
    client = session.get(Client, client_id)
    if not client:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Client not found")

    sales = session.exec(select(Sale).where(Sale.client_id == client_id).order_by(Sale.date.desc())).all()
    result = []
    for sale in sales:
        items = []
        for item in sale.items:
            product = session.get(Product, item.product_id)
            items.append({
                "product_name": product.name if product else "Removido",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
            })
        result.append({
            "id": sale.id,
            "date": sale.date,
            "total_amount": sale.total_amount,
            "payment_method": sale.payment_method,
            "status": sale.status,
            "items": items,
        })

    total_spent = sum(s.total_amount for s in sales)
    return {
        "client": {"id": client.id, "name": client.name, "email": client.email, "phone": client.phone},
        "sales": result,
        "total_spent": round(total_spent, 2),
        "total_purchases": len(sales),
    }

def _month_label(ym: str) -> str:
    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
              "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    try:
        year, month = ym.split("-")
        return f"{months[int(month)-1]}/{year[2:]}"
    except Exception:
        return ym
