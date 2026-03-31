CREATE TABLE IF NOT EXISTS public.contractor_quote_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  project_address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  builder_name TEXT NOT NULL,
  project_date TEXT,
  realtor_contact TEXT,
  attorney_email TEXT,
  selected_supplier TEXT NOT NULL DEFAULT 'Default Supplier Network',
  selected_materials TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  checklist_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  text_fields_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  weather_summary TEXT NOT NULL DEFAULT '',
  workflow_flags_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contractor_quote_workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_intake_id UUID NOT NULL REFERENCES public.contractor_quote_intakes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_payload_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contractor_quote_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_quote_workflow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contractor quote intakes"
ON public.contractor_quote_intakes
FOR SELECT
USING (auth.uid() = requester_user_id);

CREATE POLICY "Users can insert own contractor quote intakes"
ON public.contractor_quote_intakes
FOR INSERT
WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users can view own contractor quote workflow events"
ON public.contractor_quote_workflow_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.contractor_quote_intakes cqi
    WHERE cqi.id = quote_intake_id
      AND cqi.requester_user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.update_contractor_quote_intakes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contractor_quote_intakes_updated_at ON public.contractor_quote_intakes;
CREATE TRIGGER update_contractor_quote_intakes_updated_at
BEFORE UPDATE ON public.contractor_quote_intakes
FOR EACH ROW EXECUTE FUNCTION public.update_contractor_quote_intakes_updated_at();
