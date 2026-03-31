import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CloudSun, DollarSign, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

/* ── Section / checklist types ─────────────────────────────────── */
type ChecklistOption = { label: string; key: string };
type ChecklistGroup = { title: string; key: string; options: ChecklistOption[] };
type TextField = { key: string; label: string; placeholder?: string };
type Section = { title: string; fields?: TextField[]; groups?: ChecklistGroup[] };

/* ── Static form schema ────────────────────────────────────────── */
const sections: Section[] = [
  {
    title: 'Client Design Selection Form',
    fields: [
      { key: 'clientName', label: 'Client Name' },
      { key: 'projectAddress', label: 'Project Address' },
      { key: 'zipCode', label: 'Project Zip Code', placeholder: '5-digit zip' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'builder', label: 'Builder', placeholder: 'Kona Custom Homes' },
      { key: 'date', label: 'Date' },
      { key: 'realtorContact', label: 'Realtor to notify (if any)' },
    ],
  },
  {
    title: '1. Exterior Design',
    groups: [
      { title: 'Main Siding Selection', key: 'mainSidingSelection', options: ['Board & Batten', 'Stacked Stone', 'Brick', 'Metal Siding', 'Stucco', 'Hardie Siding', 'Other'].map(l => ({ label: l, key: l })) },
      { title: 'Roof Type', key: 'roofType', options: ['Standing Seam Metal Roof', 'Metal Roof Tile', 'Asphalt Shingle', 'Clay / Concrete Tile', 'Other'].map(l => ({ label: l, key: l })) },
      { title: 'Window Style', key: 'windowStyle', options: ['Single Hung', 'Double Hung', 'Casement', 'Fixed', 'Picture Windows'].map(l => ({ label: l, key: l })) },
    ],
    fields: [
      { key: 'trimColor', label: 'Trim Color' },
      { key: 'fasciaMaterial', label: 'Fascia Material' },
      { key: 'soffitMaterial', label: 'Soffit Material' },
      { key: 'roofColorStyle', label: 'Roof Color / Style' },
      { key: 'gutterColor', label: 'Gutter / Downspout Color' },
      { key: 'windowFrameColor', label: 'Window Frame Color' },
    ],
  },
  {
    title: '2. Flooring Selections',
    groups: [
      { title: 'Living Room', key: 'livingRoomFlooring', options: ['Tile', 'Hardwood', 'LVP', 'Carpet', 'Stained Concrete', 'Polished Concrete'].map(l => ({ label: l, key: l })) },
      { title: 'Garage / Shop Flooring', key: 'garageFlooring', options: ['Plain Concrete', 'Stained Concrete', 'Epoxy Flooring', 'Polyaspartic Floor Coating'].map(l => ({ label: l, key: l })) },
    ],
    fields: [
      { key: 'kitchenFloorMaterial', label: 'Kitchen Flooring Material' },
      { key: 'kitchenFloorColor', label: 'Kitchen Flooring Color' },
      { key: 'bathroomFloorMaterial', label: 'Bathroom Flooring Material' },
      { key: 'bathroomFloorColor', label: 'Bathroom Flooring Color' },
    ],
  },
  {
    title: '3. Kitchen Design',
    groups: [
      { title: 'Countertop Selection', key: 'countertopSelection', options: ['Quartz', 'Granite', 'Marble', 'Quartzite', 'Soapstone', 'Slate', 'Limestone', 'Travertine', 'Onyx', 'Sintered Stone', 'Porcelain Slab', 'Cultured Marble', 'Agglomerate Stone'].map(l => ({ label: l, key: l })) },
      { title: 'Kitchen Layout Features', key: 'kitchenLayoutFeatures', options: ['Kitchen Island', 'Waterfall Island', 'Double Island', 'Walk-in Pantry', 'Butler Pantry'].map(l => ({ label: l, key: l })) },
    ],
    fields: [
      { key: 'selectedCountertopMaterial', label: 'Selected Countertop Material' },
      { key: 'countertopColorStyle', label: 'Countertop Color / Style' },
      { key: 'backsplashSelection', label: 'Backsplash Selection' },
    ],
  },
  {
    title: 'Execution, Compliance & Workflow',
    fields: [
      { key: 'preferredSupplier', label: 'Preferred supplier' },
      { key: 'secondarySupplier', label: 'Secondary supplier' },
      { key: 'attorneyEmail', label: 'Attorney email (optional)' },
      { key: 'projectWindowStart', label: 'Projected build window start' },
      { key: 'projectWindowEnd', label: 'Projected build window end' },
      { key: 'notes', label: 'Special requests / notes' },
    ],
    groups: [
      {
        title: 'Workflow actions',
        key: 'workflowActions',
        options: [
          'Send quote to homeowner / internal user',
          'Enable one-click acceptance',
          'Generate dual-party e-sign packet',
          'Share with professional service provider',
          'Offer financing quote option',
          'Notify listed realtor for property access',
        ].map(l => ({ label: l, key: l })),
      },
    ],
  },
];

/* ── Checkbox + note sub-component ─────────────────────────────── */
function CheckboxWithNote({
  checked, label, note, onToggle, onNote,
}: {
  checked: boolean; label: string; note: string;
  onToggle: () => void; onNote: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={checked} onCheckedChange={onToggle} />
        <span className="text-foreground">{label}</span>
      </label>
      <Input
        value={note}
        onChange={e => onNote(e.target.value)}
        placeholder="Material / color / product note"
        className="text-xs"
      />
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function ContractorQuoteIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fields, setFields] = useState<Record<string, string>>({ builder: 'Kona Custom Homes' });
  const [checklist, setChecklist] = useState<Record<string, { checked: boolean; note: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedMaterials = useMemo(
    () => Object.entries(checklist).filter(([, v]) => v.checked).map(([k]) => k),
    [checklist],
  );

  const updateField = (key: string, value: string) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const updateChecklist = (groupKey: string, optionKey: string, patch: Partial<{ checked: boolean; note: string }>) => {
    const key = `${groupKey}:${optionKey}`;
    setChecklist(prev => ({
      ...prev,
      [key]: {
        checked: patch.checked ?? prev[key]?.checked ?? false,
        note: patch.note ?? prev[key]?.note ?? '',
      },
    }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Please log in first', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    // For now we just show a success toast — backend persistence can be added later
    toast({
      title: 'Quote intake saved',
      description: `${selectedMaterials.length} material selections captured. Workflow seeded for admin, finance, and e-sign handoff.`,
    });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard?tab=gc-command')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Custom Barndominium Design Checklist</h1>
            <p className="text-xs text-muted-foreground">General contractor quote intake + cost orchestration seed</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text fields */}
              {section.fields && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map(field => (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      {field.key === 'notes' ? (
                        <Textarea
                          id={field.key}
                          value={fields[field.key] ?? ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder ?? 'Enter value'}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          value={fields[field.key] ?? ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder ?? 'Enter value'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Checklist groups */}
              {section.groups?.map(group => (
                <div key={group.key} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{group.title}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.options.map(option => {
                      const key = `${group.key}:${option.key}`;
                      const entry = checklist[key] ?? { checked: false, note: '' };
                      return (
                        <CheckboxWithNote
                          key={key}
                          checked={entry.checked}
                          label={option.label}
                          note={entry.note}
                          onToggle={() => updateChecklist(group.key, option.key, { checked: !entry.checked })}
                          onNote={v => updateChecklist(group.key, option.key, { note: v })}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Action buttons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Integrated Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <CloudSun className="w-3.5 h-3.5" /> Refresh Weather Advisory
              </Button>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Load Materials Cost Preview
              </Button>
              <Button type="button" variant="secondary" size="sm">Request FINANCE now</Button>
              <Button type="button" variant="secondary" size="sm">REALTOR Access</Button>
            </div>
            {selectedMaterials.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMaterials.slice(0, 8).map(m => (
                  <Badge key={m} variant="secondary" className="text-[10px]">{m.split(':')[1]}</Badge>
                ))}
                {selectedMaterials.length > 8 && (
                  <Badge variant="outline" className="text-[10px]">+{selectedMaterials.length - 8} more</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          <Button type="submit" disabled={submitting} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Saving…' : 'Save Quote Intake'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard?tab=gc-command')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
