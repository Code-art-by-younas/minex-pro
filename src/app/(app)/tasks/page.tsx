import {
  AtSign,
  CalendarCheck,
  CheckCircle2,
  Gift,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { completeTaskAction } from "@/app/actions/app";
import { DataTable, EmptyState, GlassCard, ProgressBar, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTasksWithState, getTransactions } from "@/lib/data";
import { dateLabel, n, pkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks & Rewards — MineX Pro" };

const ICONS: Record<string, React.ElementType> = {
  calendar: CalendarCheck,
  play: PlayCircle,
  send: Send,
  twitter: AtSign,
  users: Users,
  shield: ShieldCheck,
  gift: Gift,
};

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, history] = await Promise.all([
    getTasksWithState(user.id),
    getTransactions(user.id, ["task"], 15),
  ]);

  const available = tasks.filter((t) => t.available).length;
  const totalEarned = history.reduce((a, t) => a + n(t.amount), 0);
  const potential = tasks.reduce((a, t) => a + n(t.reward), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <GlassCard glow="green" className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
        <div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-neon-500/18 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-500/25 bg-neon-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-400">
              <Trophy className="h-3 w-3" /> Rewards centre
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
              Complete tasks, stack extra credits
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Daily check-ins, sponsored ads, social follows and invites — every completed task pays
              straight into your wallet.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-ink-950/60 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tasks available now</span>
              <span className="font-bold text-neon-400">
                {available}/{tasks.length}
              </span>
            </div>
            <ProgressBar className="mt-3" value={(available / Math.max(1, tasks.length)) * 100} />
            <div className="mt-4 flex items-end justify-between">
              <span className="text-xs text-slate-500">Max daily payout</span>
              <span className="font-display text-xl font-bold text-gradient">{pkr(potential)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tasks completed" value={String(history.length)} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Task earnings" value={pkr(totalEarned)} icon={<Gift className="h-5 w-5" />} accent="cyan" />
        <StatCard label="Available now" value={String(available)} hint="Reset on cooldown" icon={<Sparkles className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => {
          const Icon = ICONS[task.icon] ?? Gift;
          return (
            <GlassCard
              key={task.id}
              hover
              className={`flex flex-col p-5 ${task.available ? "border-neon-500/25" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/10 ${
                    task.available
                      ? "bg-gradient-to-br from-neon-500/30 to-aqua-500/10 text-neon-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-neon-500/12 px-2.5 py-1 font-display text-sm font-bold text-neon-400">
                  +{pkr(task.reward)}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-white">{task.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400">{task.description}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-md bg-white/5 px-2 py-0.5 capitalize">{task.kind}</span>
                <span>
                  {task.cooldownHours === 0
                    ? "One-time"
                    : task.cooldownHours === 1
                      ? "Every hour"
                      : `Every ${task.cooldownHours}h`}
                </span>
                {task.done > 0 ? <span>• {task.done}x done</span> : null}
              </div>
              <div className="mt-4">
                {task.available ? (
                  <ActionButton
                    action={completeTaskAction}
                    fields={{ taskId: task.id }}
                    full
                    refreshOnSuccess
                    size="sm"
                    pendingLabel="Claiming…"
                  >
                    Complete & claim
                  </ActionButton>
                ) : (
                  <div className="rounded-xl border border-white/8 bg-white/3 py-2.5 text-center text-xs font-semibold text-slate-500">
                    {task.cooldownHours === 0 ? "Completed" : `Next after ${task.cooldownHours}h cooldown`}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">Reward history</h2>
        <div className="mt-5">
          {history.length === 0 ? (
            <EmptyState icon={<Gift className="h-7 w-7" />} title="No task rewards yet" hint="Complete your first task above." />
          ) : (
            <DataTable head={["Ref", "Task", "Reward", "Date"]}>
              {history.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">#{String(tx.id).padStart(5, "0")}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-white">{tx.method}</td>
                  <td className="px-3 py-3 font-display text-sm font-bold text-neon-400">+{pkr(tx.amount)}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{dateLabel(tx.createdAt)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </GlassCard>
    </div>
  );
}