import { useContext } from "react";
import { BranchContext } from "./branchContextValue";

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error("useBranch debe usarse dentro de BranchProvider");
  }

  return context;
}
