import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipFamilyFit = ({ model, summary }: { model: ZipExplorerModel; summary: string }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Lifestyle & family fit</h2>
    <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
    <p className="mt-2 text-sm">This area may be a fit for households with goals aligned to {model.derivedScores.profileLabel.toLowerCase()}.</p>
  </section>
);
