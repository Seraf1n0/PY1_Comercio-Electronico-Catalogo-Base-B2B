import { Link } from "react-router-dom";
import type { Product } from "../../../Catalog/types";
import AddToCartButton from "../../../components/AddToCartButton";

export default function ProductHit({ hit }: { hit: Product }) {
  return (
    <div>
      <Link to={`/producto/${hit.objectID}`}>
        <article>
          <img src={hit.images_urls?.[0]} alt={hit.title} />
          <p>{hit.categories?.[0] ?? "Sin categoría"}</p>
          <h1>{hit.title ?? "Sin título"}</h1>
          <p>₡{hit.price?.toLocaleString("es-CR") ?? "N/D"}</p>
        </article>
      </Link>
      <AddToCartButton product={hit} />
    </div>
  );
}