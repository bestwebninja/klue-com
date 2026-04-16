export type Area = {
  id: string;
  name: string;
  sqft: number;
  ratePerHourSqFt: number;
  fixtureMinutes: number;
  complexityMultiplier: number;
};

export type ScopeRow = {
  id: string;
  task: string;
  frequency: string;
  notes?: string;
};

export type SettingsState = {
  laborRate: number;
  otherDirect: number;
  suppliesPercent: number;
  overheadPercent: number;
  profitPercent: number;
};

export type ResultState = {
  summary: {
    cleanableSqFt: number;
    frequencyPerWeek: number;
    visitsPerMonth: number;
    monthlyRecurring: number;
    perVisit: number;
    oneTime: number;
    perSqFtRate: number;
    locationNote: string;
  };
  areas: Array<Area & { estimatedHoursPerVisit: number }>;
  scope: ScopeRow[];
  pricing: {
    laborRate: number;
    hoursPerVisit: number;
    directSubtotal: number;
    overheadPercent: number;
    overheadAmount: number;
    profitPercent: number;
    profitAmount: number;
    totalPerVisit: number;
    monthlyTotal: number;
    oneTimeTotal: number;
    lineItems: Array<{ item: string; amount: number; note?: string }>;
    historicalComparison: string;
  };
  internalHandoff: {
    staffingEstimate: string;
    keyNotes: string[];
    complianceFlags: string[];
  };
};
