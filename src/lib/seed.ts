import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { plans, tasks } from "@/db/schema";

export const PLAN_SEED = [
  // ============================================
  // 10 DAYS PLANS (100% - 150% Profit)
  // Min: 100 PKR, Max: 5,000 PKR
  // ============================================
  {
    slug: "10days-100",
    name: "10 Days (100 PKR)",
    price: "100",
    speed: "100",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "5.00",
    tier: 1,
    accent: "slate",
    popular: false,
    features: [
      "10 day contract",
      "50 PKR profit",
      "Daily earnings: 5 PKR",
      "Total return: 150 PKR",
    ],
  },
  {
    slug: "10days-250",
    name: "10 Days (250 PKR)",
    price: "250",
    speed: "250",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "15.00",
    tier: 2,
    accent: "amber",
    popular: false,
    features: [
      "10 day contract",
      "150 PKR profit",
      "Daily earnings: 15 PKR",
      "Total return: 400 PKR",
    ],
  },
  {
    slug: "10days-500",
    name: "10 Days (500 PKR)",
    price: "500",
    speed: "500",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "30.00",
    tier: 3,
    accent: "cyan",
    popular: true,
    features: [
      "10 day contract",
      "300 PKR profit",
      "Daily earnings: 30 PKR",
      "Total return: 800 PKR",
    ],
  },
  {
    slug: "10days-750",
    name: "10 Days (750 PKR)",
    price: "750",
    speed: "750",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "50.00",
    tier: 4,
    accent: "yellow",
    popular: false,
    features: [
      "10 day contract",
      "500 PKR profit",
      "Daily earnings: 50 PKR",
      "Total return: 1,250 PKR",
    ],
  },
  {
    slug: "10days-1000",
    name: "10 Days (1000 PKR)",
    price: "1000",
    speed: "1000",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "70.00",
    tier: 5,
    accent: "violet",
    popular: false,
    features: [
      "10 day contract",
      "700 PKR profit",
      "Daily earnings: 70 PKR",
      "Total return: 1,700 PKR",
    ],
  },
  {
    slug: "10days-1500",
    name: "10 Days (1500 PKR)",
    price: "1500",
    speed: "1500",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "105.00", // 1050/10 = 105
    tier: 4,
    accent: "amber",
    popular: false,
    features: [
      "10 day contract",
      "1,050 PKR profit",
      "Daily earnings: 105 PKR",
      "Total return: 2,550 PKR",
    ],
  },
  {
    slug: "10days-2000",
    name: "10 Days (2000 PKR)",
    price: "2000",
    speed: "2000",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "140.00", // 1400/10 = 140
    tier: 5,
    accent: "yellow",
    popular: false,
    features: [
      "10 day contract",
      "1,400 PKR profit",
      "Daily earnings: 140 PKR",
      "Total return: 3,400 PKR",
    ],
  },
  {
    slug: "10days-3000",
    name: "10 Days (3000 PKR)",
    price: "3000",
    speed: "3000",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "210.00", // 2100/10 = 210
    tier: 6,
    accent: "violet",
    popular: false,
    features: [
      "10 day contract",
      "2,100 PKR profit",
      "Daily earnings: 210 PKR",
      "Total return: 5,100 PKR",
    ],
  },
  {
    slug: "10days-4000",
    name: "10 Days (4000 PKR)",
    price: "4000",
    speed: "4000",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "280.00", // 2800/10 = 280
    tier: 6,
    accent: "fuchsia",
    popular: false,
    features: [
      "10 day contract",
      "2,800 PKR profit",
      "Daily earnings: 280 PKR",
      "Total return: 6,800 PKR",
    ],
  },
  {
    slug: "10days-5000",
    name: "10 Days (5000 PKR)",
    price: "5000",
    speed: "5000",
    sessionHours: 24,
    validityDays: 10,
    dailyProfit: "350.00", // 3500/10 = 350
    tier: 7,
    accent: "emerald",
    popular: false,
    features: [
      "10 day contract",
      "3,500 PKR profit",
      "Daily earnings: 350 PKR",
      "Total return: 8,500 PKR",
    ],
  },

  // ============================================
  // 30 DAYS (MONTHLY) PLANS (200% Profit)
  // Min: 100 PKR, Max: 5,000 PKR
  // ============================================
  {
    slug: "monthly-100",
    name: "Monthly (100 PKR)",
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
      "200 PKR profit",
      "Daily earnings: 6.67 PKR",
      "Total return: 300 PKR",
    ],
  },
  {
    slug: "monthly-300",
    name: "Monthly (300 PKR)",
    price: "300",
    speed: "300",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "10.00",
    tier: 2,
    accent: "amber",
    popular: false,
    features: [
      "30 day contract",
      "300 PKR profit",
      "Daily earnings: 10 PKR",
      "Total return: 600 PKR",
    ],
  },
  {
    slug: "monthly-500",
    name: "Monthly (500 PKR)",
    price: "500",
    speed: "500",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "16.67",
    tier: 3,
    accent: "cyan",
    popular: true,
    features: [
      "30 day contract",
      "500 PKR profit",
      "Daily earnings: 16.67 PKR",
      "Total return: 1,000 PKR",
    ],
  },
  {
    slug: "monthly-750",
    name: "Monthly (750 PKR)",
    price: "750",
    speed: "750",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "25.00",
    tier: 4,
    accent: "yellow",
    popular: false,
    features: [
      "30 day contract",
      "750 PKR profit",
      "Daily earnings: 25 PKR",
      "Total return: 1,500 PKR",
    ],
  },
  {
    slug: "monthly-1000",
    name: "Monthly (1000 PKR)",
    price: "1000",
    speed: "1000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "33.33",
    tier: 5,
    accent: "violet",
    popular: false,
    features: [
      "30 day contract",
      "1,000 PKR profit",
      "Daily earnings: 33.33 PKR",
      "Total return: 2,000 PKR",
    ],
  },
  {
    slug: "monthly-1500",
    name: "Monthly (1500 PKR)",
    price: "1500",
    speed: "1500",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "50.00", // 1500/30 = 50
    tier: 5,
    accent: "amber",
    popular: false,
    features: [
      "30 day contract",
      "1,500 PKR profit",
      "Daily earnings: 50 PKR",
      "Total return: 3,000 PKR",
    ],
  },
  {
    slug: "monthly-2000",
    name: "Monthly (2000 PKR)",
    price: "2000",
    speed: "2000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "66.67", // 2000/30 = 66.67
    tier: 5,
    accent: "yellow",
    popular: false,
    features: [
      "30 day contract",
      "2,000 PKR profit",
      "Daily earnings: 66.67 PKR",
      "Total return: 4,000 PKR",
    ],
  },
  {
    slug: "monthly-3000",
    name: "Monthly (3000 PKR)",
    price: "3000",
    speed: "3000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "100.00", // 3000/30 = 100
    tier: 6,
    accent: "fuchsia",
    popular: false,
    features: [
      "30 day contract",
      "3,000 PKR profit",
      "Daily earnings: 100 PKR",
      "Total return: 6,000 PKR",
    ],
  },
  {
    slug: "monthly-4000",
    name: "Monthly (4000 PKR)",
    price: "4000",
    speed: "4000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "133.33", // 4000/30 = 133.33
    tier: 6,
    accent: "violet",
    popular: false,
    features: [
      "30 day contract",
      "4,000 PKR profit",
      "Daily earnings: 133.33 PKR",
      "Total return: 8,000 PKR",
    ],
  },
  {
    slug: "monthly-5000",
    name: "Monthly (5000 PKR)",
    price: "5000",
    speed: "5000",
    sessionHours: 24,
    validityDays: 30,
    dailyProfit: "166.67", // 5000/30 = 166.67
    tier: 7,
    accent: "emerald",
    popular: false,
    features: [
      "30 day contract",
      "5,000 PKR profit",
      "Daily earnings: 166.67 PKR",
      "Total return: 10,000 PKR",
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
