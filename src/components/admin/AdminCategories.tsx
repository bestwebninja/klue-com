import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { FolderTree, Plus, Edit, Trash2, ChevronDown, ChevronRight, Folder, FileText, Lightbulb, Check } from 'lucide-react';
import { suggestIcon, getIconComponent, getAvailableIcons } from '@/lib/iconSuggestions';

interface ServiceCategory {
  id: string;
  name: string;
  icon: string | null;
  parent_id: string | null;
  created_at: string;
}

interface CategoryWithChildren extends ServiceCategory {
  children: ServiceCategory[];
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<CategoryWithChildren[]>([]);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [selectedParentForSubcategory, setSelectedParentForSubcategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', parent_id: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', icon: '' });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  const availableIcons = getAvailableIcons();
  const filteredIcons = availableIcons.filter(icon => 
    icon.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Organize categories into hierarchy
    const main = categories.filter(c => !c.parent_id);
    const organized: CategoryWithChildren[] = main.map(m => ({
      ...m,
      children: categories.filter(c => c.parent_id === m.id).sort((a, b) => a.name.localeCompare(b.name))
    }));
    setMainCategories(organized.sort((a, b) => a.name.localeCompare(b.name)));
  }, [categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
  };

  const handleSuggestIcon = (name: string, setter: (value: string) => void) => {
    const suggested = suggestIcon(name);
    setter(suggested);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    const insertData: { name: string; icon: string | null; parent_id: string | null } = {
      name: newCategory.name.trim(),
      icon: newCategory.icon.trim() || null,
      parent_id: newCategory.parent_id && newCategory.parent_id !== 'main' ? newCategory.parent_id : null,
    };

    const { data, error } = await supabase
      .from('service_categories')
      .insert(insertData)
      .select()
      .single();

    setIsProcessing(false);

    if (error) {
      console.error('Error adding category:', error);
      toast({ title: 'Error', description: 'Failed to add category', variant: 'destructive' });
    } else {
      await logAction({
        action: 'create_category',
        entityType: 'category',
        entityId: data?.id,
        details: { name: newCategory.name, parent_id: newCategory.parent_id || null, isMainCategory: !insertData.parent_id },
      });
      
      const isMainCategory = !insertData.parent_id;
      toast({ 
        title: 'Success', 
        description: isMainCategory 
          ? `Main category "${newCategory.name}" added. It will appear in site navigation.`
          : 'Subcategory added successfully' 
      });
      
      fetchCategories();
      setIsAdding(false);
      setNewCategory({ name: '', icon: '', parent_id: '' });
      
      // Auto-expand parent if adding subcategory
      if (insertData.parent_id && !expandedCategories.includes(insertData.parent_id)) {
        setExpandedCategories(prev => [...prev, insertData.parent_id!]);
      }
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim() || !selectedParentForSubcategory) {
      toast({ title: 'Error', description: 'Service name is required', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: newSubcategory.name.trim(),
        icon: newSubcategory.icon.trim() || null,
        parent_id: selectedParentForSubcategory,
      })
      .select()
      .single();

    setIsProcessing(false);

    if (error) {
      console.error('Error adding subcategory:', error);
      toast({ title: 'Error', description: 'Failed to add service', variant: 'destructive' });
    } else {
      await logAction({
        action: 'create_subcategory',
        entityType: 'category',
        entityId: data?.id,
        details: { name: newSubcategory.name, parent_id: selectedParentForSubcategory },
      });
      toast({ title: 'Success', description: 'Service added successfully' });
      fetchCategories();
      setIsAddingSubcategory(false);
      setNewSubcategory({ name: '', icon: '' });
      setSelectedParentForSubcategory(null);
      
      // Auto-expand parent
      if (!expandedCategories.includes(selectedParentForSubcategory)) {
        setExpandedCategories(prev => [...prev, selectedParentForSubcategory]);
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    setIsProcessing(true);

    const { error } = await supabase
      .from('service_categories')
      .update({
        name: editingCategory.name,
        icon: editingCategory.icon,
        parent_id: editingCategory.parent_id,
      })
      .eq('id', editingCategory.id);

    setIsProcessing(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    } else {
      await logAction({
        action: 'update_category',
        entityType: 'category',
        entityId: editingCategory.id,
        details: { name: editingCategory.name, icon: editingCategory.icon },
      });
      toast({ title: 'Success', description: 'Category updated successfully. Changes will reflect across the site.' });
      fetchCategories();
      setIsEditing(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (category: ServiceCategory) => {
    const hasChildren = categories.some(c => c.parent_id === category.id);
    
    if (hasChildren) {
      if (!confirm(`This category has ${categories.filter(c => c.parent_id === category.id).length} subcategories. Deleting it will also delete all subcategories. Continue?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this category? This may affect related jobs and services.')) {
        return;
      }
    }

    const { error } = await supabase.from('service_categories').delete().eq('id', category.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete category. It may be in use.', variant: 'destructive' });
    } else {
      await logAction({
        action: 'delete_category',
        entityType: 'category',
        entityId: category.id,
        details: { name: category.name, had_children: hasChildren },
      });
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const expandAll = () => {
    setExpandedCategories(mainCategories.map(c => c.id));
  };

  const collapseAll = () => {
    setExpandedCategories([]);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderIconPreview = (iconName: string | null) => {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="w-4 h-4" />;
  };

  const IconPickerButton = ({ 
    value, 
    onChange 
  }: { 
    value: string; 
    onChange: (icon: string) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const filtered = availableIcons.filter(icon => 
      icon.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            {renderIconPreview(value || null)}
            <span className="flex-1 text-left">{value || 'Select icon...'}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ScrollArea className="h-64">
              <div className="grid grid-cols-6 gap-2 p-1">
                {filtered.map((icon) => {
                  const IconComp = getIconComponent(icon);
                  const isSelected = value === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => {
                        onChange(icon);
                        setOpen(false);
                      }}
                      className={`p-2 rounded-md border transition-colors hover:bg-muted ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      title={icon}
                    >
                      <IconComp className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const totalSubcategories = categories.filter(c => c.parent_id).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              Service Categories
            </CardTitle>
            <CardDescription>
              Manage hierarchical service categories. Changes automatically propagate across the site.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category Type</Label>
                    <Select
                      value={newCategory.parent_id}
                      onValueChange={(value) => setNewCategory({ ...newCategory, parent_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type (Main or under a parent)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Category (No Parent)</SelectItem>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            Subcategory under: {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Main categories appear in site navigation. Subcategories are services within a main category.
                    </p>
                  </div>
                  <div>
                    <Label>Category Name</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder={newCategory.parent_id && newCategory.parent_id !== 'main' ? "e.g., Plumber" : "e.g., Home Services"}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Icon</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestIcon(newCategory.name, (icon) => setNewCategory(prev => ({ ...prev, icon })))}
                        disabled={!newCategory.name.trim()}
                        className="h-7 text-xs"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Suggest
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <IconPickerButton
                          value={newCategory.icon}
                          onChange={(icon) => setNewCategory(prev => ({ ...prev, icon }))}
                        />
                      </div>
                      {newCategory.icon && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                          {renderIconPreview(newCategory.icon)}
                          <span className="text-sm text-muted-foreground">{newCategory.icon}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddCategory} className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Adding...' : 'Add Category'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <Folder className="w-4 h-4 mr-1" />
            {mainCategories.length} Main Categories
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            <FileText className="w-4 h-4 mr-1" />
            {totalSubcategories} Subcategories
          </Badge>
        </div>

        {/* Categories Tree */}
        <div className="space-y-2">
          {mainCategories.map((mainCat) => (
            <Collapsible
              key={mainCat.id}
              open={expandedCategories.includes(mainCat.id)}
              onOpenChange={() => toggleExpand(mainCat.id)}
            >
              <div className="border rounded-lg">
                {/* Main Category Row */}
                <div className="flex items-center justify-between p-3 bg-muted/50">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 text-left flex-1 hover:text-primary transition-colors">
                      {expandedCategories.includes(mainCat.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded text-primary">
                        {renderIconPreview(mainCat.icon)}
                      </div>
                      <span className="font-semibold">{mainCat.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {mainCat.children.length} services
                      </Badge>
                    </button>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-2">
                      {mainCat.icon || 'No icon'}
                    </span>
                    {/* Add Subcategory Button */}
                    <Dialog 
                      open={isAddingSubcategory && selectedParentForSubcategory === mainCat.id} 
                      onOpenChange={(open) => {
                        setIsAddingSubcategory(open);
                        if (open) {
                          setSelectedParentForSubcategory(mainCat.id);
                        } else {
                          setSelectedParentForSubcategory(null);
                          setNewSubcategory({ name: '', icon: '' });
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Service to {mainCat.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Service Name</Label>
                            <Input
                              value={newSubcategory.name}
                              onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                              placeholder="e.g., Electrician, Plumber"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Icon (optional)</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSuggestIcon(newSubcategory.name, (icon) => setNewSubcategory(prev => ({ ...prev, icon })))}
                                disabled={!newSubcategory.name.trim()}
                                className="h-7 text-xs"
                              >
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Suggest
                              </Button>
                            </div>
                            <IconPickerButton
                              value={newSubcategory.icon}
                              onChange={(icon) => setNewSubcategory(prev => ({ ...prev, icon }))}
                            />
                          </div>
                          <Button onClick={handleAddSubcategory} className="w-full" disabled={isProcessing}>
                            {isProcessing ? 'Adding...' : 'Add Service'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Edit Main Category */}
                    <Dialog open={isEditing && editingCategory?.id === mainCat.id} onOpenChange={(open) => {
                      setIsEditing(open);
                      if (!open) setEditingCategory(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(mainCat);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Main Category</DialogTitle>
                        </DialogHeader>
                        {editingCategory && (
                          <div className="space-y-4">
                            <div>
                              <Label>Category Name</Label>
                              <Input
                                value={editingCategory.name}
                                onChange={(e) =>
                                  setEditingCategory({ ...editingCategory, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Icon</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuggestIcon(editingCategory.name, (icon) => setEditingCategory(prev => prev ? ({ ...prev, icon }) : null))}
                                  className="h-7 text-xs"
                                >
                                  <Lightbulb className="w-3 h-3 mr-1" />
                                  Suggest
                                </Button>
                              </div>
                              <IconPickerButton
                                value={editingCategory.icon || ''}
                                onChange={(icon) => setEditingCategory(prev => prev ? ({ ...prev, icon }) : null)}
                              />
                            </div>
                            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                              <strong>Note:</strong> Updating this category will affect all related jobs, providers, and site navigation.
                            </div>
                            <Button onClick={handleUpdateCategory} className="w-full" disabled={isProcessing}>
                              {isProcessing ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(mainCat)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                <CollapsibleContent>
                  {mainCat.children.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-10">Service Name</TableHead>
                          <TableHead>Icon</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mainCat.children.map((subCat) => (
                          <TableRow key={subCat.id}>
                            <TableCell className="pl-10">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                                  {renderIconPreview(subCat.icon)}
                                </div>
                                {subCat.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subCat.icon || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(subCat.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog open={isEditing && editingCategory?.id === subCat.id} onOpenChange={(open) => {
                                setIsEditing(open);
                                if (!open) setEditingCategory(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCategory(subCat);
                                      setIsEditing(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Service</DialogTitle>
                                  </DialogHeader>
                                  {editingCategory && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Parent Category</Label>
                                        <Select
                                          value={editingCategory.parent_id || ''}
                                          onValueChange={(value) =>
                                            setEditingCategory({ ...editingCategory, parent_id: value || null })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {mainCategories.map((cat) => (
                                              <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Service Name</Label>
                                        <Input
                                          value={editingCategory.name}
                                          onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, name: e.target.value })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <Label>Icon</Label>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSuggestIcon(editingCategory.name, (icon) => setEditingCategory(prev => prev ? ({ ...prev, icon }) : null))}
                                            className="h-7 text-xs"
                                          >
                                            <Lightbulb className="w-3 h-3 mr-1" />
                                            Suggest
                                          </Button>
                                        </div>
                                        <IconPickerButton
                                          value={editingCategory.icon || ''}
                                          onChange={(icon) => setEditingCategory(prev => prev ? ({ ...prev, icon }) : null)}
                                        />
                                      </div>
                                      <Button onClick={handleUpdateCategory} className="w-full" disabled={isProcessing}>
                                        {isProcessing ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(subCat)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No services in this category yet. 
                      <Button
                        variant="link"
                        className="px-1"
                        onClick={() => {
                          setSelectedParentForSubcategory(mainCat.id);
                          setIsAddingSubcategory(true);
                        }}
                      >
                        Add a service
                      </Button>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {mainCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No categories found</p>
              <p className="text-sm">Add a main category to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCategories;
