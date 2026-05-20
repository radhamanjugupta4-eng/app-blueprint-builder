import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGrid, SectionHeader } from "@/components/orion/CardGrid";
import { useOrion } from "@/components/orion/OrionProvider";
import { useCharacters } from "@/lib/queries";

export const Route = createFileRoute("/tangly")({
  head: () => ({ meta: [{ title: "Tangly — Orion.ai" }] }),
  component: Tangly,
});

function Tangly() {
  const { spice } = useOrion();
  const { data, isLoading } = useCharacters();

  if (!spice) {
    return (
      <div className="mx-auto max-w-md text-center py-20 glass rounded-3xl p-8">
        <h2 className="text-xl font-bold text-gradient">Tangly is locked</h2>
        <p className="mt-2 text-sm text-muted-foreground">Enable Spice Mode in the sidebar to enter the 18+ realm.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full pill !py-2.5 !px-5">Go home</Link>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Tangly" subtitle="Spice-only realm · 18+" />
      <CardGrid cards={data ?? []} loading={isLoading} />
    </div>
  );
}
