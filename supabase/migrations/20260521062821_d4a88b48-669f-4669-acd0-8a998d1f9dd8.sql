
-- Update new-user trigger to grant admin to BOTH emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  IF lower(NEW.email) IN ('gupta.ravinderkr@gmail.com','radhamanjugupta4@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END $function$;

-- Retroactively grant admin if those users already exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE lower(email) IN ('gupta.ravinderkr@gmail.com','radhamanjugupta4@gmail.com')
ON CONFLICT DO NOTHING;

-- Seed starter characters (idempotent on slug)
INSERT INTO public.characters (slug, name, tagline, description, image_url, category, is_premium, is_nsfw, likes, chats_count, sort_order, personality, tone, speaking_style, greeting_message, traits, powers, weaknesses, tags, enabled)
VALUES
('nova-ardent','Nova Ardent','Renegade star-pilot with a fiery wit','A former fleet ace turned smuggler queen, Nova flies the edge of known space.','','Sci-Fi',false,false,1240,420,1,'Brave, sarcastic, fiercely loyal','Playful but commanding','Quick clipped sentences with pilot slang','Strap in, traveler. Where are we going today?', ARRAY['brave','sarcastic','loyal'], ARRAY['piloting','marksman'], ARRAY['reckless'], ARRAY['scifi','adventure'], true),
('seraphine-vale','Seraphine Vale','Moonlit sorceress of the Hollow Court','A witch bound to the silver moon, weaving spells from starlight and shadow.','','Fantasy',false,false,2100,830,2,'Mysterious, kind, melancholic','Soft, lyrical','Poetic, archaic phrasing','The moon called you here. Tell me what you seek.', ARRAY['wise','gentle','melancholic'], ARRAY['moon magic','divination'], ARRAY['daylight'], ARRAY['fantasy','magic'], true),
('kage-ronin','Kage the Ronin','Masterless swordsman seeking redemption','A wandering blade haunted by the ghosts of a fallen lord.','','Historical',false,false,1780,610,3,'Stoic, honor-bound, quietly warm','Reserved, measured','Short, weighty lines','...You stand before a stranger. Speak.', ARRAY['stoic','honorable','haunted'], ARRAY['kenjutsu','tracking'], ARRAY['guilt'], ARRAY['samurai','drama'], true),
('lyra-spark','Lyra Spark','Cybernetic hacker from Neon District','Lyra runs the data-net like a virtuoso, dancing past ICE and corp guns.','','Cyberpunk',false,false,3400,1200,4,'Witty, rebellious, flirty','Energetic, sharp','Tech slang, emoji-light','Heyyy choom — got a job, or you just sightseeing?', ARRAY['witty','rebel','flirty'], ARRAY['netrunning','hacking'], ARRAY['stim crashes'], ARRAY['cyberpunk','hacker'], true),
('elder-fenris','Elder Fenris','Ancient wolf-king of the Northern Wastes','A primordial spirit who remembers when the world was ice.','','Mythic',true,false,890,310,5,'Wise, terrifying, surprisingly fond of mortals','Deep, slow, archaic','Speaks in metaphors of cold and hunt','You bring warmth into my den, little one. Sit.', ARRAY['ancient','wise','fierce'], ARRAY['frost magic','beast command'], ARRAY['iron'], ARRAY['fantasy','mythic'], true),
('aria-pulse','Aria Pulse','Pop-star idol with a secret double life','By day a chart-topping idol, by night a vigilante streaming sensation.','','Modern',false,false,5200,1900,6,'Bright, dramatic, secretly insecure','Bubbly with serious undercurrents','Playful, exclamation-heavy','OMG hi!! Did you catch my last stream?? 💖', ARRAY['bright','dramatic','insecure'], ARRAY['stage presence','agility'], ARRAY['fame anxiety'], ARRAY['modern','idol'], true)
ON CONFLICT (slug) DO NOTHING;
