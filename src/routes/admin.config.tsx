import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/config")({
  component: ConfigPage,
});

const TABS = ["AI", "Relationship", "Levels", "Points", "Flags"] as const;
type Tab = typeof TABS[number];

function ConfigPage() {
  const [tab, setTab] = useState<Tab>("AI");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm transition-all active:scale-95 ${tab === t ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "AI" && <AIControls />}
      {tab === "Relationship" && <KVEditor configKey="relationship_states" label="Relationship state values (-100 to +100)" />}
      {tab === "Levels" && <JSONEditor configKey="level_thresholds" label="Level thresholds" />}
      {tab === "Points" && <JSONEditor configKey="point_economy" label="Point economy" />}
      {tab === "Flags" && <FlagEditor />}
      {tab === "Characters" && <CharactersEditor />}
      {tab === "Abilities" && <AbilitiesEditor />}
      {tab === "Stories" && <StoriesEditor />}
    </div>
  );
}

type AISettings = {
  provider?: string; model?: string;
  temperature?: number; max_tokens?: number; memory_size?: number;
  memory_enabled?: boolean;
  reply_length?: "short" | "medium" | "long";
  safety?: "off" | "standard" | "strict";
};

function AIControls() {
  const { data } = useConfig("ai_provider_settings");
  const save = useSaveConfig("ai_provider_settings");
  const [draft, setDraft] = useState<AISettings | null>(null);
  const v: AISettings = draft ?? ((data as AISettings) ?? {});
  const set = <K extends keyof AISettings>(k: K, val: AISettings[K]) => setDraft({ ...v, [k]: val });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <p className="text-sm text-muted-foreground">Global AI behavior — applies to every character chat.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg glass p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reply length</p>
          <div className="flex gap-2">
            {(["short","medium","long"] as const).map((opt) => (
              <button key={opt} onClick={() => set("reply_length", opt)}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs capitalize transition-all active:scale-95 ${(v.reply_length ?? "medium") === opt ? "cosmic-bg text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg glass p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Safety level</p>
          <div className="flex gap-2">
            {(["off","standard","strict"] as const).map((opt) => (
              <button key={opt} onClick={() => set("safety", opt)}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs capitalize transition-all active:scale-95 ${(v.safety ?? "standard") === opt ? "cosmic-bg text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg glass p-4 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Creativity (temperature)</span><span className="text-foreground">{(v.temperature ?? 0.85).toFixed(2)}</span>
          </div>
          <input type="range" min={0} max={2} step={0.05} value={v.temperature ?? 0.85}
            onChange={(e) => set("temperature", Number(e.target.value))} className="w-full" />
        </div>
        <div className="rounded-lg glass p-4 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Memory size (turns)</span><span className="text-foreground">{v.memory_size ?? 30}</span>
          </div>
          <input type="range" min={2} max={60} step={2} value={v.memory_size ?? 30}
            onChange={(e) => set("memory_size", Number(e.target.value))} className="w-full" />
        </div>
        <div className="rounded-lg glass p-4 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Max tokens cap</span><span className="text-foreground">{v.max_tokens ?? 1024}</span>
          </div>
          <input type="range" min={128} max={2048} step={64} value={v.max_tokens ?? 1024}
            onChange={(e) => set("max_tokens", Number(e.target.value))} className="w-full" />
        </div>
        <label className="rounded-lg glass p-4 flex items-center justify-between cursor-pointer">
          <span className="text-sm">Memory enabled</span>
          <input type="checkbox" checked={v.memory_enabled !== false}
            onChange={(e) => set("memory_enabled", e.target.checked)} />
        </label>
        <div className="rounded-lg glass p-4 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Model & Provider</p>
          <p className="text-sm font-mono text-foreground">{v.provider ?? "groq"} · {v.model ?? "llama-3.3-70b-versatile"}</p>
        </div>
      </div>
      <button onClick={() => save.mutate(v)} disabled={save.isPending}
        className="rounded-full cosmic-bg px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
        {save.isPending ? "Saving…" : "Save AI settings"}
      </button>
    </div>
  );
}

// ------- shared config helpers -------

function useConfig(key: string) {
  return useQuery({
    queryKey: ["app_config", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_config").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      return data?.value as Record<string, unknown> | null;
    },
  });
}

function useSaveConfig(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: unknown) => {
      const { error } = await supabase.from("app_config").upsert({ key, value: value as never, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["app_config", key] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function KVEditor({ configKey, label }: { configKey: string; label: string }) {
  const { data } = useConfig(configKey);
  const save = useSaveConfig(configKey);
  const [draft, setDraft] = useState<Record<string, number> | null>(null);
  const value = draft ?? (data as Record<string, number> | null);

  if (!value) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="rounded-lg glass p-3">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</label>
            <input type="number" value={v}
              onChange={(e) => setDraft({ ...value, [k]: Number(e.target.value) })}
              className="mt-1 w-full rounded bg-secondary px-2 py-1 text-sm" />
          </div>
        ))}
      </div>
      <button onClick={() => save.mutate(value)} className="rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground">Save</button>
    </div>
  );
}

function JSONEditor({ configKey, label }: { configKey: string; label: string }) {
  const { data } = useConfig(configKey);
  const save = useSaveConfig(configKey);
  const [text, setText] = useState<string | null>(null);
  const current = text ?? (data ? JSON.stringify(data, null, 2) : "");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <textarea value={current} onChange={(e) => setText(e.target.value)}
        rows={14} className="w-full rounded-lg bg-secondary p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary" />
      <button
        onClick={() => { try { save.mutate(JSON.parse(current)); } catch { toast.error("Invalid JSON"); } }}
        className="rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground">Save</button>
    </div>
  );
}

function FlagEditor() {
  const { data } = useConfig("feature_flags");
  const save = useSaveConfig("feature_flags");
  const [draft, setDraft] = useState<Record<string, boolean> | null>(null);
  const value = draft ?? (data as Record<string, boolean> | null);
  if (!value) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Enable / disable modules globally.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(value).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between rounded-lg glass px-4 py-2 text-sm">
            <span className="capitalize">{k}</span>
            <input type="checkbox" checked={v} onChange={(e) => setDraft({ ...value, [k]: e.target.checked })} />
          </label>
        ))}
      </div>
      <button onClick={() => save.mutate(value)} className="rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground">Save</button>
    </div>
  );
}

// ------- catalog CRUD -------

type Char = { id?: string; slug: string; name: string; tagline?: string | null; description?: string | null; personality?: string | null; image_url?: string | null; aggression: number; danger: number; point_reward: number; can_kill: boolean; is_premium: boolean; is_nsfw: boolean; enabled: boolean };

function CharactersEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-chars"],
    queryFn: async () => {
      const { data } = await supabase.from("characters").select("*").order("sort_order");
      return (data ?? []) as Char[];
    },
  });
  const save = useMutation({
    mutationFn: async (c: Char) => {
      const { error } = await supabase.from("characters").upsert(c);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-chars"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("characters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-chars"] }); },
  });

  const newRow: Char = { slug: "", name: "", aggression: 0, danger: 0, point_reward: 3, can_kill: false, is_premium: false, is_nsfw: false, enabled: true };

  return (
    <div className="space-y-3">
      <CharRow row={newRow} onSave={(r) => save.mutate(r)} creating />
      {(data ?? []).map((c) => (
        <CharRow key={c.id} row={c} onSave={(r) => save.mutate(r)} onDelete={() => c.id && del.mutate(c.id)} />
      ))}
    </div>
  );
}

function CharRow({ row, onSave, onDelete, creating }: { row: Char; onSave: (r: Char) => void; onDelete?: () => void; creating?: boolean }) {
  const [r, setR] = useState(row);
  const set = <K extends keyof Char>(k: K, v: Char[K]) => setR({ ...r, [k]: v });
  return (
    <div className="rounded-lg glass p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input placeholder="slug" value={r.slug} onChange={(e) => set("slug", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="name" value={r.name} onChange={(e) => set("name", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="image_url" value={r.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="tagline" value={r.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
      </div>
      <textarea placeholder="description" value={r.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded bg-secondary px-2 py-1 text-sm" />
      <textarea placeholder="personality" value={r.personality ?? ""} onChange={(e) => set("personality", e.target.value)} rows={2} className="w-full rounded bg-secondary px-2 py-1 text-sm" />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label>Aggression <input type="number" value={r.aggression} onChange={(e) => set("aggression", Number(e.target.value))} className="w-16 rounded bg-secondary px-2 py-0.5" /></label>
        <label>Danger <input type="number" value={r.danger} onChange={(e) => set("danger", Number(e.target.value))} className="w-16 rounded bg-secondary px-2 py-0.5" /></label>
        <label>Reward/hr <input type="number" value={r.point_reward} onChange={(e) => set("point_reward", Number(e.target.value))} className="w-16 rounded bg-secondary px-2 py-0.5" /></label>
        <label><input type="checkbox" checked={r.can_kill} onChange={(e) => set("can_kill", e.target.checked)} /> can kill</label>
        <label><input type="checkbox" checked={r.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> premium</label>
        <label><input type="checkbox" checked={r.is_nsfw} onChange={(e) => set("is_nsfw", e.target.checked)} /> NSFW</label>
        <label><input type="checkbox" checked={r.enabled} onChange={(e) => set("enabled", e.target.checked)} /> enabled</label>
        <div className="ml-auto flex gap-2">
          <button onClick={() => onSave(r)} className="rounded-full cosmic-bg px-3 py-1 text-xs font-semibold text-primary-foreground">{creating ? "Create" : "Save"}</button>
          {onDelete && <button onClick={onDelete} className="rounded-full bg-destructive/20 px-3 py-1 text-xs text-destructive">Delete</button>}
        </div>
      </div>
    </div>
  );
}

type Ab = { id?: string; slug: string; name: string; description?: string | null; icon?: string | null; cost: number; cooldown_seconds: number; one_time_use: boolean; is_premium: boolean; enabled: boolean };

function AbilitiesEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-abils"],
    queryFn: async () => (await supabase.from("abilities").select("*").order("cost")).data as Ab[] ?? [],
  });
  const save = useMutation({
    mutationFn: async (a: Ab) => { const { error } = await supabase.from("abilities").upsert(a); if (error) throw error; },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-abils"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("abilities").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-abils"] }); },
  });
  const blank: Ab = { slug: "", name: "", cost: 0, cooldown_seconds: 0, one_time_use: false, is_premium: false, enabled: true };
  return (
    <div className="space-y-3">
      <AbRow row={blank} onSave={(r) => save.mutate(r)} creating />
      {(data ?? []).map((a) => <AbRow key={a.id} row={a} onSave={(r) => save.mutate(r)} onDelete={() => a.id && del.mutate(a.id)} />)}
    </div>
  );
}

function AbRow({ row, onSave, onDelete, creating }: { row: Ab; onSave: (r: Ab) => void; onDelete?: () => void; creating?: boolean }) {
  const [r, setR] = useState(row);
  const set = <K extends keyof Ab>(k: K, v: Ab[K]) => setR({ ...r, [k]: v });
  return (
    <div className="rounded-lg glass p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input placeholder="slug" value={r.slug} onChange={(e) => set("slug", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="name" value={r.name} onChange={(e) => set("name", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="icon" value={r.icon ?? ""} onChange={(e) => set("icon", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input type="number" placeholder="cost" value={r.cost} onChange={(e) => set("cost", Number(e.target.value))} className="rounded bg-secondary px-2 py-1 text-sm" />
      </div>
      <textarea placeholder="description" value={r.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded bg-secondary px-2 py-1 text-sm" />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label>Cooldown(s) <input type="number" value={r.cooldown_seconds} onChange={(e) => set("cooldown_seconds", Number(e.target.value))} className="w-20 rounded bg-secondary px-2 py-0.5" /></label>
        <label><input type="checkbox" checked={r.one_time_use} onChange={(e) => set("one_time_use", e.target.checked)} /> one-time</label>
        <label><input type="checkbox" checked={r.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> premium</label>
        <label><input type="checkbox" checked={r.enabled} onChange={(e) => set("enabled", e.target.checked)} /> enabled</label>
        <div className="ml-auto flex gap-2">
          <button onClick={() => onSave(r)} className="rounded-full cosmic-bg px-3 py-1 text-xs font-semibold text-primary-foreground">{creating ? "Create" : "Save"}</button>
          {onDelete && <button onClick={onDelete} className="rounded-full bg-destructive/20 px-3 py-1 text-xs text-destructive">Delete</button>}
        </div>
      </div>
    </div>
  );
}

type Story = { id?: string; slug: string; title: string; description?: string | null; image_url?: string | null; is_premium: boolean; is_nsfw: boolean; enabled: boolean; checkpoints: unknown; branches: unknown };

function StoriesEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: async () => (await supabase.from("story_realms").select("*").order("sort_order")).data as Story[] ?? [],
  });
  const save = useMutation({
    mutationFn: async (s: Story) => { const { error } = await supabase.from("story_realms").upsert(s as never); if (error) throw error; },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-stories"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("story_realms").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-stories"] }); },
  });
  const blank: Story = { slug: "", title: "", is_premium: false, is_nsfw: false, enabled: true, checkpoints: [], branches: [] };
  return (
    <div className="space-y-3">
      <StoryRow row={blank} onSave={(r) => save.mutate(r)} creating />
      {(data ?? []).map((s) => <StoryRow key={s.id} row={s} onSave={(r) => save.mutate(r)} onDelete={() => s.id && del.mutate(s.id)} />)}
    </div>
  );
}

function StoryRow({ row, onSave, onDelete, creating }: { row: Story; onSave: (r: Story) => void; onDelete?: () => void; creating?: boolean }) {
  const [r, setR] = useState(row);
  const [cp, setCp] = useState(JSON.stringify(row.checkpoints ?? [], null, 2));
  const [br, setBr] = useState(JSON.stringify(row.branches ?? [], null, 2));
  const set = <K extends keyof Story>(k: K, v: Story[K]) => setR({ ...r, [k]: v });
  return (
    <div className="rounded-lg glass p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input placeholder="slug" value={r.slug} onChange={(e) => set("slug", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="title" value={r.title} onChange={(e) => set("title", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
        <input placeholder="image_url" value={r.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} className="rounded bg-secondary px-2 py-1 text-sm" />
      </div>
      <textarea placeholder="description" value={r.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded bg-secondary px-2 py-1 text-sm" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Checkpoints (JSON)</p>
          <textarea value={cp} onChange={(e) => setCp(e.target.value)} rows={4} className="w-full rounded bg-secondary p-2 font-mono text-xs" />
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Branches (JSON)</p>
          <textarea value={br} onChange={(e) => setBr(e.target.value)} rows={4} className="w-full rounded bg-secondary p-2 font-mono text-xs" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label><input type="checkbox" checked={r.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> premium</label>
        <label><input type="checkbox" checked={r.is_nsfw} onChange={(e) => set("is_nsfw", e.target.checked)} /> NSFW</label>
        <label><input type="checkbox" checked={r.enabled} onChange={(e) => set("enabled", e.target.checked)} /> enabled</label>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { try { onSave({ ...r, checkpoints: JSON.parse(cp), branches: JSON.parse(br) }); } catch { toast.error("Invalid JSON"); } }}
            className="rounded-full cosmic-bg px-3 py-1 text-xs font-semibold text-primary-foreground">{creating ? "Create" : "Save"}</button>
          {onDelete && <button onClick={onDelete} className="rounded-full bg-destructive/20 px-3 py-1 text-xs text-destructive">Delete</button>}
        </div>
      </div>
    </div>
  );
}
