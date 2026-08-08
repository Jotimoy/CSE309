import type { AuthResponse, LoginCredentials, RegisterCredentials, Item, Location, Stock, StockMovement } from '../types';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
  const response = await fetch(`${apiBaseUrl}/inventory/items`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Item[];
}

export async function createItem(payload: { sku: string; name: string; description?: string; unit?: string }): Promise<Item> {
  const response = await fetch(`${apiBaseUrl}/inventory/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Item;
}

export async function listLocations(): Promise<Location[]> {
  const response = await fetch(`${apiBaseUrl}/inventory/locations`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Location[];
}

export async function createLocation(payload: { name: string; type?: string }): Promise<Location> {
  const response = await fetch(`${apiBaseUrl}/inventory/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Location;
}

export async function getStock(itemId: number, locationId: number): Promise<Stock> {
  const response = await fetch(`${apiBaseUrl}/inventory/stock/${itemId}/${locationId}`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Stock;
}

export async function setStock(itemId: number, locationId: number, quantity: number): Promise<Stock> {
  const response = await fetch(`${apiBaseUrl}/inventory/stock/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId, to_location: locationId, quantity }),
  });
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Stock;
}

export async function adjustStock(itemId: number, locationId: number, quantityDelta: number, reason?: string): Promise<Stock> {
  const response = await fetch(`${apiBaseUrl}/inventory/stock/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId, to_location: locationId, quantity: quantityDelta, reason }),
  });
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Stock;
}

export async function listMovements(limit = 100): Promise<StockMovement[]> {
  const response = await fetch(`${apiBaseUrl}/inventory/movements?limit=${limit}`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as StockMovement[];
}

export async function getSummary(threshold = 10): Promise<any> {
  const response = await fetch(`${apiBaseUrl}/inventory/summary?threshold=${threshold}`);
  if (!response.ok) await parseApiError(response);
  return await response.json();
}

export async function getItem(itemId: number): Promise<Item> {
  const response = await fetch(`${apiBaseUrl}/inventory/items/${itemId}`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Item;
}

export async function updateItem(itemId: number, payload: { name?: string; description?: string; unit?: string }): Promise<Item> {
  const response = await fetch(`${apiBaseUrl}/inventory/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as Item;
}

export async function deleteItem(itemId: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/inventory/items/${itemId}`, {
    method: 'DELETE',
  });
  if (response.status === 204) return;
  if (!response.ok) await parseApiError(response);
}

export async function listAlerts(): Promise<{ id: number; item_id: number; location_id?: number | null; type: string; message: string; is_resolved: number; created_at: string }[]> {
  const response = await fetch(`${apiBaseUrl}/inventory/alerts`);
  if (!response.ok) await parseApiError(response);
  return (await response.json()) as any;
}

export async function resolveAlert(alertId: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/inventory/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
  if (!response.ok) await parseApiError(response);
}
