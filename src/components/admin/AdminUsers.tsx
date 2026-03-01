import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Users, Search, Edit, Eye, Crown, X, CheckSquare, Star, BadgeCheck, Trash2, Ban, ShieldOff, Phone, PhoneCall } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_featured?: boolean;
  is_verified?: boolean;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspension_reason?: string | null;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } else {
      setUsers(data || []);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editingUser.full_name,
        email: editingUser.email,
        phone: editingUser.phone,
        bio: editingUser.bio,
        is_featured: editingUser.is_featured,
        is_verified: editingUser.is_verified,
        phone_verified: (editingUser as any).phone_verified,
      } as any)
      .eq('id', editingUser.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } else {
      await logAction({
        action: 'update_user',
        entityType: 'user',
        entityId: editingUser.id,
        details: { 
          full_name: editingUser.full_name, 
          email: editingUser.email,
          is_featured: editingUser.is_featured,
          is_verified: editingUser.is_verified,
        },
      });
      toast({ title: 'Success', description: 'User updated successfully' });
      fetchUsers();
      setIsEditing(false);
      setEditingUser(null);
    }
  };

  const handleToggleFeatured = async (userId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_featured: newValue,
        featured_at: newValue ? new Date().toISOString() : null,
      })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update featured status', variant: 'destructive' });
    } else {
      await logAction({
        action: newValue ? 'feature_provider' : 'unfeature_provider',
        entityType: 'user',
        entityId: userId,
        details: { is_featured: newValue },
      });
      toast({ title: 'Success', description: `Provider ${newValue ? 'featured' : 'unfeatured'} successfully` });
      fetchUsers();
    }
  };

  const handleToggleVerified = async (userId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: newValue })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update verified status', variant: 'destructive' });
    } else {
      await logAction({
        action: newValue ? 'verify_provider' : 'unverify_provider',
        entityType: 'user',
        entityId: userId,
        details: { is_verified: newValue },
      });
      toast({ title: 'Success', description: `Provider ${newValue ? 'verified' : 'unverified'} successfully` });
      fetchUsers();
    }
  };

  const handleTogglePhoneVerified = async (userId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const { error } = await supabase
      .from('profiles')
      .update({ phone_verified: newValue } as any)
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update phone verified status', variant: 'destructive' });
    } else {
      await logAction({
        action: newValue ? 'verify_phone' : 'unverify_phone',
        entityType: 'user',
        entityId: userId,
        details: { phone_verified: newValue },
      });
      toast({ title: 'Success', description: `Phone ${newValue ? 'verified' : 'unverified'} successfully` });
      fetchUsers();
    }
  };

  const sendSuspensionNotification = async (userId: string, action: 'suspended' | 'unsuspended', reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-suspension-notification', {
        body: { userId, action, reason },
      });
      if (error) {
        console.error('Failed to send suspension notification:', error);
      }
    } catch (err) {
      console.error('Error sending suspension notification:', err);
    }
  };

  const handleSuspendUser = async () => {
    if (!userToSuspend) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspension_reason: suspensionReason || null,
      })
      .eq('id', userToSuspend.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to suspend user', variant: 'destructive' });
    } else {
      await logAction({
        action: 'suspend_user',
        entityType: 'user',
        entityId: userToSuspend.id,
        details: { reason: suspensionReason },
      });
      
      // Send email notification
      await sendSuspensionNotification(userToSuspend.id, 'suspended', suspensionReason);
      
      toast({ title: 'User Suspended', description: `${userToSuspend.full_name || 'User'} has been suspended and notified via email` });
      fetchUsers();
      setSuspendDialogOpen(false);
      setUserToSuspend(null);
      setSuspensionReason('');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: false,
        suspended_at: null,
        suspension_reason: null,
      })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to unsuspend user', variant: 'destructive' });
    } else {
      await logAction({
        action: 'unsuspend_user',
        entityType: 'user',
        entityId: userId,
      });
      
      // Send email notification
      await sendSuspensionNotification(userId, 'unsuspended');
      
      toast({ title: 'User Unsuspended', description: 'User account has been reactivated and notified via email' });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Delete related data first, then the profile
    try {
      // Delete user's quote requests
      await supabase.from('quote_requests').delete().eq('provider_id', userId);
      
      // Delete user's job listings
      await supabase.from('job_listings').delete().eq('posted_by', userId);
      
      // Delete user's reviews (as reviewer)
      await supabase.from('reviews').delete().eq('reviewer_id', userId);
      
      // Delete user's provider services
      await supabase.from('provider_services').delete().eq('provider_id', userId);
      
      // Delete user's provider locations
      await supabase.from('provider_locations').delete().eq('provider_id', userId);
      
      // Delete user's notification preferences
      await supabase.from('notification_preferences').delete().eq('user_id', userId);
      
      // Delete the profile
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      
      if (error) throw error;

      await logAction({
        action: 'delete_user',
        entityType: 'user',
        entityId: userId,
      });
      
      toast({ title: 'User Deleted', description: 'User and all associated data have been deleted' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    setIsProcessing(true);

    try {
      let updateData: Record<string, any> = {};
      let actionName = '';

      switch (bulkAction) {
        case 'activate_subscription':
          updateData = { subscription_status: 'active' };
          actionName = 'bulk_activate_subscription';
          break;
        case 'deactivate_subscription':
          updateData = { subscription_status: 'free' };
          actionName = 'bulk_deactivate_subscription';
          break;
        case 'feature':
          updateData = { is_featured: true, featured_at: new Date().toISOString() };
          actionName = 'bulk_feature_providers';
          break;
        case 'unfeature':
          updateData = { is_featured: false, featured_at: null };
          actionName = 'bulk_unfeature_providers';
          break;
        case 'verify':
          updateData = { is_verified: true };
          actionName = 'bulk_verify_providers';
          break;
        case 'unverify':
          updateData = { is_verified: false };
          actionName = 'bulk_unverify_providers';
          break;
        case 'suspend':
          updateData = { is_suspended: true, suspended_at: new Date().toISOString() };
          actionName = 'bulk_suspend_users';
          break;
        case 'unsuspend':
          updateData = { is_suspended: false, suspended_at: null, suspension_reason: null };
          actionName = 'bulk_unsuspend_users';
          break;
        default:
          throw new Error('Unknown action');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .in('id', selectedUsers);

      if (error) throw error;

      await logAction({
        action: actionName,
        entityType: 'user',
        details: { user_ids: selectedUsers, count: selectedUsers.length },
      });

      toast({ title: 'Success', description: `Updated ${selectedUsers.length} users` });
      fetchUsers();
      setSelectedUsers([]);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ title: 'Error', description: 'Failed to perform bulk action', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>View, edit user profiles, and manage featured/verified status</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedUsers.length} selected</span>
            </div>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate_subscription">Activate Pro Subscription</SelectItem>
                <SelectItem value="deactivate_subscription">Deactivate Subscription</SelectItem>
                <SelectItem value="feature">Mark as Featured</SelectItem>
                <SelectItem value="unfeature">Remove Featured</SelectItem>
                <SelectItem value="verify">Mark as Verified</SelectItem>
                <SelectItem value="unverify">Remove Verified</SelectItem>
                <SelectItem value="suspend">Suspend Users</SelectItem>
                <SelectItem value="unsuspend">Unsuspend Users</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkAction} 
              disabled={!bulkAction || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSelectedUsers([]);
                setBulkAction('');
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Phone Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-center">Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={selectedUsers.includes(user.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${user.is_suspended ? 'text-muted-foreground line-through' : ''}`}>
                        {user.full_name || 'N/A'}
                      </span>
                      {user.is_suspended && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </Badge>
                      )}
                      {user.is_featured && !user.is_suspended && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                          <Star className="w-3 h-3 fill-current" />
                        </Badge>
                      )}
                      {user.is_verified && !user.is_suspended && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <BadgeCheck className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={user.is_suspended ? 'text-muted-foreground' : ''}>
                    {user.email}
                  </TableCell>
                  <TableCell className={user.is_suspended ? 'text-muted-foreground' : ''}>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{user.phone || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={(user as any).phone_verified ?? false}
                      onCheckedChange={() => handleTogglePhoneVerified(user.id, (user as any).phone_verified ?? false)}
                    />
                  </TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <span className="flex items-center gap-1 text-destructive">
                        <Ban className="w-4 h-4" /> Suspended
                      </span>
                    ) : user.subscription_status === 'active' ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Crown className="w-4 h-4" /> Pro
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.is_featured ?? false}
                      onCheckedChange={() => handleToggleFeatured(user.id, user.is_featured ?? false)}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.is_verified ?? false}
                      onCheckedChange={() => handleToggleVerified(user.id, user.is_verified ?? false)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditing && editingUser?.id === user.id} onOpenChange={(open) => {
                      setIsEditing(open);
                      if (!open) setEditingUser(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4">
                            <div>
                              <Label>Full Name</Label>
                              <Input
                                value={editingUser.full_name || ''}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, full_name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                value={editingUser.email || ''}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, email: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <Input
                                value={editingUser.phone || ''}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, phone: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Bio</Label>
                              <Textarea
                                value={editingUser.bio || ''}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, bio: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                <Label htmlFor="featured-toggle">Featured Provider</Label>
                              </div>
                              <Switch
                                id="featured-toggle"
                                checked={editingUser.is_featured ?? false}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, is_featured: checked })
                                }
                                className="data-[state=checked]:bg-amber-500"
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-primary" />
                                <Label htmlFor="verified-toggle">Verified Provider</Label>
                              </div>
                              <Switch
                                id="verified-toggle"
                                checked={editingUser.is_verified ?? false}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, is_verified: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                <PhoneCall className="w-4 h-4 text-green-600" />
                                <Label htmlFor="phone-verified-toggle">Phone Verified</Label>
                              </div>
                              <Switch
                                id="phone-verified-toggle"
                                checked={(editingUser as any).phone_verified ?? false}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, phone_verified: checked } as any)
                                }
                              />
                            </div>
                            <Button onClick={handleUpdateUser} className="w-full">
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <a href={`/service-provider/${user.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </a>
                    
                    {/* Suspend/Unsuspend Button */}
                    {user.is_suspended ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnsuspendUser(user.id)}
                        title="Unsuspend user"
                      >
                        <ShieldOff className="w-4 h-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUserToSuspend(user);
                          setSuspendDialogOpen(true);
                        }}
                        title="Suspend user"
                      >
                        <Ban className="w-4 h-4 text-orange-500" />
                      </Button>
                    )}
                    
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Delete user">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete {user.full_name || 'this user'}? 
                            This will remove all their data including jobs, quotes, reviews, and profile information.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Total users: {users.length}
        </p>
      </CardContent>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {userToSuspend?.full_name || 'this user'}? They will not be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspension-reason">Reason for suspension (optional)</Label>
              <Textarea
                id="suspension-reason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuspendDialogOpen(false);
              setUserToSuspend(null);
              setSuspensionReason('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminUsers;
