import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipWalkability = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Walkability</h2>
    <p className="mt-2 text-sm text-muted-foreground">{model.walkability.walkScore ? `Walk score ${model.walkability.walkScore}/100` : "Walkability source unavailable for this ZIP right now."}</p>
  </section>
);
