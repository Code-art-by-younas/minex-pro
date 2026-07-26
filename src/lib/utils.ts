// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ STATUS_STYLES for StatusPill component
export const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  not_submitted: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  running: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  claimable: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  claimed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  default: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

/**
 * Format number as USD currency
 */
export function usd(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(decimals)}`;
}

/**
 * Format number as PKR currency with thousands separator
 */
export function pkr(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'PKR 0.00';

  // Format with thousands separator
  const formatted = num.toFixed(decimals);
  const parts = formatted.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `PKR ${integerPart}.${parts[1] || '00'}`;
}

/**
 * Parse number from string
 */
export function n(value: string | number): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}

/**
 * Format hash rate
 */
export function hashRate(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} TH/s`;
  return `${num.toFixed(1)} GH/s`;
}

/**
 * Get initials from name
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format date label
 */
export function dateLabel(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format day label
 */
export function dayLabel(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Transaction labels
export const TX_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  mining: 'Mining',
  referral: 'Referral',
  task: 'Task',
  bonus: 'Bonus',
  plan: 'Plan Purchase',
};