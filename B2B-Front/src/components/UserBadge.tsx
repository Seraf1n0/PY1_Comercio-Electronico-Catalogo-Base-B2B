import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { roleLabels } from "../auth/roleLabels";
import { useAuth } from "../auth/useAuth";

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

export default function UserBadge() {
  const { user, role, logout } = useAuth();

  if (!user || !role) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
        {getInitials(user.displayName)}
      </span>

      <div className="hidden min-w-0 text-left sm:block">
        <p className="truncate text-sm font-semibold text-slate-800">
          {user.displayName}
        </p>
        <p className="truncate text-xs text-slate-500">
          {roleLabels[role]}
          {user.company ? ` · ${user.company.name}` : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={logout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
