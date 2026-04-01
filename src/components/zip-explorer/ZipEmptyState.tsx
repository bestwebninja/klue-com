export const ZipEmptyState = ({ title, description }: { title: string; description: string }) => (
  <section className="rounded-lg border border-dashed p-6">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
  </section>
);
