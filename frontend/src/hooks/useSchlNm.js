import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

export function useSchlNm() {
  const { user } = useAuth();
  return useMemo(() => (user?.univ_nm ?? "").trim(), [user?.univ_nm]);
}

