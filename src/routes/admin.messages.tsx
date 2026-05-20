import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-msgs", q],
    queryFn: async () => {
      let query = supabase.from("messages")
        .select("id,content,role,created_at,user_id,chat_id,chats(character_id,characters(name))")
        .order("created_at", { ascending: false }).limit(200);
      if (q) query = query.ilike("content", `%${q}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search message content…"
        className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="space-y-2">
        {(data ?? []).map((m) => {
          const c = (m.chats as { characters: { name: string } | null } | null)?.characters;
          return (
            <div key={m.id} className="rounded-lg glass p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{m.user_id.slice(0, 8)} → {c?.name ?? "?"}</span>
                <span>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm"><span className="text-muted-foreground">[{m.role}]</span> {m.content}</p>
            </div>
          );
        })}
        {data && data.length === 0 && <p className="text-sm text-muted-foreground">No messages.</p>}
      </div>
    </div>
  );
}
