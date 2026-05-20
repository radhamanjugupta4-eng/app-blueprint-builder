import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrion } from "@/components/orion/OrionProvider";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { isOwner } = useOrion();

  const { data: users } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let query = supabase.from("profiles")
        .select("id,display_name,email,points,is_premium,banned,created_at")
        .order("created_at", { ascending: false }).limit(200);
      if (q) query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const ban = useMutation({
    mutationFn: async ({ id, banned }: { id: string; banned: boolean }) => {
      const { error } = await supabase.from("profiles").update({ banned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const setPoints = useMutation({
    mutationFn: async ({ id, points }: { id: string; points: number }) => {
      const { error } = await supabase.from("profiles").update({ points }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Points updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const grantAdmin = useMutation({
    mutationFn: async ({ id, grant }: { id: string; grant: boolean }) => {
      if (grant) {
        const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => toast.success("Role updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search users by name or email…"
        className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-2 pr-3">User</th><th className="pr-3">Points</th><th className="pr-3">Premium</th><th className="pr-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border/50">
                <td className="py-2 pr-3">
                  <Link to="/admin/users/$id" params={{ id: u.id }} className="hover:text-gradient">
                    <div className="font-medium">{u.display_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </Link>
                </td>
                <td className="pr-3">
                  <input
                    type="number" defaultValue={u.points}
                    onBlur={(e) => { const n = Number(e.target.value); if (n !== u.points) setPoints.mutate({ id: u.id, points: n }); }}
                    className="w-24 rounded bg-secondary px-2 py-1 text-sm"
                  />
                </td>
                <td className="pr-3">{u.is_premium ? "Yes" : "—"}</td>
                <td className="pr-3">{u.banned ? <span className="text-destructive">Banned</span> : <span className="text-muted-foreground">Active</span>}</td>
                <td className="space-x-2 text-right">
                  <button onClick={() => ban.mutate({ id: u.id, banned: !u.banned })} className="rounded-full glass px-3 py-1 text-xs">{u.banned ? "Unban" : "Ban"}</button>
                  {isOwner && <button onClick={() => grantAdmin.mutate({ id: u.id, grant: true })} className="rounded-full glass px-3 py-1 text-xs">+Admin</button>}
                  {isOwner && <button onClick={() => grantAdmin.mutate({ id: u.id, grant: false })} className="rounded-full glass px-3 py-1 text-xs">-Admin</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
