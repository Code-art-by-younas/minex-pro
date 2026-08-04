// src/lib/ai-support.ts
import { db } from "@/db";
import { users, transactions, miningSessions, userPlans } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IssueAnalysis {
  detected: boolean;
  category: string;
  description: string;
  solution: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export async function detectUserIssues(userId: number): Promise<IssueAnalysis[]> {
  const issues: IssueAnalysis[] = [];

  // 1. Check KYC Status
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user.kycStatus === 'not_submitted') {
    issues.push({
      detected: true,
      category: 'kyc',
      description: 'KYC not submitted. Withdrawals require KYC verification.',
      solution: 'Go to Profile → KYC Verification → Submit your documents (CNIC, DOB, Address, Payment Account)',
      priority: 'high',
    });
  } else if (user.kycStatus === 'pending') {
    issues.push({
      detected: true,
      category: 'kyc',
      description: 'KYC is pending review. Please wait 24-48 hours.',
      solution: 'KYC usually takes 24-48 hours. You will be notified once verified.',
      priority: 'medium',
    });
  } else if (user.kycStatus === 'rejected') {
    issues.push({
      detected: true,
      category: 'kyc',
      description: 'KYC was rejected. Please re-submit with correct information.',
      solution: 'Go to Profile → KYC Verification → Re-submit your documents with accurate details',
      priority: 'urgent',
    });
  }

  // 2. Check Balance
  const balance = parseFloat(user.balance);
  if (balance < 100) {
    issues.push({
      detected: true,
      category: 'deposit',
      description: 'Low balance (less than 100 PKR). Minimum deposit required to start mining.',
      solution: 'Go to Deposit → Select payment method → Deposit minimum 100 PKR',
      priority: 'medium',
    });
  }

  // 3. Check Active Plan
  const activePlan = await db
    .select()
    .from(userPlans)
    .where(
      and(
        eq(userPlans.userId, userId),
        eq(userPlans.status, 'active')
      )
    )
    .limit(1);

  if (activePlan.length === 0) {
    issues.push({
      detected: true,
      category: 'plans',
      description: 'No active plan found. Start mining by purchasing a plan.',
      solution: 'Go to Plans → Choose 10 Days or Monthly plan → Click "Buy Now"',
      priority: 'low',
    });
  }

  // 4. Check Pending Withdrawals
  const pendingWithdrawals = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'withdraw'),
        eq(transactions.status, 'pending')
      )
    );

  if (pendingWithdrawals[0]?.count > 0) {
    issues.push({
      detected: true,
      category: 'withdraw',
      description: `You have ${pendingWithdrawals[0].count} pending withdrawal(s).`,
      solution: 'Pending withdrawals take 24-48 hours. If longer, contact support.',
      priority: 'high',
    });
  }

  // 5. Check Mining Sessions
  const runningSessions = await db
    .select({ count: count() })
    .from(miningSessions)
    .where(
      and(
        eq(miningSessions.userId, userId),
        eq(miningSessions.status, 'running')
      )
    );

  if (runningSessions[0]?.count > 0) {
    issues.push({
      detected: true,
      category: 'mining',
      description: 'You have an active mining cycle running.',
      solution: 'Wait for the cycle to complete, then click "Claim Reward".',
      priority: 'low',
    });
  }

  return issues;
}

export async function getAISuggestion(userId: number, issueText: string): Promise<string> {
  const issues = await detectUserIssues(userId);
  
  // Check if issue matches any detected problem
  for (const issue of issues) {
    if (issueText.toLowerCase().includes(issue.category) || 
        issueText.toLowerCase().includes('problem') ||
        issueText.toLowerCase().includes('help')) {
      return issue.solution;
    }
  }

  // Default suggestions based on keywords
  const keywords: Record<string, string> = {
    'deposit': 'Go to Deposit page → Select Easypaisa/JazzCash/Bank → Send payment → Upload screenshot. Approval takes 5-10 minutes.',
    'withdraw': 'Go to Withdraw page → Select method → Enter amount → Submit. KYC required. Processing 24-48 hours.',
    'kyc': 'Go to Profile → KYC Verification → Submit CNIC, DOB, Address, Payment Account. Review takes 24-48 hours.',
    'plan': 'Go to Plans page → Choose 10 Days or Monthly plan → Click Buy Now. Investment starts earning daily.',
    'mining': 'Go to Mining Rig → Click Start Mining → Wait for cycle to complete → Claim Reward.',
    'referral': 'Go to Referral page → Copy your link → Share with friends. Earn milestone rewards up to 500 PKR.',
    'balance': 'Your balance is low. Go to Deposit page to add funds.',
    'login': 'Check your email and password. Use "Forgot Password" if needed.',
  };

  for (const [key, value] of Object.entries(keywords)) {
    if (issueText.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'Please provide more details about your issue. I\'ll help you find the right solution.';
}
