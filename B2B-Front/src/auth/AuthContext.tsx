import { createContext, useContext, useState, type ReactNode} from "react";
import type { AppUser } from "./types";
import { userDirectory } from "./UserDirectory";
import { readSessionJSON, writeSessionJSON, removeSessionJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";



interface AuthContextVal {
    user: AppUser | null;
    login: (loginInput: string) => Promise<string | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextVal | null>(null);

export function AuthProvider({ children}: { children: ReactNode}) {
    const [user, setUser] = useState<AppUser | null>(() => readSessionJSON<AppUser | null>(storageKeys.session, null));

    async function login(loginInput: string): Promise<string | null> {
        const result = await userDirectory.findByLogin(loginInput);
        if (!result.ok) {
            return ("No se encontro un usuario valido");
        }

        writeSessionJSON(storageKeys.session, result.user);
        setUser(result.user);
        return null   
    }


    function logout() {
        removeSessionJSON(storageKeys.session);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
export function useAuth() {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("Se debe usarel useAuth si o si en el authProvider");
    }

    return context;
}

