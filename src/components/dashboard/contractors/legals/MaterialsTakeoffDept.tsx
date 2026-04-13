/**
 * MaterialsTakeoffDept — Materials > Materials Takeoff
 *
 * Quantity-survey-style takeoff calculator.
 * Enter room/area dimensions → auto-calculates material quantities + cost estimates.
 * Supports: lumber, drywall, concrete, flooring, paint, roofing, insulation.
 */

import { useState } from 'react';
import {
  DeptShell, KpiItem, SectionCard, SelectField,
} from '@/components/dashboard/contractors/DeptShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ruler, Plus, Trash2, Download } from 'lucide-react';

interface Area {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  type: AreaType;
}

type AreaType = 'room' | 'roof' | 'slab' | 'exterior_wall';

interface MaterialLine {
  material: string;
  unit: string;
  qty: number;
  unitCost: number;
}

const WASTE_FACTOR = 1.1; // 10% waste

function computeMaterials(areas: Area[]): MaterialLine[] {
  const lines: Record<string, MaterialLine> = {};

  function add(material: string, unit: string, qty: number, unitCost: number) {
    if (!lines[material]) lines[material] = { material, unit, qty: 0, unitCost };
    lines[material].qty += qty;
  }

  for (const a of areas) {
    const sqft = a.length * a.width;
    const perimFt = 2 * (a.length + a.width);

    if (a.type === 'room') {
      // Drywall: walls + ceiling
      const wallSqft = perimFt * a.height;
      const ceilingSqft = sqft;
      const drywall = Math.ceil(((wallSqft + ceilingSqft) * WASTE_FACTOR) / 32); // 4x8 sheet = 32 sqft
      add('Drywall (4×8 sheets)', 'sheets', drywall, 14);

      // Framing lumber: studs @ 16" OC + plates
      const studs = Math.ceil((perimFt / 1.33 + 10) * WASTE_FACTOR); // ~1 stud per 16"
      const plates = Math.ceil((perimFt * 3 * WASTE_FACTOR) / 8); // 2× top/bottom plates, 8ft boards
      add('Framing lumber (2×4×8)', 'boards', studs + plates, 6.5);

      // Flooring (LVP default)
      const floorBags = Math.ceil((sqft * WASTE_FACTOR) / 20); // ~20 sqft/box
      add('LVP Flooring', 'boxes', floorBags, 45);

      // Paint: 1 gallon per 350 sqft, 2 coats
      const paintGal = Math.ceil(((wallSqft * 2) / 350) * WASTE_FACTOR);
      add('Interior Paint (gallon)', 'gallons', paintGal, 32);

      // Insulation batts for walls (R-13)
      const insBags = Math.ceil((wallSqft * WASTE_FACTOR) / 40); // ~40 sqft/bag
      add('Insulation R-13 batts', 'bags', insBags, 28);
    }

    if (a.type === 'roof') {
      // Roofing: 1 square = 100 sqft
      const roofSq = Math.ceil((sqft * 1.15 * WASTE_FACTOR) / 100); // 15% slope factor
      add('Roofing shingles (1 square)', 'squares', roofSq, 110);
      add('Roofing felt (1 square roll)', 'rolls', roofSq, 28);
      add('Roofing nails (1 lb box)', 'boxes', Math.ceil(roofSq * 0.5), 8);
    }

    if (a.type === 'slab') {
      // Concrete: length × width × 4" depth = cu yd
      const cuYd = Math.ceil(((sqft * (4 / 12)) / 27) * WASTE_FACTOR);
      add('Ready-mix concrete (cu yd)', 'cu yd', cuYd, 175);
      // Rebar: one grid @ 12"OC each direction ≈ 2 lb/sqft
      const rebarLb = Math.ceil(sqft * 2 * WASTE_FACTOR);
      add('Rebar #4 (per lb)', 'lbs', rebarLb, 0.65);
      // Vapor barrier
      add('Poly vapor barrier (100 sqft roll)', 'rolls', Math.ceil(sqft / 100), 18);
    }

    if (a.type === 'exterior_wall') {
      const wallSqft = a.length * a.height;
      // OSB sheathing (4x8)
      add('OSB Sheathing (4×8)', 'sheets', Math.ceil((wallSqft * WASTE_FACTOR) / 32), 22);
      // House wrap
      add('House wrap (sqft roll)', 'rolls', Math.ceil(wallSqft / 150), 65);
      // Exterior studs
      const studs = Math.ceil((a.length / 1.33 + 4) * WASTE_FACTOR);
      add('Framing lumber (2×6×8)', 'boards', studs, 9);
    }
  }

  return Object.values(lines);
}

const kpis: KpiItem[] = [
  { label: 'Areas entered', value: '0', sub: 'Ready to calculate', trend: 'neutral' },
  { label: 'Total material cost', value: '$0', sub: 'Est. at current rates', trend: 'neutral' },
  { label: 'Waste factor', value: '10%', sub: 'Industry standard', trend: 'neutral' },
  { label: 'Line items', value: '0', sub: 'Across all categories', trend: 'neutral' },
];

export default function MaterialsTakeoffDept({ onBack }: { onBack: () => void }) {
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', name: 'Living Room', length: 20, width: 15, height: 9, type: 'room' },
    { id: '2', name: 'Garage Slab', length: 22, width: 22, height: 0, type: 'slab' },
  ]);
  const [projectName, setProjectName] = useState('');

  function addArea() {
    setAreas(prev => [...prev, {
      id: Date.now().toString(),
      name: 'New Area',
      length: 10, width: 10, height: 9, type: 'room',
    }]);
  }

  function updateArea(id: string, field: keyof Area, value: string | number) {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  function removeArea(id: string) {
    setAreas(prev => prev.filter(a => a.id !== id));
  }

  const materials = computeMaterials(areas);
  const totalCost = materials.reduce((sum, m) => sum + m.qty * m.unitCost, 0);

  const liveKpis: KpiItem[] = [
    { label: 'Areas entered', value: String(areas.length), sub: 'Ready to calculate', trend: 'neutral' },
    { label: 'Total material cost', value: `$${totalCost.toLocaleString()}`, sub: 'Est. at current rates', trend: totalCost > 0 ? 'up' : 'neutral' },
    { label: 'Waste factor', value: '10%', sub: 'Industry standard', trend: 'neutral' },
    { label: 'Line items', value: String(materials.length), sub: 'Across all categories', trend: 'neutral' },
  ];

  function downloadCsv() {
    const rows = [
      ['Project', projectName || 'Untitled'],
      [],
      ['Material', 'Unit', 'Qty', 'Unit Cost', 'Total'],
      ...materials.map(m => [m.material, m.unit, m.qty, `$${m.unitCost}`, `$${(m.qty * m.unitCost).toLocaleString()}`]),
      [],
      ['', '', '', 'TOTAL', `$${totalCost.toLocaleString()}`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'takeoff.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DeptShell
      title="Materials Takeoff Calculator"
      icon={Ruler}
      kpis={liveKpis}
      aiTips={[
        { text: 'Lumber prices are currently elevated. Lock in quotes from 2+ suppliers before confirming material orders.', action: 'Find suppliers' },
        { text: 'Add a 5% contingency line to your takeoff for hidden site conditions — especially on slab work.', action: 'Add contingency' },
      ]}
      onBack={onBack}
    >
      {/* Project Header */}
      <SectionCard title="Project Info">
        <Input
          placeholder="Project name (optional)"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          className="bg-[#0d294f] border-amber-300/30 text-slate-100 mb-2"
        />
      </SectionCard>

      {/* Area Editor */}
      <SectionCard
        title="Areas / Zones"
        action={{ label: '+ Add area', onClick: addArea }}
      >
        <div className="space-y-3">
          {areas.map((area, idx) => (
            <div key={area.id} className="rounded-lg border border-amber-300/20 bg-[#0a1e3c] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-200">Area #{idx + 1}</span>
                <button onClick={() => removeArea(area.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Name</label>
                  <Input
                    value={area.name}
                    onChange={e => updateArea(area.id, 'name', e.target.value)}
                    className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Type</label>
                  <select
                    value={area.type}
                    onChange={e => updateArea(area.id, 'type', e.target.value)}
                    className="w-full h-8 text-xs border border-amber-300/20 bg-[#0d294f] rounded-md px-2 text-slate-100"
                  >
                    <option value="room">Interior Room</option>
                    <option value="slab">Concrete Slab</option>
                    <option value="roof">Roof Section</option>
                    <option value="exterior_wall">Exterior Wall</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Length (ft)</label>
                  <Input
                    type="number" min={1}
                    value={area.length}
                    onChange={e => updateArea(area.id, 'length', Number(e.target.value))}
                    className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Width (ft)</label>
                  <Input
                    type="number" min={1}
                    value={area.width}
                    onChange={e => updateArea(area.id, 'width', Number(e.target.value))}
                    className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
                  />
                </div>
                {(area.type === 'room' || area.type === 'exterior_wall') && (
                  <div>
                    <label className="text-[10px] text-slate-400 mb-0.5 block">Height (ft)</label>
                    <Input
                      type="number" min={1}
                      value={area.height}
                      onChange={e => updateArea(area.id, 'height', Number(e.target.value))}
                      className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
                    />
                  </div>
                )}
                <div className="sm:col-span-3 text-[10px] text-slate-400 mt-1">
                  Floor area: <span className="text-slate-200 font-medium">{(area.length * area.width).toLocaleString()} sqft</span>
                </div>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 border-amber-300/30 text-amber-200"
            onClick={addArea}
          >
            <Plus className="w-3.5 h-3.5" /> Add Area
          </Button>
        </div>
      </SectionCard>

      {/* Material Quantities */}
      {materials.length > 0 && (
        <SectionCard
          title="Calculated Material List"
          action={{ label: 'Export CSV', onClick: downloadCsv }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-slate-400 pb-2 font-medium">Material</th>
                  <th className="text-right text-slate-400 pb-2 font-medium">Qty</th>
                  <th className="text-right text-slate-400 pb-2 font-medium">Unit</th>
                  <th className="text-right text-slate-400 pb-2 font-medium">Unit $</th>
                  <th className="text-right text-slate-400 pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m, i) => (
                  <tr key={i} className="border-b border-slate-700/30 last:border-0">
                    <td className="py-2 text-slate-200">{m.material}</td>
                    <td className="py-2 text-right text-amber-200 font-mono">{m.qty.toLocaleString()}</td>
                    <td className="py-2 text-right text-slate-400">{m.unit}</td>
                    <td className="py-2 text-right text-slate-300">${m.unitCost}</td>
                    <td className="py-2 text-right text-slate-100 font-semibold">
                      ${(m.qty * m.unitCost).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-300/40">
                  <td colSpan={4} className="pt-3 text-right text-sm font-semibold text-amber-200">
                    Estimated Total
                  </td>
                  <td className="pt-3 text-right text-sm font-bold text-amber-300">
                    ${totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            * Prices are regional averages. Actual costs vary by supplier, location, and market conditions.
            Always get 3 quotes before purchasing.
          </p>
          <Button
            size="sm"
            className="mt-3 gap-1.5 bg-amber-400 text-slate-900 hover:bg-amber-300"
            onClick={downloadCsv}
          >
            <Download className="w-3.5 h-3.5" /> Download CSV
          </Button>
        </SectionCard>
      )}
    </DeptShell>
  );
}
