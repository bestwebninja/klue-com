import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  new_messages: boolean;
  quote_requests: boolean;
  quote_responses: boolean;
  expert_answers: boolean;
  job_lead_max_distance: number;
}

const defaultPreferences: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  new_messages: true,
  quote_requests: true,
  quote_responses: true,
  expert_answers: true,
  job_lead_max_distance: 50,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const prefs = data as any;
        setPreferences({
          push_enabled: prefs.push_enabled,
          email_enabled: prefs.email_enabled,
          new_messages: prefs.new_messages,
          quote_requests: prefs.quote_requests,
          quote_responses: prefs.quote_responses,
          expert_answers: prefs.expert_answers,
          job_lead_max_distance: prefs.job_lead_max_distance ?? 50,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;
    
    setSaving(true);
    const updatedPreferences = { ...preferences, ...newPreferences };
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
  };
}
