import { Clock3, Info, ShieldCheck } from "lucide-react";
import { DepositForm } from "@/components/forms";
import { DataTable, EmptyState, GlassCard, StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTransactions, getWalletTotals } from "@/lib/data";
import { dateLabel, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deposit — MineX Pro" };

export default async function DepositPage() {
  const user = await requireUser();
  const [deposits, totals] = await Promise.all([
    getTransactions(user.id, ["deposit"], 15),
    getWalletTotals(user.id),
  ]);
  const pending = deposits.filter((d) => d.status === "pending");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Deposit funds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manual deposits are verified by our team. Upload your payment proof and we'll credit your
          wallet within <span className="text-neon-400 font-semibold">5-10 minutes</span>.
        </p>
      </div>

      {pending.length ? (
        <GlassCard className="border-amber-400/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15">
              <Clock3 className="h-5 w-5 text-amber-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">
                {pending.length} deposit{pending.length > 1 ? "s" : ""} pending approval
              </p>
              <p className="text-xs text-amber-200/70">
                Total {pkr(pending.reduce((a, p) => a + Number(p.amount), 0))} awaiting admin review.
              </p>
            </div>
            <StatusPill status="pending" />
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <GlassCard glow="green" className="p-5 sm:p-7">
          <h2 className="font-display text-lg font-bold text-white">Manual deposit</h2>
          <p className="mt-1 text-xs text-slate-500">Minimum deposit 100 PKR • Maximum 5,000 PKR</p>
          <div className="mt-6">
            <DepositForm />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-neon-400" />
              <div>
                <h3 className="font-display text-base font-bold text-white">Deposit checklist</h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li>1. Choose your payment method and copy the account details.</li>
                  <li>2. Send the exact amount from your Easypaisa, JazzCash or Bank.</li>
                  <li>3. Enter the transaction ID and upload a clear screenshot.</li>
                  <li>4. Submit — an admin reviews and credits your balance <span className="text-neon-400 font-semibold">within 5-10 minutes</span>.</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total deposited</p>
              <Info className="h-4 w-4 text-slate-600" />
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-gradient">
              {pkr(totals.deposited)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Current wallet balance {pkr(user.balance)}
            </p>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">Deposit history</h2>
        <div className="mt-5">
          {deposits.length === 0 ? (
            <EmptyState title="No deposits yet" hint="Your submitted deposits will be listed here." />
          ) : (
            <DataTable head={["Ref", "Method", "Reference", "Amount", "Status", "Date"]}>
              {deposits.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">
                    #{String(tx.id).padStart(5, "0")}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-white">{tx.method}</td>
                  <td className="px-3 py-3 max-w-[160px] truncate font-mono text-[11px] text-slate-400">
                    {tx.reference || "—"}
                  </td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-neon-400">
                    {pkr(tx.amount)}
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