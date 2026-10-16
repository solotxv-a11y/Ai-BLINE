import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/saved/clear — remove every saved item */
export async function DELETE() {
  try {
    await db.savedItem.deleteMany();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/saved/clear failed:", err);
    return NextResponse.json({ error: "Failed to clear saved items" }, { status: 500 });
  }
}
