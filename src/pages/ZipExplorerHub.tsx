import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ZipSearchBox } from "@/components/zip-explorer/ZipSearchBox";
import { SeoHead } from "@/components/seo/SeoHead";
import { SAMPLE_ZIPS } from "@/features/zip-explorer/constants";
import { useZipSearch } from "@/hooks/useZipSearch";

const ZipExplorerHub = () => {
  const { zipInput, setZipInput, submitZip } = useZipSearch("");

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title="USA ZIP Explorer | Kluje" description="Search US ZIP codes to view Census-first demographics and affordability snapshots." canonical={`${(import.meta.env.VITE_PUBLIC_SITE_URL || "https://kluje.com").replace(/\/$/, "")}/zip-explorer`} />
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-semibold">USA ZIP Explorer</h1>
        <p className="text-muted-foreground">Use this tool to explore Census-first ZIP-level context before hiring service providers.</p>
        <ZipSearchBox value={zipInput} onChange={setZipInput} onSubmit={submitZip} />
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Sample ZIP pages</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {SAMPLE_ZIPS.map((zip) => <Link key={zip} className="underline" to={`/zip/${zip}`}>{zip}</Link>)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ZipExplorerHub;
