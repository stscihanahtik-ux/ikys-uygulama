// Ortak belge modeli: Word (.docx) ve Excel (.xlsx) dışa aktarımı için kullanılır.
// Dönüşüm sunucuda /api/export üzerinden yapılır; bu dosya istemci yardımcılarını da içerir.

export type DocBlock =
  | { type: "h"; text: string }
  | { type: "p"; text: string; bold?: boolean; italic?: boolean }
  | { type: "ul"; items: string[] }
  | { type: "table"; sheetName?: string; headers: string[]; rows: (string | number)[][] };

export interface DocModel {
  title: string;
  subtitle?: string;
  fileName: string;
  blocks: DocBlock[];
}

export type DocFormat = "docx" | "xlsx" | "pdf";

const TR_CHARS: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

/** Dosya adı için ASCII güvenli ad üretir: "Savunma İstemi Yazısı" -> "savunma-istemi-yazisi" */
export function asciiName(input: string): string {
  const s = input.replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_CHARS[c] ?? c).toLowerCase();
  return s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "belge";
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(filename: string, content: string, mime = "text/calendar;charset=utf-8"): void {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

/** Belgeyi sunucuda Word veya Excel dosyasına çevirip indirir */
export async function downloadDocument(format: DocFormat, model: DocModel): Promise<void> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, model }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Belge oluşturulamadı.");
  }
  downloadBlob(await res.blob(), `${asciiName(model.fileName)}.${format}`);
}

/** Hata durumunda kullanıcıya uyarı gösteren güvenli indirme */
export async function downloadDocumentSafe(format: DocFormat, model: DocModel): Promise<void> {
  try {
    await downloadDocument(format, model);
  } catch (e) {
    window.alert(e instanceof Error ? e.message : "Belge indirilemedi.");
  }
}
