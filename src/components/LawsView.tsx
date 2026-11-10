"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Scale,
  Bookmark,
  Volume2,
  Square,
  Bot,
  Lightbulb,
  FileText,
  Sparkles,
  ChevronRight,
  FileDown,
  LibraryBig,
} from "lucide-react";
import type { LawItem, BookmarkItem } from "@/types/hr";
import { speakTurkish, stopSpeaking } from "@/lib/speech";
import { lawDoc, allLawsDoc } from "@/lib/export-models";
import { downloadDocumentSafe } from "@/lib/documents";

interface LawsViewProps {
  laws: LawItem[];
  bookmarks: BookmarkItem[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onToggleBookmark: (itemType: "law", itemId: number, title: string) => void;
  onAskRobot: (prompt: string) => void;
}

export function LawsView({
  laws,
  bookmarks,
  selectedSlug,
  onSelectSlug,
  onToggleBookmark,
  onAskRobot,
}: LawsViewProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(laws.map((l) => l.category)));
    return ["Tümü", ...cats];
  }, [laws]);

  const filteredLaws = useMemo(() => {
    const q = search.trim().toLowerCase();
    return laws.filter((l) => {
      const catMatch =
        activeCategory === "Tümü" || l.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.lawNumber.includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [laws, search, activeCategory]);

  const activeLaw = useMemo(() => {
    if (selectedSlug) {
      return laws.find((l) => l.slug === selectedSlug) || filteredLaws[0] || null;
    }
    return filteredLaws[0] || null;
  }, [laws, filteredLaws, selectedSlug]);

  const isBookmarked = (id: number) =>
    bookmarks.some((b) => b.itemType === "law" && b.itemId === id);

  const handleSpeakLaw = (law: LawItem) => {
    if (speakingId === law.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const text = `${law.title}. ${law.summary}. Önemli maddeler: ${law.keyArticles
      .map((a) => `${a.articleNo} ${a.title}: ${a.hrImpact}`)
      .join(". ")}. ${law.practicalExample}`;
    setSpeakingId(law.id);
    speakTurkish(text, {
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">
              İnsan Kaynakları Mevzuatı (12 Temel Kanun)
            </h2>
            <p className="text-xs text-slate-500">
              Kanun maddeleri, İK uygulama etkileri ve somut senaryolarla tam rehber.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadDocumentSafe("docx", allLawsDoc(laws, "docx"))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
              title="12 kanunun tamamını Word belgesi olarak indir"
            >
              <FileText className="h-4 w-4" /> Word
            </button>
            <button
              type="button"
              onClick={() => downloadDocumentSafe("xlsx", allLawsDoc(laws, "xlsx"))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              title="12 kanunun tamamını Excel tablosu olarak indir"
            >
              <LibraryBig className="h-4 w-4" /> Excel
            </button>
            <a
              href="/api/laws/pdf?all=1"
              download
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              title="12 kanunun tamamını tek PDF olarak indir"
            >
              <FileDown className="h-4 w-4" /> PDF
            </a>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kanun no veya konu ara (ör. 4857, kıdem)..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-2">
          {filteredLaws.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              Aramanızla eşleşen kanun bulunamadı.
            </div>
          ) : (
            filteredLaws.map((law) => {
              const selected = activeLaw?.id === law.id;
              return (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => onSelectSlug(law.slug)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition ${
                    selected
                      ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                        {law.lawNumber}
                      </span>
                      <span className="truncate text-[11px] font-medium text-indigo-700">
                        {law.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-slate-900 leading-snug">
                      {law.title}
                    </p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      selected ? "text-indigo-600" : "text-slate-400"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-8">
          {activeLaw && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1 font-mono text-xs font-bold text-indigo-800">
                      <Scale className="h-3.5 w-3.5" />
                      Kanun No: {activeLaw.lawNumber}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {activeLaw.category}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-serif text-2xl font-semibold text-slate-900">
                    {activeLaw.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeakLaw(activeLaw)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      speakingId === activeLaw.id
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {speakingId === activeLaw.id ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        Durdur
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Sesli Dinle
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleBookmark("law", activeLaw.id, activeLaw.title)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      isBookmarked(activeLaw.id)
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isBookmarked(activeLaw.id) ? "fill-amber-500" : ""
                      }`}
                    />
                    {isBookmarked(activeLaw.id) ? "Kaydedildi" : "Kaydet"}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDocumentSafe("docx", lawDoc(activeLaw, "docx"))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    title="Bu kanunu Word olarak indir"
                  >
                    <FileText className="h-4 w-4" /> Word
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDocumentSafe("xlsx", lawDoc(activeLaw, "xlsx"))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    title="Bu kanunu Excel olarak indir"
                  >
                    <LibraryBig className="h-4 w-4" /> Excel
                  </button>

                  <a
                    href={`/api/laws/pdf?slug=${activeLaw.slug}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    title="Bu kanunu PDF olarak indir"
                  >
                    <FileDown className="h-4 w-4" /> PDF
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      onAskRobot(
                        `${activeLaw.title} kapsamında İK'nın en çok dikkat etmesi gereken kritik noktaları örnek vererek anlatır mısın?`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Bot className="h-4 w-4" />
                    Robota Sor
                  </button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">
                {activeLaw.summary}
              </p>

              {/* Key Articles */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Kritik Kanun Maddeleri ve İK Etkisi
                </h4>
                <div className="space-y-3">
                  {activeLaw.keyArticles.map((art, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                          {art.articleNo}
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900">
                          {art.title}
                        </h5>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">
                        {art.content}
                      </p>
                      <div className="mt-2.5 rounded-xl bg-white px-3 py-2 text-xs text-indigo-950 ring-1 ring-indigo-100">
                        <strong className="font-semibold text-indigo-700">
                          İK Uygulama Etkisi:{" "}
                        </strong>
                        {art.hrImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Example */}
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  <Lightbulb className="h-4 w-4" />
                  Gerçek Hayat Örnek Senaryo
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-amber-950/90">
                  {activeLaw.practicalExample}
                </p>
              </div>

              {/* Daily Tips */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  Günlük Mevzuat İpuçları
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-950">
                  {activeLaw.dailyTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
