"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
  dailyCheckins,
  referralRewards,
  userPlans, // ✅ Added
} from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { getPlanById, getPlanBySlug } from "@/lib/data";
import { n } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";
import { checkAndClaimReferralRewards } from "@/lib/referral";

function revalidateApp() {
  for (const path of [
    "/dashboard",
    "/mining",
    "/wallet",
    "/plans",
    "/tasks",
    "/referral",
    "/profile",
    "/deposit",
    "/withdraw",
    "/admin",
  ]) {
    revalidatePath(path);
  }
}

const COMMISSION: Record<number, number> = { 1: 0.1, 2: 0.03 };

async function payReferral(userId: number, base: number, source: string) {
  let currentId: number | null = userId;
  for (let level = 1; level <= 2; level += 1) {
    const rows: Array<{ referredBy: number | null }> = await db
      .select({ referredBy: users.referredBy })
      .from(users)
      .where(eq(users.id, currentId))
      .limit(1);
    const parent = rows[0]?.referredBy ?? null;
    if (!parent) return;
    const amount = base * COMMISSION[level];
    if (amount > 0.0001) {
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
          referralEarnings: sql`${users.referralEarnings} + ${amount}`,
          totalEarned: sql`${users.totalEarned} + ${amount}`,
        })
        .where(eq(users.id, parent));
      await db.insert(referralCommissions).values({
        referrerId: parent,
        refereeId: userId,
        level,
        amount: amount.toFixed(4),
        source,
      });
      await db.insert(transactions).values({
        userId: parent,
        type: "referral",
        amount: amount.toFixed(4),
        status: "completed",
        method: `Level ${level} • ${source}`,
        note: "Referral commission",
        processedAt: new Date(),
      });
    }
    currentId = parent;
  }
}

// ============================================
// MINING ACTIONS
// ============================================

export async function startMiningAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const running = await db
    .select()
    .from(miningSessions)
    .where(
      and(eq(miningSessions.userId, user.id), inArray(miningSessions.status, ["running", "claimable"])),
    )
    .limit(1);
  if (running.length) return { ok: false, error: "A mining cycle is already active. Claim it first." };

  const plan = (await getPlanById(user.planId)) ?? (await getPlanBySlug("free"));
  if (!plan) return { ok: false, error: "No mining plan available." };
  if (user.planExpiresAt && new Date(user.planExpiresAt).getTime() < Date.now())
    return { ok: false, error: "Your plan has expired. Please upgrade to continue mining." };

  const hours = plan.sessionHours;
  const reward = (n(plan.dailyProfit) * hours) / 24;
  const now = new Date();

  await db.insert(miningSessions).values({
    userId: user.id,
    planName: plan.name,
    power: plan.speed,
    reward: reward.toFixed(4),
    status: "running",
    startedAt: now,
    endsAt: new Date(now.getTime() + hours * 3_600_000),
  });

  revalidateApp();
  return { ok: true, message: `Mining started — ${hours}h cycle at ${plan.speed} GH/s.` };
}

export async function claimRewardAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const rows = await db
    .select()
    .from(miningSessions)
    .where(and(eq(miningSessions.userId, user.id), inArray(miningSessions.status, ["running", "claimable"])))
    .orderBy(desc(miningSessions.startedAt))
    .limit(1);
  const session = rows[0];
  if (!session) return { ok: false, error: "No mining cycle to claim." };
  if (new Date(session.endsAt).getTime() > Date.now())
    return { ok: false, error: "Mining cycle is still running." };

  const reward = n(session.reward);
  const now = new Date();

  await db
    .update(miningSessions)
    .set({ status: "claimed", claimedAt: now })
    .where(eq(miningSessions.id, session.id));

  await db
    .update(users)
    .set({
      balance: sql`${users.balance} + ${reward}`,
      totalEarned: sql`${users.totalEarned} + ${reward}`,
    })
    .where(eq(users.id, user.id));

  await db.insert(transactions).values({
    userId: user.id,
    type: "mining",
    amount: reward.toFixed(4),
    status: "completed",
    method: `${session.planName} • ${session.power} GH/s`,
    note: "Mining cycle payout",
    processedAt: now,
  });

  await payReferral(user.id, reward, "mining");
  revalidateApp();
  return { ok: true, message: `Claimed ${reward.toFixed(4)} PKR to your wallet.` };
}

// ============================================
// PLAN ACTIONS ✅ UPDATED
// ============================================

export async function purchasePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const planId = Number(formData.get("planId"));
  const plan = await getPlanById(planId);
  if (!plan || !plan.active) return { ok: false, error: "Plan unavailable." };

  const price = n(plan.price);
  if (price > n(user.balance))
    return { ok: false, error: `Insufficient balance. Deposit at least ${(price - n(user.balance)).toFixed(2)} PKR.` };

  const now = new Date();

  // ✅ 1. User update
  await db
    .update(users)
    .set({
      balance: sql`${users.balance} - ${price}`,
      planId: plan.id,
      planStartedAt: now,
      planExpiresAt: new Date(now.getTime() + plan.validityDays * 86_400_000),
      miningPower: plan.speed,
    })
    .where(eq(users.id, user.id));

  // ✅ 2. Transaction record
  if (price > 0) {
    await db.insert(transactions).values({
      userId: user.id,
      type: "plan",
      amount: price.toFixed(4),
      status: "completed",
      method: plan.name,
      note: `${plan.validityDays} day contract activated`,
      processedAt: now,
    });
    await payReferral(user.id, price, "plan purchase");
  }

  // ✅ 3. userPlans table mein entry (NEW)
  const totalReturn = price + (n(plan.dailyProfit) * n(plan.validityDays));
  const planType = plan.slug.includes("monthly") ? "monthly" : "weekly";

  await db.insert(userPlans).values({
    userId: user.id,
    planId: plan.id,
    planType: planType,
    investedAmount: price.toFixed(2),
    expectedReturn: totalReturn.toFixed(2),
    dailyEarning: n(plan.dailyProfit).toFixed(2),
    startDate: now,
    endDate: new Date(now.getTime() + plan.validityDays * 86_400_000),
    status: "active",
  });

  // ✅ 4. Notification
  await db.insert(notifications).values({
    userId: user.id,
    title: `${plan.name} plan activated`,
    body: `Your hash power is now ${plan.speed} GH/s for ${plan.validityDays} days. Total return: ${totalReturn.toFixed(2)} PKR.`,
    tone: "success",
  });

  revalidateApp();
  return { ok: true, message: `${plan.name} activated. Head to the mining rig!` };
}

// ============================================
// DEPOSIT ACTIONS
// ============================================

export async function submitDepositAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const screenshot = String(formData.get("screenshot") ?? "");

  if (!Number.isFinite(amount) || amount < 100)
    return { ok: false, error: "Minimum deposit is 100 PKR." };
  if (amount > 5000) return { ok: false, error: "Maximum deposit is 5,000 PKR." };
  if (!method) return { ok: false, error: "Select a payment method." };
  if (reference.length < 4) return { ok: false, error: "Enter the transaction ID / reference." };
  if (!screenshot) return { ok: false, error: "Upload your payment screenshot." };
  if (screenshot.length > 2_400_000) return { ok: false, error: "Screenshot too large (max ~1.8MB)." };

  await db.insert(transactions).values({
    userId: user.id,
    type: "deposit",
    amount: amount.toFixed(4),
    status: "pending",
    method,
    reference,
    screenshot,
    note: "Manual deposit awaiting review",
  });

  revalidateApp();
  return { ok: true, message: "✅ Deposit submitted! Admin will review and credit your balance within 5-10 minutes." };
}

// ============================================
// WITHDRAWAL ACTIONS
// ============================================

export async function submitWithdrawAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!Number.isFinite(amount) || amount < 300)
    return { ok: false, error: "Minimum withdrawal is 300 PKR." };
  if (amount > 10000) return { ok: false, error: "Maximum withdrawal is 10,000 PKR." };
  if (!method) return { ok: false, error: "Select a payout method." };
  if (address.length < 8) return { ok: false, error: "Enter a valid wallet address / account." };
  if (amount > n(user.balance)) return { ok: false, error: "Insufficient wallet balance." };
  if (user.kycStatus !== "verified")
    return { ok: false, error: "KYC verification required for withdrawals. Please complete KYC first." };

  // Calculate 2% fee
  const fee = amount * 0.02;
  const netAmount = amount - fee;

  await db
    .update(users)
    .set({ balance: sql`${users.balance} - ${amount}` })
    .where(eq(users.id, user.id));

  await db.insert(transactions).values({
    userId: user.id,
    type: "withdraw",
    amount: amount.toFixed(4),
    status: "pending",
    method,
    address,
    note: `Withdrawal awaiting admin approval (Fee: ${fee.toFixed(2)} PKR)`,
  });

  revalidateApp();
  return { ok: true, message: `Withdrawal request submitted. Net amount: ${netAmount.toFixed(2)} PKR (fee: ${fee.toFixed(2)} PKR).` };
}

// ============================================
// TASK ACTIONS
// ============================================

export async function completeTaskAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const taskId = Number(formData.get("taskId"));
  const rows = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  const task = rows[0];
  if (!task || !task.active) return { ok: false, error: "Task unavailable." };

  const done = await db
    .select()
    .from(taskCompletions)
    .where(and(eq(taskCompletions.userId, user.id), eq(taskCompletions.taskId, task.id)))
    .orderBy(desc(taskCompletions.completedAt))
    .limit(1);

  const last = done[0]?.completedAt;
  if (task.cooldownHours === 0 && done.length)
    return { ok: false, error: "This task can only be completed once." };
  if (last && Date.now() - new Date(last).getTime() < task.cooldownHours * 3_600_000)
    return { ok: false, error: "Task is on cooldown. Come back later." };
  if (task.slug === "complete-kyc" && user.kycStatus === "not_submitted")
    return { ok: false, error: "Submit your KYC documents from the Profile page first." };

  const reward = n(task.reward);
  const now = new Date();

  await db.insert(taskCompletions).values({
    userId: user.id,
    taskId: task.id,
    reward: reward.toFixed(4),
    completedAt: now,
  });
  await db
    .update(users)
    .set({
      balance: sql`${users.balance} + ${reward}`,
      totalEarned: sql`${users.totalEarned} + ${reward}`,
    })
    .where(eq(users.id, user.id));
  await db.insert(transactions).values({
    userId: user.id,
    type: "task",
    amount: reward.toFixed(4),
    status: "completed",
    method: task.title,
    note: "Task reward",
    processedAt: now,
  });

  revalidateApp();
  return { ok: true, message: `+${reward.toFixed(2)} PKR credited for "${task.title}".` };
}

// ============================================
// PROFILE ACTIONS
// ============================================

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 3) return { ok: false, error: "Enter a valid name." };
  await db.update(users).set({ name, phone }).where(eq(users.id, user.id));
  revalidateApp();
  return { ok: true, message: "Profile updated successfully." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!verifyPassword(current, user.passwordHash))
    return { ok: false, error: "Current password is incorrect." };
  if (next.length < 8) return { ok: false, error: "New password must be 8+ characters." };
  if (next !== confirm) return { ok: false, error: "New passwords do not match." };
  await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, user.id));
  return { ok: true, message: "Password changed successfully." };
}

// ============================================
// KYC ACTIONS
// ============================================

export async function submitKycAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const cnicNumber = String(formData.get("cnicNumber") ?? "").trim();
  const dob = String(formData.get("dob") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const paymentAccount = String(formData.get("paymentAccount") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const docType = String(formData.get("docType") ?? "").trim();

  if (!fullName || fullName.length < 3)
    return { ok: false, error: "Please enter your full name." };
  if (!cnicNumber || cnicNumber.length < 10)
    return { ok: false, error: "Please enter a valid CNIC number." };
  if (!dob) return { ok: false, error: "Please enter your date of birth." };
  if (!address || address.length < 5)
    return { ok: false, error: "Please enter your complete address." };
  if (!paymentAccount || paymentAccount.length < 5)
    return { ok: false, error: "Please enter your payment account details." };
  if (!phone || phone.replace(/\D/g, "").length < 10)
    return { ok: false, error: "Please enter a valid phone number." };

  await db
    .update(users)
    .set({
      kycStatus: "pending",
      full_name: fullName,
      cnicNumber: cnicNumber,
      dob: dob,
      address: address,
      paymentAccount: paymentAccount,
      phone: phone,
      kycDocType: docType || "CNIC",
      kycSubmittedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidateApp();
  return { ok: true, message: "KYC submitted. Verification takes up to 24-48 hours." };
}

export async function toggleSecurityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const field = String(formData.get("field") ?? "");
  if (field === "twoFactor") {
    await db.update(users).set({ twoFactor: !user.twoFactor }).where(eq(users.id, user.id));
  } else if (field === "emailAlerts") {
    await db.update(users).set({ emailAlerts: !user.emailAlerts }).where(eq(users.id, user.id));
  }
  revalidateApp();
  return { ok: true, message: "Security preferences updated." };
}

// ============================================
// DAILY CHECK-IN ACTION
// ============================================

export async function dailyCheckinAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  // Only verified users can claim daily check-in
  if (user.kycStatus !== "verified") {
    return { ok: false, error: "KYC verification required for daily check-in. Please complete KYC first." };
  }

  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await db
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

  if (existing.length) {
    return { ok: false, error: "You already claimed your daily check-in today!" };
  }

  // Get streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayCheckin = await db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.userId, user.id),
        sql`${dailyCheckins.checkinDate} >= ${yesterday}`,
        sql`${dailyCheckins.checkinDate} < ${today}`
      )
    )
    .limit(1);

  const streak = yesterdayCheckin.length > 0 ? (yesterdayCheckin[0].streak || 0) + 1 : 1;
  const reward = 5; // 5 PKR per day

  await db.insert(dailyCheckins).values({
    userId: user.id,
    reward: reward.toString(),
    streak: streak,
    checkinDate: new Date(),
  });

  await db
    .update(users)
    .set({
      balance: sql`${users.balance} + ${reward}`,
      totalEarned: sql`${users.totalEarned} + ${reward}`,
    })
    .where(eq(users.id, user.id));

  await db.insert(transactions).values({
    userId: user.id,
    type: "bonus",
    amount: reward.toString(),
    status: "completed",
    method: "Daily Check-in",
    note: `Day ${streak} check-in reward`,
    processedAt: new Date(),
  });

  revalidateApp();
  return { ok: true, message: `🎉 Daily check-in complete! +${reward} PKR (${streak} day streak!)` };
}

export async function seedDemoPlansAction(): Promise<ActionState> {
  await db.select().from(plans).limit(1);
  return { ok: true };
}
