import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ZipHero } from "@/components/zip-explorer/ZipHero";
import { ZipQuickStats } from "@/components/zip-explorer/ZipQuickStats";
import { ZipFamilyFit } from "@/components/zip-explorer/ZipFamilyFit";
import { ZipAffordability } from "@/components/zip-explorer/ZipAffordability";
import { ZipAirQuality } from "@/components/zip-explorer/ZipAirQuality";
import { ZipWalkability } from "@/components/zip-explorer/ZipWalkability";
import { ZipSchools } from "@/components/zip-explorer/ZipSchools";
import { ZipRiskPanel } from "@/components/zip-explorer/ZipRiskPanel";
import { ZipSearchBox } from "@/components/zip-explorer/ZipSearchBox";
import { ZipSourceStatus } from "@/components/zip-explorer/ZipSourceStatus";
import { ZipEmptyState } from "@/components/zip-explorer/ZipEmptyState";
import { useZipExplorer } from "@/hooks/useZipExplorer";
import { useZipSearch } from "@/hooks/useZipSearch";
import { isValidZipCode } from "@/features/zip-explorer/validators";
import { zipCanonicalUrl, zipIntroCopy, zipMetaDescription } from "@/features/zip-explorer/formatters";
import { ZIP_FAQ_COPY } from "@/features/zip-explorer/constants";

const ZipExplorer = () => {
  const { zipCode = "" } = useParams<{ zipCode: string }>();
  const zip = zipCode.trim();
  const isValid = isValidZipCode(zip);
  const { zipInput, setZipInput, submitZip } = useZipSearch(zip);
  const { data, isLoading } = useZipExplorer(zip, isValid);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`ZIP ${zip || "Explorer"} | Kluje`} description={zipMetaDescription(zip || "US")} canonical={isValid ? zipCanonicalUrl(zip) : undefined} />
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <ZipSearchBox value={zipInput} onChange={setZipInput} onSubmit={submitZip} />

        {!isValid && <ZipEmptyState title="Invalid ZIP code" description="Please use a valid 5-digit US ZIP code." />}

        {isValid && isLoading && <LoadingSpinner />}

        {isValid && !isLoading && !data?.hasAnyData && (
          <ZipEmptyState title="No ZIP data available" description="We could not find public signals for this ZIP yet." />
        )}

        {isValid && data?.hasAnyData && (
          <>
            <p className="text-muted-foreground">{zipIntroCopy(zip)}</p>
            <ZipHero model={data} />
            {data.hasPartialData && (
              <ZipEmptyState
                title="Partial data available"
                description="Some optional providers are unavailable. Census-backed sections still render when possible."
              />
            )}
            <section className="grid gap-4 md:grid-cols-2">
              <ZipQuickStats model={data} />
              <ZipFamilyFit model={data} />
              <ZipAffordability model={data} />
              <ZipAirQuality model={data} />
              <ZipWalkability model={data} />
              <ZipSchools model={data} />
              <ZipRiskPanel model={data} />
              <ZipSourceStatus sources={data.sourceStatus} />
            </section>

            <section className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold">FAQ</h2>
              <div className="mt-3 space-y-3">
                {ZIP_FAQ_COPY.map((item) => (
                  <div key={item.q}>
                    <p className="font-medium">{item.q}</p>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-muted p-6">
              <h2 className="text-xl font-semibold">Ready to hire in this ZIP?</h2>
              <p className="text-muted-foreground">Create a job on Kluje and match with verified local providers.</p>
              <Link to="/post-job" className="mt-3 inline-block text-primary underline">Post a job</Link>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ZipExplorer;
