import Link from "next/link";
import { HelpCircle, MessageCircle, Sparkles, Search, BookOpen } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { faqArticles, supportTickets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SupportForm } from "@/components/forms/support";
import { AIAssistant } from "@/components/ai-assistant";

export const dynamic = "force-dynamic";
export const metadata = { title: "Help & Support — MineX Pro" };

export default async function SupportPage() {
  const user = await requireUser();

  // Get FAQs
  const faqs = await db
    .select()
    .from(faqArticles)
    .where(eq(faqArticles.isActive, true))
    .orderBy(faqArticles.views);

  // Get user's tickets
  const tickets = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, user.id))
    .orderBy(desc(supportTickets.createdAt))
    .limit(5);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Help & Support 🤝
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Get answers to common questions or submit a support ticket.
        </p>
      </div>

      {/* AI Support Assistant */}
      <GlassCard glow="cyan" className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-neon-400" />
          <h2 className="font-display text-lg font-bold text-white">AI Support Assistant</h2>
          <span className="rounded-full bg-neon-500/20 px-2 py-0.5 text-xs font-semibold text-neon-400">BETA</span>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Describe your issue and our AI will automatically detect and suggest solutions.
        </p>
        <div className="mt-4">
          <AIAssistant userId={user.id} />
        </div>
      </GlassCard>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* FAQ Section */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-neon-400" />
            <h2 className="font-display text-lg font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="mt-4 space-y-3">
            {faqs.length === 0 ? (
              <p className="text-sm text-slate-400">No FAQs available yet.</p>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-white/8 bg-white/3 p-4 transition hover:border-neon-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-neon-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-neon-400">
                          {faq.category}
                        </span>
                        <span className="text-xs text-slate-500">👁️ {faq.views} views</span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-white">{faq.title}</h3>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                        {faq.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Submit Ticket */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-neon-400" />
              <h2 className="font-display text-lg font-bold text-white">Submit Ticket</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              For any issue not covered in FAQs, submit a ticket. We'll respond within 24 hours.
            </p>
            <div className="mt-4">
              <SupportForm userId={user.id} />
            </div>
          </GlassCard>

          {/* Recent Tickets */}
          <GlassCard className="p-6">
            <h2 className="font-display text-lg font-bold text-white">Recent Tickets</h2>
            <div className="mt-4 space-y-2">
              {tickets.length === 0 ? (
                <p className="text-sm text-slate-400">No support tickets submitted yet.</p>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                      <p className="text-xs text-slate-400">{ticket.category}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                        ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ticket.status}
                      </span>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {new Date(ticket.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
