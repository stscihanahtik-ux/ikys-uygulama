import { db } from "@/db";
import {
  laws,
  hrTopics,
  questions,
  announcements,
  sgkCodes,
  type ChatCitation,
  type ChatFollowUp,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import {
  hesaplaKidem,
  hesaplaIhbar,
  hesaplaYillikIzin,
  hesaplaBrutNet,
  hesaplaFazlaMesai,
  hesaplaIssizlik,
  fmtTL,
} from "@/lib/calculators";
import { getParams } from "@/lib/settings";
import { DEADLINE_RULES, computeDeadline, describeAmount, type DeadlineRule } from "@/lib/deadlines";
import { formatTr, formatTrLong, todayIso, weekdayTr } from "@/lib/business-days";

export type RobotMode = "hizli" | "detayli" | "adim" | "ornek" | "belge";

export interface RobotHistoryItem {
  role: string;
  content: string;
}

export interface RobotReply {
  answer: string;
  exampleBox: string;
  citations: ChatCitation[];
  intent: string;
  followUps: ChatFollowUp[];
  confidence: "Yüksek" | "Orta" | "Düşük";
  action?: { type: "open_tab"; tab: string } | null;
}

type SgkRow = typeof sgkCodes.$inferSelect;

function normalizeTurkish(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "ve", "veya", "ile", "bir", "bu", "su", "ne", "nedir", "nasil", "neden", "hangi", "kadar", "icin", "gore",
  "olan", "mi", "mu", "mı", "hakkinda", "ornek", "ver", "anlat", "bana", "soru", "kanun", "kanunu", "sayili",
  "madde", "var", "yok", "olarak", "da", "de", "peki", "ama", "cok", "en",
  "zaman", "gerekir", "gerekli", "olur", "olabilir", "yapilir", "yapilabilir", "lazim", "midir", "mudur",
  "acaba", "gecerlidir", "gecerli", "gecerlilik", "kac", "bunu", "sey", "nelerdir",
]);

const SGK_STOP = new Set([
  "sgk", "kod", "kodu", "kodlari", "kodlar", "cikis", "ayrilis", "bildirge", "bildirgesi", "nedeni", "nedir", "anlami", "isten", "ne",
]);

const GROUP_LABEL: Record<string, string> = {
  isci: "İşçi kaynaklı",
  isveren: "İşveren kaynaklı",
  yasal: "Yasal / emeklilik / ölüm",
  diger: "Diğer",
};

const FLAG_LABEL: Record<string, string> = {
  evet: "Hak doğar",
  hayir: "Hak doğmaz",
  duruma_bagli: "Duruma bağlı",
};

function extractTokens(query: string): string[] {
  return normalizeTurkish(query)
    .split(" ")
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

// Kullanıcıların günlük dili → mevzuat/İK terimleri
const SYNONYMS: Record<string, string[]> = {
  maas: ["ucret"], maasi: ["ucret"], ucret: ["maas"], aylik: ["ucret", "maas"],
  kovuldum: ["fesih"], kovma: ["fesih"], cikarma: ["fesih"], atildim: ["fesih"],
  ayrildim: ["istifa", "fesih"], ayrilmak: ["istifa"], tatil: ["izin"],
  ssk: ["sgk", "5510"], dogum: ["analik", "izin"], hamile: ["analik"],
  raporlu: ["istirahat", "rapor"], hastalik: ["istirahat", "rapor"],
  mesai: ["fazla", "calisma"], personel: ["calisan", "isci"], isci: ["calisan"],
  patron: ["isveren"], mulakat: ["ise", "alim", "star"], sinav: ["quiz"], test: ["quiz"],
  emekli: ["kidem"], emeklilik: ["kidem", "5510"], ikramiye: ["prim", "ucret"],
  zam: ["ucret"], terfi: ["performans"], stajyer: ["staj"], staj: ["stajyer"],
  uzaktan: ["hibrit", "evden"], evden: ["uzaktan"], sskli: ["sgk"],
};

function expandTokens(tokens: string[]): string[] {
  const out = new Set(tokens);
  for (const t of tokens) {
    const syns = SYNONYMS[t];
    if (syns) for (const s of syns) for (const part of normalizeTurkish(s).split(" ")) out.add(part);
  }
  return [...out];
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row = Array<number>(n + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

// Yazım hatası / eksik harf toleranslı puanlama ("kidem tazminati", "ibranme" gibi)
function fuzzyScore(tokens: string[], haystack: string): number {
  const words = [...new Set(normalizeTurkish(haystack).split(" ").filter((w) => w.length >= 3))];
  const wordSet = new Set(words);
  let score = 0;
  for (const token of tokens) {
    if (token.length < 4 || wordSet.has(token)) continue;
    let best = 0;
    for (const w of words) {
      if (w.startsWith(token) || token.startsWith(w)) {
        best = Math.max(best, 2);
        continue;
      }
      if (Math.abs(w.length - token.length) <= 2) {
        const d = levenshtein(token, w);
        if (d === 1) best = Math.max(best, 2.5);
        else if (d === 2 && token.length >= 7) best = Math.max(best, 1.5);
      }
    }
    score += best;
  }
  return score;
}

function scoreMatch(tokens: string[], haystack: string, boostTerms: string[] = []): number {
  const normHaystack = normalizeTurkish(haystack);
  let score = 0;
  for (const token of tokens) {
    if (normHaystack.includes(token)) score += /^\d{3,4}$/.test(token) ? 12 : 3;
  }
  for (const boost of boostTerms) {
    const normBoost = normalizeTurkish(boost);
    for (const token of tokens) {
      if (normBoost === token) score += 9;
      else if (normBoost.includes(token) || token.includes(normBoost)) score += 5;
    }
  }
  return score;
}

function parseAmount(text: string): number | null {
  const norm = text.replace(/\./g, "").replace(",", ".");
  const binMatch = norm.match(/(\d+(?:\.\d+)?)\s*bin/);
  if (binMatch) return parseFloat(binMatch[1]) * 1000;
  // Yıl gibi görünen sayıları (1900–2100) tutar sanma
  const nums =
    norm
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number)
      .filter((n) => n >= 1000 && !(n >= 1900 && n <= 2100)) || [];
  return nums.length ? Math.max(...nums) : null;
}

function parseYears(text: string): { yil: number; ay: number } {
  const yilMatch = text.match(/(\d+(?:[.,]\d+)?)\s*y[ıi]l/);
  const ayMatch = text.match(/(\d+)\s*ay/);
  return {
    yil: yilMatch ? parseFloat(yilMatch[1].replace(",", ".")) : 0,
    ay: ayMatch ? parseInt(ayMatch[1]) : 0,
  };
}

const BELGE_SABLONLARI: Record<string, { baslik: string; metin: string }> = {
  savunma: {
    baslik: "Savunma İstemi Yazısı (4857 s.K. m.19)",
    metin:
      "SAVUNMA İSTEMİ YAZISI\n\nSayı: [....]  Tarih: [GG.AA.YYYY]\n\nSayın [ÇALIŞAN ADI SOYADI] (Sicil No: [....])\n\nHakkınızda [tarih] tarihinde tespit edilen [OLAYIN ÖZETİ: örn. 12.05.2026 tarihinde vardiyanıza 2 saat geç gelmeniz / performans hedeflerinin altında kalmanız] hususu ile ilgili olarak, 4857 Sayılı İş Kanunu'nun 19. maddesi uyarınca savunmanızı [GG.AA.YYYY] tarihine kadar (en az 2-3 iş günü süre verilmelidir) yazılı olarak İnsan Kaynakları Departmanına iletmenizi rica ederiz.\n\nSavunmanız değerlendirilmeden hakkınızda fesih kararı verilmeyeceğini bildiririz.\n\n[İŞVEREN / İK YETKİLİSİ]\nİmza - Kaşe\n\nTebliğ Alan: [Çalışan İmzası]  Tarih: [....]",
  },
  tutanak: {
    baslik: "Olay Tespit Tutanağı",
    metin:
      "OLAY TESPİT TUTANAĞI\n\nTarih/Saat: [GG.AA.YYYY - SS:DD]  Yer: [DEPARTMAN/LOKASYON]\n\nOLAYIN ÖZETİ: [Olay; kim, ne zaman, nerede, ne yaptı — somut ve yorumsuz anlatılır.]\n\nGÖRGÜ TANIKLARI: 1) [Ad Soyad - İmza]  2) [Ad Soyad - İmza]\n\nVarsa ek belgeler (kamera kaydı, puantaj, e-posta) tutanağa eklenir. Tutanak, disiplin sürecinde (4857 m.25/26'daki 6 iş günlük süre dikkat!) delil niteliğindedir.\n\nTutanak Düzenleyen: [Ad Soyad - İmza]\nBirim Yöneticisi: [Ad Soyad - İmza]",
  },
  istifa: {
    baslik: "Çalışma Belgesi (4857 s.K. m.28)",
    metin:
      "ÇALIŞMA BELGESİ\n\n[ŞİRKET UNVANI] bünyesinde, [İŞE GİRİŞ TARİHİ] – [İŞTEN AYRILIŞ TARİHİ] tarihleri arasında [GÖREVİ/UNVANI] olarak görev yapan Sayın [ÇALIŞAN ADI SOYADI]'nın (T.C. Kimlik No: [....]) iş sözleşmesi [AYRILIŞ NEDENİ] nedeniyle sona ermiştir.\n\n4857 Sayılı İş Kanunu'nun 28. maddesi uyarınca düzenlenmiştir.\n\n[İŞVEREN / İK YETKİLİSİ]\nİmza - Kaşe",
  },
  izin: {
    baslik: "Yıllık Ücretli İzin Talep Formu (4857 s.K. m.53)",
    metin:
      "YILLIK ÜCRETLİ İZİN TALEP FORMU\n\nÇalışan: [AD SOYAD]  Sicil No: [....]  Departman: [....]\nİşe Giriş Tarihi: [....]  Hak Edilen Toplam İzin: [....] gün  Daha Önce Kullanılan: [....] gün  Kalan: [....] gün\n\nTalep Edilen İzin: [BAŞLANGIÇ] – [BİTİŞ] arası toplam [....] iş günü\nİzin Adresi/Telefon: [....]\n\nÇalışan İmzası: [....]   Yönetici Onayı: [....]   İK Onayı: [....]",
  },
  cikis: {
    baslik: "İşten Çıkış (Offboarding) Kontrol Listesi",
    metin:
      "İŞTEN ÇIKIŞ KONTROL LİSTESİ — [ÇALIŞAN ADI]\n\n☐ Fesih/istifa yazısı ve (gerekiyorsa) m.19 savunma tutanağı dosyada\n☐ İhbar süresi/tazminatı (m.17) ve kıdem tazminatı hesabı onaylandı\n☐ Kullanılmamış yıllık izin ücreti son bordroya eklendi (m.59)\n☐ Zimmet teslimi: laptop, telefon, kart, araç, anahtar\n☐ IT erişimleri kapatıldı (e-posta, VPN, uygulamalar) — KVKK güvenliği\n☐ SGK işten ayrılış bildirgesi 10 gün içinde doğru kodla verilecek (5510 m.9)\n☐ Çalışma Belgesi hazırlandı (m.28)\n☐ Çıkış mülakatı planlandı\n☐ İbraname: TBK m.420 gereği çıkıştan en az 1 AY sonra, banka ödemesi ve kalem kalem düzenlenecek (bugün imzalatılmaz!)",
  },
  giris: {
    baslik: "İşe Giriş (Onboarding) Kontrol Listesi",
    metin:
      "İŞE GİRİŞ KONTROL LİSTESİ — [ADAY ADI]\n\n☐ SGK işe giriş bildirgesi işbaşından en geç 1 gün önce verildi (5510 m.8)\n☐ İşe giriş sağlık raporu alındı (6331 m.15) — rapor olmadan işbaşı yapılmaz\n☐ Temel İSG eğitimi planlandı/tamamlandı (6331 m.17)\n☐ İş sözleşmesi imzalandı (belirli/belirsiz, deneme süresi max 2 ay - m.15)\n☐ KVKK Aday/Çalışan Aydınlatma Metni tebliğ edildi (6698 m.10)\n☐ Özlük dosyası: kimlik, ikametgah, diploma, adli sicil, fotoğraf (4857 m.75)\n☐ Ekipman, e-posta ve sistem erişimleri hazır; Buddy atandı\n☐ 30-60-90 gün planı ve deneme süresi 45. gün değerlendirme tarihi takvime işlendi",
  },
};

/** SGK çıkış kodu yanıtı */
function sgkReply(hits: SgkRow[]): RobotReply {
  const [c, ...others] = hits;
  const lines = [
    `**SGK ${c.code} — ${c.title}**`,
    `• Grup: ${GROUP_LABEL[c.category] ?? "Diğer"}`,
    `• Kıdem tazminatı: ${FLAG_LABEL[c.severance] ?? "—"}`,
    `• İşsizlik ödeneği: ${FLAG_LABEL[c.unemployment] ?? "—"}`,
    `• Yasal dayanak: ${c.lawRef || "—"}`,
    "",
    c.description,
  ];
  if (c.notes) lines.push("", `⚠️ ${c.notes}`);
  if (others.length > 0) {
    lines.push("", `**Diğer eşleşen kodlar:** ${others.map((o) => `${o.code} — ${o.title}`).join(" • ")}`);
  }
  const kidemCumle =
    c.severance === "evet"
      ? "kıdem tazminatı hesaplanır (en az 1 yıl çalışma şartı aranır)"
      : c.severance === "duruma_bagli"
        ? "kıdem hakkı çalışma süresi ve koşullara göre değerlendirilir"
        : "kıdem tazminatı doğmaz";
  const issizCumle =
    c.unemployment === "evet"
      ? "işsizlik ödeneği için 30 gün içinde İŞKUR'a başvurabilir"
      : c.unemployment === "duruma_bagli"
        ? "işsizlik ödeneği şartlara bağlıdır"
        : "işsizlik ödeneği bağlanmaz";
  return {
    answer: lines.join("\n"),
    exampleBox: `Örnek: Bir çalışan ${c.code} koduyla ayrıldığında ${kidemCumle}; ${issizCumle}.`,
    citations: [{ type: "kanun", ref: "5510-sosyal-sigortalar-kanunu", title: "5510 s.K. (SGK kodları)" }],
    intent: "sgk-kod",
    confidence: "Yüksek",
    followUps: [
      { label: "📋 Tüm SGK kodları", prompt: "SGK kodlarını aç" },
      { label: "🧮 Kıdem hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?" },
    ],
    action: null,
  };
}

/** Yasal süre yanıtı */
function deadlineReply(r: DeadlineRule, today: string, citation: ChatCitation | null): RobotReply {
  const example = computeDeadline(today, r);
  return {
    answer: [
      `**${r.title}**`,
      `• Süre: ${describeAmount(r)} (${r.direction === "once" ? "başlangıçtan önce" : "başlangıçtan sonra"})`,
      `• Başlangıç: ${r.from}`,
      `• Yasal dayanak: ${r.lawRef}`,
      "",
      r.note,
      "",
      `📅 Örnek: ${formatTrLong(today)} tarihinde başlangıç olursa son gün **${formatTr(example)}** (${weekdayTr(example)}).`,
    ].join("\n"),
    exampleBox:
      "Hesaplarda hafta sonları ve resmî tatiller (2026–2027) dikkate alınır. Hesaplayıcılar > Yasal Süre bölümünden birden çok süreyi tek seferde hesaplayıp takvime (.ics) ekleyebilirsiniz.",
    citations: citation ? [citation] : [],
    intent: "yasal-sure",
    confidence: "Yüksek",
    followUps: [
      { label: "📅 Yasal süre hesaplayıcı", prompt: "Yasal süre hesaplayıcıyı aç" },
      { label: "📋 SGK kodları", prompt: "SGK kodlarını aç" },
    ],
    action: null,
  };
}

export async function generateRobotReply(
  userQuestion: string,
  history: RobotHistoryItem[] = [],
  mode: RobotMode = "detayli"
): Promise<RobotReply> {
  const norm = normalizeTurkish(userQuestion);
  // Güncel parametreler (asgari ücret, kıdem tavanı, vergi dilimleri) yönetici panelinden gelir
  const params = await getParams();
  const today = todayIso();

  // ---------- Bağlam: takip soruları ----------
  let effectiveQuery = userQuestion;
  const isContextual =
    /^(peki|detay|ornek|devam|bunun|bunu|onun|cevabi goster|anlat|acikla|maddesi)/.test(norm) ||
    norm.split(" ").filter(Boolean).length <= 2;
  if (isContextual && history.length > 0) {
    const lastUser = [...history].reverse().find((h) => h.role === "user");
    if (lastUser && normalizeTurkish(lastUser.content) !== norm) {
      effectiveQuery = `${lastUser.content} ${userQuestion}`;
    }
  }

  // ---------- Selamlama / teşekkür ----------
  if (/^(merhaba|selam|gunaydin|iyi gunler|hey|slm)\b/.test(norm)) {
    return {
      answer:
        "Merhaba! Ben Cihan Ahtik tarafından geliştirilen **İK & Mevzuat Robotu**. 12 temel kanunu, İK tekniklerini ve metotları tarayarak madde madde, örneklerle yanıt veririm. Kıdem/ihbar/izin/maaş hesabı yapabilir, SGK çıkış kodlarını açıklayabilir, yasal süreleri hesaplayabilir, belge taslağı hazırlayabilir ve size quiz sorabilirim.",
      exampleBox:
        "Şunları deneyin: '3 yıl çalıştım, brüt 60 bin, kıdem tazminatım ne kadar?' • 'SGK 04 kodu ne demek?' • 'Haklı fesih için kaç iş günü var?' • 'Bana savunma yazısı taslağı hazırla'",
      citations: [],
      intent: "selamlama",
      confidence: "Yüksek",
      followUps: [
        { label: "🧮 Kıdem hesapla", prompt: "Kıdem tazminatı hesaplamak istiyorum: 4 yıl çalıştım, brüt ücretim 70.000 TL" },
        { label: "📝 Belge taslağı hazırla", prompt: "Bana savunma istemi yazısı taslağı hazırla" },
        { label: "📋 SGK kodları", prompt: "SGK kodlarını aç" },
        { label: "🎯 Quiz başlat", prompt: "Bana bir quiz sorusu sor" },
      ],
      action: null,
    };
  }
  if (/tesekkur|sag ol|eyvallah/.test(norm)) {
    return {
      answer:
        "Rica ederim! Başka bir mevzuat, hesaplama veya İK süreci sorunuz olursa buradayım. Dilerseniz size günlük quiz ile bilginizi de test edebilirim.",
      exampleBox: "Unutmayın: Günlük Bilgi sekmesinde her gün yeni bir kanun/metot bilgisi sizi bekliyor.",
      citations: [],
      intent: "tesekkur",
      confidence: "Yüksek",
      followUps: [{ label: "🎯 Quiz başlat", prompt: "Bana bir quiz sorusu sor" }],
      action: null,
    };
  }

  // ---------- Navigasyon ----------
  const navMap: [RegExp, string, string][] = [
    [/hesaplayici|hesaplamalari ac|sure hesapla|takvim ac/, "calculators", "Hesaplayıcılar"],
    [/sablonlari ac|sablonlar/, "templates", "Şablonlar & Formlar"],
    [/(sgk|cikis) kodlari(nı|ni)? (ac|goster|listele)|sgk kodlari$/, "sgk", "SGK Kodları"],
    [/kanunlari ac|kanunlar sekmesi/, "laws", "Kanunlar"],
    [/sorulari ac|soru bankasi/, "questions", "Sorular"],
    [/gunluk bilgi/, "daily", "Günlük Bilgi"],
  ];
  for (const [re, tab, label] of navMap) {
    if (re.test(norm)) {
      return {
        answer: `**${label}** bölümünü sizin için açıyorum. Orada işleminizi yapabilir, takıldığınız yerde tekrar bana sorabilirsiniz.`,
        exampleBox: "İpucu: Hesaplayıcı sonuçlarını bana yazarsanız mevzuat yorumunu da eklerim.",
        citations: [],
        intent: "navigasyon",
        confidence: "Yüksek",
        followUps: [],
        action: { type: "open_tab", tab },
      };
    }
  }

  // ---------- Hesaplamalar ----------
  const tutar = parseAmount(userQuestion);
  const { yil, ay } = parseYears(userQuestion);
  const toplamYil = yil + ay / 12;

  if (/kidem/.test(norm) && (tutar || toplamYil > 0 || /hesapla/.test(norm))) {
    if (tutar && toplamYil >= 1) {
      const bugun = new Date();
      const bas = new Date(bugun.getTime() - toplamYil * 365.25 * 86400000);
      const res = hesaplaKidem(bas.toISOString().slice(0, 10), bugun.toISOString().slice(0, 10), tutar, params);
      if (res) {
        return {
          answer: `**Kıdem Tazminatı Hesabınız (Tahmini)**\n• Çalışma süresi: ~${toplamYil.toFixed(1)} yıl (${res.toplamGun} gün)\n• Giydirilmiş brüt ücret: ${fmtTL(res.brutUcret)}${
            res.tavanUygulandi
              ? ` → Tavan uygulandı, esas alınan: ${fmtTL(res.esasUcret)} (Güncel tavan: ${fmtTL(params.kidemTavani)})`
              : ""
          }\n• **Brüt kıdem tazminatı: ${fmtTL(res.kidemBrut)}**\n• Damga vergisi: -${fmtTL(res.damgaVergisi)}\n• **Net ödenecek: ${fmtTL(res.kidemNet)}**\n\n${res.aciklama}`,
          exampleBox:
            "Hesaplayıcılar sekmesinden işe giriş/çıkış tarihlerini gün gün girerek net hesabı ve bordro dökümünü Word veya Excel olarak indirebilirsiniz.",
          citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
          intent: "hesap-kidem",
          confidence: "Yüksek",
          followUps: [
            {
              label: "İhbarımı da hesapla",
              prompt: `${toplamYil.toFixed(0)} yıl kıdem için ihbar süresi ve tazminatı ne kadar? Brüt ücretim ${tutar.toLocaleString("tr-TR")} TL`,
            },
            { label: "📂 Hesaplayıcıları aç", prompt: "Hesaplayıcıları aç" },
          ],
          action: null,
        };
      }
    }
    return {
      answer:
        "Kıdem tazminatınızı hesaplayabilirim. Bana şu iki bilgiyi yazın: **(1) Kaç yıl/ay çalıştınız? (2) Son giydirilmiş brüt ücretiniz ne kadar?**",
      exampleBox: "Örnek yazım: '5 yıl 3 ay çalıştım, brüt ücretim 85 bin TL, kıdemim ne kadar?'",
      citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
      intent: "hesap-kidem-bilgi",
      confidence: "Orta",
      followUps: [{ label: "📂 Hesaplayıcıyı aç", prompt: "Hesaplayıcıları aç" }],
      action: null,
    };
  }

  if (/ihbar/.test(norm) && (toplamYil > 0 || tutar)) {
    const y = toplamYil > 0 ? toplamYil : 2;
    const res = hesaplaIhbar(y, tutar || 50000);
    return {
      answer: `**İhbar Süresi & Tazminatı (4857 s.K. m.17)**\n• Kıdem: ${y} yıl → **${res.hafta} hafta (${res.gun} gün)** ihbar süresi\n• Brüt ücret ${fmtTL(tutar || 50000)} için **brüt ihbar tazminatı: ${fmtTL(res.brutTazminat)}**\n• Tahmini kesintiler: GV -${fmtTL(res.gv)}, DV -${fmtTL(res.dv)} → **Net: ${fmtTL(res.netTazminat)}** (kümülatif matraha göre değişir)\n\n${res.aciklama} İhbar süresi içinde günde en az 2 saat iş arama izni verilir (m.27).`,
      exampleBox:
        "Süre kullandırılırsa tazminat ödenmez; çalışanın erken ayrılmak istemesi halinde kalan süre ücreti kesilebilir (Yargıtay içtihadı).",
      citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
      intent: "hesap-ihbar",
      confidence: "Yüksek",
      followUps: [
        {
          label: "Kıdemimi de hesapla",
          prompt: `${y} yıl çalıştım, brüt ücretim ${(tutar || 50000).toLocaleString("tr-TR")} TL, kıdem tazminatım ne kadar?`,
        },
      ],
      action: null,
    };
  }

  if (/yillik izin|izin gunu|izin hakki/.test(norm) && (toplamYil > 0 || /hesapla|kac gun/.test(norm))) {
    const yasMatch = userQuestion.match(/(\d{2})\s*ya[şs]/);
    const res = hesaplaYillikIzin(toplamYil || 1, yasMatch ? parseInt(yasMatch[1]) : 0);
    return {
      answer: `**Yıllık Ücretli İzin Hakkınız**\n• Kıdem: ${toplamYil || 1} yıl${yasMatch ? `, Yaş: ${yasMatch[1]}` : ""} → **Yılda en az ${res.gun} iş günü** ücretli izin.\n\n${res.aciklama}`,
      exampleBox:
        "Örnek: 6 yıllık ve 52 yaşındaki bir çalışan için — kıdeme göre 20 gün, yaş kuralı da 20 gün → sonuç 20 gündür. 16 yıllık çalışanda kıdem 26 günü verir.",
      citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
      intent: "hesap-izin",
      confidence: "Yüksek",
      followUps: [
        {
          label: "İzin ücreti çıkışta nasıl ödenir?",
          prompt: "Kullanılmayan yıllık izin ücreti işten çıkışta nasıl hesaplanır ve ödenir?",
        },
      ],
      action: null,
    };
  }

  if (/(brutten nete|brut.*net|net maas|maasim net)/.test(norm) && tutar) {
    const res = hesaplaBrutNet(tutar, 0, params);
    if (res) {
      return {
        answer: `**Brüt → Net Maaş (Tahmini)**\n• Brüt: ${fmtTL(res.brut)}\n• SGK işçi payı: -${fmtTL(res.sgkIsci)} • İşsizlik işçi payı: -${fmtTL(res.issizlikIsci)}\n• Gelir vergisi (asgari ücret istisnası ${fmtTL(res.asgariIstisna)} düşüldü): -${fmtTL(res.gelirVergisi)}\n• Damga vergisi: -${fmtTL(res.damga)}\n• **Net maaş: ${fmtTL(res.net)}**\n• İşverene toplam maliyet: ~${fmtTL(res.isverenMaliyet)}\n\n${res.aciklama}`,
        exampleBox:
          "Yıl içinde vergi dilimi yükseldikçe aynı brütün neti düşer. Hesaplayıcılar sekmesinde kümülatif matrahınızı girerek ay bazlı netinizi görebilirsiniz.",
        citations: [
          { type: "kanun", ref: "5510-sosyal-sigortalar-kanunu", title: "5510 s.K." },
          { type: "kanun", ref: "193-gelir-vergisi-kanunu", title: "193 GVK" },
        ],
        intent: "hesap-maas",
        confidence: "Orta",
        followUps: [{ label: "📂 Hesaplayıcıları aç", prompt: "Hesaplayıcıları aç" }],
        action: null,
      };
    }
  }

  if (/fazla mesai|fazla calisma/.test(norm) && tutar && /saat/.test(norm)) {
    const saatMatch = userQuestion.match(/(\d+(?:[.,]\d+)?)\s*saat/);
    const saat = saatMatch ? parseFloat(saatMatch[1].replace(",", ".")) : 10;
    const res = hesaplaFazlaMesai(tutar, saat, "fazla-calisma");
    return {
      answer: `**Fazla Mesai Hesabı**\n• Saat ücreti (${fmtTL(tutar)} / 225): ${fmtTL(res.saatUcreti)}\n• %50 zamlı saat: ${fmtTL(res.zamliSaat)}\n• ${saat} saat fazla mesai → **Toplam: ${fmtTL(res.toplam)}**\n\n${res.aciklama}`,
      exampleBox:
        "Çalışan isterse zamlı ücret yerine her fazla saat için 1 saat 30 dakika serbest zaman (izin) kullanabilir (m.41).",
      citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
      intent: "hesap-mesai",
      confidence: "Yüksek",
      followUps: [],
      action: null,
    };
  }

  if (/issizlik maasi|issizlik odenegi/.test(norm) && /hak|alabilir|hesapla|sart/.test(norm)) {
    const gunMatch = userQuestion.match(/(\d{3,4})\s*g[uü]n/);
    const gun = gunMatch ? parseInt(gunMatch[1]) : 0;
    if (gun > 0 && tutar) {
      const res = hesaplaIssizlik(gun, tutar, /istifa/.test(norm), params);
      return {
        answer: `**İşsizlik Ödeneği Değerlendirmesi**\n${res.aciklama}\n• Tahmini aylık ödenek: **${fmtTL(res.aylikTahmini)}**`,
        exampleBox:
          "SGK çıkış kodu kaderdir: İşveren feshi (04) hak kazandırır; istifa (03) ve 25/II ahlak feshi (42-50) kazandırmaz.",
        citations: [{ type: "kanun", ref: "4447-issizlik-sigortasi-kanunu", title: "4447 s.K." }],
        intent: "hesap-issizlik",
        confidence: "Yüksek",
        followUps: [],
        action: null,
      };
    }
  }

  // ---------- Güncel parametre soruları (yönetici panelinden güncellenir) ----------
  if (/kidem.*tavan|tavan.*kidem/.test(norm) && !tutar) {
    return {
      answer: `**Güncel kıdem tazminatı tavanı:** ${fmtTL(params.kidemTavani)} (brüt)\n\nGiydirilmiş brüt ücret bu tavanı aşarsa kıdem hesabında yalnızca tavan tutarı esas alınır (1475 s.K. m.14). Her tam çalışma yılı için bu tutar kadar kıdem ödenir.\n\n📌 ${params.updatedNote}`,
      exampleBox:
        "Örnek: Giydirilmiş brüt ücreti 90.000 TL olan bir çalışanın kıdem hesabında ücret olarak tavan tutar esas alınır; her tam yıl için bu tutar kadar kıdem hesaplanır.",
      citations: [],
      intent: "parametre-kidem",
      confidence: "Yüksek",
      followUps: [
        { label: "🧮 Kıdem hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?" },
        { label: "📅 Yasal süreler", prompt: "Yasal süre hesaplayıcıyı aç" },
      ],
      action: null,
    };
  }

  if (/asgari ucret/.test(norm) && /ne kadar|kac|guncel|tutar|rakam|net|brut/.test(norm) && !/vergi|istisna|haciz/.test(norm)) {
    const net = hesaplaBrutNet(params.asgariUcretBrut, 0, params);
    return {
      answer: `**Güncel asgari ücret:**\n• Brüt: ${fmtTL(params.asgariUcretBrut)}\n• Net (tahmini): ${fmtTL(net?.net ?? 0)}\n\nAsgari ücrete isabet eden kısım gelir ve damga vergisinden istisnadır (193 s.K. m.23/18). Yıllık ve işveren maliyeti hesapları için Hesaplayıcılar sekmesini kullanabilirsiniz.\n\n📌 ${params.updatedNote}`,
      exampleBox:
        "Örnek: Asgari ücretle çalışan birinin bordrosunda gelir vergisi oluşmaz; işveren maliyeti ise brüt ücrete işveren SGK ve işsizlik paylarının eklenmesiyle bulunur.",
      citations: [{ type: "kanun", ref: "193-gelir-vergisi-kanunu", title: "193 GVK" }],
      intent: "parametre-asgari",
      confidence: "Yüksek",
      followUps: [
        { label: "🧮 Brüt → net hesapla", prompt: "Brütten nete hesapla: brüt 50.000 TL" },
        { label: "📘 Gelir vergisi kanunu", prompt: "193 Sayılı Gelir Vergisi Kanunu'nun asgari ücret istisnasını anlat" },
      ],
      action: null,
    };
  }

  // ---------- SGK çıkış kodları ----------
  const codeNum = norm.match(/\b(\d{1,2})\b/);
  const sgkExitIntent =
    (/kod/.test(norm) && /(sgk|cikis|ayrilis|bildirge|isten|istifa|fesh)/.test(norm)) ||
    (codeNum !== null && /(sgk|cikis|ayrilis)/.test(norm));
  if (sgkExitIntent) {
    const allCodes = await db.select().from(sgkCodes).orderBy(asc(sgkCodes.sortOrder));
    const wanted = codeNum ? codeNum[1].padStart(2, "0") : null;
    let hits: SgkRow[] = wanted ? allCodes.filter((c) => c.code === wanted) : [];
    if (hits.length === 0) {
      const toks = extractTokens(effectiveQuery).filter((t) => !SGK_STOP.has(t));
      hits = allCodes
        .map((c) => ({ c, s: scoreMatch(toks, `${c.title} ${c.description}`) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 3)
        .map((x) => x.c);
    }
    if (hits.length > 0) return sgkReply(hits);

    const common = allCodes.filter((c) => ["03", "04", "05", "08", "22", "24", "25", "42"].includes(c.code));
    return {
      answer: `SGK işten ayrılış (çıkış) kodlarını **SGK Kodları** sekmesinde arayabilirsiniz. Sık kullanılanlar:\n${common
        .map((c) => `• **${c.code}** — ${c.title}`)
        .join("\n")}`,
      exampleBox:
        "Kod seçimi kıdem tazminatı ve işsizlik ödeneği hakkını doğrudan etkiler. Örnek: 03 (istifa) ile ayrılan çalışana kıdem ödenmez; 04 (işveren feshi) ile ayrılan çalışana 1 yıl şartıyla kıdem ödenir.",
      citations: [],
      intent: "sgk-liste",
      confidence: "Orta",
      followUps: [{ label: "📋 SGK kodlarını aç", prompt: "SGK kodlarını aç" }],
      action: { type: "open_tab", tab: "sgk" },
    };
  }

  // ---------- Yasal süreler ----------
  const timeWord =
    /kac gun|kac ay|kac saat|kac is gunu|son gun|son tarih|ne zaman|suresi|sure ne|bildirim suresi|ne kadar surede/.test(norm);
  if (timeWord) {
    const toks = expandTokens(extractTokens(effectiveQuery));
    const ranked = DEADLINE_RULES.map((r) => ({ r, s: scoreMatch(toks, `${r.title} ${r.from}`, r.keywords) }))
      .filter((x) => x.s >= 5)
      .sort((a, b) => b.s - a.s);
    if (ranked.length > 0) {
      const top = ranked[0].r;
      const lawNum = top.lawRef.match(/\b(\d{4})\b/)?.[1];
      const lawRow = lawNum ? (await db.select().from(laws).where(eq(laws.lawNumber, lawNum)).limit(1))[0] : undefined;
      const citation: ChatCitation | null = lawRow ? { type: "kanun", ref: lawRow.slug, title: `${lawRow.lawNumber} s.K.` } : null;
      return deadlineReply(top, today, citation);
    }
  }

  // ---------- Duyuru ve sürüm notları ----------
  if (
    /yenilik|surum|guncelleme|duyuru|ne degisti/.test(norm) &&
    !/asgari|kidem|kanun|vergi|sgk|ucret|maas|prim|haciz|ihbar/.test(norm)
  ) {
    const anns = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.id))
      .limit(3);
    if (anns.length > 0) {
      return {
        answer: `**📢 Uygulamadaki son yenilikler ve güncellemeler:**\n${anns
          .map((a) => `• **${a.version ? `v${a.version} — ` : ""}${a.title}** (${a.kind}): ${a.body.slice(0, 200)}`)
          .join("\n")}`,
        exampleBox: "Tüm duyurular Günlük Bilgi sekmesinde listelenir.",
        citations: [],
        intent: "yenilik",
        confidence: "Yüksek",
        followUps: [
          { label: "🧮 Güncel kıdem tavanı", prompt: "Güncel kıdem tazminatı tavanı ne kadar?" },
          { label: "📅 Yasal süreler", prompt: "Yasal süre hesaplayıcıyı aç" },
        ],
        action: null,
      };
    }
  }

  // ---------- Belge / şablon taslağı ----------
  if (/taslak|taslagi|sablon/.test(norm) || (/hazirla/.test(norm) && /savunma|tutanak|belge|yazi|form|liste|ibra/.test(norm))) {
    let key = "savunma";
    if (/tutanak/.test(norm)) key = "tutanak";
    else if (/cikis|offboarding|ayrilis listesi/.test(norm)) key = "cikis";
    else if (/giris|onboarding|ise giris listesi|kontrol listesi/.test(norm)) key = "giris";
    else if (/izin formu/.test(norm)) key = "izin";
    else if (/calisma belgesi/.test(norm)) key = "istifa";
    const sablon = BELGE_SABLONLARI[key];
    return {
      answer: `**${sablon.baslik}** taslağını hazırladım. Köşeli parantezli alanları doldurmanız yeterli. Şablonlar sekmesinde ad/soyad girerek belgeyi Word veya Excel olarak indirebilirsiniz.`,
      exampleBox: sablon.metin,
      citations: [{ type: "kanun", ref: "4857-is-kanunu", title: "4857 s.K." }],
      intent: "belge",
      confidence: "Yüksek",
      followUps: [{ label: "📂 Şablonları aç", prompt: "Şablonları aç" }],
      action: null,
    };
  }

  // ---------- Quiz ----------
  if (/cevabi goster/.test(norm)) {
    const idMatch = userQuestion.match(/(\d+)/);
    const allQ = await db.select().from(questions);
    const q = idMatch ? allQ.find((x) => x.id === parseInt(idMatch[1])) : allQ[allQ.length - 1];
    if (q) {
      return {
        answer: `**Cevap — ${q.topicRef}** (${q.legalBasis})\n${q.detailedAnswer}`,
        exampleBox: q.exampleScenario,
        citations: [{ type: "soru", ref: String(q.id), title: `Soru: ${q.topicRef}` }],
        intent: "quiz-cevap",
        confidence: "Yüksek",
        followUps: [
          { label: "🎯 Yeni soru sor", prompt: "Bana bir quiz sorusu sor" },
          { label: "Kendim bildim say", prompt: "Bana bir quiz sorusu sor" },
        ],
        action: null,
      };
    }
  }
  if (/quiz|sinav|test et|bilgi yarismasi|soru sor/.test(norm)) {
    const allQ = await db.select().from(questions);
    const q = allQ[Math.floor(Math.random() * allQ.length)];
    return {
      answer: `🎯 **Günün Quiz Sorusu** (${q.topicRef} • ${q.difficulty})\n\n${q.question}\n\nCevabınızı düşünün; hazır olduğunuzda **"Cevabı göster"** butonuna basın.`,
      exampleBox: "İpucu: Yanıt, " + q.legalBasis + " kapsamında gizli. Önce kendiniz cevaplayın!",
      citations: [],
      intent: "quiz",
      confidence: "Yüksek",
      followUps: [
        { label: "✅ Cevabı göster", prompt: `Cevabı göster ${q.id}` },
        { label: "🔄 Başka soru", prompt: "Bana bir quiz sorusu sor" },
      ],
      action: null,
    };
  }

  // ---------- Erişim (kanunlar, teknikler, metotlar, sorular) ----------
  const [allLaws, allTopics, allQuestions] = await Promise.all([
    db.select().from(laws),
    db.select().from(hrTopics),
    db.select().from(questions),
  ]);
  const tokens = expandTokens(extractTokens(effectiveQuery));

  const scoredLaws = allLaws
    .map((law) => {
      const articleText = law.keyArticles.map((a) => `${a.articleNo} ${a.title} ${a.content} ${a.hrImpact}`).join(" ");
      const full = `${law.lawNumber} ${law.title} ${law.summary} ${articleText} ${law.practicalExample}`;
      return { law, score: scoreMatch(tokens, full, [law.lawNumber, ...law.keywords]) + fuzzyScore(tokens, full) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredTopics = allTopics
    .map((topic) => {
      const stepsText = topic.stepsOrComponents.map((s) => `${s.title} ${s.description}`).join(" ");
      const full = `${topic.title} ${topic.subtitle} ${topic.summary} ${stepsText} ${topic.practicalExample}`;
      return { topic, score: scoreMatch(tokens, full, [topic.title, ...topic.keywords]) + fuzzyScore(tokens, full) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredQuestions = allQuestions
    .map((q) => {
      const full = `${q.topicRef} ${q.question} ${q.shortAnswer} ${q.detailedAnswer} ${q.legalBasis} ${q.exampleScenario}`;
      // Soru metnindeki eşleşmeler daha değerli (kullanıcı niyetine en yakın soru öne çıksın)
      const questionText = scoreMatch(tokens, `${q.question} ${q.topicRef}`) * 2;
      return { q, score: scoreMatch(tokens, full, [q.topicRef]) + fuzzyScore(tokens, full) + questionText };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // ---- "Bunu mu demek istediniz?" — kesin eşleşme yoksa en yakın konuları öner ----
  const rawBest = Math.max(scoredLaws[0]?.score || 0, scoredTopics[0]?.score || 0, scoredQuestions[0]?.score || 0);
  if (rawBest < 10) {
    type Suggestion = { label: string; prompt: string; score: number };
    const suggestions: Suggestion[] = [
      ...scoredLaws.slice(0, 3).map((x) => ({ label: `⚖️ ${x.law.title}`, prompt: `${x.law.title} hakkında bilgi ver, örnekle anlat`, score: x.score })),
      ...scoredTopics.slice(0, 3).map((x) => ({ label: `📘 ${x.topic.title}`, prompt: `${x.topic.title} nedir, örnekle anlatır mısın?`, score: x.score })),
      ...scoredQuestions.slice(0, 3).map((x) => ({ label: `❓ ${x.q.question.slice(0, 62)}...`, prompt: x.q.question, score: x.score })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const popular: Suggestion[] = [
      { label: "⚖️ 4857 İhbar & Kıdem", prompt: "4857 ihbar süreleri ve kıdem tazminatı şartları nelerdir?", score: 0 },
      { label: "🧮 Kıdem hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?", score: 0 },
      { label: "📋 SGK kodları", prompt: "SGK 04 çıkış kodu ne demek?", score: 0 },
      { label: "🎯 Quiz başlat", prompt: "Bana bir quiz sorusu sor", score: 0 },
    ];
    const finalSuggestions = suggestions.length >= 2 ? suggestions : [...suggestions, ...popular].slice(0, 4);

    return {
      answer: `"${userQuestion}" için bire bir eşleşen kayıt bulamadım ama sorun değil — yazdıklarınıza en yakın konuları çıkardım.\n\n**Bunu mu demek istediniz?** Aşağıdaki önerilerden birine dokunun; isterseniz sorunuzu biraz farklı yazın (yazım hatası yapsanız da anlarım 😊).`,
      exampleBox:
        "Şöyle de yazabilirsiniz: 'kidem tazminati' (hatalı da olsa anlarım), 'işten çıkarıldım haklarım ne', 'maaşımın neti ne kadar', 'SGK 03 kodu ne demek'.",
      citations: [],
      intent: "oneri",
      confidence: "Düşük",
      followUps: finalSuggestions.map((s) => ({ label: s.label, prompt: s.prompt })),
      action: null,
    };
  }

  const topLaws = scoredLaws.slice(0, 2).map((x) => x.law);
  const topTopics = scoredTopics.slice(0, 2).map((x) => x.topic);
  // Soru yalnızca güçlü eşleşmeyse veya en ilgili kanunla aynı yasal dayanaktaysa kullanılır (yanlış kanun cevaplarını önler)
  const bestQ = scoredQuestions[0];
  const topQ =
    bestQ && bestQ.score >= 6 && (bestQ.score >= 20 || !topLaws[0] || bestQ.q.legalBasis.includes(topLaws[0].lawNumber))
      ? bestQ.q
      : null;
  const bestScore = Math.max(scoredLaws[0]?.score || 0, scoredTopics[0]?.score || 0, scoredQuestions[0]?.score || 0);
  const confidence: RobotReply["confidence"] = bestScore >= 18 ? "Yüksek" : bestScore >= 8 ? "Orta" : "Düşük";

  const citations: ChatCitation[] = [];
  for (const law of topLaws) citations.push({ type: "kanun", ref: law.slug, title: `${law.lawNumber} s.K.` });
  for (const topic of topTopics) {
    citations.push({ type: topic.type === "technique" ? "teknik" : "metot", ref: topic.slug, title: topic.title });
  }
  if (topQ) citations.push({ type: "soru", ref: String(topQ.id), title: `Soru: ${topQ.topicRef}` });

  // Opsiyonel: OpenAI ile zenginleştirilmiş yanıt (OPENAI_API_KEY tanımlıysa)
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && (topLaws.length > 0 || topTopics.length > 0 || topQ)) {
    try {
      const contextBlocks: string[] = [];
      for (const l of topLaws) {
        contextBlocks.push(
          `KANUN: ${l.title}\nÖzet: ${l.summary}\nMaddeler: ${l.keyArticles
            .map((a) => `${a.articleNo} (${a.title}): ${a.content} | İK Etkisi: ${a.hrImpact}`)
            .join("\n")}\nÖrnek: ${l.practicalExample}`
        );
      }
      for (const t of topTopics) {
        contextBlocks.push(
          `${t.type === "technique" ? "İK TEKNİĞİ" : "İK METODU"}: ${t.title}\nÖzet: ${t.summary}\nBileşenler: ${t.stepsOrComponents
            .map((s) => `${s.title}: ${s.description}`)
            .join(" | ")}\nÖrnek: ${t.practicalExample}`
        );
      }
      if (topQ) {
        contextBlocks.push(
          `İLGİLİ SORU-CEVAP: ${topQ.question}\nCevap: ${topQ.detailedAnswer}\nDayanak: ${topQ.legalBasis}\nÖrnek: ${topQ.exampleScenario}`
        );
      }

      const modeInstruction = {
        hizli: "Çok kısa ve net yanıt ver (en fazla 3-4 cümle), madde numarasını mutlaka belirt.",
        detayli: "Detaylı, madde madde ve anlaşılır yanıt ver.",
        adim: "Yanıtı numaralı adım adım uygulama rehberi olarak ver (1., 2., 3. ...).",
        ornek: "Önce kısa kuralı söyle, sonra cevabın çoğunu gerçekçi bir vaka örneğine ayır.",
        belge: "Yanıt yerine doldurulabilir resmi bir yazı/tutanak taslağı üret.",
      }[mode];

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Sen Cihan Ahtik tarafından geliştirilen İK ve Türk İş Hukuku Mevzuat Asistanısın. Sadece verilen kaynaklara dayanarak Türkçe yanıt ver. ${modeInstruction} Yanıtını şu JSON formatında döndür: {"answer": "Yanıt (örnek hariç)", "exampleBox": "Somut örnek senaryo"}`,
            },
            ...history.slice(-6).map((h) => ({
              role: h.role === "user" ? "user" : "assistant",
              content: h.content.slice(0, 800),
            })),
            {
              role: "user",
              content: `Soru: ${userQuestion}\n\nVeritabanı Kaynakları:\n${contextBlocks.join("\n\n---\n\n")}`,
            },
          ],
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        const raw = json?.choices?.[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.answer && parsed.exampleBox) {
            return {
              answer: parsed.answer,
              exampleBox: parsed.exampleBox,
              citations,
              intent: "mevzuat-ai",
              confidence,
              followUps: buildFollowUps(topLaws[0], topTopics[0]),
              action: null,
            };
          }
        }
      }
    } catch {
      // Veritabanı tabanlı yanıta geri dön
    }
  }

  if (topLaws.length === 0 && topTopics.length === 0 && !topQ) {
    return {
      answer:
        "Sorunuzu 12 kanun ve İK tekniği/metodu içinde net eşleştiremedim. Size daha iyi yardımcı olabilmek için şunları yapabilirsiniz: **(1)** Kanun numarası yazın (örn. 4857, 5510), **(2)** Hesap yaptırın (örn. '4 yıl brüt 70 bin kıdem hesapla'), **(3)** SGK kodu sorun (örn. 'SGK 03 kodu'), **(4)** Belge isteyin (örn. 'savunma yazısı taslağı hazırla').",
      exampleBox:
        "Örnek: 'KVKK'da açık rıza ne zaman gerekir?' • 'OKR ile KPI farkı nedir?' • 'İbraname ne zaman geçerlidir?'",
      citations: [],
      intent: "eslesme-yok",
      confidence: "Düşük",
      followUps: [
        { label: "🎯 Quiz başlat", prompt: "Bana bir quiz sorusu sor" },
        { label: "🧮 Kıdem hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?" },
        { label: "4857'yi anlat", prompt: "4857 Sayılı İş Kanunu'nun İK için en kritik maddelerini anlat" },
      ],
      action: null,
    };
  }

  const answerParts: string[] = [];
  let chosenExample = "";

  if (mode === "hizli") {
    if (topQ) {
      answerParts.push(`**Kısa Yanıt:** ${topQ.shortAnswer}\n\n📚 Dayanak: ${topQ.legalBasis}`);
      chosenExample = topQ.exampleScenario;
    } else if (topLaws[0]) {
      const art = topLaws[0].keyArticles[0];
      answerParts.push(`**Kısa Yanıt (${topLaws[0].lawNumber} ${art?.articleNo ?? ""}):** ${art?.hrImpact ?? topLaws[0].summary}`);
      chosenExample = topLaws[0].practicalExample;
    } else if (topTopics[0]) {
      answerParts.push(`**Kısa Yanıt:** ${topTopics[0].summary}`);
      chosenExample = topTopics[0].practicalExample;
    }
  } else if (mode === "adim" && topTopics[0]) {
    const t = topTopics[0];
    answerParts.push(
      `**${t.title} — Adım Adım Uygulama Rehberi**\n${t.stepsOrComponents.map((s, i) => `${i + 1}. **${s.title}:** ${s.description}`).join("\n")}`
    );
    chosenExample = t.practicalExample;
    if (topLaws[0]) answerParts.push(`⚖️ *Yasal Çerçeve:* ${topLaws[0].title} — ${topLaws[0].dailyTips[0] || ""}`);
  } else if (mode === "belge") {
    const anahtar = /savunma/.test(norm) ? "savunma" : /tutanak/.test(norm) ? "tutanak" : /izin/.test(norm) ? "izin" : "savunma";
    const sablon = BELGE_SABLONLARI[anahtar];
    answerParts.push(`**${sablon.baslik}** taslağınız hazır. Şablonlar sekmesinde Word veya Excel olarak indirebilirsiniz.`);
    chosenExample = sablon.metin;
    if (topLaws[0]) answerParts.push(`⚖️ Dayanak: ${topLaws[0].title}`);
  } else {
    if (topQ) {
      answerParts.push(`**${topQ.topicRef} Kapsamında Değerlendirme (${topQ.legalBasis}):**\n${topQ.detailedAnswer}`);
      chosenExample = topQ.exampleScenario;
    }
    if (topLaws.length > 0) {
      const primaryLaw = topLaws[0];
      const matchedArticles = primaryLaw.keyArticles
        .map((art) => ({ art, score: scoreMatch(tokens, `${art.articleNo} ${art.title} ${art.content} ${art.hrImpact}`) }))
        .sort((a, b) => b.score - a.score);
      const bestArt = matchedArticles[0]?.art || primaryLaw.keyArticles[0];
      if (bestArt) {
        if (!topQ || !topQ.legalBasis.includes(primaryLaw.lawNumber)) {
          answerParts.push(
            `**${primaryLaw.title} (${bestArt.articleNo} - ${bestArt.title}):**\n${bestArt.content}\n\n*İK Uygulama Etkisi:* ${bestArt.hrImpact}`
          );
        } else {
          answerParts.push(`**İlgili Kanun Hükmü (${primaryLaw.lawNumber} s.K. ${bestArt.articleNo}):** ${bestArt.hrImpact}`);
        }
      } else {
        answerParts.push(`**${primaryLaw.title}:** ${primaryLaw.summary}`);
      }
      if (!chosenExample) chosenExample = primaryLaw.practicalExample;
      if (topLaws.length > 1) {
        answerParts.push(`**Bağlantılı Mevzuat (${topLaws[1].title}):** ${topLaws[1].dailyTips[0] || topLaws[1].summary}`);
      }
    }
    if (topTopics.length > 0) {
      const t = topTopics[0];
      const label = t.type === "technique" ? "İK Tekniği" : "İK Metodu";
      answerParts.push(
        `**${label} – ${t.title}:**\n${t.summary}\n${t.stepsOrComponents.slice(0, 2).map((s) => `• **${s.title}:** ${s.description}`).join("\n")}`
      );
      if (!chosenExample) chosenExample = t.practicalExample;
    }
    if (mode === "ornek" && topTopics[0]) {
      answerParts.push(`**Uygulama Vurgusu:** ${topTopics[0].practicalExample}`);
    }
  }

  return {
    answer: answerParts.join("\n\n"),
    exampleBox: chosenExample,
    citations,
    intent: topLaws.length ? "mevzuat" : "ik-teknik",
    confidence,
    followUps: buildFollowUps(topLaws[0], topTopics[0]),
    action: null,
  };
}

function buildFollowUps(law?: { title: string; lawNumber: string }, topic?: { title: string }): ChatFollowUp[] {
  const list: ChatFollowUp[] = [];
  if (law) list.push({ label: `📘 ${law.lawNumber} örnek senaryo`, prompt: `${law.title} ile ilgili somut bir örnek senaryo anlatır mısın?` });
  if (topic) list.push({ label: `🪜 ${topic.title} adım adım`, prompt: `${topic.title} konusunu adım adım uygulama rehberi olarak anlat` });
  list.push({ label: "🎯 Bu konuda quiz sor", prompt: "Bana bir quiz sorusu sor" });
  list.push({ label: "📝 Belge taslağı hazırla", prompt: "Bu konuyla ilgili belge taslağı hazırla: savunma istemi yazısı" });
  return list.slice(0, 4);
}
