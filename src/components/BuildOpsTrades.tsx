import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HardHat, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/* ── Data ─────────────────────────────────────────────────────── */
interface Trade {
  name: string;
  specialties: string[];
}

interface TradeSection {
  heading: string;
  color: string;           // tailwind accent colour class
  trades: Trade[];
}

const sections: TradeSection[] = [
  {
    heading: 'Core Structural & Envelope Trades',
    color: 'orange',
    trades: [
      { name: 'Carpenters', specialties: ['Framing', 'Finish Carpentry', 'Trim & Cabinetry'] },
      { name: 'Roofers', specialties: ['Shingle', 'Tile', 'Metal', 'Flat Roof / TPO / EPDM'] },
      { name: 'Masons / Bricklayers / Stone Masons', specialties: ['Brick', 'Block', 'Natural Stone', 'Mortar Repair'] },
      { name: 'Concrete Workers', specialties: ['Foundations', 'Driveways', 'Patios', 'Slabs', 'Stamped Concrete'] },
      { name: 'Siding Installers', specialties: ['Vinyl', 'Fiber Cement', 'Wood', 'Stucco Repair', 'HardiePlank'] },
      { name: 'Window & Door Installers', specialties: ['Replacement Windows', 'Entry Doors', 'Sliding Doors', 'Weather Sealing'] },
      { name: 'Deck & Porch Builders', specialties: ['Wood Decking', 'Composite Decking', 'Screened Porches', 'Pergolas'] },
    ],
  },
  {
    heading: 'Interior & Finishing Trades',
    color: 'blue',
    trades: [
      { name: 'Plumbers', specialties: ['Water Lines', 'Drain Lines', 'Gas Lines', 'Fixtures', 'Tankless Water Heaters'] },
      { name: 'Electricians', specialties: ['Wiring', 'Panel Upgrades', 'Lighting', 'EV Chargers', 'Low-Voltage'] },
      { name: 'Drywall Installers & Finishers', specialties: ['Hanging', 'Taping', 'Mudding', 'Texturing', 'Knockdown'] },
      { name: 'Painters', specialties: ['Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Epoxy Floors'] },
      { name: 'Tilers', specialties: ['Floor Tile', 'Wall Tile', 'Shower Tile', 'Backsplash', 'Ceramic / Porcelain / Stone'] },
      { name: 'Flooring Installers', specialties: ['Hardwood', 'Laminate', 'Carpet', 'Vinyl', 'Luxury Vinyl Plank (LVP)'] },
      { name: 'Cabinet & Countertop Installers', specialties: ['Kitchen Cabinets', 'Bath Vanities', 'Granite', 'Quartz', 'Laminate Tops'] },
      { name: 'Appliance Installers', specialties: ['Built-In Appliances', 'Range Hoods', 'Dishwashers', 'Gas Hookup'] },
    ],
  },
  {
    heading: 'Specialty & Low-Voltage Trades',
    color: 'purple',
    trades: [
      { name: 'CCTV / Security Camera Installers', specialties: ['Low-Voltage Wiring', 'NVR Systems', 'Smart Home Security', 'Access Control'] },
      { name: 'HVAC Technicians', specialties: ['Heating', 'Ventilation', 'Air Conditioning', 'Ductwork', 'Mini-Splits'] },
      { name: 'Insulation Installers', specialties: ['Attic Insulation', 'Wall Insulation', 'Spray Foam', 'Batt & Roll'] },
      { name: 'Gutter & Downspout Installers', specialties: ['Seamless Gutters', 'K-Style', 'Half-Round', 'Gutter Guards'] },
      { name: 'Pavers / Hardscape Specialists', specialties: ['Paver Driveways', 'Walkways', 'Patios', 'Concrete Pavers', 'Travertine'] },
    ],
  },
  {
    heading: 'Fix & Flip Specific Crews',
    color: 'emerald',
    trades: [
      { name: 'Fix & Flip Renovation Crews', specialties: ['Full Gut-to-Glam', 'SFH Flips', 'Carpenters', 'Painters', 'Demo Crews'] },
      { name: 'Kitchen & Bathroom Remodeling Crews', specialties: ['Turn-Key Kitchen Remodels', 'Master Bath', 'Hall Bath', 'Permits Included'] },
      { name: 'Demolition & Hauling Crews', specialties: ['Interior Demo', 'Selective Demo', 'Fast Debris Removal', 'Dumpster Coordination'] },
      { name: 'Whole-House Renovation Generalist Crews', specialties: ['Full Scope', 'Fast Turnaround', 'Investor-Friendly Pricing'] },
    ],
  },
  {
    heading: 'Supporting / Site Trades',
    color: 'amber',
    trades: [
      { name: 'Excavation & Grading Crews', specialties: ['Site Prep', 'Grading', 'Trenching', 'Drainage'] },
      { name: 'Foundation Repair Specialists', specialties: ['Crack Repair', 'Underpinning', 'Waterproofing', 'Pier Installation'] },
      { name: 'Fence Installers', specialties: ['Wood Fence', 'Vinyl Fence', 'Chain Link', 'Ornamental Iron'] },
      { name: 'Landscaping / Hardscaping Crews', specialties: ['Lawn Care', 'Irrigation', 'Retaining Walls', 'Outdoor Living'] },
      { name: 'Pest Control & Termite Treatment Teams', specialties: ['Pre-Drywall Treatment', 'Termite Inspection', 'General Pest', 'Fumigation'] },
    ],
  },
];

const quickRef = [
  'Appliance Installers', 'Carpenters', 'CCTV / Security Installers', 'Concrete Workers',
  'Countertop Installers', 'Demolition Crews', 'Drywallers', 'Electricians',
  'Excavation Crews', 'Fix & Flip Renovation Crews', 'Flooring Installers', 'Foundation Repair',
  'Gutter Installers', 'HVAC Technicians', 'Kitchen/Bath Remodel Crews', 'Masons',
  'Painters', 'Pavers / Hardscapers', 'Plumbers', 'Roofers',
  'Siding Installers', 'Tilers', 'Window & Door Installers',
];

/* ── Colour helpers ───────────────────────────────────────────── */
const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', heading: 'text-orange-500', dot: 'bg-orange-500', border: 'border-orange-200 dark:border-orange-800', btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',         heading: 'text-blue-500',   dot: 'bg-blue-500',   border: 'border-blue-200 dark:border-blue-800',   btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', heading: 'text-purple-500', dot: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-800', btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', heading: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', btn: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950' },
  amber:   { badge: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',     heading: 'text-primary',  dot: 'bg-primary',  border: 'border-primary/30 dark:border-primary/40',   btn: 'border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20' },
};

/* ── Sub-component: one section accordion ────────────────────── */
function TradeGroup({ section, defaultOpen }: { section: TradeSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const c = colorMap[section.color];

  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden`}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
          <span className={`font-semibold text-base ${c.heading}`}>{section.heading}</span>
          <span className="text-xs text-muted-foreground ml-1">({section.trades.length} trades)</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Trade list */}
      {open && (
        <div className="divide-y divide-border">
          {section.trades.map(trade => {
            const isExpanded = expandedTrade === trade.name;
            return (
              <div key={trade.name} className="bg-card/50">
                {/* Trade row */}
                <button
                  onClick={() => setExpandedTrade(isExpanded ? null : trade.name)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">{trade.name}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Trade detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-muted/20">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trade.specialties.map(s => (
                        <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{s}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/post-job`}>
                        <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
                          Post a {trade.name.split(' ')[0]} Job
                        </Button>
                      </Link>
                      <Link to={`/browse-providers`}>
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find {trade.name.split(' ')[0]}s Near Me
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

/* ── Main export ──────────────────────────────────────────────── */
export default function BuildOpsTrades() {
  const [search, setSearch] = useState('');

  const filtered = search.trim().length > 1
    ? sections.map(s => ({
        ...s,
        trades: s.trades.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.specialties.some(sp => sp.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter(s => s.trades.length > 0)
    : sections;

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <HardHat className="w-7 h-7 text-orange-500" />
          Build Ops Trades Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every trade category. Click a section to expand, then click a trade to see specialties and find pros near you.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search trades or specialties…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Accordion sections */}
      <div className="space-y-3 mb-12">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">No trades match your search.</p>
        ) : (
          filtered.map((section, i) => (
            <TradeGroup key={section.heading} section={section} defaultOpen={i === 0} />
          ))
        )}
      </div>

      {/* Quick Reference */}
      {!search && (
        <div className="border rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex items-center gap-2 border-b">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
            <span className="font-semibold text-base text-foreground">Quick Reference — All Trades (A–Z)</span>
            <span className="text-xs text-muted-foreground">({quickRef.length} trades)</span>
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
