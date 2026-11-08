import {
  readSessionJSON,
  removeSessionJSON,
  writeSessionJSON,
} from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";
import type { Session } from "./types";

const SESSION_VERSION = 1;

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.userId === "string" &&
    session.userId.length > 0 &&
    typeof session.sessionId === "string" &&
    session.sessionId.length > 0 &&
    typeof session.loginAt === "string" &&
    !Number.isNaN(Date.parse(session.loginAt))
  );
}

/**
 * Lee la sesion de la pestaña actual. Si el contrato no se cumple,
 * la descarta para que el usuario vuelva a iniciar sesion.
 */
export function loadSession(): Session | null {
  const stored = readSessionJSON<unknown>(
    storageKeys.session,
    null,
    SESSION_VERSION,
  );

  if (isSession(stored)) {
    return stored;
  }

  if (stored !== null) {
    removeSessionJSON(storageKeys.session);
  }

  return null;
}

export function saveSession(session: Session): boolean {
  return writeSessionJSON(storageKeys.session, session, SESSION_VERSION);
}

export function clearSession(): void {
  removeSessionJSON(storageKeys.session);
}
