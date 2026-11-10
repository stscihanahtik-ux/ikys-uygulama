"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Sparkles, Save, Trash2, Loader2, CheckCircle2, AlertTriangle, Plus, FileText, FileSpreadsheet, FileDown, RefreshCw } from "lucide-react";
import { downloadDocumentSafe } from "@/lib/documents";
import { insightsDoc } from "@/lib/export-models";
import type { DailyInsightItem } from "@/types/hr";

const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";

interface Form extends Omit<DailyInsightItem, "id"> {}

const emptyForm = (date: string): Form => ({
  insightDate: date,
  sourceType: "kanun",
  sourceTitle: "",
  headline: "",
  content: "",
  exampleCase: "",
  actionItem: "",
  isRead: false,
  isBookmarked: false,
});

const toForm = (r: DailyInsightItem): Form => ({
  insightDate: r.insightDate,
  sourceType: r.sourceType,
  sourceTitle: r.sourceTitle,
  headline: r.headline,
  content: r.content,
  exampleCase: r.exampleCase,
  actionItem: r.actionItem,
  isRead: r.isRead,
  isBookmarked: r.isBookmarked,
});

export function DailyAdmin() {
  const [rows, setRows] = useState<DailyInsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>(emptyForm(new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10)));
  const [generate, setGenerate] = useState({ includeTopics: false, overwrite: false, startDate: "" });

  const load = async () => {
    const res = await fetch("/api/overview", { cache: "no-store" });
    const d = (await res.json()) as { recentInsights?: DailyInsightItem[] };
    setRows(d.recentInsights ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", item: form, id: selected === "new" ? null : selected }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Kaydedilemedi." });
        return;
      }
      setMsg({ ok: true, text: "Günlük bilgi kaydedildi ✓ Kullanıcıların Günlük Bilgi ekranı güncellendi." });
      await load();
      setSelected(null);
    } finally {
      setBusy(null);
    }
  };

  const generateAll = async () => {
    setBusy("generate");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", includeTopics: generate.includeTopics, overwrite: generate.overwrite, startDate: generate.startDate || undefined }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; created?: number; skipped?: number };
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Üretilemedi." });
        return;
      }
      setMsg({ ok: true, text: `${d.created ?? 0} yeni günlük bilgi oluşturuldu${d.skipped ? `, ${d.skipped} kayıt zaten vardı` : ""}.` });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Bu günlük bilgi silinsin mi?")) return;
    setBusy(`del:${id}`);
    try {
      const res = await fetch("/api/admin/daily", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) setMsg({ ok: false, text: "Silinemedi." });
      else await load();
      if (selected === id) setSelected(null);
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (r: DailyInsightItem) => {
    await fetch("/api/admin/daily", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, isRead: !r.isRead, isBookmarked: r.isBookmarked }),
    });
    await load();
  };

  const open = (r: DailyInsightItem | null) => {
    setSelected(r ? r.id : "new");
    setForm(r ? toForm(r) : emptyForm(new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10)));
    setMsg(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><CalendarDays className="h-5 w-5 text-indigo-300" /> Günlük Bilgi Yönetimi</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Her gün kullanıcılara gösterilen bilgiyi düzenleyin veya tüm kanunlar için otomatik olarak ayrı bir günlük bilgi üretin. Değişiklikler anında
          Günlük Bilgi ekranına yansır.
        </p>
      </div>

      {msg && (
        <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {msg.text}
        </p>
      )}

      <section className={cardCls}>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Sparkles className="h-4 w-4 text-amber-500" /> Her kanuna göre bilgi üret</h3>
        <p className="mt-1 text-xs text-slate-500">
          Veritabanındaki her kanunun kendi özeti, kritik ipucu ve örnek senaryosundan bir günlük bilgi oluşturulur; tarihler sırayla ileriye atanır.
          İsterseniz İK teknikleri ve metotları da eklenir.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-slate-600">Başlangıç tarihi (boş = bugün)</span>
            <input type="date" value={generate.startDate} onChange={(e) => setGenerate({ ...generate, startDate: e.target.value })} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 self-end text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={generate.includeTopics} onChange={(e) => setGenerate({ ...generate, includeTopics: e.target.checked })} className="h-4 w-4 accent-indigo-600" />
            Teknik ve metotları da ekle
          </label>
          <label className="flex items-center gap-2 self-end text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={generate.overwrite} onChange={(e) => setGenerate({ ...generate, overwrite: e.target.checked })} className="h-4 w-4 accent-rose-600" />
            Var olan kaynakları yeniden üret
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={generateAll} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Kanunlardan üret
          </button>
          <button type="button" onClick={() => downloadDocumentSafe("docx", insightsDoc(rows))} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <FileText className="h-4 w-4" /> Word
          </button>
          <button type="button" onClick={() => downloadDocumentSafe("xlsx", insightsDoc(rows))} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button type="button" onClick={() => downloadDocumentSafe("pdf", insightsDoc(rows))} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">
            <FileDown className="h-4 w-4" /> PDF
          </button>
          <button type="button" onClick={() => open(null)} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Elle ekle
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="space-y-2 xl:col-span-4">
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">Günlük bilgiler ({rows.length})</h3>
            <p className="text-[11px] text-slate-500">En yeni tarih en üstte</p>
          </div>
          {loading ? (
            <div className="flex justify-center p-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => open(r)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${selected === r.id ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/20" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{r.insightDate}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${r.sourceType === "kanun" ? "bg-indigo-100 text-indigo-800" : r.sourceType === "teknik" ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800"}`}>
                      {r.sourceType}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900">{r.headline}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{r.sourceTitle}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="xl:col-span-8">
          {selected === null ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              Soldan bir günlük bilgi seçin veya <b>Elle ekle</b> ile yeni kayıt açın.
            </div>
          ) : (
            <form onSubmit={save} className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900">{selected === "new" ? "Yeni günlük bilgi" : "Günlük bilgiyi düzenle"}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Tarih (YYYY-AA-GG) *</span>
                  <input value={form.insightDate} onChange={(e) => set("insightDate", e.target.value)} className={inputCls} required />
                  <span className="mt-1 block text-[10px] text-slate-400">Aynı tarihte kayıt varsa üzerine yazılır.</span>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Tür</span>
                  <select value={form.sourceType} onChange={(e) => set("sourceType", e.target.value as Form["sourceType"])} className={inputCls}>
                    <option value="kanun">Kanun</option>
                    <option value="teknik">İK Tekniği</option>
                    <option value="metot">Metot</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Kaynak başlığı (kanun / teknik adı)</span>
                  <input value={form.sourceTitle} onChange={(e) => set("sourceTitle", e.target.value)} className={inputCls} placeholder="4857 Sayılı İş Kanunu" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Başlık *</span>
                  <input value={form.headline} onChange={(e) => set("headline", e.target.value)} className={inputCls} required />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">İçerik *</span>
                  <textarea rows={5} value={form.content} onChange={(e) => set("content", e.target.value)} className={inputCls} required />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Örnek senaryo</span>
                  <textarea rows={4} value={form.exampleCase} onChange={(e) => set("exampleCase", e.target.value)} className={inputCls} />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Günün İK aksiyonu</span>
                  <textarea rows={2} value={form.actionItem} onChange={(e) => set("actionItem", e.target.value)} className={inputCls} />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isRead} onChange={(e) => set("isRead", e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                  Okundu olarak işaretle
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isBookmarked} onChange={(e) => set("isBookmarked", e.target.checked)} className="h-4 w-4 accent-amber-600" />
                  Kaydedildi olarak işaretle
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                {typeof selected === "number" ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggle(rows.find((r) => r.id === selected)!)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      Okundu durumunu çevir
                    </button>
                    <button type="button" onClick={() => remove(selected)} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" /> Sil
                    </button>
                  </div>
                ) : <span />}
                <button type="submit" disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
