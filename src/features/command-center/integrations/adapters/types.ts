export interface WeatherAdapter { getForecast(zip: string): Promise<{ summary: string }>; }
export interface MapsAdapter { geocode(address: string): Promise<{ lat: number; lng: number }>; }
export interface RetailerAdapter { searchSku(query: string): Promise<Array<{ sku: string; price: number }>>; }
export interface FinanceAdapter { getRates(): Promise<{ apr: number }>; }
export interface InsuranceAdapter { getCoverage(jobId: string): Promise<{ eligible: boolean }>; }
export interface PropertyDataAdapter { lookup(address: string): Promise<{ yearBuilt: number }>; }
export interface EsignAdapter { createEnvelope(documentId: string): Promise<{ envelopeId: string }>; }
export interface BiometricsAdapter { latestSignal(): Promise<{ confidence: number }>; }
