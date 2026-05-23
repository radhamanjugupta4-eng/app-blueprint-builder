GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_owner(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_level(numeric) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin'::app_role AND public.is_owner(OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot remove owner role';
    END IF;
    IF OLD.role = 'admin'::app_role AND NOT public.is_admin_or_owner(auth.uid()) THEN
      RAISE EXCEPTION 'Only admin or owner can remove admin roles';
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin'::app_role AND NOT public.is_admin_or_owner(auth.uid()) AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'Only admin or owner can grant admin roles';
    END IF;
    IF NEW.role = 'admin'::app_role AND NOT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = NEW.user_id
        AND lower(email) IN ('gupta.ravinderkr@gmail.com', 'radhamanjugupta4@gmail.com')
    ) THEN
      RAISE EXCEPTION 'This email cannot hold admin access';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END
$function$;

DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'::app_role
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = ur.user_id
      AND lower(u.email) IN ('gupta.ravinderkr@gmail.com', 'radhamanjugupta4@gmail.com')
  );

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) IN ('gupta.ravinderkr@gmail.com', 'radhamanjugupta4@gmail.com')
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS app_config_read ON public.app_config;
CREATE POLICY app_config_read ON public.app_config
FOR SELECT TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS app_config_write ON public.app_config;
CREATE POLICY app_config_write ON public.app_config
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS audit_read ON public.audit_logs;
CREATE POLICY audit_read ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS audit_insert ON public.audit_logs;
CREATE POLICY audit_insert ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS character_state_owner_all ON public.character_state;
CREATE POLICY character_state_owner_all ON public.character_state
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS character_state_admin_all ON public.character_state;
CREATE POLICY character_state_admin_all ON public.character_state
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS chats_owner_all ON public.chats;
CREATE POLICY chats_owner_all ON public.chats
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chats_admin_read ON public.chats;
CREATE POLICY chats_admin_read ON public.chats
FOR SELECT TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS deaths_owner_insert ON public.deaths;
CREATE POLICY deaths_owner_insert ON public.deaths
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS deaths_owner_select ON public.deaths;
CREATE POLICY deaths_owner_select ON public.deaths
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS lh_self_read ON public.level_history;
CREATE POLICY lh_self_read ON public.level_history
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS lh_admin_write ON public.level_history;
CREATE POLICY lh_admin_write ON public.level_history
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS messages_owner_all ON public.messages;
CREATE POLICY messages_owner_all ON public.messages
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS messages_admin_read ON public.messages;
CREATE POLICY messages_admin_read ON public.messages
FOR SELECT TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS mod_admin_all ON public.moderation_logs;
CREATE POLICY mod_admin_all ON public.moderation_logs
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS points_ledger_owner_select ON public.points_ledger;
CREATE POLICY points_ledger_owner_select ON public.points_ledger
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS points_ledger_owner_insert ON public.points_ledger;
CREATE POLICY points_ledger_owner_insert ON public.points_ledger
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS points_admin_insert ON public.points_ledger;
CREATE POLICY points_admin_insert ON public.points_ledger
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
FOR SELECT TO authenticated
USING ((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS rh_owner_read ON public.relationship_history;
CREATE POLICY rh_owner_read ON public.relationship_history
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS rh_owner_insert ON public.relationship_history;
CREATE POLICY rh_owner_insert ON public.relationship_history
FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = user_id) OR public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS rh_admin_write ON public.relationship_history;
CREATE POLICY rh_admin_write ON public.relationship_history
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS subscriptions_owner_select ON public.subscriptions;
CREATE POLICY subscriptions_owner_select ON public.subscriptions
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS subscriptions_owner_update ON public.subscriptions;
CREATE POLICY subscriptions_owner_update ON public.subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS subs_admin_write ON public.subscriptions;
CREATE POLICY subs_admin_write ON public.subscriptions
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS user_abilities_owner_all ON public.user_abilities;
CREATE POLICY user_abilities_owner_all ON public.user_abilities
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_abilities_admin_all ON public.user_abilities;
CREATE POLICY user_abilities_admin_all ON public.user_abilities
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS ul_self_read ON public.user_levels;
CREATE POLICY ul_self_read ON public.user_levels
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS ul_admin_write ON public.user_levels;
CREATE POLICY ul_admin_write ON public.user_levels
FOR ALL TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS user_progress_owner_all ON public.user_progress;
CREATE POLICY user_progress_owner_all ON public.user_progress
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS roles_self_select ON public.user_roles;
CREATE POLICY roles_self_select ON public.user_roles
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS roles_admin_all ON public.user_roles;
CREATE POLICY roles_admin_all ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));