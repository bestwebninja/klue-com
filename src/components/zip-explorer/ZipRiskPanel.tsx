import type { ZipExplorerModel } from "@/features/zip-explorer/types";

const AREA_ONLY_DISCLAIMER =
  "This output provides area-level context only. It does not identify, describe, or infer characteristics of any specific individual, household, or property occupant.";

export const ZipRiskPanel = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Area Risk Summary</h2>
    <p className="mt-2 text-sm text-muted-foreground">
      {model.klujeRisk.riskBand
        ? `Area-risk band: ${model.klujeRisk.riskBand}`
        : "Area-risk source unavailable for this region right now."}
    </p>
    <p className="mt-3 text-xs text-muted-foreground">{AREA_ONLY_DISCLAIMER}</p>
  </section>
);
