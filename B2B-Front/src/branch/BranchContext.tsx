import { useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { BranchContext } from './branchContextValue';
import type { BranchId } from '../auth/types';
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
