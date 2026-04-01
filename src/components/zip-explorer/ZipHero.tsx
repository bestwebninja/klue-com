import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipHero = ({ model, summary }: { model: ZipExplorerModel; summary: string }) => (
  <section className="rounded-lg border p-6">
    <p className="text-sm text-muted-foreground">ZIP {model.identity.zipCode}</p>
    <h1 className="text-3xl font-semibold">{model.identity.placeName || `ZIP ${model.identity.zipCode}`}</h1>
    <p className="mt-2 text-muted-foreground">{summary}</p>
  </section>
);
