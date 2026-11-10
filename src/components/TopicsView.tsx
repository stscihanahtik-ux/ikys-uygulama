"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Bookmark,
  Volume2,
  Square,
  Bot,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Layers,
  Scale,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import type { HrTopicItem, BookmarkItem } from "@/types/hr";
import { speakTurkish, stopSpeaking } from "@/lib/speech";
import { topicsDoc } from "@/lib/export-models";
import { downloadDocumentSafe } from "@/lib/documents";

interface TopicsViewProps {
  mode: "technique" | "method";
  topics: HrTopicItem[];
  bookmarks: BookmarkItem[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onToggleBookmark: (
    itemType: "technique" | "method",
    itemId: number,
    title: string
  ) => void;
  onJumpToLaw: (lawNumber: string) => void;
  onAskRobot: (prompt: string) => void;
}

function MethodVisualAid({ slug }: { slug: string }) {
  if (slug === "9-box-matrix") {
    const boxes = [
      { label: "Bilmece / Yüksek Pot.", cls: "bg-amber-50 border-amber-200 text-amber-900" },
      { label: "Büyüme Yıldızı", cls: "bg-emerald-50 border-emerald-200 text-emerald-900" },
      { label: "Süper Yıldız (Lider)", cls: "bg-indigo-100 border-indigo-300 text-indigo-950 font-semibold" },
      { label: "Tutarsız", cls: "bg-rose-50 border-rose-200 text-rose-900" },
      { label: "Çekirdek Oyuncu", cls: "bg-slate-100 border-slate-200 text-slate-900" },
      { label: "Yüksek Performans", cls: "bg-emerald-50 border-emerald-200 text-emerald-900" },
      { label: "Risk / PIP", cls: "bg-rose-100 border-rose-300 text-rose-950" },
      { label: "Ortalama Katkı", cls: "bg-slate-50 border-slate-200 text-slate-800" },
      { label: "Güvenilir Uzman", cls: "bg-sky-50 border-sky-200 text-sky-900" },
    ];
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          9-Box Görsel Matris (Dikey: Potansiyel ↑ • Yatay: Performans →)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {boxes.map((b, i) => (
            <div
              key={i}
              className={`rounded-xl border p-2.5 text-center text-[11px] ${b.cls}`}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "70-20-10-gelisim-kurali") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          70-20-10 Öğrenme Dağılımı
        </p>
        <div className="flex h-7 w-full overflow-hidden rounded-xl text-[11px] font-bold text-white">
          <div className="flex w-[70%] items-center justify-center bg-indigo-600">
            %70 İşbaşı Deneyim
          </div>
          <div className="flex w-[20%] items-center justify-center bg-emerald-600">
            %20 Sosyal
          </div>
          <div className="flex w-[10%] items-center justify-center bg-amber-500">
            %10
          </div>
        </div>
      </div>
    );
  }

  if (slug === "raci-matrisi") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          RACI Sorumluluk Anahtarı
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-xl bg-indigo-600 px-3 py-2 text-white">
            <strong>R</strong> – İşi Yapan
          </div>
          <div className="rounded-xl bg-rose-600 px-3 py-2 text-white">
            <strong>A</strong> – Nihai Onay (Tek)
          </div>
          <div className="rounded-xl bg-amber-500 px-3 py-2 text-white">
            <strong>C</strong> – Danışılan
          </div>
          <div className="rounded-xl bg-emerald-600 px-3 py-2 text-white">
            <strong>I</strong> – Bilgilendirilen
          </div>
        </div>
      </div>
    );
  }

  if (slug === "disc-kisilik-envanteri") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          DISC 4 Temel Davranış Profili
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
            D • Dominant (Sonuç)
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
            I • Etkileyici (Sosyal)
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            S • Sabırlı (Uyum)
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800">
            C • Analitik (Kalite)
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function TopicsView({
  mode,
  topics,
  bookmarks,
  selectedSlug,
  onSelectSlug,
  onToggleBookmark,
  onJumpToLaw,
  onAskRobot,
}: TopicsViewProps) {
  const [search, setSearch] = useState("");
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [topics, search]);

  const active = useMemo(() => {
    if (selectedSlug) {
      return topics.find((t) => t.slug === selectedSlug) || filtered[0] || null;
    }
    return filtered[0] || null;
  }, [topics, filtered, selectedSlug]);

  const isBookmarked = (id: number) =>
    bookmarks.some((b) => b.itemType === mode && b.itemId === id);

  const handleSpeakTopic = (topic: HrTopicItem) => {
    if (speakingId === topic.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const text = `${topic.title}. ${topic.summary}. Adımlar: ${topic.stepsOrComponents
      .map((s) => `${s.title}: ${s.description}`)
      .join(". ")}. ${topic.practicalExample}`;
    setSpeakingId(topic.id);
    speakTurkish(text, {
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const titleLabel =
    mode === "technique"
      ? `İK Teknikleri ve Süreçleri (${topics.length})`
      : `İK Metotları ve Modelleri (${topics.length})`;

  const subtitleLabel =
    mode === "technique"
      ? "Stratejik İK'dan işe alıma, bordrodan offboarding'e uçtan uca İK süreç rehberi."
      : "360 Derece, 9-Box, KPI, OKR, STAR, 7S, 70-20-10, ADDIE, RACI, DISC, MBTI, Gallup, Kirkpatrick ve Hay Group.";

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">
              {titleLabel}
            </h2>
            <p className="text-xs text-slate-500">{subtitleLabel}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => downloadDocumentSafe("docx", topicsDoc(topics, "docx", titleLabel))}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <FileText className="h-3.5 w-3.5" /> Word
              </button>
              <button
                type="button"
                onClick={() => downloadDocumentSafe("xlsx", topicsDoc(topics, "xlsx", titleLabel))}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
              </button>
              <button
                type="button"
                onClick={() => downloadDocumentSafe("pdf", topicsDoc(topics, "docx", titleLabel))}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
                title="Tüm başlıkları PDF olarak indir"
              >
                <FileDown className="h-3.5 w-3.5" /> PDF
              </button>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  mode === "technique"
                    ? "İK tekniği ara (ör. onboarding, bordro)..."
                    : "Metot ara (ör. STAR, OKR, Hay Group)..."
                }
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              Aramanızla eşleşen başlık bulunamadı.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const selected = active?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSlug(item.slug)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition ${
                    selected
                      ? mode === "technique"
                        ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/20"
                        : "border-violet-500 bg-violet-50/70 shadow-sm ring-1 ring-violet-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-white ${
                          mode === "technique" ? "bg-emerald-700" : "bg-violet-700"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-[11px] font-medium text-slate-500">
                        {item.subtitle.split("•")[1]?.trim() || item.subtitle}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-slate-900 leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      selected ? "text-slate-800" : "text-slate-400"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-8">
          {active && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      mode === "technique"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-violet-100 text-violet-800"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {active.subtitle}
                  </span>
                  <h3 className="mt-2.5 font-serif text-2xl font-semibold text-slate-900">
                    {active.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeakTopic(active)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      speakingId === active.id
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {speakingId === active.id ? (
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
                      onToggleBookmark(mode, active.id, active.title)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      isBookmarked(active.id)
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isBookmarked(active.id) ? "fill-amber-500" : ""
                      }`}
                    />
                    {isBookmarked(active.id) ? "Kaydedildi" : "Kaydet"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onAskRobot(
                        `${active.title} konusunu iş hayatından somut bir örnek ile adım adım anlatır mısın?`
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
                {active.summary}
              </p>

              {/* Visual Aid for signature methods */}
              <MethodVisualAid slug={active.slug} />

              {/* Steps / Components */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {mode === "technique"
                    ? "Süreç Adımları & Uygulama Rehberi"
                    : "Metot Bileşenleri & Yapısı"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {active.stepsOrComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                    >
                      <h5 className="text-xs font-bold text-slate-900">
                        {comp.title}
                      </h5>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {comp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Example */}
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  <Lightbulb className="h-4 w-4" />
                  Uygulamalı Örnek
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-amber-950/90">
                  {active.practicalExample}
                </p>
              </div>

              {/* Related Laws */}
              {active.relatedLaws && active.relatedLaws.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Scale className="h-3.5 w-3.5 text-indigo-600" />
                    İlişkili Kanunlar:
                  </span>
                  {active.relatedLaws.map((lawNo) => (
                    <button
                      key={lawNo}
                      type="button"
                      onClick={() => onJumpToLaw(lawNo)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      {lawNo} Sayılı Kanun →
                    </button>
                  ))}
                </div>
              )}

              {/* Daily Tips */}
              {active.dailyTips.length > 0 && (
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    <Sparkles className="h-4 w-4" />
                    Uzman İpuçları
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-950">
                    {active.dailyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
