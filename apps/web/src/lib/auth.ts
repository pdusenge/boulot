'use client';

import { IUser } from '@boulot/types';
import { fetchApi } from './api';

const TOKEN_KEY = 'boulot_auth_token';
const USER_KEY = 'boulot_auth_user';

export const setAuth = (token: string, user: IUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getUser = (): IUser | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const isAuthenticated = (): boolean => !!getToken();

/**
 * Validates token with backend and updates user data
 */
export const checkAuth = async (): Promise<IUser | null> => {
  try {
    const user = await fetchApi<IUser>('/auth/me');
    if (user && getToken()) {
      setAuth(getToken()!, user);
      return user;
    }
    return null;
  } catch {
    clearAuth();
    return null;
  }
};
