import { db } from "@/db";
import {
  laws,
  hrTopics,
  questions,
  dailyInsights,
  sgkCodes,
} from "@/db/schema";
import { SGK_CODES_SEED } from "@/data/sgk-codes";
import { LAWS_SEED } from "@/data/laws-seed";
import { HR_TOPICS_SEED } from "@/data/topics-seed";
import { QUESTIONS_SEED } from "@/data/questions-seed";
import { count, eq } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;

function getTodayDateString(offsetDays = 0): string {
  const now = new Date();
  // Use Turkey time (UTC+3) for consistent Turkish daily briefing
  const trTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  trTime.setUTCDate(trTime.getUTCDate() + offsetDays);
  return trTime.toISOString().slice(0, 10);
}

interface DailyCandidate {
  sourceType: "kanun" | "teknik" | "metot";
  sourceTitle: string;
  headline: string;
  content: string;
  exampleCase: string;
  actionItem: string;
}

function buildDailyPool(): DailyCandidate[] {
  const pool: DailyCandidate[] = [];

  for (const law of LAWS_SEED) {
    const tip = law.dailyTips[0] || law.summary;
    pool.push({
      sourceType: "kanun",
      sourceTitle: law.title,
      headline: `${law.title}: Günün Kritik Mevzuat Notu`,
      content: `${tip} ${law.summary}`,
      exampleCase: law.practicalExample,
      actionItem: `${law.title} kapsamında özlük, bordro ve sözleşme süreçlerinizi bugün gözden geçirin.`,
    });
  }

  for (const topic of HR_TOPICS_SEED) {
    const tip = topic.dailyTips[0] || topic.summary;
    const mappedType = topic.type === "technique" ? "teknik" : "metot";
    pool.push({
      sourceType: mappedType,
      sourceTitle: topic.title,
      headline: `${topic.title}: Günün Uygulama Rehberi`,
      content: `${tip} ${topic.summary}`,
      exampleCase: topic.practicalExample,
      actionItem: `${topic.title} yaklaşımını ekibinizde uygulamak için ilk adımı bugün planlayın.`,
    });
  }

  return pool;
}

function deterministicIndexForDate(dateStr: string, poolLength: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % 1000003;
  }
  return hash % poolLength;
}

export async function ensureDailyInsightForDate(dateStr: string) {
  const existing = await db
    .select()
    .from(dailyInsights)
    .where(eq(dailyInsights.insightDate, dateStr))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const pool = buildDailyPool();
  const idx = deterministicIndexForDate(dateStr, pool.length);
  const picked = pool[idx];

  const [inserted] = await db
    .insert(dailyInsights)
    .values({
      insightDate: dateStr,
      sourceType: picked.sourceType,
      sourceTitle: picked.sourceTitle,
      headline: picked.headline,
      content: picked.content,
      exampleCase: picked.exampleCase,
      actionItem: picked.actionItem,
      isRead: false,
      isBookmarked: false,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted) return inserted;

  const fallback = await db
    .select()
    .from(dailyInsights)
    .where(eq(dailyInsights.insightDate, dateStr))
    .limit(1);
  return fallback[0];
}

async function runSeed() {
  const [{ value: lawCount }] = await db.select({ value: count() }).from(laws);
  if (lawCount === 0) {
    await db.insert(laws).values(LAWS_SEED).onConflictDoNothing();
  }

  const [{ value: topicCount }] = await db
    .select({ value: count() })
    .from(hrTopics);
  if (topicCount === 0) {
    await db.insert(hrTopics).values(HR_TOPICS_SEED).onConflictDoNothing();
  }

  const [{ value: questionCount }] = await db
    .select({ value: count() })
    .from(questions);
  if (questionCount === 0) {
    await db.insert(questions).values(QUESTIONS_SEED);
  }

  const [{ value: sgkCount }] = await db.select({ value: count() }).from(sgkCodes);
  if (sgkCount === 0) {
    await db.insert(sgkCodes).values(SGK_CODES_SEED).onConflictDoNothing();
  }

  // Ensure today + previous 6 days have daily insights ready
  for (let offset = 0; offset >= -6; offset--) {
    const d = getTodayDateString(offset);
    await ensureDailyInsightForDate(d);
  }
}

export async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export function getTodayTrDate(): string {
  return getTodayDateString(0);
}
