
import type { AppUser, BranchId, LookupResult, RawUser, Role } from "./types.ts";

const ROLES: readonly Role []= ["B2C", "B2B", "ADMIN"];
const BRANCHES: readonly BranchId []= ["san_jose", "guanacaste", "limon"];

// Estado de validación de rol para saber si esta dentro de los permitidos
export const isRole = (value: string | null | undefined): value is Role => (ROLES as readonly string[]).includes(value as string);

// Estado de validación de sucursal para saber si esta dentro de las permitidas
export const isBranch = (value: string | null | undefined): value is BranchId => !!value && (BRANCHES as readonly string[]).includes(value as string);

/**
 * minusculas y sin espacios tanto para lo almacenado como en app
 */
export const normalizeLogin = (value: string): string => value.trim().toLowerCase();

export function parseUserRecord(raw: RawUser): LookupResult {
    if (!raw.objectID || !raw.username || !raw.email || !raw.displayName) {
        return { ok: false, reason: "INVALID_RECORD" };
    }

    if (!raw.active) return { ok: false, reason: "INACTIVE" };
    if (!isRole(raw.role)) return { ok: false, reason: "INVALIDE_ROLE" };
    if (!isBranch(raw.defaultBranch)) return { ok: false, reason: "INVALID_RECORD" };
    if (raw.role === "B2B" && !raw.company?.name) return { ok: false, reason: "INVALID_RECORD" };

    const user: AppUser = {
        objectID: raw.objectID,
        username: raw.username,
        email: raw.email,
        displayName: raw.displayName,
        phone: raw.phone || "",
        role: raw.role,
        active: raw.active,
        defaultBranch: raw.defaultBranch,
        ...(raw.role === "B2B" ? { company: raw.company } : {})
    };
    return { ok: true, user };
}