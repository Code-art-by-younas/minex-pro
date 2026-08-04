// src/app/api/cron/route.ts
import { NextResponse } from "next/server";
import { processCompletedPlans } from "@/lib/cron-jobs";

export async function GET() {
  try {
    const count = await processCompletedPlans();
    return NextResponse.json({ 
      success: true, 
      message: `✅ ${count} plans processed successfully!`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}
