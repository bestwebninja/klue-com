-- Create a function to get public job listings with coordinates for map display
CREATE OR REPLACE FUNCTION public.get_public_job_listings_with_coords()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  location text,
  budget_min numeric,
  budget_max numeric,
  created_at timestamp with time zone,
  category_id uuid,
  category_name text,
  latitude numeric,
  longitude numeric
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
    -- Only show general area, not full address for privacy
    CASE 
      WHEN jl.location IS NOT NULL THEN 
        COALESCE(
          NULLIF(TRIM(SPLIT_PART(jl.location, ',', 2)), ''),
          jl.location
        )
      ELSE NULL
    END as location,
    jl.budget_min,
    jl.budget_max,
    jl.created_at,
    jl.category_id,
    sc.name as category_name,
    jl.latitude,
    jl.longitude
  FROM public.job_listings jl
  LEFT JOIN public.service_categories sc ON sc.id = jl.category_id
  WHERE jl.status = 'open'
    AND jl.latitude IS NOT NULL
    AND jl.longitude IS NOT NULL;
$$;