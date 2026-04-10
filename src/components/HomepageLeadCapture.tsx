import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ZipCodeAutocomplete } from '@/components/auth/ZipCodeAutocomplete';
import { providerServiceTaxonomy } from '@/lib/providerServiceTaxonomy';
import { cn } from '@/lib/utils';

export function HomepageLeadCapture() {
  const navigate = useNavigate();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const toggleService = (name: string) => {
    setSelectedServices(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name],
    );
  };

  const isValid =
    selectedServices.length > 0 &&
    zipCode.length === 5 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      // Persist lead context so Auth page can carry it through signup
      sessionStorage.setItem('kluje.lead.services', JSON.stringify(selectedServices));
      sessionStorage.setItem('kluje.lead.zip', zipCode);
      sessionStorage.setItem('kluje.lead.email', email);

      // Fire-and-forget — don't block navigation on DB write
      fetch('/api/v1/homepage-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: selectedServices, zip_code: zipCode, email }),
      }).catch(() => {
        // Silently ignore network errors — lead is already in sessionStorage
      });

      navigate(`/auth?prefill=1&email=${encodeURIComponent(email)}`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto px-2">
      <div className="rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md p-5 shadow-2xl space-y-4">

        {/* ── Service Required ─────────────────────────────────────────── */}
        <div>
          <Label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
            Service Required
          </Label>

          <Popover open={isServicePickerOpen} onOpenChange={setIsServicePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={isServicePickerOpen}
                className="w-full h-11 justify-between font-normal border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                {selectedServices.length > 0
                  ? `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'} selected`
                  : 'Search for a service…'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search services…" />
                <CommandList>
                  <CommandEmpty>No service found.</CommandEmpty>
                  {providerServiceTaxonomy.map(group => (
                    <CommandGroup key={group.category} heading={group.category}>
                      {group.subcategories.map(sub => {
                        const isSelected = selectedServices.includes(sub);
                        return (
                          <CommandItem
                            key={sub}
                            value={`${group.category} ${sub}`}
                            onSelect={() => toggleService(sub)}
                          >
                            <CheckCircle
                              className={cn(
                                'mr-2 h-4 w-4 text-primary',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {sub}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedServices.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedServices.map(svc => (
                <Badge
                  key={svc}
                  variant="secondary"
                  className="gap-1 text-xs bg-white/20 text-white border-white/20 hover:bg-white/30"
                >
                  {svc}
                  <button
                    type="button"
                    onClick={() => toggleService(svc)}
                    className="rounded-full hover:text-white/70"
                    aria-label={`Remove ${svc}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* ── Zip Code + Email row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
              Zip Code Job
            </Label>
            <ZipCodeAutocomplete
              value={zipCode}
              onChange={value => setZipCode(value)}
            />
          </div>

          <div>
            <Label
              htmlFor="lead-email"
              className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-white/80"
            >
              Email Address
            </Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full h-11 font-semibold text-sm tracking-wide"
          style={{
            background: 'hsl(48 96% 53%)',
            color: 'hsl(290 25% 72%)',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </form>
  );
}
