import { Link } from "react-router-dom";
import type { Product } from "../../../Catalog/types";
import AddToCartButton from "../../../components/AddToCartButton";

export default function ProductHit({ hit }: { hit: Product }) {
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
          <p className="mt-auto font-bold text-blue-800">
            ₡{hit.price?.toLocaleString("es-CR") ?? "N/D"}
          </p>
        </article>
      </Link>

      <AddToCartButton product={hit} />
    </div>
  );
}