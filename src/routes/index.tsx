import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, CheckCircle2, Rocket, TrendingUp, Clock } from "lucide-react";
import { CardGrid, SectionHeader } from "@/components/orion/CardGrid";
import { useCharacters, useRealms } from "@/lib/queries";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: entities = [], isLoading: lc } = useCharacters();
  const { data: realms = [], isLoading: lr } = useRealms();
  const featured = entities.slice(0, 4);
  const trending = [...realms.slice(0, 2), ...entities.slice(4, 6)];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero */}
      <section className="relative pt-4 sm:pt-10 pb-10">
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-[120px]" />
        <div className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-[2.5rem] leading-[1.05] sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
              Stop Chasing<br />
              Stories. <span className="text-gradient">Start<br />Living Them.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm sm:text-base text-muted-foreground">
              A premium AI universe of entities, realms, and syndicates — built for stories you actually want to live in.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/entities" className="btn-light">
                Try it now
                <span className="arrow"><ArrowRight className="h-4 w-4" /></span>
              </Link>
              <Link to="/premium" className="pill !py-3 !px-5">
                Go Premium
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-4 items-start md:items-end">
            <span className="pill"><Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Your cosmic story engine</span>
            <span className="pill ml-6 md:ml-0 md:mr-8"><CheckCircle2 className="h-3.5 w-3.5 text-primary-glow" /> Hand-crafted entities only</span>
            <span className="pill"><Rocket className="h-3.5 w-3.5 text-primary-glow" /> Endless realms to explore</span>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Featured" subtitle="Hand-picked entities of the week" />
        <CardGrid cards={featured} loading={lc} />
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-glow" />
          <h2 className="text-xl sm:text-2xl font-bold text-gradient">Trending now</h2>
        </div>
        <CardGrid cards={trending} loading={lc || lr} />
      </section>

      <section>
        <SectionHeader title="Story Realms" subtitle="Step into entire worlds" />
        <div className="grid gap-4 md:grid-cols-2">
          {realms.slice(0, 4).map((r) => (
            <Link
              key={r.id}
              to="/chat/$id"
              params={{ id: r.id }}
              className="group relative overflow-hidden rounded-3xl border border-border glow-hover h-44 sm:h-56"
            >
              <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-5 sm:p-6 max-w-[70%]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary-glow">Story Realm</span>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold text-foreground">{r.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">A cosmic tale awaits.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-glow" />
          <h2 className="text-xl sm:text-2xl font-bold text-gradient">Recently added</h2>
        </div>
        <CardGrid cards={entities.slice(2, 8)} loading={lc} />
      </section>
    </div>
  );
}
