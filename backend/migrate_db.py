"""
migrate_db.py  -  One-time migration to fix the stale 'users' table.

Run once:  python migrate_db.py

Handles:
  - Renaming hashed_password -> password_hash
  - Adding name, role, created_at columns
  - SQLite limitation: ADD COLUMN only supports constant defaults
"""
import sqlite3

DB_PATH = "careerlens.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# -- What columns exist right now? ---------------------------------------------
cur.execute("PRAGMA table_info(users)")
rows = cur.fetchall()
existing = {row[1] for row in rows}
print("Existing columns:", existing)

# -- Step 1: rename  hashed_password -> password_hash -------------------------
if "hashed_password" in existing and "password_hash" not in existing:
    print("Renaming hashed_password -> password_hash ...")
    cur.execute("ALTER TABLE users RENAME COLUMN hashed_password TO password_hash")
    existing.discard("hashed_password")
    existing.add("password_hash")

# -- Step 2: add any missing columns ------------------------------------------
# NOTE: SQLite only supports constant defaults in ADD COLUMN.
# CURRENT_TIMESTAMP / lambda functions are NOT allowed.
additions = [
    ("name",       "VARCHAR NOT NULL DEFAULT ''"),
    ("role",       "VARCHAR NOT NULL DEFAULT 'user'"),
    ("created_at", "DATETIME DEFAULT '2024-01-01 00:00:00'"),
]

for col, definition in additions:
    if col not in existing:
        print("Adding column:", col, "(", definition, ")")
        cur.execute("ALTER TABLE users ADD COLUMN " + col + " " + definition)

conn.commit()

# -- Verify -------------------------------------------------------------------
cur.execute("PRAGMA table_info(users)")
print("\nUpdated schema:")
for row in cur.fetchall():
    print(" ", row)

conn.close()
print("\nMigration complete!")
