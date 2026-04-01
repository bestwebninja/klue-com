import { useQuery } from "@tanstack/react-query";
import { fetchCensusByZip } from "@/features/zip-explorer/adapters/census";
import { fetchAirNowByZip } from "@/features/zip-explorer/adapters/airnow";
import { fetchWalkScoreByZip } from "@/features/zip-explorer/adapters/walkscore";
import { fetchGreatSchoolsByZip } from "@/features/zip-explorer/adapters/greatschools";
import { fetchKlujeRiskByZip } from "@/features/zip-explorer/adapters/klujeRisk";
import { SOURCE_LABELS } from "@/features/zip-explorer/constants";
import { calculateDerivedScores } from "@/features/zip-explorer/scoring";
import type { ZipExplorerModel } from "@/features/zip-explorer/types";

const toNum = (val?: string) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

const buildModel = async (zipCode: string, includeOptional: boolean): Promise<ZipExplorerModel> => {
  const [census, air, walk, schools, risk] = await Promise.all([
    fetchCensusByZip(zipCode),
    includeOptional ? fetchAirNowByZip(zipCode) : Promise.resolve({ enabled: false, status: "unavailable" as const, data: null, reason: "Skipped" }),
    includeOptional ? fetchWalkScoreByZip(zipCode) : Promise.resolve({ enabled: false, status: "unavailable" as const, data: null, reason: "Skipped" }),
    includeOptional ? fetchGreatSchoolsByZip(zipCode) : Promise.resolve({ enabled: false, status: "unavailable" as const, data: null, reason: "Skipped" }),
    includeOptional ? fetchKlujeRiskByZip(zipCode) : Promise.resolve({ enabled: false, status: "unavailable" as const, data: null, reason: "Skipped" }),
  ]);

  const baseModel = {
    identity: {
      zipCode,
      zcta: census.data?.profile.zip ?? census.data?.detailed.zip,
      placeName: census.data?.profile.NAME?.replace(/\s*ZCTA5\s*\d+/, "").trim(),
    },
    demographics: {
      population: toNum(census.data?.profile.DP05_0001E),
      medianAge: toNum(census.data?.profile.DP05_0018E),
      medianHouseholdIncome: toNum(census.data?.profile.DP03_0062E),
      householdsWithChildrenRate: toNum(census.data?.profile.DP02_0012PE) ? (toNum(census.data?.profile.DP02_0012PE) ?? 0) / 100 : undefined,
      bachelorsOrHigherRate: toNum(census.data?.profile.DP02_0067PE) ? (toNum(census.data?.profile.DP02_0067PE) ?? 0) / 100 : undefined,
    },
    housing: {
      ownerOccupiedRate: toNum(census.data?.profile.DP04_0046E) ? (toNum(census.data?.profile.DP04_0046E) ?? 0) / 100 : undefined,
      medianGrossRent: toNum(census.data?.profile.DP04_0134E) ?? toNum(census.data?.detailed.B25064_001E),
      medianHomeValue: toNum(census.data?.detailed.B25077_001E),
      housingUnits: toNum(census.data?.detailed.B25001_001E),
    },
    affordability: {
      incomeToHomeValueRatio: toNum(census.data?.profile.DP03_0062E) && toNum(census.data?.detailed.B25077_001E)
        ? (toNum(census.data?.profile.DP03_0062E) ?? 0) / (toNum(census.data?.detailed.B25077_001E) ?? 1)
        : undefined,
      incomeToRentRatio: toNum(census.data?.profile.DP03_0062E) && (toNum(census.data?.profile.DP04_0134E) ?? toNum(census.data?.detailed.B25064_001E))
        ? (toNum(census.data?.profile.DP03_0062E) ?? 0) / ((toNum(census.data?.profile.DP04_0134E) ?? toNum(census.data?.detailed.B25064_001E) ?? 1) * 12)
        : undefined,
      rentBurdenRate: toNum(census.data?.detailed.B25070_007E) ? (toNum(census.data?.detailed.B25070_007E) ?? 0) / 100 : undefined,
    },
    airQuality: air.data ?? {},
    walkability: walk.data ?? {},
    schools: schools.data ?? {},
    klujeRisk: risk.data ?? {},
    sourceStatus: [
      { key: "census" as const, label: SOURCE_LABELS.census, status: census.status, reason: census.reason },
      { key: "airnow" as const, label: SOURCE_LABELS.airnow, status: air.status, reason: air.reason },
      { key: "walkscore" as const, label: SOURCE_LABELS.walkscore, status: walk.status, reason: walk.reason },
      { key: "greatschools" as const, label: SOURCE_LABELS.greatschools, status: schools.status, reason: schools.reason },
      { key: "klujeRisk" as const, label: SOURCE_LABELS.klujeRisk, status: risk.status, reason: risk.reason },
    ],
    hasAnyData: Boolean(census.data || air.data || walk.data || schools.data || risk.data),
    hasPartialData: [census.status, air.status, walk.status, schools.status, risk.status].some((s) => s !== "available"),
  };

  return { ...baseModel, derivedScores: calculateDerivedScores(baseModel) };
};

export const useZipExplorer = (zipCode: string, enabled = true, includeOptional = true) =>
  useQuery({
    queryKey: ["zip-explorer", zipCode],
    queryFn: () => buildModel(zipCode, includeOptional),
    enabled,
    staleTime: 1000 * 60 * 60 * 24 * 30,
    gcTime: 1000 * 60 * 60 * 24 * 30,
  });
