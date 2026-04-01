import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipRiskPanel = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Kluje risk snapshot</h2>
    <p className="mt-2 text-sm text-muted-foreground">{model.klujeRisk.riskBand ? `Risk band: ${model.klujeRisk.riskBand}` : "Risk source unavailable for this ZIP right now."}</p>
  </section>
);
