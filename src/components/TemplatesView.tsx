"use client";

import React, { useMemo, useState } from "react";
import { FileText, Copy, Check, Download, AlertTriangle, Bot, Printer, FileSpreadsheet, FileDown } from "lucide-react";
import { TEMPLATES } from "@/data/templates";
import { downloadDocumentSafe, downloadText, type DocBlock, type DocModel } from "@/lib/documents";

interface TemplatesViewProps {
  onAskRobot: (prompt: string) => void;
}

export function TemplatesView({ onAskRobot }: TemplatesViewProps) {
  const [activeId, setActiveId] = useState(TEMPLATES[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const active = TEMPLATES.find((t) => t.id === activeId) || TEMPLATES[0];

  const filled = useMemo(() => {
    let out = active.body;
    for (const f of active.fields) {
      const v = values[`${active.id}:${f.key}`] || f.placeholder;
      out = out.split(`{{${f.key}}}`).join(v);
    }
    return out;
  }, [active, values]);

  const buildModel = (format: "docx" | "xlsx" | "pdf"): DocModel => {
    const blocks: DocBlock[] = [];
    if (active.warning) blocks.push({ type: "p", italic: true, text: `Uyarı: ${active.warning}` });
    if (format === "xlsx") {
      blocks.push({
        type: "table",
        sheetName: "Alanlar",
        headers: ["Alan", "Değer"],
        rows: active.fields.map((f) => [f.label, values[`${active.id}:${f.key}`] || f.placeholder]),
      });
    }
    for (const line of filled.split("\n")) blocks.push({ type: "p", text: line });
    return {
      title: active.title,
      subtitle: `${active.lawRef} • Cihan Ahtik İK Akademisi`,
      fileName: active.title,
      blocks,
    };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filled);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleTxt = () => downloadText(`${active.title.replace(/\s+/g, "-")}.txt`, filled, "text/plain;charset=utf-8");

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const safe = filled.replace(/</g, "&lt;");
    w.document.write(
      `<html><head><title>${active.title}</title><style>body{font-family:Georgia,serif;padding:40px;line-height:1.7;white-space:pre-wrap;font-size:14px}</style></head><body>${safe}</body></html>`
    );
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-indigo-600" /> Şablonlar &amp; Resmî Formlar
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Kanun maddelerine dayalı hazır belgeler. Bilgileri doldurun; belge anında oluşur. Word, Excel, kopyala, yazdır veya metin olarak indirin.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full rounded-2xl border p-3.5 text-left transition ${
                active.id === t.id ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold text-slate-900">{t.title}</p>
              <p className="mt-0.5 text-[11px] font-medium text-indigo-700">{t.lawRef}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{t.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">{active.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{active.description}</p>
            {active.warning && (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {active.warning}
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {active.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-600">{f.label}</span>
                  <input
                    value={values[`${active.id}:${f.key}`] || ""}
                    onChange={(e) => setValues((p) => ({ ...p, [`${active.id}:${f.key}`]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadDocumentSafe("docx", buildModel("docx"))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <FileText className="h-4 w-4" /> Word (.docx)
              </button>
              <button
                type="button"
                onClick={() => downloadDocumentSafe("xlsx", buildModel("xlsx"))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => downloadDocumentSafe("pdf", buildModel("pdf"))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                <FileDown className="h-4 w-4" /> PDF
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Kopyalandı!" : "Kopyala"}
              </button>
              <button
                type="button"
                onClick={handleTxt}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> .txt
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" /> Yazdır
              </button>
              <button
                type="button"
                onClick={() => onAskRobot(`${active.title} hakkında kanuni dayanağı ve dikkat edilmesi gerekenleri anlat`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
              >
                <Bot className="h-4 w-4" /> Robota Sor
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Belge önizleme</p>
            <pre className="mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap font-serif text-[13px] leading-relaxed text-slate-100">{filled}</pre>
          </section>
        </div>
      </div>
    </div>
  );
}
