REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.compute_level(numeric) FROM anon;