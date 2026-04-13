/**
 * CleanScope — Quantitative Pricing Engine
 *
 * Produces three pricing outputs for any building:
 *   1. Monthly Recurring Contract
 *   2. Per-Visit Price
 *   3. One-Time Initial / Deep Clean
 *
 * Model inputs:
 *   - Total sq ft per area type
 *   - Floor type multipliers (carpet → VCT → marble)
 *   - Traffic level adjustments
 *   - Restroom fixture count
 *   - Frequency of service
 *   - Building type surcharges (medical, food service, post-construction)
 *   - Regional labor rate (state-based)
 *   - Custom margin %
 */

// ── Regional labor rates ($/hr) ─────────────────────────────────────────────
export const LABOR_RATE_BY_STATE: Record<string, number> = {
  AK: 22, AZ: 14, CA: 23, CO: 18, CT: 20, FL: 15, GA: 14,
  HI: 24, IL: 17, MA: 20, MD: 19, MI: 15, MN: 16, NJ: 21,
  NV: 15, NY: 22, OH: 14, OR: 17, PA: 16, SC: 13, TN: 13,
  TX: 14, UT: 15, VA: 17, WA: 21, WI: 15, DEFAULT: 15,
};

// ── Floor type multipliers ───────────────────────────────────────────────────
export const FLOOR_MULT: Record<string, number> = {
  Carpet: 1.00, 'VCT / Vinyl': 1.05, Hardwood: 1.15,
  'Tile / Grout': 1.35, 'Marble / Stone': 1.50,
  'Epoxy / Sealed Concrete': 0.90, Mixed: 1.20,
};

// ── Traffic level surcharges ─────────────────────────────────────────────────
export const TRAFFIC_SURCHARGE: Record<string, number> = {
  Low: 0.00, Moderate: 0.10, High: 0.20, Heavy: 0.35,
};

// ── Building type surcharges ─────────────────────────────────────────────────
export const BUILDING_SURCHARGE: Record<string, number> = {
  'Office Building': 0, 'Retail Store': 0.05,
  'Restaurant / Food Service': 0.18, 'Medical / Healthcare': 0.28,
  'School / Educational': 0.10, 'Warehouse / Industrial': -0.10,
  'Apartment Complex': 0.05, 'Single-Family Home': -0.05,
  'Condo / HOA Common Areas': 0.05, 'Government / Municipal': 0.08,
  'Hotel / Hospitality': 0.15, 'Gym / Fitness Center': 0.12,
  'Church / Place of Worship': -0.05, 'Auto Dealership': 0.08,
  'Post-Construction': 0.45, DEFAULT: 0,
};

// ── Cleaning speed (sq ft / hr, standard conditions) ────────────────────────
const CLEANING_SPEED_SQFT_PER_HOUR = 2200;

// ── Visits per month by frequency ───────────────────────────────────────────
export const VISITS_PER_MONTH: Record<string, number> = {
  'Daily (5x/week)': 22, 'Daily (7x/week)': 30, '3x / week': 13,
  'Twice a week': 9, Weekly: 4, 'Bi-Weekly': 2, Monthly: 1, 'One-Time': 1,
};

export interface AreaInput {
  id: string;
  name: string;
  sqft: number;
  floorType: string;
  trafficLevel: string;
  restroomCount: number;
  fixturesPerRestroom: number;
  notes: string;
}

export interface PricingInput {
  areas: AreaInput[];
  buildingType: string;
  frequency: string;
  stateAbbr: string;
  marginPct: number;
  /** Override hourly rate (0 = use regional default) */
  laborRateOverride: number;
}

export interface AreaResult {
  areaId: string;
  areaName: string;
  sqft: number;
  hoursPerVisit: number;
  laborCostPerVisit: number;
  suppliesCostPerVisit: number;
  totalCostPerVisit: number;
  pricePerVisit: number;
}

export interface PricingResult {
  areas: AreaResult[];
  visitsPerMonth: number;
  /** Per-visit price (all areas combined) */
  perVisitPrice: number;
  /** Monthly recurring contract */
  monthlyPrice: number;
  /** Initial deep clean (2.5× per-visit) */
  initialDeepCleanPrice: number;
  /** Annual contract value */
  annualValue: number;
  /** Labor hours per visit */
  totalHoursPerVisit: number;
  /** Total cost before margin */
  totalCostPerVisit: number;
  /** Margin amount */
  marginPerVisit: number;
  /** Effective margin % */
  effectiveMarginPct: number;
  /** Hourly rate used */
  laborRate: number;
  /** Building surcharge applied */
  buildingSurcharge: number;
}

export function calculatePricing(input: PricingInput): PricingResult {
  const laborRate =
    input.laborRateOverride > 0
      ? input.laborRateOverride
      : (LABOR_RATE_BY_STATE[input.stateAbbr?.toUpperCase()] ?? LABOR_RATE_BY_STATE.DEFAULT);

  const margin = Math.max(0, Math.min(0.70, input.marginPct / 100));
  const buildingSurcharge = BUILDING_SURCHARGE[input.buildingType] ?? 0;

  const areaResults: AreaResult[] = input.areas.map((area) => {
    const floorMult = FLOOR_MULT[area.floorType] ?? 1.0;
    const trafficMult = 1 + (TRAFFIC_SURCHARGE[area.trafficLevel] ?? 0.10);
    const cleanHours = (area.sqft / CLEANING_SPEED_SQFT_PER_HOUR) * floorMult * trafficMult;
    const restroomHours = area.restroomCount * area.fixturesPerRestroom * 0.083; // 5 min each
    const hoursPerVisit = cleanHours + restroomHours;

    const laborCostPerVisit = hoursPerVisit * laborRate;
    const suppliesCostPerVisit = area.sqft * 0.005;
    const baseCostPerVisit = (laborCostPerVisit + suppliesCostPerVisit) * (1 + buildingSurcharge);
    const pricePerVisit = baseCostPerVisit / (1 - margin);

    return {
      areaId: area.id,
      areaName: area.name,
      sqft: area.sqft,
      hoursPerVisit,
      laborCostPerVisit,
      suppliesCostPerVisit,
      totalCostPerVisit: baseCostPerVisit,
      pricePerVisit,
    };
  });

  const totalCostPerVisit = areaResults.reduce((s, a) => s + a.totalCostPerVisit, 0);
  const perVisitPrice = areaResults.reduce((s, a) => s + a.pricePerVisit, 0);
  const totalHoursPerVisit = areaResults.reduce((s, a) => s + a.hoursPerVisit, 0);
  const visitsPerMonth = VISITS_PER_MONTH[input.frequency] ?? 4;
  const monthlyPrice = perVisitPrice * visitsPerMonth;
  const initialDeepCleanPrice = perVisitPrice * 2.5;
  const annualValue = monthlyPrice * 12;
  const marginPerVisit = perVisitPrice - totalCostPerVisit;
  const effectiveMarginPct = perVisitPrice > 0
    ? Math.round((marginPerVisit / perVisitPrice) * 100)
    : 0;

  return {
    areas: areaResults,
    visitsPerMonth,
    perVisitPrice,
    monthlyPrice,
    initialDeepCleanPrice,
    annualValue,
    totalHoursPerVisit,
    totalCostPerVisit,
    marginPerVisit,
    effectiveMarginPct,
    laborRate,
    buildingSurcharge,
  };
}

export function generateProposalHtml(params: {
  companyName: string;
  clientName: string;
  siteAddress: string;
  pricing: PricingResult;
  buildingType: string;
  frequency: string;
  scope: string[];
  generatedDate?: string;
}): string {
  const { companyName, clientName, siteAddress, pricing, buildingType, frequency, scope, generatedDate } = params;
  const date = generatedDate ?? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Cleaning Proposal</title>
<style>
  body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;padding:40px;max-width:800px;margin:0 auto}
  h1{font-size:24px;color:#ff6b00}h2{font-size:14px;color:#ff6b00;margin-top:24px}
  .header{border-bottom:3px solid #ff6b00;padding-bottom:16px;margin-bottom:24px}
  .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0}
  .price-card{border:2px solid #ff6b00;border-radius:8px;padding:16px;text-align:center}
  .price-card.highlight{background:#fff3e8}
  .price-big{font-size:26px;font-weight:700;color:#ff6b00}
  table{width:100%;border-collapse:collapse;margin:12px 0}
  th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e5e7eb}
  th{background:#f3f4f6;font-size:11px;text-transform:uppercase}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280}
  .sig-block{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:48px}
  .sig-line{border-top:1px solid #6b7280;margin-top:56px;margin-bottom:6px;font-size:11px;color:#6b7280}
</style></head>
<body>
<div class="header">
  <div style="display:flex;justify-content:space-between;align-items:flex-end">
    <div><h1>${companyName}</h1><p style="margin:0;color:#6b7280">Professional Cleaning Services</p></div>
    <div style="text-align:right;font-size:12px;color:#6b7280">
      <div><strong>Proposal Date:</strong> ${date}</div>
      <div><strong>Valid for:</strong> 30 days</div>
    </div>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
  <div><h2>Prepared for</h2><p><strong>${clientName}</strong><br>${siteAddress}</p></div>
  <div><h2>Service Details</h2><p>Building type: ${buildingType}<br>Frequency: ${frequency}</p></div>
</div>
<h2>Pricing Options</h2>
<div class="pricing-grid">
  <div class="price-card highlight">
    <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px">Monthly Recurring</div>
    <div class="price-big">${fmt(pricing.monthlyPrice)}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:6px">${pricing.visitsPerMonth} visits × ${fmt(pricing.perVisitPrice)}</div>
  </div>
  <div class="price-card">
    <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px">Per Visit</div>
    <div class="price-big">${fmt(pricing.perVisitPrice)}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:6px">${pricing.totalHoursPerVisit.toFixed(1)} labor hours</div>
  </div>
  <div class="price-card">
    <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px">Initial Deep Clean</div>
    <div class="price-big">${fmt(pricing.initialDeepCleanPrice)}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:6px">First service (one-time)</div>
  </div>
</div>
<h2>Scope of Work</h2>
<ul>${scope.map(s => `<li>${s}</li>`).join('')}</ul>
<h2>Area Breakdown</h2>
<table>
  <thead><tr><th>Area</th><th>Sq Ft</th><th>Hours/Visit</th><th>Price/Visit</th></tr></thead>
  <tbody>${pricing.areas.map(a => `
  <tr><td>${a.areaName}</td><td>${a.sqft.toLocaleString()}</td>
  <td>${a.hoursPerVisit.toFixed(1)}</td><td>${fmt(a.pricePerVisit)}</td></tr>`).join('')}
  </tbody>
</table>
<h2>Terms &amp; Conditions</h2>
<p style="font-size:12px;color:#4b5563">
1. <strong>Cancellation:</strong> 30-day written notice required.<br>
2. <strong>Supplies:</strong> All cleaning products and equipment provided by contractor unless otherwise stated.<br>
3. <strong>Access:</strong> Client agrees to provide access during scheduled service hours.<br>
4. <strong>Payment:</strong> Invoiced monthly. Past due accounts subject to 1.5%/month late fee.<br>
5. <strong>Liability:</strong> Contractor carries $1M general liability and workers' compensation insurance.
</p>
<div class="sig-block">
  <div><div class="sig-line">Authorized Signature — ${companyName}</div>Date: _______________</div>
  <div><div class="sig-line">Client Signature — ${clientName}</div>Date: _______________</div>
</div>
<div class="footer">Generated by CleanScope AI · Powered by Kluje · ${date}</div>
</body></html>`;
}
