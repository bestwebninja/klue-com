import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipSchools = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Schools</CardTitle></CardHeader>
    <CardContent>
      <p>Avg rating: {model.schools.averageRating ?? "Unavailable"}</p>
      <p className="text-sm text-muted-foreground">{model.schools.notes ?? "GreatSchools adapter currently stubbed."}</p>
    </CardContent>
  </Card>
);
