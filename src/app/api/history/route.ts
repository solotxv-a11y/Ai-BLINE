import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/history — all chat sessions, newest activity first. */
export async function GET() {
  const sessions = await db.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { _count: { select: { messages: true } } },
  });

  return Response.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      agent: s.agent,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      messageCount: s._count.messages,
    })),
  });
}
