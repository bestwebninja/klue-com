-- Create function to get a single public job listing by ID
CREATE OR REPLACE FUNCTION public.get_public_job_listing(p_job_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  location_area text,
  budget_min numeric,
  budget_max numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  status text,
  category_id uuid,
  category_name text,
  category_icon text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    jl.id,
    jl.title,
    jl.description,
    -- Only show general area, not full address
    CASE 
      WHEN jl.location IS NOT NULL THEN 
        COALESCE(
          NULLIF(TRIM(SPLIT_PART(jl.location, ',', 2)), ''),
          jl.location
        )
      ELSE NULL
    END as location_area,
    jl.budget_min,
    jl.budget_max,
    jl.created_at,
    jl.updated_at,
    jl.status,
    jl.category_id,
    sc.name as category_name,
    sc.icon as category_icon
  FROM public.job_listings jl
  LEFT JOIN public.service_categories sc ON sc.id = jl.category_id
  WHERE jl.id = p_job_id
    AND jl.status = 'open';
$$;