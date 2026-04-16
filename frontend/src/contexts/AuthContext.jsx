import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  // token state is now just a boolean or the token itself if we still want to keep it in memory
  // but we won't read it from localStorage
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        // If /me succeeds, we are logged in via cookie
        // The backend /me returns current_user info
        if (res.data) {
          const storedUser = localStorage.getItem("auth_user");
          const userData = storedUser ? JSON.parse(storedUser) : { email: res.data.user_cd };
          setUser({
            ...userData,
            univ_nm: res.data.univ_nm,
          });
          setToken(true); // just to indicate we have auth
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { access_token, univ_nm, institution_chips } = res.data;

    // We no longer store access_token in localStorage
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email, univ_nm, institution_chips }),
    );

    setToken(access_token);
    setUser({ email, univ_nm, institution_chips });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed on server", err);
    } finally {
      localStorage.removeItem("auth_user");
      setToken(null);
      setUser(null);
    }
  }, []);

  const loginWithToken = useCallback((email, tokenData) => {
    const { access_token, univ_nm, institution_chips } = tokenData;

    // In a real cookie-based flow, loginWithToken might be less common 
    // or should also result in a cookie being set (usually handled by the initial response).
    // If it's used after registration, we keep it for now but remove localStorage.
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email, univ_nm, institution_chips }),
    );

    setToken(access_token);
    setUser({ email, univ_nm, institution_chips });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
