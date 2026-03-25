import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Check if the current user's profile is complete (has phone number).
 * Used to redirect Google OAuth users to /complete-profile if needed.
 */
export function useProfileComplete() {
  const { user, loading: authLoading } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsComplete(null);
      setLoading(false);
      return;
    }

    // Profile is considered complete once user exists (no phone requirement)
    setIsComplete(true);
    setLoading(false);
  }, [user, authLoading]);

  return { isComplete, loading };
}
