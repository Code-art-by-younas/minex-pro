import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn, STATUS_STYLES } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: "none" | "green" | "cyan";
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-2xl",
        glow === "green" && "glow-ring",
        glow === "cyan" && "glow-ring-cyan",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-neon-500/40 hover:shadow-[0_24px_70px_-30px_rgba(16,242,140,0.7)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-500/25 bg-neon-500/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-400 animate-blink" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1",
        STATUS_STYLES[status] ?? "bg-slate-500/10 text-slate-300 ring-slate-500/30",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace("_", " ")}
    </span>
  );
}

type ButtonBase = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
};

function buttonClasses({ variant = "primary", size = "md", className, full }: ButtonBase) {
  return cn(
    "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "px-3.5 py-2 text-xs",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-7 py-3.5 text-base",
    variant === "primary" && "btn-primary",
    variant === "ghost" && "btn-ghost text-slate-100",
    variant === "subtle" && "bg-white/5 text-slate-200 hover:bg-white/10 transition-colors",
    variant === "danger" &&
      "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/40 hover:bg-rose-500/25 transition-colors",
    full && "w-full",
    className,
  );
}

export function Button({
  children,
  variant,
  size,
  className,
  full,
  ...rest
}: ButtonBase & ComponentProps<"button">) {
  return (
    <button className={buttonClasses({ children, variant, size, className, full })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant,
  size,
  className,
  full,
  href,
  ...rest
}: ButtonBase & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={buttonClasses({ children, variant, size, className, full })} {...rest}>
      {children}
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "green",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "green" | "cyan" | "violet" | "amber";
  className?: string;
}) {
  const accents: Record<string, string> = {
    green: "from-neon-500/25 to-transparent text-neon-400",
    cyan: "from-aqua-500/25 to-transparent text-aqua-400",
    violet: "from-violet-500/25 to-transparent text-violet-300",
    amber: "from-amber-500/25 to-transparent text-amber-300",
  };
  return (
    <GlassCard hover className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-2 truncate font-display text-2xl font-bold text-white">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-slate-400">{hint}</p> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/10",
              accents[accent],
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-neon-500/10 blur-2xl" />
    </GlassCard>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-slate-500">{icon}</div> : null}
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-neon-500 via-emerald-300 to-aqua-400 transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
        style={{ width: `${pct}%` }}
      >
        <div className="absolute inset-y-0 w-1/3 bg-white/30 blur-md animate-shimmer" />
      </div>
    </div>
  );
}

export function DataTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}
