import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function PublicRoute({ children, redirectTo = "/" }) {
  const user = useAuthStore((s) => s.user);

  if (user) return <Navigate to={redirectTo} replace />;

  return children;
}
