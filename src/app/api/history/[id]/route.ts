import { db } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/history/[id] — one session with its full message list. */
export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ error: "Session id is required." }, { status: 400 });
  }

  const session = await db.chatSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    return Response.json({ error: "Chat session not found." }, { status: 404 });
  }

  return Response.json({
    session: {
      id: session.id,
      title: session.title,
      agent: session.agent,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    },
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

/** DELETE /api/history/[id] — remove a session (messages cascade). */
export async function DELETE(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!id) {
    return Response.json({ error: "Session id is required." }, { status: 400 });
  }

  const session = await db.chatSession.findUnique({ where: { id }, select: { id: true } });
  if (!session) {
    return Response.json({ error: "Chat session not found." }, { status: 404 });
  }

  await db.chatSession.delete({ where: { id } });
  return Response.json({ ok: true });
}
