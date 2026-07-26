import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getNotifications, getPlanById, refreshExpiredPlan } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  await refreshExpiredPlan(user);

  const [plan, notes] = await Promise.all([getPlanById(user.planId), getNotifications(user.id)]);

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referralCode: user.referralCode,
        miningPower: user.miningPower,
        planName: plan?.name ?? "No plan",
        kycStatus: user.kycStatus,
      }}
      notifications={notes.map((note) => ({
        id: note.id,
        title: note.title,
        body: note.body,
        tone: note.tone,
        createdAt: note.createdAt,
      }))}
    >
      {children}
    </AppShell>
  );
}
