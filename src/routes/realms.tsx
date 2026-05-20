import { createFileRoute } from "@tanstack/react-router";
import { CardGrid, SectionHeader } from "@/components/orion/CardGrid";
import { useRealms } from "@/lib/queries";

export const Route = createFileRoute("/realms")({
  head: () => ({ meta: [{ title: "Story Realms — Orion.ai" }] }),
  component: Realms,
});

function Realms() {
  const { data, isLoading } = useRealms();
  return (
    <div>
      <SectionHeader title="Story Realms" subtitle="Step into immersive story-mode worlds" />
      <CardGrid cards={data ?? []} loading={isLoading} />
    </div>
  );
}
