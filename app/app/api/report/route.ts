import { NextRequest, NextResponse } from "next/server";
import { generateResearchReport } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const { pair, articles, insight } = await request.json();
    if (!pair || !articles || !insight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const report = await generateResearchReport(pair, articles, insight);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Report generation failed", message: String(error) }, { status: 500 });
  }
}