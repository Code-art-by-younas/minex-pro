"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Brand } from "@/components/app-shell";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#plans", label: "Plans" },
  { href: "#referral", label: "Referral" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/8 bg-ink-950/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6">
        <Brand />
        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2.5 md:flex">
          <Link
            href={authed ? "/dashboard" : "/login"}
            className="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold text-slate-100"
          >
            {authed ? "Dashboard" : "Sign in"}
          </Link>
          <Link href={authed ? "/mining" : "/register"} className="btn-primary rounded-xl px-5 py-2 text-sm font-bold">
            Start Mining
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-xl border border-white/10 p-2 text-slate-200 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/8 bg-ink-950/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="space-y-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href={authed ? "/dashboard" : "/login"} className="btn-ghost rounded-xl py-2.5 text-center text-sm font-semibold text-white">
              {authed ? "Dashboard" : "Sign in"}
            </Link>
            <Link href={authed ? "/mining" : "/register"} className="btn-primary rounded-xl py-2.5 text-center text-sm font-bold">
              Start Mining
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

const FAQS = [
  {
    q: "What exactly is MineX Pro?",
    a: "MineX Pro is a premium cloud mining platform. You purchase a hash-power contract in PKR, run mining cycles from your dashboard, and claim rewards directly into your wallet balance. It's designed for investors who want to earn passive income through crypto mining without hardware.",
  },
  {
    q: "How do mining cycles work?",
    a: "Each plan has a fixed cycle length (6 to 24 hours) and a daily profit rate. Press 'Start Mining' to begin a cycle — the rig animates with a live progress bar. When the timer hits zero, the 'Claim Reward' button credits your wallet instantly in PKR.",
  },
  {
    q: "How fast are deposits and withdrawals?",
    a: "Deposits are manual: send payment via Easypaisa, JazzCash, or Bank Transfer, upload a screenshot with the transaction reference, and an admin reviews it within 5-10 minutes. Withdrawals are processed within 2-4 hours after admin approval.",
  },
  {
    q: "How much can I earn from referrals?",
    a: "You earn 10% level-one and 3% level-two commission on every plan purchase in your team, plus milestone rewards: 10 referrals = 50 PKR, 20 = 100 PKR, 30 = 150 PKR, 50 = 250 PKR, 100 = 500 PKR. All rewards are credited instantly.",
  },
  {
    q: "Is KYC required?",
    a: "KYC is required for withdrawals. You need to submit your Full Name, CNIC, Date of Birth, Address, and Payment Account details. Verification usually takes 24-48 hours. Once verified, you can withdraw unlimited amounts.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support Easypaisa, JazzCash, Mushriq Bank (Al-Falah), and HBL Bank for deposits. Withdrawals are available via Easypaisa, JazzCash, and Bank Transfer. All transactions are in PKR.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => {
        const active = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "glass overflow-hidden rounded-2xl transition-all duration-300",
              active && "border-neon-500/30 shadow-[0_20px_60px_-30px_rgba(16,242,140,0.7)]",
            )}
          >
            <button
              onClick={() => setOpen(active ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className={cn("text-sm font-semibold sm:text-base", active ? "text-white" : "text-slate-300")}>
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-neon-400 transition-transform duration-300",
                  active && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const COINS = [
  { s: "BTC", p: 96842.31, c: 2.41 },
  { s: "ETH", p: 3512.08, c: 1.86 },
  { s: "LTC", p: 128.44, c: -0.72 },
  { s: "XMR", p: 214.9, c: 3.15 },
  { s: "DOGE", p: 0.4128, c: 5.02 },
  { s: "SOL", p: 241.77, c: -1.24 },
  { s: "USDT", p: 1.0, c: 0.01 },
  { s: "KAS", p: 0.1892, c: 6.44 },
];

export function PriceTicker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const rows = COINS.map((c, i) => {
    const drift = Math.sin((tick + i) * 1.7) * 0.006;
    return { ...c, p: c.p * (1 + drift), c: c.c + drift * 40 };
  });

  return (
    <div className="relative flex overflow-hidden border-y border-white/8 bg-ink-950/60 py-3">
      <div className="flex min-w-full shrink-0 animate-ticker items-center gap-8 px-4">
        {[...rows, ...rows].map((coin, i) => (
          <span key={`${coin.s}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-xs">
            <span className="font-display font-bold text-slate-200">{coin.s}</span>
            <span className="tabular-nums text-slate-400">
              ${coin.p.toLocaleString("en-US", { maximumFractionDigits: coin.p < 2 ? 4 : 2 })}
            </span>
            <span className={cn("tabular-nums font-semibold", coin.c >= 0 ? "text-neon-400" : "text-rose-400")}>
              {coin.c >= 0 ? "▲" : "▼"} {Math.abs(coin.c).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
