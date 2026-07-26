export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  step?: "form" | "otp";
  email?: string;
  devCode?: string;
};

export const idleState: ActionState = { ok: false, step: "form" };
