import { BuildingOffice2Icon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/solid";
import { roleBadgeClass, roleBadgeText } from "../auth/roleStyles";
import type { Role } from "../auth/types";

const ICONS = { B2C: UserIcon, B2B: BuildingOffice2Icon, ADMIN: ShieldCheckIcon } as const;


export default function RoleBadge({
  role,
  size = "sm",
  className = "",
}: {
  role: Role;
  size?: "xs" | "sm";
  className?: string;
}) {
  const Icon = ICONS[role];
  const sizing = size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ${sizing} ${roleBadgeClass[role]} ${className}`}
    >
      <Icon className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {roleBadgeText[role]}
    </span>
  );
}