import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipAffordability = ({ model, summary }: { model: ZipExplorerModel; summary: string }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Affordability</h2>
    <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
    <p className="mt-2 text-sm">Band: <strong>{model.derivedScores.affordabilityScore >= 65 ? "More affordable" : model.derivedScores.affordabilityScore >= 45 ? "Mid-range" : "Higher cost"}</strong></p>
  </section>
);
