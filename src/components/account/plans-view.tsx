"use client";

import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ViewHeader } from "./parts";

interface Plan {
  name: string;
  blurb: string;
  price: string;
  per: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  disabled?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "For getting started",
    price: "$0",
    per: "forever",
    features: ["General AI chat", "5 specialist agents", "Basic tools", "Academy paths", "Local history"],
    cta: "Current plan",
    disabled: true,
  },
  {
    name: "Pro",
    blurb: "For daily defenders",
    price: "$4.99",
    per: "/mo",
    features: [
      "Unlimited AI chats",
      "Custom agents",
      "Advanced tools & reports",
      "Priority AI responses",
      "Academy certificates",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    name: "Team",
    blurb: "For small security squads",
    price: "$12.99",
    per: "/mo",
    features: ["Everything in Pro", "5 team seats", "Shared lab environments", "Team security dashboard"],
    cta: "Contact sales",
  },
];

export default function PlansView() {
  const { toast } = useToast();

  function handleCta(plan: Plan) {
    if (plan.name === "Pro") {
      toast({
        title: "Demo build",
        description: "Payments aren't wired in this open-source sample — enjoy the Pro design!",
      });
    } else {
      toast({
        title: "Demo build",
        description: "Team sales aren't wired in this open-source sample.",
      });
    }
  }

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader title="Plans" subtitle="Simple, honest pricing" />

      <div className="flex flex-col gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-5 transition-all ${
              plan.highlighted
                ? "border-neon/50 bg-neon/[0.05] box-glow"
                : "border-white/[0.07] bg-white/[0.03]"
            }`}
          >
            {plan.highlighted ? (
              <span className="absolute -top-2.5 right-4 rounded-full bg-neon px-2.5 py-0.5 text-[10px] font-bold text-black shadow-[0_0_16px_-2px_var(--neon)]">
                MOST POPULAR
              </span>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[15px] font-bold">{plan.name}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{plan.blurb}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-3xl font-bold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-[12px] text-muted-foreground">{plan.per}</span>
              </div>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-[13px] text-foreground/80">
                  <Check className={`h-3.5 w-3.5 shrink-0 ${plan.highlighted ? "text-neon" : "text-muted-foreground"}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={plan.disabled}
              onClick={() => handleCta(plan)}
              className={
                plan.highlighted
                  ? "mt-5 h-10 w-full rounded-xl bg-neon text-[13px] font-semibold text-black shadow-[0_0_24px_-4px_var(--neon)] transition active:scale-[0.99]"
                  : "mt-5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-medium transition-colors hover:bg-white/[0.07] disabled:opacity-40"
              }
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
