import type { Product } from "../../Catalog/types";
import ImageGallery from "./components/ImageGallery";
import SpecsTable from "./components/SpecsTable";
import StockByLocation from "./components/StockByLocation";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import ProductNavbar from "./components/ProductNavbar";


interface ProductDetailProps {
    product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const totalStock = Object.values(product.stock).reduce((sum, cantidad) => sum + cantidad, 0);
    return (
    <div>

    <ProductNavbar title={product.title} totalStock={totalStock} />

        <div className="max-w-4xl mx-auto px-4">

            <div className="flex gap-6 mt-6">
                {/* Galería */}
                <div className="flex-1">
                    <ImageGallery images={product.images_urls} />
                </div>

                {/* Panel lateral */}
                <div className="bg-white shadow-lg rounded p-4 w-64 h-fit">
                    <p className="text-lg font-bold">
                        Precio total: ${product.price.toLocaleString("en-US")} {product.currency}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Impuestos: Ya incluidos</p>

                    <button className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded w-full cursor-pointer">
                        <ShoppingCartIcon className="h-5 w-5 " />
                        Agregar al carrito
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-200 p-4 rounded mt-6">
                <p className="col-span-2 font-bold">Información básica</p>
                <p>
                    <span className="font-semibold">Modelo:</span> {product.model}
                </p>
                <p>
                    <span className="font-semibold">Año:</span> {product.year}
                </p>
                <p>
                    <span className="font-semibold">Motor:</span> {product.engine}
                </p>
                <p>
                    <span className="font-semibold">Tipo de combustible:</span> {product.fuel_type}
                </p>
                <p>
                    <span className="font-semibold">Color:</span> {product.color}
                </p>
                <p>
                    <span className="font-semibold">Transmisión:</span> {product.transmission}
                </p>
                <p>
                    <span className="font-semibold">Descripción vehicular:</span> {product.description}
                </p>
            </div>

            <div className="mt-6">
                <SpecsTable product={product} />
            </div>

            <div>
                <StockByLocation stock={product.stock} />
            </div>
        </div>
    </div>

    )
}