export type QuoteLineItem = {
  code: string;
  label: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  included: boolean;
};

export type ProviderCredential = "licensed" | "bonded" | "insured" | "background_checked";

export type ProviderReviewsSummary = {
  providerId: string;
  reviewCount: number;
  averageRating: number;
  complaintRatePercent: number;
  onTimePercent: number;
  workmanshipPercent: number;
  lastReviewAt: string;
};

export type QuoteRecord = {
  id: string;
  leadId: string;
  providerId: string;
  providerName: string;
  currency: "USD";
  subtotal: number;
  tax: number;
  fees: number;
  discount: number;
  total: number;
  lineItems: QuoteLineItem[];
  credentials: ProviderCredential[];
  scopeCoverage: {
    permitsIncluded?: boolean;
    debrisRemovalIncluded?: boolean;
    warrantyMonths?: number;
    timelineDays?: number;
    materialsSpecified?: boolean;
  };
  createdAt: string;
};

export type LineItemDelta = {
  itemCode: string;
  label: string;
  quantityRange: { min: number; max: number };
  unitPriceRange: { min: number; max: number };
  spread: number;
  includedByProviders: string[];
  missingFromProviders: string[];
};

export type QuoteComparisonResult = {
  leadId: string;
  engineVersion: "quote-comparison-advisor-v1";
  generatedAt: string;
  totals: {
    min: number;
    max: number;
    median: number;
    normalized: Array<{
      quoteId: string;
      providerId: string;
      providerName: string;
      normalizedTotal: number;
      breakdown: {
        subtotal: number;
        tax: number;
        fees: number;
        discount: number;
      };
      explanation: string;
    }>;
  };
  lineItemComparison: LineItemDelta[];
  providerComparison: Array<{
    providerId: string;
    providerName: string;
    credentials: ProviderCredential[];
    reviewSummary: ProviderReviewsSummary | null;
    qualityScore: number;
    rationale: string;
  }>;
  followUpQuestions: string[];
  explainability: string[];
};

const fixedNow = () => "2026-04-02T00:00:00.000Z";

const quotes: QuoteRecord[] = [
  {
    id: "8f17fb95-e5f2-4f14-9f53-74c94a61f2a1",
    leadId: "11111111-1111-1111-1111-111111111111",
    providerId: "provider-alpha",
    providerName: "Alpha Roofing Co",
    currency: "USD",
    subtotal: 9800,
    tax: 588,
    fees: 125,
    discount: 300,
    total: 10213,
    lineItems: [
      { code: "tearoff", label: "Roof tear-off", quantity: 24, unitPrice: 85, unit: "sq", included: true },
      { code: "shingles", label: "Architectural shingles", quantity: 24, unitPrice: 230, unit: "sq", included: true },
      { code: "flashing", label: "Flashing replacement", quantity: 180, unitPrice: 7, unit: "lf", included: true }
    ],
    credentials: ["licensed", "insured"],
    scopeCoverage: {
      permitsIncluded: true,
      debrisRemovalIncluded: true,
      warrantyMonths: 72,
      timelineDays: 5,
      materialsSpecified: true
    },
    createdAt: "2026-03-30T15:10:00.000Z"
  },
  {
    id: "3e5749ca-cbf8-4c56-b6db-c85e23592383",
    leadId: "11111111-1111-1111-1111-111111111111",
    providerId: "provider-bravo",
    providerName: "Bravo Exteriors",
    currency: "USD",
    subtotal: 10150,
    tax: 609,
    fees: 0,
    discount: 0,
    total: 10759,
    lineItems: [
      { code: "tearoff", label: "Roof tear-off", quantity: 24, unitPrice: 92, unit: "sq", included: true },
      { code: "shingles", label: "Architectural shingles", quantity: 24, unitPrice: 240, unit: "sq", included: true },
      { code: "vents", label: "Roof vents", quantity: 6, unitPrice: 45, unit: "ea", included: true }
    ],
    credentials: ["licensed", "bonded", "insured", "background_checked"],
    scopeCoverage: {
      permitsIncluded: false,
      debrisRemovalIncluded: true,
      warrantyMonths: 120,
      timelineDays: 7,
      materialsSpecified: true
    },
    createdAt: "2026-03-31T09:20:00.000Z"
  }
];

const providerReviewSummaries: ProviderReviewsSummary[] = [
  {
    providerId: "provider-alpha",
    reviewCount: 124,
    averageRating: 4.6,
    complaintRatePercent: 2.4,
    onTimePercent: 91,
    workmanshipPercent: 93,
    lastReviewAt: "2026-03-20T00:00:00.000Z"
  },
  {
    providerId: "provider-bravo",
    reviewCount: 280,
    averageRating: 4.8,
    complaintRatePercent: 1.2,
    onTimePercent: 96,
    workmanshipPercent: 95,
    lastReviewAt: "2026-03-29T00:00:00.000Z"
  }
];

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const normalizeTotals = (inputQuotes: QuoteRecord[]) =>
  [...inputQuotes]
    .sort((a, b) => a.providerName.localeCompare(b.providerName))
    .map((quote) => {
      const normalizedTotal = roundMoney(quote.subtotal + quote.tax + quote.fees - quote.discount);
      return {
        quoteId: quote.id,
        providerId: quote.providerId,
        providerName: quote.providerName,
        normalizedTotal,
        breakdown: {
          subtotal: roundMoney(quote.subtotal),
          tax: roundMoney(quote.tax),
          fees: roundMoney(quote.fees),
          discount: roundMoney(quote.discount)
        },
        explanation: `normalized_total=subtotal+tax+fees-discount (${quote.subtotal}+${quote.tax}+${quote.fees}-${quote.discount})`
      };
    });

const percentileMedian = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return roundMoney((sorted[mid - 1] + sorted[mid]) / 2);
  return roundMoney(sorted[mid]);
};

const compareLineItems = (inputQuotes: QuoteRecord[]): LineItemDelta[] => {
  const lineItemIndex = new Map<string, { label: string; entries: Array<{ providerId: string; quantity: number; unitPrice: number; included: boolean }> }>();

  for (const quote of inputQuotes) {
    for (const item of quote.lineItems) {
      const bucket = lineItemIndex.get(item.code) ?? { label: item.label, entries: [] };
      bucket.entries.push({
        providerId: quote.providerId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        included: item.included
      });
      lineItemIndex.set(item.code, bucket);
    }
  }

  return [...lineItemIndex.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([itemCode, bucket]) => {
      const quantities = bucket.entries.map((entry) => entry.quantity);
      const unitPrices = bucket.entries.map((entry) => entry.unitPrice);
      const includedByProviders = bucket.entries.filter((entry) => entry.included).map((entry) => entry.providerId).sort();
      const missingFromProviders = inputQuotes
        .map((quote) => quote.providerId)
        .filter((providerId) => !includedByProviders.includes(providerId))
        .sort();

      return {
        itemCode,
        label: bucket.label,
        quantityRange: { min: Math.min(...quantities), max: Math.max(...quantities) },
        unitPriceRange: { min: roundMoney(Math.min(...unitPrices)), max: roundMoney(Math.max(...unitPrices)) },
        spread: roundMoney(Math.max(...unitPrices) - Math.min(...unitPrices)),
        includedByProviders,
        missingFromProviders
      };
    });
};

const compareProviders = (inputQuotes: QuoteRecord[]) =>
  [...inputQuotes]
    .sort((a, b) => a.providerName.localeCompare(b.providerName))
    .map((quote) => {
      const review = providerReviewSummaries.find((candidate) => candidate.providerId === quote.providerId) ?? null;
      const credentialsScore = quote.credentials.length * 10;
      const reviewScore = review ? review.averageRating * 15 + review.onTimePercent * 0.2 + review.workmanshipPercent * 0.2 - review.complaintRatePercent * 2 : 0;
      const qualityScore = roundMoney(credentialsScore + reviewScore);

      return {
        providerId: quote.providerId,
        providerName: quote.providerName,
        credentials: [...quote.credentials].sort(),
        reviewSummary: review,
        qualityScore,
        rationale: review
          ? `quality_score=credentials(${credentialsScore})+reviews(${roundMoney(reviewScore)})`
          : `quality_score=credentials(${credentialsScore})+reviews(0:missing_summary)`
      };
    });

const missingScopeQuestions = (inputQuotes: QuoteRecord[]) => {
  const questions: string[] = [];

  const permitsCoverage = inputQuotes.some((quote) => quote.scopeCoverage.permitsIncluded === true);
  if (!permitsCoverage) questions.push("Do any providers include permit handling in the base quote?");

  const hasDebrisCoverageGap = inputQuotes.some((quote) => quote.scopeCoverage.debrisRemovalIncluded !== true);
  if (hasDebrisCoverageGap) questions.push("Can each provider confirm whether debris haul-away is included?");

  const missingWarranty = inputQuotes.some((quote) => !quote.scopeCoverage.warrantyMonths || quote.scopeCoverage.warrantyMonths <= 0);
  if (missingWarranty) questions.push("Please provide explicit workmanship warranty duration in months.");

  const timelineSpread = Math.max(...inputQuotes.map((quote) => quote.scopeCoverage.timelineDays ?? 0)) - Math.min(...inputQuotes.map((quote) => quote.scopeCoverage.timelineDays ?? 0));
  if (timelineSpread >= 2) questions.push("What assumptions are driving the schedule difference across providers?");

  return questions;
};

export const listQuotesByLeadId = (leadId: string): QuoteRecord[] =>
  quotes
    .filter((quote) => quote.leadId === leadId)
    .sort((a, b) => a.providerName.localeCompare(b.providerName))
    .map((quote) => ({ ...quote, lineItems: [...quote.lineItems], credentials: [...quote.credentials] }));

export const compareQuotes = (leadId: string): QuoteComparisonResult | null => {
  const scopedQuotes = listQuotesByLeadId(leadId);
  if (scopedQuotes.length === 0) return null;

  const normalized = normalizeTotals(scopedQuotes);
  const normalizedTotals = normalized.map((entry) => entry.normalizedTotal);

  return {
    leadId,
    engineVersion: "quote-comparison-advisor-v1",
    generatedAt: fixedNow(),
    totals: {
      min: Math.min(...normalizedTotals),
      max: Math.max(...normalizedTotals),
      median: percentileMedian(normalizedTotals),
      normalized
    },
    lineItemComparison: compareLineItems(scopedQuotes),
    providerComparison: compareProviders(scopedQuotes),
    followUpQuestions: missingScopeQuestions(scopedQuotes),
    explainability: [
      "Totals are normalized using subtotal + tax + fees - discount.",
      "Line-item variance compares quantity and unit price ranges by item code.",
      "Provider quality score combines credential count and review summary metrics."
    ]
  };
};
