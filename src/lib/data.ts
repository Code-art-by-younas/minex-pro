import "server-only";
import { and, asc, count, desc, eq, gt, inArray, isNull, or, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import {
  miningSessions,
  notifications,
  plans,
  referralCommissions,
  taskCompletions,
  tasks,
  transactions,
  users,
  type MiningSession,
  type Plan,
  type Task,
  type Transaction,
  type User,
} from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { n } from "@/lib/utils";

export async function getPlans(includeInactive = false): Promise<Plan[]> {
  await ensureSeeded();
  const rows = await db.select().from(plans).orderBy(asc(plans.tier));
  return includeInactive ? rows : rows.filter((p) => p.active);
}

export async function getPlanById(id: number | null): Promise<Plan | null> {
  if (!id) return null;
  const rows = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const rows = await db.select().from(plans).where(eq(plans.slug, slug)).limit(1);
  return rows[0] ?? null;
}

// ✅ Retry logic added for transient connection errors
export async function getActiveSession(userId: number): Promise<MiningSession | null> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const rows = await db
        .select()
        .from(miningSessions)
        .where(
          and(
            eq(miningSessions.userId, userId),
            inArray(miningSessions.status, ["running", "claimable"])
          )
        )
        .orderBy(desc(miningSessions.startedAt))
        .limit(1);

      return rows[0] ?? null;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Mining query attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1000ms, 1500ms
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  console.error('❌ All mining query attempts failed:', lastError);
  return null; // Return null instead of throwing – page will show "No active cycle"
}

export async function getMiningHistory(userId: number, limit = 12): Promise<MiningSession[]> {
  return db
    .select()
    .from(miningSessions)
    .where(eq(miningSessions.userId, userId))
    .orderBy(desc(miningSessions.startedAt))
    .limit(limit);
}

export async function getTransactions(
  userId: number,
  types?: string[],
  limit = 20,
): Promise<Transaction[]> {
  const where = types?.length
    ? and(eq(transactions.userId, userId), inArray(transactions.type, types))
    : eq(transactions.userId, userId);
  return db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export type WalletTotals = {
  deposited: number;
  withdrawn: number;
  earned: number;
  pending: number;
};

export async function getWalletTotals(userId: number): Promise<WalletTotals> {
  const rows = await db
    .select({
      type: transactions.type,
      status: transactions.status,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.type, transactions.status);

  const totals: WalletTotals = { deposited: 0, withdrawn: 0, earned: 0, pending: 0 };
  for (const row of rows) {
    const amount = n(row.total);
    const done = row.status === "approved" || row.status === "completed";
    if (row.type === "deposit" && done) totals.deposited += amount;
    if (row.type === "withdraw" && done) totals.withdrawn += amount;
    if (["mining", "referral", "task", "bonus"].includes(row.type) && done) totals.earned += amount;
    if (row.status === "pending") totals.pending += amount;
  }
  return totals;
}

export type ReferralStats = {
  team: Array<{ id: number; name: string; email: string; createdAt: Date; planId: number | null }>;
  commissions: Array<{
    id: number;
    amount: string;
    level: number;
    source: string;
    createdAt: Date;
    refereeName: string | null;
  }>;
  totalEarned: number;
  activeCount: number;
};

export async function getReferralStats(userId: number): Promise<ReferralStats> {
  const team = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      planId: users.planId,
    })
    .from(users)
    .where(eq(users.referredBy, userId))
    .orderBy(desc(users.createdAt))
    .limit(50);

  const commissions = await db
    .select({
      id: referralCommissions.id,
      amount: referralCommissions.amount,
      level: referralCommissions.level,
      source: referralCommissions.source,
      createdAt: referralCommissions.createdAt,
      refereeName: users.name,
    })
    .from(referralCommissions)
    .leftJoin(users, eq(users.id, referralCommissions.refereeId))
    .where(eq(referralCommissions.referrerId, userId))
    .orderBy(desc(referralCommissions.createdAt))
    .limit(25);

  const totalEarned = commissions.reduce((acc, c) => acc + n(c.amount), 0);
  const activeCount = team.filter((t) => t.planId).length;
  return { team, commissions, totalEarned, activeCount };
}

export type TaskWithState = Task & { available: boolean; lastCompleted: Date | null; done: number };

export async function getTasksWithState(userId: number): Promise<TaskWithState[]> {
  await ensureSeeded();
  const rows = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
  const completions = await db
    .select()
    .from(taskCompletions)
    .where(eq(taskCompletions.userId, userId))
    .orderBy(desc(taskCompletions.completedAt));

  return rows
    .filter((t) => t.active)
    .map((task) => {
      const mine = completions.filter((c) => c.taskId === task.id);
      const last = mine[0]?.completedAt ?? null;
      let available = true;
      if (task.cooldownHours === 0) available = mine.length === 0;
      else if (last) available = Date.now() - new Date(last).getTime() >= task.cooldownHours * 3_600_000;
      return { ...task, available, lastCompleted: last, done: mine.length };
    });
}

export async function getNotifications(userId: number, limit = 8) {
  return db
    .select()
    .from(notifications)
    .where(or(eq(notifications.userId, userId), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getEarningsSeries(userId: number): Promise<number[]> {
  const rows = await db
    .select({ amount: transactions.amount, createdAt: transactions.createdAt })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        inArray(transactions.type, ["mining", "referral", "task", "bonus"]),
      ),
    )
    .orderBy(desc(transactions.createdAt))
    .limit(300);

  const days = Array.from({ length: 14 }, () => 0);
  const now = Date.now();
  for (const row of rows) {
    const diff = Math.floor((now - new Date(row.createdAt).getTime()) / 86_400_000);
    if (diff >= 0 && diff < 14) days[13 - diff] += n(row.amount);
  }
  return days;
}

export type AdminSnapshot = {
  userCount: number;
  activeMiners: number;
  pendingDeposits: Transaction[];
  pendingWithdrawals: Transaction[];
  recentUsers: User[];
  allUsers: User[];
  totals: {
    deposits: number;
    withdrawals: number;
    payouts: number;
    pendingCount: number;
    volume: number;
  };
  planStats: Array<{ name: string; subscribers: number; price: string }>;
  recentTx: Array<Transaction & { userName: string | null }>;
  notificationFeed: Array<{ id: number; title: string; body: string; createdAt: Date }>;
};

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  await ensureSeeded();
  const [userCountRow] = await db.select({ value: count() }).from(users);
  const [minerRow] = await db
    .select({ value: count() })
    .from(miningSessions)
    .where(and(eq(miningSessions.status, "running"), gt(miningSessions.endsAt, new Date())));

  const pendingDeposits = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.type, "deposit"), eq(transactions.status, "pending")))
    .orderBy(desc(transactions.createdAt))
    .limit(25);

  const pendingWithdrawals = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.type, "withdraw"), eq(transactions.status, "pending")))
    .orderBy(desc(transactions.createdAt))
    .limit(25);

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(60);

  const totalsRows = await db
    .select({
      type: transactions.type,
      status: transactions.status,
      total: sum(transactions.amount).mapWith(Number),
      c: count(),
    })
    .from(transactions)
    .groupBy(transactions.type, transactions.status);

  const totals = { deposits: 0, withdrawals: 0, payouts: 0, pendingCount: 0, volume: 0 };
  for (const row of totalsRows) {
    const amount = n(row.total);
    totals.volume += amount;
    const done = row.status === "approved" || row.status === "completed";
    if (row.type === "deposit" && done) totals.deposits += amount;
    if (row.type === "withdraw" && done) totals.withdrawals += amount;
    if (["mining", "referral", "task", "bonus"].includes(row.type) && done) totals.payouts += amount;
    if (row.status === "pending") totals.pendingCount += Number(row.c);
  }

  const planRows = await db.select().from(plans).orderBy(asc(plans.tier));
  const subs = await db
    .select({ planId: users.planId, value: count() })
    .from(users)
    .groupBy(users.planId);

  const planStats = planRows.map((p) => ({
    name: p.name,
    price: p.price,
    subscribers: Number(subs.find((s) => s.planId === p.id)?.value ?? 0),
  }));

  const recentTx = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      status: transactions.status,
      method: transactions.method,
      address: transactions.address,
      reference: transactions.reference,
      screenshot: transactions.screenshot,
      note: transactions.note,
      adminNote: transactions.adminNote,
      createdAt: transactions.createdAt,
      processedAt: transactions.processedAt,
      userName: users.name,
    })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .orderBy(desc(transactions.createdAt))
    .limit(20);

  const notificationFeed = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      body: notifications.body,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  return {
    userCount: Number(userCountRow?.value ?? 0),
    activeMiners: Number(minerRow?.value ?? 0),
    pendingDeposits,
    pendingWithdrawals,
    recentUsers: allUsers.slice(0, 8),
    allUsers,
    totals,
    planStats,
    recentTx,
    notificationFeed,
  };
}

export async function getPlatformStats() {
  await ensureSeeded();
  const [userRow] = await db.select({ value: count() }).from(users);
  const [payoutRow] = await db
    .select({ value: sum(transactions.amount).mapWith(Number) })
    .from(transactions)
    .where(inArray(transactions.type, ["mining", "referral", "task"]));
  const [sessionRow] = await db.select({ value: count() }).from(miningSessions);
  const [hashRow] = await db
    .select({ value: sum(users.miningPower).mapWith(Number) })
    .from(users);

  return {
    miners: 48210 + Number(userRow?.value ?? 0) * 7,
    paid: 12_480_000 + n(payoutRow?.value),
    sessions: 1_942_800 + Number(sessionRow?.value ?? 0),
    hashrate: 842_500 + n(hashRow?.value),
  };
}

export async function countPendingForUser(userId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "pending")));
  return Number(row?.value ?? 0);
}

export async function refreshExpiredPlan(user: User): Promise<void> {
  if (user.planExpiresAt && new Date(user.planExpiresAt).getTime() < Date.now()) {
    await db
      .update(users)
      .set({ planId: null, planExpiresAt: null, miningPower: "5" })
      .where(eq(users.id, user.id));
  }
}

export async function markSessionsClaimable(userId: number): Promise<void> {
  await db
    .update(miningSessions)
    .set({ status: "claimable" })
    .where(
      and(
        eq(miningSessions.userId, userId),
        eq(miningSessions.status, "running"),
        sql`${miningSessions.endsAt} <= now()`,
      ),
    );
}