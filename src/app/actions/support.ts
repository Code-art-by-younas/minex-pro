// src/app/actions/support.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { supportTickets, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { detectUserIssues, getAISuggestion } from "@/lib/ai-support";
import { eq, desc } from "drizzle-orm";
import type { ActionState } from "@/lib/action-state";

export async function submitSupportTicket(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please login first" };

  const category = String(formData.get("category") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium").trim();

  if (!category || !subject || !message) {
    return { ok: false, error: "Please fill all required fields" };
  }

  // AI Detection
  const issues = await detectUserIssues(user.id);
  const aiSuggestion = await getAISuggestion(user.id, message);

  // Check if issue can be auto-resolved
  let autoResolved = false;
  let autoResponse = '';

  if (issues.length > 0) {
    for (const issue of issues) {
      if (message.toLowerCase().includes(issue.category)) {
        autoResolved = true;
        autoResponse = issue.solution;
        break;
      }
    }
  }

  // Insert ticket
  const [ticket] = await db.insert(supportTickets).values({
    userId: user.id,
    category,
    priority: priority as any,
    subject,
    message,
    status: autoResolved ? 'resolved' : 'open',
    aiSuggestion: aiSuggestion || null,
    adminResponse: autoResolved ? `AI Solution: ${autoResponse}` : null,
    resolvedAt: autoResolved ? new Date() : null,
  }).returning();

  // Send notification to user
  await db.insert(notifications).values({
    userId: user.id,
    title: autoResolved ? '✅ Issue Auto-Resolved!' : '📩 Support Ticket Submitted',
    body: autoResolved 
      ? `Your issue has been automatically resolved. Solution: ${autoResponse}`
      : `Ticket #${ticket.id} has been submitted. We will respond within 24 hours.`,
    tone: autoResolved ? 'success' : 'info',
    createdAt: new Date(),
  });

  // Send notification to admin (if not auto-resolved)
  if (!autoResolved) {
    const admins = await db.select().from(users).where(eq(users.role, 'admin'));
    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.id,
        title: `📨 New Support Ticket #${ticket.id}`,
        body: `User: ${user.name}\nCategory: ${category}\nSubject: ${subject}\nPriority: ${priority}`,
        tone: 'warning',
        createdAt: new Date(),
      });
    }
  }

  revalidatePath('/support');
  revalidatePath('/admin/support');

  return { 
    ok: true, 
    message: autoResolved 
      ? `✅ Issue resolved! ${autoResponse}` 
      : `Support ticket #${ticket.id} submitted. We'll respond within 24 hours.` 
  };
}

export async function getSupportTickets(userId: number) {
  return await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getAllSupportTickets() {
  return await db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));
}

export async function updateTicketStatus(
  ticketId: number,
  status: string,
  adminResponse: string
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Unauthorized' };
  }

  await db
    .update(supportTickets)
    .set({
      status: status as any,
      adminResponse,
      resolvedAt: status === 'resolved' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  // Get ticket for notification
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));

  await db.insert(notifications).values({
    userId: ticket.userId,
    title: `📋 Support Ticket #${ticketId} Updated`,
    body: `Status: ${status}\nResponse: ${adminResponse}`,
    tone: status === 'resolved' ? 'success' : 'info',
    createdAt: new Date(),
  });

  revalidatePath('/support');
  revalidatePath('/admin/support');
  return { ok: true };
}
