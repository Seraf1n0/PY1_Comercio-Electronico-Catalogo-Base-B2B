import { Link } from "react-router-dom";
import type { Product } from "../../../Catalog/types";
import AddToCartButton from "../../../components/AddToCartButton";
import { selectPrice } from "../../../Catalog/pricing/selectPrice";
import { useAuth } from "../../../auth/useAuth";
import { useBranch } from "../../../branch/BranchContext";
import { getBranchInfo } from "../../../branch/branches";

export default function ProductHit({ hit }: { hit: Product }) {
  const { role } = useAuth();
  const price = role ? selectPrice(hit, role) : hit.price;
  const isB2B = role === "B2B";
  const { selectedBranch } = useBranch();
  const branchInfo = selectedBranch ? getBranchInfo(selectedBranch) : null;
  const branchStock = branchInfo ? hit.stock?.[branchInfo.stockKey] ?? 0 : null;


  return (
    <div className="flex h-full flex-col gap-3">
      <Link to={`/producto/${hit.objectID}`} className="flex flex-1 flex-col">
        <article className="flex flex-1 flex-col gap-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
            <img
              src={hit.images_urls?.[0]}
              alt={hit.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            {hit.categories?.[0] ?? "Sin categoría"}
          </p>
          <h2 className="line-clamp-2 font-semibold text-slate-800">
            {hit.title ?? "Sin título"}
          </h2>
          <div className="mt-auto">
            <p className="font-bold text-blue-800">
              {isB2B ? "Precio mayorista: " : "Precio: "}
              ₡{price?.toLocaleString("es-CR") ?? "N/D"}
            </p>
            {isB2B && hit.prices && (
              <p className="text-xs font-normal text-slate-500">
                Precio regular: ₡{hit.prices.B2C.toLocaleString("es-CR")}
              </p>
            )}
          </div>
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
