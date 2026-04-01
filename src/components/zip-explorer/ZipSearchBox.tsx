import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ZipSearchBox = ({ value, onChange, onSubmit }: Props) => (
  <div className="flex gap-2">
    <Input value={value} maxLength={5} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} placeholder="Enter ZIP" />
    <Button onClick={onSubmit}>Explore</Button>
  </div>
);
