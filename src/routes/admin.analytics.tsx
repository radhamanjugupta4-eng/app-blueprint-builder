import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

type Msg = { role: "user" | "ai"; content: string };

const QUESTIONS = [
  "Average active time",
  "Most used characters",
  "Inactive users (30d)",
  "Premium conversion",
  "Engagement trend (7d)",
];

async function answer(q: string): Promise<string> {
  const ql = q.toLowerCase();

  if (ql.includes("average") && ql.includes("active")) {
    const { data } = await supabase.from("user_levels").select("total_hours");
    const arr = (data ?? []).map((r) => Number(r.total_hours ?? 0));
    if (!arr.length) return "No level data yet.";
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return `Average total chat time across ${arr.length} users: **${avg.toFixed(2)} hours**.`;
  }

  if (ql.includes("most used") || ql.includes("favorite") || ql.includes("top character")) {
    const { data } = await supabase.from("chats").select("character_id, characters(name)").limit(2000);
    const counts = new Map<string, { name: string; n: number }>();
    (data ?? []).forEach((c) => {
      const id = c.character_id as string | null; if (!id) return;
      const name = (c.characters as { name: string } | null)?.name ?? id;
      const cur = counts.get(id) ?? { name, n: 0 }; cur.n++; counts.set(id, cur);
    });
    const top = [...counts.values()].sort((a, b) => b.n - a.n).slice(0, 5);
    return top.length ? top.map((t, i) => `${i + 1}. **${t.name}** — ${t.n} chats`).join("\n") : "No chats yet.";
  }

  if (ql.includes("inactive")) {
    const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data: users } = await supabase.from("profiles").select("id,display_name,email");
    const { data: active } = await supabase.from("chats").select("user_id").gte("last_message_at", cutoff);
    const activeSet = new Set((active ?? []).map((c) => c.user_id));
    const inactive = (users ?? []).filter((u) => !activeSet.has(u.id));
    return `**${inactive.length}** users inactive in the last 30 days.`;
  }

  if (ql.includes("premium")) {
    const { count: total } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { count: prem } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true);
    const pct = total ? ((prem ?? 0) / total * 100).toFixed(1) : "0";
    return `Premium conversion: **${prem ?? 0} / ${total ?? 0}** (${pct}%).`;
  }

  if (ql.includes("engagement") || ql.includes("trend")) {
    const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", cutoff);
    return `Messages in last 7 days: **${count ?? 0}**.`;
  }

  return "I can answer questions about active time, top characters, inactive users, premium conversion, and engagement trends. Try one of the quick prompts.";
}

function AnalyticsPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", content: "Ask me about your users." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    const reply = await answer(text);
    setMsgs((m) => [...m, { role: "ai", content: reply }]);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full glass px-3 py-1 text-xs hover:text-foreground">{q}</button>
        ))}
      </div>

      <div className="rounded-xl glass p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${m.role === "user" ? "cosmic-bg text-primary-foreground" : "bg-secondary"}`}>
              {m.role === "ai" && <Sparkles className="mr-1 inline h-3 w-3 text-primary" />}
              {m.content}
            </div>
          </div>
        ))}
        {busy && <p className="text-xs text-muted-foreground">Thinking…</p>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="rounded-full cosmic-bg px-5 text-sm font-semibold text-primary-foreground">Ask</button>
      </form>
    </div>
  );
}
