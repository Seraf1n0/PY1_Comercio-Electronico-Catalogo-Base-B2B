import { createContext } from "react";
import type { BranchId } from "../auth/types";

export interface BranchContextValue {
  selectedBranch: BranchId | null;
  setSelectedBranch: (branchId: BranchId | null) => void;
}

export const BranchContext = createContext<BranchContextValue | undefined>(undefined);
