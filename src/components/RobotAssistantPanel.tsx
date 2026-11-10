"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Mic, MicOff, Volume2, VolumeX, Trash2, Sparkles, BookOpenCheck,
  Lightbulb, X, Loader2, Square, Copy, Check, ThumbsUp, ThumbsDown, Calculator,
  FileText, GraduationCap, Zap, Gauge, Share2,
} from "lucide-react";
import type { ChatMessageItem, WorkspaceTab } from "@/types/hr";
import type { ChatCitation } from "@/db/schema";
import { speakTurkish, stopSpeaking } from "@/lib/speech";

export interface SuggestionItem {
  kind: string;
  label: string;
  prompt: string;
}

interface RobotAssistantPanelProps {
  messages: ChatMessageItem[];
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
  onCitationClick: (citation: ChatCitation) => void;
  queuedPrompt: string | null;
  onClearQueuedPrompt: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenTab?: (tab: WorkspaceTab) => void;
  suggestionPool?: SuggestionItem[];
}

function normalizeTr(text: string): string {
  return text.replace(/İ/g, "i").toLowerCase().replace(/ı/g, "i").replace(/İ/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
}

type RobotModeUi = "hizli" | "detayli" | "adim" | "ornek" | "belge";

const MODES: { id: RobotModeUi; label: string; desc: string }[] = [
  { id: "detayli", label: "Detaylı", desc: "Madde madde tam açıklama" },
  { id: "hizli", label: "Hızlı", desc: "3-4 cümlede net yanıt" },
  { id: "adim", label: "Adım Adım", desc: "Uygulama rehberi" },
  { id: "ornek", label: "Örnekli", desc: "Vaka ağırlıklı anlatım" },
  { id: "belge", label: "Belge", desc: "Yazı/tutanak taslağı" },
];

const QUICK_ACTIONS = [
  { icon: <Calculator className="h-4 w-4" />, label: "Kıdem Hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { icon: <GraduationCap className="h-4 w-4" />, label: "Quiz Başlat", prompt: "Bana bir quiz sorusu sor", color: "bg-violet-50 text-violet-800 border-violet-200" },
  { icon: <FileText className="h-4 w-4" />, label: "Savunma Yazısı", prompt: "Bana savunma istemi yazısı taslağı hazırla", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { icon: <Zap className="h-4 w-4" />, label: "Onboarding Listesi", prompt: "İşe giriş onboarding kontrol listesi hazırla", color: "bg-sky-50 text-sky-800 border-sky-200" },
];

const STARTER_PROMPTS = [
  "4857 ihbar süreleri nelerdir?",
  "İbraname ne zaman geçerlidir?",
  "3 yıl çalıştım brüt 60 bin kıdemim ne kadar?",
  "STAR metodu nasıl uygulanır, örnek ver?",
  "Maaş haczi ve nafaka sırası nasıl kesilir?",
  "Beni quiz yap",
];

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function renderFormattedText(text: string) {
  return text.split("\n").map((line, idx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
        {parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={pIdx} className="italic text-slate-700">{part.slice(1, -1)}</em>;
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        })}
      </p>
    );
  });
}

export function RobotAssistantPanel({ messages, onMessagesChange, onCitationClick, queuedPrompt, onClearQueuedPrompt, mobileOpen, onCloseMobile, onOpenTab, suggestionPool = [] }: RobotAssistantPanelProps) {
  const [input, setInput] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const liveSuggestions = React.useMemo(() => {
    const q = normalizeTr(input.trim());
    if (q.length < 2 || !suggestionPool.length) return [];
    const words = q.split(/\s+/).filter((w) => w.length >= 2);
    return suggestionPool
      .map((s) => {
        const hay = normalizeTr(`${s.label} ${s.prompt}`);
        const hit = words.filter((w) => hay.includes(w)).length;
        const startsHit = hay.split(" ").some((hw) => words.some((w) => hw.startsWith(w.slice(0, 4)) || w.startsWith(hw.slice(0, 4))));
        return { s, score: hit * 2 + (startsHit ? 1 : 0) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.s);
  }, [input, suggestionPool]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RobotModeUi>("detayli");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("robot-mode") as RobotModeUi | null;
    if (savedMode && MODES.some((m) => m.id === savedMode)) setMode(savedMode);
    const savedRate = Number(localStorage.getItem("robot-rate"));
    if (savedRate >= 0.8 && savedRate <= 1.3) setSpeechRate(savedRate);
    setAutoSpeak(localStorage.getItem("robot-autospeak") !== "0");
  }, []);

  useEffect(() => { scrollEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const speak = (id: number, content: string, exampleBox?: string | null) => {
    const text = exampleBox ? `${content}. Örnek: ${exampleBox}` : content;
    setSpeakingMsgId(id);
    speakTurkish(text, { rate: speechRate, onEnd: () => setSpeakingMsgId(null), onError: () => setSpeakingMsgId(null) });
  };

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;
    setInput("");
    setLoading(true);
    setVoiceNote(null);
    stopSpeaking();
    setSpeakingMsgId(null);

    // Optimistic user bubble
    const tempId = -Date.now();
    onMessagesChange((prev) => [...prev, { id: tempId, sessionId: "default", role: "user", content: trimmed, citations: [], exampleBox: null, mode, intent: "kullanici", followUps: [], feedback: null, createdAt: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, mode }),
      });
      if (!res.ok) throw new Error("Yanıt alınamadı");
      const data = await res.json();
      if (data.userMessage && data.assistantMessage) {
        onMessagesChange((prev) => [...prev.filter((m) => m.id !== tempId), data.userMessage, data.assistantMessage]);
        if (data.action?.type === "open_tab" && onOpenTab) {
          onOpenTab(data.action.tab as WorkspaceTab);
          if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
        }
        if (autoSpeak) speak(data.assistantMessage.id, data.assistantMessage.content, data.assistantMessage.exampleBox);
      }
    } catch {
      onMessagesChange((prev) => prev.filter((m) => m.id !== tempId));
      setVoiceNote("Robot şu an yanıt veremedi. İnternet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queuedPrompt) {
      sendQuestion(queuedPrompt);
      onClearQueuedPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedPrompt]);

  const handleFeedback = async (msg: ChatMessageItem, fb: "up" | "down") => {
    onMessagesChange((prev) => prev.map((m) => (m.id === msg.id ? { ...m, feedback: m.feedback === fb ? null : fb } : m)));
    await fetch("/api/chat", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id, feedback: msg.feedback === fb ? null : fb }) }).catch(() => undefined);
  };

  const handleCopy = async (msg: ChatMessageItem) => {
    try {
      await navigator.clipboard.writeText(`${msg.content}\n\nÖrnek: ${msg.exampleBox || ""}\n\n— İK & Mevzuat Akademisi (Cihan Ahtik)`);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch { /* ignore */ }
  };

  const handleShare = async (msg: ChatMessageItem) => {
    const text = `${msg.content}\n\nÖrnek: ${msg.exampleBox || ""}`;
    if (navigator.share) {
      await navigator.share({ title: "İK & Mevzuat Yanıtı", text }).catch(() => undefined);
    } else {
      handleCopy(msg);
    }
  };

  const handleToggleMic = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    if (typeof window === "undefined") return;
    const win = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceNote("Tarayıcınız sesle yazmayı desteklemiyor; yazarak sorabilirsiniz, sesli yanıt özelliği aktiftir.");
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = "tr-TR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = "";
    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i] as unknown as ArrayLike<{ transcript: string }> & { isFinal: boolean };
        if (result.isFinal) finalText += result[0].transcript;
        else setInput(result[0].transcript);
      }
      if (finalText) {
        setInput(finalText);
        setListening(false);
        sendQuestion(finalText);
      }
    };
    recognition.onerror = () => { setListening(false); setVoiceNote("Mikrofon algılanamadı veya izin verilmedi."); };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setVoiceNote("🎙️ Dinliyorum... Konuşmanız bitince sorunuz otomatik gönderilir.");
    setListening(true);
    recognition.start();
  };

  const handleClearChat = async () => {
    stopSpeaking();
    setSpeakingMsgId(null);
    await fetch("/api/chat", { method: "DELETE" });
    onMessagesChange([]);
  };

  return (
    <aside className={`flex flex-col border-l border-slate-200/90 bg-white ${mobileOpen ? "fixed inset-0 z-40 w-full shadow-2xl lg:static lg:max-w-md lg:shadow-none" : "hidden lg:flex lg:w-[410px] xl:w-[440px]"} shrink-0`} aria-label="İK Mevzuat Robotu">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="Robot" className="h-10 w-10 rounded-xl ring-1 ring-indigo-300/40" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">İK Robotu <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-300 ring-1 ring-emerald-300/30">PRO v2</span></h2>
              <p className="text-[11px] text-indigo-200">Hesap yapar • Belge hazırlar • Quiz sorar • Sesli konuşur</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowSettings(!showSettings)} className={`rounded-lg p-2 transition ${showSettings ? "bg-white/20 text-white" : "text-slate-300 hover:bg-white/10"}`} title="Robot Ayarları"><Gauge className="h-4 w-4" /></button>
            {messages.length > 0 && (
              <button type="button" onClick={handleClearChat} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" title="Sohbeti Temizle"><Trash2 className="h-4 w-4" /></button>
            )}
            {mobileOpen && onCloseMobile && (
              <button type="button" onClick={onCloseMobile} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden" title="Kapat"><X className="h-4 w-4" /></button>
            )}
          </div>
        </div>

        {/* Mode selector */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5" role="tablist" aria-label="Yanıt modu">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} title={m.desc} onClick={() => { setMode(m.id); localStorage.setItem("robot-mode", m.id); }} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${mode === m.id ? "bg-white text-slate-900" : "bg-white/10 text-indigo-100 hover:bg-white/20"}`}>{m.label}</button>
          ))}
        </div>

        {showSettings && (
          <div className="mt-3 space-y-2 rounded-xl bg-white/10 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-indigo-100">Otomatik sesli yanıt</span>
              <button type="button" onClick={() => { const n = !autoSpeak; setAutoSpeak(n); localStorage.setItem("robot-autospeak", n ? "1" : "0"); if (!n) { stopSpeaking(); setSpeakingMsgId(null); } }} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${autoSpeak ? "bg-emerald-400/25 text-emerald-200" : "bg-white/10 text-slate-300"}`}>{autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}{autoSpeak ? "Açık" : "Kapalı"}</button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-indigo-100">Konuşma hızı: {speechRate.toFixed(1)}x</span>
              <input type="range" min="0.8" max="1.3" step="0.1" value={speechRate} onChange={(e) => { const v = Number(e.target.value); setSpeechRate(v); localStorage.setItem("robot-rate", String(v)); }} className="w-32 accent-emerald-400" aria-label="Konuşma hızı" />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
        {messages.length === 0 ? (
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700"><Sparkles className="h-4 w-4" /> Merhaba! Ben İK Robotu PRO</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">12 kanunu, 24 İK tekniği/metodunu tararım; ayrıca <strong className="text-slate-800">kıdem-ihbar-maaş hesabı</strong> yapar, <strong className="text-slate-800">resmî yazı taslağı</strong> hazırlar ve <strong className="text-slate-800">quiz</strong> sorarım. Yazın ya da mikrofonla konuşun; isterseniz sesli yanıt vereyim.</p>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Hızlı İşlemler</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.label} type="button" onClick={() => sendQuestion(a.prompt)} className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-bold shadow-2xs transition hover:shadow ${a.color}`}>{a.icon}{a.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Örnek Sorular</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => sendQuestion(prompt)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800">{prompt}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            const isSpeaking = speakingMsgId === msg.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div className={`max-w-[94%] rounded-2xl px-4 py-3 shadow-2xs ${isUser ? "rounded-br-sm bg-slate-900 text-xs text-white" : "rounded-bl-sm border border-slate-200/90 bg-white text-slate-700"}`}>
                  {isUser ? (
                    <p className="leading-relaxed">{msg.content}</p>
                  ) : (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700"><Bot className="h-3.5 w-3.5" /> Robot Yanıtı</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { if (isSpeaking) { stopSpeaking(); setSpeakingMsgId(null); } else speak(msg.id, msg.content, msg.exampleBox); }} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${isSpeaking ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>{isSpeaking ? <><Square className="h-2.5 w-2.5 fill-current" /> Durdur</> : <><Volume2 className="h-3 w-3" /> Dinle</>}</button>
                          <button type="button" onClick={() => handleCopy(msg)} className="rounded-md bg-slate-100 p-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700" title="Yanıtı kopyala">{copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}</button>
                          <button type="button" onClick={() => handleShare(msg)} className="rounded-md bg-slate-100 p-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700" title="Paylaş"><Share2 className="h-3 w-3" /></button>
                        </div>
                      </div>

                      <div className="text-[12.5px] leading-relaxed">{renderFormattedText(msg.content)}</div>

                      {msg.exampleBox && (
                        <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800"><Lightbulb className="h-3.5 w-3.5" /> {msg.intent === "belge" || msg.intent === "hesap-kidem-bilgi" ? "Taslak / Rehber" : "Örnek Senaryo"}</div>
                          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-amber-950/90">{msg.exampleBox}</p>
                        </div>
                      )}

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                          {msg.citations.map((cit, idx) => (
                            <button key={`${cit.ref}-${idx}`} type="button" onClick={() => onCitationClick(cit)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200/70 transition hover:bg-indigo-100"><BookOpenCheck className="h-3 w-3" />{cit.title}</button>
                          ))}
                        </div>
                      )}

                      {msg.id > 0 && (
                        <div className="mt-2.5 flex items-center gap-1 border-t border-slate-100 pt-2">
                          <span className="mr-1 text-[10px] font-medium text-slate-400">Yanıt faydalı mı?</span>
                          <button type="button" onClick={() => handleFeedback(msg, "up")} className={`rounded-md p-1.5 transition ${msg.feedback === "up" ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:bg-slate-100 hover:text-emerald-600"}`} title="Faydalı"><ThumbsUp className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => handleFeedback(msg, "down")} className={`rounded-md p-1.5 transition ${msg.feedback === "down" ? "bg-rose-100 text-rose-700" : "text-slate-400 hover:bg-slate-100 hover:text-rose-600"}`} title="Geliştirilmeli"><ThumbsDown className="h-3.5 w-3.5" /></button>
                        </div>
                      )}

                      {msg.followUps && msg.followUps.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.followUps.map((f, i) => (
                            <button key={i} type="button" onClick={() => sendQuestion(f.prompt)} className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white">{f.label}</button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-2xs">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Kanunlar taranıyor<span className="animate-pulse">...</span></span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {voiceNote && <p className="mb-2 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">{voiceNote}</p>}

        {/* Canlı "Bunu mu demek istediniz?" önerileri */}
        {suggestOpen && liveSuggestions.length > 0 && (
          <div className="absolute inset-x-3 bottom-full z-20 mb-1 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-2xl">
            <p className="flex items-center gap-1.5 border-b border-slate-100 bg-indigo-50/60 px-3 py-2 text-[11px] font-bold text-indigo-800"><Sparkles className="h-3.5 w-3.5" /> Bunu mu demek istediniz?</p>
            {liveSuggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => { setSuggestOpen(false); sendQuestion(s.prompt); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition hover:bg-indigo-50">
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{s.kind}</span>
                <span className="truncate font-medium text-slate-800">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); setSuggestOpen(false); sendQuestion(input); }} className="flex items-center gap-2">
          <button type="button" onClick={handleToggleMic} className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${listening ? "border-rose-300 bg-rose-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"}`} title={listening ? "Dinlemeyi durdur" : "Sesli soru sor"} aria-label="Mikrofon">
            {listening && <span className="animate-pulse-ring absolute inset-0 rounded-2xl bg-rose-400" />}
            {listening ? <MicOff className="relative z-10 h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input type="text" value={input} onChange={(e) => { setInput(e.target.value); setSuggestOpen(true); }} onFocus={() => setSuggestOpen(true)} placeholder="Sor, hesaplat, belge iste..." enterKeyHint="send" className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" aria-label="Sorunuz" />
          <button type="submit" disabled={loading || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" title="Gönder" aria-label="Gönder"><Send className="h-4 w-4" /></button>
        </form>
        <p className="mt-2 text-center text-[10px] text-slate-400">Yanıtlar bilgilendirme amaçlıdır • Cihan Ahtik İK Akademisi</p>
      </div>
    </aside>
  );
}
