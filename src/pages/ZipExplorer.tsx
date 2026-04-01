import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { useZipExplorer } from "@/hooks/useZipExplorer";

const formatNumber = (value: number | null) => (typeof value === "number" ? value.toLocaleString("en-US") : "N/A");

const ZipExplorer = () => {
  const { zipCode = "" } = useParams<{ zipCode: string }>();
  const zip = zipCode.trim();
  const { data, isLoading } = useZipExplorer(zip);

  const isInvalidZip = data?.status === "invalid_zip";
  const isDisabled = data?.status === "disabled";
  const isError = data?.status === "error";
  const isSuccess = data?.status === "ok";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`ZIP ${zip || "Explorer"} | Kluje`}
        description="ZIP Explorer powered by Census data through a secure Supabase Edge Function proxy."
      />
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <h1 className="text-3xl font-semibold">ZIP Explorer</h1>
        <p className="text-muted-foreground">Viewing ZIP: {zip || "(none)"}</p>

        {isLoading && <LoadingSpinner />}

        {isInvalidZip && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
            Invalid ZIP code. Please provide a valid 5-digit ZIP.
          </div>
        )}

        {isDisabled && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
            Census proxy is disabled. Please configure the Supabase Edge secret CENSUS_API_KEY.
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
            Unable to load ZIP data. {data?.message ?? "Please try again later."}
          </div>
        )}

        {isSuccess && (
          <section className="space-y-3 rounded-lg border p-4">
            <h2 className="text-xl font-medium">{data.data.name ?? "Unknown place"}</h2>
            <p><strong>ZIP:</strong> {data.data.zip}</p>
            <p><strong>Population:</strong> {formatNumber(data.data.population)}</p>
            <p><strong>Median income:</strong> {formatNumber(data.data.medianIncome)}</p>
            <p><strong>Owner-occupied units:</strong> {formatNumber(data.data.ownerOccupiedUnits)}</p>
            <p><strong>Median rent:</strong> {formatNumber(data.data.medianRent)}</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ZipExplorer;
