import type { ReactNode } from "react";

interface FloorSectionCardProps {
  heading: ReactNode;
  children: ReactNode;
}

export function FloorSectionCard({ heading, children }: FloorSectionCardProps) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {heading}
      {children}
    </section>
  );
}
