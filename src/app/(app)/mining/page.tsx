import Link from "next/link";
import { Activity, History, Pickaxe, Zap } from "lucide-react";
import { BarChart } from "@/components/charts";
import { MiningRig } from "@/components/mining-rig";
import { DataTable, EmptyState, GlassCard, StatCard, StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getActiveSession, getMiningHistory, getPlanById } from "@/lib/data";
import { dateLabel, hashRate, n, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mining Rig — MineX Pro" };

export default async function MiningPage() {
  const user = await requireUser();
  const [plan, session, history] = await Promise.all([
    getPlanById(user.planId),
    getActiveSession(user.id),
    getMiningHistory(user.id, 15),
  ]);

  const sessionHours = plan?.sessionHours ?? 24;
  const cycleReward = (n(plan?.dailyProfit) * sessionHours) / 24;
  const claimedTotal = history
    .filter((h) => h.status === "claimed")
    .reduce((acc, h) => acc + n(h.reward), 0);

  const chart = history
    .slice(0, 10)
    .reverse()
    .map((h) => n(h.reward));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Mining Rig</h1>
          <p className="mt-1 text-sm text-slate-400">
            Launch a hash cycle, watch it complete and claim rewards straight to your wallet.
          </p>
        </div>
        <Link href="/plans" className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          Boost hash power →
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <MiningRig
          session={
            session
              ? {
                  id: session.id,
                  planName: session.planName,
                  power: session.power,
                  reward: session.reward,
                  startedAt: new Date(session.startedAt).toISOString(),
                  endsAt: new Date(session.endsAt).toISOString(),
                  status: session.status,
                }
              : null
          }
          planName={plan?.name ?? "Free Starter"}
          power={user.miningPower}
          sessionHours={sessionHours}
          cycleReward={cycleReward}
        />

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              label="Lifetime mined"
              value={pkr(claimedTotal)}
              hint={`${history.filter((h) => h.status === "claimed").length} cycles claimed`}
              icon={<Pickaxe className="h-5 w-5" />}
            />
            <StatCard
              label="Current hash power"
              value={hashRate(user.miningPower)}
              hint={plan ? `${plan.name} contract` : "Free tier"}
              icon={<Zap className="h-5 w-5" />}
              accent="cyan"
            />
          </div>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-aqua-400" />
              <h2 className="font-display text-base font-bold text-white">Reward trend</h2>
            </div>
            <div className="mt-5">
              {chart.length ? (
                <BarChart data={chart} height={130} />
              ) : (
                <p className="py-8 text-center text-xs text-slate-500">
                  Complete cycles to build your reward history.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="font-display text-base font-bold text-white">Pool information</h2>
            <ul className="mt-4 space-y-2.5 text-xs">
              {[
                ["Pool node", "MineX-EU-01"],
                ["Algorithm", "SHA-256d"],
                ["Pool fee", "0.8%"],
                ["Payout window", "Instant on claim"],
                ["Uptime (30d)", "99.98%"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-200">{v}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-neon-400" />
          <h2 className="font-display text-lg font-bold text-white">Mining history</h2>
        </div>
        <div className="mt-5">
          {history.length === 0 ? (
            <EmptyState
              icon={<Pickaxe className="h-7 w-7" />}
              title="No mining cycles yet"
              hint="Press Start Mining above to run your first cycle."
            />
          ) : (
            <DataTable head={["Cycle", "Plan", "Power", "Reward", "Status", "Started", "Ends"]}>
              {history.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">#{row.id}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-white">{row.planName}</td>
                  <td className="px-3 py-3 text-xs text-aqua-400">{hashRate(row.power)}</td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-neon-400">
                    {pkr(row.reward, 4)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill
                      status={
                        row.status === "running" && new Date(row.endsAt).getTime() <= Date.now()
                          ? "claimed"
                          : row.status
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(row.startedAt)}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(row.endsAt)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </GlassCard>
    </div>
  );
}