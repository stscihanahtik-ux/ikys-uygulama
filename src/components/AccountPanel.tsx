"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, LogIn, LogOut, ShieldCheck, KeyRound, Trophy, Home, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { downloadDocumentSafe, type DocFormat, type DocModel } from "@/lib/documents";

interface AccountPanelProps {
  initialMode?: "register" | "login";
}

interface Me {
  user: { id: number; username: string; fullName: string; role: "admin" | "user" } | null;
  quiz: { total: number; correct: number; wrong: number; score: number; recent: { id: number; questionId: number; isCorrect: boolean; createdAt: string }[] };
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";

export function AccountPanel({ initialMode = "register" }: AccountPanelProps) {
  const [mode, setMode] = useState<"register" | "login" | "profile">(initialMode);
  const [me, setMe] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ username: "", fullName: "", email: "", password: "", currentPassword: "", newPassword: "" });

  const load = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as Me;
      setMe(data);
      if (data.user) setMode("profile");
    } catch {
      setMe({ user: null, quiz: { total: 0, correct: 0, wrong: 0, score: 0, recent: [] } });
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          email: form.email,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "İşlem başarısız." });
        return;
      }
      setForm((f) => ({ ...f, password: "" }));
      await load();
      setMsg({ ok: true, text: mode === "register" ? "Kaydınız oluşturuldu, hoş geldiniz!" : "Giriş yapıldı." });
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ user: null, quiz: { total: 0, correct: 0, wrong: 0, score: 0, recent: [] } });
    setMode("login");
    setMsg({ ok: true, text: "Çıkış yapıldı." });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Şifre değiştirilemedi." });
        return;
      }
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setMsg({ ok: true, text: data.message ?? "Şifreniz güncellendi." });
    } finally {
      setBusy(false);
    }
  };

  const exportQuiz = (format: DocFormat) => {
    const recent = me?.quiz.recent ?? [];
    const model: DocModel = {
      title: "Test Sonuçlarım",
      subtitle: `${me?.user?.fullName || me?.user?.username || "Kullanıcı"} • ${me?.quiz.total ?? 0} cevap • %${me?.quiz.score ?? 0} başarı`,
      fileName: "test-sonuclarim",
      blocks: [
        {
          type: "table",
          sheetName: "Sonuçlar",
          headers: ["Deneme", "Soru No", "Sonuç", "Tarih"],
          rows: recent.map((r, i) => [i + 1, r.questionId, r.isCorrect ? "Doğru" : "Yanlış", new Date(r.createdAt).toLocaleString("tr-TR")]),
        },
      ],
    };
    void downloadDocumentSafe(format, model);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="İK Akademisi" className="h-11 w-11 rounded-xl shadow" />
            <div>
              <h1 className="text-sm font-bold text-slate-900">İK &amp; Mevzuat Akademisi</h1>
              <p className="text-[11px] text-slate-500">Bu uygulama Cihan Ahtik tarafından yapılmıştır.</p>
            </div>
          </div>
          <a href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Home className="h-4 w-4" /> Site
          </a>
        </div>

        {msg && (
          <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
            {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {msg.text}
          </p>
        )}

        {mode !== "profile" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={() => { setMode("register"); setMsg(null); }}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${mode === "register" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <UserPlus className="h-4 w-4" /> Kayıt ol
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setMsg(null); }}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${mode === "login" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <LogIn className="h-4 w-4" /> Giriş yap
              </button>
            </div>

            <form onSubmit={submitAuth} className="space-y-3">
              {mode === "register" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-600">Ad soyad</span>
                    <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} placeholder="Adınız Soyadınız" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-600">E-posta (isteğe bağlı)</span>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="ornek@eposta.com" />
                  </label>
                </>
              )}
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Kullanıcı adı</span>
                <input value={form.username} onChange={(e) => set("username", e.target.value)} className={inputCls} placeholder="kullanici.adi" required />
                <span className="mt-1 block text-[10px] text-slate-400">3–40 karakter: harf, rakam, nokta, _ veya -</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Şifre</span>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={inputCls} placeholder="En az 6 karakter" required />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "register" ? "Kayıt ol ve giriş yap" : "Giriş yap"}
              </button>
            </form>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
              Üyelik; test sonuçlarınızı ve yer imlerinizi kişisel hesabınıza bağlar. Üye olmadan da uygulamanın tamamını kullanabilirsiniz.
            </p>
          </div>
        )}

        {mode === "profile" && me?.user && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{me.user.fullName || me.user.username}</p>
                  <p className="text-[11px] text-slate-500">
                    @{me.user.username} • {me.user.role === "admin" ? "Yönetici" : "Üye"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="Başarı" value={`%${me.quiz.score}`} />
                <Stat label="Doğru" value={String(me.quiz.correct)} />
                <Stat label="Yanlış" value={String(me.quiz.wrong)} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => exportQuiz("docx")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <FileText className="h-4 w-4" /> Sonuçlar (Word)
                </button>
                <button type="button" onClick={() => exportQuiz("xlsx")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                  <FileSpreadsheet className="h-4 w-4" /> Sonuçlar (Excel)
                </button>
                <button type="button" onClick={() => exportQuiz("pdf")} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">
                  <FileDown className="h-4 w-4" /> Sonuçlar (PDF)
                </button>
                {me.user.role === "admin" && (
                  <a href="/admin" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">
                    <ShieldCheck className="h-4 w-4" /> Yönetici Paneli
                  </a>
                )}
                <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" /> Çıkış
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <KeyRound className="h-4 w-4 text-indigo-600" /> Şifremi değiştir
              </h2>
              <form onSubmit={changePassword} className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Mevcut şifre</span>
                  <input type="password" value={form.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} className={inputCls} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">Yeni şifre</span>
                  <input type="password" value={form.newPassword} onChange={(e) => set("newPassword", e.target.value)} className={inputCls} placeholder="En az 6 karakter" required />
                </label>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />} Şifreyi güncelle
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
