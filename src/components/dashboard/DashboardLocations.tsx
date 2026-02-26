import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, MapPin, Star } from 'lucide-react';
import { LocationPicker } from '@/components/LocationPicker';
import type { Database } from '@/integrations/supabase/types';

type ProviderLocation = Database['public']['Tables']['provider_locations']['Row'];

interface DashboardLocationsProps {
  userId: string;
}

const DashboardLocations = ({ userId }: DashboardLocationsProps) => {
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, [userId]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('provider_locations')
      .select('*')
      .eq('provider_id', userId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      setLocations(data || []);
    }
  };

  const handleAddLocation = async () => {
    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a location on the map',
        variant: 'destructive',
      });
      return;
    }

    const isPrimary = locations.length === 0;

    const { error } = await supabase
      .from('provider_locations')
      .insert({
        provider_id: userId,
        address: selectedLocation.address,
        city: selectedLocation.city || null,
        postcode: selectedLocation.postcode || null,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        is_primary: isPrimary,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add location',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Location added successfully' });
      setSelectedLocation(null);
      setIsAdding(false);
      fetchLocations();
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await supabase
      .from('provider_locations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete location',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Location removed' });
      fetchLocations();
    }
  };

  const handleSetPrimary = async (id: string) => {
    // First, unset all as primary
    await supabase
      .from('provider_locations')
      .update({ is_primary: false })
      .eq('provider_id', userId);

    // Then set the selected one as primary
    const { error } = await supabase
      .from('provider_locations')
      .update({ is_primary: true })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to set primary location',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Primary location updated' });
      fetchLocations();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Locations
            </CardTitle>
            <CardDescription>Add locations where you provide services</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/50">
            <LocationPicker
              placeholder="Search for your service location..."
              onLocationSelect={(location) => setSelectedLocation(location)}
            />
            {selectedLocation && (
              <div className="p-3 bg-background rounded-md border border-border">
                <p className="text-sm font-medium">{selectedLocation.address}</p>
                <p className="text-xs text-muted-foreground">
                  {[selectedLocation.city, selectedLocation.postcode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAddLocation} disabled={!selectedLocation}>
                Save Location
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setSelectedLocation(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {locations.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No locations added yet. Click "Add Location" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {location.is_primary && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  )}
                  <div>
                    <h4 className="font-medium text-foreground">{location.address}</h4>
                    <p className="text-sm text-muted-foreground">
                      {[location.city, location.postcode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!location.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(location.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLocation(location.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardLocations;
