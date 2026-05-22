import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { testAIConnection, adminAssistantChat } from "@/lib/ai.functions";
import { Activity, CheckCircle2, XCircle, Loader2, Bot, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl glass p-5 transition-all hover:scale-[1.02]">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gradient">{value}</p>
    </div>
  );
}

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [users, chars, msgs, abil, audit] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("characters").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("abilities").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      return {
        users: users.count ?? 0,
        chars: chars.count ?? 0,
        msgs: msgs.count ?? 0,
        abil: abil.count ?? 0,
        audit: audit.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <AIStatusCard />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Users" value={data?.users ?? "—"} />
        <Stat label="Characters" value={data?.chars ?? "—"} />
        <Stat label="Messages" value={data?.msgs ?? "—"} />
        <Stat label="Abilities" value={data?.abil ?? "—"} />
      </div>

      <AdminAssistantPanel />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h2>
        <div className="space-y-2">
          {(data?.audit ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg glass px-4 py-2 text-sm animate-in fade-in">
              <span className="font-mono text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              <span>{a.action} on <span className="text-foreground">{a.target_table}</span></span>
            </div>
          ))}
          {data && data.audit.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}

function AIStatusCard() {
  const test = useServerFn(testAIConnection);
  const [auto, setAuto] = useState<null | Awaited<ReturnType<typeof test>>>(null);
  const mut = useMutation({
    mutationFn: () => test(),
    onSuccess: (r) => {
      setAuto(r);
      if (r.ok) toast.success(`Groq connected — ${r.model}`);
      else toast.error(r.error || "AI connection failed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // auto-run once on mount
  useEffect(() => { mut.mutate(); /* eslint-disable-next-line */ }, []);

  const ok = auto?.ok;
  const status = mut.isPending ? "Testing…" : ok ? "Connected" : auto ? "Disconnected" : "Unknown";
  const color = mut.isPending
    ? "text-muted-foreground"
    : ok
    ? "text-emerald-400"
    : auto
    ? "text-destructive"
    : "text-muted-foreground";

  return (
    <div className="rounded-xl glass-strong p-5 border border-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${ok ? "bg-emerald-500/15" : "bg-secondary"}`}>
          {mut.isPending ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-destructive" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Provider · Groq</p>
          <p className={`text-lg font-bold ${color}`}>{status}</p>
          {auto?.ok && <p className="text-[11px] text-muted-foreground">Model: <span className="font-mono">{auto.model}</span> · Serper: {auto.serper ? "✓" : "✗"} · Sample: "{auto.sample}"</p>}
          {auto && !auto.ok && <p className="text-[11px] text-destructive">{auto.error}</p>}
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="flex items-center gap-1.5 rounded-full cosmic-bg px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Activity className="h-3.5 w-3.5" /> Test AI Connection
        </button>
      </div>
    </div>
  );
}

type AsstMsg = { role: "user" | "assistant"; content: string };

function AdminAssistantPanel() {
  const chat = useServerFn(adminAssistantChat);
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<AsstMsg[]>([
    { role: "assistant", content: "Hi admin 👋 — ask me anything about your app: users, characters, growth, settings, or moderation." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const mut = useMutation({
    mutationFn: (text: string) =>
      chat({
        data: {
          message: text,
          history: msgs.slice(-20).map((m) => ({ role: m.role, content: m.content })),
        },
      }),
    onSuccess: (r) => setMsgs((m) => [...m, { role: "assistant", content: r.reply }]),
    onError: (e: Error) => {
      toast.error(e.message);
      setMsgs((m) => [...m, { role: "assistant", content: `⚠ ${e.message}` }]);
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, mut.isPending]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: t }]);
    mut.mutate(t);
  };

  return (
    <div className="rounded-xl glass-strong border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full cosmic-bg">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold flex items-center gap-2">
            Admin Assistant <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
          </p>
          <p className="text-[11px] text-muted-foreground">Private Groq-powered ops co-pilot</p>
        </div>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="border-t border-border animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="max-h-[380px] overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] whitespace-pre-wrap leading-relaxed ${
                    m.role === "user" ? "cosmic-bg text-primary-foreground rounded-tr-sm" : "glass text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {mut.isPending && (
              <div className="flex">
                <div className="rounded-2xl glass px-4 py-2.5 inline-flex gap-1 items-center">
                  <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about users, characters, analytics…"
              disabled={mut.isPending}
              className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={mut.isPending || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full cosmic-bg text-primary-foreground transition-all hover:scale-105 active:scale-90 disabled:opacity-40"
            >
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
