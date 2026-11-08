// Ahorita consume indirectamente usando localuserdirecrty pero la idea es usar algolia luego
import type { UserDirectory } from "./types.ts";
import { localUserDirectory } from "./LocalUserDirectory.ts";

export type {
    AppUser,
    Role,
    BranchId,
    Company,
    LookupResult,
    LookupFailure,
    UserDirectory,
} from "./types.ts";

export const userDirectory: UserDirectory = localUserDirectory;