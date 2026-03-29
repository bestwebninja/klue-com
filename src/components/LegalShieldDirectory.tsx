import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Scale, Search } from 'lucide-react';
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
    heading: 'Construction & Contractor Law',
    color: 'orange',
    services: [
      { name: 'Construction Attorneys', specialties: ['Prime Contracts', 'Subcontractor Agreements', 'Change Order Disputes', 'Delay Claims'] },
      { name: 'Contract Drafters & Reviewers', specialties: ['AIA Contract Review', 'ConsensusDocs', 'Custom Contract Drafting', 'Indemnification Clauses'] },
      { name: 'Mechanic Lien Attorneys', specialties: ['Lien Filing', 'Lien Release', 'Lien Foreclosure', 'Preliminary Notices'] },
      { name: 'Bid Protest & Procurement Lawyers', specialties: ['Public Bid Protests', 'Prevailing Wage', 'Davis-Bacon Compliance', 'Government Contracting'] },
      { name: 'Construction Defect Attorneys', specialties: ['Defect Claims', 'Insurance Coverage Disputes', 'Expert Witness Coordination', 'Repair Cost Litigation'] },
    ],
  },
  {
    heading: 'Real Estate Law',
    color: 'blue',
    services: [
      { name: 'Real Estate Attorneys', specialties: ['Residential Closings', 'Commercial Transactions', 'Title Review', 'Due Diligence'] },
      { name: 'Title & Escrow Attorneys', specialties: ['Title Search', 'Title Insurance', 'Escrow Services', 'Cloud on Title Resolution'] },
      { name: 'Landlord-Tenant Attorneys', specialties: ['Lease Drafting', 'Eviction Proceedings', 'Security Deposit Disputes', 'Habitability Claims'] },
      { name: 'Zoning & Land Use Attorneys', specialties: ['Variance Applications', 'Rezoning Petitions', 'Environmental Review', 'Annexation Proceedings'] },
      { name: 'Foreclosure & REO Attorneys', specialties: ['Judicial Foreclosure', 'Non-Judicial Foreclosure', 'REO Closings', 'Loan Modification Negotiations'] },
    ],
  },
  {
    heading: 'Business & Corporate Law',
    color: 'purple',
    services: [
      { name: 'Business Formation Attorneys', specialties: ['LLC Formation', 'S-Corp Setup', 'Partnership Agreements', 'Operating Agreements'] },
      { name: 'Corporate & Commercial Attorneys', specialties: ['M&A Transactions', 'Shareholder Agreements', 'Corporate Governance', 'Due Diligence'] },
      { name: 'Franchise Attorneys', specialties: ['FDD Review', 'Franchise Agreements', 'Area Development Agreements', 'Franchise Disputes'] },
      { name: 'Intellectual Property Attorneys', specialties: ['Trademark Registration', 'Trade Secret Protection', 'Brand Protection', 'Copyright'] },
    ],
  },
  {
    heading: 'Dispute Resolution & Litigation',
    color: 'red',
    services: [
      { name: 'Litigation Attorneys', specialties: ['Civil Litigation', 'Commercial Disputes', 'Jury Trials', 'Appeals'] },
      { name: 'Mediators', specialties: ['Construction Mediation', 'Commercial Mediation', 'Real Estate Mediation', 'AAA / JAMS Certified'] },
      { name: 'Arbitrators', specialties: ['Binding Arbitration', 'Construction Disputes', 'International Arbitration', 'Fast-Track Arbitration'] },
      { name: 'Collections Attorneys', specialties: ['Commercial Debt Collection', 'Judgment Enforcement', 'Garnishment', 'Skip Tracing'] },
    ],
  },
  {
    heading: 'Compliance & Regulatory Law',
    color: 'amber',
    services: [
      { name: 'Compliance Consultants & Attorneys', specialties: ['Contractor Licensing Compliance', 'State Board Requirements', 'Continuing Education', 'License Reinstatement'] },
      { name: 'OSHA & Safety Attorneys', specialties: ['OSHA Citation Defense', 'Safety Program Compliance', 'Fatality Investigations', 'Whistleblower Protections'] },
      { name: 'Environmental Attorneys', specialties: ['EPA Compliance', 'Brownfield Redevelopment', 'Wetlands Permitting', 'Hazardous Materials'] },
      { name: 'Employment & Labor Attorneys', specialties: ['Independent Contractor Classification', 'Wage & Hour Compliance', 'Non-Compete Agreements', 'Discrimination Claims'] },
    ],
  },
];

const quickRef = [
  'Arbitrators', 'Bid Protest Lawyers', 'Business Formation Attorneys', 'Collections Attorneys',
  'Compliance Consultants', 'Construction Attorneys', 'Construction Defect Attorneys',
  'Contract Drafters', 'Corporate Attorneys', 'Employment Attorneys', 'Environmental Attorneys',
  'Foreclosure Attorneys', 'Franchise Attorneys', 'IP Attorneys', 'Landlord-Tenant Attorneys',
  'Litigation Attorneys', 'Mechanic Lien Attorneys', 'Mediators', 'OSHA Attorneys',
  'Real Estate Attorneys', 'Title Attorneys', 'Zoning & Land Use Attorneys',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  red:     { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',               heading: 'text-red-500',     dot: 'bg-red-500',     border: 'border-red-200 dark:border-red-800',         btn: 'border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950' },
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
                    <Scale className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
                          Post a Legal Job
                        </Button>
                      </Link>
                      <Link to="/browse-providers">
                        <Button size="sm" variant="outline" className={`h-7 text-xs ${c.btn}`}>
                          Find Attorneys Near Me
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

export default function LegalShieldDirectory() {
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
          <Scale className="w-7 h-7 text-orange-500" />
          Legal Shield Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every legal practice area. Click a section to expand, then click a service to see specialties and find bar-verified attorneys near you.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search legal services or practice areas…"
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
            <span className="font-semibold text-base text-foreground">Quick Reference — All Practice Areas (A–Z)</span>
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
