import { searchClient } from "../lib/algolia";
import { parseUserRecord, normalizeLogin } from "./UserRecord";
import type { AppUser, LookupResult, RawUser, UserDirectory } from "./types";

const USERS_INDEX: string = import.meta.env.VITE_ALGOLIA_USERS_INDEX_NAME || "users";
const PAGE_SIZE = 20;

interface UserSearchResponse {
  hits: RawUser[];
}

async function loadUsers(): Promise<RawUser[]> {
  const response = await searchClient.search([
    {
      indexName: USERS_INDEX,
      params: { query: "", hitsPerPage: PAGE_SIZE },
    },
  ]);

  return (response.results[0] as UserSearchResponse).hits;
}

export const algoliaUserDirectory: UserDirectory = {
  async findByLogin(login): Promise<LookupResult> {
    const key = normalizeLogin(login);
    if (!key) return { ok: false, reason: "NOT_FOUND" };

    const raw = (await loadUsers()).find(
      (user) =>
        normalizeLogin(user.username ?? "") === key ||
        normalizeLogin(user.email ?? "") === key,
    );

    return raw ? parseUserRecord(raw) : { ok: false, reason: "NOT_FOUND" };
  },

  async findById(id): Promise<AppUser | null> {
    const raw = (await loadUsers()).find((user) => user.objectID === id);
    if (!raw) return null;

    const result = parseUserRecord(raw);
    return result.ok ? result.user : null;
  },

  async list(): Promise<AppUser[]> {
    return (await loadUsers()).flatMap((raw): AppUser[] => {
      const result = parseUserRecord(raw);
      return result.ok ? [result.user] : [];
    });
  },
};
