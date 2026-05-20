import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useAbilities } from "@/lib/queries";
import { useOrion } from "@/components/orion/OrionProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/abilities")({
  head: () => ({ meta: [{ title: "Ability Shop — Orion.ai" }] }),
  component: Abilities,
});

function Abilities() {
  const { points, ownedAbilities, buyAbility, user, isGuest } = useOrion();
  const { data: abilities = [], isLoading } = useAbilities();

  const handleBuy = async (id: string, cost: number) => {
    if (!user) {
      toast.error("Sign up to purchase abilities.");
      return;
    }
    const ok = await buyAbility(id, cost);
    if (ok) toast.success("Ability acquired.");
    else toast.error("Could not complete purchase.");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl cosmic-bg p-6 sm:p-8 glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground">Ability Shop</h1>
            <p className="mt-1 text-sm text-primary-foreground/80">Spend points to empower your characters.</p>
          </div>
          <div className="rounded-2xl bg-background/30 backdrop-blur px-5 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70">Balance</p>
            <p className="text-2xl font-bold text-primary-foreground tabular-nums">{points.toLocaleString()} pts</p>
          </div>
        </div>
        {(isGuest || !user) && (
          <p className="mt-4 text-xs text-primary-foreground/80">
            <Link to="/auth" className="underline">Sign in</Link> to earn points and own abilities.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {abilities.map((a) => {
            const owned = ownedAbilities.includes(a.id);
            const canBuy = !!user && points >= a.cost;
            return (
              <div key={a.id} className="rounded-2xl glass p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl cosmic-bg text-2xl">
                    {a.icon}
                  </div>
                  {owned ? (
                    <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                      <Check className="h-3 w-3" /> Owned
                    </span>
                  ) : (
                    <span className="rounded-full glass-strong px-2.5 py-1 text-xs font-bold text-foreground tabular-nums">
                      {a.cost} pts
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground flex-1">{a.description}</p>
                <button
                  disabled={owned || !canBuy}
                  onClick={() => handleBuy(a.id, a.cost)}
                  className={`mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition-all ${
                    owned
                      ? "bg-secondary text-muted-foreground cursor-default"
                      : canBuy
                      ? "cosmic-bg text-primary-foreground glow-hover"
                      : "glass text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {owned ? "Equipped" : canBuy ? "Purchase" : (
                    <span className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3" />{user ? "Insufficient" : "Sign in"}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
