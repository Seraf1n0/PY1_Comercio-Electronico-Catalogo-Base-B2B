import { readJSON, removeJSON, writeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";

/**
 * Bitacora de operaciones administrativas simuladas. Deja registro de que
 * se modifico, el valor anterior, el nuevo y quien lo hizo
 */
export type AuditType = "INVENTORY" | "PRICE" | "CONDITION" | "RESET";

export type AuditEntry = {
  id: string;
  at: string;
  type: AuditType;
  adminId: string;
  adminName: string;
  /** Producto o regla afectada, legible para el usuario. */
  target: string;
  /** Que campo cambio: "Stock San José", "Precio B2B"... */
  field: string;
  before: string;
  after: string;
  reason?: string;
};

const MAX_ENTRIES = 100;

function isEntry(value: unknown): value is AuditEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.at === "string" &&
    typeof entry.type === "string" &&
    typeof entry.target === "string" &&
    typeof entry.field === "string"
  );
}

export function readAudit(): AuditEntry[] {
  const stored = readJSON<unknown>(storageKeys.adminAudit, []);
  return Array.isArray(stored) ? stored.filter(isEntry) : [];
}

export function appendAudit(entry: Omit<AuditEntry, "id" | "at">): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
  writeJSON(storageKeys.adminAudit, [full, ...readAudit()].slice(0, MAX_ENTRIES));
  return full;
}

export function clearAudit(): void {
  removeJSON(storageKeys.adminAudit);
}