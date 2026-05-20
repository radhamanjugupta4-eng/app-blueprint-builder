import { createFileRoute } from "@tanstack/react-router";
import { CardGrid, SectionHeader } from "@/components/orion/CardGrid";
import { useSyndicates } from "@/lib/queries";

export const Route = createFileRoute("/syndicates")({
  head: () => ({ meta: [{ title: "Syndicates — Orion.ai" }] }),
  component: Syndicates,
});

function Syndicates() {
  const { data, isLoading } = useSyndicates();
  return (
    <div>
      <SectionHeader title="Syndicates" subtitle="Multi-character group chats" />
      <CardGrid cards={data ?? []} loading={isLoading} />
    </div>
  );
}
