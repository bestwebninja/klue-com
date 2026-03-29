import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, UserCheck, Search } from 'lucide-react';
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
    heading: 'Residential Sales Agents',
    color: 'blue',
    services: [
      { name: "Buyer's Agents", specialties: ['Property Search & Showings', 'Offer Strategy', 'Inspection Guidance', 'Closing Coordination'] },
      { name: 'Listing / Seller Agents', specialties: ['Pre-Listing Consultation', 'Professional Photography', 'MLS & Portal Syndication', 'Open Houses & Showings'] },
      { name: 'First-Time Homebuyer Agents', specialties: ['Loan Pre-Approval Guidance', 'Neighborhood Education', 'Down Payment Assistance Programs', 'Step-by-Step Closing Support'] },
      { name: 'Luxury Residential Agents', specialties: ['$1M+ Buyer & Seller Representation', 'Exclusive Off-Market Access', 'White-Glove Service', 'Luxury Network Marketing'] },
      { name: 'New Construction Sales Agents', specialties: ['Builder Incentive Negotiation', 'Lot & Floor Plan Selection', 'Upgrade & Option Negotiations', 'Construction Timeline Monitoring'] },
    ],
  },
  {
    heading: 'Rental & Lease Agents',
    color: 'purple',
    services: [
      { name: 'Residential Lease Agents', specialties: ['Apartment & SFR Rentals', 'Tenant Screening Support', 'Lease Terms Negotiation', 'Move-In Coordination'] },
      { name: 'Commercial Lease Agents', specialties: ['Office & Retail Leasing', 'Tenant Representation', 'LOI & Lease Drafting Coordination', 'Buildout Allowance Negotiation'] },
      { name: 'Corporate Housing Agents', specialties: ['Furnished Rentals', '30–180 Day Stays', 'Relocation Services', 'Extended-Stay Negotiation'] },
      { name: 'Property Management Agents', specialties: ['Landlord Representation', 'Vacancy Marketing', 'Maintenance Coordination', 'Rent Roll Management'] },
    ],
  },
  {
    heading: 'Commercial Sales Agents',
    color: 'orange',
    services: [
      { name: 'Office Broker Agents', specialties: ['Tenant & Landlord Rep', 'Sublease Marketing', 'Lease vs. Buy Analysis', 'Flex & Coworking Spaces'] },
      { name: 'Retail Broker Agents', specialties: ['End-Cap & Inline Spaces', 'Strip Center Leasing', 'Anchor Store Deals', 'Pop-Up & Short-Term Retail'] },
      { name: 'Industrial Broker Agents', specialties: ['Warehouse & Distribution', 'Manufacturing Space', 'Cold Storage', 'Last-Mile Logistics Facilities'] },
      { name: 'Land Sales Agents', specialties: ['Residential Lots', 'Commercial Pads', 'Agricultural Land', 'Development Site Assemblage'] },
      { name: 'Investment Sales Agents (Commercial)', specialties: ['Cap Rate Pricing', 'NNN Single-Tenant', 'Multi-Family Sales', 'Portfolio Dispositions'] },
    ],
  },
  {
    heading: 'Investment & Specialty Agents',
    color: 'emerald',
    services: [
      { name: 'Investment Property Agents', specialties: ['SFR Portfolio Sales', 'DSCR Loan Qualifying Properties', 'Cash Flow First Analysis', 'Investor-Buyer Matching'] },
      { name: '1031 Exchange Agents', specialties: ['Upleg Property Identification', 'Exchange-Friendly Sellers', 'Boot Minimization Strategy', 'DST Referrals'] },
      { name: 'Distressed & REO Agents', specialties: ['Bank-Owned Properties', 'Short Sale Listings', 'Auction Properties', 'As-Is Seller Representation'] },
      { name: 'Probate & Estate Sale Agents', specialties: ['Court Confirmation Sales', 'Estate Liquidation', 'Heirs & Executor Representation', 'Off-Market Estate Deals'] },
    ],
  },
  {
    heading: 'Niche & Specialty Agents',
    color: 'amber',
    services: [
      { name: 'Military & VA Loan Specialists', specialties: ['VA Loan Expertise', 'BAH & Allowance Guidance', 'PCS Move Coordination', 'Military Community Knowledge'] },
      { name: 'Senior Housing Agents', specialties: ['Downsizing Assistance', 'Age-Restricted Community Sales', 'Senior Seller Representation', 'Power of Attorney Transactions'] },
      { name: 'Eco & Green Home Agents', specialties: ['Energy-Efficient Homes', 'Solar-Equipped Properties', 'LEED Certified Homes', 'Green MLS Listings'] },
      { name: 'International Buyer Agents', specialties: ['Foreign National Buyers', 'Currency Exchange Considerations', 'FIRPTA Compliance', 'Multi-Language Services'] },
    ],
  },
];

const quickRef = [
  '1031 Exchange Agents', 'Buyer\'s Agents', 'Commercial Investment Agents', 'Corporate Housing Agents',
  'Distressed & REO Agents', 'Eco & Green Home Agents', 'First-Time Homebuyer Agents', 'Industrial Brokers',
  'International Buyer Agents', 'Land Sales Agents', 'Lease Agents (Commercial)', 'Lease Agents (Residential)',
  'Listing / Seller Agents', 'Luxury Residential Agents', 'Military & VA Specialists', 'New Construction Agents',
  'Office Brokers', 'Probate & Estate Agents', 'Property Management Agents', 'Retail Brokers',
  'Senior Housing Agents', 'Investment Property Agents',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', heading: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', btn: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950' },
  amber:   { badge: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',       heading: 'text-primary',   dot: 'bg-primary',   border: 'border-primary/30 dark:border-primary/40',     btn: 'border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20' },
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
          <span className="text-xs text-muted-foreground ml-1">({section.services.length} agent types)</span>
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
                    <UserCheck className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
                        <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                          Post a Job
                        </Button>
                      </Link>
                      <Link to="/browse-providers">
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find Agents Near Me
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

export default function SalesAgentsDirectory() {
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
          <UserCheck className="w-7 h-7 text-blue-600" />
          Sales Agents Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every agent type and specialty. Click a section to expand, then click an agent type to see what they do and find the right agent for your transaction.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search agent types or specialties…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3 mb-12">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">No agent types match your search.</p>
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
            <span className="font-semibold text-base text-foreground">Quick Reference — All Agent Types (A–Z)</span>
            <span className="text-xs text-muted-foreground">({quickRef.length} types)</span>
          </div>
          <div className="p-5 bg-card/50">
            <div className="flex flex-wrap gap-2">
              {quickRef.map(t => (
                <Link key={t} to="/post-job">
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-2.5 cursor-pointer hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 transition-colors"
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
