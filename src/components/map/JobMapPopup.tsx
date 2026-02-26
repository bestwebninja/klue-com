import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Banknote, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobMapPopupProps {
  id: string;
  title: string;
  description: string;
  location: string | null;
  budget: string;
  category: string | null;
  categoryColor: string;
  createdAt: string;
  distance?: number;
  isProvider: boolean;
  subscriptionStatus: string | null;
}

export function JobMapPopup({
  id,
  title,
  description,
  location,
  budget,
  category,
  categoryColor,
  createdAt,
  distance,
  isProvider,
  subscriptionStatus,
}: JobMapPopupProps) {
  const navigate = useNavigate();
  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '';

  const handleViewDetails = () => {
    navigate(`/jobs/${id}`);
  };

  const handleRequestQuote = () => {
    navigate(`/jobs/${id}?action=quote`);
  };

  const handleSubscribe = () => {
    navigate('/dashboard?tab=subscription');
  };

  return (
    <div className="p-2 max-w-[250px] text-foreground">
      <h4 className="font-semibold text-sm leading-tight mb-1">
        {title || 'Job'}
      </h4>
      
      {category && (
        <Badge 
          className="text-[10px] px-1.5 py-0 mb-2"
          style={{ backgroundColor: categoryColor, color: 'white' }}
        >
          {category}
        </Badge>
      )}
      
      {location && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground my-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {location}
        </p>
      )}
      
      <p className="flex items-center gap-1 text-xs text-muted-foreground my-1">
        <Banknote className="w-3 h-3 flex-shrink-0" />
        {budget}
      </p>
      
      {timeAgo && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground/80 my-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {timeAgo}
        </p>
      )}
      
      {distance !== undefined && distance !== null && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground/80 my-1">
          <Ruler className="w-3 h-3 flex-shrink-0" />
          {Number(distance).toFixed(1)} miles away
        </p>
      )}
      
      <p className="text-[11px] text-muted-foreground leading-relaxed my-2 line-clamp-3">
        {description}
      </p>
      
      <Button
        size="sm"
        className="w-full mt-2 text-xs h-8"
        style={{ backgroundColor: categoryColor }}
        onClick={handleViewDetails}
      >
        View Details →
      </Button>
      
      {isProvider && subscriptionStatus === 'active' && (
        <Button
          size="sm"
          className="w-full mt-1.5 text-xs h-8"
          onClick={handleRequestQuote}
        >
          ✉️ Request to Quote
        </Button>
      )}
      
      {isProvider && subscriptionStatus !== 'active' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-1.5 text-xs h-8"
          onClick={handleSubscribe}
        >
          🔒 Subscribe to Quote
        </Button>
      )}
    </div>
  );
}
