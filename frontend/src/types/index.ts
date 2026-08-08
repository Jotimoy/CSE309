export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Inventory types
export interface Location {
  id: number;
  name: string;
  type?: string | null;
  created_at: string;
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  unit?: string | null;
  created_at: string;
}

export interface Stock {
  id: number;
  item_id: number;
  location_id: number;
  quantity: number;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  item_id: number;
  from_location?: number | null;
  to_location?: number | null;
  quantity: number;
  reason?: string | null;
  created_at: string;
}
