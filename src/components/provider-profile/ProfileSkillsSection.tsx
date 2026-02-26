import { 
  Wrench, 
  Droplets, 
  Hammer, 
  Zap, 
  Square,
  Trees,
  Home,
  ChefHat,
  Paintbrush,
  Settings,
  Building2,
  Waves,
  Grid3X3,
  PanelTop,
  HandMetal
} from 'lucide-react';

interface Service {
  id: string;
  custom_name: string | null;
  description: string | null;
  service_categories: {
    name: string;
    icon: string | null;
  } | null;
}

interface ProfileSkillsSectionProps {
  services: Service[];
}

// Map service names to icons
const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('air') || name.includes('conditioning') || name.includes('hvac')) return Settings;
  if (name.includes('bathroom') || name.includes('plumb')) return Droplets;
  if (name.includes('carpenter') || name.includes('wood')) return Hammer;
  if (name.includes('electric')) return Zap;
  if (name.includes('floor')) return Square;
  if (name.includes('landscap') || name.includes('garden')) return Trees;
  if (name.includes('general') || name.includes('home')) return Home;
  if (name.includes('kitchen')) return ChefHat;
  if (name.includes('paint')) return Paintbrush;
  if (name.includes('renovat') || name.includes('interior')) return Building2;
  if (name.includes('roof') || name.includes('waterproof')) return PanelTop;
  if (name.includes('swim') || name.includes('pool') || name.includes('water')) return Waves;
  if (name.includes('til')) return Grid3X3;
  if (name.includes('window') || name.includes('glass')) return PanelTop;
  if (name.includes('handyman')) return HandMetal;
  return Wrench;
};

export const ProfileSkillsSection = ({ services }: ProfileSkillsSectionProps) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        This provider hasn't listed any skill areas yet.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Services Offered</h2>
      <div className="bg-card rounded-lg border border-border p-6 md:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => {
            // Display just the subcategory name (service type), not main category
            const serviceName = service.custom_name || service.service_categories?.name || 'Service';
            // Remove any "MainCategory - " prefix if present from legacy data
            const displayName = serviceName.includes(' - ') 
              ? serviceName.split(' - ').slice(1).join(' - ')
              : serviceName;
            const Icon = getServiceIcon(displayName);
            
            return (
              <div key={service.id} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground leading-tight">
                  {displayName}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
