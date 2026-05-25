
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS avg_words_target integer NOT NULL DEFAULT 80,
  ADD COLUMN IF NOT EXISTS response_delay_ms integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS banned_words text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS blocked_topics text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS chat_filter text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS forbidden_behavior text,
  ADD COLUMN IF NOT EXISTS example_dialogues text,
  ADD COLUMN IF NOT EXISTS voice_tone text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trending boolean NOT NULL DEFAULT false;
