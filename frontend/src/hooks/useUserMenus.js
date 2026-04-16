import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserMenus } from "../services/api";

export function useUserMenus() {
  const { user, setMenus } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserMenus();
        if (!cancelled && data.menu_tree) {
          setMenus(data.menu_tree);
        }
      } catch {
        if (!cancelled) {
          setMenus([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, setMenus]);

  return { loading };
}