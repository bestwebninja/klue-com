import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipRiskPanel = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Kluje risk</CardTitle></CardHeader>
    <CardContent>
      <p>Risk band: {model.klujeRisk.riskBand ?? "Unavailable"}</p>
      <p className="text-sm text-muted-foreground">Livability score: {model.derivedScores.livability}/100</p>
    </CardContent>
  </Card>
);
