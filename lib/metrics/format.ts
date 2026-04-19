export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function hours(value: number): string {
  return `${value.toFixed(1)} Hours`;
}

export function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
