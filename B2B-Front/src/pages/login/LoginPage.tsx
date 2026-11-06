import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = loginInput.trim();
    if (!value) {
      setError("Escribe tu correo o nombre de usuario.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loginError = await login(value);
      if (loginError) {
        setError(loginError);
        return;
      }

      const from = location.state?.from;
      const returnTo = from
        ? `${from.pathname}${from.search}${from.hash}`
        : "/";
      navigate(returnTo, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Bombocars
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Recuerde solo utilizar su correo 
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-slate-700">
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
            <p id="login-error" role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
