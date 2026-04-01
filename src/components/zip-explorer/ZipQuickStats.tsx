import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/features/zip-explorer/formatters";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipQuickStats = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Quick stats</CardTitle></CardHeader>
    <CardContent className="grid gap-2 sm:grid-cols-2">
      <p>Population: {formatNumber(model.demographics.population)}</p>
      <p>Median income: {formatCurrency(model.demographics.medianHouseholdIncome)}</p>
      <p>Median home value: {formatCurrency(model.housing.medianHomeValue)}</p>
      <p>Median rent: {formatCurrency(model.housing.medianGrossRent)}</p>
    </CardContent>
  </Card>
);
