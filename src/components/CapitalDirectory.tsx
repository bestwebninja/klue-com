import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Landmark, Search } from 'lucide-react';
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
    heading: 'Accounting & Tax Services',
    color: 'blue',
    services: [
      { name: 'Certified Public Accountants (CPAs)', specialties: ['Business Tax Returns', 'Individual Returns', 'S-Corp & LLC Filings', 'IRS Representation'] },
      { name: 'Tax Preparation Specialists', specialties: ['Construction Tax Strategy', 'Real Estate Tax Deductions', '1031 Exchanges', 'Depreciation Schedules'] },
      { name: 'Bookkeepers', specialties: ['Job Costing', 'QuickBooks / Xero Setup', 'Monthly Reconciliation', 'Accounts Payable / Receivable'] },
      { name: 'Payroll Specialists', specialties: ['Contractor Payroll', 'Multi-State Payroll', 'W-2 & 1099 Filing', 'Certified Payroll (Davis-Bacon)'] },
      { name: 'Auditors', specialties: ['Financial Statement Audits', 'Internal Audits', 'AUP Engagements', 'Compliance Audits'] },
    ],
  },
  {
    heading: 'Lending & Construction Finance',
    color: 'green',
    services: [
      { name: 'Construction Lenders', specialties: ['Construction-to-Permanent Loans', 'Draw Schedules', 'Owner-Builder Loans', 'Commercial Construction Loans'] },
      { name: 'Hard Money Lenders', specialties: ['Fix & Flip Loans', 'Bridge Loans', 'Fast Closings', 'Asset-Based Lending'] },
      { name: 'SBA Loan Specialists', specialties: ['SBA 7(a) Loans', 'SBA 504 Commercial Real Estate', 'Working Capital Lines', 'Equipment Financing'] },
      { name: 'Business Line of Credit Brokers', specialties: ['Revolving Credit Lines', 'Material Purchase Financing', 'Subcontractor Payment Lines', 'Invoice Factoring'] },
      { name: 'Equipment Financing Specialists', specialties: ['Heavy Equipment Loans', 'Leasing vs. Buying Analysis', 'Section 179 Strategies', 'Fleet Financing'] },
    ],
  },
  {
    heading: 'Investment & Wealth Management',
    color: 'purple',
    services: [
      { name: 'Financial Advisors', specialties: ['Retirement Planning', 'Investment Portfolio Management', 'Business Exit Planning', 'Risk Management'] },
      { name: 'Real Estate Investment Advisors', specialties: ['Cap Rate Analysis', 'Cash-on-Cash Return', 'Deal Underwriting', 'Market Feasibility'] },
      { name: 'Wealth Managers', specialties: ['High-Net-Worth Planning', 'Tax-Efficient Investing', 'Estate Planning Integration', 'Trust Services'] },
      { name: 'Business Valuation Analysts', specialties: ['M&A Valuations', 'Buy-Sell Agreements', 'ESOP Valuations', 'Litigation Support'] },
    ],
  },
  {
    heading: 'Business Finance & CFO Services',
    color: 'orange',
    services: [
      { name: 'Fractional CFOs', specialties: ['Cash Flow Forecasting', 'KPI Dashboards', 'Financing Strategy', 'Investor Reporting'] },
      { name: 'Cost Estimators & Job Costing Analysts', specialties: ['Pre-Bid Estimates', 'Work-in-Progress (WIP) Reporting', 'Over/Under Billing Analysis', 'Variance Analysis'] },
      { name: 'Business Analysts', specialties: ['Profit Margin Analysis', 'Overhead Allocation', 'Break-Even Analysis', 'Financial Modeling'] },
      { name: 'Grant & Incentive Specialists', specialties: ['Federal & State Grants', 'Opportunity Zone Investing', 'Historic Tax Credits', 'New Markets Tax Credits'] },
    ],
  },
  {
    heading: 'Insurance & Risk Management',
    color: 'amber',
    services: [
      { name: 'Contractor Insurance Brokers', specialties: ['General Liability', 'Workers Compensation', "Builder's Risk", 'Commercial Auto'] },
      { name: 'Surety Bond Specialists', specialties: ['Bid Bonds', 'Performance Bonds', 'Payment Bonds', 'License & Permit Bonds'] },
      { name: 'Real Estate Insurance Agents', specialties: ['Landlord Insurance', 'Vacant Property Coverage', 'Flood Insurance', 'Investment Portfolio Coverage'] },
      { name: 'Risk Management Consultants', specialties: ['OSHA Risk Assessment', 'Safety Program Development', 'Claims Management', 'Loss Control'] },
    ],
  },
];

const quickRef = [
  'Auditors', 'Bookkeepers', 'Business Analysts', 'Business Valuation Analysts',
  'Contractor Insurance Brokers', 'Construction Lenders', 'Cost Estimators', 'CPAs',
  'Equipment Financing', 'Financial Advisors', 'Fractional CFOs', 'Grant Specialists',
  'Hard Money Lenders', 'Invoice Factoring', 'Job Costing Analysts', 'Payroll Specialists',
  'Real Estate Investment Advisors', 'Risk Management Consultants', 'SBA Loan Specialists',
  'Surety Bond Specialists', 'Tax Preparation Specialists', 'Wealth Managers',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  green:   { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',       heading: 'text-green-600',   dot: 'bg-green-500',   border: 'border-green-200 dark:border-green-800',     btn: 'border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
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
                    <Landmark className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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

export default function CapitalDirectory() {
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
          <Landmark className="w-7 h-7 text-green-600" />
          Capital Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every finance and capital discipline. Click a section to expand, then click a service to see specialties and connect with qualified financial professionals.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search finance services or specialties…"
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
