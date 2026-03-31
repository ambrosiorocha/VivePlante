import sqlite3
import os

db_path = "database.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(product)")
columns = [row[1] for row in cursor.fetchall()]
print("Product columns:", columns)

cursor.execute("PRAGMA table_info(sale)")
columns = [row[1] for row in cursor.fetchall()]
print("Sale columns:", columns)

conn.close()
