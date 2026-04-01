export const ZipEmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-lg border border-dashed p-6 text-center">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);
