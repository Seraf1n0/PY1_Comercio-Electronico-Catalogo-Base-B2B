import type { ChangeEvent } from "react";
import type { BranchId } from "../auth/types";
import { useBranch } from "./BranchContext";
import { branches } from "./branches";

export default function BranchSelector() {
  const { selectedBranch, setSelectedBranch } = useBranch();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value as BranchId);
  };

  return (
    <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
      <span>Sucursal:</span>
      <select
        value={selectedBranch ?? ""}
        onChange={handleChange}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        {!selectedBranch && (
          <option value="" disabled>
            Selecciona una sucursal
          </option>
        )}
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.label}
          </option>
        ))}
      </select>
    </label>
  );
}
