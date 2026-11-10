"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface Branding {
  appName: string;
  tagline: string;
  footerNote: string;
  supportEmail: string;
  announcement: string;
}

const DEFAULT: Branding = {
  appName: "İK & Mevzuat Akademisi",
  tagline: "Bu uygulama Cihan Ahtik tarafından yapılmıştır.",
  footerNote: "12 Kanun • SGK Çıkış Kodları • 10 İK Tekniği • 14 Metot • Yasal Süreler • Sesli Robot PRO",
  supportEmail: "",
  announcement: "",
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";
const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";

export function BrandingAdmin() {
  const [form, setForm] = useState<Branding>(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/branding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { branding?: Branding }) => {
        if (d.branding) setForm({ ...DEFAULT, ...d.branding });
      })
      .catch(() => setMsg({ ok: false, text: "Ayarlar yüklenemedi." }));
  }, []);

  const set = (k: keyof Branding, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; branding?: Branding };
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Kaydedilemedi." });
        return;
      }
      setMsg({ ok: true, text: "Site ayarları kaydedildi ✓ Sayfayı yenilediğinizde uygulama genelinde geçerli olur." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><Settings className="h-5 w-5 text-indigo-300" /> Site Ayarları</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">Uygulama adı, üst bilgi, alt bilgi, destek e-postası ve kullanıcılara gösterilecek duyuru şeridini düzenleyin.</p>
      </div>

      {msg && (
        <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{msg.text}
        </p>
      )}

      <form onSubmit={save} className={`${cardCls} space-y-4`}>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-600">Uygulama adı</span>
          <input value={form.appName} onChange={(e) => set("appName", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-600">Üst bilgi / imza satırı</span>
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-600">Alt bilgi</span>
          <textarea rows={2} value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-600">Destek e-postası (isteğe bağlı)</span>
          <input type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} className={inputCls} placeholder="destek@ornek.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-600">Üst duyuru şeridi (boş bırakılırsa gösterilmez)</span>
          <textarea rows={2} value={form.announcement} onChange={(e) => set("announcement", e.target.value)} className={inputCls} placeholder="Örn: v3.0 yayında — SGK kodları güncellendi" />
        </label>
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Ayarları kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
