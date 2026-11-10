"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Bookmark,
  Volume2,
  Square,
  RefreshCw,
  Lightbulb,
  ArrowUpRight,
  Scale,
  Briefcase,
  Compass,
  HelpCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import type {
  DailyInsightItem,
  BookmarkItem,
  WorkspaceTab,
} from "@/types/hr";
import { speakTurkish, stopSpeaking } from "@/lib/speech";

interface DailyBriefingViewProps {
  todayInsight: DailyInsightItem | null;
  recentInsights: DailyInsightItem[];
  bookmarks: BookmarkItem[];
  counts: {
    laws: number;
    techniques: number;
    methods: number;
    questions: number;
  };
  onNavigateTab: (tab: WorkspaceTab) => void;
  onUpdateInsight: (updated: DailyInsightItem) => void;
  onAskRobot: (prompt: string) => void;
}

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  kanun: {
    label: "Mevzuat & Kanun",
    cls: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  teknik: {
    label: "İK Tekniği",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  metot: {
    label: "İK Metodu",
    cls: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

export function DailyBriefingView({
  todayInsight,
  recentInsights,
  bookmarks,
  counts,
  onNavigateTab,
  onUpdateInsight,
  onAskRobot,
}: DailyBriefingViewProps) {
  const [activeInsight, setActiveInsight] = useState<DailyInsightItem | null>(
    todayInsight
  );
  const [rotating, setRotating] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const displayed = activeInsight || todayInsight;

  const handleToggleRead = async (item: DailyInsightItem) => {
    if (item.id === 0) return;
    const res = await fetch("/api/daily", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isRead: !item.isRead }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.insight) {
        onUpdateInsight(data.insight);
        if (activeInsight?.id === data.insight.id) {
          setActiveInsight(data.insight);
        }
      }
    }
  };

  const handleToggleBookmark = async (item: DailyInsightItem) => {
    if (item.id === 0) return;
    const res = await fetch("/api/daily", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isBookmarked: !item.isBookmarked }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.insight) {
        onUpdateInsight(data.insight);
        if (activeInsight?.id === data.insight.id) {
          setActiveInsight(data.insight);
        }
      }
    }
  };

  const handleRotateRandom = async () => {
    setRotating(true);
    try {
      const res = await fetch("/api/daily?rotate=1");
      if (res.ok) {
        const data = await res.json();
        if (data.previewInsight) {
          setActiveInsight(data.previewInsight);
        }
      }
    } finally {
      setRotating(false);
    }
  };

  const handleSpeak = (item: DailyInsightItem) => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const speech = `${item.headline}. ${item.content}. Örnek uygulama: ${item.exampleCase}. Bugünkü aksiyon: ${item.actionItem}`;
    setSpeaking(true);
    speakTurkish(speech, {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigateTab("laws")}
          className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Scale className="h-4.5 w-4.5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {counts.laws}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Temel Türk Kanunu
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("techniques")}
          className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Briefcase className="h-4.5 w-4.5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {counts.techniques}
          </p>
          <p className="text-xs font-medium text-slate-500">
            İK Süreç &amp; Tekniği
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("methods")}
          className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Compass className="h-4.5 w-4.5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {counts.methods}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Global İK Metodu
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("questions")}
          className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <HelpCircle className="h-4.5 w-4.5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {counts.questions}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Örnekli Soru Bankası
          </p>
        </button>
      </div>

      {/* Main Daily Knowledge Card */}
      {displayed && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {displayed.id === 0
                    ? "Keşif Bilgisi"
                    : `Günün Bilgisi • ${displayed.insightDate}`}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    SOURCE_BADGE[displayed.sourceType]?.cls ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {SOURCE_BADGE[displayed.sourceType]?.label ||
                    displayed.sourceType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotateRandom}
                  disabled={rotating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${rotating ? "animate-spin" : ""}`}
                  />
                  Yeni Bilgi Getir
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeak(displayed)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    speaking
                      ? "bg-rose-500 text-white"
                      : "bg-indigo-500 text-white hover:bg-indigo-400"
                  }`}
                >
                  {speaking ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      Durdur
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      Sesli Dinle
                    </>
                  )}
                </button>
              </div>
            </div>

            <h2 className="mt-4 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {displayed.headline}
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-sm leading-relaxed text-slate-700">
              {displayed.content}
            </p>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <Lightbulb className="h-4 w-4" />
                Uygulamalı Örnek Senaryo
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-950/90">
                {displayed.exampleCase}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Günün İK Aksiyonu
              </div>
              <p className="mt-1 text-sm font-medium text-emerald-950">
                {displayed.actionItem}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {displayed.id !== 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleRead(displayed)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                        displayed.isRead
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {displayed.isRead ? "Okundu" : "Okundu İşaretle"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(displayed)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                        displayed.isBookmarked
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          displayed.isBookmarked ? "fill-amber-500" : ""
                        }`}
                      />
                      {displayed.isBookmarked ? "Kaydedildi" : "Kaydet"}
                    </button>
                  </>
                )}
                {activeInsight && todayInsight && activeInsight.id !== todayInsight.id && (
                  <button
                    type="button"
                    onClick={() => setActiveInsight(todayInsight)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Bugünün Bilgisine Dön
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  onAskRobot(
                    `${displayed.sourceTitle} hakkında daha detaylı bilgi ve ekstra bir örnek senaryo verir misin?`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <Bot className="h-4 w-4" />
                Robota Detay Sor
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 7-Day Daily Archive & Saved Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900">
            Son Günlerin Bilgi Akışı (Tüm Kanun &amp; Metotlardan)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Her gün 12 kanun, 10 İK tekniği ve 14 metot arasından yeni bir başlık paylaşılır.
          </p>

          <div className="mt-4 divide-y divide-slate-100">
            {recentInsights.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveInsight(item)}
                className={`flex w-full items-start justify-between gap-3 py-3 text-left transition hover:bg-slate-50/80 px-2 rounded-xl ${
                  displayed?.id === item.id ? "bg-indigo-50/50" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.insightDate}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                        SOURCE_BADGE[item.sourceType]?.cls
                      }`}
                    >
                      {item.sourceTitle}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                    {item.headline}
                  </p>
                </div>
                {item.isRead && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900">
            Kaydedilenler ({bookmarks.length})
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Hızlı erişim için işaretlediğiniz kanun ve metotlar.
          </p>

          {bookmarks.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
              Henüz yer imi eklemediniz. Kanunlar, İK Teknikleri veya Metotlar sekmesinden kaydedebilirsiniz.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {bookmarks.slice(0, 8).map((bm) => (
                <li
                  key={bm.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-slate-800 truncate">
                    {bm.title}
                  </span>
                  <span className="ml-2 shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500 ring-1 ring-slate-200">
                    {bm.itemType}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
