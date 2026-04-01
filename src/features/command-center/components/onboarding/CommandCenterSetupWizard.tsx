import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeClassifierForm } from "./TradeClassifierForm";

export function CommandCenterSetupWizard({ onComplete }: { onComplete: (values: { trade: string; focus: string; jobSize: string; veteranOwned: boolean }) => void }) {
  return <Card><CardHeader><CardTitle>Command Center Setup</CardTitle></CardHeader><CardContent><TradeClassifierForm onSubmit={onComplete} /></CardContent></Card>;
}
