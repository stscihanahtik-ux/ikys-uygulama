import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyInsights, laws, hrTopics } from "@/db/schema";
import { ensureSeeded, getTodayTrDate } from "@/db/seed";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const randomTopic = searchParams.get("rotate");

    if (randomTopic === "1") {
      // Return a fresh insight preview across all laws and topics
      const [allLaws, allTopics] = await Promise.all([
        db.select().from(laws),
        db.select().from(hrTopics),
      ]);
      const combined = [
        ...allLaws.map((l) => ({
          sourceType: "kanun" as const,
          sourceTitle: l.title,
          headline: `${l.title}: Mevzuat Bilgisi`,
          content: `${l.dailyTips[Math.floor(Math.random() * l.dailyTips.length)] || l.summary} ${l.summary}`,
          exampleCase: l.practicalExample,
          actionItem: `${l.title} süreçlerinizi kontrol listesi ile gözden geçirin.`,
        })),
        ...allTopics.map((t) => ({
          sourceType: (t.type === "technique" ? "teknik" : "metot") as
            | "teknik"
            | "metot",
          sourceTitle: t.title,
          headline: `${t.title}: Uygulama Bilgisi`,
          content: `${t.dailyTips[Math.floor(Math.random() * t.dailyTips.length)] || t.summary} ${t.summary}`,
          exampleCase: t.practicalExample,
          actionItem: `${t.title} metodunu mevcut İK akışınıza entegre edin.`,
        })),
      ];
      const pick = combined[Math.floor(Math.random() * combined.length)];
      return NextResponse.json({
        previewInsight: {
          id: 0,
          insightDate: getTodayTrDate(),
          ...pick,
          isRead: false,
          isBookmarked: false,
        },
      });
    }

    const list = await db
      .select()
      .from(dailyInsights)
      .orderBy(desc(dailyInsights.insightDate))
      .limit(14);

    return NextResponse.json({ insights: list });
  } catch (error) {
    console.error("Daily API GET error:", error);
    return NextResponse.json(
      { error: "Günlük bilgi alınamadı." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isRead, isBookmarked } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "Geçersiz kayıt ID" }, { status: 400 });
    }

    const updates: Partial<{ isRead: boolean; isBookmarked: boolean }> = {};
    if (typeof isRead === "boolean") updates.isRead = isRead;
    if (typeof isBookmarked === "boolean") updates.isBookmarked = isBookmarked;

    const [updated] = await db
      .update(dailyInsights)
      .set(updates)
      .where(eq(dailyInsights.id, id))
      .returning();

    return NextResponse.json({ insight: updated });
  } catch (error) {
    console.error("Daily API PATCH error:", error);
    return NextResponse.json(
      { error: "Günlük bilgi güncellenemedi." },
      { status: 500 }
    );
  }
}
