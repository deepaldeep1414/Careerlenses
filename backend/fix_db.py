"""
fix_db.py  --  One-time migration to fix the stale 'users' table.
Handles SQLite limitations (no non-constant defaults in ADD COLUMN).
Run: python fix_db.py
"""
import sqlite3

DB_PATH = "careerlens.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(users)")
rows = cur.fetchall()
existing = {row[1] for row in rows}
print("Existing columns:", existing)

# Step 1: rename hashed_password -> password_hash
if "hashed_password" in existing and "password_hash" not in existing:
    print("Renaming hashed_password -> password_hash ...")
    cur.execute("ALTER TABLE users RENAME COLUMN hashed_password TO password_hash")
    existing.discard("hashed_password")
    existing.add("password_hash")

# Step 2: add missing columns (SQLite only allows constant defaults)
if "name" not in existing:
    print("Adding column: name")
    cur.execute("ALTER TABLE users ADD COLUMN name VARCHAR NOT NULL DEFAULT ''")

if "role" not in existing:
    print("Adding column: role")
    cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user'")

if "created_at" not in existing:
    print("Adding column: created_at")
    cur.execute("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT '2024-01-01 00:00:00'")

conn.commit()

# Verify
cur.execute("PRAGMA table_info(users)")
print("\nUpdated schema:")
for row in cur.fetchall():
    print(" ", row)

conn.close()
print("\nMigration complete!")
