import type { Product } from "../../../Catalog/types"

interface SpecsTableProps {
    product: Product;
}

export default function SpecsTable({ product }: SpecsTableProps) {
  const specs: { label: string; value: string | number }[] = [
    { label: "Motor", value: product.engine },
    { label: "Color", value: product.color },
    { label: "Cilindrada (CC)", value: product.cc },
    { label: "Combustible", value: product.fuel_type },
    { label: "Transmisión", value: product.transmission },
    { label: "Potencia", value: product.power },
    { label: "Torque", value: product.torque },
    { label: "Capacidad de tanque", value: product.fuel_capacity },
    { label: "Tracción", value: product.traction },
    { label: "Velocidad máxima", value: product.max_speed },
    { label: "Puertas", value: product.doors },
  ];

  return (
    <div className="mt-6">
      <p className="text-lg font-bold mb-2">Detalles del vehículo</p>
      <table className="w-full text-sm bg-gray-100 rounded-lg shadow-md overflow-hidden">
        <tbody className="divide-y divide-gray-300">
          {specs.map((spec) => (
            <tr
              key={spec.label}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 px-4 font-semibold text-left">{spec.label}</td>
              <td className="py-2 px-4 text-gray-700">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
