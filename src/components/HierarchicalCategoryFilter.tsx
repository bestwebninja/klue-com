import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, ChevronRight, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

interface HierarchicalCategoryFilterProps {
  categories: ServiceCategory[];
  onCategoryChange: (categoryId: string | null, categoryName: string | null) => void;
  selectedCategoryId?: string | null;
  className?: string;
}

export const HierarchicalCategoryFilter = ({
  categories,
  onCategoryChange,
  selectedCategoryId,
  className = '',
}: HierarchicalCategoryFilterProps) => {
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  // Derive main and sub categories
  const mainCategories = useMemo(() => 
    categories.filter(c => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const subCategories = useMemo(() => 
    categories
      .filter(c => c.parent_id === selectedMainCategoryId)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, selectedMainCategoryId]
  );

  // Get selected category names for display
  const selectedMainCategory = mainCategories.find(c => c.id === selectedMainCategoryId);
  const selectedSubCategory = subCategories.find(c => c.id === selectedSubCategoryId);

  const handleMainCategoryChange = (value: string) => {
    if (value === 'all') {
      setSelectedMainCategoryId(null);
      setSelectedSubCategoryId(null);
      onCategoryChange(null, null);
    } else {
      setSelectedMainCategoryId(value);
      setSelectedSubCategoryId(null);
      // When selecting main category, filter by it
      const category = mainCategories.find(c => c.id === value);
      onCategoryChange(value, category?.name || null);
    }
  };

  const handleSubCategoryChange = (value: string) => {
    if (value === 'all') {
      setSelectedSubCategoryId(null);
      // Revert to main category filter
      const category = mainCategories.find(c => c.id === selectedMainCategoryId);
      onCategoryChange(selectedMainCategoryId, category?.name || null);
    } else {
      setSelectedSubCategoryId(value);
      const category = subCategories.find(c => c.id === value);
      onCategoryChange(value, category?.name || null);
    }
  };

  const clearFilters = () => {
    setSelectedMainCategoryId(null);
    setSelectedSubCategoryId(null);
    onCategoryChange(null, null);
  };

  const hasSelection = selectedMainCategoryId !== null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Main Category Select */}
      <Select 
        value={selectedMainCategoryId || 'all'} 
        onValueChange={handleMainCategoryChange}
      >
        <SelectTrigger className="w-full md:w-[200px] bg-background">
          <Filter className="w-4 h-4 mr-2 shrink-0" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50">
          <SelectItem value="all">All Categories</SelectItem>
          {mainCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sub Category Select - only show if main category is selected and has subcategories */}
      {selectedMainCategoryId && subCategories.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground hidden md:block" />
          <Select 
            value={selectedSubCategoryId || 'all'} 
            onValueChange={handleSubCategoryChange}
          >
            <SelectTrigger className="w-full md:w-[200px] bg-background">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="all">All {selectedMainCategory?.name} Services</SelectItem>
              {subCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {/* Clear button */}
      {hasSelection && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={clearFilters}
          className="shrink-0 h-10 w-10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default HierarchicalCategoryFilter;
