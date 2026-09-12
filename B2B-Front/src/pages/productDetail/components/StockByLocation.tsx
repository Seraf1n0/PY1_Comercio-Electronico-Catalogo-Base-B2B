import type { StockByHeadquarter } from "../../../Catalog/types"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

interface StockByLocationProps {
  stock: StockByHeadquarter;
}

export default function StockByLocation({ stock }: StockByLocationProps) {
  const sedes = [
    { label: "Limón", cantidad: stock.headquarterLimon },
    { label: "San José", cantidad: stock.headquarterSanJose },
    { label: "Guanacaste", cantidad: stock.headquarterGuanacaste },
  ];

  return (
    <div className="mt-4">
      <h2 className="font-medium mb-3">Disponibilidad por sede</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sedes.map((sede) => (
          <div
            key={sede.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm text-sm font-semibold mb-3 ${
              sede.cantidad > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {sede.cantidad > 0 ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XCircleIcon className="h-5 w-5" />
            )}
            <span>
              {sede.label}: {sede.cantidad > 0 ? sede.cantidad : "Sin stock"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
