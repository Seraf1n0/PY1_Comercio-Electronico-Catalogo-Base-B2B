import { Link } from "react-router-dom";
import type { Product } from "../../../Catalog/types";
import AddToCartButton from "../../../components/AddToCartButton";
import PriceTag from "../../../components/PriceTag";
import { useBranch } from "../../../branch/useBranch";
import { getBranchInfo } from "../../../branch/branches";
import { getBranchStock } from "../../../inventory/inventoryOverrides";
import { getProductTitle } from "../../../Catalog/productTitle";

export default function ProductHit({ hit }: { hit: Product }) {
  const { selectedBranch } = useBranch();
  const branchInfo = selectedBranch ? getBranchInfo(selectedBranch) : null;
  const branchStock = branchInfo ? getBranchStock(hit, branchInfo.id) : null;


  return (
    <div className="flex h-full flex-col gap-3">
      <Link to={`/producto/${hit.objectID}`} className="flex flex-1 flex-col">
        <article className="flex flex-1 flex-col gap-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
            <img
              src={hit.images_urls?.[0]}
                            alt={getProductTitle(hit)}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            {hit.categories?.[0] ?? "Sin categoría"}
          </p>
          <h2 className="line-clamp-2 font-semibold text-slate-800">
                                  {getProductTitle(hit)}
          </h2>
          <PriceTag item={hit} size="md" className="mt-auto" />
          {branchInfo && branchStock !== null && (
            <p className="text-xs text-slate-500">
              {branchStock > 0
                ? `Disponible en ${branchInfo.label}: ${branchStock} ${branchStock === 1 ? "unidad" : "unidades"}`
                : `Sin stock en ${branchInfo.label}`}
            </p>
          )}
        </article>
      </Link>

      <AddToCartButton product={hit} />
    </div>
  );
}