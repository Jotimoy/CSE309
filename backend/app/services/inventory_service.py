import datetime
import os
from typing import Optional, List

from .database import get_connection
from .notification_service import send_webhook, send_email_stub


def create_location(name: str, loc_type: Optional[str] = None) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    created_at = datetime.datetime.utcnow().isoformat()
    try:
        cur.execute(
            'INSERT INTO locations (name, type, created_at) VALUES (?, ?, ?)',
            (name, loc_type, created_at),
        )
        conn.commit()
        loc_id = cur.lastrowid
    finally:
        conn.close()

    return {'id': loc_id, 'name': name, 'type': loc_type, 'created_at': created_at}


def list_locations() -> List[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, name, type, created_at FROM locations ORDER BY name')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_item(sku: str, name: str, description: Optional[str], unit: Optional[str]) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    created_at = datetime.datetime.utcnow().isoformat()
    try:
        cur.execute(
            'INSERT INTO items (sku, name, description, unit, created_at) VALUES (?, ?, ?, ?, ?)',
            (sku, name, description, unit, created_at),
        )
        conn.commit()
        item_id = cur.lastrowid
    finally:
        conn.close()

    return {'id': item_id, 'sku': sku, 'name': name, 'description': description, 'unit': unit, 'created_at': created_at}


def get_item(item_id: int) -> Optional[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, sku, name, description, unit, created_at FROM items WHERE id = ?', (item_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def list_items() -> List[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, sku, name, description, unit, created_at FROM items ORDER BY name')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_item(item_id: int, name: Optional[str], description: Optional[str], unit: Optional[str]) -> Optional[dict]:
    conn = get_connection()
    cur = conn.cursor()
    existing = get_item(item_id)
    if not existing:
        conn.close()
        return None

    new_name = name if name is not None else existing['name']
    new_description = description if description is not None else existing['description']
    new_unit = unit if unit is not None else existing['unit']

    cur.execute(
        'UPDATE items SET name = ?, description = ?, unit = ? WHERE id = ?',
        (new_name, new_description, new_unit, item_id),
    )
    conn.commit()
    conn.close()
    return get_item(item_id)


def delete_item(item_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM items WHERE id = ?', (item_id,))
    changed = cur.rowcount
    conn.commit()
    conn.close()
    return changed > 0


def get_stock(item_id: int, location_id: int) -> Optional[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, item_id, location_id, quantity, updated_at FROM stock WHERE item_id = ? AND location_id = ?', (item_id, location_id))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def set_stock(item_id: int, location_id: int, quantity: int) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.datetime.utcnow().isoformat()
    existing = get_stock(item_id, location_id)
    if existing:
        cur.execute('UPDATE stock SET quantity = ?, updated_at = ? WHERE id = ?', (quantity, now, existing['id']))
        stock_id = existing['id']
    else:
        # ensure referenced item and location exist
        cur.execute('SELECT id FROM items WHERE id = ?', (item_id,))
        if not cur.fetchone():
            conn.close()
            raise RuntimeError('Item not found')
        cur.execute('SELECT id FROM locations WHERE id = ?', (location_id,))
        if not cur.fetchone():
            conn.close()
            raise RuntimeError('Location not found')
        cur.execute('INSERT INTO stock (item_id, location_id, quantity, updated_at) VALUES (?, ?, ?, ?)', (item_id, location_id, quantity, now))
        stock_id = cur.lastrowid

    conn.commit()
    conn.close()
    # Trigger low-stock scan to create alerts immediately when stock changes
    try:
        scan_low_stock()
    except Exception:
        pass

    return {'id': stock_id, 'item_id': item_id, 'location_id': location_id, 'quantity': quantity, 'updated_at': now}


def adjust_stock(item_id: int, location_id: int, delta: int, reason: Optional[str] = None) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.datetime.utcnow().isoformat()
    existing = get_stock(item_id, location_id)
    if existing:
        new_qty = existing['quantity'] + delta
        if new_qty < 0:
            conn.close()
            raise RuntimeError('Insufficient stock')
        cur.execute('UPDATE stock SET quantity = ?, updated_at = ? WHERE id = ?', (new_qty, now, existing['id']))
        stock_id = existing['id']
    else:
        if delta < 0:
            conn.close()
            raise RuntimeError('Insufficient stock')
        # validate item and location
        cur.execute('SELECT id FROM items WHERE id = ?', (item_id,))
        if not cur.fetchone():
            conn.close()
            raise RuntimeError('Item not found')
        cur.execute('SELECT id FROM locations WHERE id = ?', (location_id,))
        if not cur.fetchone():
            conn.close()
            raise RuntimeError('Location not found')
        cur.execute('INSERT INTO stock (item_id, location_id, quantity, updated_at) VALUES (?, ?, ?, ?)', (item_id, location_id, delta, now))
        stock_id = cur.lastrowid

    # record movement
    cur.execute(
        'INSERT INTO stock_movements (item_id, from_location, to_location, quantity, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        (item_id, None, location_id, delta, reason, now),
    )

    conn.commit()
    conn.close()
    # Trigger low-stock scan to create alerts immediately when stock changes
    try:
        scan_low_stock()
    except Exception:
        pass

    return {'id': stock_id, 'item_id': item_id, 'location_id': location_id, 'quantity': get_stock(item_id, location_id)['quantity'], 'updated_at': now}


def list_stock_movements(limit: int = 100) -> List[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, item_id, from_location, to_location, quantity, reason, created_at FROM stock_movements ORDER BY created_at DESC LIMIT ?', (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_alert(item_id: int, location_id: Optional[int], type_: str, message: str) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.datetime.utcnow().isoformat()
    cur.execute(
        'INSERT INTO alerts (item_id, location_id, type, message, is_resolved, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        (item_id, location_id, type_, message, 0, now),
    )
    conn.commit()
    alert_id = cur.lastrowid
    conn.close()
    alert = {'id': alert_id, 'item_id': item_id, 'location_id': location_id, 'type': type_, 'message': message, 'is_resolved': 0, 'created_at': now}

    # Notifications (optional): webhook and email
    try:
        webhook_url = os.getenv('ALERT_WEBHOOK_URL')
        if webhook_url:
            payload = {
                'alert': alert,
            }
            send_webhook(webhook_url, payload)

        alert_email = os.getenv('ALERT_EMAIL')
        if alert_email:
            send_email_stub(alert_email, f"Alert: {type_}", message)
    except Exception:
        # never fail alert creation due to notifier errors
        pass

    return alert


def list_alerts() -> List[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, item_id, location_id, type, message, is_resolved, created_at FROM alerts ORDER BY created_at DESC')
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def resolve_alert(alert_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('UPDATE alerts SET is_resolved = 1 WHERE id = ?', (alert_id,))
    changed = cur.rowcount
    conn.commit()
    conn.close()
    return changed > 0


def scan_low_stock(threshold: int = 10) -> List[dict]:
    """Scan stock table for quantities below threshold and create alerts for them.

    Returns list of alerts created.
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, item_id, location_id, quantity FROM stock WHERE quantity < ?', (threshold,))
    rows = cur.fetchall()
    created_alerts = []
    for r in rows:
        rec = dict(r)
        item_id = rec['item_id']
        location_id = rec['location_id']
        quantity = rec['quantity']

        # Check existing unresolved low_stock alert for same item/location
        cur.execute(
            'SELECT id FROM alerts WHERE item_id = ? AND location_id = ? AND type = ? AND is_resolved = 0',
            (item_id, location_id, 'low_stock'),
        )
        existing = cur.fetchone()
        if existing:
            # return existing unresolved alert as part of results
            alert_id = existing['id']
            cur.execute('SELECT id, item_id, location_id, type, message, is_resolved, created_at FROM alerts WHERE id = ?', (alert_id,))
            found = cur.fetchone()
            if found:
                created_alerts.append(dict(found))
            continue

        message = f'Low stock: {quantity} remaining (threshold {threshold})'
        alert = create_alert(item_id, location_id, 'low_stock', message)
        created_alerts.append(alert)

    return created_alerts
