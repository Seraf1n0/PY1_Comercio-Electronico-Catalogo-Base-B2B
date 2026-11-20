import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { roleLabels } from "../../auth/roleLabels";
import { homePathFor, permissionLabels, type Permission } from "../../auth/permissions";
import { useAuth } from "../../auth/useAuth";
import { errorMessages } from "../../lib/errorMessages";

export default function AccessDeniedPage({ permission }: { permission?: Permission }) {
  const { role } = useAuth();
  const roleName = role ? roleLabels[role] : "sin rol válido";

  return (
    <main
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center animate-fade-in"
    >
      <NoSymbolIcon className="h-14 w-14 text-red-400" aria-hidden="true" />
      <h1 className="text-xl font-bold text-slate-800">
        {errorMessages.accessDenied.title}
      </h1>
      <p className="text-sm text-slate-600">
        {errorMessages.accessDenied.text}{" "}
        {permission && (
          <>
            Tu rol (<strong>{roleName}</strong>) no permite:{" "}
            <strong>{permissionLabels[permission].toLowerCase()}</strong>.
          </>
        )}
      </p>
      <Link
        to={homePathFor(role)}
        className="mt-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        {errorMessages.accessDenied.action}
      </Link>
    </main>
  );
}