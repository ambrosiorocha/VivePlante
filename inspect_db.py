import sqlite3
import os

db_path = "database.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    # try looking in parent
    db_path = "../database.db"

if os.path.exists(db_path):
    print(f"Checking database at: {os.path.abspath(db_path)}")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables:", [t[0] for t in tables])
        
        for table_name in tables:
            t = table_name[0]
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            count = cursor.fetchone()[0]
            print(f"Table {t}: {count} rows")
            
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {e}")
else:
    print("Could not find database file.")
