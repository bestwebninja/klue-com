import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipSchools = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Schools</h2>
    <p className="mt-2 text-sm text-muted-foreground">{model.schools.averageRating ? `Average rating ${model.schools.averageRating}/10` : "School data source unavailable for this ZIP right now."}</p>
  </section>
);
