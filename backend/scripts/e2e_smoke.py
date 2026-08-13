import time
import httpx

base='http://127.0.0.1:8001'
client=httpx.Client(trust_env=False)
# small wait to ensure server is ready
time.sleep(0.2)
print('--- REGISTER ---')
r=client.post(base+'/auth/register',json={'name':'E2E User','email':'e2e@example.com','password':'secret'})
print(r.status_code, r.text)
print('--- LOGIN ---')
r=client.post(base+'/auth/login',json={'email':'e2e@example.com','password':'secret'})
print(r.status_code, r.text)
if r.status_code!=200:
    raise SystemExit(2)
token=r.json().get('token')
headers={'Authorization':f'Bearer {token}'}
print('--- CREATE LOCATION ---')
r=client.post(base+'/inventory/locations',json={'name':'Main Warehouse','type':'warehouse'}, headers=headers)
print(r.status_code, r.text)
print('--- LIST LOCATIONS ---')
r=client.get(base+'/inventory/locations', headers=headers)
print(r.status_code, r.text)
