import type { ZipExplorerModel } from "./types";

export const getHeroSummary = (model: ZipExplorerModel) =>
  `${model.identity.placeName || `ZIP ${model.identity.zipCode}`} ${model.derivedScores.profileLabel.toLowerCase()}, based on Census-first public signals.`;

export const getAffordabilitySummary = (model: ZipExplorerModel) =>
  `Affordability score ${model.derivedScores.affordabilityScore}/100. Median rent and income signals suggest this area may be ${model.derivedScores.affordabilityScore > 60 ? "more manageable" : "higher cost"} for many households.`;

export const getFamilyFitSummary = (model: ZipExplorerModel) =>
  `Family-fit score ${model.derivedScores.familyFitScore}/100 suggests this ZIP may be a fit for ${model.derivedScores.familyFitScore > 65 ? "family-focused" : "mixed-needs"} households.`;


export const getZipFaq = (zip: string) => [
  { q: `How accurate is ZIP ${zip} data?`, a: "We use Census ACS 2024 5-year ZIP tabulation data where available and label optional providers when unavailable." },
  { q: "Is this a guarantee of living costs or school outcomes?", a: "No. These are directional planning signals and should be combined with your own on-the-ground research." },
  { q: "Why do some sections show unavailable?", a: "Some providers need server-side proxy integration to protect API keys and comply with provider terms." },
];

export const getCtaCopy = (model: ZipExplorerModel) => {
  if (model.derivedScores.profileLabel === "Strong for families") {
    return { heading: "Family-ready projects in this ZIP", body: "Compare trusted pros for remodels, repairs, and ongoing home maintenance.", primary: "Browse family-home providers" };
  }
  if (model.derivedScores.profileLabel === "Better for renters") {
    return { heading: "Renter-focused support services", body: "Find move-in cleaning, handyman help, and fast repair services.", primary: "Find renter-friendly providers" };
  }
  return { heading: "Get matched to local providers", body: "Post your project and receive quotes from professionals working in this area.", primary: "Start your quote" };
};
