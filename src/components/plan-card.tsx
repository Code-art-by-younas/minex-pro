import type { ReactNode } from "react";
import { Check, Crown, Gem, Medal, Rocket, Sparkles, Star } from "lucide-react";
import type { Plan } from "@/db/schema";
import { cn, n, pkr } from "@/lib/utils";

const ACCENTS: Record<string, { ring: string; text: string; grad: string; chip: string }> = {
  slate: {
    ring: "hover:border-slate-400/40",
    text: "text-slate-300",
    grad: "from-slate-500/20 to-transparent",
    chip: "bg-slate-500/15 text-slate-300",
  },
  amber: {
    ring: "hover:border-amber-400/50",
    text: "text-amber-300",
    grad: "from-amber-500/25 to-transparent",
    chip: "bg-amber-500/15 text-amber-300",
  },
  cyan: {
    ring: "hover:border-aqua-400/60",
    text: "text-aqua-400",
    grad: "from-aqua-500/25 to-transparent",
    chip: "bg-aqua-500/15 text-aqua-300",
  },
  yellow: {
    ring: "hover:border-yellow-300/50",
    text: "text-yellow-300",
    grad: "from-yellow-400/25 to-transparent",
    chip: "bg-yellow-400/15 text-yellow-300",
  },
  violet: {
    ring: "hover:border-violet-400/50",
    text: "text-violet-300",
    grad: "from-violet-500/25 to-transparent",
    chip: "bg-violet-500/15 text-violet-300",
  },
  emerald: {
    ring: "hover:border-neon-500/60",
    text: "text-neon-400",
    grad: "from-neon-500/25 to-transparent",
    chip: "bg-neon-500/15 text-neon-400",
  },
};

const ICONS = [Sparkles, Medal, Star, Crown, Rocket, Gem];

// ✅ Named export (not default)
export function PlanCard({
  plan,
  cta,
  active = false,
}: {
  plan: Plan;
  cta?: ReactNode;
  active?: boolean;
}) {
  const accent = ACCENTS[plan.accent] ?? ACCENTS.emerald;
  const Icon = ICONS[plan.tier] ?? Sparkles;
  const monthly = n(plan.dailyProfit) * 30;
  const roi = n(plan.price) > 0 ? (monthly / n(plan.price)) * 100 : 0;

  return (
    <div
      className={cn(
        "glass group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5",
        accent.ring,
        plan.popular && "border-aqua-400/40 shadow-[0_28px_80px_-40px_rgba(20,200,245,0.9)]",
        active && "border-neon-500/60 shadow-[0_28px_80px_-40px_rgba(16,242,140,0.9)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-60",
          accent.grad,
        )}
      />
      {plan.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-neon-500 to-aqua-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-950 shadow-[0_0_20px_rgba(20,200,245,0.7)]">
          Most Popular
        </span>
      ) : null}
      {active ? (
        <span className="absolute -top-3 right-4 rounded-full bg-neon-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-950">
          Active
        </span>
      ) : null}

      <div className="relative flex items-center gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/10", accent.text)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-white">{plan.name}</p>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", accent.text)}>
            Tier {plan.tier}
          </p>
        </div>
      </div>

      <div className="relative mt-5 flex items-end gap-1.5">
        <span className="font-display text-4xl font-extrabold text-white">
          {n(plan.price) === 0 ? "Free" : pkr(plan.price, 0)}
        </span>
        {n(plan.price) > 0 ? <span className="pb-1.5 text-xs text-slate-500">one-time</span> : null}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Mining speed</p>
          <p className={cn("text-sm font-bold", accent.text)}>{n(plan.speed).toLocaleString()} GH/s</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Duration</p>
          <p className="text-sm font-bold text-white">{plan.validityDays} days</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Daily profit</p>
          <p className="text-sm font-bold text-neon-400">{pkr(plan.dailyProfit, 2)}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Cycle</p>
          <p className="text-sm font-bold text-white">{plan.sessionHours}h</p>
        </div>
      </div>

      {n(plan.price) > 0 ? (
        <p className={cn("relative mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold", accent.chip)}>
          ≈ {roi.toFixed(0)}% monthly ROI
        </p>
      ) : null}

      <ul className="relative mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-400">
            <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", accent.text)} />
            {feature}
          </li>
        ))}
      </ul>

      {cta ? <div className="relative mt-6">{cta}</div> : null}
    </div>
  );
}