import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by"),
  balance: numeric("balance", { precision: 18, scale: 4 }).notNull().default("0"),
  totalEarned: numeric("total_earned", { precision: 18, scale: 4 }).notNull().default("0"),
  referralEarnings: numeric("referral_earnings", { precision: 18, scale: 4 })
    .notNull()
    .default("0"),
  miningPower: numeric("mining_power", { precision: 14, scale: 2 }).notNull().default("5"),
  planId: integer("plan_id"),
  planStartedAt: timestamp("plan_started_at", { withTimezone: true }),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  kycStatus: text("kyc_status").notNull().default("not_submitted"),
  kycDocType: text("kyc_doc_type"),
  kycDocNumber: text("kyc_doc_number"),
  twoFactor: boolean("two_factor").notNull().default(false),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
  speed: numeric("speed", { precision: 14, scale: 2 }).notNull().default("5"),
  sessionHours: integer("session_hours").notNull().default(24),
  validityDays: integer("validity_days").notNull().default(7),
  dailyProfit: numeric("daily_profit", { precision: 14, scale: 4 }).notNull().default("0"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  tier: integer("tier").notNull().default(0),
  accent: text("accent").notNull().default("emerald"),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

export const miningSessions = pgTable("mining_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planName: text("plan_name").notNull().default("Free"),
  power: numeric("power", { precision: 14, scale: 2 }).notNull().default("5"),
  reward: numeric("reward", { precision: 18, scale: 4 }).notNull().default("0"),
  status: text("status").notNull().default("running"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 4 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  method: text("method").notNull().default(""),
  address: text("address").notNull().default(""),
  reference: text("reference").notNull().default(""),
  screenshot: text("screenshot"),
  note: text("note").notNull().default(""),
  adminNote: text("admin_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const referralCommissions = pgTable("referral_commissions", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  refereeId: integer("referee_id").notNull(),
  level: integer("level").notNull().default(1),
  amount: numeric("amount", { precision: 18, scale: 4 }).notNull().default("0"),
  source: text("source").notNull().default("plan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ✅ NEW: REFERRAL REWARDS TABLE
// Tracks milestone rewards for referrals
// 10 verified = 50 PKR
// 20 verified = 100 PKR
// 30 verified = 150 PKR
// 50 verified = 250 PKR
// 100 verified = 500 PKR
// ============================================
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referralCount: integer("referral_count").notNull().default(0),
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  tier: integer("tier").notNull().default(0),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ✅ NEW: DAILY CHECK-INS TABLE
// Verified users get 5 PKR per day
// ============================================
export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checkinDate: timestamp("checkin_date", { withTimezone: true }).notNull().defaultNow(),
  reward: numeric("reward", { precision: 10, scale: 2 }).notNull().default("5"),
  streak: integer("streak").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ✅ NEW: USER PLANS TABLE
// Tracks active investments
// ============================================
export const userPlans = pgTable("user_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  planType: text("plan_type").notNull(), // 'weekly' or 'monthly'
  investedAmount: numeric("invested_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  expectedReturn: numeric("expected_return", { precision: 14, scale: 2 }).notNull().default("0"),
  dailyEarning: numeric("daily_earning", { precision: 14, scale: 2 }).notNull().default("0"),
  totalEarned: numeric("total_earned", { precision: 14, scale: 2 }).notNull().default("0"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  lastMinedAt: timestamp("last_mined_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ✅ NEW: SUPPORT TICKETS TABLE
// ============================================
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'deposit', 'withdraw', 'kyc', 'mining', 'plans', 'referral', 'account', 'other'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  aiSuggestion: text("ai_suggestion"),
  adminResponse: text("admin_response"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ✅ NEW: FAQ ARTICLES TABLE
// ============================================
export const faqArticles = pgTable("faq_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'deposit', 'withdraw', 'kyc', 'mining', 'plans', 'account', 'general'
  content: text("content").notNull(),
  views: integer("views").notNull().default(0),
  helpful: integer("helpful").notNull().default(0),
  notHelpful: integer("not_helpful").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  reward: numeric("reward", { precision: 14, scale: 4 }).notNull().default("0"),
  kind: text("kind").notNull().default("daily"),
  cooldownHours: integer("cooldown_hours").notNull().default(24),
  icon: text("icon").notNull().default("gift"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  reward: numeric("reward", { precision: 14, scale: 4 }).notNull().default("0"),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("register"),
  payload: jsonb("payload").$type<Record<string, string>>(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  tone: text("tone").notNull().default("info"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// TYPES
// ============================================
export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type MiningSession = typeof miningSessions.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type UserPlan = typeof userPlans.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type FaqArticle = typeof faqArticles.$inferSelect;
