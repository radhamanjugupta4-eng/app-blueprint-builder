import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { giftPoints, setPremium, setBanned } from "@/lib/admin-tools.functions";
import { toast } from "sonner";
import { Gift, Crown, Ban } from "lucide-react";

export const Route = createFileRoute("/admin/users/$id")({
  component: UserInsights,
});

function UserInsights() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const gift = useServerFn(giftPoints);
  const prem = useServerFn(setPremium);
  const ban = useServerFn(setBanned);
  const [amt, setAmt] = useState(100);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-user", id] });
  const giftM = useMutation({ mutationFn: () => gift({ data: { userId: id, amount: amt, reason: "owner_gift" } }), onSuccess: () => { toast.success("Points gifted"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const premM = useMutation({ mutationFn: (b: boolean) => prem({ data: { userId: id, isPremium: b } }), onSuccess: () => { toast.success("Updated"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const banM = useMutation({ mutationFn: (b: boolean) => ban({ data: { userId: id, banned: b } }), onSuccess: () => { toast.success("Updated"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const { data } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const [profile, lvl, sub, chats, msgs, deaths, abil, fav] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("user_levels").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("chats").select("id,character_id,last_message_at", { count: "exact" }).eq("user_id", id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", id),
        supabase.from("deaths").select("id", { count: "exact", head: true }).eq("user_id", id),
        supabase.from("user_abilities").select("ability_id,abilities(name)").eq("user_id", id),
        supabase.from("chats").select("character_id, characters(name)").eq("user_id", id).limit(50),
      ]);
      const favCount = new Map<string, { name: string; n: number }>();
      (fav.data ?? []).forEach((c) => {
        const cid = c.character_id as string | null;
        if (!cid) return;
        const n = (c.characters as { name: string } | null)?.name ?? cid;
        const cur = favCount.get(cid) ?? { name: n, n: 0 };
        cur.n++; favCount.set(cid, cur);
      });
      return {
        profile: profile.data,
        level: lvl.data,
        sub: sub.data,
        chatCount: chats.count ?? 0,
        msgCount: msgs.count ?? 0,
        deaths: deaths.count ?? 0,
        abilities: abil.data ?? [],
        favorites: [...favCount.values()].sort((a, b) => b.n - a.n).slice(0, 5),
      };
    },
  });

  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const p = data.profile;
  if (!p) return <p>User not found.</p>;

  const F = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="rounded-lg glass px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-xs text-muted-foreground hover:text-foreground">← Back to users</Link>
      <div>
        <h2 className="text-2xl font-bold">{p.display_name ?? "Unnamed"}</h2>
        <p className="text-sm text-muted-foreground">{p.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <F label="Signed up" value={new Date(p.created_at).toLocaleDateString()} />
        <F label="Points" value={p.points} />
        <F label="Level" value={data.level?.level ?? 1} />
        <F label="Hours" value={Number(data.level?.total_hours ?? 0).toFixed(1)} />
        <F label="Chats" value={data.chatCount} />
        <F label="Messages" value={data.msgCount} />
        <F label="Deaths" value={data.deaths} />
        <F label="Subscription" value={data.sub?.tier ?? "free"} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Favorite characters</h3>
        <div className="flex flex-wrap gap-2">
          {data.favorites.map((f) => <span key={f.name} className="rounded-full glass px-3 py-1 text-xs">{f.name} · {f.n}</span>)}
          {data.favorites.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Abilities</h3>
        <div className="flex flex-wrap gap-2">
          {data.abilities.map((a, i) => <span key={i} className="rounded-full glass px-3 py-1 text-xs">{(a.abilities as { name: string } | null)?.name ?? a.ability_id}</span>)}
          {data.abilities.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
        </div>
      </div>
      <div className="rounded-xl glass-strong p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Owner actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} className="input w-28" />
          <button onClick={() => giftM.mutate()} className="flex items-center gap-1.5 rounded-full cosmic-bg px-4 py-2 text-sm font-semibold text-primary-foreground"><Gift className="h-4 w-4" /> Gift points</button>
          <button onClick={() => premM.mutate(!p.is_premium)} className="flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm"><Crown className="h-4 w-4" /> {p.is_premium ? "Remove premium" : "Gift premium"}</button>
          <button onClick={() => banM.mutate(!p.banned)} className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive"><Ban className="h-4 w-4" /> {p.banned ? "Unban" : "Ban"}</button>
        </div>
      </div>
    </div>
  );
}
