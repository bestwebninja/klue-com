const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000/api/v1";

export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    email: string;
    role: "admin" | "user";
  };
};

export type AuthenticatedUser = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

export async function login(input: { email: string; password: string }): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
    throw new Error(payload?.message ?? payload?.error ?? "Invalid email or password");
  }

  return response.json() as Promise<LoginResponse>;
}

export async function fetchAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to verify authenticated user");
  }

  const payload = (await response.json()) as { user: AuthenticatedUser };
  return payload.user;
}

export type BillingSubscription = {
  tenantId: string;
  planTier: string;
  billingStatus: string;
  currentPeriodEnd: string;
  latestPaymentStatus?: string;
};

export async function fetchBillingSubscription(tenantId: string): Promise<BillingSubscription | null> {
  const response = await fetch(`${API_BASE}/billing/subscriptions/${tenantId}`, {
    headers: {
      Authorization: "Bearer dev-token",
      "x-tenant-id": tenantId
    }
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch billing subscription");

  return response.json() as Promise<BillingSubscription>;
}

export type PlacementRecommendation = {
  id: string;
  name: string;
  type: string;
  aiScore: number;
  projectedCtr: number;
  status: string;
};

export async function fetchPlacementRecommendations(input: {
  vertical: string;
  dailyBudget: number;
  targetGeos: string[];
}): Promise<PlacementRecommendation[]> {
  const response = await fetch(`${API_BASE}/ads/placements/recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer dev-token",
      "x-tenant-id": "tenant-demo"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("Failed to fetch placement recommendations");
  const payload = (await response.json()) as { data: PlacementRecommendation[] };
  return payload.data;
}

export type GeoIntelligencePayload = {
  zipCode: string;
  weather: Record<string, unknown>;
  crime: Record<string, unknown>;
  refreshedAt: string;
  cacheStatus: "hit" | "miss";
};

export async function fetchGeoIntelligence(zipCode: string): Promise<GeoIntelligencePayload> {
  const response = await fetch(`${API_BASE}/geo-intelligence?zipCode=${encodeURIComponent(zipCode)}`);
  if (!response.ok) throw new Error("Failed to load geo intelligence");
  return response.json() as Promise<GeoIntelligencePayload>;
}

export type ContractorQuoteIntakeInput = {
  clientName: string;
  projectAddress: string;
  zipCode: string;
  phone: string;
  email: string;
  builder: string;
  projectDate: string;
  realtorContact: string;
  attorneyEmail: string;
  selectedSupplier: string;
  selectedMaterials: string[];
  sections: Record<string, { checked: boolean; note: string }>;
  textFields: Record<string, string>;
  weatherSummary: string;
  workflowFlags: {
    requestFinanceNow: boolean;
    notifyRealtor: boolean;
    generateEsignAfterAcceptance: boolean;
  };
};

export type ContractorQuoteIntakeResponse = {
  quoteIntakeId: string;
  status: string;
  createdAt: string;
};

export async function createContractorQuoteIntake(input: ContractorQuoteIntakeInput): Promise<ContractorQuoteIntakeResponse> {
  const response = await fetch(`${API_BASE}/quote-intake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer dev-token"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("Failed to create quote intake");
  return response.json() as Promise<ContractorQuoteIntakeResponse>;
}

export async function fetchContractorCostPreview(input: {
  supplier: string;
  zipCode: string;
  selectedMaterials: string[];
  projectScope: string;
}): Promise<{ supplier: string; totalLow: number; totalHigh: number }> {
  const response = await fetch(`${API_BASE}/quote-intake/cost-preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("Failed to get cost preview");
  return response.json() as Promise<{ supplier: string; totalLow: number; totalHigh: number }>;
}
