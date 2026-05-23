import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useOrion } from "@/components/orion/OrionProvider";
import { Users, MessageSquare, BarChart3, Settings2, ScrollText, Database, LayoutDashboard, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/characters", label: "Characters", icon: Sparkles },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/config", label: "Config", icon: Settings2 },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/backup", label: "Backup", icon: Database },
];

function AdminLayout() {
  const { isAdmin, isOwner, user, authLoading } = useOrion();
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (authLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading access…</div>;
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Please sign in to access the Control Center.</p>
        <Link to="/auth" className="mt-4 inline-block rounded-full cosmic-bg px-5 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">Restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{isOwner ? "Owner" : "Admin"} Control Center</p>
          <h1 className="text-3xl font-bold text-gradient">Orion Operations</h1>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {NAV.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                active ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="glass-strong rounded-2xl p-5 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}
