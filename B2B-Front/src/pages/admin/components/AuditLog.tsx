import type { AuditEntry, AuditType } from "../../../admin/adminAudit";

/** Historial de operaciones simuladas: que cambio, antes, despues y quien. */
export default function AuditLog({
  entries,
  types,
  title = "Historial de cambios simulados",
  limit = 10,
}: {
  entries: AuditEntry[];
  types: AuditType[];
  title?: string;
  limit?: number;
}) {
  const visible = entries.filter((entry) => types.includes(entry.type)).slice(0, limit);

  return (
    <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {visible.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Todavía no se han realizado cambios.</p>
      ) : (
        <ol className="mt-3 divide-y divide-slate-100 text-sm">
          {visible.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">
                  {entry.field} · <span className="text-slate-600">{entry.target}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(entry.at).toLocaleString("es-CR")} · {entry.adminName}
                  {entry.reason ? ` · ${entry.reason}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-semibold">
                <span className="text-slate-500 line-through">{entry.before}</span>
                <span className="mx-1 text-slate-400">→</span>
                <span className="text-slate-900">{entry.after}</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}