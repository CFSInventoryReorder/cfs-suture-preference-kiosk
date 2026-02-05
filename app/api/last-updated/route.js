import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "preference_cards.csv");
    const stat = await fs.stat(filePath);
    return NextResponse.json({ mtimeMs: stat.mtimeMs }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unable to read data file timestamp" }, { status: 500 });
  }
}
