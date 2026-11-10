// Tarih yardımcıları: UTC tabanlıdır, saat dilimi kaymasına yol açmaz.
// Resmî tatiller 2026–2027 (resmî tatil ve dini bayram takvimi). Arife günleri yarım gün olup iş günü sayılır.

export const RESMI_TATILLER: Record<string, string> = {
  "2026-01-01": "Yılbaşı",
  "2026-03-20": "Ramazan Bayramı 1. gün",
  "2026-03-21": "Ramazan Bayramı 2. gün",
  "2026-03-22": "Ramazan Bayramı 3. gün",
  "2026-04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "2026-05-01": "Emek ve Dayanışma Günü",
  "2026-05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  "2026-05-27": "Kurban Bayramı 1. gün",
  "2026-05-28": "Kurban Bayramı 2. gün",
  "2026-05-29": "Kurban Bayramı 3. gün",
  "2026-05-30": "Kurban Bayramı 4. gün",
  "2026-07-15": "Demokrasi ve Milli Birlik Günü",
  "2026-08-30": "Zafer Bayramı",
  "2026-10-29": "Cumhuriyet Bayramı",
  "2027-01-01": "Yılbaşı",
  "2027-03-09": "Ramazan Bayramı 1. gün",
  "2027-03-10": "Ramazan Bayramı 2. gün",
  "2027-03-11": "Ramazan Bayramı 3. gün",
  "2027-04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "2027-05-01": "Emek ve Dayanışma Günü",
  "2027-05-16": "Kurban Bayramı 1. gün",
  "2027-05-17": "Kurban Bayramı 2. gün",
  "2027-05-18": "Kurban Bayramı 3. gün",
  "2027-05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı (Kurban Bayramı 4. gün)",
  "2027-07-15": "Demokrasi ve Milli Birlik Günü",
  "2027-08-30": "Zafer Bayramı",
  "2027-10-29": "Cumhuriyet Bayramı",
};

const DAY = 86_400_000;

const parse = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const toIso = (d: Date): string => d.toISOString().slice(0, 10);

/** Türkiye saatine göre bugünün tarihi (YYYY-AA-GG) */
export function todayIso(): string {
  return toIso(new Date(Date.now() + 3 * 3_600_000));
}

export function addDays(iso: string, n: number): string {
  return toIso(new Date(parse(iso).getTime() + n * DAY));
}

export function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + n, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, lastDay));
  return toIso(first);
}

export function diffDays(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / DAY);
}

export function isBusinessDay(iso: string): boolean {
  const dow = parse(iso).getUTCDay();
  return dow !== 0 && dow !== 6 && !(iso in RESMI_TATILLER);
}

export function addBusinessDays(iso: string, n: number): string {
  const step = n >= 0 ? 1 : -1;
  let cur = iso;
  let left = Math.abs(n);
  while (left > 0) {
    cur = addDays(cur, step);
    if (isBusinessDay(cur)) left--;
  }
  return cur;
}

/** 15.06.2026 biçimi */
export function formatTr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** 15 Haziran 2026 biçimi */
export function formatTrLong(iso: string): string {
  return parse(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function weekdayTr(iso: string): string {
  return parse(iso).toLocaleDateString("tr-TR", { weekday: "long", timeZone: "UTC" });
}
