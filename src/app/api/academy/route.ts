import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEARNING_PATHS } from "@/lib/academy-data";

export const dynamic = "force-dynamic";

/** GET /api/academy — all lesson progress rows */
export async function GET() {
  try {
    const rows = await db.lessonProgress.findMany({
      orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    });
    const progress = rows.map((row) => ({
      pathId: row.pathId,
      lessonId: row.lessonId,
      completed: row.completed,
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    }));
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("[api/academy] GET failed:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}

/** POST /api/academy — upsert completion state for one lesson */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { pathId, lessonId, completed } = (body ?? {}) as {
      pathId?: unknown;
      lessonId?: unknown;
      completed?: unknown;
    };

    if (typeof pathId !== "string" || typeof lessonId !== "string" || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "pathId (string), lessonId (string) and completed (boolean) are required" },
        { status: 400 },
      );
    }

    // Validate that lessonId actually exists inside pathId
    const path = LEARNING_PATHS.find((p) => p.id === pathId);
    if (!path) {
      return NextResponse.json({ error: `Unknown pathId: ${pathId}` }, { status: 400 });
    }
    const lesson = path.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: `Unknown lessonId ${lessonId} for path ${pathId}` },
        { status: 400 },
      );
    }

    await db.lessonProgress.upsert({
      where: { pathId_lessonId: { pathId, lessonId } },
      create: {
        pathId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/academy] POST failed:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
