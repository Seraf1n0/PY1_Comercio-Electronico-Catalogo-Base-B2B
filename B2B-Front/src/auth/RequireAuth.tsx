import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "./useAuth";

export default function RequireAuth() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-indigo-600">
        <Spinner label="Cargando sesión…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
