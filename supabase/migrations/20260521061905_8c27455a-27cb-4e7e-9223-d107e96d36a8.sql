-- Fix mutable search_path on relationship_label
CREATE OR REPLACE FUNCTION public.relationship_label(_score int)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _score <= -80 THEN 'hate'
    WHEN _score <= -50 THEN 'anger'
    WHEN _score <= -20 THEN 'jealousy'
    WHEN _score <   20 THEN 'neutral'
    WHEN _score <   50 THEN 'trust'
    WHEN _score <   75 THEN 'care'
    WHEN _score <   90 THEN 'affection'
    ELSE 'love'
  END
$$;

-- Revoke public EXECUTE from owner-only SECURITY DEFINER functions.
-- They are called via server functions using the service-role context,
-- and they also self-check is_admin_or_owner internally as defense in depth.
REVOKE EXECUTE ON FUNCTION public.owner_gift_points(uuid, int, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owner_set_premium(uuid, boolean) FROM PUBLIC, anon, authenticated;
