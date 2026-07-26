import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Clock3,
  Coins,
  Cpu,
  Gauge,
  Gift,
  Pickaxe,
  TrendingUp,
  Users,
  Wallet,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { AreaChart, BarChart, CountUp } from "@/components/charts";
import { ButtonLink, DataTable, EmptyState, GlassCard, ProgressBar, StatCard, StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  getActiveSession,
  getEarningsSeries,
  getPlanById,
  getReferralStats,
  getTransactions,
  getWalletTotals,
} from "@/lib/data";
import { dateLabel, hashRate, n, pkr } from "@/lib/utils"; // ✅ TX_LABELS removed
import { db } from "@/db";
import { dailyCheckins, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — MineX Pro" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [plan, session, txs, totals, referrals, series] = await Promise.all([
    getPlanById(user.planId),
    getActiveSession(user.id),
    getTransactions(user.id, undefined, 8),
    getWalletTotals(user.id),
    getReferralStats(user.id),
    getEarningsSeries(user.id),
  ]);

  // ✅ Check if user already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCheckin = await db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.userId, user.id),
        sql`${dailyCheckins.checkinDate} >= ${today}`,
        sql`${dailyCheckins.checkinDate} < ${tomorrow}`
      )
    )
    .limit(1);

  const streakData = await db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, user.id))
    .orderBy(dailyCheckins.createdAt)
    .limit(1);

  const streak = streakData[0]?.streak || 0;
  const hasCheckedIn = todayCheckin.length > 0;

  // ✅ Provide default when plan is null
  const dailyProfit = n(plan?.dailyProfit ?? 0);
  const running = session ? new Date(session.endsAt).getTime() > Date.now() : false;
  const progress = session
    ? Math.min(
        100,
        Math.max(
          0,
          ((Date.now() - new Date(session.startedAt).getTime()) /
            (new Date(session.endsAt).getTime() - new Date(session.startedAt).getTime())) *
            100,
        ),
      )
    : 0;

  const planDaysLeft = user.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(user.planExpiresAt).getTime() - Date.now()) / 86_400_000))
    : 0;

  const verifiedReferrals = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.referredBy, user.id),
        eq(users.kycStatus, "verified"),
        eq(users.status, "active")
      )
    );

  const referralCount = verifiedReferrals.length;
  const nextMilestone = referralCount < 10 ? 10 : referralCount < 20 ? 20 : referralCount < 30 ? 30 : referralCount < 50 ? 50 : referralCount < 100 ? 100 : null;
  const milestoneProgress = nextMilestone ? Math.min((referralCount / nextMilestone) * 100, 100) : 100;
  const nextReward = nextMilestone ? (nextMilestone === 10 ? 50 : nextMilestone === 20 ? 100 : nextMilestone === 30 ? 150 : nextMilestone === 50 ? 250 : 500) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome Section */}
      <GlassCard glow="green" className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-neon-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-400">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 max-w-lg text-sm text-slate-400">
              {running
                ? "Your rig is hashing right now. Come back when the cycle completes to claim your reward."
                : "Your rig is idle — start a new mining cycle to keep the rewards flowing."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <ButtonLink href="/deposit" size="md">
                <ArrowDownToLine className="h-4 w-4" /> Deposit
              </ButtonLink>
              <ButtonLink href="/withdraw" variant="ghost" size="md">
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </ButtonLink>
              <ButtonLink href="/mining" variant="subtle" size="md">
                <Pickaxe className="h-4 w-4" /> Mining rig
              </ButtonLink>
            </div>
          </div>

          <div className="relative w-full max-w-xs rounded-2xl border border-neon-500/25 bg-ink-950/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Wallet Balance</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-gradient">
              <CountUp value={n(user.balance)} prefix="PKR " decimals={2} />
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Total Earned</p>
                <p className="font-bold text-white">{pkr(user.totalEarned)}</p>
              </div>
              <div>
                <p className="text-slate-500">Pending</p>
                <p className="font-bold text-amber-300">{pkr(totals.pending)}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mining Status"
          value={running ? "Active" : session ? "Claimable" : "Idle"}
          hint={session ? `${session.planName} • ${hashRate(session.power)}` : "Start a cycle"}
          icon={<Cpu className="h-5 w-5" />}
          accent={running ? "green" : "cyan"}
        />
        <StatCard
          label="Mining Power"
          value={hashRate(user.miningPower)}
          hint={plan ? `${plan.sessionHours}h cycles` : "Free tier"}
          icon={<Gauge className="h-5 w-5" />}
          accent="cyan"
        />
        <StatCard
          label="Daily Profit"
          value={pkr(dailyProfit)}
          hint={`≈ ${pkr(dailyProfit * 30)} / month`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          label="Referral Earnings"
          value={pkr(user.referralEarnings)}
          hint={`${referrals.team.length} team members`}
          icon={<Users className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Earnings Chart */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Earnings Overview</h2>
              <p className="text-xs text-slate-500">Last 14 days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-500/10 px-3 py-1 text-xs font-bold text-neon-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {pkr(series.reduce((a, b) => a + b, 0))}
            </span>
          </div>
          <div className="mt-6">
            <AreaChart data={series.length ? series : Array(14).fill(0)} height={180} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "Deposited", v: pkr(totals.deposited), c: "text-aqua-400" },
              { k: "Withdrawn", v: pkr(totals.withdrawn), c: "text-amber-300" },
              { k: "Mining + Bonus", v: pkr(totals.earned), c: "text-neon-400" },
              { k: "Team Size", v: String(referrals.team.length), c: "text-violet-300" },
            ].map((item) => (
              <div key={item.k} className="rounded-xl border border-white/8 bg-white/3 px-3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.k}</p>
                <p className={`mt-1 font-display text-base font-bold ${item.c}`}>{item.v}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-5">
          {/* Active Plan */}
          <GlassCard glow="cyan" className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Active Plan</h2>
              <Link href="/plans" className="text-xs font-semibold text-neon-400 hover:underline">
                Upgrade
              </Link>
            </div>
            {plan ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-500/30 to-aqua-500/10 ring-1 ring-white/10">
                    <Coins className="h-5 w-5 text-neon-400" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold text-white">{plan.name}</p>
                    <p className="text-xs text-slate-500">
                      {hashRate(plan.speed)} • {plan.sessionHours}h cycles
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Contract validity</span>
                    <span className="font-semibold text-white">{planDaysLeft} days left</span>
                  </div>
                  <ProgressBar
                    className="mt-2"
                    value={(planDaysLeft / Math.max(1, plan.validityDays)) * 100}
                  />
                </div>
              </>
            ) : (
              <EmptyState title="No active plan" hint="Activate a contract to unlock higher hash power." />
            )}
          </GlassCard>

          {/* Daily Check-in */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Daily Check-in</h2>
              <span className="text-xs text-slate-400">
                {hasCheckedIn ? "✅ Done!" : "Claim 5 PKR"}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-neon-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {hasCheckedIn ? "Already Checked In" : "Claim Your Daily Bonus"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {hasCheckedIn 
                        ? `🔥 ${streak} day streak! Come back tomorrow.` 
                        : `+5 PKR • ${streak} day streak`}
                    </p>
                  </div>
                </div>
                {!hasCheckedIn && user.kycStatus === "verified" ? (
                  <form action="/api/actions/daily-checkin" method="POST">
                    <button className="rounded-lg bg-neon-500/20 px-4 py-2 text-sm font-semibold text-neon-400 hover:bg-neon-500/30">
                      Claim
                    </button>
                  </form>
                ) : hasCheckedIn ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <div className="text-xs text-amber-400">KYC Required</div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Referral Milestone */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Referral Progress</h2>
            <p className="text-xs text-slate-400">
              {referralCount} verified referrals • {nextMilestone ? `${nextMilestone - referralCount} more to next reward` : "All milestones achieved! 🎉"}
            </p>
          </div>
          <Link href="/referral" className="text-xs font-semibold text-neon-400 hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Next milestone: {nextMilestone || "Complete"} referrals</span>
            <span className="font-semibold text-neon-400">
              {nextMilestone ? `${nextReward} PKR reward` : "🎉 Max achieved!"}
            </span>
          </div>
          <ProgressBar className="mt-2" value={milestoneProgress} />
          <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
            {[10, 20, 30, 50, 100].map((m) => (
              <div key={m} className={`rounded-lg px-2 py-1 ${referralCount >= m ? "bg-neon-500/20 text-neon-400" : "bg-white/5 text-slate-500"}`}>
                {m}
                <br />
                <span className="text-[10px]">
                  {m === 10 ? "50" : m === 20 ? "100" : m === 30 ? "150" : m === 50 ? "250" : "500"} PKR
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Your latest wallet activity</p>
          </div>
          <Link href="/wallet" className="text-xs font-semibold text-neon-400 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-5">
          {txs.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-7 w-7" />}
              title="No transactions yet"
              hint="Start a mining cycle or make a deposit to see activity here."
            />
          ) : (
            <DataTable head={["Type", "Method", "Amount", "Status", "Date"]}>
              {txs.map((tx) => {
                const negative = tx.type === "withdraw" || tx.type === "plan";
                return (
                  <tr key={tx.id} className="transition hover:bg-white/3">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6">
                          {tx.type === "mining" ? (
                            <Pickaxe className="h-4 w-4 text-neon-400" />
                          ) : tx.type === "referral" ? (
                            <Users className="h-4 w-4 text-violet-300" />
                          ) : tx.type === "task" ? (
                            <Gift className="h-4 w-4 text-amber-300" />
                          ) : (
                            <Wallet className="h-4 w-4 text-aqua-400" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {tx.type} {/* ✅ Directly show type, no TX_LABELS */}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{tx.method || "—"}</td>
                    <td
                      className={`px-3 py-3 font-display text-sm font-bold ${negative ? "text-rose-300" : "text-neon-400"}`}
                    >
                      {negative ? "-" : "+"}
                      {pkr(tx.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={tx.status} />
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(tx.createdAt)}</td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
