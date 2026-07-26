import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { plans, tasks } from "@/db/schema";

export const PLAN_SEED = [
  // ============================================
  // WEEKLY PLANS (7 Days, 100% Profit)
  // Min: 500 PKR, Max: 5,000 PKR
  // ============================================
  {
    slug: "weekly-bronze",
    name: "Weekly Bronze",
    price: "500",
    speed: "500",
    sessionHours: 24,
    validityDays: 7,
    dailyProfit: "71.43",
    tier: 1,
    accent: "amber",
    popular: false,
    features: [
      "7 day contract",
      "100% profit (500 PKR)",
      "Daily earnings: 71.43 PKR",
      "Total return: 1,000 PKR",
    ],
  },
  {
    slug: "weekly-silver",
    name: "Weekly Silver",
    price: "1000",
    speed: "1000",
    sessionHours: 24,
    validityDays: 7,
    dailyProfit: "142.86",
    tier: 2,
    accent: "cyan",
    popular: true,
    features: [
      "7 day contract",
      "100% profit (1,000 PKR)",
      "Daily earnings: 142.86 PKR",
      "Total return: 2,000 PKR",
    ],
  },
  {
    slug: "weekly-gold",
    name: "Weekly Gold",
    price: "2000",
    speed: "2000",
    sessionHours: 24,
    validityDays: 7,
    dailyProfit: "285.71",
    tier: 3,
    accent: "yellow",
    popular: false,
    features: [
      "7 day contract",
      "100% profit (2,000 PKR)",
      "Daily earnings: 285.71 PKR",
      "Total return: 4,000 PKR",
    ],
  },
  {
    slug: "weekly-platinum",
    name: "Weekly Platinum",
    price: "3000",
    speed: "3000",
    sessionHours: 24,
    validityDays: 7,
    dailyProfit: "428.57",
    tier: 4,
    accent: "violet",
    popular: false,
    features: [
      "7 day contract",
      "100% profit (3,000 PKR)",
      "Daily earnings: 428.57 PKR",
      "Total return: 6,000 PKR",
    ],
  },
  {
    slug: "weekly-diamond",
    name: "Weekly Diamond",
    price: "5000",
    speed: "5000",
    sessionHours: 24,
    validityDays: 7,
    dailyProfit: "714.29",
    tier: 5,
    accent: "emerald",
    popular: false,
    features: [
      "7 day contract",
      "100% profit (5,000 PKR)",
      "Daily earnings: 714.29 PKR",
      "Total return: 10,000 PKR",
    ],
  },

  // ============================================
  // MONTHLY PLANS (30 Days, 200% Profit)
  // Min: 100 PKR, Max: 5,000 PKR
  // ============================================
  {
    slug: "monthly-starter",
    name: "Monthly Starter",
    price: "100",
    speed: "100",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "6.67",
    tier: 1,
    accent: "slate",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (200 PKR)",
      "Daily earnings: 6.67 PKR",
      "Total return: 300 PKR",
    ],
  },
  {
    slug: "monthly-basic",
    name: "Monthly Basic",
    price: "200",
    speed: "200",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "13.33",
    tier: 2,
    accent: "amber",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (400 PKR)",
      "Daily earnings: 13.33 PKR",
      "Total return: 600 PKR",
    ],
  },
  {
    slug: "monthly-standard",
    name: "Monthly Standard",
    price: "500",
    speed: "500",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "33.33",
    tier: 3,
    accent: "cyan",
    popular: true,
    features: [
      "30 day contract",
      "200% profit (1,000 PKR)",
      "Daily earnings: 33.33 PKR",
      "Total return: 1,500 PKR",
    ],
  },
  {
    slug: "monthly-premium",
    name: "Monthly Premium",
    price: "1000",
    speed: "1000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "66.67",
    tier: 4,
    accent: "yellow",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (2,000 PKR)",
      "Daily earnings: 66.67 PKR",
      "Total return: 3,000 PKR",
    ],
  },
  {
    slug: "monthly-elite",
    name: "Monthly Elite",
    price: "2000",
    speed: "2000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "133.33",
    tier: 5,
    accent: "violet",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (4,000 PKR)",
      "Daily earnings: 133.33 PKR",
      "Total return: 6,000 PKR",
    ],
  },
  {
    slug: "monthly-ultimate",
    name: "Monthly Ultimate",
    price: "3000",
    speed: "3000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "200.00",
    tier: 6,
    accent: "fuchsia",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (6,000 PKR)",
      "Daily earnings: 200.00 PKR",
      "Total return: 9,000 PKR",
    ],
  },
  {
    slug: "monthly-legend",
    name: "Monthly Legend",
    price: "5000",
    speed: "5000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "333.33",
    tier: 7,
    accent: "emerald",
    popular: false,
    features: [
      "30 day contract",
      "200% profit (10,000 PKR)",
      "Daily earnings: 333.33 PKR",
      "Total return: 15,000 PKR",
    ],
  },
];

const TASK_SEED = [
  {
    slug: "daily-login",
    title: "Daily Login Bonus",
    description: "Check in every 24 hours to collect your loyalty credit.",
    reward: "0.5000",
    kind: "daily",
    cooldownHours: 24,
    icon: "calendar",
    sortOrder: 1,
  },
  {
    slug: "watch-ad",
    title: "Watch a Sponsored Ad",
    description: "Watch a short partner ad and boost your daily earnings.",
    reward: "0.1500",
    kind: "repeatable",
    cooldownHours: 1,
    icon: "play",
    sortOrder: 2,
  },
  {
    slug: "join-telegram",
    title: "Join our Telegram",
    description: "Join the official MineX Pro announcements channel.",
    reward: "1.0000",
    kind: "social",
    cooldownHours: 0,
    icon: "send",
    sortOrder: 3,
  },
  {
    slug: "follow-x",
    title: "Follow MineX Pro on X",
    description: "Follow @MineXPro and stay ahead of network upgrades.",
    reward: "1.0000",
    kind: "social",
    cooldownHours: 0,
    icon: "twitter",
    sortOrder: 4,
  },
  {
    slug: "invite-friend",
    title: "Invite a Friend",
    description: "Share your referral link and grow your mining team.",
    reward: "2.5000",
    kind: "daily",
    cooldownHours: 24,
    icon: "users",
    sortOrder: 5,
  },
  {
    slug: "complete-kyc",
    title: "Complete KYC Verification",
    description: "Verify your identity to unlock unlimited withdrawals.",
    reward: "3.0000",
    kind: "once",
    cooldownHours: 0,
    icon: "shield",
    sortOrder: 6,
  },
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  // ✅ Insert Plans
  for (const plan of PLAN_SEED) {
    await db
      .insert(plans)
      .values(plan)
      .onConflictDoUpdate({
        target: plans.slug,
        set: {
          name: plan.name,
          price: plan.price,
          speed: plan.speed,
          sessionHours: plan.sessionHours,
          validityDays: plan.validityDays,
          dailyProfit: plan.dailyProfit,
          features: plan.features,
          tier: plan.tier,
          accent: plan.accent,
          popular: plan.popular,
        },
      });
  }

  // ✅ Insert Tasks
  for (const task of TASK_SEED) {
    await db.insert(tasks).values(task).onConflictDoNothing({ target: tasks.slug });
  }

  console.log("✅ Seed completed: Plans and Tasks inserted. No demo/admin users created.");
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

export async function tablesReady(): Promise<boolean> {
  try {
    await db.execute(sql`select 1 from plans limit 1`);
    return true;
  } catch {
    return false;
  }
}