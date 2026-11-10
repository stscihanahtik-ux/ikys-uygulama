import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  laws,
  hrTopics,
  questions,
  announcements,
  featureRequests,
  sgkCodes,
  employees,
  type LawArticle,
  type MethodComponent,
} from "@/db/schema";
import { recordsFromCsv, toCsv } from "@/lib/csv";

type Dict = Record<string, unknown>;
export type Clean<T> = { ok: true; value: T } | { ok: false; error: string };
export type WriteResult = { ok: true; row: unknown } | { ok: false; error: string };

export const ENTITY_KEYS = ["laws", "topics", "questions", "announcements", "features", "sgk", "employees"] as const;
export type EntityKey = (typeof ENTITY_KEYS)[number];

export function isEntity(v: string): v is EntityKey {
  return (ENTITY_KEYS as readonly string[]).includes(v);
}

// ---------- Temizleme yardımcıları ----------
const str = (v: unknown, max = 5000): string =>
  (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim().slice(0, max);

const int = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const bool = (v: unknown): boolean => v === true || v === "true" || v === 1 || v === "1" || v === "on";

const isoDate = (v: unknown): string => {
  const s = str(v, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) ? s : "";
};

const lines = (v: unknown, max = 40): string[] => {
  const arr = Array.isArray(v) ? v.map((x) => str(x, 2000)) : str(v, 20000).split(/\r?\n/).map((x) => x.trim());
  return arr.filter(Boolean).slice(0, max);
};

const tags = (v: unknown, max = 80): string[] => {
  const arr = Array.isArray(v) ? v.map((x) => str(x, 200)) : str(v, 5000).split(/[,\n]/).map((x) => x.trim());
  return arr.filter(Boolean).slice(0, max);
};

function items(v: unknown, keys: string[], max = 60): Record<string, string>[] {
  if (!Array.isArray(v)) return [];
  const out: Record<string, string>[] = [];
  for (const x of v) {
    if (!x || typeof x !== "object") continue;
    const o: Record<string, string> = {};
    for (const k of keys) o[k] = str((x as Dict)[k], 6000);
    if (Object.values(o).some(Boolean)) out.push(o);
    if (out.length >= max) break;
  }
  return out;
}

function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = String(v ?? "");
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

export function slugify(text: string): string {
  const s = text
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "kayit";
}

const TOPIC_TYPES = ["technique", "method"] as const;
const Q_CATS = ["kanun", "teknik", "metot"] as const;
const Q_DIFF = ["Temel", "Orta", "İleri"] as const;
const ANN_KINDS = ["yenilik", "guncelleme", "duyuru", "bakim"] as const;
const FEAT_STATUS = ["fikir", "planlandi", "gelistiriliyor", "yayinda"] as const;
const FEAT_PRIO = ["dusuk", "orta", "yuksek"] as const;
const SGK_CAT = ["isci", "isveren", "yasal", "diger"] as const;
const TRI = ["evet", "hayir", "duruma_bagli"] as const;
const CONTRACT = ["belirsiz", "belirli"] as const;

export function cleanLaw(b: Dict): Clean<typeof laws.$inferInsert> {
  const lawNumber = str(b.lawNumber, 20);
  const title = str(b.title, 300);
  if (!lawNumber || !title) return { ok: false, error: "Kanun numarası ve kanun adı zorunludur." };
  const keyArticles: LawArticle[] = items(b.keyArticles, ["articleNo", "title", "content", "hrImpact"], 60).map((o) => ({
    articleNo: o.articleNo ?? "",
    title: o.title ?? "",
    content: o.content ?? "",
    hrImpact: o.hrImpact ?? "",
  }));
  return {
    ok: true,
    value: {
      lawNumber,
      title,
      slug: str(b.slug, 120) || `${lawNumber}-${slugify(title)}`.slice(0, 120),
      category: str(b.category, 120) || "Genel",
      summary: str(b.summary, 8000),
      keyArticles,
      practicalExample: str(b.practicalExample, 8000),
      dailyTips: lines(b.dailyTips),
      keywords: tags(b.keywords),
      sortOrder: int(b.sortOrder, 0),
    },
  };
}

export function cleanTopic(b: Dict): Clean<typeof hrTopics.$inferInsert> {
  const title = str(b.title, 300);
  if (!title) return { ok: false, error: "Başlık zorunludur." };
  const stepsOrComponents: MethodComponent[] = items(b.stepsOrComponents, ["title", "description"], 40).map((o) => ({
    title: o.title ?? "",
    description: o.description ?? "",
  }));
  return {
    ok: true,
    value: {
      type: pick(b.type, TOPIC_TYPES, "technique"),
      title,
      slug: str(b.slug, 120) || slugify(title),
      subtitle: str(b.subtitle, 300),
      summary: str(b.summary, 8000),
      stepsOrComponents,
      practicalExample: str(b.practicalExample, 8000),
      relatedLaws: tags(b.relatedLaws, 20),
      dailyTips: lines(b.dailyTips),
      keywords: tags(b.keywords),
      sortOrder: int(b.sortOrder, 0),
    },
  };
}

export function cleanQuestion(b: Dict): Clean<typeof questions.$inferInsert> {
  const question = str(b.question, 2000);
  const shortAnswer = str(b.shortAnswer, 4000);
  if (!question || !shortAnswer) return { ok: false, error: "Soru ve kısa cevap zorunludur." };
  return {
    ok: true,
    value: {
      category: pick(b.category, Q_CATS, "kanun"),
      topicRef: str(b.topicRef, 300) || "Genel İK & Mevzuat",
      question,
      shortAnswer,
      detailedAnswer: str(b.detailedAnswer, 8000) || shortAnswer,
      legalBasis: str(b.legalBasis, 300) || "Kurumsal Uygulama",
      exampleScenario: str(b.exampleScenario, 4000) || "Örnek senaryo eklenmedi.",
      difficulty: pick(b.difficulty, Q_DIFF, "Orta"),
      isUserCreated: true,
    },
  };
}

export function cleanAnnouncement(b: Dict): Clean<typeof announcements.$inferInsert> {
  const title = str(b.title, 200);
  if (!title) return { ok: false, error: "Başlık zorunludur." };
  return {
    ok: true,
    value: {
      title,
      kind: pick(b.kind, ANN_KINDS, "yenilik"),
      version: str(b.version, 40),
      body: str(b.body, 5000),
      isActive: bool(b.isActive),
    },
  };
}

export function cleanFeature(b: Dict): Clean<typeof featureRequests.$inferInsert> {
  const title = str(b.title, 200);
  if (!title) return { ok: false, error: "Özellik adı zorunludur." };
  return {
    ok: true,
    value: {
      title,
      area: str(b.area, 60) || "Diğer",
      status: pick(b.status, FEAT_STATUS, "fikir"),
      priority: pick(b.priority, FEAT_PRIO, "orta"),
      description: str(b.description, 4000),
    },
  };
}

export function cleanSgk(b: Dict): Clean<typeof sgkCodes.$inferInsert> {
  const raw = str(b.code, 4);
  const code = /^\d$/.test(raw) ? `0${raw}` : raw;
  const title = str(b.title, 300);
  if (!code || !title) return { ok: false, error: "Kod ve çıkış nedeni zorunludur." };
  return {
    ok: true,
    value: {
      code,
      title,
      category: pick(b.category, SGK_CAT, "diger"),
      severance: pick(b.severance, TRI, "hayir"),
      unemployment: pick(b.unemployment, TRI, "hayir"),
      lawRef: str(b.lawRef, 200),
      description: str(b.description, 4000),
      notes: str(b.notes, 4000),
      sortOrder: int(b.sortOrder, 0),
    },
  };
}

export function cleanEmployee(b: Dict): Clean<typeof employees.$inferInsert> {
  const fullName = str(b.fullName, 200);
  const startDate = isoDate(b.startDate);
  if (!fullName) return { ok: false, error: "Ad soyad zorunludur." };
  if (!startDate) return { ok: false, error: "İşe giriş tarihi zorunludur." };
  const endDate = isoDate(b.endDate);
  if (endDate && endDate < startDate) return { ok: false, error: "Çıkış tarihi işe giriş tarihinden önce olamaz." };
  return {
    ok: true,
    value: {
      fullName,
      department: str(b.department, 120),
      jobTitle: str(b.jobTitle, 120),
      contractType: pick(b.contractType, CONTRACT, "belirsiz"),
      startDate,
      endDate: endDate || null,
      grossSalary: Math.max(0, Number(b.grossSalary) || 0),
      probationMonths: Math.min(6, Math.max(0, int(b.probationMonths, 2))),
      usedLeaveDays: Math.max(0, int(b.usedLeaveDays, 0)),
      exitCode: str(b.exitCode, 4),
      kvkkNoticeDate: isoDate(b.kvkkNoticeDate),
      notes: str(b.notes, 2000),
    },
  };
}

// ---------- Yardımcı sorgular ----------
async function nextSort(table: "laws" | "topics"): Promise<number> {
  const rows =
    table === "laws"
      ? await db.select({ v: sql<number>`coalesce(max(${laws.sortOrder}), 0)` }).from(laws)
      : await db.select({ v: sql<number>`coalesce(max(${hrTopics.sortOrder}), 0)` }).from(hrTopics);
  return Number(rows[0]?.v ?? 0) + 1;
}

async function lawSlugOwner(slug: string): Promise<number | null> {
  const r = await db.select({ id: laws.id }).from(laws).where(eq(laws.slug, slug)).limit(1);
  return r[0]?.id ?? null;
}

async function topicSlugOwner(slug: string): Promise<number | null> {
  const r = await db.select({ id: hrTopics.id }).from(hrTopics).where(eq(hrTopics.slug, slug)).limit(1);
  return r[0]?.id ?? null;
}

/** Slug çakışıyorsa sonuna -2, -3 ... ekler */
async function freeSlug(base: string, owner: (slug: string) => Promise<number | null>, selfId?: number): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const found = await owner(candidate);
    if (found === null || found === selfId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

// ---------- CRUD ----------
export async function listRows(entity: EntityKey): Promise<unknown[]> {
  switch (entity) {
    case "laws":
      return db.select().from(laws).orderBy(asc(laws.sortOrder), asc(laws.id));
    case "topics":
      return db.select().from(hrTopics).orderBy(asc(hrTopics.sortOrder), asc(hrTopics.id));
    case "questions":
      return db.select().from(questions).orderBy(desc(questions.id));
    case "announcements":
      return db.select().from(announcements).orderBy(desc(announcements.id));
    case "sgk":
      return db.select().from(sgkCodes).orderBy(asc(sgkCodes.sortOrder), asc(sgkCodes.code));
    case "employees":
      return db.select().from(employees).orderBy(asc(employees.fullName), asc(employees.id));
    case "features":
      return db.select().from(featureRequests).orderBy(desc(featureRequests.id));
  }
}

export async function createRow(entity: EntityKey, body: Dict): Promise<WriteResult> {
  switch (entity) {
    case "laws": {
      const c = cleanLaw(body);
      if (!c.ok) return c;
      const dup = await db.select({ id: laws.id }).from(laws).where(eq(laws.lawNumber, c.value.lawNumber)).limit(1);
      if (dup.length > 0) return { ok: false, error: "Bu kanun numarası zaten kayıtlı." };
      const slug = await freeSlug(c.value.slug, lawSlugOwner);
      const sortOrder = c.value.sortOrder || (await nextSort("laws"));
      const [row] = await db.insert(laws).values({ ...c.value, slug, sortOrder }).returning();
      return { ok: true, row };
    }
    case "topics": {
      const c = cleanTopic(body);
      if (!c.ok) return c;
      const slug = await freeSlug(c.value.slug, topicSlugOwner);
      const sortOrder = c.value.sortOrder || (await nextSort("topics"));
      const [row] = await db.insert(hrTopics).values({ ...c.value, slug, sortOrder }).returning();
      return { ok: true, row };
    }
    case "questions": {
      const c = cleanQuestion(body);
      if (!c.ok) return c;
      const [row] = await db.insert(questions).values(c.value).returning();
      return { ok: true, row };
    }
    case "announcements": {
      const c = cleanAnnouncement(body);
      if (!c.ok) return c;
      const [row] = await db.insert(announcements).values(c.value).returning();
      return { ok: true, row };
    }
    case "sgk": {
      const c = cleanSgk(body);
      if (!c.ok) return c;
      const [row] = await db.insert(sgkCodes).values(c.value).returning();
      return { ok: true, row };
    }
    case "employees": {
      const c = cleanEmployee(body);
      if (!c.ok) return c;
      const [row] = await db.insert(employees).values(c.value).returning();
      return { ok: true, row };
    }
    case "features": {
      const c = cleanFeature(body);
      if (!c.ok) return c;
      const [row] = await db.insert(featureRequests).values(c.value).returning();
      return { ok: true, row };
    }
  }
}

export async function updateRow(entity: EntityKey, id: number, body: Dict): Promise<WriteResult> {
  switch (entity) {
    case "laws": {
      const c = cleanLaw(body);
      if (!c.ok) return c;
      const dup = await db.select({ id: laws.id }).from(laws).where(eq(laws.lawNumber, c.value.lawNumber)).limit(1);
      if (dup.length > 0 && dup[0].id !== id) return { ok: false, error: "Bu kanun numarası başka bir kayıtta var." };
      const slug = await freeSlug(c.value.slug, lawSlugOwner, id);
      const [row] = await db.update(laws).set({ ...c.value, slug }).where(eq(laws.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "topics": {
      const c = cleanTopic(body);
      if (!c.ok) return c;
      const slug = await freeSlug(c.value.slug, topicSlugOwner, id);
      const [row] = await db.update(hrTopics).set({ ...c.value, slug }).where(eq(hrTopics.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "questions": {
      const c = cleanQuestion(body);
      if (!c.ok) return c;
      const [row] = await db.update(questions).set(c.value).where(eq(questions.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "announcements": {
      const c = cleanAnnouncement(body);
      if (!c.ok) return c;
      const [row] = await db.update(announcements).set(c.value).where(eq(announcements.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "sgk": {
      const c = cleanSgk(body);
      if (!c.ok) return c;
      const [row] = await db.update(sgkCodes).set(c.value).where(eq(sgkCodes.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "employees": {
      const c = cleanEmployee(body);
      if (!c.ok) return c;
      const [row] = await db.update(employees).set(c.value).where(eq(employees.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
    case "features": {
      const c = cleanFeature(body);
      if (!c.ok) return c;
      const [row] = await db.update(featureRequests).set(c.value).where(eq(featureRequests.id, id)).returning();
      return row ? { ok: true, row } : { ok: false, error: "NOT_FOUND" };
    }
  }
}

export async function deleteRow(entity: EntityKey, id: number): Promise<void> {
  switch (entity) {
    case "laws":
      await db.delete(laws).where(eq(laws.id, id));
      return;
    case "topics":
      await db.delete(hrTopics).where(eq(hrTopics.id, id));
      return;
    case "questions":
      await db.delete(questions).where(eq(questions.id, id));
      return;
    case "announcements":
      await db.delete(announcements).where(eq(announcements.id, id));
      return;
    case "sgk":
      await db.delete(sgkCodes).where(eq(sgkCodes.id, id));
      return;
    case "employees":
      await db.delete(employees).where(eq(employees.id, id));
      return;
    case "features":
      await db.delete(featureRequests).where(eq(featureRequests.id, id));
      return;
  }
}

// ---------- CSV içe ve dışa aktarma (kanun, teknik/metot, soru) ----------
export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function categoryFrom(v: string): string {
  const s = v.toLowerCase();
  if (s.includes("teknik")) return "teknik";
  if (s.includes("metot")) return "metot";
  return "kanun";
}

function typeFrom(v: string): string {
  const s = v.toLowerCase();
  return s.includes("metot") || s.includes("method") ? "method" : "technique";
}

function parseSteps(text: string): MethodComponent[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("::");
      return idx >= 0
        ? { title: line.slice(0, idx).trim(), description: line.slice(idx + 2).trim() }
        : { title: line, description: "" };
    })
    .slice(0, 40);
}

export async function importCsv(entity: "laws" | "topics" | "questions", text: string): Promise<ImportResult> {
  const res: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const { records } = recordsFromCsv(text);
  if (records.length === 0) {
    res.errors.push("Veri satırı bulunamadı. İlk satır başlık olmalıdır (ör. kanun_no, baslik, ...).");
    return res;
  }
  if (records.length > 2000) {
    res.errors.push("Tek seferde en fazla 2000 satır içe aktarılabilir.");
    return res;
  }

  if (entity === "questions") {
    const existing = await db.select({ id: questions.id, question: questions.question }).from(questions);
    const byText = new Map<string, number>(existing.map((q) => [q.question.trim().toLowerCase(), q.id]));
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const line = i + 2;
      const c = cleanQuestion({
        category: categoryFrom(r.kategori ?? ""),
        topicRef: r.konu,
        question: r.soru,
        shortAnswer: r.kisa_cevap,
        detailedAnswer: r.detayli_cevap,
        legalBasis: r.yasal_dayanak,
        exampleScenario: r.ornek_senaryo,
        difficulty: r.zorluk,
      });
      if (!c.ok) {
        res.skipped++;
        res.errors.push(`Satır ${line}: ${c.error}`);
        continue;
      }
      const key = c.value.question.trim().toLowerCase();
      try {
        const id = byText.get(key);
        if (id) {
          await db.update(questions).set(c.value).where(eq(questions.id, id));
          res.updated++;
        } else {
          const [row] = await db.insert(questions).values(c.value).returning({ id: questions.id });
          if (row) byText.set(key, row.id);
          res.created++;
        }
      } catch {
        res.skipped++;
        res.errors.push(`Satır ${line}: veritabanına yazılamadı`);
      }
    }
    return res;
  }

  if (entity === "laws") {
    const existing = await db.select({ id: laws.id, lawNumber: laws.lawNumber, slug: laws.slug }).from(laws);
    const byNo = new Map<string, { id: number; slug: string }>(existing.map((l) => [l.lawNumber, { id: l.id, slug: l.slug }]));
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const line = i + 2;
      const hit = byNo.get(r.kanun_no ?? "");
      const c = cleanLaw({
        lawNumber: r.kanun_no,
        title: r.baslik,
        slug: r.slug || hit?.slug || "",
        category: r.kategori,
        summary: r.ozet,
        practicalExample: r.ornek_senaryo,
        dailyTips: r.ipuclari,
        keywords: r.anahtar_kelimeler,
        sortOrder: r.sira,
      });
      if (!c.ok) {
        res.skipped++;
        res.errors.push(`Satır ${line}: ${c.error}`);
        continue;
      }
      try {
        if (hit) {
          // Mevcut kanunun madde (keyArticles) detayları korunur
          const slug = await freeSlug(c.value.slug, lawSlugOwner, hit.id);
          await db.update(laws).set({ ...c.value, keyArticles: undefined, slug }).where(eq(laws.id, hit.id));
          res.updated++;
        } else {
          const slug = await freeSlug(c.value.slug, lawSlugOwner);
          const sortOrder = c.value.sortOrder || (await nextSort("laws"));
          const [row] = await db
            .insert(laws)
            .values({ ...c.value, slug, sortOrder })
            .returning({ id: laws.id, lawNumber: laws.lawNumber });
          if (row) byNo.set(row.lawNumber, { id: row.id, slug });
          res.created++;
        }
      } catch {
        res.skipped++;
        res.errors.push(`Satır ${line}: veritabanına yazılamadı`);
      }
    }
    return res;
  }

  // topics
  const existing = await db.select({ id: hrTopics.id, slug: hrTopics.slug }).from(hrTopics);
  const bySlug = new Map<string, number>(existing.map((t) => [t.slug, t.id]));
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const line = i + 2;
    const slugIn = r.slug || slugify(r.baslik ?? "");
    const hitId = bySlug.get(slugIn);
    const c = cleanTopic({
      type: typeFrom(r.tip ?? ""),
      title: r.baslik,
      slug: slugIn,
      subtitle: r.alt_baslik,
      summary: r.ozet,
      practicalExample: r.ornek,
      relatedLaws: r.ilgili_kanunlar,
      dailyTips: r.ipuclari,
      keywords: r.anahtar_kelimeler,
      stepsOrComponents: parseSteps(r.adimlar ?? ""),
      sortOrder: r.sira,
    });
    if (!c.ok) {
      res.skipped++;
      res.errors.push(`Satır ${line}: ${c.error}`);
      continue;
    }
    try {
      if (hitId) {
        await db.update(hrTopics).set(c.value).where(eq(hrTopics.id, hitId));
        res.updated++;
      } else {
        const slug = await freeSlug(c.value.slug, topicSlugOwner);
        const sortOrder = c.value.sortOrder || (await nextSort("topics"));
        const [row] = await db
          .insert(hrTopics)
          .values({ ...c.value, slug, sortOrder })
          .returning({ id: hrTopics.id });
        if (row) bySlug.set(slug, row.id);
        res.created++;
      }
    } catch {
      res.skipped++;
      res.errors.push(`Satır ${line}: veritabanına yazılamadı`);
    }
  }
  return res;
}

export async function exportCsv(entity: "laws" | "topics" | "questions"): Promise<{ filename: string; csv: string }> {
  if (entity === "laws") {
    const rows = await db.select().from(laws).orderBy(asc(laws.sortOrder), asc(laws.id));
    return {
      filename: "kanunlar.csv",
      csv: toCsv(
        ["kanun_no", "baslik", "slug", "kategori", "ozet", "ornek_senaryo", "ipuclari", "anahtar_kelimeler", "sira"],
        rows.map((r) => [r.lawNumber, r.title, r.slug, r.category, r.summary, r.practicalExample, r.dailyTips.join("\n"), r.keywords.join(", "), r.sortOrder])
      ),
    };
  }
  if (entity === "topics") {
    const rows = await db.select().from(hrTopics).orderBy(asc(hrTopics.sortOrder), asc(hrTopics.id));
    return {
      filename: "ik-teknik-metot.csv",
      csv: toCsv(
        ["tip", "baslik", "slug", "alt_baslik", "ozet", "ornek", "ilgili_kanunlar", "ipuclari", "anahtar_kelimeler", "adimlar", "sira"],
        rows.map((r) => [
          r.type === "method" ? "metot" : "teknik",
          r.title,
          r.slug,
          r.subtitle,
          r.summary,
          r.practicalExample,
          r.relatedLaws.join(", "),
          r.dailyTips.join("\n"),
          r.keywords.join(", "),
          r.stepsOrComponents.map((s) => `${s.title} :: ${s.description}`).join("\n"),
          r.sortOrder,
        ])
      ),
    };
  }
  const rows = await db.select().from(questions).orderBy(asc(questions.id));
  return {
    filename: "sorular.csv",
    csv: toCsv(
      ["kategori", "konu", "soru", "kisa_cevap", "detayli_cevap", "yasal_dayanak", "ornek_senaryo", "zorluk"],
      rows.map((r) => [
        r.category === "teknik" ? "teknik" : r.category === "metot" ? "metot" : "kanun",
        r.topicRef,
        r.question,
        r.shortAnswer,
        r.detailedAnswer,
        r.legalBasis,
        r.exampleScenario,
        r.difficulty,
      ])
    ),
  };
}
