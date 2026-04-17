import { useAuthStore } from '../stores/authStore';

function extractToken(maybeToken) {
  if (typeof maybeToken === 'string') return maybeToken;
  if (maybeToken && typeof maybeToken === 'object') {
    if (typeof maybeToken.access_token === 'string') return maybeToken.access_token;
    if (typeof maybeToken.token === 'string') return maybeToken.token;
  }
  return '';
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const userMenus = useAuthStore((s) => s.userMenus);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setUserMenus = useAuthStore((s) => s.setUserMenus);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const loginWithTokenImpl = useAuthStore((s) => s.loginWithToken);

  const loginWithToken = (...args) => {
    if (args.length === 1) {
      loginWithTokenImpl(extractToken(args[0]));
      return;
    }
    const email = typeof args[0] === 'string' ? args[0].trim() : '';
    const tokenLike = extractToken(args[1]);
    loginWithTokenImpl(tokenLike);
    if (email.length > 0) {
      useAuthStore.setState((prev) => ({
        user: prev.user ? { ...prev.user, email } : { email },
      }));
      try {
        const raw = localStorage.getItem('auth_user');
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem('auth_user', JSON.stringify({ ...existing, email }));
      } catch {
        // ignore
      }
    }
  };

  return {
    user,
    token,
    login,
    logout,
    loginWithToken,
    userMenus,
    setMenus: setUserMenus,
    setUserMenus,
    hydrateFromStorage,
  };
}