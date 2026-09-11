import { NextRequest, NextResponse } from "next/server";
import { fetchNewsFromSources } from "@/lib/firecrawl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const articles = await fetchNewsFromSources();
    return NextResponse.json({ articles, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news", message: String(error) }, { status: 500 });
  }
}