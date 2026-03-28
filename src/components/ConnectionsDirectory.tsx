import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Network, Search } from 'lucide-react';
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
    heading: 'Business Strategy & Consulting',
    color: 'blue',
    services: [
      { name: 'Business Consultants', specialties: ['Growth Strategy', 'Market Entry Planning', 'Operational Improvement', 'Business Model Optimization'] },
      { name: 'Management Consultants', specialties: ['Organizational Design', 'Process Reengineering', 'Performance Metrics', 'Change Management'] },
      { name: 'Strategy Advisors', specialties: ['Competitive Analysis', 'SWOT & PESTLE', 'Blue Ocean Strategy', 'Scenario Planning'] },
      { name: 'Turnaround & Crisis Consultants', specialties: ['Financial Restructuring', 'Distressed Business Recovery', 'Creditor Negotiations', 'Operational Triage'] },
      { name: 'Fractional Executives (C-Suite)', specialties: ['Fractional CEO', 'Fractional COO', 'Fractional CMO', 'Interim Executive Leadership'] },
    ],
  },
  {
    heading: 'Project & Operations Management',
    color: 'orange',
    services: [
      { name: 'Project Managers (Construction & RE)', specialties: ['Pre-Construction Planning', 'Schedule Management', 'Budget Oversight', 'Multi-Stakeholder Coordination'] },
      { name: 'Operations Managers', specialties: ['Workflow Standardization', 'SOP Development', 'Supply Chain Optimization', 'Vendor Management'] },
      { name: 'Scheduling & Planning Specialists', specialties: ['Critical Path Method (CPM)', 'Primavera P6', 'MS Project', 'Look-Ahead Scheduling'] },
      { name: 'Quality Control Managers', specialties: ['QA/QC Inspection Programs', 'ISO 9001', 'Punch List Management', 'Closeout Documentation'] },
      { name: 'Procurement Specialists', specialties: ['Subcontractor Bidding', 'Material Sourcing', 'RFP / RFQ Management', 'Contract Award'] },
    ],
  },
  {
    heading: 'Marketing & Business Development',
    color: 'purple',
    services: [
      { name: 'Marketing Consultants', specialties: ['Brand Strategy', 'Go-to-Market Planning', 'Marketing Audits', 'Budget Allocation'] },
      { name: 'Digital Marketing Specialists', specialties: ['Google Ads / PPC', 'SEO & Content Marketing', 'Social Media Management', 'Email Campaigns'] },
      { name: 'Lead Generation Experts', specialties: ['Inbound Lead Funnels', 'Cold Outreach Systems', 'LinkedIn Lead Gen', 'CRM Setup & Management'] },
      { name: 'Sales Trainers & Coaches', specialties: ['Sales Process Design', 'Objection Handling', 'CRM Training', 'Commission Structure Design'] },
      { name: 'Brand & Creative Directors', specialties: ['Logo & Identity', 'Brand Guidelines', 'Website Design Direction', 'Photography & Video Direction'] },
    ],
  },
  {
    heading: 'HR, Talent & Staffing',
    color: 'emerald',
    services: [
      { name: 'HR Consultants', specialties: ['Employee Handbooks', 'HR Policy Development', 'Benefits Administration', 'HR Compliance (FLSA, ADA)'] },
      { name: 'Recruiters & Talent Acquisition Specialists', specialties: ['Executive Search', 'Trade & Skilled Labor Recruiting', 'Contract Staffing', 'Retained Search'] },
      { name: 'Staffing Agencies', specialties: ['Temporary Staffing', 'Direct Hire Placement', 'Construction Labor', 'Administrative & Office Staff'] },
      { name: 'Training & Development Specialists', specialties: ['Onboarding Programs', 'Safety Training', 'Leadership Development', 'Certification Prep'] },
      { name: 'Compensation & Benefits Consultants', specialties: ['Salary Benchmarking', 'Incentive Pay Design', 'Benefits Package Structuring', 'Equity & Bonus Plans'] },
    ],
  },
  {
    heading: 'Technology & IT Consulting',
    color: 'amber',
    services: [
      { name: 'IT Consultants', specialties: ['IT Infrastructure Planning', 'Cloud Migration', 'Cybersecurity Assessments', 'Disaster Recovery'] },
      { name: 'Software Implementation Consultants', specialties: ['ERP Implementation', 'CRM Deployment', 'Project Management Software', 'Accounting Software Setup'] },
      { name: 'Construction Technology Advisors', specialties: ['Procore / Buildertrend Setup', 'BIM Adoption', 'Field Technology', 'Digital Takeoff Tools'] },
      { name: 'Website & Digital Presence Consultants', specialties: ['Website Design & Dev', 'Google Business Profile', 'Online Review Management', 'Local SEO'] },
    ],
  },
];

const quickRef = [
  'Brand & Creative Directors', 'Business Consultants', 'Compensation Consultants', 'Construction Technology Advisors',
  'Digital Marketing Specialists', 'Fractional Executives', 'HR Consultants', 'IT Consultants',
  'Lead Generation Experts', 'Management Consultants', 'Marketing Consultants', 'Operations Managers',
  'Procurement Specialists', 'Project Managers', 'Quality Control Managers', 'Recruiters',
  'Sales Trainers', 'Scheduling Specialists', 'Software Consultants', 'Staffing Agencies',
  'Strategy Advisors', 'Training Specialists', 'Turnaround Consultants',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
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
                    <Network className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
                          Post a {service.name.split(' ')[0]} Job
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

export default function ConnectionsDirectory() {
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
          <Network className="w-7 h-7 text-blue-600" />
          Connections Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every consulting and professional discipline. Click a section to expand, then click a service to see specialties and connect with vetted business professionals.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search consulting services or specialties…"
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
