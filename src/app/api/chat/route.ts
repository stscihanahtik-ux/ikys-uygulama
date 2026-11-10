import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { generateRobotReply, type RobotMode } from "@/lib/hr-robot";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function toClient(m: typeof chatMessages.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

export async function GET() {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, "default"))
      .orderBy(asc(chatMessages.id));
    return NextResponse.json({ messages: rows.map(toClient) });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Sohbet geçmişi alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const userMessage = String(body?.message || "").trim();
    const mode = (["hizli", "detayli", "adim", "ornek", "belge"].includes(body?.mode) ? body.mode : "detayli") as RobotMode;

    if (!userMessage) {
      return NextResponse.json({ error: "Lütfen bir soru yazın." }, { status: 400 });
    }

    const [savedUserMsg] = await db
      .insert(chatMessages)
      .values({ sessionId: "default", role: "user", content: userMessage, citations: [], exampleBox: null, mode, intent: "kullanici", followUps: [], feedback: null })
      .returning();

    // Conversation context: last exchanges for follow-up questions
    const recent = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, "default"))
      .orderBy(desc(chatMessages.id))
      .limit(7);
    const history = recent
      .reverse()
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }));

    const reply = await generateRobotReply(userMessage, history, mode);

    const [savedAssistantMsg] = await db
      .insert(chatMessages)
      .values({
        sessionId: "default",
        role: "assistant",
        content: reply.answer,
        citations: reply.citations,
        exampleBox: reply.exampleBox,
        mode,
        intent: reply.intent,
        followUps: reply.followUps || [],
        feedback: null,
      })
      .returning();

    return NextResponse.json({
      userMessage: toClient(savedUserMsg),
      assistantMessage: toClient(savedAssistantMsg),
      confidence: reply.confidence,
      action: reply.action || null,
    });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Robot yanıt oluştururken bir hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body?.id);
    const feedback = body?.feedback === "up" || body?.feedback === "down" ? body.feedback : null;
    if (!id) return NextResponse.json({ error: "Geçersiz mesaj" }, { status: 400 });
    const [updated] = await db.update(chatMessages).set({ feedback }).where(eq(chatMessages.id, id)).returning();
    return NextResponse.json({ message: updated ? toClient(updated) : null });
  } catch (error) {
    console.error("Chat PATCH error:", error);
    return NextResponse.json({ error: "Geri bildirim kaydedilemedi." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, "default"));
    return NextResponse.json({ cleared: true });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json({ error: "Sohbet temizlenemedi." }, { status: 500 });
  }
}
