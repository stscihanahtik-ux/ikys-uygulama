"use client";

import React, { useMemo, useState } from "react";
import { Search, Bot, FileText, FileSpreadsheet, FileDown, ChevronDown, Info, ShieldCheck } from "lucide-react";
import type { SgkCodeItem } from "@/types/hr";
import { downloadDocumentSafe, type DocModel } from "@/lib/documents";

interface SgkCodesViewProps {
  codes: SgkCodeItem[];
  onAskRobot: (prompt: string) => void;
}

const GROUP: Record<string, string> = {
  isci: "İşçi kaynaklı",
  isveren: "İşveren kaynaklı",
  yasal: "Yasal / emeklilik / ölüm",
  diger: "Diğer",
};

const FLAG: Record<string, string> = { evet: "Hak doğar", hayir: "Hak doğmaz", duruma_bagli: "Duruma bağlı" };
const FLAG_CLS: Record<string, string> = {
  evet: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  hayir: "bg-rose-100 text-rose-800 ring-rose-200",
  duruma_bagli: "bg-amber-100 text-amber-800 ring-amber-200",
};

export function SgkCodesView({ codes, onAskRobot }: SgkCodesViewProps) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("tumu");
  const [onlySeverance, setOnlySeverance] = useState(false);
  const [onlyUnemployment, setOnlyUnemployment] = useState(false);
  const [openCode, setOpenCode] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return codes.filter((c) => {
      if (group !== "tumu" && c.category !== group) return false;
      if (onlySeverance && c.severance !== "evet") return false;
      if (onlyUnemployment && c.unemployment !== "evet") return false;
      if (!term) return true;
      return `${c.code} ${c.title} ${c.description} ${c.lawRef}`.toLowerCase().includes(term);
    });
  }, [codes, q, group, onlySeverance, onlyUnemployment]);

  const severanceCount = codes.filter((c) => c.severance === "evet").length;
  const unemploymentCount = codes.filter((c) => c.unemployment === "evet").length;

  const buildModel = (format: "docx" | "xlsx"): DocModel => {
    const headers =
      format === "xlsx"
        ? ["Kod", "Çıkış nedeni", "Grup", "Kıdem tazminatı", "İşsizlik ödeneği", "Yasal dayanak", "Açıklama", "Uyarı / not"]
        : ["Kod", "Çıkış nedeni", "Kıdem", "İşsizlik", "Dayanak"];
    const rows = list.map((c) =>
      format === "xlsx"
        ? [c.code, c.title, GROUP[c.category] ?? "Diğer", FLAG[c.severance] ?? "—", FLAG[c.unemployment] ?? "—", c.lawRef, c.description, c.notes]
        : [c.code, c.title, FLAG[c.severance] ?? "—", FLAG[c.unemployment] ?? "—", c.lawRef]
    );
    return {
      title: "SGK İşten Ayrılış (Çıkış) Kodları",
      subtitle: `${list.length} kod • Cihan Ahtik İK Akademisi • Güncel SGK e-Bildirge kılavuzunu kontrol edin`,
      fileName: "sgk-isten-cikis-kodlari",
      blocks: [
        {
          type: "p",
          text: "Çıkış kodu seçimi, çalışanın kıdem tazminatı ve işsizlik ödeneği hakkını doğrudan etkiler. Bu liste bilgilendirme amaçlıdır.",
        },
        { type: "table", sheetName: "SGK Kodları", headers, rows },
      ],
    };
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-rose-300" /> SGK İşten Ayrılış (Çıkış) Kodları
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          İşten ayrılış bildirgesinde kullanılan çıkış nedeni kodları. Kodu arayın; kıdem ve işsizlik ödeneği hakkını, yasal dayanağı ve uyarıları görün.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-100">Toplam: {codes.length} kod</span>
          <span className="rounded-lg bg-emerald-400/15 px-2.5 py-1 font-semibold text-emerald-200">Kıdem hakkı doğuran: {severanceCount}</span>
          <span className="rounded-lg bg-sky-400/15 px-2.5 py-1 font-semibold text-sky-200">İşsizlik ödeneği doğuran: {unemploymentCount}</span>
        </div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Liste, SGK&apos;nın yayımladığı yaygın işten ayrılış kodlarını içerir. Nadir kodlar ve değişiklikler için Yönetici Paneli &gt; SGK Çıkış
          Kodları bölümünden kayıt eklenebilir. Bildirim öncesi SGK e-Bildirge kılavuzunu kontrol edin.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kod, neden veya kanun ara (ör. 04, istifa, 25/II)"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadDocumentSafe("docx", buildModel("docx"))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
              onClick={() => downloadDocumentSafe("pdf", buildModel("docx"))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700"
              title="Filtrelenmiş SGK kodlarını PDF olarak indir"
            >
              <FileDown className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "tumu", label: "Tümü" },
            { id: "isci", label: "İşçi" },
            { id: "isveren", label: "İşveren" },
            { id: "yasal", label: "Yasal" },
            { id: "diger", label: "Diğer" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                group === g.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {g.label}
            </button>
          ))}
          <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-700">
            <input type="checkbox" checked={onlySeverance} onChange={(e) => setOnlySeverance(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-600" />
            Kıdem hakkı olan
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyUnemployment}
              onChange={(e) => setOnlyUnemployment(e.target.checked)}
              className="h-3.5 w-3.5 accent-sky-600"
            />
            İşsizlik ödeneği olan
          </label>
        </div>

        <p className="text-[11px] text-slate-500">{list.length} kod listeleniyor</p>

        <ul className="divide-y divide-slate-100">
          {list.length === 0 && <li className="py-8 text-center text-xs text-slate-500">Aramanızla eşleşen kod bulunamadı.</li>}
          {list.map((c) => {
            const open = openCode === c.code;
            return (
              <li key={c.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenCode(open ? null : c.code)}
                  className="flex w-full items-start gap-3 text-left"
                  aria-expanded={open}
                >
                  <span className="mt-0.5 flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-sm font-extrabold text-white">
                    {c.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-900 sm:text-sm">{c.title}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${FLAG_CLS[c.severance] ?? ""}`}>
                        Kıdem: {FLAG[c.severance] ?? "—"}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${FLAG_CLS[c.unemployment] ?? ""}`}>
                        İşsizlik: {FLAG[c.unemployment] ?? "—"}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{GROUP[c.category] ?? "Diğer"}</span>
                      {c.lawRef && <span className="text-[10px] font-medium text-indigo-700">{c.lawRef}</span>}
                    </span>
                  </span>
                  <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="ml-15 mt-3 space-y-2 pl-0 sm:pl-15">
                    <p className="text-xs leading-relaxed text-slate-700">{c.description}</p>
                    {c.notes && (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">⚠️ {c.notes}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => onAskRobot(`SGK ${c.code} çıkış kodu nedir, kıdem ve işsizlik hakkını nasıl etkiler?`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      <Bot className="h-3.5 w-3.5" /> Robota sor
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
