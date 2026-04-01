export const ZIP_REGEX = /^\d{5}$/;

export const SOURCE_LABELS = {
  census: "US Census ACS 2024 5-year",
  airnow: "AirNow",
  walkscore: "Walk Score",
  greatschools: "GreatSchools",
  klujeRisk: "Kluje Risk",
} as const;

export const CENSUS_DATASETS = {
  profile2024: "/data/2024/acs/acs5/profile",
  detailed2024: "/data/2024/acs/acs5",
} as const;

export const SAMPLE_ZIPS = ["90210", "10001", "30301", "60601", "77002"];
