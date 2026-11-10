import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { importCsv } from "@/lib/admin-entities";
import { fetchSheetCsv, parseSheetId } from "@/lib/google";
import { getSheetsConfig, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

type ImportEntity = "laws" | "topics" | "questions";
const isImportEntity = (v: unknown): v is ImportEntity => v === "laws" || v === "topics" || v === "questions";
const str = (v: unknown, max = 300): string =>
  (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim().slice(0, max);

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ sheets: await getSheetsConfig() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = str(body.action, 40);

  try {
    switch (action) {
      case "save-sheets": {
        const tabsIn = (body.tabs ?? {}) as Record<string, unknown>;
        const cfg = {
          sheetId: parseSheetId(str(body.sheetId, 300)),
          tabs: {
            laws: str(tabsIn.laws, 100) || "Kanunlar",
            topics: str(tabsIn.topics, 100) || "Teknikler",
            questions: str(tabsIn.questions, 100) || "Sorular",
          },
        };
        await setSetting("sheets_config", cfg);
        return NextResponse.json({ ok: true, sheets: cfg });
      }
      case "import-sheet": {
        if (!isImportEntity(body.entity)) return NextResponse.json({ error: "Geçersiz tablo" }, { status: 400 });
        const entity = body.entity;
        const cfg = await getSheetsConfig();
        if (!cfg.sheetId) return NextResponse.json({ error: "Önce Google Sheet bağlantısını kaydedin." }, { status: 400 });
        const csv = await fetchSheetCsv(cfg.sheetId, cfg.tabs[entity]);
        return NextResponse.json({ ok: true, tab: cfg.tabs[entity], ...(await importCsv(entity, csv)) });
      }
      case "import-csv": {
        if (!isImportEntity(body.entity)) return NextResponse.json({ error: "Geçersiz tablo" }, { status: 400 });
        const csv = typeof body.csv === "string" ? body.csv : "";
        if (!csv.trim()) return NextResponse.json({ error: "CSV içeriği boş." }, { status: 400 });
        if (csv.length > 2_000_000) return NextResponse.json({ error: "Dosya çok büyük." }, { status: 413 });
        return NextResponse.json({ ok: true, ...(await importCsv(body.entity, csv)) });
      }
      default:
        return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
    }
  } catch (error) {
    console.error("Google admin error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "İşlem başarısız." }, { status: 502 });
  }
}
