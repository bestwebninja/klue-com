import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PartnerAdminAction, PartnerRecord } from './types';

export type PartnerFilters = {
  partnerType?: string;
  state?: string;
  city?: string;
  zip?: string;
  category?: string;
  verificationTier?: string;
  complianceStatus?: string;
  preferredRequested?: 'all' | 'yes' | 'no';
  feedType?: string;
  minRiskScore?: number;
  linkedContractors?: 'all' | 'yes' | 'no';
  expiringDocs?: 'all' | 'yes' | 'no';
};

export const usePartnerList = (filters: PartnerFilters) =>
  useQuery({
    queryKey: ['partners-admin', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('partners')
        .select('id,partner_id,partner_type,legal_business_name,dba_name,contact_name,email,phone,state,city,zip,primary_territory,verification_tier,compliance_status,feed_status,preferred_territory_status,created_at,updated_at,risk_score,status,preferred_requested,feed_type,partner_categories(category),contractor_partner_links(id),partner_documents(expires_at)')
        .order('created_at', { ascending: false });

      if (filters.partnerType) query = query.eq('partner_type', filters.partnerType);
      if (filters.state) query = query.ilike('state', `%${filters.state}%`);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters.zip) query = query.ilike('zip', `%${filters.zip}%`);
      if (filters.verificationTier) query = query.eq('verification_tier', filters.verificationTier);
      if (filters.complianceStatus) query = query.eq('compliance_status', filters.complianceStatus);
      if (filters.feedType) query = query.eq('feed_type', filters.feedType);
      if (typeof filters.minRiskScore === 'number' && !Number.isNaN(filters.minRiskScore)) {
        query = query.gte('risk_score', filters.minRiskScore);
      }
      if (filters.preferredRequested === 'yes') query = query.eq('preferred_requested', true);
      if (filters.preferredRequested === 'no') query = query.eq('preferred_requested', false);

      const { data, error } = await query;
      if (error) throw error;

      let rows = (data ?? []) as unknown as PartnerRecord[];

      if (filters.category) {
        const categoryLower = filters.category.toLowerCase();
        rows = rows.filter((row) => row.partner_categories?.some((c) => c.category.toLowerCase().includes(categoryLower)));
      }

      if (filters.expiringDocs === 'yes') {
        rows = rows.filter((row) =>
          (row.partner_documents ?? []).some((doc) => {
            if (!doc.expires_at) return false;
            const expiry = new Date(doc.expires_at).getTime();
            return expiry < Date.now() + 1000 * 60 * 60 * 24 * 30;
          })
        );
      }
      if (filters.expiringDocs === 'no') {
        rows = rows.filter((row) =>
          (row.partner_documents ?? []).every((doc) => {
            if (!doc.expires_at) return true;
            const expiry = new Date(doc.expires_at).getTime();
            return expiry >= Date.now() + 1000 * 60 * 60 * 24 * 30;
          })
        );
      }

      if (filters.linkedContractors === 'yes') {
        rows = rows.filter((row) => (row.contractor_partner_links?.length ?? 0) > 0);
      }
      if (filters.linkedContractors === 'no') {
        rows = rows.filter((row) => (row.contractor_partner_links?.length ?? 0) === 0);
      }

      return rows;
    },
  });

export const usePartnerDetail = (partnerId?: string) =>
  useQuery({
    queryKey: ['partners-admin', 'detail', partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*,partner_contacts(*),partner_addresses(*),partner_territories(*),partner_categories(*),partner_documents(*),partner_verifications(*),partner_license_records(*),partner_insurance_records(*),partner_feed_connections(*),partner_internal_notes(*),preferred_partner_applications(*),partner_audit_log(*)')
        .eq('id', partnerId)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const useLinkedContractors = (partnerId?: string) =>
  useQuery({
    queryKey: ['partners-admin', 'linked-contractors', partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_partner_links')
        .select('id,contractor_id,territory_match_score,category_match_score,compliance_match_score,fulfillment_match_score,quality_score,preferred_partner_weight,match_score,profiles:contractor_id(full_name,email,state,city)')
        .eq('partner_id', partnerId)
        .order('match_score', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const usePartnerActionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ action, partnerId, payload }: { action: PartnerAdminAction; partnerId: string; payload?: Record<string, unknown> }) => {
      const { error } = await supabase.functions.invoke('admin-partner-actions', {
        body: { action, partnerId, payload },
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['partners-admin'] });
      qc.invalidateQueries({ queryKey: ['partners-admin', 'detail', vars.partnerId] });
    },
  });
};
