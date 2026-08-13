import type { AuthResponse, LoginCredentials, RegisterCredentials, Item, Location, Stock, StockMovement } from '../types';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function fetchWithAuth(path: string, opts: RequestInit = {}) {
  const headers = Object.assign({}, (opts.headers || {}) as Record<string, string>);
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const response = await fetch(`${apiBaseUrl}${path}`, { ...opts, headers });
  if (!response.ok) await parseApiError(response);
  return response;
}

function parseValidationErrors(payload: any): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  if (Array.isArray(payload)) {
    const details = payload.map((error) => {
      if (error?.loc && error?.msg) {
        const location = Array.isArray(error.loc) ? error.loc.join('.') : String(error.loc);
        return `${location}: ${error.msg}`;
      }
      if (typeof error === 'string') return error;
      return JSON.stringify(error);
    });
    return details.join(' | ');
  }

  if (typeof payload === 'object') {
    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    if (payload.errors) return parseValidationErrors(payload.errors);
    return JSON.stringify(payload);
  }

  return String(payload);
}

async function parseApiError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => null);
  const message = parseValidationErrors(payload) || response.statusText || 'API request failed';
  throw new Error(message);
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as AuthResponse;
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as AuthResponse;
}

// Inventory API
export async function listItems(): Promise<Item[]> {
  const res = await fetchWithAuth('/inventory/items');
  return (await res.json()) as Item[];
}

export async function createItem(payload: { sku: string; name: string; description?: string; unit?: string }): Promise<Item> {
  const res = await fetchWithAuth('/inventory/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as Item;
}

export async function listLocations(): Promise<Location[]> {
  const res = await fetchWithAuth('/inventory/locations');
  return (await res.json()) as Location[];
}

export async function createLocation(payload: { name: string; type?: string }): Promise<Location> {
  const res = await fetchWithAuth('/inventory/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as Location;
}

export async function getStock(itemId: number, locationId: number): Promise<Stock> {
  const res = await fetchWithAuth(`/inventory/stock/${itemId}/${locationId}`);
  return (await res.json()) as Stock;
}

export async function setStock(itemId: number, locationId: number, quantity: number): Promise<Stock> {
  const res = await fetchWithAuth('/inventory/stock/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId, to_location: locationId, quantity }),
  });
  return (await res.json()) as Stock;
}

export async function adjustStock(itemId: number, locationId: number, quantityDelta: number, reason?: string): Promise<Stock> {
  const res = await fetchWithAuth('/inventory/stock/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId, to_location: locationId, quantity: quantityDelta, reason }),
  });
  return (await res.json()) as Stock;
}

export async function listMovements(limit = 100): Promise<StockMovement[]> {
  const res = await fetchWithAuth(`/inventory/movements?limit=${limit}`);
  return (await res.json()) as StockMovement[];
}

export async function getSummary(threshold = 10): Promise<any> {
  const res = await fetchWithAuth(`/inventory/summary?threshold=${threshold}`);
  return await res.json();
}

export async function getItem(itemId: number): Promise<Item> {
  const res = await fetchWithAuth(`/inventory/items/${itemId}`);
  return (await res.json()) as Item;
}

export async function updateItem(itemId: number, payload: { name?: string; description?: string; unit?: string }): Promise<Item> {
  const res = await fetchWithAuth(`/inventory/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as Item;
}

export async function deleteItem(itemId: number): Promise<void> {
  const res = await fetchWithAuth(`/inventory/items/${itemId}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) await parseApiError(res);
}

export async function listAlerts(): Promise<{ id: number; item_id: number; location_id?: number | null; type: string; message: string; is_resolved: number; created_at: string }[]> {
  const res = await fetchWithAuth('/inventory/alerts');
  return (await res.json()) as any;
}

export async function resolveAlert(alertId: number): Promise<void> {
  const res = await fetchWithAuth(`/inventory/alerts/${alertId}/resolve`, { method: 'POST' });
  if (!res.ok) await parseApiError(res);
}
