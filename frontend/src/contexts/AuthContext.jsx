import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));

  const login = useCallback(async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { access_token, univ_nm, institution_chips } = res.data;

    localStorage.setItem("auth_token", access_token);
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email, univ_nm, institution_chips }),
    );

    setToken(access_token);
    setUser({ email, univ_nm, institution_chips });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const loginWithToken = useCallback((email, tokenData) => {
    const { access_token, univ_nm, institution_chips } = tokenData;

    localStorage.setItem("auth_token", access_token);
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email, univ_nm, institution_chips }),
    );

    setToken(access_token);
    setUser({ email, univ_nm, institution_chips });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
