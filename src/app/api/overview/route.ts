import { NextResponse } from "next/server";
import { db } from "@/db";
import { laws, hrTopics, questions, dailyInsights, bookmarks, chatMessages, sgkCodes } from "@/db/schema";
import { ensureSeeded, getTodayTrDate } from "@/db/seed";
import { getParams, getSetting } from "@/lib/settings";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();

    const todayStr = getTodayTrDate();

    const [allLaws, allTopics, allQuestions, recentInsights, allBookmarks, messages, params, codes, branding] = await Promise.all([
      db.select().from(laws).orderBy(asc(laws.sortOrder), asc(laws.id)),
      db.select().from(hrTopics).orderBy(asc(hrTopics.sortOrder), asc(hrTopics.id)),
      db.select().from(questions).orderBy(asc(questions.id)),
      db.select().from(dailyInsights).orderBy(desc(dailyInsights.insightDate)).limit(14),
      db.select().from(bookmarks).orderBy(desc(bookmarks.createdAt)),
      db.select().from(chatMessages).where(eq(chatMessages.sessionId, "default")).orderBy(asc(chatMessages.id)),
      getParams(),
      db.select().from(sgkCodes).orderBy(asc(sgkCodes.sortOrder), asc(sgkCodes.code)),
      getSetting<Record<string, string>>("branding"),
    ]);

    const todayInsight =
      recentInsights.find((i) => i.insightDate === todayStr) || recentInsights[0] || null;

    return NextResponse.json({
      todayDate: todayStr,
      todayInsight,
      recentInsights,
      laws: allLaws,
      techniques: allTopics.filter((t) => t.type === "technique"),
      methods: allTopics.filter((t) => t.type === "method"),
      questions: allQuestions,
      bookmarks: allBookmarks,
      chatMessages: messages,
      params,
      sgkCodes: codes,
      branding: branding ?? null,
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json({ error: "Veriler yüklenirken bir hata oluştu." }, { status: 500 });
  }
}
