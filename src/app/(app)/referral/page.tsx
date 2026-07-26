import { headers } from "next/headers";
import { Award, Link2, Share2, TrendingUp, UserPlus, Users, Gift, CheckCircle2 } from "lucide-react";
import { BarChart } from "@/components/charts";
import { CopyButton } from "@/components/copy-button";
import { DataTable, EmptyState, GlassCard, StatCard, StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getReferralStats } from "@/lib/data";
import { dateLabel, initials, n, pkr } from "@/lib/utils";
import { REFERRAL_MILESTONES } from "@/lib/referral";
import { db } from "@/db";
import { users, referralRewards } from "@/db/schema";
import { eq, and } from "drizzle-orm"; // ✅ Added 'and'

export const dynamic = "force-dynamic";
export const metadata = { title: "Referral Program — MineX Pro" };

export default async function ReferralPage() {
  const user = await requireUser();
  const stats = await getReferralStats(user.id);
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host") ?? "localhost:3000";
  const proto = head.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const link = `${proto}://${host}/register?ref=${user.referralCode}`;

  // ✅ Fixed: proper Drizzle query with 'and' and 'eq'
  const verifiedReferrals = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.referredBy, user.id),
        eq(users.kycStatus, "verified"),
        eq(users.status, "active")
      )
    );

  // Get referral rewards
  const rewards = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.userId, user.id))
    .orderBy(referralRewards.createdAt);

  const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.rewardAmount), 0);

  const monthly = Array.from({ length: 12 }, () => 0);
  for (const c of stats.commissions) {
    const idx = new Date(c.createdAt).getMonth();
    monthly[idx] += n(c.amount);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <GlassCard glow="cyan" className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-aqua-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/25 bg-aqua-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-aqua-300">
            <Share2 className="h-3 w-3" /> Referral program
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Invite miners, earn <span className="text-gradient">rewards</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Invite friends and earn milestone rewards when they complete KYC.
            <br />
            <span className="text-neon-400">10 verified = 50 PKR • 20 = 100 PKR • 30 = 150 PKR • 50 = 250 PKR • 100 = 500 PKR</span>
          </p>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-950/60 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Your referral link</p>
              <p className="mt-1 truncate font-mono text-sm text-aqua-300">{link}</p>
            </div>
            <CopyButton value={link} label="Copy link" />
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-950/60 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Your referral code</p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-[0.2em] text-neon-400">
                {user.referralCode}
              </p>
            </div>
            <CopyButton value={user.referralCode} label="Copy code" />
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total referrals" value={String(stats.team.length)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Verified referrals" value={String(verifiedReferrals.length)} icon={<CheckCircle2 className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Active miners" value={String(stats.activeCount)} hint="With a paid plan" icon={<UserPlus className="h-5 w-5" />} accent="cyan" />
        <StatCard label="Commission earned" value={pkr(stats.totalEarned)} icon={<Award className="h-5 w-5" />} accent="violet" />
        <StatCard label="Milestone Rewards" value={pkr(totalRewards)} icon={<Gift className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Commission by month</h2>
          <p className="text-xs text-slate-500">Current calendar year</p>
          <div className="mt-6">
            <BarChart
              data={monthly}
              labels={["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]}
              height={150}
            />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
            {[
              ["Level 1", "10%"],
              ["Level 2", "3%"],
              ["Mining", "10%"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/8 bg-white/3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p>
                <p className="font-display text-lg font-bold text-neon-400">{v}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-400" />
            <h2 className="font-display text-lg font-bold text-white">My team</h2>
          </div>
          <div className="mt-5 space-y-2.5">
            {stats.team.length === 0 ? (
              <EmptyState
                icon={<Link2 className="h-7 w-7" />}
                title="No referrals yet"
                hint="Share your link on social media to start building your mining team."
              />
            ) : (
              stats.team.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3.5 py-3 transition hover:border-neon-500/30"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-500 to-aqua-500 text-xs font-bold text-ink-950">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{member.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{member.email}</p>
                  </div>
                  <div className="text-right">
                    {member.kycStatus === "verified" ? (
                      <StatusPill status="approved" />
                    ) : member.kycStatus === "pending" ? (
                      <StatusPill status="pending" />
                    ) : (
                      <StatusPill status="inactive" />
                    )}
                    <p className="mt-1 text-[10px] text-slate-600">{dateLabel(member.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Milestone Rewards Section */}
      <GlassCard className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">🎯 Milestone Rewards</h2>
        <p className="text-xs text-slate-500">Earn rewards when your referrals complete KYC verification</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REFERRAL_MILESTONES.map((milestone) => {
            const isReached = verifiedReferrals.length >= milestone.referrals;
            const progress = Math.min((verifiedReferrals.length / milestone.referrals) * 100, 100);

            return (
              <div
                key={milestone.referrals}
                className={`rounded-xl border p-4 ${
                  isReached
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/3"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {milestone.referrals} Verified
                    </p>
                    <p className="text-xs text-slate-400">Reward: {milestone.reward} PKR</p>
                  </div>
                  {isReached ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Gift className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isReached ? "bg-emerald-400" : "bg-neon-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {verifiedReferrals.length}/{milestone.referrals} completed
                  {isReached && " ✅ Claimed!"}
                </p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">Commission history</h2>
        <div className="mt-5">
          {stats.commissions.length === 0 ? (
            <EmptyState title="No commissions yet" hint="You earn when your team activates a plan." />
          ) : (
            <DataTable head={["Ref", "From", "Level", "Source", "Amount", "Date"]}>
              {stats.commissions.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">#{String(c.id).padStart(5, "0")}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-white">{c.refereeName ?? "Member"}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-bold text-violet-300">
                      L{c.level}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs capitalize text-slate-400">{c.source}</td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-neon-400">
                    +{pkr(c.amount, 4)}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(c.createdAt)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </GlassCard>
    </div>
  );
}