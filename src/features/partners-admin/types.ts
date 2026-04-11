export type PartnerRecord = {
  id: string;
  partner_id: string;
  partner_type: string;
  legal_business_name: string;
  dba_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  primary_territory: string | null;
  verification_tier: string;
  compliance_status: string;
  feed_status: string;
  preferred_territory_status: string;
  created_at: string;
  updated_at: string;
  risk_score: number;
  status: string;
  preferred_requested: boolean;
  feed_type: string | null;
  partner_categories: { category: string }[];
  contractor_partner_links: { id: string }[];
  partner_documents?: { expires_at: string | null }[];
};

export type PartnerAdminAction =
  | 'approve_partner'
  | 'reject_partner'
  | 'request_more_info'
  | 'approve_preferred_territory'
  | 'reject_preferred_territory'
  | 'update_verification_status'
  | 'update_compliance_status'
  | 'save_internal_note'
  | 'refresh_contractor_links';
