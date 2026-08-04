"use client";

import { useActionState } from "react";
import { submitSupportTicket } from "@/app/actions/support";

export function SupportForm({ userId }: { userId: number }) {
  const [state, action, pending] = useActionState(submitSupportTicket, { ok: false });

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300">Category</label>
        <select
          name="category"
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white focus:border-neon-400 focus:outline-none"
          required
        >
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdrawal</option>
          <option value="kyc">KYC</option>
          <option value="mining">Mining</option>
          <option value="plans">Plans</option>
          <option value="referral">Referral</option>
          <option value="account">Account</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Priority</label>
        <select
          name="priority"
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white focus:border-neon-400 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Subject</label>
        <input
          type="text"
          name="subject"
          placeholder="Brief summary of your issue"
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Message</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Describe your issue in detail..."
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-400 focus:outline-none"
          required
        />
      </div>

      {state.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state.message && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-neon-500 to-aqua-500 py-3 font-semibold text-ink-950 transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}
