from typing import List, Dict
from .inventory_service import list_items, list_stock_movements
from .database import get_connection


def list_low_stock(threshold: int = 10) -> List[Dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT s.item_id, s.location_id, s.quantity, i.sku, i.name
        FROM stock s
        JOIN items i ON i.id = s.item_id
        WHERE s.quantity < ?
        ORDER BY s.quantity ASC
    ''', (threshold,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def summary(threshold: int = 10) -> Dict:
    items = list_items()
    low_stock = list_low_stock(threshold)
    movements = list_stock_movements(limit=10)
    return {
        'total_items': len(items),
        'low_stock_count': len(low_stock),
        'low_stock': low_stock,
        'recent_movements': movements,
    }
