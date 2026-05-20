ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS backstory text,
  ADD COLUMN IF NOT EXISTS universe text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS traits text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS speaking_style text,
  ADD COLUMN IF NOT EXISTS tone text,
  ADD COLUMN IF NOT EXISTS friendliness int NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS humor int NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS powers text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weaknesses text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS special_abilities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS system_prompt text,
  ADD COLUMN IF NOT EXISTS memory_rules text,
  ADD COLUMN IF NOT EXISTS greeting_message text,
  ADD COLUMN IF NOT EXISTS starter_scenarios jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS relationship_modifiers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS enable_scraping boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scrape_sources text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS banner_url text;

ALTER TABLE public.abilities
  ADD COLUMN IF NOT EXISTS reaction_prompt text;

INSERT INTO public.abilities (slug, name, description, cost, cooldown_seconds, is_premium, enabled)
VALUES
  ('rasengan','Rasengan','Spiraling chakra orb. High burst damage.',50,30,false,true),
  ('chidori','Chidori','Lightning-cutter piercing strike.',60,30,false,true),
  ('gojo-technique','Gojo Technique','Infinity + Limitless. Reality-warping.',300,120,true,true),
  ('sukuna-technique','Sukuna Technique','Cleave & Dismantle. Ruthless slashes.',280,120,true,true),
  ('kamehameha','Kamehameha','Concentrated ki beam.',80,45,false,true),
  ('ki-blast','Ki Blast','Quick ranged ki projectile.',20,10,false,true),
  ('fire-technique','Fire Technique','Katon-style fire jutsu.',40,20,false,true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.user_abilities
  ADD COLUMN IF NOT EXISTS use_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_uses int NOT NULL DEFAULT 0;

ALTER TABLE public.user_levels
  ADD COLUMN IF NOT EXISTS total_messages int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.relationship_label(_score int)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
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

CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  actor_id uuid,
  type text NOT NULL,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mod_admin_all ON public.moderation_logs;
CREATE POLICY mod_admin_all ON public.moderation_logs
  FOR ALL USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

INSERT INTO public.app_config (key, value, description) VALUES
  ('ai_provider_settings', '{"provider":"groq","model":"llama-3.3-70b-versatile","temperature":0.85,"max_tokens":1024,"memory_size":20}'::jsonb, 'Default LLM provider settings')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.owner_gift_points(_user_id uuid, _amount int, _reason text DEFAULT 'owner_gift')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_or_owner(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.points_ledger (user_id, delta, reason, metadata)
  VALUES (_user_id, _amount, _reason, jsonb_build_object('by', auth.uid()));
END $$;

CREATE OR REPLACE FUNCTION public.owner_set_premium(_user_id uuid, _is_premium boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_or_owner(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.profiles SET is_premium = _is_premium WHERE id = _user_id;
  UPDATE public.subscriptions
     SET tier = CASE WHEN _is_premium THEN 'stellar'::subscription_tier ELSE 'free'::subscription_tier END,
         status = 'active'::subscription_status,
         updated_at = now()
   WHERE user_id = _user_id;
END $$;

-- Lock down all SECURITY DEFINER helpers from direct anon/authenticated execute.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_level(numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_user_roles() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit_config() FROM PUBLIC, anon, authenticated;
-- Owner RPCs MUST stay callable by signed-in users (they self-gate via is_admin_or_owner).
GRANT EXECUTE ON FUNCTION public.owner_gift_points(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owner_set_premium(uuid, boolean) TO authenticated;