-- Update count_public_job_listings to include subcategories when main category selected
CREATE OR REPLACE FUNCTION public.count_public_job_listings(p_category_id uuid DEFAULT NULL::uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.job_listings jl
  WHERE jl.status = 'open'
    AND (
      p_category_id IS NULL 
      OR jl.category_id = p_category_id
      -- Include jobs from subcategories if a main category is selected
      OR jl.category_id IN (
        SELECT sc.id FROM public.service_categories sc 
        WHERE sc.parent_id = p_category_id
      )
    );
$$;

-- Update get_public_job_listings to include subcategories when main category selected
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
    AND (
      p_category_id IS NULL 
      OR jl.category_id = p_category_id
      -- Include jobs from subcategories if a main category is selected
      OR jl.category_id IN (
        SELECT scc.id FROM public.service_categories scc 
        WHERE scc.parent_id = p_category_id
      )
    )
  ORDER BY jl.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;