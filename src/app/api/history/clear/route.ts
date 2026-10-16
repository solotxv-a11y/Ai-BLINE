import { db } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/history/clear — delete every chat session (messages cascade). */
export async function POST() {
  await db.chatSession.deleteMany({});
  return Response.json({ ok: true });
}
