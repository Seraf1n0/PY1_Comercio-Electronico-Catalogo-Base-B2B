import { useEffect, useMemo, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { roleLabels } from "../../auth/roleLabels";
import { userDirectory } from "../../auth/UserDirectory";
import {
  getAllRecentEvents,
  getAllUniqueProducts,
  getAllUserCounters,
  sumCounters,
} from "../../analytics/aggregate";
import { clearUserAnalytics } from "../../analytics/clearUserData"; 
import {
  getMetrics,
  getRecentEvents,
  metricsFromCounters,
} from "../../analytics/metrics";
import { eventLabels, summarizeEvent } from "../../analytics/eventLabels";
import { ANALYTICS_EVENT_TYPES } from "../../analytics/types";
import BarChart from "../../components/BarChart";
import UserBadge from "../../components/UserBadge";
import { storageKeys } from "../../lib/storageKeys";
import { useStorageSync } from "../../lib/useStorageSync";

function refreshReducer(
  state: { version: number; updatedAt: number },
  updatedAt: number,
) {
  return { version: state.version + 1, updatedAt };
}

const timeFormat = new Intl.DateTimeFormat("es-CR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function AnalyticsPage() {
  const { user, role } = useAuth();
  const userId = user?.objectID ?? "";
  const isAdmin = role === "ADMIN";

  const [refresh, bump] = useReducer(refreshReducer, null, () => ({
    version: 0,
    updatedAt: Date.now(),
  }));

  const [names, setNames] = useState<Record<string, string>>({});

 
  const [confirmingReset, setConfirmingReset] = useState(false);

  useStorageSync(
    isAdmin
      ? [storageKeys.metricsPrefix, storageKeys.eventsPrefix]
      : [storageKeys.metrics(userId), storageKeys.events(userId)],
    () => bump(Date.now()),
  );

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    userDirectory
      .list()
      .then((users) => {
        if (cancelled) return;
        setNames(
          Object.fromEntries(users.map((item) => [item.objectID, item.displayName])),
        );
      })
      .catch(() => {
        // Si falla, la tabla mostrará el id en lugar del nombre
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const data = useMemo(() => {
    void refresh.version;
    if (!userId) return null;

    if (isAdmin) {
      const rows = getAllUserCounters();
      const totals = sumCounters(rows);
      return {
        rows,
        counters: totals,
        metrics: {
          ...metricsFromCounters(totals),
          uniqueProductsViewed: getAllUniqueProducts(),
        },
        events: getAllRecentEvents(20),
      };
    }

    const metrics = getMetrics(userId);
    return {
      rows: [],
      counters: metrics.counters,
      metrics,
      events: getRecentEvents(userId, 20),
    };
  }, [userId, isAdmin, refresh.version]);

  if (!user || !role || !data) return null;

  const { metrics, counters, events, rows } = data;

  const cards = [
    { label: "Productos visualizados", value: metrics.productsViewed },
    { label: "Búsquedas realizadas", value: metrics.searches },
    { label: "Agregados al carrito", value: metrics.addedToCart },
    { label: "Compras realizadas", value: metrics.purchases },
  ];

  const hasActivity = cards.some((card) => card.value > 0);

  const chartData = ANALYTICS_EVENT_TYPES.map((type) => ({
    label: eventLabels[type],
    value: counters[type],
  }));

  const nameOf = (id: string) => names[id] ?? id;


  const handleReset = () => {
    clearUserAnalytics(userId);
    setConfirmingReset(false);
    bump(Date.now());
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
          ← Volver al catálogo
        </Link>
        <h1 className="text-lg font-bold text-blue-800 sm:text-xl">Analytics</h1>
        <UserBadge />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {isAdmin ? "Uso agregado de todos los usuarios · " : "Métricas de "}
            <span className="font-semibold text-slate-800">{user.displayName}</span>{" "}
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {roleLabels[role]}
            </span>
          </p>

          <p className="flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            En vivo · actualizado {timeFormat.format(refresh.updatedAt)}
          </p>
        </div>

        {!hasActivity && (
          <div className="mb-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-semibold text-slate-800">Aún no hay actividad registrada</p>
            <p className="mt-1 text-sm text-slate-500">
              Busca, abre productos y agrega vehículos al carrito.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Explorar el catálogo
            </Link>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">{card.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-indigo-700">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Eventos por tipo
          </h2>
          <BarChart data={chartData} ariaLabel="Cantidad de eventos por tipo" />
        </section>

        {isAdmin && (
          <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
              Uso por usuario
            </h2>

            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay usuarios con actividad.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-3">Usuario</th>
                      <th className="px-3 py-2 text-right">Vistos</th>
                      <th className="px-3 py-2 text-right">Búsquedas</th>
                      <th className="px-3 py-2 text-right">Carrito</th>
                      <th className="px-3 py-2 text-right">Compras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.userId}>
                        <td className="py-2 pr-3 font-medium text-slate-800">{nameOf(row.userId)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{row.counters.PRODUCT_VIEW}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{row.counters.SEARCH}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{row.counters.ADD_TO_CART}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{row.counters.PURCHASE_COMPLETED}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td className="py-2 pr-3">Total</td>
                      <td className="px-3 py-2 text-right tabular-nums">{counters.PRODUCT_VIEW}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{counters.SEARCH}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{counters.ADD_TO_CART}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{counters.PURCHASE_COMPLETED}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Últimos eventos
          </h2>

          {events.length === 0 ? (
            <p className="text-sm text-slate-500">Sin eventos todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Hora</th>
                    {isAdmin && <th className="px-3 py-2">Usuario</th>}
                    <th className="px-3 py-2">Evento</th>
                    <th className="px-3 py-2">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="whitespace-nowrap py-2 pr-3 text-slate-500">
                        {timeFormat.format(event.tsMs)}
                      </td>
                      {isAdmin && (
                        <td className="whitespace-nowrap px-3 py-2">{nameOf(event.userId)}</td>
                      )}
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-800">
                        {eventLabels[event.type]}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{summarizeEvent(event)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

       
        <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          {confirmingReset ? (
            <>
              
              <p className="text-sm text-slate-700">
                ¿Borrar tus eventos, contadores e historial (vistos y búsquedas recientes)? No afecta a otros usuarios ni a tu carrito.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Sí, reiniciar
                </button>
              </div>
            </>
          ) : (
            <>
            
              <p className="text-sm text-slate-500">
                ¿Reiniciar demostración?
              </p>
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Reiniciar mis datos
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}