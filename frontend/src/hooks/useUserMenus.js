import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getUserMenus } from "../services/api";

export function useUserMenus() {
  const user = useAuthStore((s) => s.user);
  const setUserMenus = useAuthStore((s) => s.setUserMenus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserMenus();
        if (cancelled) return;
        if (Array.isArray(data?.menu_tree)) {
          setUserMenus(data.menu_tree);
        } else {
          setUserMenus([]);
        }
      } catch {
        if (!cancelled) {
          setUserMenus([]);
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
  }, [user, setUserMenus]);

  return { loading };
}