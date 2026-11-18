import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { track } from "../analytics/tracker";
import { userDirectory } from "./UserDirectory";
import { AuthContext, type AuthContextValue } from "./authContextValue";
import { clearSession, loadSession, saveSession } from "./sessionStore";
import type { AppUser, LoginResult, LookupFailure, Session } from "./types";

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [sessionNotice, setSessionNotice] = useState<LookupFailure | null>(null);

  // Revalida la sesion contra el directorio: si el usuario ya no existe,
  // esta inactivo o tiene un rol invalido, la sesion se descarta.
  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      try {
        const current = loadSession();

        if (!current) {
          if (!cancelled) {
            setSession(null);
            setUser(null);
          }
          return;
        }

        // lookupById devuelve el motivo: si el usuario quedo inactivo o
        // con un rol invalido, se cierra la sesion y se informa en el login.
        const resolved = await userDirectory.lookupById(current.userId);
        if (cancelled) return;

        if (!resolved.ok) {
          clearSession();
          setSession(null);
          setUser(null);
          setSessionNotice(resolved.reason);
          return;
        }

        setSession(current);
        setUser(resolved.user);
      } catch {
        if (!cancelled) {
          clearSession();
          setSession(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setStatus("ready");
        }
      }
    }

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginInput: string): Promise<LoginResult> => {
    const result = await userDirectory.findByLogin(loginInput);

    if (!result.ok) {
      return { ok: false, reason: result.reason };
    }

    const nextSession: Session = {
      userId: result.user.objectID,
      sessionId: createSessionId(),
      loginAt: new Date().toISOString(),
    };

    saveSession(nextSession);
    setSessionNotice(null);
    setSession(nextSession);
    setUser(result.user);
    setStatus("ready");

    track(
      {
        userId: result.user.objectID,
        role: result.user.role,
        sessionId: nextSession.sessionId,
      },
      "LOGIN",
      { role: result.user.role, username: result.user.username },
    );

    return { ok: true, role: result.user.role };
  }, []);

  const logout = useCallback(() => {
    if (user && session) {
      track(
        { userId: user.objectID, role: user.role, sessionId: session.sessionId },
        "LOGOUT",
        { role: user.role },
      );
    }

    clearSession();
    setSession(null);
    setUser(null);
  }, [user, session]);

  const dismissSessionNotice = useCallback(() => setSessionNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      sessionId: session?.sessionId ?? null,
      status,
      isAuthenticated: Boolean(user),
      login,
      logout,
      sessionNotice,
      dismissSessionNotice,
    }),
    [user, session, status, login, logout, sessionNotice, dismissSessionNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}