import { createFileRoute } from "@tanstack/react-router";
import { CardGrid, SectionHeader } from "@/components/orion/CardGrid";
import { useCharacters } from "@/lib/queries";

export const Route = createFileRoute("/entities")({
  head: () => ({ meta: [{ title: "Unsuperistic Entities — Orion.ai" }] }),
  component: Entities,
});

function Entities() {
  const { data, isLoading } = useCharacters();
  return (
    <div>
      <SectionHeader title="Unsuperistic Entities" subtitle="Singular characters, infinite stories" />
      <CardGrid cards={data ?? []} loading={isLoading} />
    </div>
  );
}
