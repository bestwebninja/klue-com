import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MapPin, CheckCircle, Clock, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface GeocodingStats {
  total: number;
  geocoded: number;
  pending: number;
  failed: number;
}

export const GeocodingStatsWidget = () => {
  const [stats, setStats] = useState<GeocodingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get total jobs with location
      const { count: totalCount } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .not('location', 'is', null);

      // Get geocoded jobs (has coordinates and not 0,0)
      const { count: geocodedCount } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .not('location', 'is', null)
        .not('latitude', 'is', null)
        .neq('latitude', 0);

      // Get failed jobs (has 0,0 coordinates - marked as couldn't geocode)
      const { count: failedCount } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .not('location', 'is', null)
        .eq('latitude', 0)
        .eq('longitude', 0);

      // Pending = total - geocoded - failed
      const total = totalCount || 0;
      const geocoded = geocodedCount || 0;
      const failed = failedCount || 0;
      const pending = total - geocoded - failed;

      setStats({
        total,
        geocoded,
        pending,
        failed,
      });
    } catch (error) {
      console.error('Error fetching geocoding stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runBatchGeocode = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-geocode-jobs');
      
      if (error) throw error;

      toast({
        title: 'Batch geocoding complete',
        description: `Processed ${data.total || 0} jobs: ${data.success || 0} success, ${data.failed || 0} failed`,
      });

      // Refresh stats after running
      await fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error running batch geocode',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const progressPercentage = stats.total > 0 
    ? Math.round(((stats.geocoded + stats.failed) / stats.total) * 100) 
    : 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Geocoding Status
            </CardTitle>
            <CardDescription>
              Jobs with cached map coordinates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {stats.pending > 0 && (
              <Button 
                size="sm" 
                onClick={runBatchGeocode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Geocode Now
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Jobs</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.geocoded}</span>
            </div>
            <div className="text-xs text-green-600/80">Geocoded</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
            </div>
            <div className="text-xs text-amber-600/80">Pending</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
            </div>
            <div className="text-xs text-red-600/80">Not Found</div>
          </div>
        </div>

        {stats.pending > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {stats.pending} job{stats.pending !== 1 ? 's' : ''} waiting to be geocoded. 
            The batch job runs automatically every hour, or click "Geocode Now" to process immediately.
          </p>
        )}

        {stats.pending === 0 && stats.total > 0 && (
          <p className="text-xs text-green-600 text-center">
            ✓ All job locations have been processed
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GeocodingStatsWidget;
