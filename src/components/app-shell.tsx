"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Cpu,
  Gauge,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Pickaxe,
  Shield,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Wallet,
  X,
  Download,
  HelpCircle, // ✅ Added for Help & Support
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn, initials, pkr } from "@/lib/utils"; // ✅ Use pkr

export type ShellUser = {
  name: string;
  email: string;
  role: string;
  balance: string;
  referralCode: string;
  miningPower: string;
  planName: string;
  kycStatus: string;
};

export type ShellNotification = {
  id: number;
  title: string;
  body: string;
  tone: string;
  createdAt: Date | string;
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mining", label: "Mining Rig", icon: Pickaxe },
  { href: "/plans", label: "Plans", icon: Gauge },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/deposit", label: "Deposit", icon: Download },
  { href: "/withdraw", label: "Withdraw", icon: Upload },
  { href: "/referral", label: "Referral", icon: Users },
  { href: "/tasks", label: "Tasks", icon: Gift },
  { href: "/profile", label: "Profile", icon: UserRound },
  // ✅ Added Help & Support
  { href: "/support", label: "Help & Support", icon: HelpCircle },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/mining", label: "Mine", icon: Pickaxe },
  { href: "/plans", label: "Plans", icon: Gauge },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/tasks", label: "Tasks", icon: Gift },
];

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-500 to-aqua-500 shadow-[0_0_24px_-4px_rgba(16,242,140,0.9)]">
        <Cpu className="h-5 w-5 text-ink-950" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
      </span>
      {!compact ? (
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          Mine<span className="text-gradient">X</span> Pro
        </span>
      ) : null}
    </Link>
  );
}

function NavList({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = role === "admin" ? [...NAV, { href: "/admin", label: "Admin Panel", icon: Shield }] : NAV;
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-neon-500/18 to-transparent text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
            )}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-neon-400 to-aqua-400 shadow-[0_0_12px_rgba(16,242,140,0.9)]" />
            ) : null}
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                active ? "text-neon-400" : "text-slate-500 group-hover:text-aqua-400",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications: ShellNotification[];
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-white/8 bg-ink-950/80 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="glass mt-6 rounded-2xl p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Wallet Balance
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-gradient">{pkr(user.balance)}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-neon-400" />
            {user.planName} • {user.miningPower} GH/s
          </div>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <p className="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Menu
          </p>
          <NavList role={user.role} />
        </div>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
        </form>
      </aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[272px] flex-col border-r border-white/10 bg-ink-950 px-4 py-6">
            <div className="flex items-center justify-between px-1">
              <Brand />
              <button
                onClick={() => setDrawer(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="glass mt-5 rounded-2xl p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Balance</p>
              <p className="font-display text-xl font-bold text-gradient">{pkr(user.balance)}</p>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto">
              <NavList role={user.role} onNavigate={() => setDrawer(false)} />
            </div>
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300">
                <LogOut className="h-[18px] w-[18px]" /> Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/8 bg-ink-950/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setDrawer(true)}
              className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Brand compact />
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-neon-500/20 bg-neon-500/6 px-3 py-2 sm:flex">
                <Wallet className="h-4 w-4 text-neon-400" />
                <span className="font-display text-sm font-bold text-white">{pkr(user.balance)}</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setBell((v) => !v)}
                  className="relative rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-aqua-400/40 hover:text-aqua-400"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neon-500 text-[9px] font-bold text-ink-950">
                      {notifications.length}
                    </span>
                  ) : null}
                </button>
                {bell ? (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setBell(false)} />
                    <div className="glass absolute right-0 z-20 mt-2 w-[290px] rounded-2xl p-2 sm:w-[340px]">
                      <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Notifications
                      </p>
                      <div className="max-h-80 space-y-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs text-slate-500">
                            You are all caught up.
                          </p>
                        ) : (
                          notifications.map((note) => (
                            <div
                              key={note.id}
                              className="rounded-xl px-3 py-2.5 transition hover:bg-white/5"
                            >
                              <p className="text-sm font-semibold text-slate-100">{note.title}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{note.body}</p>
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                                {new Date(note.createdAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-xl border border-white/10 py-1.5 pl-1.5 pr-3 transition hover:border-neon-500/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-500 to-aqua-500 text-xs font-bold text-ink-950">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold leading-tight text-white">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-neon-400">
                    {user.role === "admin" ? "Admin" : user.planName}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileTabs role={user.role} />
    </div>
  );
}

function MobileTabs({ role }: { role: string }) {
  const pathname = usePathname();
  const items =
    role === "admin"
      ? [...MOBILE_NAV.slice(0, 4), { href: "/admin", label: "Admin", icon: Shield }]
      : MOBILE_NAV;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition",
                active ? "text-neon-400" : "text-slate-500",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(16,242,140,0.8)]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
