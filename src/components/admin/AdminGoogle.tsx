"use client";

import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Download, Upload, Save, Loader2, CheckCircle2, AlertTriangle, Globe } from "lucide-react";

interface SheetsCfg {
  sheetId: string;
  tabs: { laws: string; topics: string; questions: string };
}

type ImportEntity = "laws" | "topics" | "questions";

const IMPORT_ENTITIES: ImportEntity[] = ["laws", "topics", "questions"];
const IMPORT_LABEL: Record<ImportEntity, string> = {
  laws: "Kanunlar",
  topics: "İK Teknik & Metotlar",
  questions: "Sorular",
};

const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";
const btnDark =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50";
const btnLight =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50";

function summarize(d: Record<string, unknown>): string {
  const n = (k: string) => Number(d[k] ?? 0);
  const errs = Array.isArray(d.errors) ? (d.errors as string[]) : [];
  const tab = typeof d.tab === "string" ? ` (sekme: ${d.tab})` : "";
  const base = `${n("created")} yeni, ${n("updated")} güncellendi, ${n("skipped")} atlandı${tab}.`;
  return errs.length ? `${base} Uyarılar: ${errs.slice(0, 4).join(" | ")}` : base;
}

export function AdminGoogle() {
  const [sheets, setSheets] = useState<SheetsCfg | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [sheetInput, setSheetInput] = useState("");
  const [tabs, setTabs] = useState({ laws: "Kanunlar", topics: "Teknikler", questions: "Sorular" });
  const [importEntity, setImportEntity] = useState<ImportEntity>("questions");

  const load = async () => {
    const r = await fetch("/api/admin/google", { cache: "no-store" });
    if (!r.ok) {
      setNotice({ ok: false, text: "Sheets ayarları yüklenemedi." });
      return;
    }
    const d = (await r.json()) as { sheets: SheetsCfg };
    setSheets(d.sheets);
    setSheetInput(d.sheets.sheetId ? `https://docs.google.com/spreadsheets/d/${d.sheets.sheetId}` : "");
    setTabs(d.sheets.tabs);
  };

  useEffect(() => {
    void load();
  }, []);

  const call = async (key: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    setBusy(key);
    setNotice(null);
    try {
      const r = await fetch("/api/admin/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
      if (!r.ok) {
        setNotice({ ok: false, text: String(d.error ?? "İşlem başarısız.") });
        return null;
      }
      return d;
    } catch {
      setNotice({ ok: false, text: "Bağlantı hatası." });
      return null;
    } finally {
      setBusy(null);
    }
  };

  const saveSheets = async () => {
    const d = await call("sheets", { action: "save-sheets", sheetId: sheetInput, tabs });
    if (d) {
      setNotice({ ok: true, text: "Google Sheet bağlantısı kaydedildi." });
      await load();
    }
  };

  const importSheet = async (entity: ImportEntity) => {
    const d = await call(`imp:${entity}`, { action: "import-sheet", entity });
    if (d) {
      setNotice({ ok: true, text: `${IMPORT_LABEL[entity]}: ${summarize(d)}` });
    }
  };

  const importFile = async (file: File) => {
    if (file.size > 2_000_000) {
      setNotice({ ok: false, text: "Dosya 2 MB'den büyük olamaz." });
      return;
    }
    const csv = await file.text();
    const d = await call("file", { action: "import-csv", entity: importEntity, csv });
    if (d) setNotice({ ok: true, text: `${IMPORT_LABEL[importEntity]} (${file.name}): ${summarize(d)}` });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Globe className="h-5 w-5 text-sky-300" /> Google Sheets &amp; CSV ile Toplu Veri
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Kanun, İK tekniği/metodu ve soru verilerini Google Sheets&apos;ten çekin veya CSV dosyası yükleyin. Değişiklikler siteye ve İK Robotu&apos;na hemen yansır.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-semibold ${
            notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
          }`}
        >
          {notice.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <section className={cardCls}>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Google Sheets bağlantısı
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Dosyayı <b>Paylaş → Bağlantıya sahip olan herkes (görüntüleyen)</b> yapın, bağlantıyı ve sekme adlarını girin.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-bold text-slate-600">Google Sheet bağlantısı veya kimliği</label>
            <input
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className={inputCls}
            />
          </div>
          {IMPORT_ENTITIES.map((k) => (
            <div key={k}>
              <label className="mb-1 block text-[11px] font-bold text-slate-600">{IMPORT_LABEL[k]} sekmesi</label>
              <input value={tabs[k]} onChange={(e) => setTabs((t) => ({ ...t, [k]: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={saveSheets} disabled={busy !== null} className={btnLight}>
            {busy === "sheets" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Bağlantıyı Kaydet
          </button>
          {IMPORT_ENTITIES.map((k) => (
            <button key={k} type="button" onClick={() => importSheet(k)} disabled={busy !== null || !sheets?.sheetId} className={btnDark}>
              {busy === `imp:${k}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {IMPORT_LABEL[k]} çek
            </button>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <h3 className="text-sm font-bold text-slate-900">CSV yükle ve dışa aktar</h3>
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold text-slate-600">Hangi tabloya yüklenecek?</p>
            <select value={importEntity} onChange={(e) => setImportEntity(e.target.value as ImportEntity)} className={`${inputCls} mt-1`}>
              {IMPORT_ENTITIES.map((k) => (
                <option key={k} value={k}>
                  {IMPORT_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600">Dosya seç (.csv)</p>
            <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Upload className="h-4 w-4" /> CSV seç ve içe aktar
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <span className="text-[11px] font-bold text-slate-600">Mevcut verileri CSV olarak indir:</span>
            {IMPORT_ENTITIES.map((k) => (
              <a key={k} href={`/api/admin/export?entity=${k}`} className={btnLight}>
                <Download className="h-3.5 w-3.5" /> {IMPORT_LABEL[k]}
              </a>
            ))}
          </div>
        </div>

        <details className="mt-4 rounded-2xl border border-slate-200 p-4 text-[11px] text-slate-600">
          <summary className="cursor-pointer font-bold text-slate-800">Sütun başlıkları (Sheets / CSV şablonu)</summary>
          <ul className="mt-2 space-y-1.5 leading-relaxed">
            <li>
              <b>Kanunlar:</b> kanun_no, baslik, slug, kategori, ozet, ornek_senaryo, ipuclari, anahtar_kelimeler, sira
            </li>
            <li>
              <b>İK Teknik &amp; Metot:</b> tip (teknik/metot), baslik, slug, alt_baslik, ozet, ornek, ilgili_kanunlar, ipuclari, anahtar_kelimeler,
              adimlar (her satır: Başlık :: Açıklama), sira
            </li>
            <li>
              <b>Sorular:</b> kategori (kanun/teknik/metot), konu, soru, kisa_cevap, detayli_cevap, yasal_dayanak, ornek_senaryo, zorluk
              (Temel/Orta/İleri)
            </li>
            <li>
              Liste alanlarında her satıra bir madde yazın. Eşleşme: aynı kanun no, aynı slug veya aynı soru metni üzerine yazılır. Kanun madde
              kartları Kanunlar editöründen düzenlenir.
            </li>
          </ul>
        </details>
      </section>
    </div>
  );
}
