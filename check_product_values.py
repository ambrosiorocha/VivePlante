import sqlite3
import os

db_path = "database.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, name, is_active FROM product")
rows = cursor.fetchall()
print("Products:", rows)

conn.close()
