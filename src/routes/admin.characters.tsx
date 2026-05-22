import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { aiGenerateCharacterDraft, simulateCharacter, testCharacterChat } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, Upload, Trash2, Save, Wand2, Play, Plus, ChevronDown, ChevronRight, MessageCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/characters")({
  component: CharactersAdmin,
});

type Character = {
  id?: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  category?: string | null;
  // lore
  backstory?: string | null;
  universe?: string | null;
  tags?: string[] | null;
  // personality
  personality?: string | null;
  traits?: string[] | null;
  speaking_style?: string | null;
  tone?: string | null;
  aggression: number;
  friendliness: number;
  danger: number;
  humor: number;
  // combat
  powers?: string[] | null;
  weaknesses?: string[] | null;
  special_abilities?: string[] | null;
  can_kill: boolean;
  // ai
  system_prompt?: string | null;
  memory_rules?: string | null;
  greeting_message?: string | null;
  starter_scenarios?: unknown;
  relationship_modifiers?: unknown;
  // scraping
  enable_scraping: boolean;
  scrape_sources?: string[] | null;
  // flags
  is_premium: boolean;
  is_nsfw: boolean;
  enabled: boolean;
  point_reward: number;
};

const BLANK: Character = {
  slug: "", name: "", aggression: 30, friendliness: 50, danger: 30, humor: 50,
  can_kill: false, is_premium: false, is_nsfw: false, enabled: true, point_reward: 3,
  enable_scraping: false, tags: [], traits: [], powers: [], weaknesses: [], special_abilities: [],
  scrape_sources: ["web"], starter_scenarios: [], relationship_modifiers: {},
};

function CharactersAdmin() {
  const qc = useQueryClient();
  const { data: list } = useQuery({
    queryKey: ["chars-full"],
    queryFn: async () => (await supabase.from("characters").select("*").order("sort_order")).data as Character[] ?? [],
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("characters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["chars-full"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Character Manager</h2>
        <span className="text-xs text-muted-foreground">({list?.length ?? 0} characters)</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowBuilder((v) => !v)} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Wand2 className="h-4 w-4" /> AI Builder
          </button>
          <button onClick={() => setExpanded("__new__")} className="flex items-center gap-1.5 rounded-full cosmic-bg px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {showBuilder && <AIBuilder onDraft={(d) => { setShowBuilder(false); setExpanded("__new__"); (window as unknown as { __draft: Character }).__draft = { ...BLANK, ...d }; }} />}

      {expanded === "__new__" && (
        <CharacterEditor
          initial={(window as unknown as { __draft?: Character }).__draft ?? BLANK}
          onClose={() => { setExpanded(null); delete (window as unknown as { __draft?: Character }).__draft; }}
          creating
        />
      )}

      <div className="space-y-2">
        {(list ?? []).map((c) => (
          <div key={c.id} className="rounded-xl glass overflow-hidden">
            <button onClick={() => setExpanded(expanded === c.id ? null : c.id!)} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><Sparkles className="h-5 w-5" /></div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate">{c.name || "(unnamed)"}</p>
                <p className="text-xs text-muted-foreground truncate">{c.tagline || c.slug}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase">
                {c.is_premium && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-primary">Prem</span>}
                {c.is_nsfw && <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-destructive">NSFW</span>}
                {!c.enabled && <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">Off</span>}
              </div>
              {expanded === c.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {expanded === c.id && (
              <div className="border-t border-border p-4">
                <CharacterEditor initial={c} onClose={() => setExpanded(null)} onDelete={() => c.id && del.mutate(c.id)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AIBuilder({ onDraft }: { onDraft: (d: Partial<Character>) => void }) {
  const [name, setName] = useState("");
  const [scrape, setScrape] = useState(true);
  const [sources, setSources] = useState<Set<string>>(new Set(["web", "wiki"]));
  const gen = useServerFn(aiGenerateCharacterDraft);
  const mut = useMutation({
    mutationFn: async () => gen({ data: { name, scrape, sources: Array.from(sources) as ("web"|"reddit"|"wiki"|"youtube")[] } }),
    onSuccess: (res) => {
      if (!res.draft) { toast.error("AI returned invalid JSON"); return; }
      toast.success("Draft ready — review and save");
      onDraft(res.draft as Partial<Character>);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = (s: string) => { const n = new Set(sources); if (n.has(s)) n.delete(s); else n.add(s); setSources(n); };

  return (
    <div className="rounded-xl glass-strong p-4 space-y-3 border border-primary/30">
      <p className="text-sm font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> Generate Character with AI</p>
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sukuna, Gojo, Kratos…"
          className="flex-1 min-w-[200px] rounded-lg bg-secondary px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={scrape} onChange={(e) => setScrape(e.target.checked)} /> Web scrape
        </label>
      </div>
      {scrape && (
        <div className="flex flex-wrap gap-2 text-xs">
          {["web", "reddit", "wiki", "youtube"].map((s) => (
            <button key={s} onClick={() => toggle(s)}
              className={`rounded-full px-3 py-1 transition ${sources.has(s) ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      )}
      <button disabled={!name || mut.isPending} onClick={() => mut.mutate()}
        className="rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {mut.isPending ? "Generating…" : "Generate Draft"}
      </button>
    </div>
  );
}

function CharacterEditor({ initial, onClose, onDelete, creating }: { initial: Character; onClose: () => void; onDelete?: () => void; creating?: boolean }) {
  const qc = useQueryClient();
  const [c, setC] = useState<Character>(initial);
  const [tab, setTab] = useState<"basic"|"lore"|"personality"|"combat"|"ai"|"scrape">("basic");
  const [simResults, setSimResults] = useState<Array<{ prompt: string; reply: string }> | null>(null);
  const [testReply, setTestReply] = useState<string | null>(null);
  const set = <K extends keyof Character>(k: K, v: Character[K]) => setC({ ...c, [k]: v });
  const sim = useServerFn(simulateCharacter);
  const testChat = useServerFn(testCharacterChat);
  const testMut = useMutation({
    mutationFn: async () => {
      if (!c.id) throw new Error("Save the character first");
      return testChat({ data: { characterId: c.id } });
    },
    onSuccess: (r) => { setTestReply(r.reply); toast.success(`${r.name} is alive ✨`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...c, starter_scenarios: c.starter_scenarios ?? [], relationship_modifiers: c.relationship_modifiers ?? {} };
      const { error } = await supabase.from("characters").upsert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["chars-full"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const simMut = useMutation({
    mutationFn: async () => sim({ data: { character: c as unknown as Record<string, unknown> } }),
    onSuccess: (r) => { setSimResults(r.results); toast.success(`Simulated ${r.results.length} chats`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const TABS = ["basic","lore","personality","combat","ai","scrape"] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs uppercase transition ${tab === t ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Slug"><input value={c.slug} onChange={(e) => set("slug", e.target.value)} className="input" /></Field>
          <Field label="Name"><input value={c.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
          <Field label="Tagline" full><input value={c.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className="input" /></Field>
          <Field label="Description" full><textarea rows={3} value={c.description ?? ""} onChange={(e) => set("description", e.target.value)} className="input" /></Field>
          <Field label="Avatar"><ImageField url={c.image_url ?? ""} onChange={(u) => set("image_url", u)} /></Field>
          <Field label="Banner"><ImageField url={c.banner_url ?? ""} onChange={(u) => set("banner_url", u)} /></Field>
          <Field label="Reward / hr"><input type="number" value={c.point_reward} onChange={(e) => set("point_reward", Number(e.target.value))} className="input" /></Field>
          <Field label="Flags">
            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <Toggle label="Enabled" v={c.enabled} on={(b) => set("enabled", b)} />
              <Toggle label="Premium" v={c.is_premium} on={(b) => set("is_premium", b)} />
              <Toggle label="NSFW" v={c.is_nsfw} on={(b) => set("is_nsfw", b)} />
              <Toggle label="Can Kill" v={c.can_kill} on={(b) => set("can_kill", b)} />
            </div>
          </Field>
        </div>
      )}

      {tab === "lore" && (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Backstory"><textarea rows={5} value={c.backstory ?? ""} onChange={(e) => set("backstory", e.target.value)} className="input" /></Field>
          <Field label="Universe / Source"><input value={c.universe ?? ""} onChange={(e) => set("universe", e.target.value)} className="input" /></Field>
          <Field label="Tags"><TagInput value={c.tags ?? []} onChange={(v) => set("tags", v)} /></Field>
        </div>
      )}

      {tab === "personality" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Personality" full><textarea rows={3} value={c.personality ?? ""} onChange={(e) => set("personality", e.target.value)} className="input" /></Field>
          <Field label="Traits" full><TagInput value={c.traits ?? []} onChange={(v) => set("traits", v)} /></Field>
          <Field label="Speaking style"><input value={c.speaking_style ?? ""} onChange={(e) => set("speaking_style", e.target.value)} className="input" /></Field>
          <Field label="Tone"><input value={c.tone ?? ""} onChange={(e) => set("tone", e.target.value)} className="input" /></Field>
          <Slider label="Aggression" v={c.aggression} on={(n) => set("aggression", n)} />
          <Slider label="Friendliness" v={c.friendliness} on={(n) => set("friendliness", n)} />
          <Slider label="Danger" v={c.danger} on={(n) => set("danger", n)} />
          <Slider label="Humor" v={c.humor} on={(n) => set("humor", n)} />
        </div>
      )}

      {tab === "combat" && (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Powers"><TagInput value={c.powers ?? []} onChange={(v) => set("powers", v)} /></Field>
          <Field label="Weaknesses"><TagInput value={c.weaknesses ?? []} onChange={(v) => set("weaknesses", v)} /></Field>
          <Field label="Special Abilities"><TagInput value={c.special_abilities ?? []} onChange={(v) => set("special_abilities", v)} /></Field>
        </div>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Hidden System Prompt"><textarea rows={4} value={c.system_prompt ?? ""} onChange={(e) => set("system_prompt", e.target.value)} className="input font-mono text-xs" placeholder="Secret instructions only the AI sees…" /></Field>
          <Field label="Memory Rules"><textarea rows={3} value={c.memory_rules ?? ""} onChange={(e) => set("memory_rules", e.target.value)} className="input font-mono text-xs" placeholder="What the character remembers / forgets" /></Field>
          <Field label="Greeting Message"><textarea rows={2} value={c.greeting_message ?? ""} onChange={(e) => set("greeting_message", e.target.value)} className="input" placeholder="First line shown to the user" /></Field>
          <Field label="Starter Scenarios (one per line)">
            <textarea
              rows={3}
              value={Array.isArray(c.starter_scenarios) ? (c.starter_scenarios as string[]).join("\n") : ""}
              onChange={(e) => set("starter_scenarios", e.target.value.split("\n").filter(Boolean))}
              className="input" />
          </Field>
          <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button disabled={simMut.isPending} onClick={() => simMut.mutate()}
                className="flex items-center gap-2 rounded-full cosmic-bg px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95">
                <Play className="h-4 w-4" /> {simMut.isPending ? "Simulating 20 chats…" : "Simulate (20 prompts)"}
              </button>
              <button disabled={testMut.isPending || !c.id} onClick={() => testMut.mutate()}
                className="flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95">
                {testMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                {testMut.isPending ? "Testing…" : "Test Character Chat"}
              </button>
              {!c.id && <span className="text-[11px] text-muted-foreground self-center">Save first to enable Test Chat</span>}
            </div>
            {testReply && (
              <div className="rounded-lg glass p-3 text-sm text-foreground animate-in fade-in slide-in-from-top-1">
                <p className="text-[10px] uppercase text-emerald-400 mb-1">Live reply from {c.name}</p>
                {testReply}
              </div>
            )}
            {simResults && (
              <div className="mt-3 max-h-96 overflow-auto space-y-2">
                {simResults.map((r, i) => (
                  <div key={i} className="rounded-lg glass p-2 text-xs">
                    <p className="text-muted-foreground">→ {r.prompt}</p>
                    <p className="mt-1 text-foreground">{r.reply}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "scrape" && (
        <div className="space-y-3">
          <Toggle label="Enable Web Scraping (feeds character memory in future)" v={c.enable_scraping} on={(b) => set("enable_scraping", b)} />
          {c.enable_scraping && (
            <div className="flex flex-wrap gap-2 text-xs">
              {["web","reddit","wiki","youtube","custom"].map((s) => {
                const on = (c.scrape_sources ?? []).includes(s);
                return (
                  <button key={s} onClick={() => {
                    const cur = new Set(c.scrape_sources ?? []);
                    if (on) cur.delete(s); else cur.add(s);
                    set("scrape_sources", Array.from(cur));
                  }} className={`rounded-full px-3 py-1 transition ${on ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground">When enabled, scraped data will feed this character's long-term memory once the live pipeline is wired.</p>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-border">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        {onDelete && (
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive hover:bg-destructive/30">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
        <button onClick={() => save.mutate()} disabled={save.isPending} className="flex items-center gap-1.5 rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Save className="h-4 w-4" /> {creating ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Slider({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span><span className="text-foreground">{v}</span>
      </div>
      <input type="range" min={0} max={100} value={v} onChange={(e) => on(Number(e.target.value))} className="w-full mt-1" />
    </div>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="rounded-lg bg-secondary p-2 flex flex-wrap gap-1.5">
      {value.map((t, i) => (
        <span key={i} className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
          {t}
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">×</button>
        </span>
      ))}
      <input
        value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { e.preventDefault(); onChange([...value, text.trim()]); setText(""); } }}
        placeholder="add tag + Enter" className="flex-1 min-w-[120px] bg-transparent text-xs outline-none px-1" />
    </div>
  );
}

function ImageField({ url, onChange }: { url: string; onChange: (u: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      {url ? <img src={url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center"><Upload className="h-4 w-4 text-muted-foreground" /></div>}
      <input value={url} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className="input flex-1" />
    </div>
  );
}
