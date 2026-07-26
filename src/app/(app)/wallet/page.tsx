import {
  ArrowDownToLine,
  ArrowUpRight,
  Coins,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import { AreaChart, CountUp, Donut } from "@/components/charts";
import {
  ButtonLink,
  DataTable,
  EmptyState,
  GlassCard,
  StatCard,
  StatusPill,
} from "@/components/ui";
import type { Transaction } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getEarningsSeries, getTransactions, getWalletTotals } from "@/lib/data";
import { dateLabel, n, pkr, TX_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet — MineX Pro" };

function TxTable({ rows, negative }: { rows: Transaction[]; negative?: boolean }) {
  if (!rows.length)
    return <EmptyState title="Nothing here yet" hint="Transactions will appear as soon as they happen." />;
  return (
    <DataTable head={["Ref", "Detail", "Amount", "Status", "Date"]}>
      {rows.map((tx) => (
        <tr key={tx.id} className="transition hover:bg-white/3">
          <td className="px-3 py-3 font-mono text-xs text-slate-500">#{String(tx.id).padStart(5, "0")}</td>
          <td className="px-3 py-3">
            <p className="text-sm font-semibold text-white">{TX_LABELS[tx.type] ?? tx.type}</p>
            <p className="text-[11px] text-slate-500">{tx.method || tx.note || "—"}</p>
          </td>
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
      ))}
    </DataTable>
  );
}

export default async function WalletPage() {
  const user = await requireUser();
  const [deposits, withdrawals, earnings, totals, series] = await Promise.all([
    getTransactions(user.id, ["deposit"], 20),
    getTransactions(user.id, ["withdraw"], 20),
    getTransactions(user.id, ["mining", "referral", "task", "bonus", "adjustment"], 25),
    getWalletTotals(user.id),
    getEarningsSeries(user.id),
  ]);

  const segments = [
    { label: "Mining", value: earnings.filter((t) => t.type === "mining").reduce((a, t) => a + n(t.amount), 0), color: "#10f28c" },
    { label: "Referral", value: earnings.filter((t) => t.type === "referral").reduce((a, t) => a + n(t.amount), 0), color: "#14c8f5" },
    { label: "Tasks", value: earnings.filter((t) => t.type === "task").reduce((a, t) => a + n(t.amount), 0), color: "#a78bfa" },
    { label: "Bonuses", value: earnings.filter((t) => ["bonus", "adjustment"].includes(t.type)).reduce((a, t) => a + n(t.amount), 0), color: "#fbbf24" },
  ];
  const hasSegments = segments.some((s) => s.value > 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <GlassCard glow="green" className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
        <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-neon-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Total wallet balance</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-gradient">
              <CountUp value={n(user.balance)} prefix="PKR " decimals={2} />
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-neon-400" />
              Lifetime earned {pkr(user.totalEarned)} • Pending {pkr(totals.pending)}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <ButtonLink href="/deposit">
                <ArrowDownToLine className="h-4 w-4" /> Deposit funds
              </ButtonLink>
              <ButtonLink href="/withdraw" variant="ghost">
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </ButtonLink>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-ink-950/60 p-5">
            <p className="text-xs font-semibold text-white">Earnings flow (14 days)</p>
            <div className="mt-4">
              <AreaChart data={series} height={120} />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total deposited" value={pkr(totals.deposited)} icon={<ArrowDownToLine className="h-5 w-5" />} accent="cyan" />
        <StatCard label="Total withdrawn" value={pkr(totals.withdrawn)} icon={<ArrowUpRight className="h-5 w-5" />} accent="amber" />
        <StatCard label="Total earned" value={pkr(totals.earned)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Referral income" value={pkr(user.referralEarnings)} icon={<Coins className="h-5 w-5" />} accent="violet" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Income breakdown</h2>
          <p className="text-xs text-slate-500">Where your earnings come from</p>
          <div className="mt-6">
            {hasSegments ? (
              <Donut segments={segments} />
            ) : (
              <EmptyState icon={<PiggyBank className="h-7 w-7" />} title="No earnings yet" hint="Claim a mining cycle to get started." />
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-neon-400" />
            <h2 className="font-display text-lg font-bold text-white">Earnings history</h2>
          </div>
          <div className="mt-5">
            <TxTable rows={earnings} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Deposit history</h2>
            <ButtonLink href="/deposit" variant="subtle" size="sm">
              New deposit
            </ButtonLink>
          </div>
          <div className="mt-5">
            <TxTable rows={deposits} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Withdraw history</h2>
            <ButtonLink href="/withdraw" variant="subtle" size="sm">
              New withdrawal
            </ButtonLink>
          </div>
          <div className="mt-5">
            <TxTable rows={withdrawals} negative />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}