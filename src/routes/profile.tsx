import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Settings, LogOut, Sparkles, LogIn } from "lucide-react";
import { useOrion } from "@/components/orion/OrionProvider";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Orion.ai" }] }),
  component: Profile,
});

function Profile() {
  const { points, ownedAbilities, user, isGuest, signOut, isPremium } = useOrion();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center glass rounded-3xl p-8">
        <div className="mx-auto h-16 w-16 rounded-full cosmic-bg pulse-glow flex items-center justify-center">
          <User className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gradient">{isGuest ? "Guest traveler" : "Not signed in"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to save your story, points, and abilities.</p>
        <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full cosmic-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <LogIn className="h-4 w-4" /> Sign in
        </Link>
      </div>
    );
  }

  const name = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "Traveler";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl glass-strong p-6 sm:p-8 text-center glow">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full cosmic-bg pulse-glow">
          <User className="h-9 w-9 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gradient">{name}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {isPremium && (
          <span className="mt-3 inline-flex rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-glow">Premium</span>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl glass p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Points</p>
            <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{points.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl glass p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Abilities</p>
            <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{ownedAbilities.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass divide-y divide-border">
        <Link to="/abilities" className="flex items-center gap-3 w-full px-5 py-4 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors first:rounded-t-2xl">
          <Sparkles className="h-4 w-4 text-primary-glow" /> Manage abilities
        </Link>
        <button className="flex items-center gap-3 w-full px-5 py-4 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors">
          <Settings className="h-4 w-4 text-primary-glow" /> Settings
        </button>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="flex items-center gap-3 w-full px-5 py-4 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors last:rounded-b-2xl"
        >
          <LogOut className="h-4 w-4 text-primary-glow" /> Sign out
        </button>
      </div>
    </div>
  );
}
