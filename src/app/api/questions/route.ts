import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const rows = category
      ? await db
          .select()
          .from(questions)
          .where(eq(questions.category, category))
          .orderBy(asc(questions.id))
      : await db.select().from(questions).orderBy(asc(questions.id));

    return NextResponse.json({ questions: rows });
  } catch (error) {
    console.error("Questions GET error:", error);
    return NextResponse.json(
      { error: "Sorular yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const {
      category,
      topicRef,
      question,
      shortAnswer,
      detailedAnswer,
      legalBasis,
      exampleScenario,
      difficulty,
    } = body;

    if (!question || !shortAnswer) {
      return NextResponse.json(
        { error: "Soru ve kısa cevap alanları zorunludur." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(questions)
      .values({
        category: category || "kanun",
        topicRef: topicRef || "Genel İK & Mevzuat",
        question: String(question).trim(),
        shortAnswer: String(shortAnswer).trim(),
        detailedAnswer: String(detailedAnswer || shortAnswer).trim(),
        legalBasis: String(legalBasis || "Kurumsal İK Uygulaması").trim(),
        exampleScenario: String(
          exampleScenario ||
            "Bu soru kullanıcı tarafından eklenmiş özel bir vaka notudur."
        ).trim(),
        difficulty: difficulty || "Orta",
        isUserCreated: true,
      })
      .returning();

    return NextResponse.json({ question: created }, { status: 201 });
  } catch (error) {
    console.error("Questions POST error:", error);
    return NextResponse.json(
      { error: "Soru kaydedilemedi." },
      { status: 500 }
    );
  }
}
