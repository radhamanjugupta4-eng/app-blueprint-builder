import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl glass p-5">
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Users" value={data?.users ?? "—"} />
        <Stat label="Characters" value={data?.chars ?? "—"} />
        <Stat label="Messages" value={data?.msgs ?? "—"} />
        <Stat label="Abilities" value={data?.abil ?? "—"} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h2>
        <div className="space-y-2">
          {(data?.audit ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg glass px-4 py-2 text-sm">
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
