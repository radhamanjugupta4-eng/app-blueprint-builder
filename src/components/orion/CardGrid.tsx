import type { Card } from "@/lib/orion-data";
import { CharacterCard } from "./CharacterCard";

export function CardGrid({ cards, loading }: { cards: Card[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl glass animate-pulse" />
        ))}
      </div>
    );
  }
  if (cards.length === 0) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Nothing here yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((c) => <CharacterCard key={c.id} card={c} />)}
    </div>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gradient">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
