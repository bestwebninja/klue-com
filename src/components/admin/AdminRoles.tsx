import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Shield, Plus, Trash2, Search, CheckSquare, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  profiles?: Profile | null;
}

const AdminRoles = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roles:', error);
      toast({ title: 'Error', description: 'Failed to fetch roles', variant: 'destructive' });
    } else {
      setRoles((data as unknown as UserRole[]) || []);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (!error) {
      setUsers(data || []);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({ title: 'Error', description: 'Please select a user and role', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase.from('user_roles').insert({
      user_id: selectedUserId,
      role: selectedRole as 'admin' | 'moderator' | 'user',
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Error', description: 'User already has this role', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to add role', variant: 'destructive' });
      }
    } else {
      const user = users.find((u) => u.id === selectedUserId);
      await logAction({
        action: 'assign_role',
        entityType: 'role',
        entityId: data?.id,
        details: { user_id: selectedUserId, role: selectedRole, user_name: user?.full_name },
      });
      toast({ title: 'Success', description: 'Role assigned successfully' });
      fetchRoles();
      setIsAdding(false);
      setSelectedUserId('');
      setSelectedRole('');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) return;

    const roleToDelete = roles.find((r) => r.id === roleId);
    const { error } = await supabase.from('user_roles').delete().eq('id', roleId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove role', variant: 'destructive' });
    } else {
      await logAction({
        action: 'remove_role',
        entityType: 'role',
        entityId: roleId,
        details: { user_id: roleToDelete?.user_id, role: roleToDelete?.role },
      });
      toast({ title: 'Success', description: 'Role removed successfully' });
      fetchRoles();
    }
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((r) => r.id));
    }
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.length === 0) return;

    if (!confirm(`Are you sure you want to remove ${selectedRoles.length} roles?`)) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .in('id', selectedRoles);

      if (error) throw error;
      await logAction({
        action: 'bulk_remove_roles',
        entityType: 'role',
        details: { role_ids: selectedRoles, count: selectedRoles.length },
      });
      toast({ title: 'Success', description: `Removed ${selectedRoles.length} roles` });
      fetchRoles();
      setSelectedRoles([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({ title: 'Error', description: 'Failed to remove roles', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500">Moderator</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Roles Management
            </CardTitle>
            <CardDescription>Assign and manage admin and moderator roles</CardDescription>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Search User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email || user.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddRole} className="w-full">
                  Assign Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bulk Actions Bar */}
        {selectedRoles.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedRoles.length} selected</span>
            </div>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isProcessing ? 'Removing...' : 'Remove Selected'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSelectedRoles([])}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Roles Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRoles.length === roles.length && roles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className={selectedRoles.includes(role.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleSelectRole(role.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {role.profiles?.full_name || 'Unknown User'}
                  </TableCell>
                  <TableCell>{role.profiles?.email || 'N/A'}</TableCell>
                  <TableCell>{getRoleBadge(role.role)}</TableCell>
                  <TableCell>{formatDate(role.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No roles assigned yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">How to assign the first admin:</h4>
          <p className="text-sm text-muted-foreground">
            To assign the first admin, you'll need to manually insert a row into the user_roles table 
            in your database with the user_id and role set to 'admin'. After that, the admin can 
            assign roles to other users through this interface.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRoles;
