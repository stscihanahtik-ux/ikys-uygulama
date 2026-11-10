import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { laws as lawsTable } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const MAX_W = PAGE_W - MARGIN * 2;

interface Ctx {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  y: number;
  pageNo: number;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) { lines.push(""); continue; }
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.pageNo += 1;
  ctx.y = PAGE_H - MARGIN;
  // Üst bant
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 34, width: PAGE_W, height: 34, color: rgb(0.06, 0.09, 0.22) });
  ctx.page.drawText("İK & MEVZUAT AKADEMİSİ", { x: MARGIN, y: PAGE_H - 22, size: 9, font: ctx.bold, color: rgb(1, 1, 1) });
  ctx.page.drawText("Cihan Ahtik", { x: PAGE_W - MARGIN - ctx.font.widthOfTextAtSize("Cihan Ahtik", 9), y: PAGE_H - 22, size: 9, font: ctx.font, color: rgb(0.75, 0.78, 1) });
  // Alt bilgi
  const footer = `Bu uygulama Cihan Ahtik tarafından yapılmıştır.  •  Sayfa ${ctx.pageNo}`;
  ctx.page.drawText(footer, { x: (PAGE_W - ctx.font.widthOfTextAtSize(footer, 7.5)) / 2, y: 24, size: 7.5, font: ctx.font, color: rgb(0.45, 0.47, 0.55) });
  ctx.y = PAGE_H - 58;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < 46) newPage(ctx);
}

function drawText(ctx: Ctx, text: string, size: number, opts?: { bold?: boolean; color?: ReturnType<typeof rgb>; gapAfter?: number; lineHeight?: number }) {
  const font = opts?.bold ? ctx.bold : ctx.font;
  const color = opts?.color || rgb(0.12, 0.14, 0.2);
  const lh = opts?.lineHeight || size * 1.45;
  for (const line of wrapText(text, font, size, MAX_W)) {
    ensureSpace(ctx, lh);
    if (line) ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font, color });
    ctx.y -= lh;
  }
  ctx.y -= opts?.gapAfter ?? 4;
}

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const all = searchParams.get("all") === "1";

    const selected = slug
      ? await db.select().from(lawsTable).where(eq(lawsTable.slug, slug)).limit(1)
      : await db.select().from(lawsTable).orderBy(asc(lawsTable.sortOrder));

    if (selected.length === 0) {
      return NextResponse.json({ error: "Kanun bulunamadı" }, { status: 404 });
    }

    const [regularBytes, boldBytes] = await Promise.all([
      readFile(path.join(process.cwd(), "public/fonts/DejaVuSans.ttf")),
      readFile(path.join(process.cwd(), "public/fonts/DejaVuSans-Bold.ttf")),
    ]);

    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(regularBytes, { subset: true });
    const bold = await doc.embedFont(boldBytes, { subset: true });
    doc.setTitle(all ? "İK Mevzuat Rehberi — 12 Temel Kanun (Cihan Ahtik)" : selected[0].title);
    doc.setAuthor("Cihan Ahtik — İK & Mevzuat Akademisi");
    doc.setCreator("Cihan Ahtik İK Akademisi");
    doc.setSubject("Türk İş ve Sosyal Güvenlik Mevzuatı — İK Uygulama Rehberi");

    const ctx: Ctx = { doc, font, bold, page: undefined as unknown as PDFPage, y: 0, pageNo: 0 };
    newPage(ctx);

    // Kapak başlığı
    ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 6, width: MAX_W, height: 74, color: rgb(0.09, 0.11, 0.28) });
    ctx.page.drawText(all ? "12 TEMEL KANUN — İK MEVZUAT REHBERİ" : `${selected[0].lawNumber} SAYILI KANUN REHBERİ`, { x: MARGIN + 16, y: ctx.y + 38, size: 14, font: bold, color: rgb(1, 1, 1) });
    ctx.page.drawText(all ? "4857 • 5510 • 6331 • 6698 • 6098 • 4447 • 193 • 2004 • 6356 • 5746 • 4721 • 4688" : selected[0].title, { x: MARGIN + 16, y: ctx.y + 16, size: 9.5, font, color: rgb(0.78, 0.8, 1) });
    ctx.y -= 92;
    drawText(ctx, `Oluşturma tarihi: ${new Date().toLocaleDateString("tr-TR")}  •  Bu belge bilgilendirme amaçlıdır; resmî metinler için mevzuat.gov.tr esas alınmalıdır.`, 8.5, { color: rgb(0.4, 0.42, 0.5), gapAfter: 14 });

    selected.forEach((law, lawIdx) => {
      if (lawIdx > 0) newPage(ctx);
      drawText(ctx, `${law.lawNumber} — ${law.title}`, 16, { bold: true, color: rgb(0.09, 0.11, 0.28), gapAfter: 2 });
      drawText(ctx, `Kategori: ${law.category}`, 9, { color: rgb(0.35, 0.38, 0.48), gapAfter: 8 });
      drawText(ctx, law.summary, 10.5, { gapAfter: 10 });

      drawText(ctx, "KRİTİK MADDELER VE İK UYGULAMA ETKİSİ", 11, { bold: true, color: rgb(0.2, 0.25, 0.6), gapAfter: 6 });
      for (const art of law.keyArticles) {
        ensureSpace(ctx, 60);
        ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 2, width: MAX_W, height: 20, color: rgb(0.92, 0.93, 1) });
        ctx.page.drawText(`${art.articleNo} — ${art.title}`, { x: MARGIN + 8, y: ctx.y + 3, size: 10, font: bold, color: rgb(0.13, 0.16, 0.45) });
        ctx.y -= 26;
        drawText(ctx, art.content, 9.5, { gapAfter: 3 });
        drawText(ctx, `İK Uygulama Etkisi: ${art.hrImpact}`, 9.5, { color: rgb(0.25, 0.3, 0.55), gapAfter: 10 });
      }

      drawText(ctx, "ÖRNEK SENARYO", 11, { bold: true, color: rgb(0.55, 0.35, 0.05), gapAfter: 4 });
      drawText(ctx, law.practicalExample, 10, { gapAfter: 10 });

      drawText(ctx, "GÜNLÜK MEVZUAT İPUÇLARI", 11, { bold: true, color: rgb(0.05, 0.4, 0.25), gapAfter: 4 });
      for (const tip of law.dailyTips) drawText(ctx, `•  ${tip}`, 9.5, { gapAfter: 2 });
      ctx.y -= 8;
    });

    const pdfBytes = await doc.save();
    const fileName = all ? "IK-Mevzuat-Rehberi-12-Kanun-Cihan-Ahtik.pdf" : `${selected[0].lawNumber}-${selected[0].slug}-Cihan-Ahtik.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF error:", error);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  }
}
