import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { GlassCard, StatusPill } from "@/components/ui";
import { updateTicketStatus } from "@/app/actions/support";
import { ActionButton } from "@/components/action-button";

export const dynamic = "force-dynamic";

export default async function AdminSupportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const ticketId = parseInt(params.id);
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
  if (!ticket) notFound();

  const [user] = await db.select().from(users).where(eq(users.id, ticket.userId));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Ticket #{ticket.id}</h1>
          <p className="text-sm text-slate-400">Submitted by {user?.name || 'Unknown'}</p>
        </div>
        <StatusPill status={ticket.status} />
      </div>

      <GlassCard className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Category</p>
            <p className="font-semibold text-white capitalize">{ticket.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Priority</p>
            <StatusPill status={ticket.priority} />
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Subject</p>
            <p className="font-semibold text-white">{ticket.subject}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Message</p>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{ticket.message}</p>
          </div>
          {ticket.aiSuggestion && (
            <div className="sm:col-span-2 rounded-lg border border-neon-500/20 bg-neon-500/5 p-3">
              <p className="text-xs text-neon-400">AI Suggestion</p>
              <p className="text-sm text-slate-300">{ticket.aiSuggestion}</p>
            </div>
          )}
          {ticket.adminResponse && (
            <div className="sm:col-span-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs text-emerald-400">Admin Response</p>
              <p className="text-sm text-slate-300">{ticket.adminResponse}</p>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-bold text-white">Respond to Ticket</h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            const response = formData.get('adminResponse') as string;
            const status = formData.get('status') as string;
            await updateTicketStatus(ticketId, status, response);
            redirect('/admin/support');
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300">Status</label>
            <select
              name="status"
              defaultValue={ticket.status}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white focus:border-neon-400 focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Response</label>
            <textarea
              name="adminResponse"
              rows={4}
              placeholder="Type your response here..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-neon-500 to-aqua-500 py-3 font-semibold text-ink-950 transition hover:opacity-90"
          >
            Update Ticket
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
