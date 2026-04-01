import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/features/zip-explorer/formatters";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipAffordability = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Affordability</CardTitle></CardHeader>
    <CardContent>
      <p>Rent burden: {formatPercent(model.affordability.rentBurdenRate)}</p>
      <p className="text-sm text-muted-foreground">Affordability score: {model.derivedScores.affordability}/100</p>
    </CardContent>
  </Card>
);
