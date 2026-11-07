import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { roleLabels } from "../../auth/roleLabels";
import type { AppUser, LookupFailure } from "../../auth/types";
import { useAuth } from "../../auth/useAuth";
import { userDirectory } from "../../auth/UserDirectory";
import Spinner from "../../components/Spinner";
import { errorMessages } from "../../lib/errorMessages";

const AUTH_ERROR_MESSAGES: Record<LookupFailure, string> = {
  NOT_FOUND: errorMessages.auth.notFound,
  INACTIVE: errorMessages.auth.inactive,
  INVALID_ROLE: errorMessages.auth.invalidRole,
  INVALID_RECORD: errorMessages.auth.invalidRecord,
};

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoUsers, setDemoUsers] = useState<AppUser[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    userDirectory
      .list()
      .then((users) => {
        if (active) setDemoUsers(users);
      })
      .catch(() => {
        if (active) setDemoUsers([]);
      });

    return () => {
      active = false;
    };
  }, []);

  async function submitLogin(value: string) {
    setError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setError(errorMessages.auth.emptyLogin);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(trimmed);
      if (!result.ok) {
        setError(AUTH_ERROR_MESSAGES[result.reason] ?? errorMessages.auth.generic);
        return;
      }

      const from = location.state?.from;
      const returnTo = from
        ? `${from.pathname}${from.search}${from.hash}`
        : "/";
      navigate(returnTo, { replace: true });
    } catch {
      setError(errorMessages.auth.generic);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin(loginInput);
  }

  async function handleDemoLogin(user: AppUser) {
    setLoginInput(user.username);
    await submitLogin(user.username);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Bombocars
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Usa tu correo o nombre de usuario. También puedes entrar con una
            tarjeta de prueba.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Correo o nombre de usuario
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              value={loginInput}
              onChange={(event) => setLoginInput(event.target.value)}
              placeholder="correo@ejemplo.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" label="Ingresando" />
                Ingresando…
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-sm font-semibold text-slate-700">
            {errorMessages.auth.demoTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {errorMessages.auth.demoHint}
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {demoUsers.map((user) => (
              <button
                key={user.objectID}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoLogin(user)}
                className="flex cursor-pointer flex-col items-start rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {user.displayName}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  {roleLabels[user.role]}
                </span>
                {user.company && (
                  <span className="truncate text-xs text-slate-500">
                    {user.company.name}
                  </span>
                )}
                <span className="mt-1 text-[11px] text-slate-400">
                  {user.username}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
