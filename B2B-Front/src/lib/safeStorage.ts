import { parseStorageVersion } from "./storageKeys";

export type StorageArea = "local" | "session";

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

function getStorage(area: StorageArea): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return area === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    // El almacenamiento puede estar bloqueado por el navegador.
    return null;
  }
}

function isEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.version === "number" && "data" in candidate;
}

function resolveVersion(key: string, version?: number): number | null {
  return version ?? parseStorageVersion(key);
}

/**
 * Si la clave no existe, o cualquier otro problema relacionado con la clave se devuelve un fallback
 */
export function readJSON<T>(
  key: string,
  fallback: T,
  version?: number,
  area: StorageArea = "local",
): T {
  const storage = getStorage(area);
  if (!storage) {
    return fallback;
  }

  const expected = resolveVersion(key, version);
  if (expected === null) {
    console.warn(`[safeStorage] La clave "${key}" no incluye una version.`);
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isEnvelope(parsed) || parsed.version !== expected) {
      storage.removeItem(key);
      return fallback;
    }

    return parsed.data as T;
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      // Si tampoco se puede limpiar, se ignora
    }
    return fallback;
  }
}

/**
 * Se escribe un valor en el json con versionado evita bloqueos
 */
export function writeJSON<T>(
  key: string,
  value: T,
  version?: number,
  area: StorageArea = "local",
): boolean {
  const storage = getStorage(area);
  if (!storage) {
    return false;
  }

  const expected = resolveVersion(key, version);
  if (expected === null) {
    console.warn(`[safeStorage] La clave "${key}" no incluye una version.`);
    return false;
  }

  try {
    const payload: StorageEnvelope<T> = { version: expected, data: value };
    storage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn(`[safeStorage] No se pudo escribir la clave "${key}".`, error);
    return false;
  }
}

/** Elimina una clave sin propagar errores */
export function removeJSON(
  key: string,
  area: StorageArea = "local",
): void {
  const storage = getStorage(area);
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`[safeStorage] No se pudo eliminar la clave "${key}".`, error);
  }
}

/**
 * Lectura puntual de datos sin envoltura versionada
 */
export function readLegacyJSON<T>(
  key: string,
  fallback: T,
  area: StorageArea = "local",
): T {
  const storage = getStorage(area);
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readSessionJSON<T>(
  key: string,
  fallback: T,
  version?: number,
): T {
  return readJSON(key, fallback, version, "session");
}

export function writeSessionJSON<T>(
  key: string,
  value: T,
  version?: number,
): boolean {
  return writeJSON(key, value, version, "session");
}

export function removeSessionJSON(key: string): void {
  removeJSON(key, "session");
}
