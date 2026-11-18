import { Outlet } from "react-router-dom";
import AccessDeniedPage from "../pages/error/AccessDeniedPage";
import { can, type Permission } from "./permissions";
import { useAuth } from "./useAuth";


export default function RequireRole({ permission }: { permission: Permission }) {
  const { role } = useAuth();

  if (!can(role, permission)) {
    return <AccessDeniedPage permission={permission} />;
  }

  return <Outlet />;
}