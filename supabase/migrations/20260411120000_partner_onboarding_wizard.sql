-- Partner onboarding wizard persistence, compliance hooks, and private storage

CREATE TABLE IF NOT EXISTS public.partner_onboarding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  partner_type TEXT NOT NULL DEFAULT '',
  entity_type TEXT NOT NULL DEFAULT '',
  offer_type TEXT NOT NULL DEFAULT '',
  application_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  verification_tier TEXT NOT NULL DEFAULT 'pending',
  compliance_status TEXT NOT NULL DEFAULT 'pending_review',
  risk_score_placeholder NUMERIC(6,2),
  preferred_territory_under_review BOOLEAN NOT NULL DEFAULT FALSE,
  source_tracking TEXT NOT NULL DEFAULT 'web_partner_signup',
  manual_review_flags JSONB NOT NULL DEFAULT '[]'::JSONB,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_onboarding_applications_user_idx
  ON public.partner_onboarding_applications (applicant_user_id, status, updated_at DESC);

ALTER TABLE public.partner_onboarding_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own partner onboarding applications" ON public.partner_onboarding_applications;
CREATE POLICY "Users can view own partner onboarding applications"
ON public.partner_onboarding_applications
FOR SELECT
TO authenticated
USING (auth.uid() = applicant_user_id);

DROP POLICY IF EXISTS "Users can insert own partner onboarding applications" ON public.partner_onboarding_applications;
CREATE POLICY "Users can insert own partner onboarding applications"
ON public.partner_onboarding_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_user_id);

DROP POLICY IF EXISTS "Users can update own draft partner onboarding applications" ON public.partner_onboarding_applications;
CREATE POLICY "Users can update own draft partner onboarding applications"
ON public.partner_onboarding_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = applicant_user_id)
WITH CHECK (
  auth.uid() = applicant_user_id
  AND status IN ('draft', 'submitted')
);

DROP POLICY IF EXISTS "Admins can view all partner onboarding applications" ON public.partner_onboarding_applications;
CREATE POLICY "Admins can view all partner onboarding applications"
ON public.partner_onboarding_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_partner_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_onboarding_updated_at ON public.partner_onboarding_applications;
CREATE TRIGGER trg_partner_onboarding_updated_at
BEFORE UPDATE ON public.partner_onboarding_applications
FOR EACH ROW EXECUTE FUNCTION public.set_partner_onboarding_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-onboarding-documents', 'partner-onboarding-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own partner onboarding docs" ON storage.objects;
CREATE POLICY "Users can upload own partner onboarding docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'partner-onboarding-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own partner onboarding docs" ON storage.objects;
CREATE POLICY "Users can view own partner onboarding docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'partner-onboarding-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own partner onboarding docs" ON storage.objects;
CREATE POLICY "Users can update own partner onboarding docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'partner-onboarding-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admins can view partner onboarding docs" ON storage.objects;
CREATE POLICY "Admins can view partner onboarding docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'partner-onboarding-documents'
  AND has_role(auth.uid(), 'admin')
);
