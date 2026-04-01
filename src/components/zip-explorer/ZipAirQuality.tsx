import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipAirQuality = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Air quality</h2>
    <p className="mt-2 text-sm text-muted-foreground">{model.airQuality.aqi ? `AQI ${model.airQuality.aqi} (${model.airQuality.category || "unknown"})` : "Air quality source unavailable for this ZIP right now."}</p>
  </section>
);
