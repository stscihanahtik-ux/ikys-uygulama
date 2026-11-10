"use client";

import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, FileDown, Hash, Scale, BookOpen, HelpCircle, CalendarDays, LibraryBig, Info } from "lucide-react";
import type { LawItem, HrTopicItem, QuestionItem, SgkCodeItem, DailyInsightItem } from "@/types/hr";
import { lawDoc, allLawsDoc, topicsDoc, questionsDoc, sgkDoc, insightsDoc } from "@/lib/export-models";
import { downloadDocumentSafe, type DocBlock, type DocFormat, type DocModel } from "@/lib/documents";

interface DownloadCenterProps {
  laws: LawItem[];
  techniques: HrTopicItem[];
  methods: HrTopicItem[];
  questions: QuestionItem[];
  sgkCodes: SgkCodeItem[];
  insights: DailyInsightItem[];
  onGoTab: (tab: "laws" | "calculators" | "templates" | "sgk" | "quiz") => void;
}

interface GroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Group({ title, icon, children }: GroupProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </h3>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, sub, onWord, onExcel, onPdf, onOther, otherLabel }: {
  label: string;
  sub?: string;
  onWord?: () => void;
  onExcel?: () => void;
  onPdf?: () => void;
  onOther?: () => void;
  otherLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const run = (fn?: () => void) => {
    if (!fn) return;
    setBusy(true);
    fn();
    setTimeout(() => setBusy(false), 900);
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {onWord && (
          <button type="button" disabled={busy} onClick={() => run(onWord)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            <FileText className="h-3.5 w-3.5" /> Word
          </button>
        )}
        {onExcel && (
          <button type="button" disabled={busy} onClick={() => run(onExcel)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
        )}
        {onPdf && (
          <button type="button" disabled={busy} onClick={() => run(onPdf)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50">
            <FileDown className="h-3.5 w-3.5" /> PDF
          </button>
        )}
        {onOther && (
          <button type="button" disabled={busy} onClick={() => run(onOther)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700 disabled:opacity-50">
            <Download className="h-3.5 w-3.5" /> {otherLabel ?? "İndir"}
          </button>
        )}
      </div>
    </div>
  );
}

export function DownloadCenter({ laws, techniques, methods, questions, sgkCodes, insights, onGoTab }: DownloadCenterProps) {
  const [selectedLaw, setSelectedLaw] = useState(laws[0]?.slug ?? "");
  const law = laws.find((l) => l.slug === selectedLaw) ?? laws[0];

  const dl = (format: DocFormat, model: DocModel) => void downloadDocumentSafe(format, model);
  const pdf = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  /** SGK + sorular + teknikler + metotlar + günlük bilgiler tek belgede */
  const allContentDoc = (): DocModel => {
    const sections: { heading: string; model: DocModel }[] = [
      { heading: "1. SGK İşten Ayrılış (Çıkış) Kodları", model: sgkDoc(sgkCodes, "docx") },
      { heading: "2. İK & Mevzuat Soru Bankası", model: questionsDoc(questions, "docx") },
      { heading: "3. İK Teknikleri", model: topicsDoc(techniques, "docx", "İK Teknikleri") },
      { heading: "4. İK Metotları", model: topicsDoc(methods, "docx", "İK Metotları") },
      { heading: "5. Günlük Bilgi Akışı", model: insightsDoc(insights) },
    ];
    const blocks: DocBlock[] = [];
    for (const s of sections) {
      blocks.push({ type: "h", text: s.heading });
      blocks.push(...s.model.blocks);
    }
    return {
      title: "Tüm İK İçerikleri — SGK, Sorular, Teknikler, Metotlar ve Günlük Bilgiler",
      subtitle: `${sgkCodes.length} SGK kodu • ${questions.length} soru • ${techniques.length} teknik • ${methods.length} metot • ${insights.length} günlük bilgi • Cihan Ahtik İK Akademisi`,
      fileName: "tum-ik-icerikleri",
      blocks,
    };
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Download className="h-5 w-5 text-indigo-300" /> İndirme Merkezi
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Kanunları, SGK kodlarını, soruları, İK tekniklerini ve günlük bilgileri <b>Word (.docx)</b>, <b>Excel (.xlsx)</b> veya <b>PDF</b> olarak indirin.
          Tüm İK içeriklerini tek bir PDF dosyasında da alabilirsiniz. İndirilen belgeler Cihan Ahtik İK Akademisi imzasını taşır.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Kanunlar" icon={<Scale className="h-4 w-4 text-indigo-600" />}>
          <Row
            label="Tüm kanunlar (12)"
            sub="Tüm kanun özetleri, kritik maddeler ve İK etkileri"
            onWord={() => dl("docx", allLawsDoc(laws, "docx"))}
            onExcel={() => dl("xlsx", allLawsDoc(laws, "xlsx"))}
            onPdf={() => pdf("/api/laws/pdf?all=1")}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <label className="mb-1 block text-[11px] font-bold text-slate-600">Tek kanun seçin</label>
            <select
              value={selectedLaw}
              onChange={(e) => setSelectedLaw(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              {laws.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.lawNumber} — {l.title}
                </option>
              ))}
            </select>
            {law && (
              <div className="mt-3">
                <Row
                  label={`${law.lawNumber} — ${law.title}`}
                  sub="Madde kartları, örnek senaryo ve günlük ipuçları"
                  onWord={() => dl("docx", lawDoc(law, "docx"))}
                  onExcel={() => dl("xlsx", lawDoc(law, "xlsx"))}
                  onPdf={() => pdf(`/api/laws/pdf?slug=${law.slug}`)}
                />
              </div>
            )}
          </div>
        </Group>

        <Group title="SGK, sorular ve İK içerikleri" icon={<Hash className="h-4 w-4 text-rose-600" />}>
          <Row
            label="SGK çıkış kodları"
            sub={`${sgkCodes.length} kod, kıdem ve işsizlik durumu • Word / Excel / PDF`}
            onWord={() => dl("docx", sgkDoc(sgkCodes, "docx"))}
            onExcel={() => dl("xlsx", sgkDoc(sgkCodes, "xlsx"))}
            onPdf={() => dl("pdf", sgkDoc(sgkCodes, "docx"))}
          />
          <Row
            label="Soru bankası"
            sub={`${questions.length} soru, cevap ve örnek senaryo • Word / Excel / PDF`}
            onWord={() => dl("docx", questionsDoc(questions, "docx"))}
            onExcel={() => dl("xlsx", questionsDoc(questions, "xlsx"))}
            onPdf={() => dl("pdf", questionsDoc(questions, "docx"))}
          />
          <Row
            label="İK teknikleri"
            sub={`${techniques.length} süreç ve adım • Word / Excel / PDF`}
            onWord={() => dl("docx", topicsDoc(techniques, "docx", "İK Teknikleri"))}
            onExcel={() => dl("xlsx", topicsDoc(techniques, "xlsx", "İK Teknikleri"))}
            onPdf={() => dl("pdf", topicsDoc(techniques, "docx", "İK Teknikleri"))}
          />
          <Row
            label="İK metotları"
            sub={`${methods.length} model ve bileşen • Word / Excel / PDF`}
            onWord={() => dl("docx", topicsDoc(methods, "docx", "İK Metotları"))}
            onExcel={() => dl("xlsx", topicsDoc(methods, "xlsx", "İK Metotları"))}
            onPdf={() => dl("pdf", topicsDoc(methods, "docx", "İK Metotları"))}
          />
          <Row
            label="Günlük bilgi akışı"
            sub={`${insights.length} günlük bilgi • Word / Excel / PDF`}
            onWord={() => dl("docx", insightsDoc(insights))}
            onExcel={() => dl("xlsx", insightsDoc(insights))}
            onPdf={() => dl("pdf", insightsDoc(insights))}
          />
          <Row
            label="Tüm İK içerikleri (tek PDF)"
            sub="SGK kodları + sorular + teknikler + metotlar + günlük bilgiler"
            onPdf={() => dl("pdf", allContentDoc())}
            onWord={() => dl("docx", allContentDoc())}
            onExcel={() => dl("xlsx", allContentDoc())}
          />
        </Group>

        <Group title="Diğer indirilebilecekler" icon={<LibraryBig className="h-4 w-4 text-emerald-600" />}>
          <Row label="Hesaplayıcı özeti ve yasal süre takvimi" sub="Hesaplayıcılar sekmesinde Word/Excel/PDF/.ics" onOther={() => onGoTab("calculators")} otherLabel="Bölüme git" />
          <Row label="Şablonlar ve resmî formlar" sub="Savunma yazısı, tutanak, izin formu; Word/Excel/PDF" onOther={() => onGoTab("templates")} otherLabel="Bölüme git" />
          <Row label="Test sonuçları" sub="Test sekmesinde Word/Excel/PDF olarak indirilir" onOther={() => onGoTab("quiz")} otherLabel="Bölüme git" />
          <Row label="SGK kodları sayfası" sub="Arama, filtreleme ve doğrudan indirme" onOther={() => onGoTab("sgk")} otherLabel="Bölüme git" />
        </Group>

        <Group title="Bilgi" icon={<Info className="h-4 w-4 text-sky-600" />}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-bold text-slate-800">Dosya biçimleri</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <b>Word (.docx):</b> Başlık, üst/alt bilgi, madde kartları ve tablolar içeren yazdırılabilir belge.
              </li>
              <li>
                <b>Excel (.xlsx):</b> Filtreli, dondurulmuş başlık satırlı ve otomatik sütun genişlikli çalışma sayfaları; Türkçe karakterler
                sorunsuz açılır.
              </li>
              <li>
                <b>PDF:</b> Kanunlar, SGK çıkış kodları, soru bankası, İK teknikleri, metotlar, günlük bilgiler ve tüm İK içeriklerinin tek dosyada
                birleşik hâli. Türkçe karakter destekli, sayfa numaralı ve imzalıdır.
              </li>
              <li>
                <b>.ics:</b> Google Takvim, Outlook ve iOS için yasal süre hatırlatmaları.
              </li>
            </ul>
            <p className="mt-3">Tüm belgeler bilgilendirme amaçlıdır; resmî işlemlerde Resmî Gazete ve mevzuat.gov.tr esas alınmalıdır.</p>
          </div>
        </Group>
      </div>
    </div>
  );
}
