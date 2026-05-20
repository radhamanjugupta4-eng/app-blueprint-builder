-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.subscription_tier as enum ('free', 'stellar', 'nebula', 'singularity');
create type public.subscription_status as enum ('active', 'canceled', 'expired', 'trialing');
create type public.message_role as enum ('user', 'assistant', 'system');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  points integer not null default 0,
  spice_enabled boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============ CONTENT CATALOG ============
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  image_url text,
  wallpaper_url text,
  category text,
  is_premium boolean not null default false,
  is_nsfw boolean not null default false,
  likes integer not null default 0,
  chats_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.story_realms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  image_url text,
  is_premium boolean not null default false,
  is_nsfw boolean not null default false,
  likes integer not null default 0,
  chats_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.syndicates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  image_url text,
  is_premium boolean not null default false,
  is_nsfw boolean not null default false,
  likes integer not null default 0,
  chats_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.abilities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  cost integer not null default 0,
  cooldown_seconds integer not null default 0,
  one_time_use boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ USER DATA ============
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index on public.chats(user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.messages(chat_id);

create table public.user_abilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ability_id uuid not null references public.abilities(id) on delete cascade,
  equipped boolean not null default false,
  uses_remaining integer,
  last_used_at timestamptz,
  acquired_at timestamptz not null default now(),
  unique (user_id, ability_id)
);

create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index on public.points_ledger(user_id, created_at desc);

create table public.character_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  relationship integer not null default 0,
  trust integer not null default 0,
  affection integer not null default 0,
  fear integer not null default 0,
  deaths integer not null default 0,
  last_interaction timestamptz,
  unlocked_secrets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, character_id)
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid references public.story_realms(id) on delete cascade,
  checkpoint text,
  branch_choices jsonb not null default '[]'::jsonb,
  alive boolean not null default true,
  restart_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, story_id)
);

create table public.deaths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  story_id uuid references public.story_realms(id) on delete set null,
  cause text,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  tier public.subscription_tier not null default 'free',
  status public.subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============ TRIGGERS ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger touch_profiles before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger touch_character_state before update on public.character_state
  for each row execute function public.touch_updated_at();
create trigger touch_user_progress before update on public.user_progress
  for each row execute function public.touch_updated_at();
create trigger touch_subscriptions before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create or replace function public.apply_points_delta()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles set points = points + new.delta where id = new.user_id;
  return new;
end;
$$;
create trigger ledger_apply_delta after insert on public.points_ledger
  for each row execute function public.apply_points_delta();

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.characters enable row level security;
alter table public.story_realms enable row level security;
alter table public.syndicates enable row level security;
alter table public.abilities enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.user_abilities enable row level security;
alter table public.points_ledger enable row level security;
alter table public.character_state enable row level security;
alter table public.user_progress enable row level security;
alter table public.deaths enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

create policy "roles_self_select" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "characters_read" on public.characters for select using (true);
create policy "characters_admin_write" on public.characters for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "realms_read" on public.story_realms for select using (true);
create policy "realms_admin_write" on public.story_realms for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "syndicates_read" on public.syndicates for select using (true);
create policy "syndicates_admin_write" on public.syndicates for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "abilities_read" on public.abilities for select using (true);
create policy "abilities_admin_write" on public.abilities for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "chats_owner_all" on public.chats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages_owner_all" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_abilities_owner_all" on public.user_abilities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "points_ledger_owner_select" on public.points_ledger for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "points_ledger_owner_insert" on public.points_ledger for insert with check (auth.uid() = user_id);
create policy "character_state_owner_all" on public.character_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_progress_owner_all" on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "deaths_owner_select" on public.deaths for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "deaths_owner_insert" on public.deaths for insert with check (auth.uid() = user_id);
create policy "subscriptions_owner_select" on public.subscriptions for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "subscriptions_owner_update" on public.subscriptions for update using (auth.uid() = user_id);

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.apply_points_delta() from public, anon, authenticated;