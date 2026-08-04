// src/app/actions/ai.ts
"use server";

import { getAISuggestion as getSuggestion } from "@/lib/ai-support";

export async function getAISuggestion(userId: number, issueText: string): Promise<string> {
  return await getSuggestion(userId, issueText);
}
