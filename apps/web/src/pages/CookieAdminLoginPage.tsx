import { FormEvent, useState } from "react";
import { navigate } from "../App";
import { Footer } from "../components/Footer";

export function CookieAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — would validate admin credentials via API
    navigate("/cookie-admin");
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-brand-500">Kluje Ad Platform</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Cookie Admin Login</h1>
            <p className="mt-1 text-sm text-slate-400">Authorized personnel only</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="admin@kluje.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500">
            Sign In
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
