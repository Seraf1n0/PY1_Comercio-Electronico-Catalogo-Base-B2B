// Aqui vamos a leer desde el json de usuarios para efectos del lab 5

import userSeed from "../../data/users.json"
import type { AppUser, RawUser, UserDirectory } from "./types.ts";
import { normalizeLogin, parseUserRecord } from "./UserRecord.ts";

// Lista de usuarios en crudo desde el sjon
const records = userSeed as unknown as RawUser[];

const byId = new Map<string, RawUser>();
const byLogin = new Map<string, RawUser>();
// Mapeo rapido de usuarios por id y por login (username o email)
for (const record of records) {
    byId.set(record.objectID, record);
    byLogin.set(normalizeLogin(record.username), record);
    byLogin.set(normalizeLogin(record.email), record);
}

export const localUserDirectory: UserDirectory = {
    async findByLogin(login) {
        const key = normalizeLogin(login);
        // el record va a ser el login asociado a la key, sino undefined
        const raw = key ? byLogin.get(key) : undefined;
        if (!raw) return { ok: false, reason: "NOT_FOUND" };
        return parseUserRecord(raw);
    },
    async findById(userId) {
        const raw = byId.get(userId);
        if (!raw) return null;
        const result = parseUserRecord(raw);
        return result.ok ? result.user : null;
    },

    async list() {
        // Los registros invalidos (inactivos o sin rol) se omiten:
        // solo se listan usuarios que realmente pueden iniciar sesion.
        return records.flatMap((raw): AppUser[] => {
            const result = parseUserRecord(raw);
            return result.ok ? [result.user] : [];
        });
    },
}

