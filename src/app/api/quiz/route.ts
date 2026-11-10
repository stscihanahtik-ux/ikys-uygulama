import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { readSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await readSession(req);
    const rows = session
      ? await db.select().from(quizAttempts).where(eq(quizAttempts.userId, session.userId)).orderBy(desc(quizAttempts.id))
      : await db.select().from(quizAttempts);
    const total = rows.length;
    const correct = rows.filter((r) => r.isCorrect || r.known).length;
    return NextResponse.json({
      total,
      correct,
      wrong: total - correct,
      score: total ? Math.round((correct / total) * 100) : 0,
      recent: rows.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ total: 0, correct: 0, wrong: 0, score: 0, recent: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questionId = Number(body?.questionId);
    const isCorrect = Boolean(body?.isCorrect ?? body?.known);
    if (!questionId) return NextResponse.json({ error: "Geçersiz soru" }, { status: 400 });

    const session = await readSession(req);
    await db.insert(quizAttempts).values({
      questionId,
      known: isCorrect,
      isCorrect,
      chosenOption: typeof body?.chosenOption === "string" ? body.chosenOption.slice(0, 2000) : null,
      userId: session?.userId ?? null,
    });

    const rows = session
      ? await db.select().from(quizAttempts).where(eq(quizAttempts.userId, session.userId))
      : await db.select().from(quizAttempts);
    const total = rows.length;
    const correct = rows.filter((r) => r.isCorrect || r.known).length;
    return NextResponse.json({
      total,
      correct,
      wrong: total - correct,
      score: total ? Math.round((correct / total) * 100) : 0,
    });
  } catch (error) {
    console.error("Quiz POST error:", error);
    return NextResponse.json({ error: "Skor kaydedilemedi." }, { status: 500 });
  }
}

export async function DELETE() {
  // İstatistik sıfırlama yalnızca yönetici için (panelden kullanılır)
  return NextResponse.json({ cleared: false });
}

export async function PATCH(req: NextRequest) {
  const session = await readSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim. Lütfen Admin girişi yapın." }, { status: 401 });
  }
  await db.delete(quizAttempts);
  const [{ value }] = await db.select({ value: count() }).from(quizAttempts);
  return NextResponse.json({ cleared: true, total: Number(value) });
}
