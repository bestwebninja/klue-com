import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';
import { isAllowlistedAdminEmail } from '@/constants/adminAllowlist';

type AppRole = Database['public']['Enums']['app_role'];

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles(isAllowlistedAdminEmail(user.email) ? ['admin'] : []);
      } else {
        const fetchedRoles = data?.map((r) => r.role) || [];
        const resolvedRoles = isAllowlistedAdminEmail(user.email) && !fetchedRoles.includes('admin')
          ? [...fetchedRoles, 'admin']
          : fetchedRoles;

        setRoles(resolvedRoles);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isProvider = roles.includes('provider');
  const isAdmin = roles.includes('admin');
  const isUser = !isProvider && !isAdmin;

  return {
    roles,
    isProvider,
    isAdmin,
    isUser,
    loading,
  };
}
