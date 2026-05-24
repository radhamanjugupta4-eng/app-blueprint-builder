import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Send, Heart, Skull, Plus, Loader2, ArrowDown, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAbilities, useCharacterBySlug } from "@/lib/queries";
import { useOrion } from "@/components/orion/OrionProvider";
import { fallbackImage } from "@/lib/orion-data";
import { chatWithCharacter, getChatHistory } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$id")({
  component: ChatPage,
});

type Msg = { id?: string; role: string; content: string; pending?: boolean; ts?: number };

function ChatPage() {
  const { id } = Route.useParams();
  const { data: character, isLoading } = useCharacterBySlug(id);
  const { data: abilities = [] } = useAbilities();
  const { ownedAbilities, user } = useOrion();
  const [showAbilities, setShowAbilities] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const sendFn = useServerFn(chatWithCharacter);
  const historyFn = useServerFn(getChatHistory);

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ["chat-history", id],
    queryFn: () => historyFn({ data: { slug: id } }),
    enabled: !!user && !!character,
  });

  useEffect(() => {
    if (!history) return;
    const seed: Msg[] = [];
    if (history.greeting) seed.push({ role: "assistant", content: history.greeting });
    seed.push(...history.messages);
    setMessages(seed);
  }, [history]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => { if (atBottom) scrollToBottom(); }, [messages, atBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = useMutation({
    mutationFn: (text: string) => sendFn({ data: { slug: id, message: text } }),
    onSuccess: (res) => {
      setMessages((m) => [...m.filter((x) => !x.pending), { role: "assistant", content: res.reply, ts: Date.now() }]);
      qc.invalidateQueries({ queryKey: ["chat-history", id] });
    },
    onError: (e: Error) => {
      setMessages((m) => m.filter((x) => !x.pending));
      toast.error(e.message || "AI failed to respond");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!user) { toast.error("Please sign in to chat."); return; }
    setInput("");
    setAtBottom(true);
    setMessages((m) => [
      ...m,
      { role: "user", content: text, ts: Date.now() },
      { role: "assistant", content: "", pending: true },
    ]);
    send.mutate(text);
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 -my-6 sm:-my-10 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover opacity-20 blur-2xl scale-110" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="sticky top-16 z-10 glass-strong border-b border-border">
          <div className="mx-auto max-w-4xl flex items-center gap-3 px-4 sm:px-6 py-3">
            <Link to="/" className="rounded-lg p-2 text-foreground hover:bg-secondary transition-all active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <img src={image} alt={character.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/40" />
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate">{character.name}</h1>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · powered by Orion AI
              </p>
            </div>
            <button
              onClick={() => setShowTimestamps((s) => !s)}
              title="Toggle timestamps"
              className={`rounded-full p-2 transition-all active:scale-90 ${showTimestamps ? "cosmic-bg text-primary-foreground" : "glass text-muted-foreground"}`}
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowAbilities((s) => !s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
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
                <div className="h-full w-2/5 cosmic-bg rounded-full transition-all duration-500" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">42%</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] text-muted-foreground">
              <Skull className="h-3 w-3" /> 3 lives
            </div>
          </div>
        </div>

        {showAbilities && (
          <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Your abilities</h3>
              {owned.length === 0 ? (
                <Link to="/abilities" className="flex items-center gap-2 text-sm text-primary-glow">
                  <Plus className="h-4 w-4" /> Visit ability shop
                </Link>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {owned.map((a) => (
                    <button key={a.id} className="rounded-xl glass-strong p-3 text-left hover:border-primary/50 transition-all hover:scale-[1.02] active:scale-95">
                      <div className="text-xl">{a.icon}</div>
                      <p className="mt-1 text-xs font-semibold text-foreground truncate">{a.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 space-y-4 overflow-y-auto scroll-smooth">
          {histLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 rounded-2xl glass max-w-[75%]" />
              <div className="h-12 rounded-2xl glass max-w-[60%] ml-auto" />
              <div className="h-20 rounded-2xl glass max-w-[80%]" />
            </div>
          )}

          {!histLoading && messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              Say hi to {character.name} ✨
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={m.id ?? i}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role !== "user" && <img src={image} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />}
              <div className={`flex flex-col gap-1 max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl p-4 text-[15px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-sm cosmic-bg text-primary-foreground"
                      : "rounded-tl-sm glass text-foreground"
                  }`}
                >
                  {m.pending ? (
                    <span className="inline-flex gap-1 items-center text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "240ms" }} />
                    </span>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
                {showTimestamps && m.ts && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!atBottom && (
          <button
            onClick={() => { setAtBottom(true); scrollToBottom(); }}
            className="fixed bottom-24 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full cosmic-bg text-primary-foreground shadow-lg animate-in fade-in zoom-in transition-all hover:scale-110 active:scale-90"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        <div className="sticky bottom-0 glass-strong border-t border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 rounded-full glass px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? `Message ${character.name}...` : "Sign in to chat..."}
                disabled={!user || send.isPending}
                className="flex-1 bg-transparent px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!user || send.isPending || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full cosmic-bg text-primary-foreground transition-all hover:scale-105 active:scale-90 disabled:opacity-40"
              >
                {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
