from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_alerts_flow():
    # create location and item
    loc = client.post('/inventory/locations', json={'name': 'AL-LOC', 'type': 'shelf'}).json()
    item = client.post('/inventory/items', json={'sku': 'AL-1', 'name': 'AlertItem', 'description': '', 'unit': 'pcs'}).json()

    # set low stock
    client.post('/inventory/stock/set', json={'item_id': item['id'], 'to_location': loc['id'], 'quantity': 1})

    # scan is run in background thread; call scan explicitly via service by setting up a small endpoint not available here,
    # instead give it a moment and then check alerts listing
    res = client.get('/inventory/alerts')
    assert res.status_code == 200
    alerts = res.json()
    # there should be at least one alert for the created item
    assert any(a['item_id'] == item['id'] for a in alerts)

    # resolve the first alert
    alert_id = alerts[0]['id']
    r = client.post(f'/inventory/alerts/{alert_id}/resolve')
    assert r.status_code == 200
