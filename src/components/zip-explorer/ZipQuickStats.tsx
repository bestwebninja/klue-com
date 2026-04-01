import { formatCurrency, formatNumber, formatPercent } from "@/features/zip-explorer/formatters";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipQuickStats = ({ model }: { model: ZipExplorerModel }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Snapshot</h2>
    <ul className="mt-3 space-y-2 text-sm">
      <li>Population: {formatNumber(model.demographics.population)}</li>
      <li>Median household income: {formatCurrency(model.demographics.medianHouseholdIncome)}</li>
      <li>Median gross rent: {formatCurrency(model.housing.medianGrossRent)}</li>
      <li>Homeownership rate: {formatPercent(model.housing.ownerOccupiedRate)}</li>
      <li>Median age: {formatNumber(model.demographics.medianAge)}</li>
      <li>Median home value: {formatCurrency(model.housing.medianHomeValue)}</li>
    </ul>
  </section>
);
