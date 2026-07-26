import { AlertTriangle, Clock3, ShieldCheck, Wallet } from "lucide-react";
import { WithdrawForm } from "@/components/forms";
import { DataTable, EmptyState, GlassCard, StatCard, StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTransactions, getWalletTotals } from "@/lib/data";
import { dateLabel, n, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Withdraw — MineX Pro" };

export default async function WithdrawPage() {
  const user = await requireUser();
  const [withdrawals, totals] = await Promise.all([
    getTransactions(user.id, ["withdraw"], 15),
    getWalletTotals(user.id),
  ]);
  const pending = withdrawals.filter((w) => w.status === "pending");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Withdraw funds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Request a payout to your Easypaisa, JazzCash or Bank account.
          <span className="text-neon-400 font-semibold"> Easypaisa/JazzCash: 10-60 minutes</span> •
          <span className="text-aqua-400 font-semibold"> Bank Transfer: 2-4 hours</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={pkr(user.balance)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard
          label="Pending payouts"
          value={pkr(pending.reduce((a, p) => a + n(p.amount), 0))}
          hint={`${pending.length} request${pending.length === 1 ? "" : "s"}`}
          icon={<Clock3 className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard label="Total withdrawn" value={pkr(totals.withdrawn)} icon={<ShieldCheck className="h-5 w-5" />} accent="cyan" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <GlassCard glow="cyan" className="p-5 sm:p-7">
          <h2 className="font-display text-lg font-bold text-white">New withdrawal request</h2>
          <p className="mt-1 text-xs text-slate-500">
            Minimum 300 PKR • Maximum 10,000 PKR • 2% processing fee • KYC required
          </p>
          <div className="mt-6">
            <WithdrawForm balance={user.balance} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          {user.kycStatus !== "verified" ? (
            <GlassCard className="border-amber-400/30 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <h3 className="font-display text-base font-bold text-white">KYC Required</h3>
                  <p className="mt-1.5 text-xs text-slate-400">
                    You must complete KYC verification before making a withdrawal.
                    Verify your identity from the Profile page to unlock withdrawals.
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="p-5">
            <h3 className="font-display text-base font-bold text-white">Payout policy</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>• Requested amounts are deducted from your balance immediately and held.</li>
              <li>• Rejected requests are refunded in full, instantly.</li>
              <li>• <span className="text-neon-400 font-semibold">Easypaisa/JazzCash:</span> settles in <span className="text-white">10–60 minutes</span> after admin approval.</li>
              <li>• <span className="text-aqua-400 font-semibold">Bank Transfer:</span> settles in <span className="text-white">2–4 hours</span> after admin approval.</li>
              <li>• KYC verification is mandatory before first withdrawal.</li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">Withdrawal history</h2>
        <div className="mt-5">
          {withdrawals.length === 0 ? (
            <EmptyState title="No withdrawals yet" hint="Your payout requests will appear here." />
          ) : (
            <DataTable head={["Ref", "Method", "Destination", "Amount", "Status", "Date"]}>
              {withdrawals.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">
                    #{String(tx.id).padStart(5, "0")}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-white">{tx.method}</td>
                  <td className="px-3 py-3 max-w-[180px] truncate font-mono text-[11px] text-slate-400">
                    {tx.address || "—"}
                  </td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-rose-300">
                    -{pkr(tx.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={tx.status} />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(tx.createdAt)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </GlassCard>
    </div>
  );
}