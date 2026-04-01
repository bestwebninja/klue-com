import { z } from "zod";

export const AREA_RISK_DEFAULTS = {
  minimumPopulation: 10000,
  minimumHouseholds: 4000,
  minimumSourceRecordCount: 100,
  maximumUniquenessRisk: 0.2,
  mosaicingWindowMs: 5 * 60 * 1000,
  adjacentCentroidRadiusDegrees: 0.03,
  maxAdjacentQueriesPerWindow: 6,
  cacheTtlMs: 10 * 60 * 1000,
} as const;

export type GeographyLevel = "tract" | "zip" | "county" | "city_cluster";

const geographyEscalationOrder: GeographyLevel[] = ["tract", "zip", "county", "city_cluster"];

export const AreaRiskRequestSchema = z.object({
  input: z.object({
    address: z.string().trim().min(3).optional(),
    lat: z.number().finite().optional(),
    lng: z.number().finite().optional(),
    tract: z.string().trim().min(1).optional(),
    zip: z.string().trim().regex(/^\d{5}$/).optional(),
    county: z.string().trim().min(1).optional(),
    cityCluster: z.string().trim().min(1).optional(),
  }),
  context: z.object({
    clientKey: z.string().trim().min(1).max(120).optional(),
  }).optional(),
  areaProfiles: z.object({
    tract: z.object({
      id: z.string(),
      name: z.string().optional(),
      centroid: z.object({ lat: z.number().finite(), lng: z.number().finite() }).optional(),
      population: z.number().nonnegative(),
      households: z.number().nonnegative(),
      sourceRecordCount: z.number().nonnegative(),
      uniquenessRisk: z.number().nonnegative(),
      features: z.object({
        weatherDisruption: z.number().min(0).max(100),
        permitVolatility: z.number().min(0).max(100),
        logisticsFriction: z.number().min(0).max(100),
        marketVolatility: z.number().min(0).max(100),
        safetyLossExposure: z.number().min(0).max(100),
        collectionsRiskProxy: z.number().min(0).max(100),
      }),
    }).optional(),
    zip: z.object({
      id: z.string(),
      name: z.string().optional(),
      centroid: z.object({ lat: z.number().finite(), lng: z.number().finite() }).optional(),
      population: z.number().nonnegative(),
      households: z.number().nonnegative(),
      sourceRecordCount: z.number().nonnegative(),
      uniquenessRisk: z.number().nonnegative(),
      features: z.object({
        weatherDisruption: z.number().min(0).max(100),
        permitVolatility: z.number().min(0).max(100),
        logisticsFriction: z.number().min(0).max(100),
        marketVolatility: z.number().min(0).max(100),
        safetyLossExposure: z.number().min(0).max(100),
        collectionsRiskProxy: z.number().min(0).max(100),
      }),
    }).optional(),
    county: z.object({
      id: z.string(),
      name: z.string().optional(),
      centroid: z.object({ lat: z.number().finite(), lng: z.number().finite() }).optional(),
      population: z.number().nonnegative(),
      households: z.number().nonnegative(),
      sourceRecordCount: z.number().nonnegative(),
      uniquenessRisk: z.number().nonnegative(),
      features: z.object({
        weatherDisruption: z.number().min(0).max(100),
        permitVolatility: z.number().min(0).max(100),
        logisticsFriction: z.number().min(0).max(100),
        marketVolatility: z.number().min(0).max(100),
        safetyLossExposure: z.number().min(0).max(100),
        collectionsRiskProxy: z.number().min(0).max(100),
      }),
    }).optional(),
    city_cluster: z.object({
      id: z.string(),
      name: z.string().optional(),
      centroid: z.object({ lat: z.number().finite(), lng: z.number().finite() }).optional(),
      population: z.number().nonnegative(),
      households: z.number().nonnegative(),
      sourceRecordCount: z.number().nonnegative(),
      uniquenessRisk: z.number().nonnegative(),
      features: z.object({
        weatherDisruption: z.number().min(0).max(100),
        permitVolatility: z.number().min(0).max(100),
        logisticsFriction: z.number().min(0).max(100),
        marketVolatility: z.number().min(0).max(100),
        safetyLossExposure: z.number().min(0).max(100),
        collectionsRiskProxy: z.number().min(0).max(100),
      }),
    }).optional(),
  }),
});

export type AreaRiskRequest = z.infer<typeof AreaRiskRequestSchema>;
type AreaProfile = NonNullable<AreaRiskRequest["areaProfiles"][GeographyLevel]>;

interface NormalizedLocation {
  level: GeographyLevel;
  key: string;
  centroid?: { lat: number; lng: number };
}

const queryLog = new Map<string, Array<{ at: number; key: string; centroid?: { lat: number; lng: number } }>>();
const areaCache = new Map<string, { expiresAt: number; response: AreaRiskResponse }>();

const withinRadius = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, radius: number) => {
  return Math.abs(a.lat - b.lat) <= radius && Math.abs(a.lng - b.lng) <= radius;
};

export const normalizeToSafeGeography = (request: AreaRiskRequest): NormalizedLocation => {
  const { input, areaProfiles } = request;

  if (input.cityCluster && areaProfiles.city_cluster) {
    return { level: "city_cluster", key: areaProfiles.city_cluster.id, centroid: areaProfiles.city_cluster.centroid };
  }
  if (input.county && areaProfiles.county) {
    return { level: "county", key: areaProfiles.county.id, centroid: areaProfiles.county.centroid };
  }
  if (input.zip && areaProfiles.zip) {
    return { level: "zip", key: areaProfiles.zip.id, centroid: areaProfiles.zip.centroid };
  }
  if (input.tract && areaProfiles.tract) {
    return { level: "tract", key: areaProfiles.tract.id, centroid: areaProfiles.tract.centroid };
  }
  if ((input.lat !== undefined && input.lng !== undefined) && areaProfiles.tract) {
    return { level: "tract", key: areaProfiles.tract.id, centroid: areaProfiles.tract.centroid };
  }

  const zipFromAddress = input.address?.match(/\b(\d{5})\b/)?.[1];
  if (zipFromAddress && areaProfiles.zip) {
    return { level: "zip", key: areaProfiles.zip.id, centroid: areaProfiles.zip.centroid };
  }

  if (areaProfiles.tract) return { level: "tract", key: areaProfiles.tract.id, centroid: areaProfiles.tract.centroid };
  if (areaProfiles.zip) return { level: "zip", key: areaProfiles.zip.id, centroid: areaProfiles.zip.centroid };
  if (areaProfiles.county) return { level: "county", key: areaProfiles.county.id, centroid: areaProfiles.county.centroid };
  return { level: "city_cluster", key: areaProfiles.city_cluster!.id, centroid: areaProfiles.city_cluster?.centroid };
};

const passesThresholds = (profile: AreaProfile) => {
  return (
    profile.population >= AREA_RISK_DEFAULTS.minimumPopulation &&
    profile.households >= AREA_RISK_DEFAULTS.minimumHouseholds &&
    profile.sourceRecordCount >= AREA_RISK_DEFAULTS.minimumSourceRecordCount &&
    profile.uniquenessRisk < AREA_RISK_DEFAULTS.maximumUniquenessRisk
  );
};

const pickSafeProfile = (startLevel: GeographyLevel, profiles: AreaRiskRequest["areaProfiles"]) => {
  const startIdx = geographyEscalationOrder.indexOf(startLevel);
  for (let i = Math.max(0, startIdx); i < geographyEscalationOrder.length; i += 1) {
    const level = geographyEscalationOrder[i];
    const profile = profiles[level];
    if (profile && passesThresholds(profile)) {
      return { level, profile };
    }
  }
  return null;
};

const weightedAreaRisk = (profile: AreaProfile) => {
  const features = profile.features;
  const score =
    features.weatherDisruption * 0.2 +
    features.permitVolatility * 0.15 +
    features.logisticsFriction * 0.2 +
    features.marketVolatility * 0.15 +
    features.safetyLossExposure * 0.2 +
    features.collectionsRiskProxy * 0.1;
  return Math.round(score * 10) / 10;
};

const riskBandFromScore = (score: number): "low" | "moderate" | "elevated" | "high" => {
  if (score >= 75) return "high";
  if (score >= 60) return "elevated";
  if (score >= 40) return "moderate";
  return "low";
};

const blockedByMosaicing = (clientKey: string, normalized: NormalizedLocation, now: number) => {
  const history = queryLog.get(clientKey) ?? [];
  const active = history.filter((item) => now - item.at <= AREA_RISK_DEFAULTS.mosaicingWindowMs);

  const repeatedNearby = active.some((item) => item.key === normalized.key);
  const nearbyCount = normalized.centroid
    ? active.filter((item) => item.centroid && withinRadius(item.centroid, normalized.centroid!, AREA_RISK_DEFAULTS.adjacentCentroidRadiusDegrees)).length
    : 0;

  queryLog.set(clientKey, [...active, { at: now, key: normalized.key, centroid: normalized.centroid }]);

  if (repeatedNearby) return "repeated_nearby_query_blocked";
  if (nearbyCount >= AREA_RISK_DEFAULTS.maxAdjacentQueriesPerWindow) return "adjacent_centroid_rate_limited";
  return null;
};

export interface AreaRiskResponse {
  status: "ok" | "suppressed" | "blocked";
  geography?: {
    output_level: GeographyLevel;
    geography_id: string;
    geography_name?: string;
  };
  area_risk?: {
    score: number;
    band: "low" | "moderate" | "elevated" | "high";
    features: {
      weather_disruption: number;
      permit_volatility: number;
      logistics_friction: number;
      market_volatility: number;
      safety_loss_exposure: number;
      collections_risk_proxy: number;
    };
  };
  compliance: {
    output_level: GeographyLevel | "suppressed";
    property_specific_inference: false;
    household_specific_inference: false;
  };
  suppression_reason?: string;
  block_reason?: string;
}

export const scoreAreaRisk = (request: AreaRiskRequest, now = Date.now()): AreaRiskResponse => {
  const normalized = normalizeToSafeGeography(request);
  const clientKey = request.context?.clientKey?.trim() || "anonymous";
  const cacheKey = `${clientKey}:${normalized.level}:${normalized.key}`;

  const mosaicingBlockReason = blockedByMosaicing(clientKey, normalized, now);
  if (mosaicingBlockReason) {
    return {
      status: "blocked",
      block_reason: mosaicingBlockReason,
      compliance: {
        output_level: "suppressed",
        property_specific_inference: false,
        household_specific_inference: false,
      },
    };
  }

  const cached = areaCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.response;
  }

  const safe = pickSafeProfile(normalized.level, request.areaProfiles);
  if (!safe) {
    return {
      status: "suppressed",
      suppression_reason: "minimum_thresholds_not_met",
      compliance: {
        output_level: "suppressed",
        property_specific_inference: false,
        household_specific_inference: false,
      },
    };
  }

  const score = weightedAreaRisk(safe.profile);
  const response: AreaRiskResponse = {
    status: "ok",
    geography: {
      output_level: safe.level,
      geography_id: safe.profile.id,
      geography_name: safe.profile.name,
    },
    area_risk: {
      score,
      band: riskBandFromScore(score),
      features: {
        weather_disruption: safe.profile.features.weatherDisruption,
        permit_volatility: safe.profile.features.permitVolatility,
        logistics_friction: safe.profile.features.logisticsFriction,
        market_volatility: safe.profile.features.marketVolatility,
        safety_loss_exposure: safe.profile.features.safetyLossExposure,
        collections_risk_proxy: safe.profile.features.collectionsRiskProxy,
      },
    },
    compliance: {
      output_level: safe.level,
      property_specific_inference: false,
      household_specific_inference: false,
    },
  };

  areaCache.set(cacheKey, { response, expiresAt: now + AREA_RISK_DEFAULTS.cacheTtlMs });
  return response;
};

export const __internal = {
  resetState: () => {
    queryLog.clear();
    areaCache.clear();
  },
};
