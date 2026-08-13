import time
import httpx

base='http://127.0.0.1:8001'
client=httpx.Client(trust_env=False)

# Ensure server ready
for _ in range(10):
    try:
        r = client.get(base + '/health')
        if r.status_code == 200:
            break
    except Exception:
        time.sleep(0.2)

print('Creating demo user...')
r = client.post(base + '/auth/register', json={'name':'Demo User','email':'demo@example.com','password':'demo'})
print(r.status_code, r.text)
print('Logging in...')
r = client.post(base + '/auth/login', json={'email':'demo@example.com','password':'demo'})
print(r.status_code, r.text)
if r.status_code != 200:
    raise SystemExit(1)
token = r.json().get('token')
headers = {'Authorization': f'Bearer {token}'}

# Create locations
locations = [
    {'name':'Main Warehouse','type':'warehouse'},
    {'name':'Transit Center','type':'transit'},
]
created_locs = []
for loc in locations:
    r = client.post(base + '/inventory/locations', json=loc, headers=headers)
    print('Create location:', r.status_code, r.text)
    created_locs.append(r.json())

# Create items
items = [
    {'sku':'SKU-1001','name':'Widget A','description':'Small widget','unit':'pcs'},
    {'sku':'SKU-2002','name':'Gadget B','description':'Large gadget','unit':'pcs'},
]
created_items = []
for it in items:
    r = client.post(base + '/inventory/items', json=it, headers=headers)
    print('Create item:', r.status_code, r.text)
    created_items.append(r.json())

# Set stock: give Widget A low stock to trigger alerts and Gadget B healthy stock
loc_id = created_locs[0]['id']
item_a = created_items[0]['id']
item_b = created_items[1]['id']

r = client.post(base + '/inventory/stock/set', json={'item_id': item_a, 'to_location': loc_id, 'quantity': 2}, headers=headers)
print('Set low stock for Widget A:', r.status_code, r.text)

r = client.post(base + '/inventory/stock/set', json={'item_id': item_b, 'to_location': loc_id, 'quantity': 50}, headers=headers)
print('Set stock for Gadget B:', r.status_code, r.text)

# Create a movement
r = client.post(base + '/inventory/movements', json={'item_id': item_b, 'to_location': loc_id, 'quantity': 10, 'reason':'Initial load'}, headers=headers)
print('Create movement:', r.status_code, r.text)

# List summary and alerts
r = client.get(base + '/inventory/summary?threshold=10', headers=headers)
print('Summary:', r.status_code, r.text)

r = client.get(base + '/inventory/alerts', headers=headers)
print('Alerts:', r.status_code, r.text)

print('Demo seed complete.')
