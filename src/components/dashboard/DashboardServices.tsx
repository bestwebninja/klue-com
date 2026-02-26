import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Wrench } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'] & {
  service_categories?: ServiceCategory | null;
};

interface DashboardServicesProps {
  userId: string;
}

const DashboardServices = ({ userId }: DashboardServicesProps) => {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const { toast } = useToast();

  // Derived category lists for hierarchical selection
  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === selectedMainCategory);

  // Get existing service category IDs for filtering
  const existingServiceCategoryIds = services.map(s => s.category_id);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('provider_services')
      .select('*, service_categories(*)')
      .eq('provider_id', userId);

    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
  };

  const toggleSubcategory = (categoryId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddServices = async () => {
    if (selectedSubcategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one service type',
        variant: 'destructive',
      });
      return;
    }

    // Filter out services that already exist
    const newCategoryIds = selectedSubcategories.filter(
      id => !existingServiceCategoryIds.includes(id)
    );

    if (newCategoryIds.length === 0) {
      toast({
        title: 'No new services',
        description: 'All selected services are already in your list',
        variant: 'destructive',
      });
      return;
    }

    // Create insert data for each selected subcategory
    const insertData = newCategoryIds.map(categoryId => {
      const subCat = subCategories.find(c => c.id === categoryId);
      return {
        provider_id: userId,
        category_id: categoryId,
        custom_name: subCat?.name || '',
        description: null,
      };
    });

    const { error } = await supabase
      .from('provider_services')
      .insert(insertData);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add services',
        variant: 'destructive',
      });
    } else {
      toast({ 
        title: 'Services added successfully',
        description: `Added ${newCategoryIds.length} service${newCategoryIds.length !== 1 ? 's' : ''}`
      });
      setSelectedMainCategory('');
      setSelectedSubcategories([]);
      setIsAdding(false);
      fetchServices();
    }
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase
      .from('provider_services')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Service removed' });
      fetchServices();
    }
  };

  const handleCancel = () => {
    setSelectedMainCategory('');
    setSelectedSubcategories([]);
    setIsAdding(false);
  };

  // Filter out already added services from the subcategory list
  const availableSubcategories = subCategories.filter(
    sub => !existingServiceCategoryIds.includes(sub.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              My Services
            </CardTitle>
            <CardDescription>Add the services you offer to clients</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Services
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="main_category">Main Category *</Label>
              <select
                id="main_category"
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedSubcategories([]);
                }}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select a main category</option>
                {mainCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {selectedMainCategory && availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <Label>Services (select all that apply)</Label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2 bg-background">
                  {availableSubcategories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${cat.id}`}
                        checked={selectedSubcategories.includes(cat.id)}
                        onCheckedChange={() => toggleSubcategory(cat.id)}
                      />
                      <label
                        htmlFor={`service-${cat.id}`}
                        className="text-sm cursor-pointer text-foreground"
                      >
                        {cat.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSubcategories.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSubcategories.length} service{selectedSubcategories.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {selectedMainCategory && availableSubcategories.length === 0 && subCategories.length > 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                All services in this category have already been added.
              </div>
            )}

            {selectedMainCategory && subCategories.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No services available in this category.
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleAddServices}
                disabled={selectedSubcategories.length === 0}
              >
                Add {selectedSubcategories.length > 0 ? `${selectedSubcategories.length} Service${selectedSubcategories.length !== 1 ? 's' : ''}` : 'Services'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        )}

        {services.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No services added yet. Click "Add Services" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => {
              // Display just the subcategory name (strip "MainCategory - " prefix if present)
              const rawName = service.custom_name || service.service_categories?.name;
              const displayName = rawName?.includes(' - ')
                ? rawName.split(' - ').slice(1).join(' - ')
                : rawName;
              
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-foreground">
                      {displayName}
                    </h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardServices;
