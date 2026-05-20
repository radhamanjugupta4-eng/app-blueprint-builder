import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Send, Heart, Skull, Plus } from "lucide-react";
import { useState } from "react";
import { useAbilities, useCharacterBySlug } from "@/lib/queries";
import { useOrion } from "@/components/orion/OrionProvider";
import { fallbackImage } from "@/lib/orion-data";

export const Route = createFileRoute("/chat/$id")({
  component: ChatPage,
});

function ChatPage() {
  const { id } = Route.useParams();
  const { data: character, isLoading } = useCharacterBySlug(id);
  const { data: abilities = [] } = useAbilities();
  const { ownedAbilities } = useOrion();
  const [showAbilities, setShowAbilities] = useState(false);
  const [input, setInput] = useState("");

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }
  if (!character) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Character not found.</p>
        <Link to="/" className="mt-4 inline-block text-primary-glow">Go home</Link>
      </div>
    );
  }

  const image = character.image_url || fallbackImage(0);
  const owned = abilities.filter((a) => ownedAbilities.includes(a.id));

  return (
    <div className="relative -mx-4 sm:-mx-6 -my-6 sm:-my-10 min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover opacity-20 blur-2xl scale-110" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="sticky top-16 z-10 glass-strong border-b border-border">
          <div className="mx-auto max-w-4xl flex items-center gap-3 px-4 sm:px-6 py-3">
            <Link to="/" className="rounded-lg p-2 text-foreground hover:bg-secondary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <img src={image} alt={character.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/40" />
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate">{character.name}</h1>
              <p className="text-[11px] text-muted-foreground">Online · cosmic entity</p>
            </div>
            <button
              onClick={() => setShowAbilities((s) => !s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                showAbilities ? "cosmic-bg text-primary-foreground" : "glass text-foreground hover:border-primary/50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Abilities</span>
            </button>
          </div>

          <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-3 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-primary-glow" />
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-2/5 cosmic-bg rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">42%</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] text-muted-foreground">
              <Skull className="h-3 w-3" /> 3 lives
            </div>
          </div>
        </div>

        {showAbilities && (
          <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-3 animate-in fade-in slide-in-from-top-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Your abilities</h3>
              {owned.length === 0 ? (
                <Link to="/abilities" className="flex items-center gap-2 text-sm text-primary-glow">
                  <Plus className="h-4 w-4" /> Visit ability shop
                </Link>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {owned.map((a) => (
                    <button key={a.id} className="rounded-xl glass-strong p-3 text-left hover:border-primary/50 transition-colors">
                      <div className="text-xl">{a.icon}</div>
                      <p className="mt-1 text-xs font-semibold text-foreground truncate">{a.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 space-y-4">
          <div className="flex gap-3">
            <img src={image} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm glass p-4">
              <p className="text-sm text-foreground">Welcome, traveler. I sensed your arrival across the void.</p>
              <span className="mt-2 block text-[10px] text-muted-foreground">just now</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm cosmic-bg p-4">
              <p className="text-sm text-primary-foreground">This is a placeholder conversation.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <img src={image} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm glass p-4">
              <p className="text-sm text-foreground">Real responses will arrive when you connect the chat engine.</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 glass-strong border-t border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
            <form
              onSubmit={(e) => { e.preventDefault(); setInput(""); }}
              className="flex items-center gap-2 rounded-full glass px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/50"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${character.name}...`}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full cosmic-bg text-primary-foreground hover:scale-105 transition-transform">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
