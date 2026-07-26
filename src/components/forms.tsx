"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  Ticket,
  User,
  UserRound,
  Wallet,
} from "lucide-react";
import { startRegistration, verifyRegistration, resendOtp, loginAction } from "@/app/actions/auth";
import {
  changePasswordAction,
  submitDepositAction,
  submitKycAction,
  submitWithdrawAction,
  updateProfileAction,
} from "@/app/actions/app";
import { FeedbackNote } from "@/components/action-button";
import { idleState } from "@/lib/action-state";
import { cn, n, pkr } from "@/lib/utils";

function Submit({ label, pending, icon }: { label: string; pending: boolean; icon?: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60">
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {pending ? "Please wait…" : label}
      </span>
    </button>
  );
}

function PasswordField({
  name,
  placeholder,
  label,
}: {
  name: string;
  placeholder: string;
  label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className="field pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-neon-400"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function IconField({
  name,
  label,
  placeholder,
  icon,
  type = "text",
  defaultValue,
  required = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className="field pl-10"
        />
      </div>
    </div>
  );
}

function OtpInput() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const update = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    setDigits((prev) => {
      const next = [...prev];
      if (clean.length > 1) {
        clean.split("").forEach((c, i) => {
          if (index + i < 6) next[index + i] = c;
        });
        refs.current[Math.min(5, index + clean.length)]?.focus();
      } else {
        next[index] = clean;
        if (clean) refs.current[index + 1]?.focus();
      }
      return next;
    });
  };

  return (
    <div>
      <label className="label">6-digit verification code</label>
      <div className="flex justify-between gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            inputMode="numeric"
            autoComplete="one-time-code"
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i]) refs.current[i - 1]?.focus();
            }}
            className="h-13 w-full rounded-xl border border-white/12 bg-ink-950/80 py-3 text-center font-display text-xl font-bold text-white outline-none transition focus:border-neon-500/70 focus:shadow-[0_0_0_3px_rgba(16,242,140,0.14)]"
          />
        ))}
      </div>
      <input type="hidden" name="code" value={digits.join("")} />
    </div>
  );
}

export function RegisterFlow({ presetReferral }: { presetReferral?: string }) {
  const [startState, startAction, startPending] = useActionState(startRegistration, idleState);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyRegistration, {
    ok: false,
    step: "otp",
  });
  const [resendState, resendAction] = useActionState(resendOtp, { ok: false });

  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [devCode, setDevCode] = useState("");

  useEffect(() => {
    if (startState.ok && startState.step === "otp") {
      setStep("otp");
      setEmail(startState.email ?? "");
      setDevCode(startState.devCode ?? "");
    }
  }, [startState]);

  useEffect(() => {
    if (resendState.ok && resendState.devCode) setDevCode(resendState.devCode);
  }, [resendState]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {["Account details", "Verify OTP"].map((title, i) => {
          const active = (step === "form" && i === 0) || (step === "otp" && i === 1);
          const done = step === "otp" && i === 0;
          return (
            <div key={title} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
                  done
                    ? "bg-neon-500 text-ink-950"
                    : active
                      ? "bg-neon-500/20 text-neon-400 ring-1 ring-neon-500/50"
                      : "bg-white/5 text-slate-500",
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-xs font-semibold", active ? "text-white" : "text-slate-500")}>
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {step === "form" ? (
        <form action={startAction} className="space-y-4">
          <IconField name="name" label="Full name" placeholder="Muhammad Younas" icon={<UserRound className="h-4 w-4" />} />
          <IconField name="email" label="Email address" placeholder="you@email.com" type="email" icon={<Mail className="h-4 w-4" />} />
          <IconField name="phone" label="Phone number" placeholder="03XX-XXXXXXX" icon={<Phone className="h-4 w-4" />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField name="password" label="Password" placeholder="Min. 8 characters" />
            <PasswordField name="confirm" label="Confirm password" placeholder="Repeat password" />
          </div>
          <IconField
            name="referral"
            label="Referral code (optional)"
            placeholder="e.g. AVAC2048"
            required={false}
            defaultValue={presetReferral}
            icon={<Ticket className="h-4 w-4" />}
          />
          <FeedbackNote state={startState} />
          <Submit label="Send verification code" pending={startPending} icon={<ArrowRight className="h-4 w-4" />} />
          {/* ✅ Duplicate link removed – page level link already exists */}
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-aqua-500/25 bg-aqua-500/8 px-4 py-3 text-xs text-aqua-200">
            <p className="font-semibold text-aqua-100">📧 Check your email</p>
            <p className="mt-1 leading-relaxed">
              We sent a 6-digit verification code to{" "}
              <span className="font-semibold text-white">{email}</span>.
              Please enter it below to complete your registration.
            </p>
          </div>
          <form action={verifyAction} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <OtpInput />
            <FeedbackNote state={verifyState} />
            <Submit label="Verify & create account" pending={verifyPending} icon={<ShieldCheck className="h-4 w-4" />} />
          </form>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <button onClick={() => setStep("form")} className="hover:text-slate-300">
              ← Edit details
            </button>
            <form action={resendAction}>
              <input type="hidden" name="email" value={email} />
              <button className="font-semibold text-neon-400 hover:underline">Resend code</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ LOGIN FORM – Duplicate link removed
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { ok: false });
  return (
    <form action={action} className="space-y-4">
      <IconField name="email" label="Email address" placeholder="you@email.com" type="email" icon={<Mail className="h-4 w-4" />} />
      <PasswordField name="password" label="Password" placeholder="Your password" />
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-slate-400">
          <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/20 bg-ink-900 accent-[#10f28c]" />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-slate-500 hover:text-slate-300 transition">
          Forgot password?
        </Link>
      </div>
      <FeedbackNote state={state} />
      <Submit label="Sign in to dashboard" pending={pending} icon={<ArrowRight className="h-4 w-4" />} />
      {/* ✅ Duplicate link removed – page level link already exists */}
    </form>
  );
}

// ✅ DEPOSIT FORM - Pakistan Payment Methods (PKR)
const DEPOSIT_METHODS = [
  {
    id: "Easypaisa",
    icon: Smartphone,
    address: "0329-2993220\nMuhammad Younas",
    note: "Instant - 0% fee",
  },
  {
    id: "Mushriq Bank (Al-Falah)",
    icon: Building2,
    address: "PK26MSHQ0000089200124805\nMuhammad Younas\nMushriq Pakistan",
    note: "1-2 business days",
  },
  {
    id: "HBL Bank",
    icon: Building2,
    address: "08037902738399\nMuhammad Younas\nHBL Pakistan",
    note: "1-2 business days",
  },
];

export function DepositForm() {
  const [state, action, pending] = useActionState(submitDepositAction, { ok: false });
  const [method, setMethod] = useState(DEPOSIT_METHODS[0]);
  const [preview, setPreview] = useState<string>("");
  const [amount, setAmount] = useState("500");
  const [copied, setCopied] = useState(false);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label">Select payment method</label>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEPOSIT_METHODS.map((m) => {
            const Icon = m.icon;
            const active = m.id === method.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-3.5 py-3 text-center transition",
                  active
                    ? "border-neon-500/60 bg-neon-500/10 shadow-[0_0_28px_-12px_rgba(16,242,140,0.9)]"
                    : "border-white/10 bg-white/3 hover:border-aqua-400/40",
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-neon-400" : "text-slate-400")} />
                <span className="text-sm font-semibold text-white">{m.id}</span>
                <span className="text-[10px] text-slate-500">{m.note}</span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="method" value={method.id} />
      </div>

      <div className="rounded-xl border border-aqua-500/25 bg-aqua-500/6 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-aqua-300">
          Send payment to
        </p>
        <div className="mt-1.5 whitespace-pre-wrap font-mono text-sm text-white">
          {method.address}
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(method.address);
            } catch {}
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="mt-2.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-semibold text-aqua-200 hover:bg-white/14"
        >
          {copied ? "Copied ✓" : "Copy account details"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Amount (PKR)</label>
          <input
            name="amount"
            type="number"
            min={100}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field"
            required
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[500, 1000, 2500, 5000, 10000].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-neon-500/15 hover:text-neon-300"
              >
                PKR {v}
              </button>
            ))}
          </div>
        </div>
        <IconField
          name="reference"
          label="Transaction ID / Reference"
          placeholder="e.g. TxnID-12345 or CNIC"
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      <div>
        <label className="label">Upload payment screenshot</label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/3 px-4 py-7 text-center transition hover:border-neon-500/50 hover:bg-neon-500/5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Payment proof" className="max-h-44 rounded-lg object-contain" />
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-slate-500" />
              <span className="mt-2 text-sm font-semibold text-slate-300">Tap to upload proof</span>
              <span className="mt-0.5 text-[11px] text-slate-500">PNG or JPG, up to 1.8MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        <input type="hidden" name="screenshot" value={preview} />
        {preview ? (
          <button
            type="button"
            onClick={() => setPreview("")}
            className="mt-2 text-xs text-rose-300 hover:underline"
          >
            Remove screenshot
          </button>
        ) : null}
      </div>

      <FeedbackNote state={state} />
      <Submit label="Submit deposit for approval" pending={pending} icon={<BadgeCheck className="h-4 w-4" />} />
      <p className="text-center text-[11px] text-slate-500">
        Your deposit will be reviewed within 24 hours.
      </p>
    </form>
  );
}

// ✅ WITHDRAW FORM - Pakistan Payment Methods (PKR)
const WITHDRAW_METHODS = [
  { id: "Easypaisa", icon: Smartphone, label: "Easypaisa" },
  { id: "JazzCash", icon: Smartphone, label: "JazzCash" },
  { id: "Bank Transfer", icon: Building2, label: "Bank Transfer" },
];

export function WithdrawForm({ balance }: { balance: string }) {
  const [state, action, pending] = useActionState(submitWithdrawAction, { ok: false });
  const [amount, setAmount] = useState("500");
  const [method, setMethod] = useState(WITHDRAW_METHODS[0]);
  const value = parseFloat(amount) || 0;
  const fee = Math.max(1, value * 0.02);
  const netAmount = Math.max(0, value - fee);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label">Payout method</label>
        <div className="grid gap-3 sm:grid-cols-3">
          {WITHDRAW_METHODS.map((m) => {
            const Icon = m.icon;
            const active = m.id === method.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-3.5 py-3 text-center transition",
                  active
                    ? "border-neon-500/60 bg-neon-500/10 shadow-[0_0_28px_-12px_rgba(16,242,140,0.9)]"
                    : "border-white/10 bg-white/3 hover:border-aqua-400/40",
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-neon-400" : "text-slate-400")} />
                <span className="text-sm font-semibold text-white">{m.label}</span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="method" value={method.id} />
      </div>

      <IconField
        name="address"
        label="Account details"
        placeholder={
          method.id === "Easypaisa" || method.id === "JazzCash"
            ? "03XX-XXXXXXX (Account Number)"
            : "IBAN or Account Number"
        }
        icon={<Wallet className="h-4 w-4" />}
      />

      <div>
        <label className="label">Amount (PKR)</label>
        <div className="relative">
          <input
            name="amount"
            type="number"
            min={100}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field pr-20"
            required
          />
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(parseFloat(balance) * 100) / 100))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-neon-500/15 px-2.5 py-1 text-[11px] font-bold text-neon-300"
          >
            MAX
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Available: <span className="font-semibold text-slate-300">PKR {parseFloat(balance).toLocaleString()}</span> •
          Minimum PKR 100
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-white/8 bg-white/3 p-4 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Requested</span>
          <span className="font-semibold text-slate-200">PKR {value.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Processing fee (2%)</span>
          <span className="font-semibold text-amber-300">-PKR {fee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-white/8 pt-2 text-sm">
          <span className="font-semibold text-white">You receive</span>
          <span className="font-display font-bold text-neon-400">PKR {netAmount.toLocaleString()}</span>
        </div>
      </div>

      <FeedbackNote state={state} />
      <Submit label="Submit withdrawal request" pending={pending} icon={<ArrowRight className="h-4 w-4" />} />
      <p className="text-center text-[11px] text-slate-500">
        Withdrawals are processed within 24-48 hours after KYC verification.
      </p>
    </form>
  );
}

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, { ok: false });
  return (
    <form action={action} className="space-y-4">
      <IconField name="name" label="Full name" placeholder="Your name" defaultValue={name} icon={<UserRound className="h-4 w-4" />} />
      <div>
        <label className="label">Email address</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={email} disabled className="field cursor-not-allowed pl-10 opacity-60" />
        </div>
      </div>
      <IconField name="phone" label="Phone number" placeholder="03XX-XXXXXXX" defaultValue={phone} icon={<Phone className="h-4 w-4" />} />
      <FeedbackNote state={state} />
      <Submit label="Save changes" pending={pending} icon={<BadgeCheck className="h-4 w-4" />} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, { ok: false });
  return (
    <form action={action} className="space-y-4">
      <PasswordField name="current" label="Current password" placeholder="••••••••" />
      <PasswordField name="next" label="New password" placeholder="Min. 8 characters" />
      <PasswordField name="confirm" label="Confirm new password" placeholder="Repeat new password" />
      <FeedbackNote state={state} />
      <Submit label="Update password" pending={pending} icon={<Lock className="h-4 w-4" />} />
    </form>
  );
}

// ✅ COMPLETE KYC FORM - With Name, CNIC, DOB, Address, Phone, Payment Account
export function KycForm({ status, user }: { status: string; user?: any }) {
  const [state, action, pending] = useActionState(submitKycAction, { ok: false });

  if (status === "verified") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <BadgeCheck className="h-8 w-8 text-emerald-300" />
        <div>
          <p className="text-sm font-semibold text-white">Identity verified ✅</p>
          <p className="text-xs text-emerald-200/80">
            Your KYC is complete. Unlimited withdrawals are enabled on your account.
          </p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
        ⏳ Your KYC documents are under review. This usually takes 24-48 hours.
        <br />
        <span className="text-amber-300/70">You will be notified once verified.</span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
        ❌ Your KYC was rejected. Please re-submit with correct information.
        <br />
        <span className="text-red-300/70">Contact support for more details.</span>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-xl border border-aqua-500/25 bg-aqua-500/6 px-4 py-3 text-xs text-aqua-200">
        <p className="font-semibold">📋 Complete your KYC verification</p>
        <p className="mt-1 leading-relaxed">
          Please provide your accurate information. This helps us verify your identity
          and keep your account secure.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <IconField
          name="fullName"
          label="Full Name (as per CNIC)"
          placeholder="Muhammad Younas"
          icon={<User className="h-4 w-4" />}
        />
        <IconField
          name="cnicNumber"
          label="CNIC Number"
          placeholder="42101-1234567-8"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <IconField
          name="dob"
          label="Date of Birth"
          placeholder="1990-01-01"
          type="date"
          icon={<Calendar className="h-4 w-4" />}
        />
        <div>
          <label className="label">Document Type</label>
          <select name="docType" className="field" defaultValue="CNIC">
            <option value="CNIC">CNIC (Computerized National Identity Card)</option>
            <option value="Passport">Passport</option>
            <option value="DriversLicense">Driver's License</option>
          </select>
        </div>
      </div>

      <IconField
        name="address"
        label="Current Address"
        placeholder="House #, Street, City, Province"
        icon={<Home className="h-4 w-4" />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <IconField
          name="paymentAccount"
          label="Payment Account (JazzCash/Easypaisa/Bank)"
          placeholder="03XX-XXXXXXX or IBAN"
          icon={<UserRound className="h-4 w-4" />}
        />
        <IconField
          name="phone"
          label="Phone Number"
          placeholder="03XX-XXXXXXX"
          type="tel"
          icon={<Phone className="h-4 w-4" />}
        />
      </div>

      <FeedbackNote state={state} />
      <Submit label="Submit KYC for verification" pending={pending} icon={<ShieldCheck className="h-4 w-4" />} />

      <p className="text-center text-[11px] text-slate-500">
        Your information is secure and will only be used for verification purposes.
      </p>
    </form>
  );
}