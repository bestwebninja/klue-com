import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ExternalLink, Globe } from "lucide-react";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export default function Sitemap() {
  const [urls, setUrls] = useState<SitemapUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSitemap() {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("generate-sitemap");
        if (fnError) throw fnError;

        // data is returned as text/xml string
        const text = typeof data === "string" ? data : new TextDecoder().decode(data);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const urlElements = xml.querySelectorAll("url");
        const parsed: SitemapUrl[] = [];
        urlElements.forEach((el) => {
          parsed.push({
            loc: el.querySelector("loc")?.textContent || "",
            lastmod: el.querySelector("lastmod")?.textContent || undefined,
            changefreq: el.querySelector("changefreq")?.textContent || undefined,
            priority: el.querySelector("priority")?.textContent || undefined,
          });
        });
        setUrls(parsed);
      } catch (e: any) {
        console.error("Failed to load sitemap:", e);
        setError("Failed to load sitemap data.");
      } finally {
        setLoading(false);
      }
    }
    fetchSitemap();
  }, []);

  const groupUrls = (urls: SitemapUrl[]) => {
    const groups: Record<string, SitemapUrl[]> = {
      "Main Pages": [],
      "Service Categories": [],
      "Blog Posts": [],
      "Service Providers": [],
      "Job Listings": [],
      "Expert Questions": [],
      Other: [],
    };
    urls.forEach((u) => {
      const path = new URL(u.loc).pathname;
      if (path.startsWith("/services/")) groups["Service Categories"].push(u);
      else if (path.startsWith("/blog/") && path !== "/blog") groups["Blog Posts"].push(u);
      else if (path.startsWith("/service-provider/")) groups["Service Providers"].push(u);
      else if (path.startsWith("/jobs/") && path !== "/jobs") groups["Job Listings"].push(u);
      else if (path.startsWith("/ask-expert/") && path !== "/ask-expert") groups["Expert Questions"].push(u);
      else if (["/", "/browse-providers", "/jobs", "/post-job", "/ask-expert", "/how-it-works", "/pricing", "/blog", "/contact", "/terms", "/privacy", "/auth"].includes(path))
        groups["Main Pages"].push(u);
      else groups["Other"].push(u);
    });
    return Object.entries(groups).filter(([, v]) => v.length > 0);
  };

  const getPriorityColor = (p?: string) => {
    const val = parseFloat(p || "0");
    if (val >= 0.8) return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
    if (val >= 0.6) return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
    if (val >= 0.4) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400";
    return "text-muted-foreground bg-muted";
  };

  return (
    <>
      <SEOHead
        title="Sitemap | Kluje"
        description="Browse the complete sitemap for Kluje. Find all pages, service categories, blog posts, and more."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sitemap</h1>
              <p className="text-muted-foreground mt-1">
                {urls.length} pages indexed&nbsp;·&nbsp;
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  View XML
                </a>
              </p>
            </div>
          </div>

          {loading && <LoadingSpinner />}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && (
            <div className="space-y-10">
          <section className="mb-8 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">ZIP Explorer discovery</h2>
            <p className="text-sm text-muted-foreground mt-1">Start from the ZIP Explorer hub, then navigate to individual ZIP pages.</p>
            <div className="mt-2 flex gap-4 text-sm">
              <Link to="/zip-explorer" className="underline">ZIP Explorer hub</Link>
              <Link to="/zip/90210" className="underline">Sample ZIP page</Link>
            </div>
          </section>

              {groupUrls(urls).map(([group, items]) => (
                <section key={group}>
                  <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
                    {group} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="py-2 pr-4">URL</th>
                          <th className="py-2 pr-4 hidden sm:table-cell">Last Modified</th>
                          <th className="py-2 pr-4 hidden md:table-cell">Frequency</th>
                          <th className="py-2">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((u) => {
                          const path = new URL(u.loc).pathname;
                          return (
                            <tr key={u.loc} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                              <td className="py-2.5 pr-4">
                                <Link to={path} className="text-primary hover:underline flex items-center gap-1.5">
                                  {path}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </Link>
                              </td>
                              <td className="py-2.5 pr-4 text-muted-foreground hidden sm:table-cell">
                                {u.lastmod || "—"}
                              </td>
                              <td className="py-2.5 pr-4 text-muted-foreground capitalize hidden md:table-cell">
                                {u.changefreq || "—"}
                              </td>
                              <td className="py-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(u.priority)}`}>
                                  {u.priority || "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
