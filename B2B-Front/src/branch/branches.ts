import type { BranchId } from "../auth/types";
import type { StockByHeadquarter } from "../Catalog/types";

export const branches: {
  id: BranchId;
  label: string;
  stockKey: keyof StockByHeadquarter;
}[] = [
  { id: "san_jose", label: "San José", stockKey: "headquarterSanJose" },
  { id: "guanacaste", label: "Guanacaste", stockKey: "headquarterGuanacaste" },
  { id: "limon", label: "Limón", stockKey: "headquarterLimon" },
];

export function getBranchInfo(branchId: BranchId) {
  return branches.find((branch) => branch.id === branchId)!;
}
