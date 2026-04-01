import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceStatus } from "@/features/zip-explorer/types";

export const ZipSourceStatus = ({ sources }: { sources: SourceStatus[] }) => (
  <Card>
    <CardHeader><CardTitle>Source status</CardTitle></CardHeader>
    <CardContent className="space-y-2">
      {sources.map((source) => (
        <div key={source.key} className="text-sm">
          <span className="font-medium">{source.label}:</span> {source.status}
          {source.reason ? <span className="text-muted-foreground"> — {source.reason}</span> : null}
        </div>
      ))}
    </CardContent>
  </Card>
);
