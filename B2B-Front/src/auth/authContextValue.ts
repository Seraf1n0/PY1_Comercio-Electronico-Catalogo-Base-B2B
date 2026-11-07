import { createContext } from "react";
import type { AppUser, LoginResult, Role } from "./types";

export interface AuthContextValue {
  user: AppUser | null;
  role: Role | null;
  sessionId: string | null;
  status: "loading" | "ready";
  isAuthenticated: boolean;
  login: (loginInput: string) => Promise<LoginResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
