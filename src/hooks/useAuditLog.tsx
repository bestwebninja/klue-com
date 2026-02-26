import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = async ({ action, entityType, entityId, details }: AuditLogParams) => {
    if (!user) return;

    try {
      // Using type assertion since the types may not be regenerated yet
      const { error } = await (supabase.from('audit_logs') as unknown as {
        insert: (data: {
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
        }) => Promise<{ error: Error | null }>;
      }).insert({
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null,
      });

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  return { logAction };
};
