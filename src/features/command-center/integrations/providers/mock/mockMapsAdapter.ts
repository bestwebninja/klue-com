import type { MapsAdapter } from "../../adapters/types";
export const mockMapsAdapter: MapsAdapter = { async geocode() { return { lat: 33.45, lng: -112.07 }; } };
