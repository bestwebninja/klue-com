import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

type OptionalZipProviderKey = "airnow" | "walkscore" | "greatschools" | "klujeRisk";
type ProviderStatus = "available" | "unavailable" | "error";

interface AdapterProxyResponse {
  status: "ok" | "error";
  provider?: OptionalZipProviderKey;
  sourceStatus?: ProviderStatus;
  data?: Record<string, unknown> | null;
  message?: string;
}

const ZIP_REGEX = /^\d{5}$/;
const PROVIDERS: Record<OptionalZipProviderKey, { label: string; requiredSecrets: string[] }> = {
  airnow: {
    label: "AirNow",
    requiredSecrets: ["AIRNOW_API_BASE_URL", "AIRNOW_API_KEY"],
  },
  walkscore: {
    label: "Walk Score",
    requiredSecrets: ["WALKSCORE_API_BASE_URL", "WALKSCORE_API_KEY"],
  },
  greatschools: {
    label: "GreatSchools",
    requiredSecrets: ["GREATSCHOOLS_API_BASE_URL", "GREATSCHOOLS_API_KEY"],
  },
  klujeRisk: {
    label: "Kluje Risk",
    requiredSecrets: ["KLUJE_RISK_API_BASE_URL", "KLUJE_RISK_API_KEY"],
  },
};

const isProviderKey = (value: unknown): value is OptionalZipProviderKey =>
  typeof value === "string" && value in PROVIDERS;

const response = (payload: AdapterProxyResponse, status = 200) => withCorsJson(payload, status);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response({ status: "error", message: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    const provider = body?.provider;
    const zipCode = String(body?.zipCode ?? "").trim();

    if (!isProviderKey(provider)) {
      return response({ status: "error", message: "provider must be one of: airnow, walkscore, greatschools, klujeRisk" }, 400);
    }

    if (!ZIP_REGEX.test(zipCode)) {
      return response({ status: "error", message: "zipCode must be a valid 5-digit ZIP" }, 400);
    }

    const providerConfig = PROVIDERS[provider];
    const missingSecrets = providerConfig.requiredSecrets.filter((key) => !Deno.env.get(key));

    if (missingSecrets.length > 0) {
      return response({
        status: "ok",
        provider,
        sourceStatus: "unavailable",
        data: null,
        message: `${providerConfig.label} not configured on proxy (${missingSecrets.join(", ")})`,
      });
    }

    return response({
      status: "ok",
      provider,
      sourceStatus: "unavailable",
      data: null,
      message: `${providerConfig.label} proxy wiring is ready, but upstream mapping is not implemented yet`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adapter proxy request failed";
    return response({ status: "error", message }, 502);
  }
});
