import Link from "next/link";
import { asc, desc, eq, and, count, sum, sql } from "drizzle-orm";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  FileText,
  Gauge,
  Layers,
  ListChecks,
  ShieldAlert,
  Users,
  XCircle,
  Shield,
  Eye,
  Ban,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { AreaChart, BarChart, Donut } from "@/components/charts";
import { ActionButton } from "@/components/action-button";
import {
  broadcastAction,
  reviewDepositAction,
  reviewWithdrawalAction,
  togglePlanAction,
  toggleTaskAction,
  updatePlanPriceAction,
  updateTaskRewardAction,
  updateUserAction,
  reviewKYCAction,
} from "@/app/actions/admin";
import { DataTable, EmptyState, GlassCard, StatCard, StatusPill } from "@/components/ui";
import { db } from "@/db";
import { plans as plansTable, tasks as tasksTable, users as usersTable, transactions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getAdminSnapshot } from "@/lib/data";
import { cn, dateLabel, dayLabel, hashRate, initials, n, pkr, TX_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Console — MineX Pro" };

const TABS = [
  { id: "overview", label: "Analytics", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "kyc", label: "KYC Verification", icon: Shield },
  { id: "deposits", label: "Deposits", icon: ArrowDownToLine },
  { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight },
  { id: "plans", label: "Plans", icon: Layers },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "reports", label: "Reports", icon: FileText },
];

// Risk Score Badge Component
function RiskBadge({ score }: { score: number }) {
  if (score >= 70) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-400"><AlertTriangle className="h-3 w-3" /> High</span>;
  } else if (score >= 40) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-400"><AlertTriangle className="h-3 w-3" /> Medium</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400"><CheckCircle2 className="h-3 w-3" /> Low</span>;
}

// KYC Status Badge
function KYCStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "verified":
      return <StatusPill status="approved" />;
    case "pending":
      return <StatusPill status="pending" />;
    case "rejected":
      return <StatusPill status="suspended" />;
    default:
      return <StatusPill status="inactive" />;
  }
}

async function getKYCPendingUsers() {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.kycStatus, "pending"))
    .orderBy(desc(usersTable.createdAt));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { tab = "overview" } = await searchParams;
  const snap = await getAdminSnapshot();
  const allPlans = await db.select().from(plansTable).orderBy(asc(plansTable.tier));
  const allTasks = await db.select().from(tasksTable).orderBy(asc(tasksTable.sortOrder));
  const pendingKYC = await getKYCPendingUsers();

  // Get user count for risk stats
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);

  let highRiskUsers = { count: 0 };
  try {
    const result = await db
      .select({ count: count() })
      .from(usersTable)
      .where(sql`${usersTable.riskScore} >= 70`);
    highRiskUsers = result[0] || { count: 0 };
  } catch {
    highRiskUsers = { count: 0 };
  }

  const revenueSeries = Array.from({ length: 14 }, (_, i) => {
    const day = Date.now() - (13 - i) * 86_400_000;
    return snap.recentTx
      .filter(
        (t) =>
          new Date(t.createdAt).toDateString() === new Date(day).toDateString() &&
          ["deposit", "plan"].includes(t.type),
      )
      .reduce((a, t) => a + n(t.amount), 0);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
            <ShieldAlert className="h-3 w-3" /> Administrator
          </span>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Approve KYC, manage users, tune plans and broadcast announcements.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300">
            {snap.totals.pendingCount} pending
          </span>
          <span className="rounded-xl border border-neon-500/30 bg-neon-500/10 px-3.5 py-2 text-xs font-bold text-neon-400">
            {snap.activeMiners} mining
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/admin?tab=${t.id}`}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition",
                  active
                    ? "btn-primary"
                    : "border border-white/10 bg-white/3 text-slate-400 hover:border-aqua-400/40 hover:text-white",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {tab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total users" value={String(snap.userCount)} hint={`${snap.activeMiners} mining now`} icon={<Users className="h-5 w-5" />} />
            <StatCard label="Approved deposits" value={pkr(snap.totals.deposits)} icon={<ArrowDownToLine className="h-5 w-5" />} accent="cyan" />
            <StatCard label="Paid withdrawals" value={pkr(snap.totals.withdrawals)} icon={<ArrowUpRight className="h-5 w-5" />} accent="amber" />
            <StatCard label="Reward payouts" value={pkr(snap.totals.payouts)} icon={<Activity className="h-5 w-5" />} accent="violet" />
            <StatCard label="Pending KYC" value={String(pendingKYC.length)} hint={`${highRiskUsers?.count || 0} high risk`} icon={<Shield className="h-5 w-5" />} accent="amber" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <GlassCard className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Revenue flow (14 days)</h2>
              <p className="text-xs text-slate-500">Deposits and plan purchases</p>
              <div className="mt-6">
                <AreaChart data={revenueSeries} height={180} />
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Plan distribution</h2>
              <div className="mt-6">
                <Donut
                  segments={snap.planStats.slice(0, 5).map((p, i) => ({
                    label: p.name,
                    value: Math.max(p.subscribers, 0.0001),
                    color: ["#10f28c", "#14c8f5", "#a78bfa", "#fbbf24", "#f472b6"][i] ?? "#64748b",
                  }))}
                />
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <GlassCard className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Subscribers per plan</h2>
              <div className="mt-6">
                <BarChart
                  data={snap.planStats.map((p) => p.subscribers)}
                  labels={snap.planStats.map((p) => p.name.slice(0, 4))}
                  height={140}
                />
              </div>
            </GlassCard>
            <GlassCard className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-white">Newest users</h2>
              <div className="mt-4 space-y-2.5">
                {snap.recentUsers.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-500 to-aqua-500 text-xs font-bold text-ink-950">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{u.email}</p>
                    </div>
                    <span className="text-xs font-bold text-neon-400">{pkr(u.balance)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}

      {tab === "users" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">User management</h2>
          <p className="text-xs text-slate-500">{snap.allUsers.length} accounts</p>
          <div className="mt-5">
            <DataTable head={["User", "Balance", "Power", "KYC", "Risk", "Status", "Joined", "Actions"]}>
              {snap.allUsers.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-[10px] font-bold text-slate-300">
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                        <p className="truncate text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-neon-400">{pkr(u.balance)}</td>
                  <td className="px-3 py-3 text-xs text-aqua-400">{hashRate(u.miningPower)}</td>
                  <td className="px-3 py-3">
                    <KYCStatusBadge status={u.kycStatus || "not_submitted"} />
                  </td>
                  <td className="px-3 py-3">
                    <RiskBadge score={u.riskScore || 0} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={u.status} />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dayLabel(u.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/admin/users/${u.id}`}>
                        <button className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                      {u.role !== "admin" && (
                        <>
                          <ActionButton
                            action={updateUserAction}
                            fields={{ id: u.id, op: "toggle-status" }}
                            size="sm"
                            variant={u.status === "active" ? "danger" : "success"}
                            showFeedback={false}
                            refreshOnSuccess
                            pendingLabel="…"
                          >
                            {u.status === "active" ? "Suspend" : "Activate"}
                          </ActionButton>
                          {u.kycStatus !== "verified" ? (
                            <ActionButton
                              action={updateUserAction}
                              fields={{ id: u.id, op: "verify-kyc" }}
                              size="sm"
                              variant="subtle"
                              showFeedback={false}
                              refreshOnSuccess
                              pendingLabel="…"
                            >
                              Verify KYC
                            </ActionButton>
                          ) : null}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </GlassCard>
      ) : null}

      {tab === "kyc" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">KYC Verification</h2>
          <p className="text-xs text-slate-500">{pendingKYC.length} pending verification requests</p>
          <div className="mt-5 space-y-4">
            {pendingKYC.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="All clear!" hint="No pending KYC requests." />
            ) : (
              pendingKYC.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-lg font-bold text-white">{user.full_name || user.name}</span>
                        <KYCStatusBadge status={user.kycStatus || "pending"} />
                        <RiskBadge score={user.riskScore || 0} />
                      </div>
                      <div className="mt-3 grid gap-1.5 text-sm text-slate-400 sm:grid-cols-2">
                        <p>Email: <span className="text-slate-200">{user.email}</span></p>
                        <p>Phone: <span className="text-slate-200">{user.phone || "N/A"}</span></p>
                        <p>CNIC: <span className="text-slate-200">{user.cnicNumber || "Not provided"}</span></p>
                        <p>DOB: <span className="text-slate-200">{user.dob || "Not provided"}</span></p>
                        <p className="col-span-2">Payment Account: <span className="text-slate-200">{user.paymentAccount || "Not provided"}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      <ActionButton
                        action={reviewKYCAction}
                        fields={{ userId: user.id, decision: "approve" }}
                        size="sm"
                        refreshOnSuccess
                        showFeedback={false}
                        pendingLabel="Approving…"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve KYC
                      </ActionButton>
                      <ActionButton
                        action={reviewKYCAction}
                        fields={{ userId: user.id, decision: "reject" }}
                        size="sm"
                        variant="danger"
                        refreshOnSuccess
                        showFeedback={false}
                        pendingLabel="Rejecting…"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </ActionButton>
                      <ActionButton
                        action={reviewKYCAction}
                        fields={{ userId: user.id, decision: "reupload" }}
                        size="sm"
                        variant="subtle"
                        refreshOnSuccess
                        showFeedback={false}
                        pendingLabel="Requesting…"
                      >
                        <FileText className="h-4 w-4" /> Request Update
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      ) : null}

      {tab === "deposits" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Deposit approvals</h2>
          <p className="text-xs text-slate-500">{snap.pendingDeposits.length} awaiting review</p>
          <div className="mt-5 space-y-4">
            {snap.pendingDeposits.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No pending deposits" hint="All caught up." />
            ) : (
              snap.pendingDeposits.map((tx) => (
                <div key={tx.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    {tx.screenshot ? (
                      <img
                        src={tx.screenshot}
                        alt="Payment proof"
                        className="h-32 w-full max-w-[200px] rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-32 w-full max-w-[200px] items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-slate-600">
                        No proof
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{String(tx.id).padStart(5, "0")}</span>
                        <StatusPill status={tx.status} />
                        <span className="font-display text-xl font-extrabold text-neon-400">{pkr(tx.amount)}</span>
                      </div>
                      <div className="mt-2 grid gap-1.5 text-xs text-slate-400 sm:grid-cols-2">
                        <p>Method: <span className="text-slate-200">{tx.method}</span></p>
                        <p>User: <span className="text-slate-200">#{tx.userId}</span></p>
                        <p className="truncate">Reference: <span className="font-mono text-slate-200">{tx.reference}</span></p>
                        <p>Submitted: <span className="text-slate-200">{dateLabel(tx.createdAt)}</span></p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <ActionButton
                          action={reviewDepositAction}
                          fields={{ id: tx.id, decision: "approve" }}
                          size="sm"
                          refreshOnSuccess
                          showFeedback={false}
                          pendingLabel="Approving…"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve & credit
                        </ActionButton>
                        <ActionButton
                          action={reviewDepositAction}
                          fields={{ id: tx.id, decision: "reject" }}
                          size="sm"
                          variant="danger"
                          refreshOnSuccess
                          showFeedback={false}
                          pendingLabel="Rejecting…"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      ) : null}

      {tab === "withdrawals" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Withdrawal approvals</h2>
          <p className="text-xs text-slate-500">{snap.pendingWithdrawals.length} awaiting review</p>
          <div className="mt-5">
            {snap.pendingWithdrawals.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No pending withdrawals" hint="Queue is empty." />
            ) : (
              <DataTable head={["Ref", "User", "Method", "Destination", "Amount", "Requested", "Actions"]}>
                {snap.pendingWithdrawals.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-white/3">
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">#{String(tx.id).padStart(5, "0")}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">#{tx.userId}</td>
                    <td className="px-3 py-3 text-xs text-slate-300">{tx.method}</td>
                    <td className="px-3 py-3 max-w-[180px] truncate font-mono text-[11px] text-slate-400">{tx.address}</td>
                    <td className="px-3 py-3 font-display text-sm font-bold text-rose-300">-{pkr(tx.amount)}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(tx.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <ActionButton
                          action={reviewWithdrawalAction}
                          fields={{ id: tx.id, decision: "approve" }}
                          size="sm"
                          refreshOnSuccess
                          showFeedback={false}
                          pendingLabel="…"
                        >
                          Pay out
                        </ActionButton>
                        <ActionButton
                          action={reviewWithdrawalAction}
                          fields={{ id: tx.id, decision: "reject" }}
                          size="sm"
                          variant="danger"
                          refreshOnSuccess
                          showFeedback={false}
                          pendingLabel="…"
                        >
                          Refund
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </GlassCard>
      ) : null}

      {tab === "plans" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Plan management</h2>
          <p className="text-xs text-slate-500">Adjust pricing, daily profit and availability</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allPlans.map((plan) => {
              const subs = snap.planStats.find((p) => p.name === plan.name)?.subscribers ?? 0;
              return (
                <div key={plan.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-base font-bold text-white">{plan.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {hashRate(plan.speed)} • {plan.validityDays}d • {plan.sessionHours}h cycles
                      </p>
                    </div>
                    <StatusPill status={plan.active ? "active" : "suspended"} />
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-950/50 px-3 py-2 text-xs">
                    <span className="text-slate-500">Subscribers</span>
                    <span className="font-bold text-neon-400">{subs}</span>
                  </div>
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updatePlanPriceAction({ ok: false }, formData);
                    }}
                    className="mt-3 space-y-2"
                  >
                    <input type="hidden" name="id" value={plan.id} />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Price</span>
                        <input name="price" type="number" step="0.01" defaultValue={n(plan.price)} className="field mt-1 py-2 text-xs" />
                      </label>
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Daily profit</span>
                        <input name="dailyProfit" type="number" step="0.0001" defaultValue={n(plan.dailyProfit)} className="field mt-1 py-2 text-xs" />
                      </label>
                    </div>
                    <button className="btn-ghost w-full rounded-xl py-2 text-xs font-bold text-white">
                      Save pricing
                    </button>
                  </form>
                  <div className="mt-2">
                    <ActionButton
                      action={togglePlanAction}
                      fields={{ id: plan.id }}
                      size="sm"
                      full
                      variant={plan.active ? "danger" : "success"}
                      showFeedback={false}
                      refreshOnSuccess
                      pendingLabel="…"
                    >
                      {plan.active ? "Disable plan" : "Enable plan"}
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      ) : null}

      {tab === "tasks" ? (
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Task management</h2>
          <p className="text-xs text-slate-500">Tune rewards and toggle availability</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold text-white">{task.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{task.description}</p>
                  </div>
                  <StatusPill status={task.active ? "active" : "suspended"} />
                </div>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await updateTaskRewardAction({ ok: false }, formData);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input type="hidden" name="id" value={task.id} />
                  <input name="reward" type="number" step="0.01" defaultValue={n(task.reward)} className="field py-2 text-xs" />
                  <button className="btn-ghost shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white">Save</button>
                </form>
                <div className="mt-2">
                  <ActionButton
                    action={toggleTaskAction}
                    fields={{ id: task.id }}
                    size="sm"
                    full
                    variant={task.active ? "danger" : "success"}
                    showFeedback={false}
                    refreshOnSuccess
                    pendingLabel="…"
                  >
                    {task.active ? "Disable task" : "Enable task"}
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {tab === "notifications" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <GlassCard glow="cyan" className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Broadcast notification</h2>
            <p className="text-xs text-slate-500">Sent to every user instantly</p>
            <form
              action={async (formData: FormData) => {
                "use server";
                await broadcastAction({ ok: false }, formData);
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="label">Title</label>
                <input name="title" className="field" placeholder="Network upgrade complete" required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea name="body" rows={4} className="field resize-none" placeholder="All mining cycles now settle 30% faster…" />
              </div>
              <div>
                <label className="label">Tone</label>
                <select name="tone" className="field">
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Critical</option>
                </select>
              </div>
              <button className="btn-primary w-full rounded-xl py-3 text-sm font-bold">Send broadcast</button>
            </form>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Recent notifications</h2>
            <div className="mt-5 space-y-2.5">
              {snap.notificationFeed.length === 0 ? (
                <EmptyState title="No notifications" hint="Broadcasts and system alerts appear here." />
              ) : (
                snap.notificationFeed.map((note) => (
                  <div key={note.id} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{note.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{note.body}</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-600">
                      {dateLabel(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      ) : null}

      {tab === "reports" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Gross volume" value={pkr(snap.totals.volume)} icon={<Gauge className="h-5 w-5" />} />
            <StatCard label="Net position" value={pkr(snap.totals.deposits - snap.totals.withdrawals)} icon={<BarChart3 className="h-5 w-5" />} accent="cyan" />
            <StatCard label="Reward liability" value={pkr(snap.totals.payouts)} icon={<Activity className="h-5 w-5" />} accent="violet" />
            <StatCard label="Pending items" value={String(snap.totals.pendingCount)} icon={<Bell className="h-5 w-5" />} accent="amber" />
          </div>
          <GlassCard className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Transaction ledger</h2>
            <p className="text-xs text-slate-500">Last 20 platform-wide movements</p>
            <div className="mt-5">
              <DataTable head={["Ref", "User", "Type", "Method", "Amount", "Status", "Date"]}>
                {snap.recentTx.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-white/3">
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">#{String(tx.id).padStart(5, "0")}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">{tx.userName ?? `#${tx.userId}`}</td>
                    <td className="px-3 py-3 text-xs text-slate-300">{TX_LABELS[tx.type] ?? tx.type}</td>
                    <td className="px-3 py-3 max-w-[160px] truncate text-xs text-slate-500">{tx.method || "—"}</td>
                    <td
                      className={cn(
                        "px-3 py-3 font-display text-sm font-bold",
                        ["withdraw", "plan"].includes(tx.type) ? "text-rose-300" : "text-neon-400",
                      )}
                    >
                      {pkr(tx.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={tx.status} />
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(tx.createdAt)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}