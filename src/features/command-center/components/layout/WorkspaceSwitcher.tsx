import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WorkspaceSwitcher({ value, options, onChange }: { value: string; options: Array<{ id: string; name: string }>; onChange: (value: string) => void; }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52"><SelectValue placeholder="Select workspace" /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
    </Select>
  );
}
