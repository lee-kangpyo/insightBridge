import { useMemo } from "react";
import { useAuthStore } from '../stores/authStore';

export function useSchlNm() {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => (user?.univ_nm ?? "").trim(), [user?.univ_nm]);
}

