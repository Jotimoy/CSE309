import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loginUser, registerUser, setAuthToken } from '../services/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'cse309-auth';

function getStoredState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }

    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, user: null };
  }
}

function persistState(state: AuthState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getStoredState);

  useEffect(() => {
    if (authState.token && authState.user) {
      persistState(authState);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  // keep API client in sync with stored token
  useEffect(() => {
    setAuthToken(authState.token);
  }, [authState.token]);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      login: async (credentials: LoginCredentials) => {
        const response = await loginUser(credentials);
        setAuthState({ token: response.token, user: response.user });
        setAuthToken(response.token);
      },
      register: async (credentials: RegisterCredentials) => {
        const response = await registerUser(credentials);
        setAuthState({ token: response.token, user: response.user });
        setAuthToken(response.token);
      },
      logout: () => {
        setAuthState({ token: null, user: null });
        setAuthToken(null);
      }
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
