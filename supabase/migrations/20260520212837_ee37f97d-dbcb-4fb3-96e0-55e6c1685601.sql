alter function public.touch_updated_at() set search_path = public;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS personality text,
  ADD COLUMN IF NOT EXISTS aggression int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS danger int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS point_reward int NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS can_kill boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.abilities
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.story_realms
  ADD COLUMN IF NOT EXISTS checkpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS branches jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.character_state
  ADD COLUMN IF NOT EXISTS last_change_reason text;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND lower(email) = 'gupta.ravinderkr@gmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role) OR public.is_owner(_user_id);
$$;

CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin'::app_role AND public.is_owner(OLD.user_id) THEN
      RAISE EXCEPTION 'Cannot remove owner role';
    END IF;
    IF OLD.role = 'admin'::app_role AND NOT public.is_owner(auth.uid()) THEN
      RAISE EXCEPTION 'Only the owner can remove admin roles';
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin'::app_role AND NOT public.is_owner(auth.uid()) AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'Only the owner can grant admin roles';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_user_roles_trg ON public.user_roles;
CREATE TRIGGER guard_user_roles_trg
BEFORE INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  IF lower(NEW.email) = 'gupta.ravinderkr@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u
WHERE lower(u.email) = 'gupta.ravinderkr@gmail.com'
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_config_read ON public.app_config
  FOR SELECT USING (public.is_admin_or_owner(auth.uid()));
CREATE POLICY app_config_write ON public.app_config
  FOR ALL USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

INSERT INTO public.app_config (key, value, description) VALUES
  ('relationship_states', '{"hate":-100,"anger":-70,"jealousy":-20,"neutral":0,"trust":20,"care":50,"affection":70,"love":100}'::jsonb, 'Hidden relationship state thresholds'),
  ('level_thresholds', '{"tiers":[{"upTo":5,"hoursPerLevel":1},{"upTo":10,"hoursPerLevel":2},{"upTo":15,"hoursPerLevel":3},{"upTo":20,"hoursPerLevel":4},{"upTo":100,"hoursPerLevel":5}]}'::jsonb, 'Hours per level brackets'),
  ('point_economy', '{"defaultPerHour":3,"premiumMultiplier":2,"dailyBonus":10,"perCharacterOverrides":{}}'::jsonb, 'Point earning economy'),
  ('feature_flags', '{"spice":true,"abilities":true,"stories":true,"syndicates":true,"premium":true,"analytics":true}'::jsonb, 'Module toggles')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.relationship_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_id uuid NOT NULL,
  delta int NOT NULL,
  new_value int NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.relationship_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY rh_owner_read ON public.relationship_history FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner(auth.uid()));
CREATE POLICY rh_owner_insert ON public.relationship_history FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin_or_owner(auth.uid()));
CREATE POLICY rh_admin_write ON public.relationship_history FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_rh_user_char ON public.relationship_history(user_id, character_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_levels (
  user_id uuid PRIMARY KEY,
  level int NOT NULL DEFAULT 1,
  total_hours numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY ul_self_read ON public.user_levels FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner(auth.uid()));
CREATE POLICY ul_admin_write ON public.user_levels FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE TABLE IF NOT EXISTS public.level_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_level int NOT NULL,
  to_level int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.level_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY lh_self_read ON public.level_history FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner(auth.uid()));
CREATE POLICY lh_admin_write ON public.level_history FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE OR REPLACE FUNCTION public.compute_level(_total_hours numeric)
RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg jsonb;
  tier jsonb;
  current_level int := 1;
  hours_left numeric := _total_hours;
  hpl int;
  up_to int;
BEGIN
  SELECT value INTO cfg FROM public.app_config WHERE key = 'level_thresholds';
  IF cfg IS NULL THEN RETURN 1; END IF;
  FOR tier IN SELECT * FROM jsonb_array_elements(cfg->'tiers') LOOP
    up_to := (tier->>'upTo')::int;
    hpl := (tier->>'hoursPerLevel')::int;
    WHILE current_level < up_to AND hours_left >= hpl LOOP
      hours_left := hours_left - hpl;
      current_level := current_level + 1;
    END LOOP;
    IF hours_left < hpl THEN EXIT; END IF;
  END LOOP;
  RETURN current_level;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_read ON public.audit_logs FOR SELECT USING (public.is_admin_or_owner(auth.uid()));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, action, target_table, target_id, before, after)
  VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME,
    COALESCE((CASE WHEN TG_OP='DELETE' THEN OLD.id ELSE NEW.id END)::text, NULL),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE OR REPLACE FUNCTION public.log_audit_config()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, action, target_table, target_id, before, after)
  VALUES (auth.uid(), TG_OP, 'app_config',
    COALESCE(NEW.key, OLD.key),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS audit_characters ON public.characters;
CREATE TRIGGER audit_characters AFTER INSERT OR UPDATE OR DELETE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.log_audit();
DROP TRIGGER IF EXISTS audit_abilities ON public.abilities;
CREATE TRIGGER audit_abilities AFTER INSERT OR UPDATE OR DELETE ON public.abilities FOR EACH ROW EXECUTE FUNCTION public.log_audit();
DROP TRIGGER IF EXISTS audit_realms ON public.story_realms;
CREATE TRIGGER audit_realms AFTER INSERT OR UPDATE OR DELETE ON public.story_realms FOR EACH ROW EXECUTE FUNCTION public.log_audit();
DROP TRIGGER IF EXISTS audit_syndicates ON public.syndicates;
CREATE TRIGGER audit_syndicates AFTER INSERT OR UPDATE OR DELETE ON public.syndicates FOR EACH ROW EXECUTE FUNCTION public.log_audit();
DROP TRIGGER IF EXISTS audit_roles ON public.user_roles;
CREATE TRIGGER audit_roles AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_audit();
DROP TRIGGER IF EXISTS audit_app_config ON public.app_config;
CREATE TRIGGER audit_app_config AFTER INSERT OR UPDATE OR DELETE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.log_audit_config();

CREATE POLICY profiles_admin_all ON public.profiles FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE POLICY chats_admin_read ON public.chats FOR SELECT USING (public.is_admin_or_owner(auth.uid()));
CREATE POLICY messages_admin_read ON public.messages FOR SELECT USING (public.is_admin_or_owner(auth.uid()));
CREATE POLICY subs_admin_write ON public.subscriptions FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE POLICY user_abilities_admin_all ON public.user_abilities FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE POLICY character_state_admin_all ON public.character_state FOR ALL USING (public.is_admin_or_owner(auth.uid())) WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE POLICY points_admin_insert ON public.points_ledger FOR INSERT WITH CHECK (public.is_admin_or_owner(auth.uid()));