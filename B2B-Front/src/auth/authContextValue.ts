import { createContext } from "react";
import type { AppUser, LoginResult, LookupFailure, Role } from "./types";

export interface AuthContextValue {
  user: AppUser | null;
  role: Role | null;
  sessionId: string | null;
  status: "loading" | "ready";
  isAuthenticated: boolean;
  login: (loginInput: string) => Promise<LoginResult>;
  logout: () => void;
  /** Motivo por el que se cerro la sesion al revalidarla (inactivo, rol invalido...). */
  sessionNotice: LookupFailure | null;
  dismissSessionNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);