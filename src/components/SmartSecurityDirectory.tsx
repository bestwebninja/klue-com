import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Search } from 'lucide-react';
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
    heading: 'Surveillance & Camera Systems',
    color: 'blue',
    services: [
      { name: 'CCTV Installers', specialties: ['Analog HD', 'IP Camera Systems', 'NVR / DVR Setup', '4K Ultra-HD Cameras'] },
      { name: 'PTZ Camera Specialists', specialties: ['Pan-Tilt-Zoom Systems', 'Auto-Tracking', 'Long-Range Surveillance', 'Stadium & Warehouse Coverage'] },
      { name: 'Thermal & Infrared Camera Techs', specialties: ['Perimeter Detection', 'Night Vision', 'Fog-Penetrating Cameras', 'Industrial Monitoring'] },
      { name: 'Body Camera Solutions', specialties: ['Law Enforcement Grade', 'Security Guard Cams', 'Evidence Management Software', 'Cloud Backup'] },
      { name: 'Covert / Hidden Camera Installers', specialties: ['Discreet Retail Loss Prevention', 'Nanny Cams', 'Vehicle-Mounted Cameras', 'Concealed Housing Mounts'] },
    ],
  },
  {
    heading: 'Access Control & Entry Systems',
    color: 'purple',
    services: [
      { name: 'Key Card & Fob Systems', specialties: ['HID Proximity', 'RFID Access', 'Multi-Door Controllers', 'Time & Attendance Integration'] },
      { name: 'Biometric Access Specialists', specialties: ['Fingerprint Readers', 'Facial Recognition', 'Iris Scanners', 'Multi-Factor Auth'] },
      { name: 'Smart Lock Installers', specialties: ['Deadbolt Upgrades', 'Keypad Locks', 'Wi-Fi & Bluetooth Locks', 'Schlage / Yale / August'] },
      { name: 'Intercom & Video Doorbell Techs', specialties: ['IP Video Intercoms', 'Apartment Call Systems', 'Ring / Nest Doorbell', 'Multi-Tenant Entry'] },
      { name: 'Gate & Barrier System Installers', specialties: ['Automatic Gate Operators', 'Parking Barriers', 'Turnstiles', 'Crash-Rated Bollards'] },
    ],
  },
  {
    heading: 'Alarm, Detection & Life Safety',
    color: 'red',
    services: [
      { name: 'Burglar Alarm System Installers', specialties: ['Intrusion Detection', 'Door & Window Sensors', 'Perimeter Alarms', 'Cellular Backup'] },
      { name: 'Fire Alarm System Technicians', specialties: ['Addressable Fire Panels', 'Smoke Detectors', 'Heat Detectors', 'NFPA 72 Compliance'] },
      { name: 'CO & Environmental Sensor Installers', specialties: ['Carbon Monoxide Detectors', 'Flood & Leak Sensors', 'Air Quality Monitors', 'Radon Detectors'] },
      { name: 'Glass Break & Vibration Sensor Techs', specialties: ['Acoustic Glass Break', 'Vibration Sensors', 'Shock Detectors', 'Perimeter Hardening'] },
      { name: 'Motion Detection Specialists', specialties: ['PIR Sensors', 'Dual-Tech Detectors', 'Microwave Motion', 'Pet-Immune Sensors'] },
    ],
  },
  {
    heading: 'Monitoring & Response Services',
    color: 'emerald',
    services: [
      { name: '24/7 Remote Monitoring Centers', specialties: ['UL Listed Monitoring', 'Video Verification', 'Two-Way Audio', 'Police/Fire Dispatch'] },
      { name: 'On-Site Guard Services', specialties: ['Armed Guards', 'Unarmed Security', 'Patrol Officers', 'Event Security'] },
      { name: 'Mobile Patrol Services', specialties: ['Regular Patrol Routes', 'Alarm Response', 'Lock-Up Services', 'Vacant Property Checks'] },
      { name: 'Cybersecurity for Physical Systems', specialties: ['Network Hardening', 'IoT Device Security', 'VPN for Cameras', 'Firmware Management'] },
    ],
  },
  {
    heading: 'Smart Home & Building Integration',
    color: 'amber',
    services: [
      { name: 'Smart Home Security Integrators', specialties: ['Z-Wave / Zigbee', 'Amazon Alexa / Google Home', 'Apple HomeKit', 'Full-Home Automation'] },
      { name: 'AI-Powered Video Analytics Techs', specialties: ['License Plate Recognition', 'Facial Detection AI', 'Loitering Detection', 'Crowd Analytics'] },
      { name: 'Structured Wiring & Low-Voltage Specialists', specialties: ['Cat6 / Fiber Runs', 'Security Cable Pathways', 'Conduit Installation', 'Rack & Panel Setup'] },
      { name: 'Security System Maintenance & Repair', specialties: ['Annual Inspections', 'Battery Replacement', 'Firmware Updates', 'Warranty Service'] },
    ],
  },
];

const quickRef = [
  'AI Video Analytics', 'Biometric Access', 'Burglar Alarm Installers', 'CCTV Installers',
  'CO & Environmental Sensors', 'Cybersecurity for Physical Systems', 'Fire Alarm Technicians',
  'Gate & Barrier Installers', 'Glass Break Sensors', 'Guard Services', 'Hidden Camera Installers',
  'Intercom & Video Doorbell', 'Key Card Systems', 'Mobile Patrol Services',
  'Motion Detection Specialists', 'PTZ Camera Specialists', 'Remote Monitoring Centers',
  'Smart Home Integrators', 'Smart Lock Installers', 'Structured Wiring', 'Thermal Camera Techs',
];

const colorMap: Record<string, { badge: string; heading: string; dot: string; border: string; btn: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',           heading: 'text-blue-500',    dot: 'bg-blue-500',    border: 'border-blue-200 dark:border-blue-800',       btn: 'border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950' },
  purple:  { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',   heading: 'text-purple-500',  dot: 'bg-purple-500',  border: 'border-purple-200 dark:border-purple-800',   btn: 'border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950' },
  red:     { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',               heading: 'text-red-500',     dot: 'bg-red-500',     border: 'border-red-200 dark:border-red-800',         btn: 'border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950' },
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
                    <Shield className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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

export default function SmartSecurityDirectory() {
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
          <Shield className="w-7 h-7 text-blue-600" />
          Smart Security Services Directory
        </h2>
        <p className="text-muted-foreground">
          Browse every security discipline. Click a section to expand, then click a service to see specialties and find certified security professionals near you.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search security services or specialties…"
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
