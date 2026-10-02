import type { ReactNode } from "react";
import RangeSliderFilter from "./RangeSliderFilter";
import ToggleFilter from "./ToggleFilter";
import YesNoFilter from "./YesNoFilter";
import ToggleFilterWithSearchBox from "./ToggleFilterWithSearchBox";

const sectionTitleClass =
  "text-xs font-bold uppercase tracking-wide text-slate-500 mb-3";

function FilterSection({
  title,
  children,
  last = false,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "pt-4" : "py-4 border-b border-slate-200"}>
      <p className={sectionTitleClass}>{title}</p>
      <div className="flex flex-col gap-4">{children}</div>
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

// Todos los filtros. Es un componente aparte porque se usa en dos lugares:
// el aside de desktop y el drawer lateral de móvil.
export default function FiltersList() {
  return (
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
          <ToggleFilterWithSearchBox attribute="facets.transmission" limit={50} />
        </FilterItem>

        <FilterItem label="Tren Motriz">
          <ToggleFilterWithSearchBox attribute="facets.drivetrain" limit={50} />
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
  );
}