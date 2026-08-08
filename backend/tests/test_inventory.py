import os
import importlib
import sqlite3

import app.services.database as database


def _init_db(tmp_path):
    db_path = tmp_path / "test.db"
    os.environ['DB_PATH'] = str(db_path)
    # reload database module so it picks up DB_PATH
    importlib.reload(database)
    database.initialize_database()
    return db_path


def test_initialize_db_creates_tables(tmp_path):
    db_path = _init_db(tmp_path)
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    names = [r[0] for r in cur.fetchall()]
    conn.close()

    assert 'users' in names
    assert 'items' in names
    assert 'stock' in names
    assert 'alerts' in names


def test_scan_low_stock_creates_alert(tmp_path):
    db_path = _init_db(tmp_path)

    import app.services.inventory_service as inventory
    importlib.reload(inventory)

    # create sample data
    loc = inventory.create_location('T-Loc', 'shelf')
    item = inventory.create_item('TSKU-1', 'Test Item', 'desc', 'pcs')

    # set low stock
    inventory.set_stock(item['id'], loc['id'], 2)

    created = inventory.scan_low_stock(threshold=10)
    assert len(created) >= 1

    alerts = inventory.list_alerts()
    assert any(a['item_id'] == item['id'] for a in alerts)
