"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, Scale, Briefcase, HelpCircle, Globe, SlidersHorizontal, Megaphone,
  Lightbulb, LogOut, KeyRound, Loader2, Save, CheckCircle2, AlertTriangle, ExternalLink,
  ShieldCheck, Home, Sparkles, Users, Hash, CalendarDays, Package, Settings, X,
} from "lucide-react";
import { AdminEntityManager } from "./AdminEntityManager";
import { AdminGoogle } from "./AdminGoogle";
import { EmployeesAdmin } from "./EmployeesAdmin";
import { UsersAdmin } from "./UsersAdmin";
import { DailyAdmin } from "./DailyAdmin";
import { ExportCenter } from "./ExportCenter";
import { BrandingAdmin } from "./BrandingAdmin";
import type { ProductParams } from "@/lib/calculators";

type Tab =
  | "dashboard" | "laws" | "topics" | "questions" | "sgk" | "employees" | "daily"
  | "users" | "exports" | "branding" | "google" | "params" | "announcements" | "features";
type AuthState = "loading" | "out" | "in";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Özet", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "laws", label: "Kanunlar", icon: <Scale className="h-4 w-4" /> },
  { id: "topics", label: "İK Teknik & Metot", icon: <Briefcase className="h-4 w-4" /> },
  { id: "questions", label: "Soru Bankası", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "sgk", label: "SGK Çıkış Kodları", icon: <Hash className="h-4 w-4" /> },
  { id: "employees", label: "Çalışan Kayıtları", icon: <Users className="h-4 w-4" /> },
  { id: "daily", label: "Günlük Bilgiler", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "users", label: "Kullanıcılar", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "exports", label: "Dışa Aktarma", icon: <Package className="h-4 w-4" /> },
  { id: "branding", label: "Site Ayarları", icon: <Settings className="h-4 w-4" /> },
  { id: "google", label: "Sheets & CSV", icon: <Globe className="h-4 w-4" /> },
  { id: "params", label: "Güncel Parametreler", icon: <SlidersHorizontal className="h-4 w-4" /> },
  { id: "announcements", label: "Duyurular & Sürümler", icon: <Megaphone className="h-4 w-4" /> },
  { id: "features", label: "Özellik Talepleri", icon: <Lightbulb className="h-4 w-4" /> },
];

const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";
const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";

export function AdminPanel() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [diag, setDiag] = useState<{ db?: string; https?: boolean; sessionDays?: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/login", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; diag?: { db?: string; https?: boolean; sessionDays?: number } }) => {
        setAuth(d.authenticated ? "in" : "out");
        setDiag(d.diag ?? null);
      })
      .catch(() => setAuth("out"));
  }, []);

  // Herhangi bir yönetici isteği 401 dönerse oturumu düşür ve kullanıcıyı bilgilendir.
  useEffect(() => {
    const original = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      // `window.fetch` bağlamsız çağrılırsa bazı tarayıcılarda "Illegal invocation"
      // hatası verir ve paneldeki tüm istekler sessizce çalışmaz. this bağını koru.
      const res = await (original as typeof fetch)(...args);
      try {
        const input = args[0];
        const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        if (res.status === 401 && url.includes("/api/admin/")) {
          window.dispatchEvent(new Event("admin-unauthorized"));
        }
      } catch {
        /* yoksay */
      }
      return res;
    };
    const onUnauthorized = () => {
      setAuth("out");
      setAuthNotice("Oturum süresi doldu veya geçersiz hale geldi. Lütfen yeniden giriş yapın.");
    };
    window.addEventListener("admin-unauthorized", onUnauthorized);
    return () => {
      window.fetch = original;
      window.removeEventListener("admin-unauthorized", onUnauthorized);
    };
  }, []);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuth("out");
    setAuthNotice(null);
  };

  if (auth === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }
  if (auth === "out") {
    return <LoginCard onSuccess={() => { setAuth("in"); setAuthNotice(null); }} notice={authNotice} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900"><ShieldCheck className="h-5 w-5 text-emerald-300" /></div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Yönetici Paneli</h1>
              <p className="text-[11px] text-slate-500">İK &amp; Mevzuat Akademisi • Cihan Ahtik</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 sm:inline-flex" title="Oturum durumu">
              <ShieldCheck className="h-3 w-3" /> Oturum aktif • {diag?.sessionDays ?? 7} gün {diag?.https ? "• HTTPS" : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowPassword(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <KeyRound className="h-4 w-4" /> Şifremi değiştir
            </button>
            <a href="/kayit" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex">Kayıt sayfası</a>
            <a href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Home className="h-4 w-4" /> Siteye dön
            </a>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-3 lg:hidden">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${tab === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 max-h-[85vh] space-y-1 overflow-y-auto pr-1">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${tab === t.id ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/70"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === "dashboard" && <Dashboard onGo={setTab} />}
          {tab === "laws" && <AdminEntityManager entity="laws" />}
          {tab === "topics" && <AdminEntityManager entity="topics" />}
          {tab === "questions" && <AdminEntityManager entity="questions" />}
          {tab === "sgk" && <AdminEntityManager entity="sgk" />}
          {tab === "employees" && <EmployeesAdmin />}
          {tab === "daily" && <DailyAdmin />}
          {tab === "users" && <UsersAdmin />}
          {tab === "exports" && <ExportCenter />}
          {tab === "branding" && <BrandingAdmin />}
          {tab === "google" && <AdminGoogle />}
          {tab === "params" && <ParamsEditor />}
          {tab === "announcements" && <AdminEntityManager entity="announcements" />}
          {tab === "features" && <AdminEntityManager entity="features" />}
        </main>
      </div>

      {showPassword && (
        <PasswordModal onClose={() => setShowPassword(false)} />
      )}
    </div>
  );
}

function LoginCard({ onSuccess, notice }: { onSuccess: () => void; notice: string | null }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(notice);

  // Oturum panel açıkken düşerse uyarı anında görünsün.
  useEffect(() => { if (notice) setError(notice); }, [notice]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) { setError(d.error ?? "Giriş başarısız."); return; }
      onSuccess();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900"><KeyRound className="h-6 w-6 text-emerald-300" /></div>
        <h1 className="mt-4 text-center font-serif text-xl font-semibold text-slate-900">Yönetici Girişi</h1>
        <p className="mt-1 text-center text-xs text-slate-500">İK &amp; Mevzuat Akademisi yönetim paneli</p>
        <label className="mt-6 block text-[11px] font-bold text-slate-600" htmlFor="adm-user">Kullanıcı adı</label>
        <input id="adm-user" value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputCls} mt-1`} autoComplete="username" />
        <label className="mt-3 block text-[11px] font-bold text-slate-600" htmlFor="adm-pw">Şifre</label>
        <input id="adm-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} mt-1`} autoComplete="current-password" autoFocus />
        {error && <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <button type="submit" disabled={busy || !password} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Giriş yap
        </button>
        <div className="mt-4 flex justify-between text-[11px] font-semibold text-indigo-700">
          <a href="/" className="hover:underline">Siteye dön</a>
          <a href="/hesabim" className="hover:underline">Üye girişi</a>
        </div>
      </form>
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!r.ok) { setMsg({ ok: false, text: d.error ?? "Şifre değiştirilemedi." }); return; }
      setMsg({ ok: true, text: d.message ?? "Şifreniz güncellendi ✓" });
      setCurrent("");
      setNew("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><KeyRound className="h-4 w-4 text-indigo-600" /> Yönetici şifremi değiştir</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <label className="mt-4 block text-[11px] font-bold text-slate-600">Mevcut şifre</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} className={`${inputCls} mt-1`} required />
        <label className="mt-3 block text-[11px] font-bold text-slate-600">Yeni şifre (en az 6 karakter)</label>
        <input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} className={`${inputCls} mt-1`} required />
        {msg && <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{msg.text}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Kapat</button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Güncelle
          </button>
        </div>
      </form>
    </div>
  );
}

interface Stats {
  laws: number; topics: number; questions: number; announcements: number; features: number;
  sgkCodes: number; employees: number; dailyInsights: number; users: number; quizAttempts: number;
}

function Dashboard({ onGo }: { onGo: (t: Tab) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" }).then((r) => r.json()).then((d: Stats) => setStats(d)).catch(() => undefined);
  }, []);

  const cards: { label: string; value: number | undefined; tab: Tab; cls: string }[] = [
    { label: "Kanun", value: stats?.laws, tab: "laws", cls: "text-indigo-700" },
    { label: "İK Teknik & Metot", value: stats?.topics, tab: "topics", cls: "text-emerald-700" },
    { label: "Soru", value: stats?.questions, tab: "questions", cls: "text-violet-700" },
    { label: "SGK çıkış kodu", value: stats?.sgkCodes, tab: "sgk", cls: "text-rose-700" },
    { label: "Günlük bilgi", value: stats?.dailyInsights, tab: "daily", cls: "text-amber-700" },
    { label: "Kayıtlı kullanıcı", value: stats?.users, tab: "users", cls: "text-sky-700" },
    { label: "Çalışan kaydı", value: stats?.employees, tab: "employees", cls: "text-teal-700" },
    { label: "Test cevabı", value: stats?.quizAttempts, tab: "exports", cls: "text-fuchsia-700" },
    { label: "Duyuru / sürüm", value: stats?.announcements, tab: "announcements", cls: "text-orange-700" },
  ];

  const guide = [
    { title: "“Yetkisiz erişim” hatası artık neden çıkmıyor?", text: "Giriş bilgileri ve oturum anahtarı artık veritabanında tutuluyor. .env dosyası her derlemede yeniden yazılsa bile oturumunuz geçerli kalır. Oturum 12 saat sürer; süre dolarsa panel sizi otomatik olarak giriş ekranına yönlendirir." },
    { title: "Yeni modül / özellik nasıl eklenir veya yayınlanır?", text: "Özellik Talepleri bölümünden kayıt açın ve durumunu 'Yayında' yapın. Kanun, soru, SGK kodu, günlük bilgi ve duyuru eklemek için ilgili bölümleri kullanın; hepsi anında yayına girer. Kod gerektiren yeni ekranlar için README.md dosyasındaki adımları izleyin." },
    { title: "Kanunları Word / Excel / PDF olarak indirme", text: "Kullanıcı tarafındaki İndirme Merkezi'nden tüm kanunlar veya tek kanun Word, Excel ve PDF olarak indirilebilir. Yönetici tarafındaki Dışa Aktarma Merkezi'nden bütün tablolar Word/Excel/CSV olarak alınabilir." },
    { title: "Günlük bilgileri değiştirme ve her kanuna bilgi üretme", text: "Günlük Bilgiler bölümünde kayıtları tek tek düzenleyebilir, silebilir veya 'Kanunlardan üret' ile her kanun için kendi özeti, ipucu ve örnek senaryosundan ayrı bir günlük bilgi oluşturabilirsiniz. İsterseniz İK teknikleri ve metotları da eklenir." },
    { title: "Kullanıcı kaydı ve şifre yönetimi", text: "Ziyaretçiler /kayit adresinden üye olabilir. Kullanıcılar bölümünde tüm üyeleri görür, yeni kullanıcı ekler, şifrelerini sıfırlar, hesapları pasifleştirir veya yönetici yaparsınız. Kendi yönetici şifrenizi üstteki 'Şifremi değiştir' düğmesinden güncelleyebilirsiniz." },
    { title: "Test (quiz) ve site ayarları", text: "Kullanıcı tarafındaki Test sekmesi çoktan seçmeli sorular sorar; yanlış cevapta doğru cevap, kanun maddesi, açıklama ve örnek gösterilir. Site Ayarları bölümünden uygulama adı, imza, alt bilgi ve üst duyuru şeridini değiştirebilirsiniz." },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Hoş geldiniz</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">Bu panelden her şeyi yönetin</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">İçerik, SGK kodları, günlük bilgiler, kullanıcılar, şifreler, site ayarları, parametreler ve dışa aktarmalar tek yerde.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => onGo(c.tab)} className={`${cardCls} text-left transition hover:border-indigo-300`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${c.cls}`}>{c.value ?? "—"}</p>
          </button>
        ))}
      </div>
      <div className={cardCls}>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Sparkles className="h-4 w-4 text-indigo-600" /> Nasıl yapılır?</h3>
        <div className="mt-3 space-y-2">
          {guide.map((g) => (
            <details key={g.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 open:bg-white">
              <summary className="cursor-pointer list-none text-xs font-bold text-slate-900">{g.title}</summary>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{g.text}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

type NumKey = "kidemTavani" | "asgariUcretBrut" | "damgaOrani" | "sgkIsciOrani" | "sgkIsverenOrani" | "issizlikIsciOrani" | "issizlikIsverenOrani";
const PARAM_FIELDS: { key: NumKey; label: string; hint: string; step: string }[] = [
  { key: "kidemTavani", label: "Kıdem tazminatı tavanı (TL)", hint: "1 Temmuz – 31 Aralık 2026: 73.729,87 TL", step: "0.01" },
  { key: "asgariUcretBrut", label: "Brüt asgari ücret (TL)", hint: "2026: 33.030 TL (net 28.075,50 TL)", step: "0.01" },
  { key: "damgaOrani", label: "Damga vergisi oranı", hint: "Binde 7,59 = 0.00759", step: "0.00001" },
  { key: "sgkIsciOrani", label: "SGK işçi payı", hint: "%14 = 0.14", step: "0.001" },
  { key: "sgkIsverenOrani", label: "SGK işveren payı (tahmini)", hint: "%15,5 = 0.155", step: "0.001" },
  { key: "issizlikIsciOrani", label: "İşsizlik sigortası işçi payı", hint: "%1 = 0.01", step: "0.001" },
  { key: "issizlikIsverenOrani", label: "İşsizlik sigortası işveren payı", hint: "%2 = 0.02", step: "0.001" },
];

function ParamsEditor() {
  const [p, setP] = useState<ProductParams | null>(null);
  const [dilimText, setDilimText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/params", { cache: "no-store" }).then((r) => r.json()).then((d: { params: ProductParams }) => {
      setP(d.params);
      setDilimText(d.params.gvDilimleri.map((x) => `${x.limit} ${x.oran}`).join("\n"));
    }).catch(() => setNotice({ ok: false, text: "Parametreler yüklenemedi." }));
  }, []);

  const setNum = (key: NumKey, value: string) => setP((prev) => (prev ? { ...prev, [key]: Number(value) } : prev));
  const save = async () => {
    if (!p) return;
    const gvDilimleri = dilimText.split(/\r?\n/).map((l) => l.trim().split(/\s+/)).filter((x) => x.length >= 2).map((x) => ({ limit: Number(x[0]), oran: Number(x[1]) }));
    setSaving(true); setNotice(null);
    try {
      const r = await fetch("/api/admin/params", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, gvDilimleri }) });
      const d = (await r.json().catch(() => ({}))) as { params?: ProductParams; error?: string };
      if (!r.ok || !d.params) { setNotice({ ok: false, text: d.error ?? "Kaydedilemedi." }); return; }
      setP(d.params); setDilimText(d.params.gvDilimleri.map((x) => `${x.limit} ${x.oran}`).join("\n"));
      setNotice({ ok: true, text: "Parametreler güncellendi. Hesaplayıcılar ve İK Robotu yeni değerleri kullanıyor." });
    } finally { setSaving(false); }
  };

  if (!p) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="font-serif text-xl font-semibold">Güncel Parametreler</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">Asgari ücret, prim oranları, vergi dilimleri ve kıdem tavanını buradan güncelleyin.</p>
        <a href={`https://www.google.com/search?q=${encodeURIComponent("güncel asgari ücret kıdem tazminatı tavanı gelir vergisi dilimleri 2026")}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20">
          <ExternalLink className="h-3.5 w-3.5" /> Değerleri Google&apos;da kontrol et
        </a>
      </div>
      {notice && <p className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-semibold ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{notice.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}{notice.text}</p>}
      <div className={cardCls}>
        <div className="grid gap-4 md:grid-cols-2">
          {PARAM_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-[11px] font-bold text-slate-600">{f.label}</label>
              <input type="number" step={f.step} value={p[f.key]} onChange={(e) => setNum(f.key, e.target.value)} className={inputCls} />
              <p className="mt-1 text-[10px] text-slate-400">{f.hint}</p>
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-bold text-slate-600">Gelir vergisi dilimleri (her satır: üst sınır oran)</label>
            <textarea rows={5} value={dilimText} onChange={(e) => setDilimText(e.target.value)} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-bold text-slate-600">Güncelleme notu</label>
            <textarea rows={2} value={p.updatedNote} onChange={(e) => setP({ ...p, updatedNote: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Parametreleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
