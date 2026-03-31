from sqlmodel import Session, select
from backend.database import engine, create_db_and_tables
from backend.models import Product

def seed_products():
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if products exist
        existing = session.exec(select(Product)).first()
        if existing:
            print("Database already contains products.")
            return

        products = [
            Product(
                name="Bonsai Ficus",
                category="Bonsais",
                price=150.00,
                description="Bonsai de Ficus retusa, 5 anos, vaso de cerâmica. Ideal para interiores bem iluminados.",
                stock_quantity=5,
                image_url="https://images.unsplash.com/photo-1599598425947-d3527cb34d4f?q=80&w=2069&auto=format&fit=crop"
            ),
            Product(
                name="Jabuticabeira Híbrida",
                category="Mudas Frutíferas",
                price=85.00,
                description="Muda de Jabuticabeira produzindo, 1.5m. Frutos doces e precoces.",
                stock_quantity=10,
                image_url="https://images.unsplash.com/photo-1596436579603-d48e2259b34f?q=80&w=2070&auto=format&fit=crop"
            ),
            Product(
                name="Orquídea Phalaenopsis",
                category="Plantas Ornamentais",
                price=45.90,
                description="Orquídea branca clássica em vaso decorativo. Floresce por longos períodos.",
                stock_quantity=20,
                image_url="https://images.unsplash.com/photo-1566807810030-31a89c258d44?q=80&w=2070&auto=format&fit=crop"
            ),
            Product(
                name="Terra Vegetal Adubada 20kg",
                category="Substratos",
                price=25.00,
                description="Composto orgânico rico em nutrientes, pronto para plantio de jardim e horta.",
                stock_quantity=50,
                image_url="https://images.unsplash.com/photo-1615654030678-2989c62395d8?q=80&w=1974&auto=format&fit=crop"
            ),
             Product(
                name="Samambaia Americana",
                category="Plantas Ornamentais",
                price=35.00,
                description="Samambaia volumosa, ideal para pendurar em varandas e áreas sombreadas.",
                stock_quantity=15,
                image_url="https://images.unsplash.com/photo-1596066286705-eeb0d19bd76e?q=80&w=1964&auto=format&fit=crop"
            ),
        ]

        for p in products:
            session.add(p)
        
        session.commit()
        print("Database seeded successfully with 5 initial products!")

if __name__ == "__main__":
    seed_products()
