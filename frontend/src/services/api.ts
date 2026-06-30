import type { TodoItem } from '../types';

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
