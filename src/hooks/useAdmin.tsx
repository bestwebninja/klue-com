import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { isAllowlistedAdminEmail } from '@/constants/adminAllowlist';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAdminStatus = async () => {
      setLoading(true);

      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      if (isAllowlistedAdminEmail(user.email)) {
        if (!cancelled) {
          setIsAdmin(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        if (!cancelled) {
          setIsAdmin(false);
        }
      } else {
        if (!cancelled) {
          setIsAdmin(!!data);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    checkAdminStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, loading };
};
