/**
 * ScopeBuilder — Step 2 of the CleanScope walkthrough.
 *
 * Generates a standardised scope of work from the captured areas.
 * Rep can toggle individual scope items on/off and add custom lines.
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { AreaInput } from '../utils/pricing';

interface ScopeBuilderProps {
  areas: AreaInput[];
  scope: string[];
  onChange: (scope: string[]) => void;
}

function generateAutoScope(areas: AreaInput[]): string[] {
  const lines: string[] = [];
  const hasRestrooms = areas.some(a => a.restroomCount > 0);
  const hasKitchen = areas.some(a => /kitchen|break/i.test(a.name));
  const hasWarehouse = areas.some(a => /warehouse|storage/i.test(a.name));
  const hasCarpet = areas.some(a => /carpet/i.test(a.floorType));
  const hasTile = areas.some(a => /tile|grout/i.test(a.floorType));
  const hasHardwood = areas.some(a => /hardwood/i.test(a.floorType));
  const hasVCT = areas.some(a => /VCT|vinyl/i.test(a.floorType));
  const hasMarble = areas.some(a => /marble|stone/i.test(a.floorType));
  const hasEpoxy = areas.some(a => /epoxy|concrete/i.test(a.floorType));
  const hasHighTraffic = areas.some(a => a.trafficLevel === 'High' || a.trafficLevel === 'Heavy');

  // Always-include general services
  lines.push('Empty and reline waste receptacles throughout facility');
  lines.push('Dust and wipe all horizontal surfaces, ledges, and furniture');
  lines.push('Clean and disinfect door handles, light switches, and high-touch points');
  lines.push('Spot-clean interior glass, partitions, and mirrors');
  lines.push('Vacuum all upholstered furniture and common area seating');

  // Floor-specific
  if (hasCarpet) lines.push('Vacuum all carpeted areas with commercial-grade equipment');
  if (hasHighTraffic && hasCarpet) lines.push('Spot-treat carpet stains and high-traffic wear patterns');
  if (hasTile) lines.push('Sweep and wet-mop tile/grout floors; treat grout lines as needed');
  if (hasHardwood) lines.push('Dust-mop and damp-mop hardwood floors with pH-neutral solution');
  if (hasVCT) lines.push('Sweep, mop, and buff VCT/vinyl flooring; apply finish as scheduled');
  if (hasMarble) lines.push('Dust-mop and damp-mop marble/stone floors with stone-safe cleaner');
  if (hasEpoxy) lines.push('Sweep and scrub epoxy/sealed concrete floors');

  // Restrooms
  if (hasRestrooms) {
    lines.push('Sanitize and disinfect all restroom fixtures (toilets, urinals, sinks)');
    lines.push('Clean and polish mirrors, countertops, and partitions in restrooms');
    lines.push('Restock paper products, soap, and supplies as provided by client');
    lines.push('Mop restroom floors with hospital-grade disinfectant');
  }

  // Kitchen / Break room
  if (hasKitchen) {
    lines.push('Clean and disinfect kitchen/break room countertops and sink');
    lines.push('Wipe down exterior of appliances (microwave, refrigerator, coffee station)');
    lines.push('Empty kitchen waste bins and replace liners');
  }

  // Warehouse
  if (hasWarehouse) {
    lines.push('Sweep warehouse/storage floor and remove debris');
    lines.push('Wipe down accessible shelving and equipment surfaces');
  }

  // Area-specific notes
  areas.forEach(a => {
    if (a.notes?.trim()) {
      lines.push(`${a.name}: ${a.notes.trim()}`);
    }
  });

  return lines;
}

export function ScopeBuilder({ areas, scope, onChange }: ScopeBuilderProps) {
  const [custom, setCustom] = useState('');
  const [disabled, setDisabled] = useState<Set<number>>(new Set());

  // Auto-generate scope when areas change (only if scope is currently empty)
  useEffect(() => {
    if (scope.length === 0 && areas.length > 0) {
      onChange(generateAutoScope(areas));
    }
  }, [areas]); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerate = () => {
    setDisabled(new Set());
    onChange(generateAutoScope(areas));
  };

  const toggle = (idx: number) => {
    setDisabled(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const removeItem = (idx: number) => {
    onChange(scope.filter((_, i) => i !== idx));
    setDisabled(prev => {
      const next = new Set<number>();
      prev.forEach(d => { if (d < idx) next.add(d); else if (d > idx) next.add(d - 1); });
      return next;
    });
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onChange([...scope, trimmed]);
    setCustom('');
  };

  // Active (non-disabled) scope lines for proposal
  const activeScope = scope.filter((_, i) => !disabled.has(i));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Scope of Work</h3>
          <p className="text-[11px] text-muted-foreground">
            {activeScope.length} of {scope.length} item{scope.length !== 1 ? 's' : ''} active
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={regenerate}
          className="text-xs"
          disabled={areas.length === 0}
        >
          Regenerate from Areas
        </Button>
      </div>

      {scope.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-lg">
          <p className="text-sm">No scope items yet.</p>
          <p className="text-xs mt-1">
            {areas.length === 0
              ? 'Add areas in Step 1 first, then return here.'
              : 'Click "Regenerate from Areas" to auto-build scope.'}
          </p>
        </div>
      )}

      {/* Scope list */}
      <div className="space-y-1.5">
        {scope.map((line, idx) => {
          const active = !disabled.has(idx);
          return (
            <div
              key={idx}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg border transition-all ${
                active
                  ? 'border-border/60 bg-background'
                  : 'border-border/30 bg-muted/20 opacity-40'
              }`}
            >
              <GripVertical className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/40 flex-shrink-0" />
              <span className={`flex-1 text-xs leading-relaxed ${active ? 'text-foreground' : 'line-through text-muted-foreground'}`}>
                {line}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {active ? 'Off' : 'On'}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add custom line */}
      <div className="flex gap-2 pt-1">
        <Input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Add custom scope item…"
          className="h-8 text-xs flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Summary badge */}
      {activeScope.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
            {activeScope.length} scope items will appear in proposal
          </Badge>
        </div>
      )}
    </div>
  );
}

// Export active scope helper for parent to retrieve
export { generateAutoScope };
