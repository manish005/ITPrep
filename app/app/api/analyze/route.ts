import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsForPair } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { pair, articles } = await request.json();
    if (!pair || !articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: "Missing pair or articles" }, { status: 400 });
    }
    const insight = await analyzeNewsForPair(pair, articles);
    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json({ error: "Analysis failed", message: String(error) }, { status: 500 });
  }
}