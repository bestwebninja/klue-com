import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export function VoiceMicButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return <Button variant={active ? "secondary" : "outline"} size="icon" onClick={onToggle}>{active ? <MicOff /> : <Mic />}</Button>;
}
