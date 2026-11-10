import { addBusinessDays, addDays, addMonths } from "@/lib/business-days";

// Yasal süre kuralları. Başlangıç tarihinden hesaplanır; iş günü hesaplarında hafta sonu ve resmî tatiller atlanır.

export type DeadlineCategory = "SGK" | "İş Hukuku" | "İSG" | "KVKK" | "İcra" | "Borçlar" | "Zamanaşımı";

export interface DeadlineRule {
  id: string;
  title: string;
  category: DeadlineCategory;
  amount: number;
  unit: "takvim_gun" | "is_gun" | "ay" | "yil" | "saat";
  direction: "sonra" | "once";
  minusOneDay?: boolean;
  from: string;
  lawRef: string;
  note: string;
  keywords: string[];
}

export const DEADLINE_RULES: DeadlineRule[] = [
  { id: "sgk-giris", title: "SGK işe giriş bildirgesi", category: "SGK", amount: 1, unit: "takvim_gun", direction: "once", from: "İşe başlama tarihi", lawRef: "5510 s.K. m.8", note: "Genel kural: işe başlamadan en geç 1 gün önce verilir. Bazı sektörlerde (inşaat, tarım, balıkçılık) farklı bildirim süreleri uygulanabilir; güncel mevzuatı kontrol edin.", keywords: ["sgk", "giris", "bildirge", "ise baslama", "sigortali"] },
  { id: "sgk-cikis", title: "SGK işten ayrılış bildirgesi", category: "SGK", amount: 10, unit: "takvim_gun", direction: "sonra", from: "İşten ayrılış (çıkış) tarihi", lawRef: "5510 s.K. m.9", note: "Çıkış nedeni kodu doğru seçilmelidir (SGK Çıkış Kodları sekmesi). Süre aşılırsa idari para cezası uygulanabilir.", keywords: ["sgk", "cikis", "ayrilis", "bildirge", "10 gun"] },
  { id: "is-kazasi", title: "İş kazasının SGK'ya bildirilmesi", category: "SGK", amount: 3, unit: "is_gun", direction: "sonra", from: "Kaza tarihi", lawRef: "5510 s.K. m.13", note: "Kolluk kuvvetlerine derhal bildirim de gerekir. Ölümlü veya ağır kazalarda ek bildirimler uygulanabilir.", keywords: ["is kazasi", "kaza", "bildirim", "sgk"] },
  { id: "hakli-fesih", title: "Haklı nedenle fesih hakkının kullanımı", category: "İş Hukuku", amount: 6, unit: "is_gun", direction: "sonra", from: "İşverenin fesih nedenini öğrendiği tarih", lawRef: "4857 s.K. m.26", note: "Olaydan itibaren en geç 1 yıl içinde kullanılmalıdır; 6 iş günü geçerse hak düşer.", keywords: ["hakli", "fesih", "6 is gunu", "ahlak"] },
  { id: "ise-iade", title: "İşe iade: arabulucuya başvuru", category: "İş Hukuku", amount: 1, unit: "ay", direction: "sonra", from: "Fesih bildiriminin tebliği", lawRef: "4857 s.K. m.20; 7036 s.K. m.3", note: "Arabulucuya başvuru süresidir. Anlaşma sağlanamazsa son tutanağın tebliğinden itibaren 2 hafta içinde işe iade davası açılır.", keywords: ["ise iade", "iade", "arabulucu", "fesih", "dava"] },
  { id: "deneme", title: "Deneme süresi sonu (en fazla 2 ay)", category: "İş Hukuku", amount: 2, unit: "ay", direction: "sonra", minusOneDay: true, from: "İşe başlama tarihi", lawRef: "4857 s.K. m.15", note: "Son gün = başlangıç + 2 ay − 1 gün. Değerlendirme süre bitmeden yapılmalıdır; uygulamada 45. gün geri bildirimi önerilir.", keywords: ["deneme", "deneme suresi", "2 ay", "45 gun"] },
  { id: "ibraname", title: "İbraname için uygun tarih", category: "Borçlar", amount: 1, unit: "ay", direction: "sonra", from: "İş sözleşmesinin sona erdiği tarih", lawRef: "6098 s.K. m.420", note: "Sona erme tarihinden en az 1 ay sonra, yazılı ve alacak kalemleri tek tek belirtilerek düzenlenmelidir. Ödemeler banka yoluyla yapılmalıdır.", keywords: ["ibraname", "ibra", "420", "borc"] },
  { id: "issizlik", title: "İşsizlik ödeneği için İŞKUR başvurusu", category: "SGK", amount: 30, unit: "takvim_gun", direction: "sonra", from: "İşten ayrılış tarihi", lawRef: "4447 s.K. m.50", note: "Süre geçirilirse hak kaybı doğabilir. Başvuru İŞKUR veya e-Devlet üzerinden yapılır.", keywords: ["issizlik", "iskur", "odenek", "30 gun", "basvuru"] },
  { id: "icra", title: "İcra müzekkeresine cevap", category: "İcra", amount: 7, unit: "takvim_gun", direction: "sonra", from: "Müzekkerenin tebliğ tarihi", lawRef: "2004 s.K. m.355", note: "Cevap verilmezse işveren m.356 gereği borçtan şahsen sorumlu tutulabilir.", keywords: ["icra", "muzekkere", "haciz", "cevap", "7 gun"] },
  { id: "kvkk", title: "KVKK veri ihlali bildirimi (Kurul)", category: "KVKK", amount: 72, unit: "saat", direction: "sonra", from: "İhlalin öğrenildiği an", lawRef: "6698 s.K. m.12; Kurul kararı", note: "İhlal, Kişisel Veri Koruma Kurulu'na en geç 72 saat içinde bildirilmelidir.", keywords: ["kvkk", "veri ihlali", "ihlal", "72 saat", "kurul"] },
  { id: "zamanasimi", title: "İşçilik alacaklarında zamanaşımı", category: "Zamanaşımı", amount: 5, unit: "yil", direction: "sonra", from: "Alacağın muaccel olduğu tarih", lawRef: "6098 s.K. m.146", note: "Kıdem, ihbar, fazla çalışma ve ücret alacakları için genel süre 5 yıldır; bazı alacaklarda farklı kurallar olabilir.", keywords: ["zamanasimi", "alacak", "5 yil"] },
  { id: "muayene-cok", title: "Periyodik sağlık muayenesi (çok tehlikeli sınıf)", category: "İSG", amount: 1, unit: "yil", direction: "sonra", from: "Son muayene tarihi", lawRef: "6331 s.K. m.15", note: "Tehlike sınıfı İSG uzmanı ve işyeri hekimi ile belirlenir. Periyotlar yönetmeliğe göre değişebilir.", keywords: ["muayene", "saglik", "isg", "cok tehlikeli", "periyodik"] },
  { id: "muayene-tehlikeli", title: "Periyodik sağlık muayenesi (tehlikeli sınıf)", category: "İSG", amount: 3, unit: "yil", direction: "sonra", from: "Son muayene tarihi", lawRef: "6331 s.K. m.15", note: "Tehlike sınıfı İSG uzmanı ve işyeri hekimi ile belirlenir. Periyotlar yönetmeliğe göre değişebilir.", keywords: ["muayene", "saglik", "isg", "tehlikeli", "periyodik"] },
  { id: "muayene-az", title: "Periyodik sağlık muayenesi (az tehlikeli sınıf)", category: "İSG", amount: 5, unit: "yil", direction: "sonra", from: "Son muayene tarihi", lawRef: "6331 s.K. m.15", note: "Tehlike sınıfı İSG uzmanı ve işyeri hekimi ile belirlenir. Periyotlar yönetmeliğe göre değişebilir.", keywords: ["muayene", "saglik", "isg", "az tehlikeli", "periyodik"] },
];

/** Başlangıç tarihinden kuralın son gününü hesaplar (YYYY-AA-GG) */
export function computeDeadline(startIso: string, r: DeadlineRule): string {
  const sign = r.direction === "once" ? -1 : 1;
  let out: string;
  switch (r.unit) {
    case "takvim_gun":
      out = addDays(startIso, sign * r.amount);
      break;
    case "is_gun":
      out = addBusinessDays(startIso, sign * r.amount);
      break;
    case "ay":
      out = addMonths(startIso, sign * r.amount);
      break;
    case "yil":
      out = addMonths(startIso, sign * r.amount * 12);
      break;
    default:
      out = addDays(startIso, Math.ceil(r.amount / 24));
  }
  return r.minusOneDay ? addDays(out, -1) : out;
}

export function unitLabel(r: DeadlineRule): string {
  const labels: Record<DeadlineRule["unit"], string> = {
    takvim_gun: "takvim günü",
    is_gun: "iş günü",
    ay: "ay",
    yil: "yıl",
    saat: "saat",
  };
  return labels[r.unit];
}

export function describeAmount(r: DeadlineRule): string {
  return `${r.amount} ${unitLabel(r)}`;
}

export interface IcsEvent {
  uid: string;
  date: string;
  summary: string;
  description: string;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icsFold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

/** Takvim uygulamalarına (Google Takvim, Outlook, iOS) eklenebilen .ics içeriği üretir */
export function buildIcs(events: IcsEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cihan Ahtik//IK Akademisi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:İK Yasal Süreler",
  ];
  for (const e of events) {
    const start = e.date.replace(/-/g, "");
    const end = addDays(e.date, 1).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@ik-akademisi`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsEscape(e.summary)}`,
      `DESCRIPTION:${icsEscape(e.description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsEscape(e.summary)}`,
      "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(icsFold).join("\r\n") + "\r\n";
}
