
import sys
import os

# Add backend to sys.path to import database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlmodel import Session, select
from sqlalchemy import text

try:
    with Session(engine) as session:
        # Try a simple query
        result = session.exec(text("SELECT 1")).one()
        print(f"Connection successful! Result: {result}")
        
        # Check file path in engine
        print(f"Database URL: {engine.url}")
except Exception as e:
    print(f"Connection failed: {e}")
