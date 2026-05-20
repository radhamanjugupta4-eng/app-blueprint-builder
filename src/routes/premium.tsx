import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown } from "lucide-react";
import { plans } from "@/lib/orion-data";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Premium — Orion.ai" }] }),
  component: Premium,
});

const features = [
  "Unlimited entity chats",
  "Access to every Story Realm",
  "Exclusive Syndicate access",
  "Priority response speed",
  "Discounted abilities",
  "Early access to new features",
];

function Premium() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold text-primary-glow">
          <Crown className="h-3 w-3" /> Orion Premium
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gradient">Unlock the universe</h1>
        <p className="mt-3 text-muted-foreground">Choose a plan and step beyond the gateway.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-6 sm:p-8 ${plan.highlight ? "cosmic-bg glow" : "glass"}`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-glow border border-primary/50">
                Most popular
              </span>
            )}
            <h3 className={`text-xl font-bold ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className={`text-5xl font-bold ${plan.highlight ? "text-primary-foreground" : "text-gradient"}`}>${plan.price}</span>
              <span className={plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>/mo</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-primary-foreground/90" : "text-foreground"}`}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-8 w-full rounded-full py-3 text-sm font-semibold transition-all ${
                plan.highlight ? "bg-background text-foreground hover:bg-background/90" : "cosmic-bg text-primary-foreground glow-hover"
              }`}
            >
              Upgrade to {plan.name}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-3xl glass-strong p-8">
        <h2 className="text-2xl font-bold text-gradient">All plans include</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full cosmic-bg">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
