import { FormEvent, useState } from "react";
import { navigate } from "../App";
import { login } from "../lib/api";
import { saveSession } from "../lib/auth";

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    void (async () => {
      setLoading(true);
      setError(null);
      const form = new FormData(formElement);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");

      try {
        const payload = await login({ email, password });
        saveSession({
          token: payload.token,
          refreshToken: payload.refreshToken,
          role: payload.user.role,
          email: payload.user.email
        });
        navigate(payload.user.role === "admin" ? "/admin" : "/dashboard");
      } catch {
        setError("Unable to log in. Please check your credentials and try again.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-brand-500">Kluje Ad Platform</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Log in</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in to manage your campaigns and billing.</p>
        <p className="mt-1 text-sm text-slate-400">
          New advertiser?{" "}
          <button type="button" className="text-brand-400 hover:text-brand-300" onClick={() => navigate("/signup")}>
            Create an account
          </button>
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-slate-200">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-brand-500 focus:ring"
              placeholder="name@company.com"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-brand-500 focus:ring"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-500"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
