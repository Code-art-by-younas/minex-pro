import { redirect } from "next/navigation";
import { RegisterFlow } from "@/components/forms";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create account — MineX Pro" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");
  const { ref } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Get started with cloud mining in minutes.
      </p>
      <div className="mt-7">
        <RegisterFlow presetReferral={ref?.toUpperCase()} />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/login" className="text-neon-400 hover:text-neon-300 font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}