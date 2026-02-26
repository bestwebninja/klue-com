import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderMapPopupProps {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  city: string | null;
  postcode: string | null;
  services: string;
}

export function ProviderMapPopup({
  id,
  fullName,
  avatarUrl,
  city,
  postcode,
  services,
}: ProviderMapPopupProps) {
  const navigate = useNavigate();
  const name = fullName || 'Service Provider';
  const locationDisplay = postcode || city || '';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleViewProfile = () => {
    navigate(`/service-provider/${id}`);
  };

  return (
    <div className="p-2 max-w-[220px] text-foreground">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl || undefined} alt={name} />
          <AvatarFallback className="text-xs">
            {initials || <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        <h4 className="font-semibold text-sm leading-tight">
          {name}
        </h4>
      </div>
      
      {locationDisplay && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground my-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {locationDisplay}
        </p>
      )}
      
      {services && (
        <div className="flex flex-wrap gap-1 my-2">
          {services.split(', ').slice(0, 3).map((service, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0"
            >
              {service}
            </Badge>
          ))}
        </div>
      )}
      
      <Button
        size="sm"
        className="w-full mt-2 text-xs h-8"
        onClick={handleViewProfile}
      >
        View profile →
      </Button>
    </div>
  );
}
