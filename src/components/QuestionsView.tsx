"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  HelpCircle,
  Eye,
  EyeOff,
  Volume2,
  Square,
  Bot,
  Plus,
  Lightbulb,
  Scale,
  CheckCircle2,
  X,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { questionsDoc } from "@/lib/export-models";
import { downloadDocumentSafe } from "@/lib/documents";
import type { QuestionItem } from "@/types/hr";
import { speakTurkish, stopSpeaking } from "@/lib/speech";

interface QuestionsViewProps {
  questions: QuestionItem[];
  onQuestionAdded: (q: QuestionItem) => void;
  onAskRobot: (prompt: string) => void;
}

const CAT_LABELS: Record<string, { label: string; cls: string }> = {
  kanun: {
    label: "Kanunlar",
    cls: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  teknik: {
    label: "İK Teknikleri",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  metot: {
    label: "Metotlar",
    cls: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

export function QuestionsView({
  questions,
  onQuestionAdded,
  onAskRobot,
}: QuestionsViewProps) {
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("Tümü");
  const [search, setSearch] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<{ total: number; known: number; score: number }>({ total: 0, known: 0, score: 0 });
  const [markedIds, setMarkedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/quiz").then((r) => r.json()).then((d) => { if (typeof d.total === "number") setQuizScore(d); }).catch(() => undefined);
  }, []);

  const handleMarkKnown = async (questionId: number, known: boolean) => {
    setMarkedIds((p) => ({ ...p, [questionId]: true }));
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, known }) });
      if (res.ok) setQuizScore(await res.json());
    } catch { /* ignore */ }
  };

  // Add Custom Question Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCat, setNewCat] = useState<"kanun" | "teknik" | "metot">("kanun");
  const [newTopicRef, setNewTopicRef] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newShortAnswer, setNewShortAnswer] = useState("");
  const [newLegalBasis, setNewLegalBasis] = useState("");
  const [newExample, setNewExample] = useState("");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (difficulty !== "Tümü" && item.difficulty !== difficulty) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.topicRef.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.detailedAnswer.toLowerCase().includes(q) ||
        item.legalBasis.toLowerCase().includes(q)
      );
    });
  }, [questions, category, difficulty, search]);

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeakQ = (item: QuestionItem) => {
    if (speakingId === item.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const text = `Soru: ${item.question}. Cevap: ${item.detailedAnswer}. Örnek senaryo: ${item.exampleScenario}`;
    setSpeakingId(item.id);
    speakTurkish(text, {
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newShortAnswer.trim()) return;

    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCat,
          topicRef: newTopicRef.trim() || "Özel İK Notu",
          question: newQuestion.trim(),
          shortAnswer: newShortAnswer.trim(),
          detailedAnswer: newShortAnswer.trim(),
          legalBasis: newLegalBasis.trim() || "Kurumsal Uygulama",
          exampleScenario:
            newExample.trim() || "Kullanıcı tarafından eklenen örnek vaka.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.question) {
          onQuestionAdded(data.question);
          setNewTopicRef("");
          setNewQuestion("");
          setNewShortAnswer("");
          setNewLegalBasis("");
          setNewExample("");
          setShowAddForm(false);
          setFormMsg("Yeni soru başarıyla veritabanına kaydedildi.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">
              İK &amp; Mevzuat Soru Bankası ({questions.length} Soru)
            </h2>
            <p className="text-xs text-slate-500">
              12 Kanun, 10 İK Tekniği ve 14 Metot ile ilgili tüm kritik sorular, dayanaklar ve örnek vakalar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quizScore.total > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><Trophy className="h-4 w-4" /> Quiz Skoru: %{quizScore.score} ({quizScore.known}/{quizScore.total})</span>
            )}
            <button
              type="button"
              onClick={() => downloadDocumentSafe("docx", questionsDoc(questions, "docx"))}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              title="Soru bankasını Word olarak indir"
            >
              <FileText className="h-3.5 w-3.5" /> Word
            </button>
            <button
              type="button"
              onClick={() => downloadDocumentSafe("xlsx", questionsDoc(questions, "xlsx"))}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              title="Soru bankasını Excel olarak indir"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </button>
            <button
              type="button"
              onClick={() => downloadDocumentSafe("pdf", questionsDoc(questions, "docx"))}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
              title="Soru bankasını PDF olarak indir"
            >
              <FileDown className="h-3.5 w-3.5" /> PDF
            </button>

            <button
              type="button"
              onClick={() => {
                setQuizMode(!quizMode);
                setRevealedIds({});
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                quizMode
                  ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {quizMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {quizMode ? "Quiz Modu Açık" : "Kendini Test Et (Quiz)"}
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  Kapat
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Soru Ekle
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Tümü" },
              { id: "kanun", label: "Kanunlar" },
              { id: "teknik", label: "İK Teknikleri" },
              { id: "metot", label: "Metotlar" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  category === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="ml-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="Tümü">Tüm Seviyeler</option>
              <option value="Temel">Temel</option>
              <option value="Orta">Orta</option>
              <option value="İleri">İleri</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Soru veya konu ara..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {formMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          {formMsg}
        </div>
      )}

      {/* Custom Question Creation Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm space-y-3"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            Yeni Soru / Vaka Notu Ekle
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Kategori
              </label>
              <select
                value={newCat}
                onChange={(e) =>
                  setNewCat(e.target.value as "kanun" | "teknik" | "metot")
                }
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
              >
                <option value="kanun">Kanun</option>
                <option value="teknik">İK Tekniği</option>
                <option value="metot">Metot</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                İlgili Konu / Kanun
              </label>
              <input
                type="text"
                value={newTopicRef}
                onChange={(e) => setNewTopicRef(e.target.value)}
                placeholder="Örn: 4857 Sayılı İş Kanunu"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Yasal Dayanak
              </label>
              <input
                type="text"
                value={newLegalBasis}
                onChange={(e) => setNewLegalBasis(e.target.value)}
                placeholder="Örn: 4857 m.17"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Soru *
            </label>
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Sorunuzu yazın..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cevap / Açıklama *
            </label>
            <textarea
              required
              rows={2}
              value={newShortAnswer}
              onChange={(e) => setNewShortAnswer(e.target.value)}
              placeholder="Net cevabı ve mevzuat açıklamasını yazın..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Örnek Senaryo
            </label>
            <textarea
              rows={2}
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              placeholder="Somut bir iş hayatı örneği yazın..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : "Veritabanına Kaydet"}
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            Seçili filtrelere uygun soru bulunamadı.
          </div>
        ) : (
          filtered.map((item) => {
            const catMeta = CAT_LABELS[item.category] || CAT_LABELS.kanun;
            const isAnswerVisible = !quizMode || !!revealedIds[item.id];

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${catMeta.cls}`}
                    >
                      {catMeta.label}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {item.topicRef}
                    </span>
                    <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                      {item.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeakQ(item)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                        speakingId === item.id
                          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                          : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {speakingId === item.id ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          Durdur
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          Dinle
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onAskRobot(item.question)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-indigo-700"
                    >
                      <Bot className="h-3.5 w-3.5" />
                      Robota Sor
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 flex items-start gap-2 text-sm sm:text-base font-semibold text-slate-900">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>{item.question}</span>
                </h3>

                {quizMode && !revealedIds[item.id] ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Cevabı ve Örneği Göster
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                    <div className="rounded-xl bg-slate-50 p-3.5">
                      <p className="text-xs font-semibold text-slate-900">
                        Özet Yanıt: {item.shortAnswer}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                        {item.detailedAnswer}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
                        <Scale className="h-3.5 w-3.5" />
                        Dayanak: {item.legalBasis}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Örnek Senaryo
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-amber-950/90">
                        {item.exampleScenario}
                      </p>
                    </div>

                    {quizMode && isAnswerVisible && (
                      <div className="flex flex-wrap items-center gap-2">
                        {!markedIds[item.id] ? (
                          <>
                            <button type="button" onClick={() => handleMarkKnown(item.id, true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"><ThumbsUp className="h-3.5 w-3.5" /> Bildim (+Puan)</button>
                            <button type="button" onClick={() => handleMarkKnown(item.id, false)} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"><ThumbsDown className="h-3.5 w-3.5" /> Bilemedim</button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><Trophy className="h-3.5 w-3.5" /> Kaydedildi — Skorunuz: %{quizScore.score} ({quizScore.known}/{quizScore.total})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.id)}
                          className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                        >
                          Cevabı Gizle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
