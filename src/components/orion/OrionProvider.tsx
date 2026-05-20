import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type OrionState = {
  // auth
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
  signOut: () => Promise<void>;

  // ui
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // user state
  spice: boolean;
  setSpice: (v: boolean) => void;
  points: number;
  isPremium: boolean;
  ownedAbilities: string[]; // ability ids
  buyAbility: (abilityId: string, cost: number) => Promise<boolean>;
  refresh: () => Promise<void>;

  // roles
  isAdmin: boolean;
  isOwner: boolean;
  level: number;
  totalHours: number;
};

const Ctx = createContext<OrionState | null>(null);

const GUEST_KEY = "orion.guest";

export function OrionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuestState] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // user state mirrors
  const [spice, setSpiceState] = useState(false);
  const [points, setPoints] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [ownedAbilities, setOwned] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalHours, setTotalHours] = useState(0);

  const user = session?.user ?? null;

  // bootstrap auth + guest flag
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) setIsGuestState(false);
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    if (typeof window !== "undefined") {
      setIsGuestState(localStorage.getItem(GUEST_KEY) === "1");
    }
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (!user) {
      setPoints(0); setIsPremium(false); setOwned([]);
      setIsAdmin(false); setIsOwner(false); setLevel(1); setTotalHours(0);
      return;
    }
    const owner = (user.email ?? "").toLowerCase() === "gupta.ravinderkr@gmail.com";
    setIsOwner(owner);
    const [{ data: profile }, { data: abil }, { data: roles }, { data: lvl }] = await Promise.all([
      supabase.from("profiles").select("points,spice_enabled,is_premium").eq("id", user.id).maybeSingle(),
      supabase.from("user_abilities").select("ability_id").eq("user_id", user.id),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("user_levels").select("level,total_hours").eq("user_id", user.id).maybeSingle(),
    ]);
    if (profile) {
      setPoints(profile.points ?? 0);
      setSpiceState(!!profile.spice_enabled);
      setIsPremium(!!profile.is_premium);
    }
    setOwned((abil ?? []).map((r: { ability_id: string }) => r.ability_id));
    const hasAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    setIsAdmin(hasAdmin || owner);
    if (lvl) { setLevel(lvl.level ?? 1); setTotalHours(Number(lvl.total_hours ?? 0)); }
  };

  // refresh on user change
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  const setGuest = (v: boolean) => {
    setIsGuestState(v);
    if (typeof window !== "undefined") {
      if (v) localStorage.setItem(GUEST_KEY, "1");
      else localStorage.removeItem(GUEST_KEY);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setGuest(false);
  };

  const setSpice = (v: boolean) => {
    setSpiceState(v);
    if (user) {
      void supabase.from("profiles").update({ spice_enabled: v }).eq("id", user.id);
    }
  };

  const buyAbility = async (abilityId: string, cost: number) => {
    if (!user) return false;
    if (points < cost || ownedAbilities.includes(abilityId)) return false;

    const { error: ledgerErr } = await supabase
      .from("points_ledger")
      .insert({ user_id: user.id, delta: -cost, reason: `purchase:${abilityId}` });
    if (ledgerErr) return false;

    const { error: ownErr } = await supabase
      .from("user_abilities")
      .insert({ user_id: user.id, ability_id: abilityId, equipped: true });
    if (ownErr) return false;

    setPoints((p) => p - cost);
    setOwned((o) => [...o, abilityId]);
    return true;
  };

  return (
    <Ctx.Provider value={{
      session, user, isGuest, setGuest, signOut,
      sidebarOpen, setSidebarOpen,
      spice, setSpice, points, isPremium, ownedAbilities, buyAbility, refresh,
      isAdmin, isOwner, level, totalHours,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useOrion = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOrion outside provider");
  return v;
};
