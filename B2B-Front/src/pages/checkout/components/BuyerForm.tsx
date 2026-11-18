export type BuyerField = "name" | "lastName" | "email" | "phone";
export type BuyerFormValues = Record<BuyerField, string>;
export type BuyerFormErrors = Record<BuyerField, string>;

type BuyerFormProps = {
  value: BuyerFormValues;
  errors: BuyerFormErrors;
  company?: { name: string; legalId: string };
  onChange: (field: BuyerField, value: string) => void;
  onBlur: (field: BuyerField) => void;
};

export default function BuyerForm({
  value,
  errors,
  company,
  onChange,
  onBlur,
}: BuyerFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Información personal</h3>
        <p className="mt-1 text-sm text-slate-500">
          Completa tus datos para continuar con el pedido.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="checkout-name"
            className="block text-sm font-semibold text-slate-700"
          >
            Nombre
          </label>
          <input
            id="checkout-name"
            type="text"
            placeholder="Tu nombre"
            value={value.name}
            onChange={(event) => onChange("name", event.target.value)}
            onBlur={() => onBlur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "checkout-name-error" : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && (
            <p id="checkout-name-error" className="text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="checkout-last-name"
            className="block text-sm font-semibold text-slate-700"
          >
            Apellido
          </label>
          <input
            id="checkout-last-name"
            type="text"
            placeholder="Tu apellido"
            value={value.lastName}
            onChange={(event) => onChange("lastName", event.target.value)}
            onBlur={() => onBlur("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={
              errors.lastName ? "checkout-last-name-error" : undefined
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.lastName && (
            <p id="checkout-last-name-error" className="text-sm text-red-600">
              {errors.lastName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="checkout-email"
            className="block text-sm font-semibold text-slate-700"
          >
            Correo electrónico
          </label>
          <input
            id="checkout-email"
            type="email"
            placeholder="tu@correo.com"
            value={value.email}
            onChange={(event) => onChange("email", event.target.value)}
            onBlur={() => onBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "checkout-email-error" : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p id="checkout-email-error" className="text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="checkout-phone"
            className="block text-sm font-semibold text-slate-700"
          >
            Teléfono
          </label>
          <input
            id="checkout-phone"
            type="tel"
            placeholder="8888-8888"
            value={value.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            onBlur={() => onBlur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phone && (
            <p id="checkout-phone-error" className="text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {company && (
        <section aria-label="Empresa" className="rounded-xl bg-slate-50 p-4 sm:p-5">
          <h4 className="text-sm font-bold text-slate-900">Empresa</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-600">
                Nombre de la empresa
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {company.name || "No registrada"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-600">
                Cédula jurídica
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {company.legalId || "No registrada"}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
