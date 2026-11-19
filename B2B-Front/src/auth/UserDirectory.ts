import type { UserDirectory } from "./types.ts";
import { algoliaUserDirectory } from "./AlgoliaUserDirectory";

export type {
    AppUser,
    Role,
    BranchId,
    Company,
    LookupResult,
    LookupFailure,
    UserDirectory,
} from "./types.ts";

export const userDirectory: UserDirectory = algoliaUserDirectory;
