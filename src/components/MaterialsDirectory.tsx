import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Service {
  name: string;
  specialties: string[];
}

interface ServiceSection {
  heading: string;
  color: string;
  services: Service[];
}

const sections: ServiceSection[] = [
  {
    heading: 'Structural & Framing Materials',
    color: 'orange',
    services: [
      { name: 'Lumber Suppliers', specialties: ['Dimensional Lumber (2x4–2x12)', 'Plywood & OSB Sheathing', 'Pressure-Treated Lumber', 'Framing Packages'] },
      { name: 'Engineered Wood (LVL / I-Joist) Suppliers', specialties: ['LVL Beams', 'Parallam / PSL Beams', 'Wood I-Joists (TJI)', 'Floor System Packages'] },
      { name: 'Steel & Metal Framing Suppliers', specialties: ['Steel Studs & Track', 'Structural Steel (Wide Flange)', 'Cold-Formed Steel', 'Metal Deck'] },
      { name: 'Concrete & Masonry Suppliers', specialties: ['Ready-Mix Concrete', 'Concrete Block (CMU)', 'Brick & Stone', 'Mortar & Grout'] },
      { name: 'Foundation & Waterproofing Suppliers', specialties: ['Poured Concrete Systems', 'ICF (Insulated Concrete Forms)', 'Waterproofing Membranes', 'Drainage Board'] },
    ],
  },
  {
    heading: 'Mechanical, Electrical & Plumbing (MEP) Supplies',
    color: 'blue',
    services: [
      { name: 'Electrical Supply Houses', specialties: ['Wire & Cable', 'Conduit & Fittings', 'Panels & Breakers', 'Lighting Fixtures'] },
      { name: 'Plumbing Wholesalers', specialties: ['Copper & PEX Pipe', 'Fittings & Valves', 'Fixtures & Faucets', 'Water Heaters'] },
      { name: 'HVAC Equipment Distributors', specialties: ['Residential Split Systems', 'Commercial Packaged Units', 'Mini-Split Systems', 'Ductwork & Accessories'] },
      { name: 'Low-Voltage & Security Material Suppliers', specialties: ['Cat6 / Fiber Optic Cable', 'Security Camera Hardware', 'Access Control Hardware', 'AV & Structured Wiring'] },
      { name: 'Fire Protection Suppliers', specialties: ['Sprinkler Heads & Pipe', 'Fire Alarm Devices', 'Extinguishers', 'Suppression System Components'] },
    ],
  },
  {
    heading: 'Finishing & Interior Materials',
    color: 'purple',
    services: [
      { name: 'Flooring Suppliers', specialties: ['Hardwood Flooring', 'LVP / Luxury Vinyl Plank', 'Tile & Stone', 'Carpet & Padding'] },
      { name: 'Drywall & Insulation Suppliers', specialties: ['Drywall Sheets (1/2", 5/8")', 'Fiberglass Batt Insulation', 'Spray Foam Insulation', 'Sound Insulation'] },
      { name: 'Paint & Coatings Suppliers', specialties: ['Interior Wall Paint', 'Exterior Coatings', 'Primer & Sealers', 'Epoxy Floor Coatings'] },
      { name: 'Tile, Stone & Countertop Suppliers', specialties: ['Ceramic & Porcelain Tile', 'Natural Stone (Marble / Granite)', 'Quartz Slabs', 'Backsplash Tile'] },
      { name: 'Millwork & Trim Suppliers', specialties: ['Interior Door Units', 'Baseboards & Casings', 'Crown Molding', 'Stair Components'] },
      { name: 'Cabinet & Vanity Suppliers', specialties: ['Stock Cabinets', 'Semi-Custom Cabinets', 'Bath Vanities', 'RTA (Ready-to-Assemble)'] },
    ],
  },
  {
    heading: 'Exterior, Roofing & Site Materials',
    color: 'emerald',
    services: [
      { name: 'Roofing Material Suppliers', specialties: ['Asphalt Shingles', 'Metal Roofing Panels', 'TPO / EPDM Flat Roofing', 'Underlayment & Flashing'] },
      { name: 'Siding & Cladding Suppliers', specialties: ['Vinyl Siding', 'Fiber Cement (HardiePlank)', 'Wood & Cedar Siding', 'EIFS / Stucco Systems'] },
      { name: 'Window & Door Distributors', specialties: ['Replacement Windows', 'Impact-Resistant Windows', 'Exterior Entry Doors', 'Sliding & Bi-Fold Doors'] },
      { name: 'Hardscape & Landscape Material Suppliers', specialties: ['Concrete Pavers', 'Natural Stone Pavers', 'Retaining Wall Block', 'Gravel & Mulch'] },
      { name: 'Waterproofing & Drainage Suppliers', specialties: ['Sheet Membrane Waterproofing', 'Liquid Applied Membranes', 'French Drain Components', 'Sump Pump Systems'] },
    ],
  },
  {
    heading: 'Hardware, Tools & Equipment',
    color: 'amber',
    services: [
      { name: 'Hardware Distributors', specialties: ['Fasteners & Anchors', 'Door Hardware', 'Structural Connectors (Simpson)', 'Adhesives & Sealants'] },
      { name: 'Power Tool & Equipment Suppliers', specialties: ['Cordless Tool Sets', 'Pneumatic Nailers', 'Saws & Grinders', 'Laser Levels'] },
      { name: 'Heavy Equipment Rental Companies', specialties: ['Excavators', 'Boom Lifts & Scissor Lifts', 'Skid Steers', 'Concrete Pumps'] },
      { name: 'Safety Equipment Suppliers', specialties: ['Hard Hats & PPE', 'Fall Protection Systems', 'Safety Signage', 'First Aid & AED'] },
      { name: 'Concrete & Masonry Tool Suppliers', specialties: ['Concrete Forms', 'Vibrators', 'Trowels & Floats', 'Masonry Saws'] },
    ],
  },
];

const quickRef = [
  'Brick & Stone Suppliers', 'Cabinet & Vanity Suppliers', 'Concrete Suppliers', 'Drywall Suppliers',
  'Electrical Supply Houses', 'Engineered Wood Suppliers', 'Fasteners & Hardware', 'Fire Protection Suppliers',
  'Flooring Suppliers', 'Foundation Suppliers', 'Hardscape Material Suppliers', 'Heavy Equipment Rental',
  'HVAC Distributors', 'Insulation Suppliers', 'Low-Voltage Material Suppliers', 'Lumber Suppliers',
  'Millwork & Trim Suppliers', 'Paint & Coatings', 'Plumbing Wholesalers', 'Power Tool Suppliers',
  'Roofing Material Suppliers', 'Safety Equipment', 'Siding Suppliers', 'Steel Suppliers',
  'Tile & Stone Suppliers', 'Window & Door Distributors',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', heading: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', btn: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950' },
  amber:   { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',       heading: 'text-amber-500',   dot: 'bg-amber-500',   border: 'border-amber-200 dark:border-amber-800',     btn: 'border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950' },
};

function ServiceGroup({ section, defaultOpen }: { section: ServiceSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const c = colorMap[section.color];

  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
          <span className={`font-semibold text-base ${c.heading}`}>{section.heading}</span>
          <span className="text-xs text-muted-foreground ml-1">({section.services.length} supplier types)</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="divide-y divide-border">
          {section.services.map(service => {
            const isExpanded = expandedService === service.name;
            return (
              <div key={service.name} className="bg-card/50">
                <button
                  onClick={() => setExpandedService(isExpanded ? null : service.name)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">{service.name}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-muted/20">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {service.specialties.map(s => (
                        <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{s}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/post-job">
                        <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
                          Request a Materials Quote
                        </Button>
                      </Link>
                      <Link to="/browse-providers">
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find Suppliers Near Me
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MaterialsDirectory() {
  const [search, setSearch] = useState('');

  const filtered = search.trim().length > 1
    ? sections.map(s => ({
        ...s,
        services: s.services.filter(sv =>
          sv.name.toLowerCase().includes(search.toLowerCase()) ||
          sv.specialties.some(sp => sp.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter(s => s.services.length > 0)
    : sections;

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Package className="w-7 h-7 text-orange-500" />
          Materials & Supply Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every building material and supply category. Click a section to expand, then click a supplier type to see what they stock and request competitive quotes.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search materials or supplier types…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3 mb-12">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">No suppliers match your search.</p>
        ) : (
          filtered.map((section, i) => (
            <ServiceGroup key={section.heading} section={section} defaultOpen={i === 0} />
          ))
        )}
      </div>

      {!search && (
        <div className="border rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex items-center gap-2 border-b">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
            <span className="font-semibold text-base text-foreground">Quick Reference — All Supplier Types (A–Z)</span>
            <span className="text-xs text-muted-foreground">({quickRef.length} types)</span>
          </div>
          <div className="p-5 bg-card/50">
            <div className="flex flex-wrap gap-2">
              {quickRef.map(t => (
                <Link key={t} to="/post-job">
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-2.5 cursor-pointer hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/40 dark:hover:text-orange-300 transition-colors"
                  >
                    {t}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
