import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrion } from "@/components/orion/OrionProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Orion.ai" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { setGuest } = useOrion();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // Auto-confirm is enabled — session is created instantly
        if (data.session) {
          toast.success("Welcome to Orion ✨");
          navigate({ to: "/" });
        } else {
          // fallback if confirmation is required
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) { toast.success("Account created. Please sign in."); setMode("signin"); }
          else { toast.success("Welcome to Orion ✨"); navigate({ to: "/" }); }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, traveler.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const guest = () => {
    setGuest(true);
    toast.info("Exploring as a guest. Sign up later to save progress.");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md py-10 sm:py-16">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full cosmic-bg pulse-glow" />
        <h1 className="mt-4 text-3xl font-bold text-gradient">
          {mode === "signup" ? "Join Orion" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup" ? "Create your cosmic identity." : "Sign in to continue your story."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3 glass rounded-2xl p-5">
        {mode === "signup" && (
          <input
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        )}
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full cosmic-bg py-3 text-sm font-semibold text-primary-foreground glow-hover disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {busy ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {mode === "signin" ? "No account? Sign up" : "Already a traveler? Sign in"}
      </button>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={guest}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full pill !py-3"
      >
        Continue as guest
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Back home</Link>
      </p>
    </div>
  );
}
