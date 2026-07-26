"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  notifications,
  plans as plansTable,
  tasks as tasksTable,
  transactions,
  users as usersTable,
  referralRewards,
  dailyCheckins,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { checkAndClaimReferralRewards } from "@/lib/referral";

// ============================================
// USER ACTIONS
// ============================================

export async function updateUserAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    const op = formData.get("op") as string;

    if (!id || !op) {
      return { ok: false, error: "Missing user ID or operation" };
    }

    if (op === "toggle-status") {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
      if (!user) return { ok: false, error: "User not found" };
      await db
        .update(usersTable)
        .set({ status: user.status === "active" ? "suspended" : "active" })
        .where(eq(usersTable.id, id));
    } else if (op === "verify-kyc") {
      await db
        .update(usersTable)
        .set({ kycStatus: "verified" })
        .where(eq(usersTable.id, id));
    } else if (op === "credit") {
      const amount = parseFloat(formData.get("amount") as string);
      await db
        .update(usersTable)
        .set({ balance: sql`${usersTable.balance} + ${amount}` })
        .where(eq(usersTable.id, id));
    } else {
      return { ok: false, error: "Unknown operation" };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { ok: false, error: "Failed to update user" };
  }
}

// ============================================
// DEPOSIT ACTIONS
// ============================================

export async function reviewDepositAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    const decision = formData.get("decision") as string;

    if (!id || !decision) {
      return { ok: false, error: "Missing deposit ID or decision" };
    }

    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!tx) return { ok: false, error: "Transaction not found" };

    if (decision === "approve") {
      await db.transaction(async (trx) => {
        await trx
          .update(transactions)
          .set({ status: "approved", processedAt: new Date() })
          .where(eq(transactions.id, id));

        await trx
          .update(usersTable)
          .set({ balance: sql`${usersTable.balance} + ${tx.amount}` })
          .where(eq(usersTable.id, tx.userId));
      });
    } else if (decision === "reject") {
      await db
        .update(transactions)
        .set({ status: "rejected", processedAt: new Date() })
        .where(eq(transactions.id, id));
    } else {
      return { ok: false, error: "Unknown decision" };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Deposit review error:", error);
    return { ok: false, error: "Failed to review deposit" };
  }
}

// ============================================
// WITHDRAWAL ACTIONS
// ============================================

export async function reviewWithdrawalAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    const decision = formData.get("decision") as string;

    if (!id || !decision) {
      return { ok: false, error: "Missing withdrawal ID or decision" };
    }

    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!tx) return { ok: false, error: "Transaction not found" };

    if (decision === "approve") {
      await db.transaction(async (trx) => {
        await trx
          .update(transactions)
          .set({ status: "approved", processedAt: new Date() })
          .where(eq(transactions.id, id));

        await trx
          .update(usersTable)
          .set({ balance: sql`${usersTable.balance} - ${tx.amount}` })
          .where(eq(usersTable.id, tx.userId));
      });
    } else if (decision === "reject") {
      await db
        .update(transactions)
        .set({ status: "rejected", processedAt: new Date() })
        .where(eq(transactions.id, id));
    } else {
      return { ok: false, error: "Unknown decision" };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Withdrawal review error:", error);
    return { ok: false, error: "Failed to review withdrawal" };
  }
}

// ============================================
// KYC REVIEW ACTION (WITH REFERRAL REWARDS)
// ============================================

export async function reviewKYCAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const userId = parseInt(formData.get("userId") as string);
    const decision = formData.get("decision") as string;

    if (!userId || !decision) {
      return { ok: false, error: "Missing userId or decision" };
    }

    const statusMap: Record<string, string> = {
      approve: "verified",
      reject: "rejected",
      reupload: "pending",
    };

    const newStatus = statusMap[decision] || "pending";

    await db
      .update(usersTable)
      .set({
        kycStatus: newStatus,
        kycAdminNotes: decision === "reject" ? "Rejected by admin" : undefined,
        kycSubmittedAt: newStatus === "rejected" ? null : undefined,
      })
      .where(eq(usersTable.id, userId));

    // ✅ If KYC approved, check referral rewards
    if (decision === "approve") {
      // Get user details
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

      // Send notification to user
      await db.insert(notifications).values({
        userId: userId,
        title: "🎉 KYC Verified!",
        body: "Your KYC has been approved. You can now withdraw funds and claim daily check-in rewards.",
        tone: "success",
      });

      // ✅ Check and claim referral rewards for referrer
      if (user?.referredBy) {
        await checkAndClaimReferralRewards(user.referredBy);

        // Notify referrer
        await db.insert(notifications).values({
          userId: user.referredBy,
          title: "🎉 Your referral completed KYC!",
          body: `${user.name} verified their account. Check your referral rewards!`,
          tone: "success",
        });
      }
    }

    if (decision === "reject") {
      await db.insert(notifications).values({
        userId: userId,
        title: "❌ KYC Rejected",
        body: "Your KYC was rejected. Please re-submit with correct information.",
        tone: "danger",
      });
    }

    if (decision === "reupload") {
      await db.insert(notifications).values({
        userId: userId,
        title: "📋 KYC Update Requested",
        body: "Please re-submit your KYC documents with updated information.",
        tone: "warning",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/kyc");
    return { ok: true };
  } catch (error) {
    console.error("KYC review error:", error);
    return { ok: false, error: "Failed to review KYC" };
  }
}

// ============================================
// PLAN ACTIONS
// ============================================

export async function togglePlanAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    if (!id) return { ok: false, error: "Missing plan ID" };

    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, id));
    if (!plan) return { ok: false, error: "Plan not found" };

    await db
      .update(plansTable)
      .set({ active: !plan.active })
      .where(eq(plansTable.id, id));

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Toggle plan error:", error);
    return { ok: false, error: "Failed to toggle plan" };
  }
}

export async function updatePlanPriceAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    const price = formData.get("price") as string;
    const dailyProfit = formData.get("dailyProfit") as string;

    if (!id) return { ok: false, error: "Missing plan ID" };

    await db
      .update(plansTable)
      .set({
        price: price || undefined,
        dailyProfit: dailyProfit || undefined,
      })
      .where(eq(plansTable.id, id));

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Update plan error:", error);
    return { ok: false, error: "Failed to update plan" };
  }
}

// ============================================
// TASK ACTIONS
// ============================================

export async function toggleTaskAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    if (!id) return { ok: false, error: "Missing task ID" };

    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
    if (!task) return { ok: false, error: "Task not found" };

    await db
      .update(tasksTable)
      .set({ active: !task.active })
      .where(eq(tasksTable.id, id));

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Toggle task error:", error);
    return { ok: false, error: "Failed to toggle task" };
  }
}

export async function updateTaskRewardAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = parseInt(formData.get("id") as string);
    const reward = formData.get("reward") as string;

    if (!id) return { ok: false, error: "Missing task ID" };

    await db
      .update(tasksTable)
      .set({ reward: reward || "0" })
      .where(eq(tasksTable.id, id));

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Update task error:", error);
    return { ok: false, error: "Failed to update task" };
  }
}

// ============================================
// BROADCAST ACTIONS
// ============================================

export async function broadcastAction(
  prevState: { ok: boolean },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const tone = formData.get("tone") as string || "info";

    if (!title || !body) {
      return { ok: false, error: "Missing title or body" };
    }

    const allUsers = await db.select({ id: usersTable.id }).from(usersTable);

    for (const user of allUsers) {
      await db.insert(notifications).values({
        userId: user.id,
        title,
        body,
        tone,
        createdAt: new Date(),
      });
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Broadcast error:", error);
    return { ok: false, error: "Failed to send broadcast" };
  }
}