import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KINDS = new Set(["message", "tool", "lesson"]);

/** GET /api/saved — list all saved items (newest first) */
export async function GET() {
  try {
    const items = await db.savedItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/saved failed:", err);
    return NextResponse.json({ error: "Failed to load saved items" }, { status: 500 });
  }
}

/** POST /api/saved — create a saved item { title, content, kind? } */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const { title, content, kind } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const safeKind = typeof kind === "string" && VALID_KINDS.has(kind) ? kind : "message";

  try {
    const item = await db.savedItem.create({
      data: {
        title: title.trim().slice(0, 200),
        content,
        kind: safeKind,
      },
    });
    return NextResponse.json({ item });
  } catch (err) {
    console.error("POST /api/saved failed:", err);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}
