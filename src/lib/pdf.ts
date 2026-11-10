import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import path from "path";
import type { DocModel } from "@/lib/documents";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 46;
const MAX_W = PAGE_W - MARGIN * 2;
const BOTTOM = 52;
const MAX_PDF_ROWS = 500;

interface PdfCtx {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  pageNo: number;
  y: number;
  title: string;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const paragraph of String(text ?? "").replace(/☐/g, "[ ]").split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function newPage(ctx: PdfCtx, first = false): void {
  if (!first) ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.pageNo += 1;

  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_H - 34,
    width: PAGE_W,
    height: 34,
    color: rgb(0.06, 0.09, 0.22),
  });
  ctx.page.drawText(ctx.title.slice(0, 68), {
    x: MARGIN,
    y: PAGE_H - 22,
    size: 9.5,
    font: ctx.bold,
    color: rgb(1, 1, 1),
  });

  const footer = `Bu uygulama Cihan Ahtik tarafından yapılmıştır.  •  Sayfa ${ctx.pageNo}`;
  ctx.page.drawText(footer, {
    x: (PAGE_W - ctx.font.widthOfTextAtSize(footer, 7.5)) / 2,
    y: 24,
    size: 7.5,
    font: ctx.font,
    color: rgb(0.45, 0.48, 0.55),
  });
  ctx.y = PAGE_H - 58;
}

function ensure(ctx: PdfCtx, needed: number): void {
  if (ctx.y - needed < BOTTOM) newPage(ctx);
}

function draw(
  ctx: PdfCtx,
  text: string,
  size: number,
  opts: { bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number; maxLines?: number } = {}
): void {
  const f = opts.bold ? ctx.bold : ctx.font;
  const color = opts.color ?? rgb(0.12, 0.14, 0.2);
  const lh = size * 1.45;
  let lines = wrap(text, f, size, MAX_W);
  if (opts.maxLines && lines.length > opts.maxLines) {
    lines = [...lines.slice(0, opts.maxLines), "…"];
  }
  for (const line of lines) {
    ensure(ctx, lh);
    if (line) {
      ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: f, color });
    }
    ctx.y -= lh;
  }
  ctx.y -= opts.gap ?? 3;
}

/** DocModel → imzalı, Türkçe karakter destekli, çok sayfalı PDF */
export async function buildPdfFromModel(model: DocModel): Promise<Buffer> {
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/DejaVuSans.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/DejaVuSans-Bold.ttf")),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  doc.setTitle(model.title);
  doc.setAuthor("Cihan Ahtik — İK & Mevzuat Akademisi");
  doc.setCreator("Cihan Ahtik İK Akademisi");
  doc.setSubject("İnsan kaynakları ve iş mevzuatı bilgilendirme belgesi");

  const first = doc.addPage([PAGE_W, PAGE_H]);
  const ctx: PdfCtx = {
    doc,
    font,
    bold,
    page: first,
    pageNo: 0,
    y: PAGE_H - 58,
    title: model.title,
  };
  newPage(ctx, true);

  draw(ctx, model.title, 15, { bold: true, color: rgb(0.06, 0.09, 0.3), gap: 2 });
  if (model.subtitle) {
    draw(ctx, model.subtitle, 9, { color: rgb(0.35, 0.4, 0.55), gap: 8 });
  }
  draw(ctx, `Oluşturma: ${new Date().toLocaleDateString("tr-TR")}`, 8, {
    color: rgb(0.5, 0.53, 0.6),
    gap: 10,
  });

  for (const block of model.blocks) {
    if (block.type === "h") {
      ensure(ctx, 30);
      // Bölüm başlığı için ince ayırıcı çizgi
      ctx.page.drawRectangle({
        x: MARGIN,
        y: ctx.y - 2,
        width: MAX_W,
        height: 1.2,
        color: rgb(0.78, 0.8, 0.88),
      });
      ctx.y -= 8;
      draw(ctx, block.text, 11.5, { bold: true, color: rgb(0.14, 0.16, 0.45), gap: 5 });
    } else if (block.type === "p") {
      draw(ctx, block.text, 9.3, {
        bold: block.bold,
        color: block.italic ? rgb(0.38, 0.4, 0.48) : rgb(0.12, 0.14, 0.2),
        gap: 5,
        maxLines: 200,
      });
    } else if (block.type === "ul") {
      for (const item of block.items) {
        draw(ctx, `•  ${item}`, 9.1, { gap: 2, maxLines: 40 });
      }
      ctx.y -= 4;
    } else {
      // Tablo: başlıklar + her satır "Başlık: değer" biçiminde, sayfaya sığacak şekilde
      const headers = block.headers;
      draw(ctx, headers.join("  |  "), 8.4, {
        bold: true,
        color: rgb(0.06, 0.1, 0.32),
        gap: 3,
        maxLines: 12,
      });
      const rows = block.rows.slice(0, MAX_PDF_ROWS);
      rows.forEach((row, idx) => {
        const parts = headers
          .map((h, i) => {
            const v = String(row[i] ?? "").replace(/\s+/g, " ").trim();
            return `${h}: ${v.length > 420 ? `${v.slice(0, 420)}…` : v}`;
          })
          .filter(Boolean);
        draw(ctx, `${idx + 1}. ${parts.join("  |  ")}`, 8.2, {
          color: idx % 2 === 1 ? rgb(0.3, 0.33, 0.4) : rgb(0.12, 0.14, 0.2),
          gap: 2.5,
          maxLines: 22,
        });
      });
      if (block.rows.length > MAX_PDF_ROWS) {
        draw(ctx, `… ${block.rows.length - MAX_PDF_ROWS} satır daha (Excel dosyasında tamamı mevcuttur).`, 8.5, {
          color: rgb(0.5, 0.3, 0.1),
          gap: 4,
        });
      }
      ctx.y -= 6;
    }
  }

  draw(ctx, "Bu belge bilgilendirme amaçlıdır. Resmî işlemlerde Resmî Gazete ve mevzuat.gov.tr esas alınmalıdır.", 8, {
    color: rgb(0.5, 0.35, 0.1),
    gap: 0,
  });

  return Buffer.from(await doc.save());
}
