import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyInsights, hrTopics, laws } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { addDays, todayIso } from "@/lib/business-days";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 8000): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const iso = (v: unknown): string => {
  const s = str(v, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) ? s : "";
};

interface InsightInput {
  insightDate: string;
  sourceType: "kanun" | "teknik" | "metot";
  sourceTitle: string;
  headline: string;
  content: string;
  exampleCase: string;
  actionItem: string;
  isRead: boolean;
  isBookmarked: boolean;
}

function cleanItem(v: unknown): InsightInput | string {
  const o = (v ?? {}) as Record<string, unknown>;
  const insightDate = iso(o.insightDate);
  const headline = str(o.headline, 500);
  const content = str(o.content);
  if (!insightDate) return "Geçerli bir tarih girin (YYYY-AA-GG).";
  if (!headline || !content) return "Başlık ve içerik zorunludur.";
  const st = o.sourceType === "teknik" || o.sourceType === "metot" ? o.sourceType : "kanun";
  return {
    insightDate,
    sourceType: st,
    sourceTitle: str(o.sourceTitle, 300),
    headline,
    content,
    exampleCase: str(o.exampleCase),
    actionItem: str(o.actionItem, 2000),
    isRead: o.isRead === true,
    isBookmarked: o.isBookmarked === true,
  };
}

/** Her kanun (ve istenirse her teknik/metot) için ayrı günlük bilgi üretir */
async function generate(body: Record<string, unknown>) {
  const includeTopics = body.includeTopics === true;
  const overwrite = body.overwrite === true;
  const start = typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate) ? body.startDate : todayIso();

  const [lawRows, topicRows, existing] = await Promise.all([
    db.select().from(laws).orderBy(asc(laws.sortOrder), asc(laws.id)),
    db.select().from(hrTopics).orderBy(asc(hrTopics.sortOrder), asc(hrTopics.id)),
    db.select().from(dailyInsights),
  ]);

  type Candidate = Omit<InsightInput, "insightDate" | "isRead" | "isBookmarked">;
  const candidates: Candidate[] = lawRows.map((l) => ({
    sourceType: "kanun",
    sourceTitle: l.title,
    headline: `${l.title}: Günün Kritik Mevzuat Notu`,
    content: `${l.dailyTips[0] ?? l.summary}\n\n${l.summary}`,
    exampleCase: l.practicalExample,
    actionItem: `${l.title} kapsamında özlük, bordro ve sözleşme süreçlerinizi bugün gözden geçirin.`,
  }));

  if (includeTopics) {
    for (const t of topicRows) {
      candidates.push({
        sourceType: t.type === "technique" ? "teknik" : "metot",
        sourceTitle: t.title,
        headline: `${t.title}: Günün Uygulama Rehberi`,
        content: `${t.dailyTips[0] ?? t.summary}\n\n${t.summary}`,
        exampleCase: t.practicalExample,
        actionItem: `${t.title} yaklaşımını ekibinizde uygulamak için ilk adımı bugün planlayın.`,
      });
    }
  }

  const taken = new Set(existing.map((e) => e.insightDate));
  const existingTitles = new Set(existing.map((e) => e.sourceTitle));
  let date = start;
  let created = 0;
  let skipped = 0;

  for (const c of candidates) {
    if (!overwrite && existingTitles.has(c.sourceTitle)) {
      skipped += 1;
      continue;
    }
    while (taken.has(date)) date = addDays(date, 1);
    await db
      .insert(dailyInsights)
      .values({ insightDate: date, ...c, isRead: false, isBookmarked: false })
      .onConflictDoUpdate({ target: dailyInsights.insightDate, set: { ...c, isRead: false } });
    taken.add(date);
    existingTitles.add(c.sourceTitle);
    created += 1;
    date = addDays(date, 1);
  }

  return NextResponse.json({ ok: true, created, skipped, totalCandidates: candidates.length, lastDate: date });
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const rows = await db.select().from(dailyInsights).orderBy(asc(dailyInsights.insightDate));
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = str(body.action, 30) || "generate";

  try {
    if (action === "generate") return await generate(body);

    if (action === "upsert") {
      const cleaned = cleanItem(body.item);
      if (typeof cleaned === "string") return NextResponse.json({ error: cleaned }, { status: 400 });

      const id = Number(body.id);
      if (Number.isInteger(id) && id > 0) {
        const [row] = await db
          .update(dailyInsights)
          .set(cleaned)
          .where(eq(dailyInsights.id, id))
          .returning();
        if (!row) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
        return NextResponse.json({ row });
      }
      const [row] = await db
        .insert(dailyInsights)
        .values(cleaned)
        .onConflictDoUpdate({ target: dailyInsights.insightDate, set: cleaned })
        .returning();
      return NextResponse.json({ row }, { status: 201 });
    }

    return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
  } catch (error) {
    console.error("Admin daily error:", error);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Geçersiz kayıt" }, { status: 400 });
  const update: Partial<{ isRead: boolean; isBookmarked: boolean }> = {};
  if (typeof body.isRead === "boolean") update.isRead = body.isRead;
  if (typeof body.isBookmarked === "boolean") update.isBookmarked = body.isBookmarked;
  const [row] = await db.update(dailyInsights).set(update).where(eq(dailyInsights.id, id)).returning();
  return NextResponse.json({ row: row ?? null });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  let id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) {
    const body = (await req.json().catch(() => ({}))) as { id?: unknown };
    id = Number(body.id);
  }
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Geçersiz kayıt" }, { status: 400 });
  await db.delete(dailyInsights).where(eq(dailyInsights.id, id));
  return NextResponse.json({ ok: true });
}
