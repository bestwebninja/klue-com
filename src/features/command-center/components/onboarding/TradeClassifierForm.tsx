/**
 * TradeClassifierForm — Step 1 + 2 of the onboarding wizard.
 *
 * Step 1: Visual trade grid — icon cards, 3-column, keyboard-navigable
 * Step 2: ZIP code + job focus + size + veteran status
 *
 * Captures ZIP so the First Value Moment (market intel auto-run) is
 * immediately meaningful.
 */
import { useState } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import {
  Droplets, Zap, Home, Wind, ChefHat, Bath,
  Hammer, Leaf, PaintBucket, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TradeClassifierValues {
  trade: string;
  focus: string;
  jobSize: string;
  veteranOwned: boolean;
  zip: string;
}

interface Props {
  onSubmit: (values: TradeClassifierValues) => void;
}

const TRADES = [
  { key: "plumbing",         label: "Plumbing",           Icon: Droplets },
  { key: "electrical",       label: "Electrical",          Icon: Zap },
  { key: "roofing",          label: "Roofing",             Icon: Home },
  { key: "hvac",             label: "HVAC",                Icon: Wind },
  { key: "kitchen_remodel",  label: "Kitchen Remodel",     Icon: ChefHat },
  { key: "bathroom_remodel", label: "Bath Remodel",        Icon: Bath },
  { key: "general",          label: "General Contracting", Icon: Hammer },
  { key: "landscaping",      label: "Landscaping",         Icon: Leaf },
  { key: "painting",         label: "Painting",            Icon: PaintBucket },
  { key: "flooring",         label: "Flooring",            Icon: LayoutGrid },
] as const;

const FOCUS_OPTIONS = [
  { key: "service_repair", label: "Service & Repair",   desc: "Maintenance, fixes, and smaller jobs" },
  { key: "new_build",      label: "New Construction",   desc: "Ground-up builds and additions" },
  { key: "mixed",          label: "Mixed Portfolio",    desc: "Both service and new construction" },
];

const SIZE_OPTIONS = [
  { key: "small",  label: "Small",  desc: "Under $25k" },
  { key: "medium", label: "Medium", desc: "$25k–$150k" },
  { key: "large",  label: "Large",  desc: "$150k+" },
];

export function TradeClassifierForm({ onSubmit }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [trade, setTrade] = useState("");
  const [focus, setFocus] = useState("service_repair");
  const [jobSize, setJobSize] = useState("medium");
  const [veteranOwned, setVeteranOwned] = useState(false);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");

  function handleTradeSelect(key: string) {
    setTrade(key);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  function handleSubmit() {
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Enter a valid 5-digit ZIP code");
      return;
    }
    setZipError("");
    onSubmit({ trade, focus, jobSize, veteranOwned, zip });
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">What's your primary trade?</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRADES.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleTradeSelect(key)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all hover:border-primary/60 hover:bg-primary/5",
                "border-border/50 bg-card/50"
              )}
            >
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selectedTrade = TRADES.find((t) => t.key === trade);

  return (
    <div className="space-y-5">
      {/* Back + selected trade */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {selectedTrade && (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <selectedTrade.Icon className="h-3 w-3" />
            {selectedTrade.label}
          </div>
        )}
      </div>

      {/* ZIP */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Your primary service ZIP code</label>
        <Input
          placeholder="e.g. 78701"
          value={zip}
          onChange={(e) => {
            setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
            setZipError("");
          }}
          maxLength={5}
          className={cn("text-sm", zipError && "border-destructive")}
        />
        {zipError && <p className="text-xs text-destructive">{zipError}</p>}
      </div>

      {/* Focus */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Work focus</label>
        <div className="grid grid-cols-3 gap-2">
          {FOCUS_OPTIONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setFocus(key)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-center transition-all space-y-0.5",
                focus === key
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/30"
              )}
            >
              <p className="text-xs font-medium">{label}</p>
              <p className="text-[10px] opacity-70 leading-tight">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Job size */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Typical job size</label>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setJobSize(key)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-center transition-all space-y-0.5",
                jobSize === key
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/30"
              )}
            >
              <p className="text-xs font-medium">{label}</p>
              <p className="text-[10px] opacity-70">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Veteran */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <div
          onClick={() => setVeteranOwned((v) => !v)}
          className={cn(
            "h-4 w-4 rounded border flex items-center justify-center transition-all",
            veteranOwned ? "border-primary bg-primary" : "border-border/60 bg-card/40"
          )}
        >
          {veteranOwned && <span className="text-[10px] text-primary-foreground font-bold">✓</span>}
        </div>
        <span className="text-sm text-muted-foreground">Veteran-owned business</span>
      </label>

      <Button onClick={handleSubmit} className="w-full gap-2">
        Analyze my market
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
