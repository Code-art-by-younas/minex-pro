import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bolt,
  Cpu,
  Gift,
  Globe2,
  HeartHandshake,
  Layers,
  LineChart,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { AreaChart, CountUp, LiveHashTicker } from "@/components/charts";
import { Faq, LandingNav, PriceTicker } from "@/components/landing";
import { GlassCard, SectionTitle } from "@/components/ui";
import { getSessionUserId } from "@/lib/auth";
import { getPlans, getPlatformStats } from "@/lib/data";
import { HeroGraphic } from "@/components/hero-graphic"; // ✅ New import

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Cpu,
    title: "Real-time mining",
    body: "Launch hash cycles from any device and watch live progress, ETA and rewards updated every second.",
  },
  {
    icon: Bolt,
    title: "Instant rewards",
    body: "One tap moves payouts straight into your wallet — no queues, no delays.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & safe",
    body: "Bank-grade security with KYC verification and optional two-factor protection.",
  },
  {
    icon: BarChart3,
    title: "Pro analytics",
    body: "Animated earnings charts and full transaction ledgers so you always know where your money is.",
  },
  {
    icon: Users,
    title: "Referral rewards",
    body: "Earn 10% level-one and 3% level-two commission on plan purchases.",
  },
  {
    icon: Globe2,
    title: "Easy payments",
    body: "Deposit with Easypaisa, JazzCash or Bank Transfer. Withdraw to the same rails.",
  },
];

const STEPS = [
  {
    icon: Users,
    title: "Create account",
    body: "Register with OTP email verification in under 60 seconds and get a 5 PKR welcome bonus.",
  },
  {
    icon: Layers,
    title: "Activate plan",
    body: "Pick from Weekly (500-5,000 PKR) or Monthly (100-5,000 PKR) plans.",
  },
  {
    icon: Wallet,
    title: "Mine & withdraw",
    body: "Run cycles, claim rewards to your wallet and cash out to Easypaisa or Bank.",
  },
];

export default async function LandingPage() {
  const [plans, stats, userId] = await Promise.all([
    getPlans(),
    getPlatformStats(),
    getSessionUserId(),
  ]);
  const authed = Boolean(userId);
  const series = [12, 19, 16, 24, 31, 28, 37, 44, 39, 52, 61, 57, 68, 79];

  return (
    <div className="relative overflow-x-hidden">
      <LandingNav authed={authed} />

      {/* HERO */}
      <section className="relative pt-28 sm:pt-32 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-lines" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-neon-500/8 blur-[140px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-500/25 bg-neon-500/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-400">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-400 animate-blink" />
              Live • 99.98% uptime
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Mine crypto at
              <span className="block text-gradient">light speed.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              MineX Pro is a premium cloud-mining platform. Launch a rig in seconds, track earnings
              and withdraw to your wallet whenever you want.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={authed ? "/mining" : "/register"}
                className="btn-primary group rounded-xl px-7 py-3.5 text-base font-bold"
              >
                <span className="inline-flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Mining
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/plans" className="btn-ghost rounded-xl px-7 py-3.5 text-center text-base font-semibold text-white">
                View Plans
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neon-400" /> Secure
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-aqua-400" /> 6h–24h cycles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-amber-300" /> 5 PKR bonus
              </span>
            </div>
          </div>

          {/* ✅ REPLACED IMAGE WITH ANIMATED GRAPHIC */}
          <div className="relative animate-rise delay-2">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-neon-500/20 via-transparent to-aqua-500/25 blur-2xl" />
              <GlassCard glow="cyan" className="relative overflow-hidden rounded-3xl p-3">
                <HeroGraphic />
              </GlassCard>

              <div className="glass absolute -left-3 top-8 hidden w-44 rounded-2xl p-3.5 animate-float sm:block">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Hash rate</p>
                <p className="font-display text-xl font-bold text-neon-400">842.5 TH/s</p>
                <div className="mt-2">
                  <LiveHashTicker />
                </div>
              </div>

              <div
                className="glass absolute -right-2 bottom-8 hidden w-40 rounded-2xl p-3.5 animate-float sm:block"
                style={{ animationDelay: "1.2s" }}
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Today's payout</p>
                <p className="font-display text-xl font-bold text-white">
                  <CountUp value={18492.44} prefix="PKR " decimals={2} />
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-neon-400">
                  <TrendingUp className="h-3 w-3" /> +12.4%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PriceTicker />

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active miners", value: stats.miners, icon: Users, prefix: "", suffix: "+", d: 0 },
            { label: "Total paid out", value: stats.paid, icon: Wallet, prefix: "PKR ", suffix: "", d: 0 },
            { label: "Mining cycles", value: stats.sessions, icon: Zap, prefix: "", suffix: "", d: 0 },
            { label: "Network hash", value: stats.hashrate / 1000, icon: LineChart, prefix: "", suffix: " TH/s", d: 1 },
          ].map((stat, i) => (
            <GlassCard key={stat.label} hover glow={i % 2 === 0 ? "green" : "cyan"} className={`p-5 animate-rise delay-${i + 1}`}>
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-neon-400" />
                <span className="rounded-full bg-neon-500/10 px-2 py-0.5 text-[10px] font-bold text-neon-400">
                  LIVE
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
                <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.d} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle
          center
          eyebrow="Why MineX Pro"
          title={<>Everything you need, <span className="text-gradient">in one console</span></>}
          subtitle="From the first hash to the final withdrawal, every part of the experience is fast, transparent and premium."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <GlassCard key={feature.title} hover className={`group p-6 animate-rise delay-${(i % 5) + 1}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-500/25 to-aqua-500/10 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-5 w-5 text-neon-400" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* LIVE PANEL */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <GlassCard glow="green" className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              eyebrow="Network telemetry"
              title="Watch the pool in real time"
              subtitle="Aggregate hash rate, block luck and payout velocity streamed live."
            />
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { k: "Pool luck", v: "104.2%" },
                { k: "Avg. block", v: "9m 42s" },
                { k: "Fee", v: "0.8%" },
              ].map((item) => (
                <div key={item.k} className="rounded-xl border border-white/8 bg-white/3 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.k}</p>
                  <p className="mt-1 font-display text-lg font-bold text-white">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-ink-950/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Payouts (14d)</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-neon-500/10 px-2.5 py-1 text-[11px] font-bold text-neon-400">
                <TrendingUp className="h-3 w-3" /> +38.6%
              </span>
            </div>
            <div className="mt-4">
              <AreaChart data={series} height={170} />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle center eyebrow="How it works" title="Three steps to your first payout" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <GlassCard key={step.title} hover className="relative p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-white/5">
                0{i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-aqua-500/25 to-neon-500/10 ring-1 ring-white/10">
                <step.icon className="h-5 w-5 text-aqua-400" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* REFERRAL */}
      <section id="referral" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <GlassCard glow="cyan" className="relative overflow-hidden p-6 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-aqua-500/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle
                eyebrow="Referral program"
                title={<>Build a team, <span className="text-gradient">earn rewards</span></>}
                subtitle="Share your link and earn commissions on every plan your network activates."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Level 1", v: "10%", d: "Direct" },
                  { k: "Level 2", v: "3%", d: "Indirect" },
                  { k: "Mining", v: "10%", d: "Of every claim" },
                ].map((tier) => (
                  <div key={tier.k} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{tier.k}</p>
                    <p className="font-display text-3xl font-extrabold text-gradient">{tier.v}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{tier.d}</p>
                  </div>
                ))}
              </div>
              <Link
                href={authed ? "/referral" : "/register"}
                className="btn-primary mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-bold"
              >
                <span className="inline-flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4" /> Get Referral Link
                </span>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-ink-950/50 p-5">
              <p className="text-sm font-semibold text-white">Earnings simulation</p>
              <p className="mt-1 text-xs text-slate-500">10 direct + 40 indirect referrals</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Direct commissions", value: 1450, pct: 82 },
                  { label: "Indirect commissions", value: 620, pct: 46 },
                  { label: "Mining claims", value: 310, pct: 28 },
                  { label: "Task bonuses", value: 145, pct: 14 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-semibold text-white">PKR {row.value.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-500 to-aqua-400"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between rounded-xl border border-neon-500/25 bg-neon-500/8 px-4 py-3">
                <span className="text-xs text-slate-300">Estimated monthly</span>
                <span className="font-display text-2xl font-extrabold text-neon-400">PKR 2,525</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle center eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-10">
          <Faq />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <GlassCard glow="green" className="relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-70" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-neon-500/15 blur-[100px]" />
          <div className="relative">
            <Sparkles className="mx-auto h-8 w-8 text-neon-400" />
            <h2 className="mt-5 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Your rig is one tap away
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Join thousands of miners. Free starter plan, 5 PKR bonus, no hardware required.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={authed ? "/dashboard" : "/register"} className="btn-primary rounded-xl px-8 py-3.5 text-base font-bold">
                {authed ? "Dashboard" : "Create Account"}
              </Link>
              <Link href="/login" className="btn-ghost rounded-xl px-8 py-3.5 text-base font-semibold text-white">
                Sign in
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 bg-ink-950/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-500 to-aqua-500">
                <Cpu className="h-5 w-5 text-ink-950" />
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                Mine<span className="text-gradient">X</span> Pro
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Premium cloud mining simulation. All balances and payouts are simulated.
            </p>
            <div className="mt-5 flex gap-2">
              {["Easypaisa", "JazzCash", "Bank"].map((c) => (
                <span
                  key={c}
                  className="rounded-lg border border-white/8 bg-white/3 px-2.5 py-1 text-[11px] font-semibold text-slate-400"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: [["Dashboard", "/dashboard"], ["Mining", "/mining"], ["Plans", "/plans"], ["Wallet", "/wallet"]] },
            { title: "Earn", links: [["Referral", "/referral"], ["Tasks", "/tasks"], ["Deposit", "/deposit"], ["Withdraw", "/withdraw"]] },
            { title: "Account", links: [["Register", "/register"], ["Sign in", "/login"], ["Profile", "/profile"], ["Admin", "/admin"]] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-slate-500 transition hover:text-neon-400">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/8 px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-slate-600 sm:flex-row">
            <p>© {new Date().getFullYear()} MineX Pro. All rights reserved.</p>
            <p>Simulation platform • No real cryptocurrency is mined.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}