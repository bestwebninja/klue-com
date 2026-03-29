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

export async function login(input: { email: string; password: string }): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json() as Promise<LoginResponse>;
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
