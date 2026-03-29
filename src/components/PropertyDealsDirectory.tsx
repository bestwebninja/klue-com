import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Building2, Search } from 'lucide-react';
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
    heading: 'Residential Transactions',
    color: 'blue',
    services: [
      { name: 'Residential Buyer Agents', specialties: ['First-Time Buyers', 'Move-Up Buyers', 'Relocation Buyers', 'New Construction Buyers'] },
      { name: 'Residential Listing Agents', specialties: ['Pre-Market Strategy', 'Staging Coordination', 'MLS Listing Optimization', 'Multiple Offer Management'] },
      { name: 'Luxury Home Specialists', specialties: ['$1M+ Properties', 'Off-Market Luxury', 'International Buyers', 'Lifestyle Marketing'] },
      { name: 'New Construction Specialists', specialties: ['Builder Representation', 'Spec Home Negotiation', 'Custom Build Advisory', 'Pre-Construction Contracts'] },
      { name: 'Relocation Specialists', specialties: ['Corporate Relocation', 'Military Relocation (RELO)', 'Cross-State Moves', 'Destination Services'] },
    ],
  },
  {
    heading: 'Investment Property Deals',
    color: 'green',
    services: [
      { name: 'Fix & Flip Specialists', specialties: ['ARV Analysis', 'Rehab Cost Estimation', 'Investor-Friendly Agents', 'Fast Closing Deals'] },
      { name: 'Buy & Hold Investment Advisors', specialties: ['Cash Flow Analysis', 'Cap Rate Evaluation', 'Multi-Family Acquisition', 'SFR Portfolio Building'] },
      { name: 'BRRRR Strategy Advisors', specialties: ['Buy-Rehab-Rent-Refinance', 'After-Repair Value (ARV)', 'Cash-Out Refinance Timing', 'Equity Stack Analysis'] },
      { name: 'Short-Term Rental (STR) Advisors', specialties: ['Airbnb & VRBO Markets', 'STR Regulation Research', 'Revenue Projections', 'Furnished Turnkey Deals'] },
      { name: 'Multi-Family Investors & Brokers', specialties: ['Duplex to 4-Plex', 'Apartment Complex Acquisitions', 'Value-Add Opportunities', 'NOI Improvement Strategy'] },
    ],
  },
  {
    heading: 'Commercial Real Estate',
    color: 'orange',
    services: [
      { name: 'Office Space Brokers', specialties: ['Tenant Representation', 'Office Leasing', 'Lease Renewal Negotiations', 'Sublease Advisory'] },
      { name: 'Retail Space Brokers', specialties: ['Retail Site Selection', 'Anchor Tenant Deals', 'Shopping Center Leasing', 'NNN Lease Negotiations'] },
      { name: 'Industrial & Warehouse Brokers', specialties: ['Distribution Centers', 'Cold Storage', 'Last-Mile Warehousing', 'Manufacturing Facilities'] },
      { name: 'Land Brokers', specialties: ['Residential Land', 'Commercial Land', 'Agricultural Land', 'Development Sites'] },
      { name: 'Mixed-Use & Development Brokers', specialties: ['Mixed-Use Projects', 'Ground-Up Development Sites', 'Adaptive Reuse', 'TOD (Transit-Oriented Development)'] },
    ],
  },
  {
    heading: 'Off-Market & Wholesale Deals',
    color: 'purple',
    services: [
      { name: 'Wholesalers', specialties: ['Contract Assignment', 'Cash Buyer Networks', 'Distressed Seller Outreach', 'Wholesale JV Deals'] },
      { name: 'Off-Market Property Scouts', specialties: ['Driving for Dollars', 'Skip Tracing', 'Direct Mail Campaigns', 'Pre-Foreclosure Leads'] },
      { name: 'Auction & Foreclosure Specialists', specialties: ['Courthouse Steps Auctions', 'Online Auction Platforms', 'REO Properties', 'Tax Deed Sales'] },
      { name: 'Note Buyers & Sellers', specialties: ['Performing Notes', 'Non-Performing Notes', 'Mortgage Note Investing', 'Seller Financing Creation'] },
    ],
  },
  {
    heading: 'Valuation & Deal Analysis',
    color: 'amber',
    services: [
      { name: 'Certified Appraisers', specialties: ['Residential Appraisals', 'Commercial Appraisals', 'Estate Appraisals', 'Divorce Settlement Appraisals'] },
      { name: 'Investment Underwriters', specialties: ['Deal Underwriting Models', 'Sensitivity Analysis', 'Debt Coverage Ratio', 'Return on Equity (ROE)'] },
      { name: 'Market Research Analysts', specialties: ['Comparable Sales Analysis', 'Absorption Rate Studies', 'Demographic Trends', 'Neighborhood Growth Indicators'] },
      { name: '1031 Exchange Specialists', specialties: ['Qualified Intermediary', 'Exchange Identification Period', 'DST (Delaware Statutory Trust)', 'Reverse Exchange'] },
    ],
  },
];

const quickRef = [
  '1031 Exchange Specialists', 'Auction & Foreclosure Specialists', 'BRRRR Strategy Advisors',
  'Buy & Hold Advisors', 'Certified Appraisers', 'Commercial Land Brokers', 'Fix & Flip Specialists',
  'Industrial Brokers', 'Investment Underwriters', 'Land Brokers', 'Luxury Home Specialists',
  'Market Research Analysts', 'Mixed-Use Brokers', 'Multi-Family Brokers', 'New Construction Specialists',
  'Note Buyers & Sellers', 'Off-Market Scouts', 'Office Space Brokers', 'Relocation Specialists',
  'Residential Buyer Agents', 'Retail Space Brokers', 'STR Advisors', 'Wholesalers',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  green:   { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',       heading: 'text-green-600',   dot: 'bg-green-500',   border: 'border-green-200 dark:border-green-800',     btn: 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950' },
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
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
                    <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                          Post a Deal Job
                        </Button>
                      </Link>
                      <Link to="/browse-providers">
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find {service.name.split(' ')[0]}s Near Me
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

export default function PropertyDealsDirectory() {
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
          <Building2 className="w-7 h-7 text-green-600" />
          Property Deals Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every real estate transaction type. Click a section to expand, then click a service to see specialties and connect with experienced real estate professionals.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search property types or deal strategies…"
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
            <span className="font-semibold text-base text-foreground">Quick Reference — All Deal Types (A–Z)</span>
            <span className="text-xs text-muted-foreground">({quickRef.length} types)</span>
          </div>
          <div className="p-5 bg-card/50">
            <div className="flex flex-wrap gap-2">
              {quickRef.map(t => (
                <Link key={t} to="/post-job">
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-2.5 cursor-pointer hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-green-300 transition-colors"
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
