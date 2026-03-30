import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Monitor, Search } from 'lucide-react';
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
    heading: 'Web Design & Development',
    color: 'blue',
    services: [
      { name: 'Web Designers', specialties: ['UI/UX Design', 'Landing Pages', 'Brand Identity', 'Responsive Design', 'Figma & Adobe XD'] },
      { name: 'Front-End Developers', specialties: ['React', 'Vue.js', 'Next.js', 'Tailwind CSS', 'Performance Optimization'] },
      { name: 'Full-Stack Developers', specialties: ['Node.js', 'Django', 'Laravel', 'REST APIs', 'Database Integration'] },
      { name: 'WordPress Developers', specialties: ['Custom Themes', 'Plugin Development', 'WooCommerce', 'Site Speed', 'Migrations'] },
      { name: 'E-Commerce Developers', specialties: ['Shopify', 'WooCommerce', 'Magento', 'Checkout Optimization', 'Payment Integration'] },
    ],
  },
  {
    heading: 'Software & App Development',
    color: 'purple',
    services: [
      { name: 'Mobile App Developers', specialties: ['iOS (Swift)', 'Android (Kotlin)', 'React Native', 'Flutter', 'App Store Publishing'] },
      { name: 'Custom Software Developers', specialties: ['Business Automation', 'CRM Development', 'ERP Systems', 'SaaS Platforms', 'API Development'] },
      { name: 'DevOps Engineers', specialties: ['CI/CD Pipelines', 'Docker & Kubernetes', 'AWS / Azure / GCP', 'Infrastructure as Code', 'Monitoring & Alerting'] },
      { name: 'Database Administrators', specialties: ['PostgreSQL', 'MySQL', 'MongoDB', 'Query Optimization', 'Data Migration'] },
      { name: 'QA & Testing Engineers', specialties: ['Manual Testing', 'Automated Testing', 'Load Testing', 'Bug Tracking', 'Test Plans'] },
    ],
  },
  {
    heading: 'SEO & Digital Marketing',
    color: 'emerald',
    services: [
      { name: 'SEO Specialists', specialties: ['On-Page SEO', 'Technical SEO', 'Link Building', 'Local SEO', 'Google Search Console'] },
      { name: 'PPC & Paid Ads Managers', specialties: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'Retargeting', 'Conversion Tracking'] },
      { name: 'Content Marketing Strategists', specialties: ['Blog Writing', 'Content Calendars', 'Keyword Research', 'Copywriting', 'Video Scripts'] },
      { name: 'Social Media Managers', specialties: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'Community Management'] },
      { name: 'Email Marketing Specialists', specialties: ['Klaviyo', 'Mailchimp', 'Drip Campaigns', 'A/B Testing', 'Segmentation'] },
    ],
  },
  {
    heading: 'Cybersecurity',
    color: 'red',
    services: [
      { name: 'Cybersecurity Consultants', specialties: ['Risk Assessments', 'Security Audits', 'Compliance (SOC 2, HIPAA)', 'Security Strategy', 'Incident Response'] },
      { name: 'Penetration Testers', specialties: ['Web App Pentesting', 'Network Pentesting', 'Social Engineering', 'Red Team Exercises', 'Vulnerability Reports'] },
      { name: 'Cloud Security Engineers', specialties: ['AWS Security', 'Azure Security', 'Identity & Access Management', 'Zero Trust', 'SIEM Setup'] },
      { name: 'Endpoint Protection Specialists', specialties: ['Antivirus & EDR', 'Patch Management', 'Device Encryption', 'MDM Solutions', 'Threat Monitoring'] },
    ],
  },
  {
    heading: 'IT Support & Managed Services',
    color: 'orange',
    services: [
      { name: 'Managed Service Providers (MSP)', specialties: ['24/7 Monitoring', 'Helpdesk Support', 'Backup & Disaster Recovery', 'Patch Management', 'SLA-Backed Services'] },
      { name: 'Network Engineers', specialties: ['LAN / WAN Setup', 'VPN Configuration', 'Firewall Management', 'Wi-Fi Deployment', 'Network Troubleshooting'] },
      { name: 'Cloud Migration Specialists', specialties: ['AWS Migration', 'Microsoft 365', 'Google Workspace', 'On-Prem to Cloud', 'Hybrid Cloud'] },
      { name: 'IT Project Managers', specialties: ['Technology Rollouts', 'Vendor Management', 'Budget & Timeline', 'Stakeholder Reporting', 'Change Management'] },
      { name: 'Help Desk Technicians', specialties: ['Remote Support', 'Onsite Support', 'Ticketing Systems', 'Hardware Troubleshooting', 'Software Installs'] },
    ],
  },
];

const quickRef = [
  'Android Developers', 'AWS Cloud Engineers', 'Chatbot Developers', 'Cloud Migration',
  'Content Marketing', 'Custom Software', 'Cybersecurity Consultants', 'Database Admins',
  'DevOps Engineers', 'E-Commerce Developers', 'Email Marketing', 'Flutter Developers',
  'Full-Stack Developers', 'Help Desk Technicians', 'iOS Developers', 'IT Project Managers',
  'Managed IT (MSP)', 'Mobile App Developers', 'Network Engineers', 'Penetration Testers',
  'PPC Managers', 'QA Engineers', 'React Developers', 'SEO Specialists',
  'Shopify Developers', 'Social Media Managers', 'UI/UX Designers', 'Web Designers',
  'WordPress Developers',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', heading: 'text-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', btn: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950' },
  red:     { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',               heading: 'text-red-500',     dot: 'bg-red-500',     border: 'border-red-200 dark:border-red-800',         btn: 'border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950' },
  orange:  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',   heading: 'text-orange-500',  dot: 'bg-orange-500',  border: 'border-orange-200 dark:border-orange-800',   btn: 'border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950' },
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
                    <Monitor className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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

export default function ITServicesDirectory() {
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
          <Monitor className="w-7 h-7 text-blue-600" />
          IT Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every IT discipline. Click a section to expand, then click a service to see specialties and connect with verified IT professionals near you.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search IT services or specialties…"
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
            <span className="font-semibold text-base text-foreground">Quick Reference — All IT Services (A–Z)</span>
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
