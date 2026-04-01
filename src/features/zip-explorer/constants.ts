export const ZIP_REGEX = /^\d{5}$/;

export const SOURCE_LABELS = {
  census: "US Census ACS 2024",
  airnow: "AirNow",
  walkscore: "Walk Score",
  greatschools: "GreatSchools",
  klujeRisk: "Kluje Risk",
} as const;

export const DEFAULT_MODEL_SCORES = {
  familyFit: 0,
  affordability: 0,
  livability: 0,
};

export const CENSUS_DATASETS = {
  profile2024: "/data/2024/acs/acs5/profile",
  detailed2024: "/data/2024/acs/acs5",
} as const;

export const ZIP_FAQ_COPY = [
  {
    q: "How does Kluje build ZIP insights?",
    a: "We prioritize U.S. Census ACS ZIP Code Tabulation Area data and layer optional third-party signals when configured.",
  },
  {
    q: "Why can some sections be unavailable?",
    a: "Some providers require browser-safe API access or server proxies. When not configured, we clearly mark sections as unavailable.",
  },
];
