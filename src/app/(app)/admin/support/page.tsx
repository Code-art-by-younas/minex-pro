import Link from "next/link";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard, StatusPill } from "@/components/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support Tickets — Admin" };

export default async function AdminSupportPage() {
  await requireAdmin();

  const tickets = await db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));

  // Get user names for tickets
  const ticketsWithUsers = await Promise.all(
    tickets.map(async (ticket) => {
      const [user] = await db.select().from(users).where(eq(users.id, ticket.userId));
      return { ...ticket, userName: user?.name || 'Unknown', userEmail: user?.email || '' };
    })
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-400">Manage user support requests</p>
        </div>
        <span className="rounded-full bg-neon-500/20 px-3 py-1 text-xs font-bold text-neon-400">
          {tickets.filter(t => t.status === 'open').length} open
        </span>
      </div>

      <GlassCard className="p-6">
        {ticketsWithUsers.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No support tickets yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400">ID</th>
                  <th className="px-4 py-3 text-left text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-left text-slate-400">Priority</th>
                  <th className="px-4 py-3 text-left text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {ticketsWithUsers.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/3">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white">{ticket.userName}</p>
                        <p className="text-xs text-slate-400">{ticket.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neon-500/10 px-2 py-0.5 text-xs font-semibold text-neon-400 capitalize">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-white">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={ticket.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(ticket.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
