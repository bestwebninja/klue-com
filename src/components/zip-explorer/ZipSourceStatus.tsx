import type { SourceStatus } from "@/features/zip-explorer/types";

export const ZipSourceStatus = ({ sources }: { sources: SourceStatus[] }) => (
  <section className="rounded-lg border p-6">
    <h2 className="text-xl font-semibold">Source status</h2>
    <ul className="mt-3 space-y-1 text-sm">
      {sources.map((source) => (
        <li key={source.key}><strong>{source.label}:</strong> {source.status}{source.reason ? ` — ${source.reason}` : ""}</li>
      ))}
    </ul>
  </section>
);
