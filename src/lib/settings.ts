import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { DEFAULT_PARAMS, type ProductParams } from "@/lib/calculators";

export interface SheetsConfig {
  sheetId: string;
  tabs: { laws: string; topics: string; questions: string };
}

export const DEFAULT_SHEETS: SheetsConfig = {
  sheetId: "",
  tabs: { laws: "Kanunlar", topics: "Teknikler", questions: "Sorular" },
};

export async function getSetting<T>(key: string): Promise<T | null> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return rows.length > 0 ? (rows[0].value as T) : null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

export async function getSheetsConfig(): Promise<SheetsConfig> {
  const v = await getSetting<Partial<SheetsConfig>>("sheets_config");
  return {
    sheetId: v?.sheetId ?? "",
    tabs: { ...DEFAULT_SHEETS.tabs, ...(v?.tabs ?? {}) },
  };
}

export async function getParams(): Promise<ProductParams> {
  const v = await getSetting<Partial<ProductParams>>("params");
  return { ...DEFAULT_PARAMS, ...(v ?? {}) };
}
