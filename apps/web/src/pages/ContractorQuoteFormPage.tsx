import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { navigate } from "../App";
import { createContractorQuoteIntake, fetchContractorCostPreview, fetchGeoIntelligence, type ContractorQuoteIntakeInput } from "../lib/api";

type ChecklistOption = { label: string; key: string };
type ChecklistGroup = { title: string; key: string; options: ChecklistOption[]; freeTextLabel?: string };

type TextField = { key: string; label: string; placeholder?: string };
type Section = {
  title: string;
  fields?: TextField[];
  groups?: ChecklistGroup[];
};

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Quote Intake", path: "/contractor/quote-intake" },
  { label: "Billing", path: "/billing" }
];

const sections: Section[] = [
  {
    title: "Client Design Selection Form",
    fields: [
      { key: "clientName", label: "Client Name" },
      { key: "projectAddress", label: "Project Address" },
      { key: "zipCode", label: "Project Zip Code", placeholder: "5-digit zip" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "builder", label: "Builder", placeholder: "Kona Custom Homes" },
      { key: "date", label: "Date" },
      { key: "realtorContact", label: "Realtor to notify (if any)" }
    ]
  },
  {
    title: "1. Exterior Design",
    groups: [
      {
        title: "Main Siding Selection",
        key: "mainSidingSelection",
        options: ["Board & Batten", "Stacked Stone", "Brick", "Metal Siding", "Stucco", "Hardie Siding", "Other"].map((label) => ({ label, key: label }))
      },
      {
        title: "Roof Type",
        key: "roofType",
        options: ["Standing Seam Metal Roof", "Metal Roof Tile", "Asphalt Shingle", "Clay / Concrete Tile", "Other"].map((label) => ({ label, key: label }))
      },
      {
        title: "Window Style",
        key: "windowStyle",
        options: ["Single Hung", "Double Hung", "Casement", "Fixed", "Picture Windows"].map((label) => ({ label, key: label }))
      }
    ],
    fields: [
      { key: "trimColor", label: "Trim Color" },
      { key: "fasciaMaterial", label: "Fascia Material" },
      { key: "soffitMaterial", label: "Soffit Material" },
      { key: "roofColorStyle", label: "Roof Color / Style" },
      { key: "gutterColor", label: "Gutter / Downspout Color" },
      { key: "windowFrameColor", label: "Window Frame Color" }
    ]
  },
  {
    title: "2. Flooring Selections",
    groups: [
      {
        title: "Living Room",
        key: "livingRoomFlooring",
        options: ["Tile", "Hardwood", "LVP", "Carpet", "Stained Concrete", "Polished Concrete"].map((label) => ({ label, key: label }))
      },
      {
        title: "Garage / Shop Flooring",
        key: "garageFlooring",
        options: ["Plain Concrete", "Stained Concrete", "Epoxy Flooring", "Polyaspartic Floor Coating"].map((label) => ({ label, key: label }))
      }
    ],
    fields: [
      { key: "kitchenFloorMaterial", label: "Kitchen Flooring Material" },
      { key: "kitchenFloorColor", label: "Kitchen Flooring Color" },
      { key: "bathroomFloorMaterial", label: "Bathroom Flooring Material" },
      { key: "bathroomFloorColor", label: "Bathroom Flooring Color" }
    ]
  },
  {
    title: "3. Kitchen Design",
    groups: [
      {
        title: "Countertop Selection",
        key: "countertopSelection",
        options: ["Quartz", "Granite", "Marble", "Quartzite", "Soapstone", "Slate", "Limestone", "Travertine", "Onyx", "Sintered Stone", "Porcelain Slab", "Cultured Marble", "Agglomerate Stone"].map((label) => ({ label, key: label }))
      },
      {
        title: "Kitchen Layout Features",
        key: "kitchenLayoutFeatures",
        options: ["Kitchen Island", "Waterfall Island", "Double Island", "Walk-in Pantry", "Butler Pantry"].map((label) => ({ label, key: label }))
      }
    ],
    fields: [
      { key: "selectedCountertopMaterial", label: "Selected Countertop Material" },
      { key: "countertopColorStyle", label: "Countertop Color / Style" },
      { key: "backsplashSelection", label: "Backsplash Selection" }
    ]
  },
  {
    title: "Execution, Compliance & Workflow",
    fields: [
      { key: "preferredSupplier", label: "Preferred supplier" },
      { key: "secondarySupplier", label: "Secondary supplier" },
      { key: "attorneyEmail", label: "Attorney email (optional)" },
      { key: "projectWindowStart", label: "Projected build window start" },
      { key: "projectWindowEnd", label: "Projected build window end" },
      { key: "notes", label: "Special requests / notes" }
    ],
    groups: [
      {
        title: "Workflow actions",
        key: "workflowActions",
        options: [
          "Send quote to homeowner / internal user",
          "Enable one-click acceptance",
          "Generate dual-party e-sign packet",
          "Share with professional service provider",
          "Offer financing quote option",
          "Notify listed realtor for property access"
        ].map((label) => ({ label, key: label }))
      }
    ]
  }
];

function CheckboxWithText({
  checked,
  label,
  note,
  onToggle,
  onNote
}: {
  checked: boolean;
  label: string;
  note: string;
  onToggle: () => void;
  onNote: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 rounded-md border border-slate-700 bg-slate-900/80 p-3">
      <span className="flex items-center gap-3 text-sm text-slate-100">
        <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-brand-500" />
        {label}
      </span>
      <input
        value={note}
        onChange={(event) => onNote(event.target.value)}
        placeholder="Material / color / product note"
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500"
      />
    </label>
  );
}

export function ContractorQuoteFormPage() {
  const [fields, setFields] = useState<Record<string, string>>({ builder: "Kona Custom Homes" });
  const [checklist, setChecklist] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [status, setStatus] = useState<string>("");
  const [weatherSummary, setWeatherSummary] = useState<string>("");
  const [costPreview, setCostPreview] = useState<{ totalLow: number; totalHigh: number; supplier: string } | null>(null);

  const selectedMaterials = useMemo(
    () => Object.entries(checklist).filter(([, value]) => value.checked).map(([key]) => key),
    [checklist]
  );

  const updateField = (key: string, value: string) => setFields((prev) => ({ ...prev, [key]: value }));

  const updateChecklist = (groupKey: string, optionKey: string, patch: Partial<{ checked: boolean; note: string }>) => {
    const key = `${groupKey}:${optionKey}`;
    setChecklist((prev) => ({
      ...prev,
      [key]: {
        checked: patch.checked ?? prev[key]?.checked ?? false,
        note: patch.note ?? prev[key]?.note ?? ""
      }
    }));
  };

  const loadWeather = async () => {
    const zipCode = fields.zipCode?.trim();
    if (!zipCode || zipCode.length !== 5) {
      setWeatherSummary("Enter a valid 5-digit zip code to load weather risk advisory.");
      return;
    }

    try {
      const geo = await fetchGeoIntelligence(zipCode);
      const current = (geo.weather as { current_weather?: { temperature?: number; windspeed?: number } })?.current_weather;
      const wind = current?.windspeed ?? 0;
      const risk = wind > 25 ? "High wind risk" : "Normal wind risk";
      setWeatherSummary(`Weather advisory for ${zipCode}: ${risk}. Current temp ${current?.temperature ?? "n/a"}° and wind ${wind} mph.`);
    } catch {
      setWeatherSummary("Weather advisory is temporarily unavailable. You can still continue with quote intake.");
    }
  };

  const loadCostPreview = async () => {
    try {
      const preview = await fetchContractorCostPreview({
        supplier: fields.preferredSupplier || "Default Supplier Network",
        zipCode: fields.zipCode || "00000",
        selectedMaterials,
        projectScope: fields.notes || "custom barndominium"
      });
      setCostPreview(preview);
      setStatus("Loaded cost preview from supplier feed placeholder.");
    } catch {
      setStatus("Could not load cost preview right now.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Submitting quote intake...");

    const payload: ContractorQuoteIntakeInput = {
      clientName: fields.clientName ?? "",
      projectAddress: fields.projectAddress ?? "",
      zipCode: fields.zipCode ?? "",
      phone: fields.phone ?? "",
      email: fields.email ?? "",
      builder: fields.builder ?? "Kona Custom Homes",
      projectDate: fields.date ?? "",
      realtorContact: fields.realtorContact ?? "",
      attorneyEmail: fields.attorneyEmail ?? "",
      selectedSupplier: fields.preferredSupplier ?? "",
      sections: checklist,
      textFields: fields,
      selectedMaterials,
      weatherSummary,
      workflowFlags: {
        requestFinanceNow: true,
        notifyRealtor: Boolean(fields.realtorContact),
        generateEsignAfterAcceptance: true
      }
    };

    try {
      const response = await createContractorQuoteIntake(payload);
      setStatus(`Quote intake saved with ID ${response.quoteIntakeId}. Workflow seeded for admin, finance, and e-sign handoff.`);
    } catch {
      setStatus("Failed to save quote intake.");
    }
  };

  return (
    <AppShell title="Custom Barndominium Design Checklist" subtitle="General contractor quote intake + cost orchestration seed" navItems={navItems}>
      <form onSubmit={onSubmit} className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>

            {section.fields ? (
              <div className="grid gap-3 md:grid-cols-2">
                {section.fields.map((field) => (
                  <label key={field.key} className="space-y-1 text-sm text-slate-300">
                    <span>{field.label}</span>
                    <input
                      value={fields[field.key] ?? ""}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      placeholder={field.placeholder ?? "Enter value"}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {section.groups?.map((group) => (
              <div key={group.key} className="space-y-2">
                <h3 className="text-sm font-medium text-slate-100">{group.title}</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {group.options.map((option) => {
                    const key = `${group.key}:${option.key}`;
                    const entry = checklist[key] ?? { checked: false, note: "" };
                    return (
                      <CheckboxWithText
                        key={key}
                        checked={entry.checked}
                        label={option.label}
                        note={entry.note}
                        onToggle={() => updateChecklist(group.key, option.key, { checked: !entry.checked })}
                        onNote={(value) => updateChecklist(group.key, option.key, { note: value })}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}

        <section className="rounded-xl border border-brand-700 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">Integrated Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={loadWeather} className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600">
              Refresh Weather Advisory
            </button>
            <button type="button" onClick={loadCostPreview} className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600">
              Load Materials Cost Preview
            </button>
            <button type="button" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500">
              Request FINANCE now
            </button>
            <button type="button" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">
              REALTOR Access
            </button>
            <button type="button" onClick={() => navigate("/dashboard")} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-500">
              Back to Dashboard
            </button>
          </div>

          {weatherSummary ? <p className="text-sm text-slate-300">{weatherSummary}</p> : null}
          {costPreview ? (
            <p className="text-sm text-slate-200">
              Supplier: {costPreview.supplier} • Estimated materials: ${costPreview.totalLow.toLocaleString()} - ${costPreview.totalHigh.toLocaleString()}
            </p>
          ) : null}
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-md bg-brand-600 px-5 py-2.5 text-white hover:bg-brand-500">
            Save Quote Intake
          </button>
          {status ? <p className="text-sm text-slate-300">{status}</p> : null}
        </div>
      </form>
    </AppShell>
  );
}
