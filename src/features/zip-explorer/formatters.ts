export const formatNumber = (value?: number, fallback = "—") =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-US") : fallback;

export const formatCurrency = (value?: number, fallback = "—") =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
    : fallback;

export const formatPercent = (value?: number, fallback = "—") =>
  typeof value === "number" && Number.isFinite(value) ? `${Math.round(value * 100)}%` : fallback;

export const clampScore = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};
