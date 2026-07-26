import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Cpu, Gift, ShieldCheck, TrendingUp, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: TrendingUp, title: "Up to 9 TH/s", body: "Six contract tiers from free trial to Diamond." },
  { icon: Gift, title: "5 PKR welcome bonus", body: "Credited the moment your email is verified." },
  { icon: Users, title: "10% + 3% referrals", body: "Two-level commissions paid instantly." },
  { icon: ShieldCheck, title: "Secure by design", body: "Scrypt hashing and signed sessions." },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />

      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/8 bg-ink-950/60 p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-neon-500/12 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-aqua-500/12 blur-[120px]" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-500 to-aqua-500 shadow-[0_0_28px_-4px_rgba(16,242,140,0.9)]">
            <Cpu className="h-5 w-5 text-ink-950" />
          </span>
          <span className="font-display text-xl font-extrabold text-white">
            Mine<span className="text-gradient">X</span> Pro
          </span>
        </Link>

        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
            The mining console
            <span className="block text-gradient">investors trust.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Launch cloud hash power, track live cycle telemetry and withdraw your rewards from one
            beautifully engineered dashboard.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="glass rounded-2xl p-4">
                <item.icon className="h-5 w-5 text-neon-400" />
                <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          © {new Date().getFullYear()} MineX Pro • Simulation platform
        </p>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-neon-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <div className="glass glow-ring rounded-3xl p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}