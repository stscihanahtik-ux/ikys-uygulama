"use client";

import React from "react";
import { Scale, Sparkles, BookOpen, Bot, ArrowRight, Volume2 } from "lucide-react";
import { speakTurkish } from "@/lib/speech";

interface SplashAttributionModalProps {
  open: boolean;
  onClose: () => void;
}

export function SplashAttributionModal({
  open,
  onClose,
}: SplashAttributionModalProps) {
  if (!open) return null;

  const handleVoiceWelcome = () => {
    speakTurkish(
      "Hoş geldiniz. Bu uygulama Cihan Ahtik tarafından yapılmıştır. 12 temel iş ve sosyal güvenlik kanunu, insan kaynakları teknikleri, metotlar, günlük mevzuat bilgileri ve sesli yapay zeka robotu ile yanınızdayım."
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
        {/* Top Accent Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 pt-9 pb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              İK & MEVZUAT AKADEMİSİ
            </div>
            <button
              type="button"
              onClick={handleVoiceWelcome}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
              title="Sesli Karşılama Dinle"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Sesli Dinle
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/25 ring-1 ring-indigo-300/40">
              <Scale className="h-7 w-7 text-indigo-200" />
            </div>
            <div>
              <h1
                id="splash-title"
                className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-white"
              >
                Stratejik İnsan Kaynakları Platformu
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Mevzuat, Yetenek Yönetimi ve Sesli İK Asistanı
              </p>
            </div>
          </div>

          {/* Explicit Attribution Box */}
          <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-4">
            <p className="text-center text-base sm:text-lg font-semibold tracking-wide text-amber-200">
              &ldquo;Bu uygulama Cihan Ahtik tarafından yapılmıştır.&rdquo;
            </p>
          </div>
        </div>

        {/* Content Highlights */}
        <div className="px-8 py-6 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
                <Scale className="h-4 w-4" />
                12 Temel Kanun
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                4857, 5510, 6331, KVKK, TBK, 4447, GVK, İİK, 6356, 5746, TMK ve 4688.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                24 Teknik & Metot
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                STAR, OKR, KPI, 9-Box, 360°, RACI, Hay Group, DISC, MBTI ve dahası.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-violet-700 font-semibold text-xs uppercase tracking-wider">
                <Bot className="h-4 w-4" />
                Sesli İK Robotu
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Kanunlara bakarak örnekli yanıtlar verir, sesli dinler ve konuşur.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Günlük bilgi akışı &amp; vaka örnekleri hazır
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Uygulamaya Başla
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
