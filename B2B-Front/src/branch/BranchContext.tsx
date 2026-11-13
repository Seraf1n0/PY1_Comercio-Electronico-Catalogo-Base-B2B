import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import type { BranchId } from '../auth/types';

interface BranchContextValue {
    selectedBranch: BranchId | null;
    setSelectedBranch: (branchId: BranchId | null) => void;
}


const BranchContext = createContext<BranchContextValue | undefined>(undefined);
function BranchState({children,initialBranch,}: {
  children: ReactNode;
  initialBranch: BranchId | null;
    }) 
{
  const [selectedBranch, setSelectedBranch] =
    useState<BranchId | null>(initialBranch);

  const value = useMemo(
    () => ({ selectedBranch, setSelectedBranch }),
    [selectedBranch],
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function BranchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <BranchState
      key={user?.objectID ?? "anonymous"}
      initialBranch={user?.defaultBranch ?? null}
    >
      {children}
    </BranchState>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error("useBranch debe usarse dentro de BranchProvider");
  }

  return context;
}