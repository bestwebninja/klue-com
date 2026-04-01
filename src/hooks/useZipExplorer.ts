import { useQuery } from '@tanstack/react-query';
import { buildAcs2024ProfileUrl, fetchJsonRows } from '@/features/zip-explorer/api';
import type { SourceHealth } from '@/features/zip-explorer/types';
import { fetchAirNowByZip } from '@/features/zip-explorer/adapters/airnow';
import { fetchWalkScoreByZip } from '@/features/zip-explorer/adapters/walkscore';
import { fetchGreatSchoolsByZip } from '@/features/zip-explorer/adapters/greatschools';
import { fetchKlujeRiskByZip } from '@/features/zip-explorer/adapters/klujeRisk';
import { SOURCE_LABELS } from '@/features/zip-explorer/constants';
import { calculateDerivedScores } from '@/features/zip-explorer/scoring';
import type { ZipExplorerModel } from '@/features/zip-explorer/types';

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

const toNum = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const skippedSource = {
  enabled: false,
  status: 'unavailable' as const,
  data: null,
  reason: 'Skipped',
};

const buildModel = async (
  zipCode: string,
  includeOptional: boolean,
): Promise<ZipExplorerModel> => {
  const [census, air, walk, schools, risk] = await Promise.all([
    fetchZipProfileViaProxy(zipCode),
    includeOptional ? fetchAirNowByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchWalkScoreByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchGreatSchoolsByZip(zipCode) : Promise.resolve(skippedSource),
    includeOptional ? fetchKlujeRiskByZip(zipCode) : Promise.resolve(skippedSource),
  ]);

  const censusData = census?.data ?? null;

  const censusStatus =
    census.status === 'ok'
      ? 'available'
      : census.status === 'disabled'
        ? 'unavailable'
        : 'error';

  const baseModel = {
    identity: {
      zipCode,
      zcta: zipCode,
      placeName: censusData?.name ?? undefined,
    },
    demographics: {
      population: toNum(censusData?.population),
      medianAge: undefined,
      medianHouseholdIncome: toNum(censusData?.medianIncome),
      householdsWithChildrenRate: undefined,
      bachelorsOrHigherRate: undefined,
    },
    housing: {
      ownerOccupiedRate: undefined,
      ownerOccupiedUnits: toNum(censusData?.ownerOccupiedUnits),
      medianGrossRent: toNum(censusData?.medianRent),
      medianHomeValue: undefined,
      housingUnits: undefined,
    },
    affordability: {
      incomeToHomeValueRatio: undefined,
      incomeToRentRatio:
        toNum(censusData?.medianIncome) && toNum(censusData?.medianRent)
          ? (toNum(censusData?.medianIncome) ?? 0) /
            ((toNum(censusData?.medianRent) ?? 1) * 12)
          : undefined,
      rentBurdenRate: undefined,
    },
    airQuality: air.data ?? {},
    walkability: walk.data ?? {},
    schools: schools.data ?? {},
    klujeRisk: risk.data ?? {},
    sourceStatus: [
      {
        key: 'census' as const,
        label: SOURCE_LABELS.census,
        status: censusStatus,
        reason: census.message,
      },
      {
        key: 'airnow' as const,
        label: SOURCE_LABELS.airnow,
        status: air.status,
        reason: air.reason,
      },
      {
        key: 'walkscore' as const,
        label: SOURCE_LABELS.walkscore,
        status: walk.status,
        reason: walk.reason,
      },
      {
        key: 'greatschools' as const,
        label: SOURCE_LABELS.greatschools,
        status: schools.status,
        reason: schools.reason,
      },
      {
        key: 'klujeRisk' as const,
        label: SOURCE_LABELS.klujeRisk,
        status: risk.status,
        reason: risk.reason,
      },
    ],
    hasAnyData: Boolean(censusData || air.data || walk.data || schools.data || risk.data),
    hasPartialData: [censusStatus, air.status, walk.status, schools.status, risk.status].some(
      (s) => s !== 'available',
    ),
  };

  return {
    ...baseModel,
    derivedScores: calculateDerivedScores(baseModel),
  };
};

export const useZipExplorer = (
  zipCode: string,
  enabled = true,
  includeOptional = true,
) =>
  useQuery({
    queryKey: ['zip-explorer', zipCode, includeOptional],
    queryFn: () => buildModel(zipCode, includeOptional),
    enabled: enabled && Boolean(zipCode),
    staleTime: THIRTY_DAYS_MS,
    gcTime: THIRTY_DAYS_MS,
  });
