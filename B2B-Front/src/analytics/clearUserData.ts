import { removeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";

// Borra solo los datos de analytics del usuario indicado.
export function clearUserAnalytics(userId: string): void {
  removeJSON(storageKeys.events(userId));
  removeJSON(storageKeys.history(userId));
  removeJSON(storageKeys.metrics(userId));
}
