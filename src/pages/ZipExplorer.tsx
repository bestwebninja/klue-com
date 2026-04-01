import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SeoHead } from "@/components/seo/SeoHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { ZipHero } from "@/components/zip-explorer/ZipHero";
import { ZipQuickStats } from "@/components/zip-explorer/ZipQuickStats";
import { ZipFamilyFit } from "@/components/zip-explorer/ZipFamilyFit";
import { ZipAffordability } from "@/components/zip-explorer/ZipAffordability";
import { ZipAirQuality } from "@/components/zip-explorer/ZipAirQuality";
import { ZipWalkability } from "@/components/zip-explorer/ZipWalkability";
import { ZipSchools } from "@/components/zip-explorer/ZipSchools";
import { ZipRiskPanel } from "@/components/zip-explorer/ZipRiskPanel";
import { ZipConversionPanel } from "@/components/zip-explorer/ZipConversionPanel";
import { ZipSearchBox } from "@/components/zip-explorer/ZipSearchBox";
import { ZipSourceStatus } from "@/components/zip-explorer/ZipSourceStatus";
import { ZipInternalLinks } from "@/components/zip-explorer/ZipInternalLinks";
import { ZipFaqContent } from "@/components/zip-explorer/ZipFaqContent";
import { ZipEmptyState } from "@/components/zip-explorer/ZipEmptyState";
import { useZipSearch } from "@/hooks/useZipSearch";
import { useZipExplorer } from "@/hooks/useZipExplorer";
import { isValidZipCode } from "@/features/zip-explorer/validators";
import { buildZipBreadcrumbJsonLd, buildZipCanonicalUrl, buildZipDescription, buildZipPlaceJsonLd, buildZipTitle, buildZipWebPageJsonLd } from "@/features/zip-explorer/seo";
import { getAffordabilitySummary, getFamilyFitSummary, getHeroSummary, getZipFaq } from "@/features/zip-explorer/copy";

const ZipExplorer = () => {
  const { zipCode = "" } = useParams<{ zipCode: string }>();
  const zip = zipCode.trim();
  const isValid = isValidZipCode(zip);
  const { zipInput, setZipInput, submitZip } = useZipSearch(zip);
  const { data, isLoading } = useZipExplorer(zip, isValid, true);

  const title = buildZipTitle(zip, data?.identity.placeName);
  const description = buildZipDescription(zip, data);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={title} description={description} canonical={isValid ? buildZipCanonicalUrl(zip) : undefined} robots={isValid ? "index,follow" : "noindex,follow"} />
      {isValid && (
        <>
          <JsonLd id="zip-breadcrumb-jsonld" data={buildZipBreadcrumbJsonLd(zip)} />
          <JsonLd id="zip-page-jsonld" data={buildZipWebPageJsonLd(zip, description)} />
          {data && <JsonLd id="zip-place-jsonld" data={buildZipPlaceJsonLd(zip, data)} />}
        </>
      )}
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <ZipSearchBox value={zipInput} onChange={setZipInput} onSubmit={submitZip} />

        {!isValid && <ZipEmptyState title="Invalid ZIP code" description="Please enter a valid 5-digit ZIP code, such as 90210." />}
        {isValid && isLoading && <LoadingSpinner />}
        {isValid && !isLoading && !data?.hasAnyData && <ZipEmptyState title="No data currently available" description="This ZIP may not have enough configured sources yet. Try another ZIP." />}

        {isValid && data?.hasAnyData && (
          <>
            <ZipHero model={data} summary={getHeroSummary(data)} />
            {data.hasPartialData && <ZipEmptyState title="Partial provider availability" description="Census sections are available, but one or more optional providers are currently unavailable." />}
            <section className="grid gap-4 md:grid-cols-2">
              <ZipQuickStats model={data} />
              <ZipFamilyFit model={data} summary={getFamilyFitSummary(data)} />
              <ZipAffordability model={data} summary={getAffordabilitySummary(data)} />
              <ZipAirQuality model={data} />
              <ZipWalkability model={data} />
              <ZipSchools model={data} />
              <ZipRiskPanel model={data} />
              <ZipSourceStatus sources={data.sourceStatus} />
            </section>
            <ZipFaqContent items={getZipFaq(zip)} />
            <ZipConversionPanel model={data} />
            <ZipInternalLinks zipCode={zip} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ZipExplorer;
