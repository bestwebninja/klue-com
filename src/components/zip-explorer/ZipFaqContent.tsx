export const ZipFaqContent = ({ items }: { items: { q: string; a: string }[] }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">ZIP Explorer FAQs</h2>
    <div className="mt-3 space-y-3">
      {items.map((item) => (
        <article key={item.q}>
          <h3 className="font-medium">{item.q}</h3>
          <p className="text-sm text-muted-foreground">{item.a}</p>
        </article>
      ))}
    </div>
  </section>
);
