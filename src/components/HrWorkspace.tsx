"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, Scale, Briefcase, Compass, HelpCircle, Bot, Sparkles, Loader2, AlertCircle,
  Calculator, FileText, Rocket, Search, Home, Hash, Trophy, Download, UserRound, Megaphone,
} from "lucide-react";
import type {
  WorkspaceTab, LawItem, HrTopicItem, QuestionItem, DailyInsightItem, BookmarkItem, ChatMessageItem, SgkCodeItem,
} from "@/types/hr";
import type { ChatCitation } from "@/db/schema";
import type { ProductParams } from "@/lib/calculators";
import { SplashAttributionModal } from "./SplashAttributionModal";
import { DailyBriefingView } from "./DailyBriefingView";
import { LawsView } from "./LawsView";
import { TopicsView } from "./TopicsView";
import { QuestionsView } from "./QuestionsView";
import { RobotAssistantPanel } from "./RobotAssistantPanel";
import { CalculatorsView } from "./CalculatorsView";
import { TemplatesView } from "./TemplatesView";
import { SgkCodesView } from "./SgkCodesView";
import { QuizMode } from "./QuizMode";
import { DownloadCenter } from "./DownloadCenter";
import { AnnouncementsPanel } from "./AnnouncementsPanel";
import { PwaManager } from "./PwaManager";
import { PlayStoreGuide } from "./PlayStoreGuide";

const VALID_TABS: WorkspaceTab[] = [
  "daily", "laws", "techniques", "methods", "questions", "calculators", "templates", "sgk", "quiz", "downloads",
];

interface Branding {
  appName: string;
  tagline: string;
  footerNote: string;
  supportEmail: string;
  announcement: string;
}

const DEFAULT_BRANDING: Branding = {
  appName: "İK & Mevzuat Akademisi",
  tagline: "Bu uygulama Cihan Ahtik tarafından yapılmıştır.",
  footerNote: "12 Kanun • SGK Çıkış Kodları • 10 İK Tekniği • 14 Metot • Yasal Süreler • Word/Excel Belgeler • Sesli Robot PRO",
  supportEmail: "",
  announcement: "",
};

export function HrWorkspace() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayGuide, setShowPlayGuide] = useState(false);

  const [todayInsight, setTodayInsight] = useState<DailyInsightItem | null>(null);
  const [recentInsights, setRecentInsights] = useState<DailyInsightItem[]>([]);
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [techniques, setTechniques] = useState<HrTopicItem[]>([]);
  const [methods, setMethods] = useState<HrTopicItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [params, setParams] = useState<ProductParams | null>(null);
  const [sgkCodes, setSgkCodes] = useState<SgkCodeItem[]>([]);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  const [selectedLawSlug, setSelectedLawSlug] = useState<string | null>(null);
  const [selectedTechSlug, setSelectedTechSlug] = useState<string | null>(null);
  const [selectedMethodSlug, setSelectedMethodSlug] = useState<string | null>(null);
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);
  const [mobileRobotOpen, setMobileRobotOpen] = useState(false);

  const [globalQuery, setGlobalQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    if (param === "robot") setMobileRobotOpen(true);
    else if (param && VALID_TABS.includes(param as WorkspaceTab)) setActiveTab(param as WorkspaceTab);
    if (sessionStorage.getItem("splash-seen")) setShowSplash(false);

    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/overview", { cache: "no-store" });
        if (!res.ok) throw new Error("Veritabanı verileri alınamadı.");
        const data = await res.json();
        if (!active) return;
        setTodayInsight(data.todayInsight || null);
        setRecentInsights(data.recentInsights || []);
        setLaws(data.laws || []);
        setTechniques(data.techniques || []);
        setMethods(data.methods || []);
        setQuestions(data.questions || []);
        setBookmarks(data.bookmarks || []);
        setChatMessages(data.chatMessages || []);
        setParams(data.params || null);
        setSgkCodes(data.sgkCodes || []);
        setBranding({ ...DEFAULT_BRANDING, ...(data.branding ?? {}) });
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const lawHits = laws.filter((l) => l.title.toLowerCase().includes(q) || l.lawNumber.includes(q) || l.keywords.some((k) => k.toLowerCase().includes(q))).slice(0, 4)
      .map((l) => ({ kind: "Kanun", title: l.title, act: () => { setSelectedLawSlug(l.slug); setActiveTab("laws"); } }));
    const techHits = techniques.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3)
      .map((t) => ({ kind: "İK Tekniği", title: t.title, act: () => { setSelectedTechSlug(t.slug); setActiveTab("techniques"); } }));
    const methodHits = methods.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3)
      .map((t) => ({ kind: "Metot", title: t.title, act: () => { setSelectedMethodSlug(t.slug); setActiveTab("methods"); } }));
    const sgkHits = sgkCodes.filter((c) => c.code.includes(q) || c.title.toLowerCase().includes(q)).slice(0, 3)
      .map((c) => ({ kind: "SGK Kodu", title: `${c.code} — ${c.title}`, act: () => setActiveTab("sgk") }));
    const qHits = questions.filter((x) => x.question.toLowerCase().includes(q)).slice(0, 3)
      .map((x) => ({ kind: "Soru", title: x.question, act: () => setActiveTab("questions") }));
    return [...lawHits, ...techHits, ...methodHits, ...sgkHits, ...qHits];
  }, [globalQuery, laws, techniques, methods, questions, sgkCodes]);

  const handleToggleBookmark = async (itemType: "law" | "technique" | "method" | "question", itemId: number, title: string) => {
    const res = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemType, itemId, title }) });
    if (res.ok) {
      const data = await res.json();
      if (data.removed) setBookmarks((prev) => prev.filter((b) => !(b.itemType === itemType && b.itemId === itemId)));
      else if (data.bookmark) setBookmarks((prev) => [data.bookmark, ...prev]);
    }
  };

  const handleUpdateInsight = (updated: DailyInsightItem) => {
    if (todayInsight?.id === updated.id) setTodayInsight(updated);
    setRecentInsights((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAskRobot = (prompt: string) => { setQueuedPrompt(prompt); setMobileRobotOpen(true); };

  const handleCitationClick = (cit: ChatCitation) => {
    if (cit.type === "kanun") { setSelectedLawSlug(cit.ref); setActiveTab("laws"); }
    else if (cit.type === "teknik") { setSelectedTechSlug(cit.ref); setActiveTab("techniques"); }
    else if (cit.type === "metot") { setSelectedMethodSlug(cit.ref); setActiveTab("methods"); }
    else if (cit.type === "soru") setActiveTab("questions");
    setMobileRobotOpen(false);
  };

  const handleJumpToLaw = (lawNumber: string) => {
    const found = laws.find((l) => l.lawNumber === lawNumber);
    if (found) { setSelectedLawSlug(found.slug); setActiveTab("laws"); }
  };

  const closeSplash = () => { sessionStorage.setItem("splash-seen", "1"); setShowSplash(false); };

  const navTabs: { id: WorkspaceTab; label: string; badge?: number; icon: React.ReactNode }[] = [
    { id: "daily", label: "Günlük Bilgi", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "laws", label: "Kanunlar", badge: laws.length, icon: <Scale className="h-4 w-4" /> },
    { id: "techniques", label: "İK Teknikleri", badge: techniques.length, icon: <Briefcase className="h-4 w-4" /> },
    { id: "methods", label: "Metotlar", badge: methods.length, icon: <Compass className="h-4 w-4" /> },
    { id: "questions", label: "Sorular", badge: questions.length, icon: <HelpCircle className="h-4 w-4" /> },
    { id: "sgk", label: "SGK Kodları", badge: sgkCodes.length, icon: <Hash className="h-4 w-4" /> },
    { id: "quiz", label: "Test", icon: <Trophy className="h-4 w-4" /> },
    { id: "calculators", label: "Hesaplayıcılar", icon: <Calculator className="h-4 w-4" /> },
    { id: "templates", label: "Şablonlar", icon: <FileText className="h-4 w-4" /> },
    { id: "downloads", label: "İndirme Merkezi", icon: <Download className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] lg:h-screen lg:overflow-hidden">
      <SplashAttributionModal open={showSplash} onClose={closeSplash} />
      <PlayStoreGuide open={showPlayGuide} onClose={() => setShowPlayGuide(false)} />
      <PwaManager />

      {branding.announcement && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          <Megaphone className="h-4 w-4 shrink-0" /> {branding.announcement}
        </div>
      )}

      <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="İK Akademisi" className="h-10 w-10 rounded-xl shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">{branding.appName}</h1>
                <button type="button" onClick={() => setShowSplash(true)} className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 sm:inline-flex" title="Uygulama künyesi">
                  <Sparkles className="h-3 w-3" /> Cihan Ahtik
                </button>
              </div>
              <p className="text-[11px] text-slate-500">{branding.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div ref={searchRef} className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalQuery}
                onChange={(e) => { setGlobalQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Kanun, metot, SGK kodu, soru..."
                className="h-9 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none xl:w-72"
                aria-label="Genel arama"
              />
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  {searchResults.map((r, i) => (
                    <button key={i} type="button" onClick={() => { r.act(); setSearchOpen(false); setGlobalQuery(""); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs hover:bg-indigo-50">
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{r.kind}</span>
                      <span className="truncate font-medium text-slate-800">{r.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="/hesabim" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" title="Hesabım / Üye girişi">
              <UserRound className="h-4 w-4" /> <span className="hidden sm:inline">Hesabım</span>
            </a>
            <a href="/kayit" className="hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 sm:inline-flex">
              <UserRound className="h-4 w-4" /> Kayıt Ol
            </a>
            <button type="button" onClick={() => setShowPlayGuide(true)} className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 lg:inline-flex" title="Google Play yayın rehberi">
              <Rocket className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setMobileRobotOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 lg:hidden">
              <Bot className="h-4 w-4" /> İK Robotu
            </button>
          </div>
        </div>

        <nav aria-label="Ana bölümler" className="mx-auto hidden flex-wrap items-center gap-1.5 px-4 pb-3 sm:px-6 md:flex">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${active ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"}`}>
                {tab.icon}<span>{tab.label}</span>
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${active ? "bg-white/20 text-white" : "bg-white text-slate-700"}`}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 lg:pb-5">
          <div className="mx-auto max-w-5xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-2xs">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm font-semibold text-slate-800">İK Akademisi Yükleniyor...</p>
                <p className="mt-1 text-xs text-slate-500">12 Kanun • SGK Kodları • Test • İndirme Merkezi • Robot PRO</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div><p className="font-semibold">Bağlantı Hatası</p><p className="mt-0.5 text-xs">{error}</p></div>
              </div>
            ) : (
              <>
                {activeTab === "daily" && (
                  <>
                    <DailyBriefingView
                      todayInsight={todayInsight}
                      recentInsights={recentInsights}
                      bookmarks={bookmarks}
                      counts={{ laws: laws.length, techniques: techniques.length, methods: methods.length, questions: questions.length }}
                      onNavigateTab={setActiveTab}
                      onUpdateInsight={handleUpdateInsight}
                      onAskRobot={handleAskRobot}
                    />
                    <div className="mt-6"><AnnouncementsPanel /></div>
                  </>
                )}
                {activeTab === "laws" && (
                  <LawsView laws={laws} bookmarks={bookmarks} selectedSlug={selectedLawSlug} onSelectSlug={setSelectedLawSlug} onToggleBookmark={handleToggleBookmark} onAskRobot={handleAskRobot} />
                )}
                {activeTab === "techniques" && (
                  <TopicsView mode="technique" topics={techniques} bookmarks={bookmarks} selectedSlug={selectedTechSlug} onSelectSlug={setSelectedTechSlug} onToggleBookmark={handleToggleBookmark} onJumpToLaw={handleJumpToLaw} onAskRobot={handleAskRobot} />
                )}
                {activeTab === "methods" && (
                  <TopicsView mode="method" topics={methods} bookmarks={bookmarks} selectedSlug={selectedMethodSlug} onSelectSlug={setSelectedMethodSlug} onToggleBookmark={handleToggleBookmark} onJumpToLaw={handleJumpToLaw} onAskRobot={handleAskRobot} />
                )}
                {activeTab === "questions" && (
                  <QuestionsView questions={questions} onQuestionAdded={(q) => setQuestions((prev) => [...prev, q])} onAskRobot={handleAskRobot} />
                )}
                {activeTab === "sgk" && <SgkCodesView codes={sgkCodes} onAskRobot={handleAskRobot} />}
                {activeTab === "quiz" && <QuizMode questions={questions} onAskRobot={handleAskRobot} />}
                {activeTab === "calculators" && <CalculatorsView onAskRobot={handleAskRobot} params={params ?? undefined} />}
                {activeTab === "templates" && <TemplatesView onAskRobot={handleAskRobot} />}
                {activeTab === "downloads" && (
                  <DownloadCenter
                    laws={laws}
                    techniques={techniques}
                    methods={methods}
                    questions={questions}
                    sgkCodes={sgkCodes}
                    insights={recentInsights}
                    onGoTab={(t) => setActiveTab(t as WorkspaceTab)}
                  />
                )}
              </>
            )}

            <footer className="mt-8 border-t border-slate-200/80 pb-6 pt-4 text-center text-xs text-slate-500">
              <p>
                Bu uygulama <strong className="text-slate-700">Cihan Ahtik</strong> tarafından yapılmıştır. • {branding.footerNote}
              </p>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-3">
                {branding.supportEmail && <a href={`mailto:${branding.supportEmail}`} className="font-semibold text-indigo-700 hover:underline">{branding.supportEmail}</a>}
                <a href="/kayit" className="font-semibold text-indigo-700 hover:underline">Kayıt Ol</a>
                <a href="/hesabim" className="font-semibold text-indigo-700 hover:underline">Hesabım</a>
                <a href="/admin" className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline"><Home className="h-3 w-3" /> Yönetici Paneli</a>
              </p>
            </footer>
          </div>
        </main>

        <RobotAssistantPanel
          messages={chatMessages}
          onMessagesChange={setChatMessages}
          onCitationClick={handleCitationClick}
          queuedPrompt={queuedPrompt}
          onClearQueuedPrompt={() => setQueuedPrompt(null)}
          mobileOpen={mobileRobotOpen}
          onCloseMobile={() => setMobileRobotOpen(false)}
          onOpenTab={setActiveTab}
          suggestionPool={[
            ...laws.map((l) => ({ kind: "Kanun", label: `${l.lawNumber} — ${l.title}`, prompt: `${l.title} (${l.lawNumber}) hakkında bilgi ver, örnekle anlat` })),
            ...techniques.map((t) => ({ kind: "İK Tekniği", label: t.title, prompt: `${t.title} nedir, örnekle anlatır mısın?` })),
            ...methods.map((t) => ({ kind: "Metot", label: t.title, prompt: `${t.title} nedir, örnekle anlatır mısın?` })),
            ...sgkCodes.map((c) => ({ kind: "SGK", label: `SGK ${c.code} — ${c.title}`, prompt: `SGK ${c.code} çıkış kodu nedir?` })),
            ...questions.map((q) => ({ kind: "Soru", label: q.question, prompt: q.question })),
            { kind: "Hesap", label: "Kıdem tazminatı hesapla", prompt: "4 yıl çalıştım, brüt ücretim 70.000 TL, kıdem tazminatım ne kadar?" },
            { kind: "Süre", label: "Haklı fesih için kaç iş günü var?", prompt: "Haklı nedenle fesih için kaç iş günü var?" },
            { kind: "Güncel", label: "Güncel kıdem tavanı ne kadar?", prompt: "Güncel kıdem tazminatı tavanı ne kadar?" },
            { kind: "Belge", label: "Savunma yazısı taslağı hazırla", prompt: "Bana savunma istemi yazısı taslağı hazırla" },
            { kind: "Quiz", label: "Bana quiz sorusu sor", prompt: "Bana bir quiz sorusu sor" },
          ]}
        />
      </div>

      <nav aria-label="Mobil alt menü" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5">
          <MobileNavBtn active={activeTab === "daily"} onClick={() => setActiveTab("daily")} icon={<Home className="h-5 w-5" />} label="Ana Sayfa" />
          <MobileNavBtn active={activeTab === "laws"} onClick={() => setActiveTab("laws")} icon={<Scale className="h-5 w-5" />} label="Kanunlar" />
          <button type="button" onClick={() => setMobileRobotOpen(true)} className="relative flex flex-col items-center justify-center py-1.5" aria-label="İK Robotunu aç">
            <span className="flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg ring-4 ring-white"><Bot className="h-5 w-5" /></span>
            <span className="-mt-2 text-[10px] font-bold text-indigo-700">Robot</span>
          </button>
          <MobileNavBtn active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")} icon={<Trophy className="h-5 w-5" />} label="Test" />
          <MobileNavBtn active={activeTab === "downloads"} onClick={() => setActiveTab("downloads")} icon={<Download className="h-5 w-5" />} label="İndir" />
        </div>
      </nav>
    </div>
  );
}

function MobileNavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center gap-0.5 py-2 transition ${active ? "text-indigo-700" : "text-slate-500"}`} aria-current={active ? "page" : undefined}>
      {icon}<span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
