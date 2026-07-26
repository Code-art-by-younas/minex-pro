import { CheckCircle2, Info, ShoppingCart, Wallet } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { PlanCard } from "@/components/plan-card";
import { ButtonLink, GlassCard, SectionTitle, StatCard } from "@/components/ui";
import { purchasePlanAction } from "@/app/actions/app";
import { requireUser } from "@/lib/auth";
import { getPlanById, getPlans } from "@/lib/data";
import { dayLabel, hashRate, n, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mining Plans — MineX Pro" };

export default async function PlansPage() {
  const user = await requireUser();
  const [allPlans, current] = await Promise.all([getPlans(), getPlanById(user.planId)]);

  // Separate plans by type (weekly vs monthly)
  const weeklyPlans = allPlans.filter((p) => p.slug.startsWith("weekly"));
  const monthlyPlans = allPlans.filter((p) => p.slug.startsWith("monthly"));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Mining Plans</h1>
        <p className="mt-1 text-sm text-slate-400">
          Choose your plan and start mining. Weekly = 100% profit • Monthly = 200% profit
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Wallet balance"
          value={pkr(user.balance)}
          hint="Available for plan purchases"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Active contract"
          value={current?.name ?? "None"}
          hint={
            user.planExpiresAt ? `Expires ${dayLabel(user.planExpiresAt)}` : "Activate a plan to mine faster"
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="cyan"
        />
        <StatCard
          label="Current speed"
          value={hashRate(user.miningPower)}
          hint={current ? `${current.sessionHours}h cycles` : "No plan active"}
          icon={<ShoppingCart className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Weekly Plans Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
            WEEKLY
          </span>
          <h2 className="font-display text-xl font-bold text-white">7 Days • 100% Profit</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {weeklyPlans.map((plan) => {
            const isActive = current?.id === plan.id;
            const affordable = n(user.balance) >= n(plan.price);
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                active={isActive}
                cta={
                  isActive ? (
                    <div className="rounded-xl border border-neon-500/40 bg-neon-500/10 py-3 text-center text-sm font-bold text-neon-400">
                      Currently active
                    </div>
                  ) : affordable ? (
                    <ActionButton
                      action={purchasePlanAction}
                      fields={{ planId: plan.id }}
                      full
                      refreshOnSuccess
                      variant={plan.popular ? "primary" : "ghost"}
                      pendingLabel="Activating…"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy for {pkr(plan.price, 0)}
                    </ActionButton>
                  ) : (
                    <ButtonLink href="/deposit" variant="subtle" full>
                      Deposit {pkr(n(plan.price) - n(user.balance), 0)} more
                    </ButtonLink>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      {/* Monthly Plans Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            MONTHLY
          </span>
          <h2 className="font-display text-xl font-bold text-white">30 Days • 200% Profit</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {monthlyPlans.map((plan) => {
            const isActive = current?.id === plan.id;
            const affordable = n(user.balance) >= n(plan.price);
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                active={isActive}
                cta={
                  isActive ? (
                    <div className="rounded-xl border border-neon-500/40 bg-neon-500/10 py-3 text-center text-sm font-bold text-neon-400">
                      Currently active
                    </div>
                  ) : affordable ? (
                    <ActionButton
                      action={purchasePlanAction}
                      fields={{ planId: plan.id }}
                      full
                      refreshOnSuccess
                      variant={plan.popular ? "primary" : "ghost"}
                      pendingLabel="Activating…"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy for {pkr(plan.price, 0)}
                    </ActionButton>
                  ) : (
                    <ButtonLink href="/deposit" variant="subtle" full>
                      Deposit {pkr(n(plan.price) - n(user.balance), 0)} more
                    </ButtonLink>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-aqua-400" />
          <div>
            <h3 className="font-display text-base font-bold text-white">How contracts work</h3>
            <ul className="mt-3 grid gap-2.5 text-xs text-slate-400 sm:grid-cols-2">
              <li>• Each contract fixes your hash power and cycle length for its full duration.</li>
              <li>• Cycle payout = daily profit × (cycle hours ÷ 24), credited on claim.</li>
              <li>• Referrers earn 10% (level 1) and 3% (level 2) of every purchase.</li>
              <li>• When a contract expires you automatically drop back to 5 GH/s.</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}