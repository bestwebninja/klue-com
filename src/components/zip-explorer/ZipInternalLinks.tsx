import { Link } from "react-router-dom";

export const ZipInternalLinks = ({ zipCode }: { zipCode: string }) => {
  const nearby = ["10001", "10011", "10019"].filter((z) => z !== zipCode);
  return (
    <section className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Explore more on Kluje</h2>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <Link to="/browse-providers" className="underline">Browse providers</Link>
        <Link to="/pricing" className="underline">Pricing</Link>
        <Link to="/how-it-works" className="underline">How it works</Link>
        <Link to="/about" className="underline">About</Link>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Related ZIPs (placeholder strategy): {nearby.map((z) => <Link key={z} to={`/zip/${z}`} className="mr-2 underline">{z}</Link>)}</p>
    </section>
  );
};
