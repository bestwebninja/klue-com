import type { ZipExplorerModel } from "./types";

const site = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://kluje.com").replace(/\/$/, "");

export const buildZipTitle = (zip: string, placeName?: string) =>
  `${placeName || `ZIP ${zip}`} Cost, Demographics & Service Snapshot | Kluje`;

export const buildZipDescription = (zip: string, model?: ZipExplorerModel) =>
  `Explore ${zip} Census-backed demographics, affordability, and local service-planning insights${model ? ` (${model.derivedScores.profileLabel.toLowerCase()})` : ""}.`;

export const buildZipCanonicalUrl = (zip: string) => `${site}/zip/${zip}`;

export const buildZipBreadcrumbJsonLd = (zip: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: site },
    { "@type": "ListItem", position: 2, name: "ZIP Explorer", item: `${site}/zip-explorer` },
    { "@type": "ListItem", position: 3, name: `ZIP ${zip}`, item: `${site}/zip/${zip}` },
  ],
});

export const buildZipWebPageJsonLd = (zip: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `ZIP ${zip} Explorer`,
  url: `${site}/zip/${zip}`,
  description,
});

export const buildZipPlaceJsonLd = (zip: string, model: ZipExplorerModel) => ({
  "@context": "https://schema.org",
  "@type": "Place",
  name: model.identity.placeName || `ZIP ${zip}`,
  postalCode: zip,
  address: { "@type": "PostalAddress", postalCode: zip, addressCountry: "US" },
});
