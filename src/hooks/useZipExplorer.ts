import { useQuery } from "@tanstack/react-query";
import { fetchCensusByZip } from "@/features/zip-explorer/adapters/census";
import type { SourceHealth, ZipExplorerModel } from "@/features/zip-explorer/types";
import { fetchAirNowByZip } from "@/features/zip-explorer/adapters/airnow";
import { fetchWalkScoreByZip } from "@/features/zip-explorer/adapters/walkscore";
import { fetchGreatSchoolsByZip } from "@/features/zip-explorer/adapters/greatschools";
import { fetchKlujeRiskByZip } from "@/features/zip-explorer/adapters/klujeRisk";
import { SOURCE_LABELS } from "@/features/zip-explorer/constants";
import { calculateDerivedScores } from "@/features/zip-explorer/scoring";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

const toNum = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const hasMeaningfulObjectData = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;

  return Object.values(value as Record<string, unknown>).some((entry) => {
    if (entry === null || entry === undefined || entry === "") return false;
    if (typeof entry === "object") {
      return hasMeaningfulObjectData(entry);
    }
    return true;
  });
};

const skippedSource = {
  enabled: false,
  status: "unavailable" as const,
  data: null,
  reason: "Skipped",
};

const buildModel = async (zipCode: string, includeOptional: boolean): Promise<ZipExplorerModel> => {
  const [census, air, walk, schools, risk] = await Promise.all([
    fetchCensusByZip(zipCode),
    includeOptional ? fetchAirNowByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchWalkScoreByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchGreatSchoolsByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchKlujeRiskByZip(zipCode) : Promise.resolve(skippedSource),
  ]);

  const profile = census.data?.profile;
  const detailed = census.data?.detailed;
  const censusStatus: SourceHealth = census.status === "available" ? "available" : "error";

  const medianIncome = toNum(profile?.DP03_0062E);
  const medianRent = toNum(profile?.DP04_0134E);

  const sourceStatus = [
    {
      key: "census" as const,
      label: SOURCE_LABELS.census,
      status: censusStatus,
      reason: census.reason,
    },
    {
      key: "airnow" as const,
      label: SOURCE_LABELS.airnow,
      status: air.status,
      reason: air.reason,
    },
    {
      key: "walkscore" as const,
      label: SOURCE_LABELS.walkscore,
      status: walk.status,
      reason: walk.reason,
    },
    {
      key: "greatschools" as const,
      label: SOURCE_LABELS.greatschools,
      status: schools.status,
      reason: schools.reason,
    },
    {
      key: "klujeRisk" as const,
      label: SOURCE_LABELS.klujeRisk,
      status: risk.status,
      reason: risk.reason,
    },
  ];

  const hasCensusData = hasMeaningfulObjectData(profile) || hasMeaningfulObjectData(detailed);
  const hasAnyData = hasCensusData || [air.data, walk.data, schools.data, risk.data].some(hasMeaningfulObjectData);
  const hasAnyErrors = sourceStatus.some((source) => source.status === "error");

  const baseModel = {
    identity: {
      zipCode,
      zcta: profile?.zip ?? detailed?.zip ?? zipCode,
      placeName: profile?.NAME ?? detailed?.NAME,
    },
    demographics: {
      population: toNum(profile?.DP05_0001E),
      medianAge: toNum(profile?.DP05_0018E),
      medianHouseholdIncome: medianIncome,
      householdsWithChildrenRate: toNum(profile?.DP02_0012PE),
      bachelorsOrHigherRate: toNum(profile?.DP02_0067PE),
    },
    housing: {
      ownerOccupiedRate: toNum(profile?.DP04_0046E),
      medianGrossRent: medianRent,
      medianHomeValue: toNum(detailed?.B25077_001E),
      housingUnits: toNum(detailed?.B25001_001E),
    },
    affordability: {
      incomeToHomeValueRatio:
        medianIncome && toNum(detailed?.B25077_001E)
          ? medianIncome / (toNum(detailed?.B25077_001E) ?? 1)
          : undefined,
      incomeToRentRatio: medianIncome && medianRent ? medianIncome / (medianRent * 12) : undefined,
      rentBurdenRate: toNum(detailed?.B25070_007E),
    },
    airQuality: air.data ?? {},
    walkability: walk.data ?? {},
    schools: schools.data ?? {},
    klujeRisk: risk.data ?? {},
    sourceStatus,
    hasAnyData,
    hasPartialData: sourceStatus.some((source) => source.status !== "available"),
    hasAnyErrors,
  };

  return {
    ...baseModel,
    derivedScores: calculateDerivedScores(baseModel),
  };
};

export const useZipExplorer = (zipCode: string, enabled = true, includeOptional = true) =>
  useQuery({
    queryKey: ["zip-explorer", zipCode, includeOptional],
    queryFn: () => buildModel(zipCode, includeOptional),
    enabled: enabled && Boolean(zipCode),
    staleTime: THIRTY_DAYS_MS,
    gcTime: THIRTY_DAYS_MS,
  });
