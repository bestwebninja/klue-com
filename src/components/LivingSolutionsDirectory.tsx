import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Home, Search } from 'lucide-react';
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
    heading: 'Renovation & Remodeling',
    color: 'orange',
    services: [
      { name: 'Kitchen Remodelers', specialties: ['Full Kitchen Gut & Remodel', 'Cabinet Replacement', 'Countertop Installation', 'Open Concept Conversions'] },
      { name: 'Bathroom Remodelers', specialties: ['Master Bath Renovation', 'Walk-In Shower Conversions', 'Tub-to-Shower Conversions', 'Tile & Fixture Upgrades'] },
      { name: 'Basement Finishing Contractors', specialties: ['Finished Living Space', 'Home Theater Buildout', 'In-Law Suite', 'Egress Window Installation'] },
      { name: 'Room Addition Contractors', specialties: ['Garage Conversions', 'Sunroom Additions', 'Master Suite Additions', 'ADU / Granny Flat'] },
      { name: 'Whole-Home Renovation Contractors', specialties: ['Full Gut Renovation', 'Flip-Ready Makeovers', 'Historic Home Restoration', 'Open Floor Plan Remodels'] },
    ],
  },
  {
    heading: 'Home Repair & Maintenance',
    color: 'blue',
    services: [
      { name: 'Handymen', specialties: ['Drywall Patching', 'Door & Window Repair', 'Fixture Replacement', 'Small Plumbing & Electrical Fixes'] },
      { name: 'Plumbing Repair Specialists', specialties: ['Leak Detection & Repair', 'Drain Cleaning', 'Water Heater Replacement', 'Pipe Burst Repair'] },
      { name: 'Electrical Repair Specialists', specialties: ['Outlet & Switch Replacement', 'Circuit Breaker Issues', 'Ceiling Fan Installation', 'GFCI Installation'] },
      { name: 'HVAC Maintenance Technicians', specialties: ['Seasonal Tune-Ups', 'Filter Replacement', 'Duct Cleaning', 'Thermostat Installation'] },
      { name: 'Appliance Repair Technicians', specialties: ['Washer & Dryer Repair', 'Refrigerator Repair', 'Oven & Dishwasher Repair', 'Same-Day Service'] },
      { name: 'Roofing Repair Specialists', specialties: ['Leak Repair', 'Shingle Replacement', 'Flashing Repair', 'Gutter Repair & Cleaning'] },
    ],
  },
  {
    heading: 'Cleaning & Home Care',
    color: 'purple',
    services: [
      { name: 'House Cleaning Services', specialties: ['Weekly & Bi-Weekly Cleaning', 'Deep House Cleaning', 'Post-Party Cleanup', 'Eco-Friendly Cleaning'] },
      { name: 'Move-In / Move-Out Cleaners', specialties: ['Tenant Turnover Cleaning', 'Security Deposit Cleaning', 'Appliance Deep Clean', 'Window Washing'] },
      { name: 'Pressure Washing Services', specialties: ['Driveway & Walkway Cleaning', 'House Exterior Washing', 'Deck & Patio Cleaning', 'Roof Soft Washing'] },
      { name: 'Window Cleaning Services', specialties: ['Interior & Exterior Windows', 'Screen Cleaning', 'High-Rise Window Cleaning', 'Post-Construction Cleaning'] },
      { name: 'Junk Removal & Hauling', specialties: ['Furniture & Appliance Removal', 'Yard Waste Hauling', 'Estate Cleanouts', 'Construction Debris Removal'] },
    ],
  },
  {
    heading: 'Outdoor & Landscaping Services',
    color: 'emerald',
    services: [
      { name: 'Lawn Care Services', specialties: ['Weekly Mowing', 'Fertilization Programs', 'Weed Control', 'Lawn Aeration & Overseeding'] },
      { name: 'Tree Services', specialties: ['Tree Trimming & Pruning', 'Tree Removal', 'Stump Grinding', 'Emergency Storm Cleanup'] },
      { name: 'Landscape Designers', specialties: ['Full Yard Redesigns', 'Garden & Planting Plans', 'Seasonal Color Planting', 'Drought-Tolerant Landscaping'] },
      { name: 'Irrigation Specialists', specialties: ['Sprinkler System Installation', 'Drip Irrigation', 'Backflow Testing', 'Seasonal Start-Up & Winterization'] },
      { name: 'Snow Removal Services', specialties: ['Driveway Plowing', 'Sidewalk Salting', 'Commercial Snow Contracts', 'Emergency Snow Removal'] },
      { name: 'Outdoor Living Builders', specialties: ['Deck & Patio Construction', 'Pergolas & Shade Structures', 'Fire Pit Installation', 'Outdoor Kitchens'] },
    ],
  },
  {
    heading: 'Interior Design & Smart Home',
    color: 'amber',
    services: [
      { name: 'Interior Decorators', specialties: ['Room Styling', 'Furniture Selection & Arrangement', 'Color Palette Consultation', 'Artwork & Accessory Curation'] },
      { name: 'Home Stagers', specialties: ['Pre-Sale Home Staging', 'Vacant Property Staging', 'Occupied Staging Consultation', 'Virtual Staging'] },
      { name: 'Smart Home Installers', specialties: ['Smart Thermostat', 'Smart Lock & Doorbell', 'Home Automation', 'Whole-Home Audio & Video'] },
      { name: 'Custom Closet & Storage Specialists', specialties: ['Walk-In Closet Design', 'Reach-In Closet Systems', 'Garage Storage', 'Pantry Organization'] },
      { name: 'Moving Services', specialties: ['Local Moves', 'Long-Distance Moves', 'Packing & Unpacking', 'Furniture Assembly'] },
    ],
  },
];

const quickRef = [
  'Appliance Repair', 'Basement Finishing', 'Bathroom Remodelers', 'Custom Closet Specialists',
  'Deck & Patio Builders', 'Electrical Repair', 'Handymen', 'House Cleaners',
  'HVAC Maintenance', 'Interior Decorators', 'Irrigation Specialists', 'Junk Removal',
  'Kitchen Remodelers', 'Landscape Designers', 'Lawn Care Services', 'Moving Services',
  'Plumbing Repair', 'Pressure Washing', 'Room Additions', 'Roofing Repair',
  'Smart Home Installers', 'Snow Removal', 'Tree Services', 'Window Cleaners', 'Whole-Home Renovation',
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
          <span className="text-xs text-muted-foreground ml-1">({section.services.length} services)</span>
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
                    <Home className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
                          Post a {service.name.split(' ')[0]} Job
                        </Button>
                      </Link>
                      <Link to="/browse-providers">
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find Pros Near Me
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

export default function LivingSolutionsDirectory() {
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
          <Home className="w-7 h-7 text-orange-500" />
          Living Solutions Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every home service category. Click a section to expand, then click a service to see specialties and find trusted local home professionals near you.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search home services or specialties…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3 mb-12">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">No services match your search.</p>
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
            <span className="font-semibold text-base text-foreground">Quick Reference — All Services (A–Z)</span>
            <span className="text-xs text-muted-foreground">({quickRef.length} services)</span>
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
