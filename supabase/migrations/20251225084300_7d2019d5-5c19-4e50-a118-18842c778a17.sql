-- Create a function to get public job listings without exposing posted_by
CREATE OR REPLACE FUNCTION public.get_public_job_listings(
  p_category_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 12,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  location_area text,
  budget_min numeric,
  budget_max numeric,
  created_at timestamptz,
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
    jl.category_id,
    sc.name as category_name,
    sc.icon as category_icon
  FROM public.job_listings jl
  LEFT JOIN public.service_categories sc ON sc.id = jl.category_id
  WHERE jl.status = 'open'
    AND (p_category_id IS NULL OR jl.category_id = p_category_id)
  ORDER BY jl.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Create a function to count public job listings
CREATE OR REPLACE FUNCTION public.count_public_job_listings(
  p_category_id uuid DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.job_listings jl
  WHERE jl.status = 'open'
    AND (p_category_id IS NULL OR jl.category_id = p_category_id);
$$;