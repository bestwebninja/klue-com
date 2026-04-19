interface WalkThroughHeaderProps {
  title: string;
}

export function WalkThroughHeader({ title }: WalkThroughHeaderProps) {
  return (
    <header className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    </header>
  );
}
