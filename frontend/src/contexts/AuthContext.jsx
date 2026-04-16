import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

const INITIAL_MENUS = [
  {
    menu_id: 1,
    menu_nm: '종합현황',
    children: [],
  },
  {
    menu_id: 2,
    menu_nm: '입시/충원',
    children: [
      { menu_id: 21, menu_nm: '모집전형', children: [] },
      { menu_id: 22, menu_nm: '충원률현황', children: [] },
    ],
  },
  {
    menu_id: 3,
    menu_nm: '학생/진로',
    children: [
      { menu_id: 31, menu_nm: '학생현황', children: [] },
      { menu_id: 32, menu_nm: '진로구성', children: [] },
    ],
  },
  {
    menu_id: 4,
    menu_nm: '교육/교원',
    children: [],
  },
  {
    menu_id: 5,
    menu_nm: '연구/산학/창업',
    children: [],
  },
  {
    menu_id: 6,
    menu_nm: '재정/등록금/학생지원',
    children: [],
  },
  {
    menu_id: 7,
    menu_nm: '캠퍼스/복지/안전',
    children: [],
  },
  {
    menu_id: 8,
    menu_nm: '거버넌스',
    children: [],
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [userMenus, setUserMenus] = useState(INITIAL_MENUS);

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
    setUserMenus([]);
  }, []);

  const setMenus = useCallback((menus) => {
    setUserMenus(menus);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginWithToken, userMenus, setMenus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
