import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function parseApiError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => null);
  const message = payload?.detail || payload?.message || response.statusText || 'API request failed';
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
