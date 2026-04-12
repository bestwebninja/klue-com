/**
 * VeteranProfileSection — full military service profile form.
 *
 * Used in:
 *  - CompleteProfile page (post-OAuth / Google sign-in profile setup)
 *  - CommandCenter onboarding wizard (TradeClassifierForm step 2)
 *  - Any future profile-editing page
 *
 * The component is self-contained and calls back via onChange(data).
 * It does NOT call Supabase directly — callers handle persistence.
 */
import { useState } from "react";
import {
  Shield, ChevronDown, ChevronUp, Star, Award, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MILITARY_BRANCHES,
  RANKS,
  SPECIALTY_GROUPS,
  SERVICE_ERAS,
  UNIT_TYPES,
  CLEARANCE_LEVELS,
  VA_DISABILITY_RATINGS,
  YEARS_OF_SERVICE,
  VETERAN_BENEFITS,
  VETERAN_FREE_MONTHS,
  getRankTitle,
  type MilitaryBranchValue,
} from "@/lib/veteranData";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VeteranProfileData {
  isVeteran: boolean;
  branch: string;
  rankGrade: string;
  yearsOfService: string;
  serviceEras: string[];
  specialtyCode: string;
  specialtyTitle: string;
  unitType: string;
  lastDutyStation: string;
  lastUnit: string;
  clearanceLevel: string;
  vaDisabilityRating: number | null;
  dischargeType: string;
  isSdvosb: boolean;
  isVosb: boolean;
  openToVeteranNetwork: boolean;
  additionalNotes: string;
}

const EMPTY: VeteranProfileData = {
  isVeteran: false,
  branch: "",
  rankGrade: "",
  yearsOfService: "",
  serviceEras: [],
  specialtyCode: "",
  specialtyTitle: "",
  unitType: "",
  lastDutyStation: "",
  lastUnit: "",
  clearanceLevel: "none",
  vaDisabilityRating: null,
  dischargeType: "honorable",
  isSdvosb: false,
  isVosb: false,
  openToVeteranNetwork: true,
  additionalNotes: "",
};

interface Props {
  value?: Partial<VeteranProfileData>;
  onChange: (data: VeteranProfileData) => void;
  /** Show just the minimal signup fields (branch + checkbox). Full=all fields. */
  mode?: "signup" | "full";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VeteranProfileSection({ value, onChange, mode = "full" }: Props) {
  const [data, setData] = useState<VeteranProfileData>({ ...EMPTY, ...value });
  const [expanded, setExpanded] = useState(false);

  function update<K extends keyof VeteranProfileData>(key: K, val: VeteranProfileData[K]) {
    const next = { ...data, [key]: val };
    setData(next);
    onChange(next);
  }

  function toggleEra(era: string) {
    const next = data.serviceEras.includes(era)
      ? data.serviceEras.filter((e) => e !== era)
      : [...data.serviceEras, era];
    update("serviceEras", next);
  }

  // Specialties filtered to selected branch + "all"
  const branchSpecialtyGroups = SPECIALTY_GROUPS.filter(
    (g) => g.branch === data.branch || g.branch === "all"
  );

  // Ranks filtered to remove warrant officers for Navy/AF/CG/Space Force
  // (they have few or no warrant grades)
  const visibleRanks = RANKS.filter((r) => {
    if (r.category !== "warrant") return true;
    const noWarrant: MilitaryBranchValue[] = [
      "air_force", "air_national_guard", "coast_guard", "coast_guard_reserve",
      "space_force",
    ];
    return !noWarrant.includes(data.branch as MilitaryBranchValue);
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Veteran toggle */}
      <label className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 cursor-pointer select-none transition-colors hover:bg-amber-500/12">
        <Checkbox
          checked={data.isVeteran}
          onCheckedChange={(v) => update("isVeteran", v === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Are you a U.S. Military Veteran or currently serving?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unlock {VETERAN_FREE_MONTHS} months free on any annual plan + Veteran badge + priority job matching.
          </p>
        </div>
      </label>

      {data.isVeteran && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-4">

          {/* Benefit pills */}
          <div className="flex flex-wrap gap-1.5">
            {VETERAN_BENEFITS.slice(0, 3).map((b) => (
              <span key={b} className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] text-amber-300 font-medium">
                <Star className="h-2.5 w-2.5" />
                {b}
              </span>
            ))}
          </div>

          {/* Branch — always shown */}
          <div>
            <Label className="text-xs font-medium text-amber-200/80">Branch of Service <span className="text-destructive">*</span></Label>
            <Select value={data.branch} onValueChange={(v) => update("branch", v)}>
              <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                <SelectValue placeholder="Select your branch" />
              </SelectTrigger>
              <SelectContent>
                {MILITARY_BRANCHES.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* In signup mode, stop here. Full mode shows everything. */}
          {mode === "full" && (
            <>
              {/* Rank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-amber-200/80">Rank / Grade <span className="text-muted-foreground">(optional)</span></Label>
                  <Select value={data.rankGrade} onValueChange={(v) => {
                    const title = data.branch
                      ? getRankTitle(v, data.branch as MilitaryBranchValue)
                      : v;
                    setData((d) => { const n = { ...d, rankGrade: v, rankTitle: title }; onChange(n); return n; });
                  }}>
                    <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {["enlisted", "warrant", "officer"].map((cat) => {
                        const items = visibleRanks.filter((r) => r.category === cat);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat}>
                            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {cat === "enlisted" ? "Enlisted" : cat === "warrant" ? "Warrant Officers" : "Commissioned Officers"}
                            </p>
                            {items.map((r) => (
                              <SelectItem key={r.grade} value={r.grade}>
                                {r.grade} — {data.branch ? getRankTitle(r.grade, data.branch as MilitaryBranchValue) : r.armyTitle}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-amber-200/80">Years of Service</Label>
                  <Select value={data.yearsOfService} onValueChange={(v) => update("yearsOfService", v)}>
                    <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS_OF_SERVICE.map((y) => (
                        <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* MOS / Specialty */}
              {data.branch && (
                <div>
                  <Label className="text-xs font-medium text-amber-200/80">
                    Military Specialty / MOS / Rate <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={data.specialtyCode} onValueChange={(v) => {
                    const group = branchSpecialtyGroups.find((g) => g.specialties.some((s) => s.code === v));
                    const spec = group?.specialties.find((s) => s.code === v);
                    setData((d) => {
                      const n = { ...d, specialtyCode: v, specialtyTitle: spec?.title ?? v };
                      onChange(n);
                      return n;
                    });
                  }}>
                    <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                      <SelectValue placeholder="Search your specialty / MOS" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchSpecialtyGroups.map((g) => (
                        <div key={g.label}>
                          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                          {g.specialties.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.code} — {s.title}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  {data.specialtyTitle && (
                    <p className="mt-1 text-[11px] text-amber-300/70">{data.specialtyTitle}</p>
                  )}
                </div>
              )}

              {/* Unit type */}
              <div>
                <Label className="text-xs font-medium text-amber-200/80">Unit Type</Label>
                <Select value={data.unitType} onValueChange={(v) => update("unitType", v)}>
                  <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service eras */}
              <div>
                <Label className="text-xs font-medium text-amber-200/80 mb-1.5 block">Era(s) of Service</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_ERAS.map((era) => {
                    const selected = data.serviceEras.includes(era.value);
                    return (
                      <button
                        key={era.value}
                        type="button"
                        onClick={() => toggleEra(era.value)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selected
                            ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                            : "border-border/50 bg-muted/20 text-muted-foreground hover:border-amber-500/30"
                        )}
                      >
                        {era.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duty station + unit — collapsible extra details */}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-300 transition-colors"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? "Hide" : "Add"} duty station, clearance & certification details
              </button>

              {expanded && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-amber-200/80">Last Duty Station / Base</Label>
                      <Input
                        value={data.lastDutyStation}
                        onChange={(e) => update("lastDutyStation", e.target.value)}
                        placeholder="Fort Bragg, Camp Pendleton…"
                        className="mt-1 border-amber-500/30 bg-background/60 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-amber-200/80">Last Unit</Label>
                      <Input
                        value={data.lastUnit}
                        onChange={(e) => update("lastUnit", e.target.value)}
                        placeholder="82nd Airborne, 1st Marines…"
                        className="mt-1 border-amber-500/30 bg-background/60 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-amber-200/80">Security Clearance <span className="text-muted-foreground">(optional)</span></Label>
                      <Select value={data.clearanceLevel} onValueChange={(v) => update("clearanceLevel", v)}>
                        <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CLEARANCE_LEVELS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-amber-200/80">VA Disability Rating <span className="text-muted-foreground">(optional)</span></Label>
                      <Select
                        value={data.vaDisabilityRating != null ? String(data.vaDisabilityRating) : ""}
                        onValueChange={(v) => update("vaDisabilityRating", v === "" ? null : Number(v))}
                      >
                        <SelectTrigger className="mt-1 border-amber-500/30 bg-background/60">
                          <SelectValue placeholder="Select %" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Prefer not to say</SelectItem>
                          {VA_DISABILITY_RATINGS.map((r) => (
                            <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SDVOSB / VOSB */}
                  <div className="space-y-2">
                    <Label className="text-xs text-amber-200/80 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      Business Certifications
                    </Label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={data.isSdvosb}
                        onCheckedChange={(v) => update("isSdvosb", v === true)}
                      />
                      <span className="text-xs text-foreground/80">
                        SDVOSB — Service-Disabled Veteran-Owned Small Business
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={data.isVosb}
                        onCheckedChange={(v) => update("isVosb", v === true)}
                      />
                      <span className="text-xs text-foreground/80">
                        VOSB — Veteran-Owned Small Business
                      </span>
                    </label>
                    {(data.isSdvosb || data.isVosb) && (
                      <p className="text-[11px] text-amber-300/70 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        Your SDVOSB/VOSB badge will appear on your profile. Homeowners who prefer veteran contractors will see you first.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Veteran network consent */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={data.openToVeteranNetwork}
                  onCheckedChange={(v) => update("openToVeteranNetwork", v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  Allow fellow veteran contractors to find and connect with me (same branch / unit type)
                </span>
              </label>

              {/* Additional notes */}
              <div>
                <Label className="text-xs text-amber-200/80">Anything else you'd like to share? <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  value={data.additionalNotes}
                  onChange={(e) => update("additionalNotes", e.target.value)}
                  placeholder="Deployments, commendations, special skills the system should know about…"
                  rows={2}
                  className="mt-1 border-amber-500/30 bg-background/60 text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
