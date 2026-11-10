import type { DocModel } from "@/lib/documents";
import type { LawItem, HrTopicItem, QuestionItem, SgkCodeItem, DailyInsightItem } from "@/types/hr";

const FLAG: Record<string, string> = { evet: "Hak doğar", hayir: "Hak doğmaz", duruma_bagli: "Duruma bağlı" };

/** Tek kanun: Word için okunabilir, Excel için tablo ağırlıklı */
export function lawDoc(law: LawItem, format: "docx" | "xlsx"): DocModel {
  const blocks: DocModel["blocks"] = [
    { type: "h", text: "Kanun Özeti" },
    { type: "p", text: law.summary },
    { type: "h", text: "Kritik Kanun Maddeleri ve İK Etkisi" },
    {
      type: "table",
      sheetName: "Kanun Maddeleri",
      headers: ["Madde", "Başlık", "İçerik", "İK Uygulama Etkisi"],
      rows: law.keyArticles.map((a) => [a.articleNo, a.title, a.content, a.hrImpact]),
    },
    { type: "h", text: "Örnek Senaryo" },
    { type: "p", text: law.practicalExample },
    { type: "h", text: "Günlük Mevzuat İpuçları" },
    { type: "ul", items: law.dailyTips },
    { type: "h", text: "Anahtar Kelimeler" },
    { type: "p", text: law.keywords.join(", ") },
  ];

  if (format === "xlsx") {
    blocks.push({
      type: "table",
      sheetName: "Kanun Bilgisi",
      headers: ["Kanun No", "Kanun Adı", "Kategori", "Özet", "Örnek Senaryo", "İpuçları", "Anahtar Kelimeler"],
      rows: [[law.lawNumber, law.title, law.category, law.summary, law.practicalExample, law.dailyTips.join("\n"), law.keywords.join(", ")]],
    });
  }
  return {
    title: law.title,
    subtitle: `${law.lawNumber} sayılı kanun • ${law.category} • Cihan Ahtik İK Akademisi`,
    fileName: `${law.lawNumber}-${law.slug}`,
    blocks,
  };
}

/** 12 kanunun tamamı */
export function allLawsDoc(laws: LawItem[], format: "docx" | "xlsx"): DocModel {
  const blocks: DocModel["blocks"] = [
    { type: "p", text: "Bu belge 12 temel Türk iş ve sosyal güvenlik kanununun İK uygulama rehberini içerir. Bilgilendirme amaçlıdır; resmî metinler için mevzuat.gov.tr esas alınmalıdır." },
    {
      type: "table",
      sheetName: "Kanunlar",
      headers: ["Kanun No", "Kanun Adı", "Kategori", "Özet", "Örnek Senaryo", "İpuçları", "Anahtar Kelimeler"],
      rows: laws.map((l) => [
        l.lawNumber,
        l.title,
        l.category,
        l.summary,
        l.practicalExample,
        l.dailyTips.join("\n"),
        l.keywords.join(", "),
      ]),
    },
  ];

  blocks.push({
    type: "table",
    sheetName: "Tüm Maddeler",
    headers: ["Kanun No", "Madde", "Başlık", "İçerik", "İK Uygulama Etkisi"],
    rows: laws.flatMap((l) => l.keyArticles.map((a) => [l.lawNumber, a.articleNo, a.title, a.content, a.hrImpact])),
  });

  if (format === "docx") {
    for (const l of laws) {
      blocks.push({ type: "h", text: `${l.lawNumber} — ${l.title}` });
      blocks.push({ type: "p", text: l.summary });
      blocks.push({ type: "p", text: `Örnek: ${l.practicalExample}` });
    }
  }
  return {
    title: "12 Temel Kanun — İK Mevzuat Rehberi",
    subtitle: `${laws.length} kanun • ${laws.reduce((s, l) => s + l.keyArticles.length, 0)} kritik madde • Cihan Ahtik`,
    fileName: "tum-kanunlar-mevzuat-rehberi",
    blocks,
  };
}

export function topicsDoc(topics: HrTopicItem[], format: "docx" | "xlsx", title = "İK Teknikleri ve Metotları"): DocModel {
  const blocks: DocModel["blocks"] = [
    {
      type: "table",
      sheetName: "Teknik ve Metotlar",
      headers: ["Tür", "Başlık", "Alt Başlık", "Özet", "Adımlar / Bileşenler", "İlişkili Kanunlar", "Örnek", "İpuçları"],
      rows: topics.map((t) => [
        t.type === "method" ? "Metot" : "İK Tekniği",
        t.title,
        t.subtitle,
        t.summary,
        t.stepsOrComponents.map((s) => `${s.title}: ${s.description}`).join("\n"),
        t.relatedLaws.join(", "),
        t.practicalExample,
        t.dailyTips.join("\n"),
      ]),
    },
  ];
  if (format === "docx") {
    for (const t of topics) {
      blocks.push({ type: "h", text: t.title });
      blocks.push({ type: "p", text: t.summary });
      blocks.push({ type: "ul", items: t.stepsOrComponents.map((s) => `${s.title}: ${s.description}`) });
      blocks.push({ type: "p", text: `Örnek: ${t.practicalExample}` });
    }
  }
  return { title, subtitle: `${topics.length} kayıt • Cihan Ahtik İK Akademisi`, fileName: title, blocks };
}

export function questionsDoc(questions: QuestionItem[], format: "docx" | "xlsx"): DocModel {
  const blocks: DocModel["blocks"] = [
    {
      type: "table",
      sheetName: "Sorular",
      headers: ["Kategori", "Konu", "Soru", "Kısa Cevap", "Detaylı Cevap", "Yasal Dayanak", "Örnek Senaryo", "Zorluk"],
      rows: questions.map((q) => [q.category, q.topicRef, q.question, q.shortAnswer, q.detailedAnswer, q.legalBasis, q.exampleScenario, q.difficulty]),
    },
  ];
  if (format === "docx") {
    for (const q of questions) {
      blocks.push({ type: "h", text: q.question });
      blocks.push({ type: "p", text: q.detailedAnswer });
      blocks.push({ type: "p", italic: true, text: `Dayanak: ${q.legalBasis}\nÖrnek: ${q.exampleScenario}` });
    }
  }
  return { title: "İK & Mevzuat Soru Bankası", subtitle: `${questions.length} soru • Cihan Ahtik`, fileName: "soru-bankasi", blocks };
}

export function sgkDoc(codes: SgkCodeItem[], format: "docx" | "xlsx"): DocModel {
  return {
    title: "SGK İşten Ayrılış (Çıkış) Kodları",
    subtitle: `${codes.length} kod • SGK e-Bildirge kılavuzunu kontrol edin • Cihan Ahtik`,
    fileName: "sgk-cikis-kodlari",
    blocks: [
      {
        type: "table",
        sheetName: "SGK Kodları",
        headers:
          format === "xlsx"
            ? ["Kod", "Çıkış Nedeni", "Grup", "Kıdem Tazminatı", "İşsizlik Ödeneği", "Yasal Dayanak", "Açıklama", "Uyarı / Not"]
            : ["Kod", "Çıkış Nedeni", "Kıdem", "İşsizlik", "Dayanak"],
        rows: codes.map((c) =>
          format === "xlsx"
            ? [c.code, c.title, c.category, FLAG[c.severance] ?? "—", FLAG[c.unemployment] ?? "—", c.lawRef, c.description, c.notes]
            : [c.code, c.title, FLAG[c.severance] ?? "—", FLAG[c.unemployment] ?? "—", c.lawRef]
        ),
      },
    ],
  };
}

export function insightsDoc(insights: DailyInsightItem[]): DocModel {
  return {
    title: "Günlük İK Bilgi Akışı",
    subtitle: `${insights.length} günlük bilgi • Cihan Ahtik İK Akademisi`,
    fileName: "gunluk-bilgiler",
    blocks: [
      {
        type: "table",
        sheetName: "Günlük Bilgiler",
        headers: ["Tarih", "Tür", "Kaynak", "Başlık", "İçerik", "Örnek Vaka", "Günün Aksiyonu", "Okundu", "Kaydedildi"],
        rows: insights.map((i) => [
          i.insightDate,
          i.sourceType,
          i.sourceTitle,
          i.headline,
          i.content,
          i.exampleCase,
          i.actionItem,
          i.isRead ? "Evet" : "Hayır",
          i.isBookmarked ? "Evet" : "Hayır",
        ]),
      },
    ],
  };
}
