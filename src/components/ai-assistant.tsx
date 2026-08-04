"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { getAISuggestion } from "@/lib/ai-support";
import { submitSupportTicket } from "@/app/actions/support";

interface AIAssistantProps {
  userId: number;
}

export function AIAssistant({ userId }: AIAssistantProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const suggestion = await getAISuggestion(userId, message);
      setResponse(suggestion);

      // Auto-create ticket if issue persists
      if (suggestion.includes('Please provide more details') || suggestion.includes('contact support')) {
        const formData = new FormData();
        formData.append('category', 'other');
        formData.append('subject', message.slice(0, 50));
        formData.append('message', message);
        formData.append('priority', 'medium');
        const result = await submitSupportTicket({ ok: false }, formData);
        if (result.ok) {
          setTicketCreated(true);
        }
      }
    } catch (error) {
      setResponse("Unable to process. Please submit a support ticket.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue... e.g., KYC verification not working"
            className="flex-1 rounded-lg border border-white/10 bg-ink-950/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-lg bg-neon-500/20 px-4 py-2 text-sm font-semibold text-neon-400 hover:bg-neon-500/30 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-3 rounded-lg border border-neon-500/20 bg-neon-500/5 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-400" />
            <span className="text-xs font-semibold text-neon-400">AI Suggestion</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">{response}</p>
          {ticketCreated && (
            <p className="mt-2 text-xs text-neon-400">✅ Support ticket automatically created for further assistance.</p>
          )}
        </div>
      )}
    </div>
  );
}
