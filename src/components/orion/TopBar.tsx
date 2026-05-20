import { Link } from "@tanstack/react-router";
import { Menu, Sparkles, ArrowRight, LogIn } from "lucide-react";
import { useOrion } from "./OrionProvider";

export function TopBar() {
  const { setSidebarOpen, points, user } = useOrion();
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full pill"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/" className="flex items-center gap-2 pl-1">
            <div className="h-7 w-7 rounded-full cosmic-bg pulse-glow" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">Orion<span className="text-primary-glow">.ai</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="pill !py-2 !px-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-glow pulse-glow" />
            <span className="text-xs sm:text-sm font-bold tabular-nums">{points.toLocaleString()}</span>
          </div>
          <Link to="/abilities" className="btn-light !pl-3 sm:!pl-4 !text-xs sm:!text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">Abilities</span>
            <span className="arrow !w-7 !h-7 sm:!w-8 sm:!h-8"><ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
        </div>

        {user ? (
          <Link
            to="/profile"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full pill"
          >
            <div className="h-5 w-5 rounded-full cosmic-bg" />
          </Link>
        ) : (
          <Link to="/auth" aria-label="Sign in" className="flex h-10 w-10 items-center justify-center rounded-full pill">
            <LogIn className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  );
}
