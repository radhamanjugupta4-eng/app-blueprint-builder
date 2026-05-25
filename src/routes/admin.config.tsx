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

