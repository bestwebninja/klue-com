import type {
  LeadIntakeMissingInformation,
  LeadIntakeRequest,
  ScopeDetails,
} from "@kluje/shared";

export type LeadIntakeEnrichmentResult = {
  normalizedCategory: string;
  normalizedLocation: string;
  scope: ScopeDetails | undefined;
  missingInformation: LeadIntakeMissingInformation[];
  intakeScore: number;
  enrichmentNotes: string[];
};

const canonicalCategoryMap: Record<string, string> = {
  plumber: "plumbing",
  plumbing: "plumbing",
  electrician: "electrical",
  electrical: "electrical",
  hvac: "hvac",
  "heating and cooling": "hvac",
};

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const normalizeCategory = (serviceCategory: string): string => {
  const normalized = serviceCategory.trim().toLowerCase();
  return canonicalCategoryMap[normalized] ?? normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

export const normalizeLocation = (location: string): string =>
  toTitleCase(location.trim().replace(/\s*,\s*/g, ", "));

export const detectMissingInformation = (request: LeadIntakeRequest): LeadIntakeMissingInformation[] => {
  const missing: LeadIntakeMissingInformation[] = [];

  if (!request.contactPhone) {
    missing.push({
      code: "missing_contact_phone",
      message: "Add a callback phone number for faster provider confirmation.",
      severity: "medium",
    });
  }

  if (!request.scope?.summary?.trim()) {
    missing.push({
      code: "missing_scope_summary",
      message: "Add a scope summary to improve matching quality.",
      severity: "high",
    });
  }

  if (!request.timeline) {
    missing.push({
      code: "missing_timeline",
      message: "Add an expected timeline so routing can prioritize urgency.",
      severity: "medium",
    });
  }

  if (!request.budgetMin && !request.budgetMax) {
    missing.push({
      code: "missing_budget",
      message: "Budget guidance is missing. Add a budget range to improve fit.",
      severity: "low",
    });
  }

  return missing;
};

export const scoreIntake = (
  request: LeadIntakeRequest,
  missingInformation: LeadIntakeMissingInformation[],
): number => {
  let score = Math.round(request.intentScore * 0.5);

  if (request.scope?.summary) score += 20;
  if (request.requirements?.length) score += 10;
  if (request.attachments?.length) score += 10;
  if (request.timeline) score += 5;
  if (request.budgetMin || request.budgetMax) score += 5;

  score -= missingInformation.length * 8;

  return Math.max(0, Math.min(100, score));
};

export const normalizeAndEnrichIntake = (
  request: LeadIntakeRequest,
): LeadIntakeEnrichmentResult => {
  const normalizedCategory = normalizeCategory(request.serviceCategory);
  const normalizedLocation = normalizeLocation(request.location);

  const scope = request.scope
    ? {
        ...request.scope,
        summary: request.scope.summary.trim(),
        deliverables: request.scope.deliverables?.map((item) => item.trim()).filter(Boolean),
        accessibilityNeeds: request.scope.accessibilityNeeds?.map((item) => item.trim()).filter(Boolean),
      }
    : undefined;

  const missingInformation = detectMissingInformation(request);
  const intakeScore = scoreIntake({ ...request, scope }, missingInformation);

  const enrichmentNotes = [
    "Category normalized with canonical mapping placeholder.",
    "Location normalized for routing-aware formatting.",
    "Intake score generated with deterministic placeholder hook.",
  ];

  return {
    normalizedCategory,
    normalizedLocation,
    scope,
    missingInformation,
    intakeScore,
    enrichmentNotes,
  };
};
