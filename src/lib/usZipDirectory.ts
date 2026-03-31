import { usStates as US_LOCATIONS } from '@/data/usLocations';

export interface ZipSuggestion {
  zipCode: string;
  city: string;
  state: string;
}

const ZIP_DIRECTORY: ZipSuggestion[] = US_LOCATIONS.flatMap((stateEntry) => {
  const state = stateEntry.name;
  return stateEntry.cities.flatMap((cityEntry) => cityEntry.zips.map((zipCode) => ({ zipCode, city: cityEntry.city, state })));
});

export const searchZipSuggestions = (query: string, limit = 8): ZipSuggestion[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return ZIP_DIRECTORY
    .filter(({ zipCode, city, state }) =>
      zipCode.startsWith(normalized) || city.toLowerCase().includes(normalized) || state.toLowerCase().includes(normalized),
    )
    .slice(0, limit);
};
