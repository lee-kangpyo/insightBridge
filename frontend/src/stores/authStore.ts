import { create } from 'zustand';
import api from '../services/api';

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

export type MenuItem = {
  menu_id: number;
  menu_nm: string;
  children: MenuItem[];
  [key: string]: unknown;
};

export type AuthUser = {
  email?: string;
  univ_nm?: string;
  institution_chips?: unknown;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  userMenus: MenuItem[];
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserMenus: (menus: MenuItem[]) => void;
  hydrateFromStorage: () => void;
};

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredAuth(token: string, user: AuthUser) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

const initialToken = readStoredToken();
const initialUser = readStoredUser();

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: initialUser,
  token: initialToken,
  userMenus: [],

  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, univ_nm, institution_chips } = res.data ?? {};

    if (!access_token || typeof access_token !== 'string') {
      throw new Error('Login failed: missing access_token');
    }

    const user: AuthUser = { email, univ_nm, institution_chips };
    writeStoredAuth(access_token, user);

    set({
      token: access_token,
      user,
    });
  },

  logout() {
    clearStoredAuth();
    set({
      token: null,
      user: null,
      userMenus: [],
    });
  },

  setUserMenus(menus) {
    set({ userMenus: menus ?? [] });
  },

  hydrateFromStorage() {
    const token = readStoredToken();
    const user = readStoredUser();

    if (!token || !user) {
      clearStoredAuth();
      set({ token: null, user: null, userMenus: [] });
      return;
    }

    const { token: currentToken, user: currentUser } = get();
    if (currentToken === token && currentUser === user) return;
    set({ token, user });
  },
}));

export { shallow } from 'zustand/shallow';

