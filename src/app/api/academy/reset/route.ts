import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/academy/reset — wipe all lesson progress */
export async function POST() {
  try {
    await db.lessonProgress.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/academy/reset] failed:", error);
    return NextResponse.json({ error: "Failed to reset progress" }, { status: 500 });
  }
}
