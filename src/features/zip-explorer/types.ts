export type SourceHealth = "available" | "unavailable" | "error";

export interface SourceStatus {
  key: "census" | "airnow" | "walkscore" | "greatschools" | "klujeRisk";
  label: string;
  status: SourceHealth;
  reason?: string;
  lastUpdated?: string;
}

export interface ZipIdentity {
  zipCode: string;
  zcta?: string;
  placeName?: string;
}

export interface Demographics {
  population?: number;
  medianAge?: number;
  medianHouseholdIncome?: number;
  householdsWithChildrenRate?: number;
  bachelorsOrHigherRate?: number;
}

export interface Housing {
  medianHomeValue?: number;
  medianGrossRent?: number;
  housingUnits?: number;
  ownerOccupiedRate?: number;
}

export interface Affordability {
  incomeToHomeValueRatio?: number;
  incomeToRentRatio?: number;
  rentBurdenRate?: number;
}

export interface AirQuality {
  aqi?: number;
  category?: string;
  summary?: string;
}

export interface Walkability {
  walkScore?: number;
  bikeScore?: number;
  transitScore?: number;
}

export interface Schools {
  averageRating?: number;
  schoolCount?: number;
  notes?: string;
}

export interface KlujeRisk {
  riskBand?: "low" | "moderate" | "elevated" | "high";
  riskScore?: number;
  notes?: string;
}

export interface DerivedScores {
  familyFitScore: number;
  affordabilityScore: number;
  renterFriendlinessScore: number;
  homeownerFriendlinessScore: number;
  overallZipSnapshotScore: number;
  profileLabel: string;
}

export interface ZipExplorerModel {
  identity: ZipIdentity;
  demographics: Demographics;
  housing: Housing;
  affordability: Affordability;
  airQuality: AirQuality;
  walkability: Walkability;
  schools: Schools;
  klujeRisk: KlujeRisk;
  derivedScores: DerivedScores;
  sourceStatus: SourceStatus[];
  hasAnyData: boolean;
  hasPartialData: boolean;
  hasAnyErrors: boolean;
}

export interface ProviderResponse<T> {
  enabled: boolean;
  status: SourceHealth;
  data: T | null;
  reason?: string;
}

export interface CensusProfileRow {
  NAME?: string;
  DP05_0001E?: string;
  DP03_0062E?: string;
  DP04_0046E?: string;
  DP04_0134E?: string;
  DP05_0018E?: string;
  DP02_0067PE?: string;
  DP02_0012PE?: string;
  zip?: string;
}

export interface CensusDetailedRow {
  B25077_001E?: string;
  B25064_001E?: string;
  B25001_001E?: string;
  B25070_007E?: string;
  zip?: string;
}
