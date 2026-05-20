import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const [open, setOpen] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [],
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((a) => (
        <div key={a.id} className="rounded-lg glass">
          <button onClick={() => setOpen(open === a.id ? null : a.id)} className="flex w-full items-center justify-between px-4 py-2 text-left text-sm">
            <span><span className="font-mono text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span> · {a.action} <span className="text-primary">{a.target_table}</span></span>
            <span className="text-xs text-muted-foreground">{a.target_id?.slice(0, 8)}</span>
          </button>
          {open === a.id && (
            <div className="grid grid-cols-1 gap-3 border-t border-border/50 p-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Before</p>
                <pre className="mt-1 max-h-60 overflow-auto rounded bg-secondary p-2 text-[10px]">{JSON.stringify(a.before, null, 2)}</pre>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">After</p>
                <pre className="mt-1 max-h-60 overflow-auto rounded bg-secondary p-2 text-[10px]">{JSON.stringify(a.after, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      ))}
      {data && data.length === 0 && <p className="text-muted-foreground">No audit entries.</p>}
    </div>
  );
}
