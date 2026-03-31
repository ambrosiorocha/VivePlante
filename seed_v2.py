from sqlmodel import Session, select
from backend.database import engine, create_db_and_tables
from backend.models import Product

def seed_products():
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if products exist and clear them to update with new images if needed
        # For safety in this dev environment, we'll clear and re-seed to ensure images appear
        existing = session.exec(select(Product)).all()
        if existing:
            print("Cleaning existing products to update data...")
            for p in existing:
                session.delete(p)
            session.commit()

        products = [
            Product(
                name="Bonsai Ficus",
                category="Bonsais",
                price=150.00,
                description="Bonsai de Ficus retusa, 5 anos, vaso de cerâmica. Ideal para interiores bem iluminados.",
                stock_quantity=5,
                image_url="https://placehold.co/600x400/228b22/ffffff?text=Bonsai+Ficus" 
            ),
            Product(
                name="Jabuticabeira Híbrida",
                category="Mudas Frutíferas",
                price=85.00,
                description="Muda de Jabuticabeira produzindo, 1.5m. Frutos doces e precoces.",
                stock_quantity=10,
                image_url="https://placehold.co/600x400/228b22/ffffff?text=Jabuticabeira"
            ),
            Product(
                name="Orquídea Phalaenopsis",
                category="Plantas Ornamentais",
                price=45.90,
                description="Orquídea branca clássica em vaso decorativo. Floresce por longos períodos.",
                stock_quantity=20,
                image_url="https://placehold.co/600x400/228b22/ffffff?text=Orquidea"
            ),
            Product(
                name="Terra Vegetal Adubada 20kg",
                category="Substratos",
                price=25.00,
                description="Composto orgânico rico em nutrientes, pronto para plantio de jardim e horta.",
                stock_quantity=50,
                image_url="https://placehold.co/600x400/8b4513/ffffff?text=Terra+Adubada"
            ),
             Product(
                name="Samambaia Americana",
                category="Plantas Ornamentais",
                price=35.00,
                description="Samambaia volumosa, ideal para pendurar em varandas e áreas sombreadas.",
                stock_quantity=15,
                image_url="https://placehold.co/600x400/228b22/ffffff?text=Samambaia"
            ),
        ]

        for p in products:
            session.add(p)
        
        session.commit()
        print("Database seeded (updated) successfully with 5 initial products!")

if __name__ == "__main__":
    seed_products()
