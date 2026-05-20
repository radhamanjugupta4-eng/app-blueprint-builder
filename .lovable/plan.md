# Plan — Import `orion-s-realm` into this project

Good news: the repo is the **same stack** as this project (TanStack Start + React 19 + Tailwind v4 + Supabase + shadcn). So this is a straight file port — no framework translation needed.

## What's in the repo

- **App**: "Orion" — looks like a characters / realms / syndicates browse app with a chat page, auth, premium tier, and a full admin panel.
- **Backend**: Supabase (4 SQL migrations) + server functions (`ai.functions.ts`, `admin-tools.functions.ts`).
- **Pages** (`src/routes/`): `index`, `auth`, `abilities`, `entities`, `realms`, `syndicates`, `premium`, `profile`, `tangly`, `chat.$id`, plus `admin.*` (characters, users, config, analytics, audit, backup, messages, index).
- **Custom components** (`src/components/orion/`): `OrionProvider`, `Sidebar`, `TopBar`, `CardGrid`, `CharacterCard`.
- **Assets**: 6 images (~560 KB total) in `src/assets/`.
- **Deps to add**: `@supabase/supabase-js`, `@hookform/resolvers`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `recharts`, `sonner`, `vaul`, `tw-animate-css`, plus a few Radix packages not already installed (`alert-dialog`, `aspect-ratio`, `context-menu`, `hover-card`, `menubar`, `navigation-menu`, `progress`, `radio-group`).

## Steps

1. **Enable Lovable Cloud** (required — the app reads/writes Supabase everywhere). This provisions the DB so the migrations can run.
2. **Install missing npm dependencies** in one `bun add` batch.
3. **Copy source tree** from GitHub raw URLs into the project:
   - `src/styles.css` (overwrite — Orion has its own design tokens)
   - `src/integrations/supabase/*` (5 files — wire to Cloud's auto-generated env)
   - `src/lib/*` (orion-data, queries, ai.functions, admin-tools.functions)
   - `src/components/orion/*` (5 files)
   - All `src/routes/*` files (overwrite `index.tsx` and `__root.tsx`, add the rest)
   - Re-download `src/assets/*.jpg` (6 images, binary)
   - `components.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.jsonc` — diff and merge only if Orion's versions differ meaningfully; otherwise keep current.
   - **Skip**: `bun.lock`, `.env`, `routeTree.gen.ts` (auto-generated), `package.json` (already merged via step 2).
4. **Apply the 4 Supabase migrations** via Lovable Cloud migration tool (in order by timestamp).
5. **Verify build** — fix any import-path mismatches the TanStack code-splitter complains about, confirm the preview renders Orion's home page.

## Technical notes

- The repo's `client.ts` / `client.server.ts` will be rewritten to use this project's env-var convention (`VITE_SUPABASE_*` / `SUPABASE_*`) instead of whatever hardcoded values the repo ships with.
- `routeTree.gen.ts` is regenerated automatically by the Vite plugin once route files exist — do not copy it.
- The repo's `.env` is **not** copied (would leak the previous project's Supabase keys); Cloud injects fresh ones.
- After import, `/index.tsx` placeholder is gone and the live preview will show Orion's landing page.

## What I need confirmed before I start

- **OK to enable Lovable Cloud now?** (required for this app to function — DB, auth, AI server functions all depend on it)
- **OK to overwrite** the current `src/routes/index.tsx`, `src/routes/__root.tsx`, and `src/styles.css`? (this project only has placeholder content, so yes is the safe answer — just confirming)
- The repo has **no README / no app description** — once imported, the design and behavior are whatever the repo ships. I won't redesign or "fix" anything beyond making it build.

Reply "go" (or pick changes) and I'll switch to Build mode and execute.
