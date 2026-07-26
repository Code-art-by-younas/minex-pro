"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications, otpCodes, transactions, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  makeOtp,
  makeReferralCode,
  verifyPassword,
} from "@/lib/auth";
import { getPlanBySlug } from "@/lib/data";
import { ensureSeeded } from "@/lib/seed";
import type { ActionState } from "@/lib/action-state";
import { sendOTPEmail } from "@/lib/email"; // ✅ Nodemailer Gmail SMTP
import { checkAndClaimReferralRewards } from "@/lib/referral"; // ✅ Referral rewards

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function startRegistration(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureSeeded();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const referral = String(formData.get("referral") ?? "").trim().toUpperCase();

  if (name.length < 3) return { ok: false, step: "form", error: "Enter your full name." };
  if (!EMAIL_RE.test(email)) return { ok: false, step: "form", error: "Enter a valid email address." };
  if (phone.replace(/\D/g, "").length < 7)
    return { ok: false, step: "form", error: "Enter a valid phone number." };
  if (password.length < 8)
    return { ok: false, step: "form", error: "Password must be at least 8 characters." };
  if (password !== confirm) return { ok: false, step: "form", error: "Passwords do not match." };

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length)
    return { ok: false, step: "form", error: "An account with this email already exists." };

  if (referral) {
    const ref = await db.select().from(users).where(eq(users.referralCode, referral)).limit(1);
    if (!ref.length) return { ok: false, step: "form", error: "Referral code not found." };
  }

  const code = makeOtp();
  await db.insert(otpCodes).values({
    email,
    code,
    purpose: "register",
    payload: { name, email, phone, passwordHash: hashPassword(password), referral },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // ✅ REAL EMAIL SEND - Nodemailer Gmail SMTP
  const emailResult = await sendOTPEmail(email, code, name);

  if (!emailResult.success) {
    console.error('⚠️ Email send failed but OTP stored:', emailResult.error);
  }

  return {
    ok: true,
    step: "otp",
    email,
    devCode: code,
    message: `Verification code sent to ${email}.`,
  };
}

export async function resendOtp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  const previous = rows[0];
  if (!previous) return { ok: false, step: "form", error: "Session expired. Please start again." };

  const code = makeOtp();
  await db.insert(otpCodes).values({
    email,
    code,
    purpose: "register",
    payload: previous.payload,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // ✅ REAL EMAIL SEND - Nodemailer Gmail SMTP
  await sendOTPEmail(email, code, previous.payload?.name || "Miner");

  return { ok: true, step: "otp", email, devCode: code, message: "A new code has been sent." };
}

export async function verifyRegistration(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (code.length !== 6) return { ok: false, step: "otp", email, error: "Enter the 6-digit code." };

  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  const record = rows[0];
  if (!record) return { ok: false, step: "otp", email, error: "No pending verification found." };
  if (new Date(record.expiresAt).getTime() < Date.now())
    return { ok: false, step: "otp", email, error: "Code expired. Please resend." };
  if (record.code !== code)
    return { ok: false, step: "otp", email, error: "Incorrect verification code." };

  const payload = record.payload ?? {};
  const referrerCode = payload.referral ?? "";
  let referrerId: number | null = null;
  if (referrerCode) {
    const ref = await db.select().from(users).where(eq(users.referralCode, referrerCode)).limit(1);
    referrerId = ref[0]?.id ?? null;
  }

  const freePlan = await getPlanBySlug("free");
  const now = new Date();

  const [created] = await db
    .insert(users)
    .values({
      name: payload.name ?? "Miner",
      email,
      phone: payload.phone ?? "",
      passwordHash: payload.passwordHash ?? hashPassword("changeme123"),
      referralCode: makeReferralCode(payload.name ?? "MINE"),
      referredBy: referrerId,
      balance: "5.0000",
      totalEarned: "5.0000",
      miningPower: freePlan?.speed ?? "5",
      planId: freePlan?.id ?? null,
      planStartedAt: now,
      planExpiresAt: freePlan
        ? new Date(now.getTime() + freePlan.validityDays * 86_400_000)
        : null,
      lastLoginAt: now,
    })
    .returning();

  await db.update(otpCodes).set({ consumedAt: now }).where(eq(otpCodes.id, record.id));

  // ✅ Welcome Bonus
  await db.insert(transactions).values({
    userId: created.id,
    type: "bonus",
    amount: "5.0000",
    status: "completed",
    method: "Welcome bonus",
    note: "Account verification reward",
    processedAt: now,
  });

  await db.insert(notifications).values({
    userId: created.id,
    title: "Welcome to MineX Pro 🎉",
    body: "Your Free Starter plan is active. Start your first mining cycle to earn rewards.",
    tone: "success",
  });

  // ✅ Referral Processing
  if (referrerId) {
    // ✅ Referrer gets 2 PKR bonus
    await db.insert(transactions).values({
      userId: referrerId,
      type: "referral",
      amount: "2.0000",
      status: "completed",
      method: "Signup bonus",
      note: `New referral: ${payload.name ?? email}`,
      processedAt: now,
    });
    await db.execute(
      sql`update users set balance = balance + 2, referral_earnings = referral_earnings + 2, total_earned = total_earned + 2 where id = ${referrerId}`,
    );
    await db.insert(notifications).values({
      userId: referrerId,
      title: "New referral joined",
      body: `${payload.name ?? "A new miner"} joined with your code. 2 PKR credited.`,
      tone: "success",
    });

    // ✅ Check if referrer can claim milestone rewards
    await checkAndClaimReferralRewards(referrerId);
  }

  // ✅ Referee gets 5 PKR bonus for using referral
  if (referrerId) {
    await db.execute(
      sql`update users set balance = balance + 5, total_earned = total_earned + 5 where id = ${created.id}`,
    );
    await db.insert(transactions).values({
      userId: created.id,
      type: "bonus",
      amount: "5.0000",
      status: "completed",
      method: "Referral Bonus",
      note: "You received 5 PKR for signing up with a referral code!",
      processedAt: now,
    });
  }

  await createSession(created.id);
  redirect("/dashboard");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await ensureSeeded();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password)
    return { ok: false, error: "Enter your email and password." };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash))
    return { ok: false, error: "Invalid email or password." };
  if (user.status !== "active")
    return { ok: false, error: "Your account is suspended. Contact support." };

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}