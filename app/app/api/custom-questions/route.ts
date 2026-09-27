import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "app", "data", "custom-questions.json");

async function readCustomQuestions(): Promise<any[]> {
  try {
    const raw = await readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const questions = await readCustomQuestions();
  return NextResponse.json({ questions, count: questions.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questions = body?.questions;

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Body must be { questions: [...] }" }, { status: 400 });
    }

    if (questions.length > 5000) {
      return NextResponse.json({ error: "Too many questions (max 5000)" }, { status: 400 });
    }

    for (const q of questions) {
      if (!q?.id || !q?.title) {
        return NextResponse.json({ error: "Each question needs id and title" }, { status: 400 });
      }
    }

    await writeFile(FILE_PATH, JSON.stringify(questions, null, 2), "utf-8");
    return NextResponse.json({ ok: true, count: questions.length });
  } catch (error) {
    console.error("custom-questions save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
