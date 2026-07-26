"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionButton({
  action,
  fields = {},
  children,
  variant = "primary",
  size = "md",
  full,
  className,
  showFeedback = true,
  refreshOnSuccess = false,
  disabled,
  pendingLabel = "Processing…",
}: {
  action: Action;
  fields?: Record<string, string | number>;
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "subtle" | "success";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  className?: string;
  showFeedback?: boolean;
  refreshOnSuccess?: boolean;
  disabled?: boolean;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const router = useRouter();

  useEffect(() => {
    if (state.ok && refreshOnSuccess) router.refresh();
  }, [state, refreshOnSuccess, router]);

  return (
    <form action={formAction} className={cn(full && "w-full")}>
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}
      <button
        type="submit"
        disabled={pending || disabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "px-3.5 py-2 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3.5 text-base",
          variant === "primary" && "btn-primary",
          variant === "ghost" && "btn-ghost text-slate-100",
          variant === "subtle" && "bg-white/5 text-slate-200 hover:bg-white/10",
          variant === "success" &&
            "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40 hover:bg-emerald-500/25",
          variant === "danger" &&
            "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/40 hover:bg-rose-500/25",
          full && "w-full",
          className,
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </button>
      {showFeedback && (state.error || state.message) ? (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            state.error ? "text-rose-300" : "text-neon-400",
          )}
        >
          {state.error ?? state.message}
        </p>
      ) : null}
    </form>
  );
}

export function FeedbackNote({ state }: { state: ActionState }) {
  if (!state.error && !state.message) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium ring-1",
        state.error
          ? "bg-rose-500/10 text-rose-200 ring-rose-500/30"
          : "bg-neon-500/10 text-neon-400 ring-neon-500/30",
      )}
    >
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span>{state.error ?? state.message}</span>
    </div>
  );
}
