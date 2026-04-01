import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TradeClassifierForm({ onSubmit }: { onSubmit: (values: { trade: string; focus: string; jobSize: string; veteranOwned: boolean }) => void }) {
  const [trade, setTrade] = useState("plumbing");
  const [focus, setFocus] = useState("service_repair");
  const [jobSize, setJobSize] = useState("small");
  const [veteranOwned, setVeteranOwned] = useState(false);
  return <div className="space-y-3">
    <Select value={trade} onValueChange={setTrade}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="plumbing">Plumbing</SelectItem><SelectItem value="electrical">Electrical</SelectItem></SelectContent></Select>
    <Select value={focus} onValueChange={setFocus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="service_repair">Service/Repair</SelectItem><SelectItem value="new_build">New Build</SelectItem><SelectItem value="mixed">Mixed</SelectItem></SelectContent></Select>
    <Select value={jobSize} onValueChange={setJobSize}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
    <label className="text-sm flex gap-2"><input type="checkbox" checked={veteranOwned} onChange={(e) => setVeteranOwned(e.target.checked)} />Veteran-owned</label>
    <Button onClick={() => onSubmit({ trade, focus, jobSize, veteranOwned })}>Save setup</Button>
  </div>;
}
