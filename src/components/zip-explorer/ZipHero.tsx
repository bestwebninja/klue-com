import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipHero = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader>
      <CardTitle>ZIP {model.identity.zipCode} Explorer</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        {model.identity.city || "ZCTA"} public profile with Census-first neighborhood context.
      </p>
    </CardContent>
  </Card>
);
