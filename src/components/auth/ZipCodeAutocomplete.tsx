import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { searchZipSuggestions, type ZipSuggestion } from '@/lib/usZipDirectory';

interface ZipCodeAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: ZipSuggestion) => void;
}

export const ZipCodeAutocomplete = ({ value, onChange }: ZipCodeAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = useMemo(() => searchZipSuggestions(value), [value]);

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
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {suggestions.map((suggestion) => (
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
