import { PropsWithChildren } from "react";
import { navigate } from "../App";

type NavItem = {
  label: string;
  path: string;
};

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  navItems?: NavItem[];
}>;

function NavLink({ label, path }: NavItem) {
  const active = window.location.pathname === path;

  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export function AppShell({ title, subtitle, navItems = [], children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <header className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-500">Kluje Ad Platform</p>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
        </div>

        {navItems.length > 0 ? (
          <nav className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </nav>
        ) : null}
      </header>

      {children}
    </main>
  );
}
