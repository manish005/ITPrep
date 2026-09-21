import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const categoryName = formData.get("categoryName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!categoryName) {
      return NextResponse.json({ error: "Category name required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const uploadDir = path.join(process.cwd(), "public", "images", slug);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const publicUrl = `/images/${slug}/${filename}`;

    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
