import { Link, useRouterState } from "@tanstack/react-router";
import { X, Globe2, Users, Sparkles, Crown, Flame, Heart, Shield } from "lucide-react";
import { useOrion } from "./OrionProvider";
import { Switch } from "@/components/ui/switch";

const baseItems = [
  { to: "/realms", label: "Story Realms", icon: Globe2, desc: "Story mode worlds" },
  { to: "/entities", label: "Unsuperistic Entities", icon: Sparkles, desc: "Individual characters" },
  { to: "/syndicates", label: "Syndicates", icon: Users, desc: "Group chats" },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, spice, setSpice, isAdmin } = useOrion();
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[300px] glass-strong border-r border-border transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full cosmic-bg pulse-glow" />
            <span className="text-lg font-bold text-gradient">Orion.ai</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between rounded-xl glass p-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${spice ? "cosmic-bg" : "bg-secondary"}`}>
                <Flame className={`h-4 w-4 ${spice ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Spice Mode</p>
                <p className="text-xs text-muted-foreground">{spice ? "Tangly unlocked" : "Family-friendly"}</p>
              </div>
            </div>
            <Switch checked={spice} onCheckedChange={setSpice} />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {baseItems.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "cosmic-bg" : "bg-secondary"}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                </div>
              </Link>
            );
          })}

          {spice && (
            <Link
              to="/tangly"
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all animate-in fade-in slide-in-from-left-2 ${
                path === "/tangly" ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Tangly</p>
                <p className="text-[11px] text-muted-foreground">Spice-only realm</p>
              </div>
            </Link>
          )}

          <Link
            to="/premium"
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              path === "/premium" ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Crown className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Premium</p>
              <p className="text-[11px] text-muted-foreground">Subscription plans</p>
            </div>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                path.startsWith("/admin") ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Control Center</p>
                <p className="text-[11px] text-muted-foreground">Admin & owner</p>
              </div>
            </Link>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl cosmic-bg p-4 text-center">
            <p className="text-sm font-semibold text-primary-foreground">Go Premium</p>
            <p className="mt-1 text-xs text-primary-foreground/80">Unlock everything in Orion.</p>
            <Link
              to="/premium"
              onClick={() => setSidebarOpen(false)}
              className="mt-3 inline-block w-full rounded-lg bg-background/30 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-background/40"
            >
              View plans
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
