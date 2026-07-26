CREATE TABLE "mining_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_name" text DEFAULT 'Free' NOT NULL,
	"power" numeric(14, 2) DEFAULT '5' NOT NULL,
	"reward" numeric(18, 4) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"claimed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tone" text DEFAULT 'info' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"purpose" text DEFAULT 'register' NOT NULL,
	"payload" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"speed" numeric(14, 2) DEFAULT '5' NOT NULL,
	"session_hours" integer DEFAULT 24 NOT NULL,
	"validity_days" integer DEFAULT 7 NOT NULL,
	"daily_profit" numeric(14, 4) DEFAULT '0' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tier" integer DEFAULT 0 NOT NULL,
	"accent" text DEFAULT 'emerald' NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "referral_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referee_id" integer NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"amount" numeric(18, 4) DEFAULT '0' NOT NULL,
	"source" text DEFAULT 'plan' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"reward" numeric(14, 4) DEFAULT '0' NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"reward" numeric(14, 4) DEFAULT '0' NOT NULL,
	"kind" text DEFAULT 'daily' NOT NULL,
	"cooldown_hours" integer DEFAULT 24 NOT NULL,
	"icon" text DEFAULT 'gift' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "tasks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(18, 4) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"method" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"screenshot" text,
	"note" text DEFAULT '' NOT NULL,
	"admin_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"referral_code" text NOT NULL,
	"referred_by" integer,
	"balance" numeric(18, 4) DEFAULT '0' NOT NULL,
	"total_earned" numeric(18, 4) DEFAULT '0' NOT NULL,
	"referral_earnings" numeric(18, 4) DEFAULT '0' NOT NULL,
	"mining_power" numeric(14, 2) DEFAULT '5' NOT NULL,
	"plan_id" integer,
	"plan_started_at" timestamp with time zone,
	"plan_expires_at" timestamp with time zone,
	"kyc_status" text DEFAULT 'not_submitted' NOT NULL,
	"kyc_doc_type" text,
	"kyc_doc_number" text,
	"two_factor" boolean DEFAULT false NOT NULL,
	"email_alerts" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
