import { NextRequest, NextResponse } from "next/server";
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Header,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import ExcelJS from "exceljs";
import { asciiName, type DocBlock, type DocFormat, type DocModel } from "@/lib/documents";
import { buildPdfFromModel } from "@/lib/pdf";

export const dynamic = "force-dynamic";

const MAX_BLOCKS = 600;
const MAX_ROWS = 3000;
const MAX_TEXT = 300_000;
const FONT = "Arial";

const MIME: Record<DocFormat, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

function cut(v: unknown, max = 20000): string {
  return typeof v === "string" ? v.slice(0, max) : typeof v === "number" ? String(v) : "";
}

/** İstemciden gelen belgeyi doğrular ve temizler */
function parseModel(input: unknown): { format: DocFormat; model: DocModel } | string {
  if (!input || typeof input !== "object") return "Geçersiz istek.";
  const b = input as Record<string, unknown>;
  const format: DocFormat | null =
    b.format === "docx" || b.format === "xlsx" || b.format === "pdf" ? b.format : null;
  if (!format) return "Biçim docx, xlsx veya pdf olmalıdır.";
  const m = b.model as Record<string, unknown> | undefined;
  if (!m || !Array.isArray(m.blocks) || m.blocks.length > MAX_BLOCKS) return "Belge içeriği geçersiz.";

  let total = 0;
  const blocks: DocBlock[] = [];
  for (const raw of m.blocks as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    if (raw.type === "h") {
      const text = cut(raw.text);
      total += text.length;
      blocks.push({ type: "h", text });
    } else if (raw.type === "p") {
      const text = cut(raw.text);
      total += text.length;
      blocks.push({ type: "p", text, bold: raw.bold === true, italic: raw.italic === true });
    } else if (raw.type === "ul" && Array.isArray(raw.items)) {
      const items = (raw.items as unknown[]).slice(0, 500).map((x) => cut(x, 2000));
      total += items.join("").length;
      blocks.push({ type: "ul", items });
    } else if (raw.type === "table" && Array.isArray(raw.headers) && Array.isArray(raw.rows)) {
      const headers = (raw.headers as unknown[]).slice(0, 20).map((x) => cut(x, 300));
      const rows: (string | number)[][] = (raw.rows as unknown[])
        .slice(0, MAX_ROWS)
        .map((r) =>
          Array.isArray(r)
            ? (r as unknown[]).slice(0, headers.length).map((c) => (typeof c === "number" ? c : cut(c, 2000)))
            : []
        );
      total += rows.map((r) => r.map(String).join("")).join("").length;
      blocks.push({ type: "table", sheetName: cut(raw.sheetName, 40) || undefined, headers, rows });
    }
  }
  if (total > MAX_TEXT) return "Belge çok büyük.";

  return {
    format,
    model: {
      title: cut(m.title, 200) || "Belge",
      subtitle: cut(m.subtitle, 300) || undefined,
      fileName: cut(m.fileName, 120) || "belge",
      blocks,
    },
  };
}

function docxTextParagraphs(text: string, opts: { bold?: boolean; italic?: boolean } = {}): Paragraph[] {
  return text.split("\n").map(
    (line) =>
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: line,
            bold: opts.bold,
            italics: opts.italic,
            size: 21,
            color: "1E293B",
            font: FONT,
          }),
        ],
      })
  );
}

function docxTable(headers: string[], rows: (string | number)[][]): Table {
  const cell = (text: string, head: boolean) =>
    new TableCell({
      shading: head ? { fill: "1E293B", type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 50, bottom: 50, left: 80, right: 80 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: head,
              size: 18,
              color: head ? "FFFFFF" : "1E293B",
              font: FONT,
            }),
          ],
        }),
      ],
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h) => cell(h, true)) }),
      ...rows.map((r) => new TableRow({ children: headers.map((_, i) => cell(String(r[i] ?? ""), false)) })),
    ],
  });
}

async function buildDocx(model: DocModel): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      children: [new TextRun({ text: model.title, bold: true, size: 34, color: "0F172A", font: FONT })],
    })
  );
  if (model.subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: model.subtitle, italics: true, size: 19, color: "64748B", font: FONT })],
      })
    );
  }

  for (const b of model.blocks) {
    if (b.type === "h") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: b.text, bold: true, size: 26, color: "312E81", font: FONT })],
        })
      );
    } else if (b.type === "p") {
      children.push(...docxTextParagraphs(b.text, { bold: b.bold, italic: b.italic }));
    } else if (b.type === "ul") {
      for (const item of b.items) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text: item, size: 21, color: "1E293B", font: FONT })],
          })
        );
      }
    } else {
      children.push(docxTable(b.headers, b.rows));
      children.push(new Paragraph({ children: [] }));
    }
  }

  const doc = new Document({
    creator: "Cihan Ahtik",
    title: model.title,
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "İK & Mevzuat Akademisi • Cihan Ahtik", size: 16, color: "64748B", font: FONT })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Bu uygulama Cihan Ahtik tarafından yapılmıştır. • Sayfa ", size: 16, color: "64748B", font: FONT }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "64748B", font: FONT }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}

async function buildXlsx(model: DocModel): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cihan Ahtik";
  wb.created = new Date();

  const text = wb.addWorksheet("Belge", { views: [{ showGridLines: false }] });
  text.getColumn(1).width = 110;

  const line = (value: string, style: "title" | "sub" | "h" | "body" | "italic" | "bullet" = "body") => {
    const row = text.addRow([value]);
    const cell = row.getCell(1);
    cell.alignment = { wrapText: true, vertical: "top" };
    if (style === "title") cell.font = { bold: true, size: 15, color: { argb: "FF0F172A" } };
    if (style === "sub") cell.font = { italic: true, color: { argb: "FF64748B" } };
    if (style === "h") cell.font = { bold: true, size: 12, color: { argb: "FF312E81" } };
    if (style === "italic") cell.font = { italic: true, color: { argb: "FF334155" } };
    if (style === "bullet") value = `• ${value}`;
    cell.value = value;
  };

  line(model.title, "title");
  if (model.subtitle) line(model.subtitle, "sub");
  line("");

  const tables: { name: string; headers: string[]; rows: (string | number)[][] }[] = [];
  let tableNo = 0;
  for (const b of model.blocks) {
    if (b.type === "h") {
      line("");
      line(b.text, "h");
    } else if (b.type === "p") {
      for (const l of b.text.split("\n")) line(l, b.italic ? "italic" : "body");
    } else if (b.type === "ul") {
      for (const item of b.items) line(item, "bullet");
    } else {
      tableNo += 1;
      tables.push({ name: b.sheetName || `Tablo ${tableNo}`, headers: b.headers, rows: b.rows });
    }
  }

  for (const t of tables) {
    const base = t.name.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 28) || "Tablo";
    let name = base;
    let n = 2;
    while (wb.getWorksheet(name)) name = `${base}-${n++}`;

    const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
    ws.addRow(t.headers);
    for (const r of t.rows) ws.addRow(t.headers.map((_, i) => r[i] ?? ""));

    ws.columns = t.headers.map((h, i) => {
      const longest = Math.max(h.length, ...t.rows.map((r) => String(r[i] ?? "").length));
      return { width: Math.min(60, Math.max(12, Math.ceil(longest * 0.9) + 2)) };
    });

    const head = ws.getRow(1);
    head.font = { bold: true, color: { argb: "FFFFFFFF" } };
    head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    head.height = 22;

    const edge = { style: "thin" as const, color: { argb: "FFCBD5E1" } };
    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: "top" };
        cell.border = { top: edge, left: edge, bottom: edge, right: edge };
      });
    });
    if (t.rows.length > 0) {
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: t.headers.length } };
    }
  }

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = parseModel(body);
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });

  try {
    const buf =
      parsed.format === "docx"
        ? await buildDocx(parsed.model)
        : parsed.format === "pdf"
          ? await buildPdfFromModel(parsed.model)
          : await buildXlsx(parsed.model);
    const name = `${asciiName(parsed.model.fileName)}.${parsed.format}`;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[parsed.format],
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Belge oluşturulamadı." }, { status: 500 });
  }
}
