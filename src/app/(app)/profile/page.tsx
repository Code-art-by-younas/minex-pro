import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Calendar,
  Copy,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { KycForm, PasswordForm, ProfileForm } from "@/components/forms";
import { GlassCard, StatusPill } from "@/components/ui";
import { CopyButton } from "@/components/copy-button"; // ✅ Fixed import
import { requireUser } from "@/lib/auth";
import { dayLabel, hashRate, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile — MineX Pro" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account and KYC verification.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Form */}
          <GlassCard className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">User information</h2>
            <div className="mt-5">
              <ProfileForm name={user.name} phone={user.phone} email={user.email} />
            </div>
          </GlassCard>

          {/* Change Password */}
          <GlassCard className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">Change password</h2>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </GlassCard>

          {/* KYC Verification */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">KYC verification</h2>
              <StatusPill status={user.kycStatus || "not_submitted"} />
            </div>
            <div className="mt-5">
              <KycForm status={user.kycStatus || "not_submitted"} user={user} />
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-500/30 to-aqua-500/10 ring-1 ring-white/10">
                <User className="h-5 w-5 text-neon-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role === "admin" ? "Administrator" : "Member"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white truncate max-w-[180px]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-white">{user.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined</span>
                <span className="text-white">{dayLabel(user.createdAt)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Wallet Summary */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-neon-400" />
              <h3 className="font-display text-base font-bold text-white">Balance</h3>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-gradient">
              {pkr(user.balance)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-center">
                <p className="text-slate-500">Hash power</p>
                <p className="font-bold text-white">{hashRate(user.miningPower)}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-center">
                <p className="text-slate-500">Plan</p>
                <p className="font-bold text-white">{user.planId ? "Active" : "Free"}</p>
              </div>
            </div>
          </GlassCard>

          {/* Account Summary */}
          <GlassCard className="p-5">
            <h3 className="font-display text-base font-bold text-white">Account summary</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Active plan</span>
                <span className="font-semibold text-white">{user.planId ? "Active" : "Free Starter"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan expiry</span>
                <span className="font-semibold text-white">
                  {user.planExpiresAt ? dayLabel(user.planExpiresAt) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total earned</span>
                <span className="font-semibold text-neon-400">{pkr(user.totalEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Referral income</span>
                <span className="font-semibold text-violet-400">{pkr(user.referralEarnings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account status</span>
                <StatusPill status={user.status} />
              </div>
            </div>
          </GlassCard>

          {/* Referral Code */}
          <GlassCard className="p-5">
            <h3 className="font-display text-base font-bold text-white">Referral code</h3>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3">
              <span className="font-mono text-lg font-bold text-neon-400">{user.referralCode}</span>
              <CopyButton value={user.referralCode} label="Copy code" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}