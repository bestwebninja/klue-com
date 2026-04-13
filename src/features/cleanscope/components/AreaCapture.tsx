/**
 * AreaCapture — Step 1 of the CleanScope walkthrough.
 *
 * Rep can add multiple areas (lobby, office, restroom, kitchen…).
 * Each area captures: name, sq ft, floor type, traffic level,
 * restroom count, fixtures per restroom, and notes.
 *
 * Template library auto-fills common areas on one click.
 */

import { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FLOOR_MULT, TRAFFIC_SURCHARGE } from '../utils/pricing';
import type { AreaInput } from '../utils/pricing';
import { cn } from '@/lib/utils';

interface AreaCaptureProps {
  areas: AreaInput[];
  onChange: (areas: AreaInput[]) => void;
}

const AREA_TEMPLATES: Omit<AreaInput, 'id'>[] = [
  { name: 'Lobby / Reception',    sqft: 600,  floorType: 'Tile / Grout',       trafficLevel: 'High',     restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
  { name: 'Open Office',          sqft: 2000, floorType: 'Carpet',             trafficLevel: 'Moderate', restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
  { name: 'Private Offices',      sqft: 800,  floorType: 'Carpet',             trafficLevel: 'Low',      restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
  { name: 'Conference Room',      sqft: 400,  floorType: 'Carpet',             trafficLevel: 'Moderate', restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
  { name: 'Restrooms',            sqft: 200,  floorType: 'Tile / Grout',       trafficLevel: 'High',     restroomCount: 2, fixturesPerRestroom: 3, notes: '' },
  { name: 'Break Room / Kitchen', sqft: 300,  floorType: 'Tile / Grout',       trafficLevel: 'High',     restroomCount: 0, fixturesPerRestroom: 0, notes: 'Include appliances, counters, sink' },
  { name: 'Warehouse / Storage',  sqft: 3000, floorType: 'Epoxy / Sealed Concrete', trafficLevel: 'Low', restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
  { name: 'Stairwells / Hallways',sqft: 500,  floorType: 'VCT / Vinyl',        trafficLevel: 'Moderate', restroomCount: 0, fixturesPerRestroom: 0, notes: '' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AreaCapture({ areas, onChange }: AreaCaptureProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const addBlank = () => {
    onChange([...areas, {
      id: generateId(), name: '', sqft: 0,
      floorType: 'Carpet', trafficLevel: 'Moderate',
      restroomCount: 0, fixturesPerRestroom: 0, notes: '',
    }]);
  };

  const addFromTemplate = (tpl: Omit<AreaInput, 'id'>) => {
    onChange([...areas, { ...tpl, id: generateId() }]);
  };

  const update = (id: string, field: keyof AreaInput, value: string | number) => {
    onChange(areas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const remove = (id: string) => onChange(areas.filter(a => a.id !== id));

  const duplicate = (area: AreaInput) => {
    onChange([...areas, { ...area, id: generateId(), name: area.name + ' (copy)' }]);
  };

  const totalSqft = areas.reduce((s, a) => s + (a.sqft || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Areas</h3>
          <p className="text-[11px] text-muted-foreground">
            {areas.length} area{areas.length !== 1 ? 's' : ''} · {totalSqft.toLocaleString()} total sq ft
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(v => !v)}
            className="text-xs gap-1.5"
          >
            Area Templates
          </Button>
          <Button type="button" size="sm" onClick={addBlank} className="text-xs gap-1.5 bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-3.5 w-3.5" /> Add Area
          </Button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground mb-2 font-medium">Click a template to add:</p>
          <div className="flex flex-wrap gap-1.5">
            {AREA_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => addFromTemplate(tpl)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
              >
                + {tpl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Area list */}
      {areas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-lg">
          <p className="text-sm">No areas added yet.</p>
          <p className="text-xs mt-1">Use templates or add a blank area to start.</p>
        </div>
      )}

      {areas.map((area, idx) => (
        <div
          key={area.id}
          className="rounded-lg border border-border/60 bg-background overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Area {idx + 1}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => duplicate(area)} className="p-1 text-muted-foreground hover:text-foreground rounded">
                <Copy className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => remove(area.id)} className="p-1 text-muted-foreground hover:text-destructive rounded">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-[11px] text-muted-foreground">Area Name *</Label>
              <Input
                value={area.name}
                onChange={e => update(area.id, 'name', e.target.value)}
                placeholder="e.g. Open Office, Lobby"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Sq Ft *</Label>
              <Input
                type="number"
                value={area.sqft || ''}
                onChange={e => update(area.id, 'sqft', parseFloat(e.target.value) || 0)}
                placeholder="1500"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Floor Type</Label>
              <select
                value={area.floorType}
                onChange={e => update(area.id, 'floorType', e.target.value)}
                className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                {Object.keys(FLOOR_MULT).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Traffic Level</Label>
              <select
                value={area.trafficLevel}
                onChange={e => update(area.id, 'trafficLevel', e.target.value)}
                className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                {Object.keys(TRAFFIC_SURCHARGE).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Restrooms</Label>
              <Input
                type="number"
                min={0}
                value={area.restroomCount || 0}
                onChange={e => update(area.id, 'restroomCount', parseInt(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Fixtures / Restroom</Label>
              <Input
                type="number"
                min={0}
                value={area.fixturesPerRestroom || 0}
                onChange={e => update(area.id, 'fixturesPerRestroom', parseInt(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <Label className="text-[11px] text-muted-foreground">Notes</Label>
              <Input
                value={area.notes}
                onChange={e => update(area.id, 'notes', e.target.value)}
                placeholder="Special instructions, high-touch zones, exclusions…"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Area summary badges */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">{area.sqft.toLocaleString()} sq ft</Badge>
            <Badge variant="outline" className="text-[10px]">{area.floorType} ×{FLOOR_MULT[area.floorType]?.toFixed(2)}</Badge>
            <Badge variant="outline" className="text-[10px]">{area.trafficLevel} traffic +{Math.round((TRAFFIC_SURCHARGE[area.trafficLevel] ?? 0) * 100)}%</Badge>
            {area.restroomCount > 0 && (
              <Badge variant="outline" className="text-[10px]">{area.restroomCount} restroom{area.restroomCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
