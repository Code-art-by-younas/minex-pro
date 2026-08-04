// src/lib/cron-jobs.ts
import { db } from "@/db";
import { users, userPlans, transactions, notifications } from "@/db/schema";
import { and, eq, lte, sql } from "drizzle-orm";

export async function processCompletedPlans() {
  const now = new Date();

  // ✅ Completed plans fetch karein
  const completedPlans = await db
    .select()
    .from(userPlans)
    .where(
      and(
        eq(userPlans.status, "active"),
        lte(userPlans.endDate, now)
      )
    );

  let processedCount = 0;

  for (const plan of completedPlans) {
    try {
      // 1. User balance update karein
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${plan.expected_return}`,
          totalEarned: sql`${users.totalEarned} + ${plan.expected_return}`,
        })
        .where(eq(users.id, plan.user_id));

      // 2. Plan status 'completed' karein
      await db
        .update(userPlans)
        .set({ status: "completed" })
        .where(eq(userPlans.id, plan.id));

      // 3. Transaction record banayein
      const profit = Number(plan.expected_return) - Number(plan.invested_amount);
      await db.insert(transactions).values({
        userId: plan.user_id,
        type: "plan_completion",
        amount: plan.expected_return,
        status: "completed",
        method: plan.plan_id.toString(),
        note: `🎉 Plan completed! Investment: ${plan.invested_amount} PKR, Profit: ${profit.toFixed(2)} PKR`,
        processedAt: new Date(),
      });

      // 4. Notification bhejein
      await db.insert(notifications).values({
        userId: plan.user_id,
        title: "🎉 Plan Completed Successfully!",
        body: `Your plan has been completed! Total ${plan.expected_return} PKR credited to your wallet.`,
        tone: "success",
      });

      processedCount++;
      console.log(`✅ Plan ${plan.id} processed for user ${plan.user_id}`);
    } catch (error) {
      console.error(`❌ Error processing plan ${plan.id}:`, error);
    }
  }

  return processedCount;
}
