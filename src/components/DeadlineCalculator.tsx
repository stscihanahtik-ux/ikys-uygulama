"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, FileSpreadsheet, FileText, FileDown, Info } from "lucide-react";
import { DEADLINE_RULES, buildIcs, computeDeadline, describeAmount } from "@/lib/deadlines";
import { formatTr, formatTrLong, todayIso, weekdayTr } from "@/lib/business-days";
import { downloadDocumentSafe, downloadText, type DocModel } from "@/lib/documents";

const CATEGORY_CLS: Record<string, string> = {
  SGK: "bg-sky-100 text-sky-800",
  "İş Hukuku": "bg-indigo-100 text-indigo-800",
  İSG: "bg-emerald-100 text-emerald-800",
  KVKK: "bg-violet-100 text-violet-800",
  İcra: "bg-amber-100 text-amber-800",
  Borçlar: "bg-rose-100 text-rose-800",
  Zamanaşımı: "bg-slate-200 text-slate-800",
};

export function DeadlineCalculator() {
  const [start, setStart] = useState(todayIso());
  const [picked, setPicked] = useState<Set<string>>(() => new Set(DEADLINE_RULES.map((r) => r.id)));
  const [cat, setCat] = useState("Tümü");

  const categories = useMemo(() => ["Tümü", ...Array.from(new Set(DEADLINE_RULES.map((r) => r.category)))], []);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(start) && !isNaN(Date.parse(start));

  const rows = useMemo(
    () =>
      DEADLINE_RULES.filter((r) => cat === "Tümü" || r.category === cat).map((r) => ({
        r,
        date: valid ? computeDeadline(start, r) : null,
      })),
    [start, valid, cat]
  );

  const chosen = rows.filter((x) => picked.has(x.r.id) && x.date !== null) as { r: (typeof DEADLINE_RULES)[number]; date: string }[];

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const buildModel = (format: "docx" | "xlsx"): DocModel => ({
    title: "Yasal Süre ve İK Takvimi",
    subtitle: valid ? `Başlangıç tarihi: ${formatTrLong(start)} • Cihan Ahtik İK Akademisi` : "Cihan Ahtik İK Akademisi",
    fileName: "yasal-sureler-takvimi",
    blocks: [
      {
        type: "p",
        text: "Süreler takvim günü, iş günü, ay veya yıl olarak hesaplanır. İş günü hesaplarında hafta sonları ve resmî tatiller (2026–2027) atlanır. Bilgilendirme amaçlıdır.",
      },
      {
        type: "table",
        sheetName: "Yasal Süreler",
        headers: format === "xlsx" ? ["Süre", "Süre tanımı", "Son gün", "Gün", "Dayanak", "Not"] : ["Süre", "Son gün", "Dayanak"],
        rows: chosen.map(({ r, date }) =>
          format === "xlsx"
            ? [r.title, `${describeAmount(r)} • ${r.direction === "once" ? "öncesi" : "sonrası"} • ${r.from}`, formatTr(date), weekdayTr(date), r.lawRef, r.note]
            : [r.title, formatTr(date), r.lawRef]
        ),
      },
    ],
  });

  const exportIcs = () => {
    if (chosen.length === 0) return;
    const ics = buildIcs(
      chosen.map(({ r, date }) => ({
        uid: `${r.id}-${start}`,
        date,
        summary: `${r.title} (son gün)`,
        description: `${r.note} Dayanak: ${r.lawRef}`,
      }))
    );
    downloadText(`yasal-sureler-${start}.ics`, ics);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarDays className="h-4 w-4 text-indigo-600" /> Yasal Süre &amp; İK Takvimi
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Başlangıç tarihini girin; SGK, iş hukuku, İSG, KVKK ve icra süreleri otomatik hesaplanır. Seçtiklerinizi takvime ekleyin.
          </p>
        </div>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">Başlangıç tarihi</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              cat === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!valid && (
        <p className="flex items-center gap-1 text-xs text-rose-600">
          <Info className="h-3.5 w-3.5" /> Geçerli bir başlangıç tarihi girin.
        </p>
      )}

      <ul className="divide-y divide-slate-100">
        {rows.map(({ r, date }) => (
          <li key={r.id} className="flex items-start gap-3 py-3">
            <input
              type="checkbox"
              checked={picked.has(r.id)}
              onChange={() => toggle(r.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-indigo-600"
              aria-label={`${r.title} seç`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${CATEGORY_CLS[r.category] ?? ""}`}>{r.category}</span>
                <span className="text-xs font-bold text-slate-900">{r.title}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {describeAmount(r)} {r.direction === "once" ? "önce" : "sonra"} • {r.from} • {r.lawRef}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-extrabold text-indigo-700">{date ? formatTr(date) : "—"}</p>
              {date && <p className="text-[10px] text-slate-500">{weekdayTr(date)}</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <p className="text-[11px] text-slate-500">{chosen.length} süre seçili</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportIcs}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            <CalendarPlus className="h-4 w-4" /> Takvime ekle (.ics)
          </button>
          <button
            type="button"
            onClick={() => downloadDocumentSafe("docx", buildModel("docx"))}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <FileText className="h-4 w-4" /> Word
          </button>
          <button
            type="button"
            onClick={() => downloadDocumentSafe("xlsx", buildModel("xlsx"))}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button
            type="button"
            onClick={() => downloadDocumentSafe("pdf", buildModel("docx"))}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40"
          >
            <FileDown className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>
    </section>
  );
}
