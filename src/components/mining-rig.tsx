"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Flame, Gift, Loader2, Play, Zap } from "lucide-react";
import { claimRewardAction, startMiningAction } from "@/app/actions/app";
import { ProgressBar } from "@/components/ui";
import type { ActionState } from "@/lib/action-state";
import { cn, pkr } from "@/lib/utils";

export type RigSession = {
  id: number;
  planName: string;
  power: string;
  reward: string;
  startedAt: string;
  endsAt: string;
  status: string;
};

function useCountdown(endsAt?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = endsAt ? new Date(endsAt).getTime() : 0;
  const remaining = Math.max(0, end - now);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return { remaining, label: [h, m, s].map((x) => String(x).padStart(2, "0")).join(":"), now };
}

export function MiningRig({
  session,
  planName,
  power,
  sessionHours,
  cycleReward,
}: {
  session: RigSession | null;
  planName: string;
  power: string;
  sessionHours: number;
  cycleReward: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionState | null>(null);
  const { remaining, label, now } = useCountdown(session?.endsAt);

  const running = Boolean(session) && remaining > 0;
  const claimable = Boolean(session) && remaining <= 0;

  const progress = useMemo(() => {
    if (!session) return 0;
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.endsAt).getTime();
    if (end <= start) return 100;
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }, [session, now]);

  const mined = session ? (Number(session.reward) * progress) / 100 : 0;

  const run = (fn: () => Promise<ActionState>) =>
    startTransition(async () => {
      const res = await fn();
      setFeedback(res);
      router.refresh();
    });

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
      <div
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-700",
          running ? "bg-neon-500/25 opacity-100" : "bg-aqua-500/12 opacity-70",
        )}
      />

      <div className="relative flex flex-col items-center">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              running ? "bg-neon-400 animate-blink" : claimable ? "bg-amber-400" : "bg-slate-500",
            )}
          />
          <span className={running ? "text-neon-400" : claimable ? "text-amber-300" : "text-slate-400"}>
            {running ? "Mining active" : claimable ? "Ready to claim" : "Rig idle"}
          </span>
        </div>

        {/* Machine */}
        <div className="relative mt-7 flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
          <div
            className={cn(
              "absolute inset-0 rounded-full border border-neon-500/20",
              running && "animate-spin-slower",
            )}
            style={{
              backgroundImage:
                "conic-gradient(from 0deg, rgba(16,242,140,0.35), transparent 30%, rgba(20,200,245,0.35) 60%, transparent 85%)",
              maskImage: "radial-gradient(circle, transparent 62%, black 63%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 63%)",
            }}
          />
          <div
            className={cn(
              "absolute inset-6 rounded-full border border-aqua-400/25",
              running && "animate-spin-slow",
            )}
            style={{
              backgroundImage:
                "conic-gradient(from 180deg, rgba(20,200,245,0.4), transparent 40%, rgba(16,242,140,0.35) 70%, transparent 90%)",
              maskImage: "radial-gradient(circle, transparent 74%, black 75%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 74%, black 75%)",
            }}
          />

          <div
            className={cn(
              "relative flex h-32 w-32 flex-col items-center justify-center rounded-3xl border border-white/12 bg-gradient-to-br from-ink-700 to-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-40 sm:w-40",
              running && "animate-pulse-glow",
            )}
          >
            <div className="absolute inset-0 rounded-3xl bg-neon-500/10 blur-md" />
            <Cpu
              className={cn(
                "relative h-11 w-11 sm:h-14 sm:w-14",
                running ? "text-neon-400 drop-shadow-[0_0_16px_rgba(16,242,140,0.9)]" : "text-slate-500",
              )}
            />
            <p className="relative mt-2 font-display text-xs font-bold tracking-[0.2em] text-slate-300">
              {power} GH/s
            </p>
            <div className="relative mt-2 flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    running ? "bg-neon-400" : "bg-slate-700",
                  )}
                  style={running ? { animation: `blink 1.2s ${i * 0.15}s ease-in-out infinite` } : undefined}
                />
              ))}
            </div>
          </div>

          {running
            ? [0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-aqua-400 shadow-[0_0_10px_rgba(76,228,255,0.9)]"
                  style={{
                    top: `${12 + ((i * 37) % 76)}%`,
                    left: `${8 + ((i * 53) % 84)}%`,
                    animation: `float ${4 + i * 0.6}s ${i * 0.35}s ease-in-out infinite`,
                  }}
                />
              ))
            : null}
        </div>

        <p className="mt-6 font-display text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
          {session ? label : "00:00:00"}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
          {running ? "Time remaining" : claimable ? "Cycle complete" : `${sessionHours}h cycle ready`}
        </p>

        <div className="mt-6 w-full max-w-xl">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Cycle progress</span>
            <span className="font-semibold text-neon-400">{progress.toFixed(1)}%</span>
          </div>
          <ProgressBar value={progress} />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/8 bg-white/3 px-2 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Plan</p>
              <p className="mt-0.5 truncate text-sm font-bold text-white">{session?.planName ?? planName}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-2 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Mined</p>
              <p className="mt-0.5 text-sm font-bold text-neon-400">{pkr(mined, 4)}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-2 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Payout</p>
              <p className="mt-0.5 text-sm font-bold text-aqua-400">
                {pkr(session ? Number(session.reward) : cycleReward, 4)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button
            onClick={() => run(startMiningAction)}
            disabled={pending || running || claimable}
            className="btn-primary flex-1 rounded-xl py-3.5 text-sm font-bold disabled:opacity-45"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Mining
            </span>
          </button>
          <button
            onClick={() => run(claimRewardAction)}
            disabled={pending || !claimable}
            className={cn(
              "flex-1 rounded-xl py-3.5 text-sm font-bold transition disabled:opacity-45",
              claimable
                ? "bg-gradient-to-r from-amber-400 to-amber-200 text-ink-950 shadow-[0_12px_34px_-12px_rgba(251,191,36,0.9)]"
                : "border border-white/12 bg-white/5 text-slate-300",
            )}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Gift className="h-4 w-4" />
              Claim Reward
            </span>
          </button>
        </div>

        {feedback?.error || feedback?.message ? (
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              feedback.error ? "text-rose-300" : "text-neon-400",
            )}
          >
            {feedback.error ?? feedback.message}
          </p>
        ) : null}

        <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Zap, label: "Hash power", value: `${power} GH/s` },
            { icon: Flame, label: "Cycle length", value: `${sessionHours} hours` },
            { icon: Gift, label: "Per cycle", value: pkr(cycleReward, 2) },
            { icon: Cpu, label: "Pool", value: "MineX-EU-01" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 p-3">
              <item.icon className="h-4 w-4 text-aqua-400" />
              <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="text-sm font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}