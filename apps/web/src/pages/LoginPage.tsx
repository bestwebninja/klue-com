import { FormEvent } from "react";
import { navigate } from "../App";

export function LoginPage() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/dashboard");
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
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-brand-500 focus:ring"
              placeholder="name@company.com"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Password
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-brand-500 focus:ring"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-500"
          >
            Continue to dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
