"""Initialize the database and optionally seed sample inventory data.
Run: python backend/scripts/init_db.py
"""
from pathlib import Path
import datetime

from app.services.database import initialize_database, get_connection


def seed_sample_data():
    conn = get_connection()
    cur = conn.cursor()

    now = datetime.datetime.utcnow().isoformat()

    # Insert sample locations if not present
    locations = [
        ("Main Warehouse", "warehouse", now),
        ("Shelf A1", "shelf", now),
        ("Receiving Dock", "dock", now),
    ]

    for name, loc_type, created_at in locations:
        cur.execute("SELECT id FROM locations WHERE name = ?", (name,))
        if cur.fetchone() is None:
            cur.execute(
                "INSERT INTO locations (name, type, created_at) VALUES (?, ?, ?)",
                (name, loc_type, created_at),
            )

    # Insert sample items
    items = [
        ("SKU-001", "Widget A", "Small widget", "pcs", now),
        ("SKU-002", "Gadget B", "Blue gadget", "pcs", now),
    ]

    for sku, name, desc, unit, created_at in items:
        cur.execute("SELECT id FROM items WHERE sku = ?", (sku,))
        if cur.fetchone() is None:
            cur.execute(
                "INSERT INTO items (sku, name, description, unit, created_at) VALUES (?, ?, ?, ?, ?)",
                (sku, name, desc, unit, created_at),
            )

    # Ensure stock records exist
    cur.execute("SELECT id FROM items WHERE sku = ?", ("SKU-001",))
    item1 = cur.fetchone()
    cur.execute("SELECT id FROM locations WHERE name = ?", ("Main Warehouse",))
    loc_main = cur.fetchone()
    if item1 and loc_main:
        cur.execute(
            "SELECT id FROM stock WHERE item_id = ? AND location_id = ?",
            (item1[0], loc_main[0]),
        )
        if cur.fetchone() is None:
            cur.execute(
                "INSERT INTO stock (item_id, location_id, quantity, updated_at) VALUES (?, ?, ?, ?)",
                (item1[0], loc_main[0], 100, now),
            )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    initialize_database()
    seed_sample_data()
    print("Database initialized and sample data seeded.")
