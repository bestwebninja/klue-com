import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipFamilyFit = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Family fit</CardTitle></CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold">{model.derivedScores.familyFit}/100</p>
      <p className="text-sm text-muted-foreground">Composite from schools, walkability, and air quality signals.</p>
    </CardContent>
  </Card>
);
