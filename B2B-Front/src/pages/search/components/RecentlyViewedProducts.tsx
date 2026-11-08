import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import {
  loadRecentlyViewedProducts,
  RECENT_PRODUCTS_UPDATED_EVENT,
  type ViewedProduct,
} from "../../../analytics/historyStore";

// Aqui es el limite de fotos por si en el futuro queremos aumentarlo
const DISPLAY_LIMIT = 8;

export default function RecentlyViewedProducts() {
  const { user } = useAuth();
  const userId = user?.objectID;
  const [products, setProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    if (!userId) {
      setProducts([]);
      return;
    }

    const refreshProducts = () => setProducts(loadRecentlyViewedProducts(userId));
    refreshProducts();

    const handleUpdate = (event: Event) => {
      const updatedUserId = (event as CustomEvent<{ userId: string }>).detail?.userId;
      if (updatedUserId === userId) {
        refreshProducts();
      }
    };

    window.addEventListener(RECENT_PRODUCTS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(RECENT_PRODUCTS_UPDATED_EVENT, handleUpdate);
  }, [userId]);

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-title">
      <div className="mb-4">
        <h2 id="recently-viewed-title" className="text-lg font-bold text-slate-800">
          Vistos recientemente
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Productos que abriste hace poco.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, DISPLAY_LIMIT).map((product) => (
          <li key={product.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <Link to={`/producto/${product.id}`} className="flex h-full flex-col gap-2">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
                {product.img ? (
                  <img
                    src={product.img}
                    alt={product.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Imagen no disponible
                  </div>
                )}
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {product.category || product.brand || "Producto"}
              </p>
              <h3 className="line-clamp-2 font-semibold text-slate-800 transition hover:text-indigo-600">
                {product.title}
              </h3>
              <p className="mt-auto font-bold text-blue-800">
                ₡{product.price.toLocaleString("es-CR")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
