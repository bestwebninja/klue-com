import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipWalkability = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Walkability</CardTitle></CardHeader>
    <CardContent>
      <p>Walk Score: {model.walkability.walkScore ?? "Unavailable"}</p>
      <p>Transit Score: {model.walkability.transitScore ?? "Unavailable"}</p>
    </CardContent>
  </Card>
);
