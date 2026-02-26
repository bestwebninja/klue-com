-- Update get_public_job_listings_with_coords to show postcode instead of city
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
    -- Show postcode for location (last part of address typically contains postcode)
    CASE 
      WHEN jl.location IS NOT NULL THEN 
        -- Extract postcode (typically last element after comma, or use regex for UK postcode pattern)
        COALESCE(
          (SELECT match[1] FROM regexp_matches(jl.location, '([A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2})', 'i') AS match LIMIT 1),
          TRIM(SPLIT_PART(jl.location, ',', array_length(string_to_array(jl.location, ','), 1)))
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

-- Update get_public_job_listings to show postcode instead of city
CREATE OR REPLACE FUNCTION public.get_public_job_listings(p_category_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, title text, description text, location_area text, budget_min numeric, budget_max numeric, created_at timestamp with time zone, category_id uuid, category_name text, category_icon text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    jl.id,
    jl.title,
    jl.description,
    -- Show postcode for location
    CASE 
      WHEN jl.location IS NOT NULL THEN 
        COALESCE(
          (SELECT match[1] FROM regexp_matches(jl.location, '([A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2})', 'i') AS match LIMIT 1),
          TRIM(SPLIT_PART(jl.location, ',', array_length(string_to_array(jl.location, ','), 1)))
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

-- Update get_public_job_listing for single job view
CREATE OR REPLACE FUNCTION public.get_public_job_listing(p_job_id uuid)
RETURNS TABLE(id uuid, title text, description text, location_area text, budget_min numeric, budget_max numeric, created_at timestamp with time zone, updated_at timestamp with time zone, status text, category_id uuid, category_name text, category_icon text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    jl.id,
    jl.title,
    jl.description,
    -- Show postcode for location
    CASE 
      WHEN jl.location IS NOT NULL THEN 
        COALESCE(
          (SELECT match[1] FROM regexp_matches(jl.location, '([A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2})', 'i') AS match LIMIT 1),
          TRIM(SPLIT_PART(jl.location, ',', array_length(string_to_array(jl.location, ','), 1)))
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