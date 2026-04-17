import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function RequireSysAdmRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user.roles || [];
  if (!roles.includes("SYS_ADM")) {
    return <Navigate to="/" replace />;
  }

  return children;
}
