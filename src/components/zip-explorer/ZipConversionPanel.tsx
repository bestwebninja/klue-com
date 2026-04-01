import { Link } from "react-router-dom";
import { getCtaCopy } from "@/features/zip-explorer/copy";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

export const ZipConversionPanel = ({ model }: { model: ZipExplorerModel }) => {
  const cta = getCtaCopy(model);
  return (
    <section className="rounded-lg border bg-muted p-6">
      <h2 className="text-xl font-semibold">{cta.heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{cta.body}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/browse-providers">{cta.primary}</Link>
        <Link className="underline" to="/post-job">Post a job</Link>
        <Link className="underline" to="/contractor/quote-intake">Get a quote intake</Link>
      </div>
    </section>
  );
};
