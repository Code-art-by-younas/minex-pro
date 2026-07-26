// src/lib/referral.ts
import { db } from "@/db";
import { users, referralRewards, transactions, notifications } from "@/db/schema";
import { eq, sql, and, count } from "drizzle-orm";

// Referral milestone rewards
export const REFERRAL_MILESTONES = [
  { referrals: 10, reward: 50 },
  { referrals: 20, reward: 100 },
  { referrals: 30, reward: 150 },
  { referrals: 50, reward: 250 },
  { referrals: 100, reward: 500 },
];

/**
 * Get verified referral count for a user
 */
export async function getVerifiedReferralCount(userId: number): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.referredBy, userId),
        eq(users.kycStatus, "verified"),
        eq(users.status, "active")
      )
    );
  return result[0]?.count || 0;
}

/**
 * Check and claim referral milestone rewards
 */
export async function checkAndClaimReferralRewards(userId: number): Promise<{
  claimed: boolean;
  reward?: number;
  message?: string;
}> {
  try {
    // Get current verified referrals
    const referralCount = await getVerifiedReferralCount(userId);

    // Check if user already claimed rewards for this count
    const existingRewards = await db
      .select()
      .from(referralRewards)
      .where(
        and(
          eq(referralRewards.userId, userId),
          eq(referralRewards.referralCount, referralCount)
        )
      );

    if (existingRewards.length > 0) {
      return { claimed: false, message: "Already claimed for this milestone" };
    }

    // Find the highest milestone reached
    let eligibleMilestone = null;
    for (const milestone of REFERRAL_MILESTONES.reverse()) {
      if (referralCount >= milestone.referrals) {
        eligibleMilestone = milestone;
        break;
      }
    }

    if (!eligibleMilestone) {
      return { claimed: false, message: "No milestone reached yet" };
    }

    // Claim reward
    const rewardAmount = eligibleMilestone.reward;

    // Insert reward record
    await db.insert(referralRewards).values({
      userId: userId,
      referralCount: referralCount,
      rewardAmount: rewardAmount.toString(),
      tier: eligibleMilestone.referrals,
      claimedAt: new Date(),
    });

    // Credit user balance
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${rewardAmount}`,
        referralEarnings: sql`${users.referralEarnings} + ${rewardAmount}`,
        totalEarned: sql`${users.totalEarned} + ${rewardAmount}`,
      })
      .where(eq(users.id, userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: userId,
      type: "referral_reward",
      amount: rewardAmount.toString(),
      status: "completed",
      method: "Referral Milestone",
      note: `Referral reward: ${referralCount} verified referrals = ${rewardAmount} PKR`,
      processedAt: new Date(),
    });

    // Send notification
    await db.insert(notifications).values({
      userId: userId,
      title: "🎉 Referral Milestone Achieved!",
      body: `You have ${referralCount} verified referrals! You earned ${rewardAmount} PKR as a milestone reward.`,
      tone: "success",
    });

    return {
      claimed: true,
      reward: rewardAmount,
      message: `Successfully claimed ${rewardAmount} PKR for ${referralCount} referrals!`,
    };
  } catch (error) {
    console.error("Referral reward error:", error);
    return { claimed: false, message: "Failed to claim reward" };
  }
}

/**
 * Get user referral stats
 */
export async function getReferralStats(userId: number) {
  const [totalReferrals] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.referredBy, userId));

  const [verifiedReferrals] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.referredBy, userId),
        eq(users.kycStatus, "verified"),
        eq(users.status, "active")
      )
    );

  const rewards = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.userId, userId))
    .orderBy(referralRewards.createdAt);

  const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.rewardAmount), 0);

  return {
    totalReferrals: totalReferrals?.count || 0,
    verifiedReferrals: verifiedReferrals?.count || 0,
    totalRewards: totalRewards,
    rewards: rewards,
    nextMilestone: getNextMilestone(verifiedReferrals?.count || 0),
  };
}

/**
 * Get next milestone for user
 */
function getNextMilestone(currentCount: number): { referrals: number; reward: number } | null {
  for (const milestone of REFERRAL_MILESTONES) {
    if (milestone.referrals > currentCount) {
      return milestone;
    }
  }
  return null;
}

/**
 * Process referral when a user verifies KYC
 */
export async function processReferralOnKYC(userId: number): Promise<void> {
  // Get user details
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !user.referredBy) return;

  // Check if referrer exists
  const [referrer] = await db.select().from(users).where(eq(users.id, user.referredBy));
  if (!referrer) return;

  // Send notification to referrer
  await db.insert(notifications).values({
    userId: referrer.id,
    title: "🎉 Your referral completed KYC!",
    body: `${user.name} verified their account. You're one step closer to your next milestone!`,
    tone: "success",
  });

  // Check if referrer can claim rewards
  await checkAndClaimReferralRewards(referrer.id);
}