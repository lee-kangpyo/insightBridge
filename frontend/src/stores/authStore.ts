import { create } from 'zustand';
import api from '../services/api';

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

export type MenuItem = {
  menu_id: number;
  menu_nm: string;
  children?: MenuItem[];
  [key: string]: unknown;
};

export type AuthUser = {
  email?: string;
  univ_nm?: string;
  institution_chips?: unknown;
  roles?: string[];
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  userMenus: MenuItem[];
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
  setUserMenus: (menus: MenuItem[]) => void;
  hydrateFromStorage: () => void;
};

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!raw) return null;
    const token = raw.trim();
    return token.length > 0 ? token : null;
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
  try {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage write failures (quota/privacy mode)
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  } catch {
    // ignore storage failures
  }
}

const initialToken = readStoredToken();
const initialUser = readStoredUser();

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: initialUser,
  token: initialToken,
  userMenus: [],

  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, univ_nm, institution_chips, roles } = res.data ?? {};

    if (!access_token || typeof access_token !== 'string' || access_token.trim().length === 0) {
      throw new Error('Login failed: missing access_token');
    }

    const user: AuthUser = { email, univ_nm, institution_chips, roles };
    writeStoredAuth(access_token.trim(), user);

    set({
      token: access_token.trim(),
      user,
    });
  },

  loginWithToken(token) {
    const trimmed = typeof token === 'string' ? token.trim() : '';
    if (trimmed.length === 0) {
      throw new Error('loginWithToken failed: missing token');
    }

    const existingUser = readStoredUser();
    const user = existingUser ?? {};
    writeStoredAuth(trimmed, user);

    set({
      token: trimmed,
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
    if (currentToken === token) {
      try {
        if (JSON.stringify(currentUser) === JSON.stringify(user)) return;
      } catch {
        // ignore stringify issues and continue to set
      }
    }
    set({ token, user });
  },
}));

export { shallow } from 'zustand/shallow';

