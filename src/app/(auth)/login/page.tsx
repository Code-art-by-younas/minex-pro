import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — MineX Pro" };

export default async function LoginPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sign in to your account and continue mining.
      </p>
      <div className="mt-7">
        <LoginForm />
      </div>
      {/* ✅ Duplicate link removed - LoginForm already has it */}
    </div>
  );
}