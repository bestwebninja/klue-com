import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, PoundSterling, Clock, ChevronRight, Navigation, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobWithLocation {
  id: string;
  title: string;
  description: string;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  category_name: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface JobsMapSidebarProps {
  jobs: JobWithLocation[];
  onJobSelect: (job: JobWithLocation) => void;
  selectedJobId?: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasDistanceFilter: boolean;
}

export const JobsMapSidebar = ({
  jobs,
  onJobSelect,
  selectedJobId,
  isCollapsed,
  onToggleCollapse,
  hasDistanceFilter,
}: JobsMapSidebarProps) => {
  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Flexible';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  if (isCollapsed) {
    return (
      <div className="absolute left-3 top-16 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="bg-background/95 backdrop-blur-sm shadow-md"
        >
          <PanelLeft className="w-4 h-4 mr-1.5" />
          Show list
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute left-3 top-16 bottom-3 w-80 z-10 bg-background/95 backdrop-blur-sm rounded-lg border border-border shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background/80">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            Jobs ({jobs.length})
          </h3>
          {hasDistanceFilter && (
            <Badge variant="secondary" className="text-xs">
              <Navigation className="w-3 h-3 mr-1" />
              Sorted by distance
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleCollapse}
        >
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Jobs List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {jobs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No jobs found matching your filters
            </div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onJobSelect(job)}
                className={cn(
                  "w-full text-left p-3 rounded-md border transition-all",
                  "hover:border-primary/30 hover:shadow-sm",
                  selectedJobId === job.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-medium text-sm text-foreground line-clamp-1 flex-1">
                    {job.title}
                  </h4>
                  {job.distance !== undefined && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {job.distance.toFixed(1)} mi
                    </Badge>
                  )}
                </div>

                {job.category_name && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {job.category_name}
                  </Badge>
                )}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <PoundSterling className="w-3 h-3 shrink-0" />
                    <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border">
                  <Link
                    to={`/jobs/${job.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View details
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobsMapSidebar;
