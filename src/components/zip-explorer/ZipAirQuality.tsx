import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipAirQuality = ({ model }: { model: ZipExplorerModel }) => (
  <Card>
    <CardHeader><CardTitle>Air quality</CardTitle></CardHeader>
    <CardContent>
      <p>AQI: {model.airQuality.aqi ?? "Unavailable"}</p>
      <p className="text-sm text-muted-foreground">{model.airQuality.category ?? "No AirNow signal configured"}</p>
    </CardContent>
  </Card>
);
