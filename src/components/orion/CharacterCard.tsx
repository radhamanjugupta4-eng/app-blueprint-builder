import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Flame } from "lucide-react";
import type { Card } from "@/lib/orion-data";

export function CharacterCard({ card }: { card: Card }) {
  return (
    <Link
      to="/chat/$id"
      params={{ id: card.id }}
      className="group relative block overflow-hidden rounded-2xl glass glow-hover"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {card.tag && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/80 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            {card.tag}
          </span>
        )}

        {card.danger && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full glass-strong px-2 py-1">
            <Flame className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-bold text-foreground">{card.danger}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-foreground truncate">{card.name}</h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{card.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{card.chats}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
