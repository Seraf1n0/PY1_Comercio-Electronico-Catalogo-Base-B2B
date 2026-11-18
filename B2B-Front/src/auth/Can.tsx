import type { ReactNode } from "react";
import { can, type Permission } from "./permissions";
import { useAuth } from "./useAuth";


export default function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useAuth();
  return <>{can(role, permission) ? children : fallback}</>;
}