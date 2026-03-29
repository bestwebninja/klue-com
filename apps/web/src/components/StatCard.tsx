import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
};

export function StatCard({ label, value, delta, icon }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-slate-950/30">
      <div className="mb-3 flex items-center justify-between text-slate-300">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-emerald-400">{delta}</p>
    </article>
  );
}
