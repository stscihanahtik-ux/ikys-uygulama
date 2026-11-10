// Google Sheets (bağlantıya sahip olan herkes görüntüleyebilir) → CSV okuyucu.
// Not: Google Custom Search API yeni müşterilere kapalıdır ve 1 Ocak 2027'de kapanır; bu proje onu kullanmaz.

const UA = "Mozilla/5.0 (compatible; IKAkademisi/2.0)";

/** Sheet bağlantısından kimliği ayıklar */
export function parseSheetId(input: string): string {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return (m ? m[1] : input).trim();
}

/** Paylaşımı açık bir Google Sheet sekmesini CSV metni olarak okur */
export async function fetchSheetCsv(sheetIdOrUrl: string, tab: string): Promise<string> {
  const id = parseSheetId(sheetIdOrUrl);
  if (!/^[a-zA-Z0-9-_]{20,}$/.test(id)) {
    throw new Error("Geçersiz Google Sheet bağlantısı veya kimliği.");
  }
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  if (!res.ok || text.includes("google.visualization.Query.setResponse") || /^\s*<(!doctype|html)/i.test(text)) {
    throw new Error(
      `"${tab}" sekmesi okunamadı. Dosyayı "Bağlantıya sahip olan herkes (görüntüleyen)" olarak paylaşın ve sekme adının birebir aynı olduğunu kontrol edin.`
    );
  }
  return text;
}
