import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizAttempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureDefaultAdmin, readSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Oturumdaki kullanıcı + kişisel test istatistiği */
export async function GET(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    const session = await readSession(req);
    if (!session) return NextResponse.json({ user: null });

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, session.userId))
      .orderBy(desc(quizAttempts.id))
      .limit(50);
    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    return NextResponse.json({
      user: { id: session.userId, username: session.username, fullName: session.fullName, role: session.role },
      quiz: { total, correct, wrong: total - correct, score: total ? Math.round((correct / total) * 100) : 0, recent: attempts.slice(0, 10) },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}
