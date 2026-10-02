import { createContext, useContext, useState, type ReactNode } from "react";
import RangeSliderFilter from "./RangeSliderFilter";
import ToggleFilter from "./ToggleFilter";
import YesNoFilter from "./YesNoFilter";
import ToggleFilterWithSearchBox from "./ToggleFilterWithSearchBox";

const sectionTitleClass =
  "text-xs font-bold uppercase tracking-wide text-slate-500";


const CollapsibleContext = createContext(false);

function FilterSection({
  title,
  children,
  last = false,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
  defaultOpen?: boolean;
}) {
  const collapsible = useContext(CollapsibleContext);
  const [open, setOpen] = useState(defaultOpen);

  // Si no es colapsable como móvil, siempre está expandido
  const isOpen = !collapsible || open;

  return (
    <div className={last ? "pt-4" : "py-4 border-b border-slate-200"}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between text-left hover:text-slate-700 ${
            isOpen ? "mb-3" : ""
          }`}
        >
          <span className={sectionTitleClass}>{title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 text-slate-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : (
        <p className={`${sectionTitleClass} mb-3`}>{title}</p>
      )}


      <div className={isOpen ? "flex flex-col gap-4" : "hidden"}>
        {children}
      </div>
    </div>
  );
}

function FilterItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      {children}
    </div>
  );
}


export default function FiltersList({
  collapsible = false,
}: {
  collapsible?: boolean;
}) {
  return (
    <CollapsibleContext.Provider value={collapsible}>
      <div className="flex flex-col">
        <FilterSection title="General">
          <FilterItem label="Marca">
            <ToggleFilterWithSearchBox attribute="brand" limit={50} />
          </FilterItem>

          <FilterItem label="Categoría">
            <ToggleFilterWithSearchBox attribute="categories" limit={50} />
          </FilterItem>

          <FilterItem label="Precio">
            <RangeSliderFilter
              pLabel="Precio"
              rangeProps={{ attribute: "price" }}
            />
          </FilterItem>

          <FilterItem label="Año">
            <RangeSliderFilter
              pLabel="Año"
              rangeProps={{ attribute: "facets.year" }}
            />
          </FilterItem>
        </FilterSection>

        <FilterSection title="Diseño y carrocería">
          <FilterItem label="Color">
            <ToggleFilterWithSearchBox attribute="facets.color" limit={50} />
          </FilterItem>

          <FilterItem label="Número de puertas">
            <ToggleFilter attribute="facets.doors" limit={50} />
          </FilterItem>
        </FilterSection>

        <FilterSection title="Motor y rendimiento">
          <FilterItem label="Motor">
            <ToggleFilterWithSearchBox attribute="facets.engine" limit={50} />
          </FilterItem>

          <FilterItem label="Caballos de fuerza">
            <RangeSliderFilter
              pLabel="CV"
              rangeProps={{ attribute: "facets.power_int_value" }}
            />
          </FilterItem>

          <FilterItem label='Torque "LB-FT"'>
            <RangeSliderFilter
              pLabel="Torque"
              rangeProps={{ attribute: "facets.torque_int_value" }}
            />
          </FilterItem>

          <FilterItem label='Velocidad máxima "KM/H"'>
            <RangeSliderFilter
              pLabel="Velocidad Máxima"
              rangeProps={{ attribute: "facets.max_speed_int_value" }}
            />
          </FilterItem>

          <FilterItem label="Tipo de combustible">
            <ToggleFilter attribute="facets.fuel_type" />
          </FilterItem>

          <FilterItem label='Capacidad de tanque "L"'>
            <RangeSliderFilter
              pLabel="Capacidad de Tanque"
              rangeProps={{ attribute: "facets.fuel_capacity_int_value" }}
            />
          </FilterItem>
        </FilterSection>

        <FilterSection title="Transmisión y tracción">
          <FilterItem label="Transmisión">
            <ToggleFilterWithSearchBox
              attribute="facets.transmission"
              limit={50}
            />
          </FilterItem>

          <FilterItem label="Tren Motriz">
            <ToggleFilterWithSearchBox
              attribute="facets.drivetrain"
              limit={50}
            />
          </FilterItem>

          <FilterItem label="Tracción">
            <ToggleFilter attribute="facets.traction" />
          </FilterItem>
        </FilterSection>

        <FilterSection title="Disponibilidad" last>
          <FilterItem label="En stock">
            <YesNoFilter attribute="in_stock" />
          </FilterItem>
        </FilterSection>
      </div>
    </CollapsibleContext.Provider>
  );
}