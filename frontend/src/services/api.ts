import type { AuthResponse, LoginCredentials, RegisterCredentials, TodoItem } from '../types';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const fallbackTasks: TodoItem[] = [
  {
    id: '1',
    title: 'Set up project scaffold',
    done: true,
    createdAt: '2026-07-01'
  },
  {
    id: '2',
    title: 'Connect frontend to backend API',
    done: false,
    createdAt: '2026-07-01'
  }
];

export async function fetchTasks(): Promise<TodoItem[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/tasks`);

    if (!response.ok) {
      throw new Error('Unable to reach API');
    }

    return (await response.json()) as TodoItem[];
  } catch {
    return fallbackTasks;
  }
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
    throw new Error('Login failed');
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
    throw new Error('Registration failed');
  }

  return (await response.json()) as AuthResponse;
}
