from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health():
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json().get('status') == 'ok'


def test_inventory_flow():
    # create location
    loc_res = client.post('/inventory/locations', json={'name': 'T1', 'type': 'shelf'})
    assert loc_res.status_code == 201
    loc = loc_res.json()

    # create item
    item_res = client.post('/inventory/items', json={'sku': 'API-1', 'name': 'API Item', 'description': 'd', 'unit': 'pcs'})
    assert item_res.status_code == 201
    item = item_res.json()

    # set stock
    stock_res = client.post('/inventory/stock/set', json={'item_id': item['id'], 'to_location': loc['id'], 'quantity': 5})
    assert stock_res.status_code == 200
    stock = stock_res.json()
    assert stock['quantity'] == 5

    # adjust stock
    adj_res = client.post('/inventory/stock/adjust', json={'item_id': item['id'], 'to_location': loc['id'], 'quantity': -3, 'reason': 'test'})
    assert adj_res.status_code == 200
    assert adj_res.json()['quantity'] == 2
