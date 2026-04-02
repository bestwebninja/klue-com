import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";
import type { ProviderRecord, ProviderRoutingCandidate } from "./types";

export type ProviderSearchInput = {
  tenantId: string;
  serviceCategory: string;
  budget: number | null;
  zipCode: string | null;
  intent: "urgent_service" | "planned_project" | "quote_only";
  topN: number;
};

const inMemoryProviders: ProviderRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    tenantId: "00000000-0000-4000-8000-000000000000",
    externalRef: "provider-alpha",
    legalName: "Alpha Mechanical LLC",
    displayName: "Alpha Mechanical",
    status: "active",
    endpointUrl: "https://example-provider-alpha.invalid/quotes",
    rankingWeight: 0.9,
    capabilities: [
      {
        providerId: "11111111-1111-4111-8111-111111111111",
        serviceCategory: "hvac",
        minBudget: 100,
        maxBudget: 20000,
        coverageZipPrefixes: ["90", "91", "92"],
        slaHours: 2,
        active: true
      }
    ]
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    tenantId: "00000000-0000-4000-8000-000000000000",
    externalRef: "provider-bravo",
    legalName: "Bravo Electrical Inc.",
    displayName: "Bravo Electrical",
    status: "active",
    endpointUrl: "https://example-provider-bravo.invalid/quotes",
    rankingWeight: 0.8,
    capabilities: [
      {
        providerId: "22222222-2222-4222-8222-222222222222",
        serviceCategory: "electrical",
        minBudget: 250,
        maxBudget: 30000,
        coverageZipPrefixes: ["10", "11", "12", "90"],
        slaHours: 4,
        active: true
      }
    ]
  }
];

const fetchProviders = async (tenantId: string): Promise<ProviderRecord[]> => {
  if (!hasSupabaseAdmin || !supabaseAdmin) {
    return inMemoryProviders.filter((provider) => provider.tenantId === tenantId);
  }

  const { data, error } = await supabaseAdmin
    .from("providers")
    .select(
      `id, tenant_id, external_ref, legal_name, display_name, status, endpoint_url, ranking_weight,
       provider_capabilities(provider_id, service_category, min_budget, max_budget, coverage_zip_prefixes, sla_hours, active)`
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (error) {
    console.warn(`[provider-routing] provider fetch failed: ${error.message}`);
    return inMemoryProviders.filter((provider) => provider.tenantId === tenantId);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    externalRef: row.external_ref,
    legalName: row.legal_name,
    displayName: row.display_name,
    status: row.status,
    endpointUrl: row.endpoint_url,
    rankingWeight: Number(row.ranking_weight ?? 1),
    capabilities: (row.provider_capabilities ?? []).map((capability: Record<string, unknown>) => ({
      providerId: String(capability.provider_id),
      serviceCategory: String(capability.service_category),
      minBudget: capability.min_budget === null ? null : Number(capability.min_budget),
      maxBudget: capability.max_budget === null ? null : Number(capability.max_budget),
      coverageZipPrefixes: Array.isArray(capability.coverage_zip_prefixes)
        ? capability.coverage_zip_prefixes.map((value) => String(value))
        : [],
      slaHours: capability.sla_hours === null ? null : Number(capability.sla_hours),
      active: Boolean(capability.active)
    }))
  }));
};

export const applyHardConstraintFiltering = (providers: ProviderRecord[], input: ProviderSearchInput) => {
  return providers
    .map((provider) => {
      const matchingCapability = provider.capabilities.find(
        (capability) => capability.active && capability.serviceCategory.toLowerCase() === input.serviceCategory.toLowerCase()
      );

      if (!matchingCapability) {
        return { provider, allowed: false, reasons: ["service_category_mismatch"] };
      }

      if (input.budget !== null && matchingCapability.minBudget !== null && input.budget < matchingCapability.minBudget) {
        return { provider, allowed: false, reasons: ["budget_below_minimum"] };
      }

      if (input.budget !== null && matchingCapability.maxBudget !== null && input.budget > matchingCapability.maxBudget) {
        return { provider, allowed: false, reasons: ["budget_above_maximum"] };
      }

      if (
        input.zipCode &&
        matchingCapability.coverageZipPrefixes.length > 0 &&
        !matchingCapability.coverageZipPrefixes.some((prefix) => input.zipCode?.startsWith(prefix))
      ) {
        return { provider, allowed: false, reasons: ["outside_coverage"] };
      }

      return { provider, allowed: true, reasons: ["hard_constraints_passed"], capability: matchingCapability };
    })
    .filter((candidate) => candidate.allowed);
};

export const computeRankScore = (
  rankingWeight: number,
  capabilitySlaHours: number | null,
  intent: ProviderSearchInput["intent"]
) => {
  const normalizedWeight = Math.max(0, Math.min(1, rankingWeight));
  const slaScore = capabilitySlaHours === null ? 0.4 : Math.max(0, 1 - capabilitySlaHours / 24);
  const intentBoost = intent === "urgent_service" ? 0.2 : intent === "quote_only" ? 0.05 : 0.1;

  return Number((normalizedWeight * 0.55 + slaScore * 0.35 + intentBoost).toFixed(4));
};

export const rankAndSelectTopN = (
  filtered: Array<ReturnType<typeof applyHardConstraintFiltering>[number]>,
  topN: number,
  intent: ProviderSearchInput["intent"]
): ProviderRoutingCandidate[] => {
  return filtered
    .map(({ provider, reasons, capability }) => {
      const score = computeRankScore(provider.rankingWeight, capability?.slaHours ?? null, intent);
      return {
        providerId: provider.id,
        displayName: provider.displayName,
        endpointUrl: provider.endpointUrl,
        score,
        reasoning: [...reasons, `ranking_weight=${provider.rankingWeight}`, `sla_hours=${capability?.slaHours ?? "n/a"}`]
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
};

export const searchProviders = async (input: ProviderSearchInput) => {
  const providers = await fetchProviders(input.tenantId);
  const filtered = applyHardConstraintFiltering(providers, input);
  const selected = rankAndSelectTopN(filtered, input.topN, input.intent);

  return {
    totalProviders: providers.length,
    filteredCount: filtered.length,
    selected
  };
};
