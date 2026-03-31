import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { searchZipSuggestions, type ZipSuggestion } from '@/lib/usZipDirectory';

interface ZipCodeAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: ZipSuggestion) => void;
}

export const ZipCodeAutocomplete = ({ value, onChange }: ZipCodeAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState<ZipSuggestion[]>([]);

  const localSuggestions = useMemo(() => searchZipSuggestions(value), [value]);
  const suggestions = remoteSuggestions.length > 0 ? remoteSuggestions : localSuggestions;

  useEffect(() => {
    const normalized = value.replace(/[^0-9]/g, '').slice(0, 5);
    if (normalized.length < 3) {
      setRemoteSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/zipcodes/search?q=${normalized}`);
        if (!response.ok) {
          setRemoteSuggestions([]);
          return;
        }
        const payload = await response.json();
        const mapped: ZipSuggestion[] = (payload?.results ?? []).map((item: any) => ({
          zipCode: item.zipCode,
          city: item.city,
          state: item.state,
        }));
        setRemoteSuggestions(mapped);
      } catch {
        setRemoteSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative">
      <Input
        id="zipCode"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 5));
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder="90210"
        maxLength={5}
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {isLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Resolving ZIP intelligence...</div>}
          {!isLoading && suggestions.length === 0 && value.length >= 3 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No ZIP matches found.</div>
          )}
          {!isLoading && suggestions.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.zipCode}-${suggestion.city}`}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion.zipCode, suggestion);
                setIsOpen(false);
              }}
            >
              {suggestion.zipCode} · {suggestion.city}, {suggestion.state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
