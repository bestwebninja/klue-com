/**
 * QuoteContext — platform-wide quote data store.
 *
 * The My Quotes form writes here; department components (Materials, Legals,
 * Cleaning, etc.) read from here to auto-populate their own forms.
 *
 * Persisted to sessionStorage so a page refresh within the session
 * doesn't lose the active quote.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ServiceType =
  | 'general_contractor'
  | 'subcontractor'
  | 'service_provider'
  | 'cleaning'
  | 'specialist'
  | '';

export interface QuoteLineItem {
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  total: number;
  category: 'labor' | 'materials' | 'equipment' | 'subcontract' | 'other';
}

export interface ActiveQuote {
  /** Internal quote ID (user-assigned or auto-generated) */
  quoteNo: string;
  /** Service provider type auto-populated from profile */
  serviceType: ServiceType;
  serviceTypeLabel: string;
  /** Contractor / provider name */
  providerName: string;
  /** Client details */
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCompany: string;
  /** Job site */
  siteAddress: string;
  siteCity: string;
  siteState: string;
  siteZip: string;
  /** Project details */
  projectType: string;
  scopeDescription: string;
  startDate: string;
  endDate: string;
  /** Trade-specific */
  tradeType: string;
  buildingType: string;
  squareFootage: string;
  /** Cost breakdown */
  lineItems: QuoteLineItem[];
  overheadPct: number;
  marginPct: number;
  /** Cleaning-specific (auto-propagates to CleaningDept) */
  cleaningFrequency: string;
  cleaningAreasSqft: string;
  cleaningSpecialRequirements: string;
  /** Validity / terms */
  validityDays: number;
  paymentTerms: string;
  notes: string;
  /** Computed (not stored) */
  subtotal: number;
  overheadAmt: number;
  marginAmt: number;
  totalAmount: number;
  /** Meta */
  savedAt: number | null;
}

const DEFAULT_QUOTE: ActiveQuote = {
  quoteNo: '', serviceType: '', serviceTypeLabel: '',
  providerName: '', clientName: '', clientPhone: '', clientEmail: '', clientCompany: '',
  siteAddress: '', siteCity: '', siteState: '', siteZip: '',
  projectType: '', scopeDescription: '', startDate: '', endDate: '',
  tradeType: '', buildingType: '', squareFootage: '',
  lineItems: [],
  overheadPct: 12, marginPct: 15,
  cleaningFrequency: '', cleaningAreasSqft: '', cleaningSpecialRequirements: '',
  validityDays: 30, paymentTerms: 'Net 30', notes: '',
  subtotal: 0, overheadAmt: 0, marginAmt: 0, totalAmount: 0,
  savedAt: null,
};

function computeTotals(q: ActiveQuote): ActiveQuote {
  const subtotal = q.lineItems.reduce((s, li) => s + (li.total || 0), 0);
  const overheadAmt = subtotal * (q.overheadPct / 100);
  const marginAmt = (subtotal + overheadAmt) * (q.marginPct / 100);
  const totalAmount = subtotal + overheadAmt + marginAmt;
  return { ...q, subtotal, overheadAmt, marginAmt, totalAmount };
}

interface QuoteContextValue {
  quote: ActiveQuote;
  setQuote: (update: Partial<ActiveQuote>) => void;
  resetQuote: () => void;
  /** Auto-generate a quote number like Q-2026-047 */
  generateQuoteNo: () => string;
}

const QuoteContext = createContext<QuoteContextValue>({
  quote: DEFAULT_QUOTE,
  setQuote: () => {},
  resetQuote: () => {},
  generateQuoteNo: () => '',
});

const SESSION_KEY = 'kluje_active_quote';

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuoteState] = useState<ActiveQuote>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? { ...DEFAULT_QUOTE, ...JSON.parse(saved) } : DEFAULT_QUOTE;
    } catch {
      return DEFAULT_QUOTE;
    }
  });

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(quote));
    } catch { /* ignore storage errors */ }
  }, [quote]);

  const setQuote = (update: Partial<ActiveQuote>) => {
    setQuoteState((prev) => computeTotals({ ...prev, ...update, savedAt: Date.now() }));
  };

  const resetQuote = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setQuoteState(DEFAULT_QUOTE);
  };

  const generateQuoteNo = () => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `Q-${year}-${seq}`;
  };

  return (
    <QuoteContext.Provider value={{ quote, setQuote, resetQuote, generateQuoteNo }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  return useContext(QuoteContext);
}
