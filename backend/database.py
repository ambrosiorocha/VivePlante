from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os

# Compute the absolute path to the database.db file, assumed to be in the project root
# BASE_DIR is the directory where THIS file (database.py) resides: .../backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# PROJ_ROOT is the parent of backend: .../Vive_plante
PROJ_ROOT = os.path.dirname(BASE_DIR)

sqlite_file_name = os.path.join(PROJ_ROOT, "database.db")
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def run_migrations():
    """Add new columns to existing tables without dropping data."""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Migrate 'client' table
            result = conn.execute(text("PRAGMA table_info(client)"))
            client_cols = [row[1] for row in result.fetchall()]
            if "address" not in client_cols:
                conn.execute(text("ALTER TABLE client ADD COLUMN address TEXT"))

            # Migrate 'sale' table
            result = conn.execute(text("PRAGMA table_info(sale)"))
            sale_cols = [row[1] for row in result.fetchall()]
            sale_new_cols = [
                ("discount_percent", "REAL DEFAULT 0.0"),
                ("payment_method", "TEXT DEFAULT 'Dinheiro'"),
                ("status", "TEXT DEFAULT 'Concluida'"),
                ("delivery_date", "TEXT"),
                ("notes", "TEXT"),
            ]
            for col_name, col_def in sale_new_cols:
                if col_name not in sale_cols:
                    conn.execute(text(f"ALTER TABLE sale ADD COLUMN {col_name} {col_def}"))

            # Create companysettings table if not exists
            conn.execute(text("""CREATE TABLE IF NOT EXISTS companysettings (
                id INTEGER PRIMARY KEY,
                name TEXT DEFAULT 'Viveiro de Mudas',
                whatsapp TEXT DEFAULT '5511999999999',
                whatsapp_display TEXT DEFAULT '(11) 99999-9999',
                email TEXT DEFAULT 'contato@viveirodemudas.com.br',
                address TEXT DEFAULT 'Rua das Flores, 123',
                instagram TEXT,
                facebook TEXT,
                opening_hours TEXT DEFAULT 'Seg-Sab: 8h as 18h',
                logo_url TEXT,
                cnpj TEXT
            )"""))
            # Create user table for JWT authentication (added after initial DB creation)
            conn.execute(text("""CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT,
                full_name TEXT,
                is_active INTEGER DEFAULT 1,
                hashed_password TEXT NOT NULL
            )"""))

            conn.commit()

            # Create quote tables if not exists (SQLModel create_all handles this mostly, but good to be safe/explicit if manual)
            # Actually SQLModel.metadata.create_all(engine) is called below, which will create NEW tables.
            # We only need manual migrations for altering EXISTING tables.
            # So for completely new tables like Quote/QuoteItem, create_all() is enough.
            
    except Exception as e:
        print(f"[Migration Warning] {e}")

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    run_migrations()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
