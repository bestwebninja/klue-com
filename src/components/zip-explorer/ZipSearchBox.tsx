import { FormEvent } from "react";

export const ZipSearchBox = ({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => boolean }) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="numeric" placeholder="Enter 5-digit ZIP" className="w-48 rounded border px-3 py-2" />
      <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">Explore ZIP</button>
    </form>
  );
};
