"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, Scale, Bot, FileText, FileSpreadsheet, FileDown, RotateCcw, ArrowRight, Trophy, ChevronRight } from "lucide-react";
import type { DocFormat } from "@/lib/documents";
import type { QuestionItem } from "@/types/hr";
import { buildQuizOptions, type QuizOption } from "@/lib/quiz";
import { downloadDocumentSafe, type DocModel } from "@/lib/documents";

interface QuizModeProps {
  questions: QuestionItem[];
  onAskRobot: (prompt: string) => void;
}

type Result = {
  question: QuestionItem;
  chosen: number;
  correctIndex: number;
  correct: boolean;
};

const CATS = [
  { id: "all", label: "Tümü" },
  { id: "kanun", label: "Kanunlar" },
  { id: "teknik", label: "İK Teknikleri" },
  { id: "metot", label: "Metotlar" },
];

export function QuizMode({ questions, onAskRobot }: QuizModeProps) {
  const [cat, setCat] = useState("all");
  const [difficulty, setDifficulty] = useState("Tümü");
  const [queue, setQueue] = useState<QuestionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<{ total: number; correct: number; score: number }>({ total: 0, correct: 0, score: 0 });

  const pool = useMemo(
    () =>
      questions.filter((q) => {
        if (cat !== "all" && q.category !== cat) return false;
        if (difficulty !== "Tümü" && q.difficulty !== difficulty) return false;
        return true;
      }),
    [questions, cat, difficulty]
  );

  useEffect(() => {
    fetch("/api/quiz", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { total?: number; correct?: number; score?: number }) =>
        setStats({ total: d.total ?? 0, correct: d.correct ?? 0, score: d.score ?? 0 })
      )
      .catch(() => undefined);
  }, [results]);

  const shuffled = useMemo(() => {
    // Her turda sırayı değiştir
    const arr = [...pool];
    let s = round * 7919 + 104729;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 10);
  }, [pool, round]);

  const current = queue[index] ?? null;
  const options: QuizOption[] = current ? buildQuizOptions(current, questions, round) : [];
  const correctIndex = options.findIndex((o) => o.correct);
  const answered = selected !== null;

  const start = (list: QuestionItem[] = shuffled) => {
    if (list.length === 0) return;
    setQueue(list);
    setIndex(0);
    setSelected(null);
    setResults([]);
    setStarted(true);
    setFinished(false);
  };

  const choose = async (i: number) => {
    if (answered || !current) return;
    setSelected(i);
    const correct = options[i]?.correct === true;
    const result: Result = { question: current, chosen: i, correctIndex, correct };
    setResults((prev) => [...prev, result]);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: current.id,
          isCorrect: correct,
          chosenOption: options[i]?.text ?? "",
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { total?: number; correct?: number; score?: number };
      if (res.ok) setStats({ total: d.total ?? 0, correct: d.correct ?? 0, score: d.score ?? 0 });
    } catch {
      /* çevrimdışı: yerel sonuçlar korunur */
    }
  };

  const next = () => {
    if (index + 1 >= queue.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setStarted(false);
    setFinished(false);
    setSelected(null);
    setResults([]);
    setTimeout(() => start(), 0);
  };

  const retryWrong = () => {
    const wrong = results.filter((r) => !r.correct).map((r) => r.question);
    if (wrong.length === 0) return;
    setRound((r) => r + 1);
    start(wrong);
  };

  const localCorrect = results.filter((r) => r.correct).length;

  const exportResults = (format: DocFormat) => {
    const model: DocModel = {
      title: "İK & Mevzuat Test Sonuçları",
      subtitle: `${results.length} soru • ${localCorrect} doğru • %${results.length ? Math.round((localCorrect / results.length) * 100) : 0} başarı • Cihan Ahtik`,
      fileName: "test-sonuclari",
      blocks: [
        {
          type: "table",
          sheetName: "Sonuçlar",
          headers: ["Soru", "Verilen Cevap", "Doğru Cevap", "Sonuç", "Yasal Dayanak", "Açıklama"],
          rows: results.map((r) => [
            r.question.question,
            r.chosen >= 0 ? (r.chosen === r.correctIndex ? "Doğru cevap seçildi" : "Yanlış seçenek") : "—",
            r.question.shortAnswer,
            r.correct ? "Doğru" : "Yanlış",
            r.question.legalBasis,
            r.question.detailedAnswer,
          ]),
        },
      ],
    };
    void downloadDocumentSafe(format, model);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Trophy className="h-5 w-5 text-amber-300" /> Çoktan Seçmeli İK &amp; Mevzuat Testi
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Her soruda 4 seçenek var. Yanlış seçerseniz doğru cevabı, yasal dayanağı, ayrıntılı açıklamayı ve örnek senaryoyu hemen görürsünüz.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold">Genel başarı: %{stats.score}</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold">{stats.total} cevap • {stats.correct} doğru</span>
          <span className="rounded-lg bg-emerald-400/15 px-2.5 py-1 font-semibold text-emerald-200">Bu test: {localCorrect}/{results.length}</span>
        </div>
      </div>

      {/* Filtreler ve başlat */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                cat === c.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="ml-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="Tümü">Tüm seviyeler</option>
            <option value="Temel">Temel</option>
            <option value="Orta">Orta</option>
            <option value="İleri">İleri</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => start()}
            disabled={pool.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {started ? "Yeniden başlat" : "Testi başlat"} <ChevronRight className="h-4 w-4" />
          </button>
          <span className="self-center text-[11px] text-slate-500">{pool.length} uygun soru</span>
        </div>
      </div>

      {!started && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-800">Teste hazır mısınız?</p>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-500">
            En fazla 10 soru sorulur. Cevabınızı seçtikten sonra doğru/yanlış geri bildirimi, kanun maddesi ve örnek vaka gösterilir. Sonuçlar
            kaydedilir ve Word/Excel/PDF olarak indirilebilir.
          </p>
        </div>
      )}

      {started && finished && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {localCorrect} / {results.length} doğru
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">
              Başarı: %{results.length ? Math.round((localCorrect / results.length) * 100) : 0}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700">
              <RotateCcw className="h-4 w-4" /> Yeni test
            </button>
            {results.some((r) => !r.correct) && (
              <button type="button" onClick={retryWrong} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">
                Yanlışları tekrar sor ({results.filter((r) => !r.correct).length})
              </button>
            )}
            <button type="button" onClick={() => exportResults("docx")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <FileText className="h-4 w-4" /> Word
            </button>
            <button type="button" onClick={() => exportResults("xlsx")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button type="button" onClick={() => exportResults("pdf")} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">
              <FileDown className="h-4 w-4" /> PDF
            </button>
          </div>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs">
                {r.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
                <span className="font-medium text-slate-800">{r.question.question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {started && !finished && current && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Soru {index + 1} / {queue.length} • {current.topicRef} • {current.difficulty}
            </span>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / queue.length) * 100}%` }} />
            </div>
          </div>
          <h3 className="mt-4 text-base font-bold leading-relaxed text-slate-900">{current.question}</h3>

          <div className="mt-5 grid gap-2.5">
            {options.map((opt, i) => {
              const isChosen = selected === i;
              const isCorrect = i === correctIndex;
              let cls = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60";
              if (answered && isCorrect) cls = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30";
              else if (answered && isChosen && !isCorrect) cls = "border-rose-500 bg-rose-50 ring-1 ring-rose-500/30";
              else if (answered) cls = "border-slate-200 bg-slate-50 opacity-60";

              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${cls}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold ${
                      answered && isCorrect
                        ? "bg-emerald-600 text-white"
                        : answered && isChosen
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-800">{opt.text}</span>
                  {answered && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
                  {answered && isChosen && !isCorrect && <XCircle className="ml-auto h-4 w-4 shrink-0 text-rose-600" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <div className={`rounded-2xl p-4 ${options[selected!]?.correct ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-rose-50 ring-1 ring-rose-200"}`}>
                <p className={`text-sm font-extrabold ${options[selected!]?.correct ? "text-emerald-800" : "text-rose-800"}`}>
                  {options[selected!]?.correct ? "✅ Doğru cevap!" : `❌ Yanlış cevap. Doğrusu: ${current.shortAnswer}`}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">{current.detailedAnswer}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                  <Scale className="h-3.5 w-3.5" /> {current.legalBasis}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  <Lightbulb className="h-3.5 w-3.5" /> Konuyu pekiştiren örnek
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-950">{current.exampleScenario}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onAskRobot(current.question)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  <Bot className="h-4 w-4" /> Robota detay sor
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  {index + 1 >= queue.length ? "Sonuçları gör" : "Sonraki soru"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
