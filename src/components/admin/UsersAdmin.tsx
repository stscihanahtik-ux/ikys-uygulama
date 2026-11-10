"use client";

import React, { useEffect, useState } from "react";
import { Users, UserPlus, KeyRound, Trash2, ShieldCheck, ShieldOff, Loader2, CheckCircle2, AlertTriangle, FileText, FileSpreadsheet, FileDown, Search } from "lucide-react";
import type { PublicUser } from "@/lib/admin-auth";
import { downloadDocumentSafe, type DocFormat, type DocModel } from "@/lib/documents";

const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function UsersAdmin() {
  const [rows, setRows] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [q, setQ] = useState("");
  const [create, setCreate] = useState({ username: "", fullName: "", email: "", password: "", role: "user" });
  const [reset, setReset] = useState<{ id: number; username: string; value: string } | null>(null);
  const [own, setOwn] = useState({ currentPassword: "", newPassword: "" });

  const load = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const d = (await res.json()) as { rows?: PublicUser[]; error?: string };
      if (!res.ok) setMsg({ ok: false, text: d.error ?? "Kullanıcılar yüklenemedi." });
      else setRows(d.rows ?? []);
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const call = async (key: string, init: RequestInit) => {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", init);
      const d = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "İşlem başarısız." });
        return false;
      }
      setMsg({ ok: true, text: d.message ?? "İşlem tamamlandı ✓" });
      await load();
      return true;
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await call("create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(create),
    });
    if (ok) setCreate({ username: "", fullName: "", email: "", password: "", role: "user" });
  };

  const patch = (id: number, action: string, value?: unknown) =>
    void call(`${action}:${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, value }),
    });

  const remove = async (u: PublicUser) => {
    if (!window.confirm(`${u.username} kullanıcısı silinsin mi?`)) return;
    await call(`del:${u.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id }) });
  };

  const changeOwn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("own");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(own),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) setMsg({ ok: false, text: d.error ?? "Şifre değiştirilemedi." });
      else {
        setMsg({ ok: true, text: d.message ?? "Yönetici şifreniz güncellendi ✓" });
        setOwn({ currentPassword: "", newPassword: "" });
      }
    } finally {
      setBusy(null);
    }
  };

  const exportUsers = (format: DocFormat) => {
    const model: DocModel = {
      title: "Kayıtlı Kullanıcılar",
      subtitle: `${rows.length} kullanıcı • Şifreler bu belgede yer almaz • Cihan Ahtik İK Akademisi`,
      fileName: "kayitli-kullanicilar",
      blocks: [
        {
          type: "table",
          sheetName: "Kullanıcılar",
          headers: ["Kullanıcı Adı", "Ad Soyad", "E-posta", "Rol", "Durum", "Kayıt Tarihi", "Son Giriş"],
          rows: rows.map((u) => [u.username, u.fullName, u.email, u.role === "admin" ? "Yönetici" : "Üye", u.isActive ? "Aktif" : "Pasif", fmt(u.createdAt), fmt(u.lastLoginAt)]),
        },
      ],
    };
    void downloadDocumentSafe(format, model);
  };

  const list = rows.filter((u) => {
    const term = q.trim().toLowerCase();
    return !term || `${u.username} ${u.fullName} ${u.email}`.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Users className="h-5 w-5 text-indigo-300" /> Kullanıcı Yönetimi
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Kayıtlı üyeleri görün, yeni kullanıcı ekleyin, şifrelerini sıfırlayın, hesapları aktif/pasif yapın veya rollerini değiştirin. Kendi yönetici
          şifrenizi de buradan güncelleyebilirsiniz. Şifreler veritabanında hashlenerek saklanır.
        </p>
      </div>

      {msg && (
        <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {msg.text}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <section className={cardCls}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kayıtlı kullanıcılar ({rows.length})</h3>
                <p className="text-[11px] text-slate-500">Şifreler hiçbir zaman listelenmez veya dışa aktarılmaz.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => exportUsers("docx")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <FileText className="h-4 w-4" /> Word
                </button>
                <button type="button" onClick={() => exportUsers("xlsx")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </button>
                <button type="button" onClick={() => exportUsers("pdf")} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">
                  <FileDown className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kullanıcı, ad veya e-posta ara..." className={`${inputCls} pl-9`} />
            </div>

            {loading ? (
              <div className="flex justify-center py-10 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {list.length === 0 && <li className="py-6 text-center text-xs text-slate-500">Kullanıcı bulunamadı.</li>}
                {list.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">@{u.username}</p>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${u.role === "admin" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700"}`}>
                          {u.role === "admin" ? "Yönetici" : "Üye"}
                        </span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {u.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {u.fullName || "—"} {u.email ? `• ${u.email}` : ""} • Son giriş: {fmt(u.lastLoginAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReset({ id: u.id, username: u.username, value: "" })}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700"
                        title="Şifresini değiştir"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Şifre
                      </button>
                      <button
                        type="button"
                        onClick={() => patch(u.id, "active", !u.isActive)}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        title={u.isActive ? "Pasifleştir" : "Aktifleştir"}
                      >
                        {u.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        {u.isActive ? "Pasif" : "Aktif"}
                      </button>
                      {u.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => patch(u.id, "role", "admin")}
                          disabled={busy !== null}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                          title="Yönetici yap"
                        >
                          Yönetici yap
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(u)}
                        disabled={busy !== null}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <section className={cardCls}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><UserPlus className="h-4 w-4 text-emerald-600" /> Yeni kullanıcı ekle</h3>
            <form onSubmit={createUser} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Kullanıcı adı *</span>
                <input value={create.username} onChange={(e) => setCreate({ ...create, username: e.target.value })} className={inputCls} placeholder="kullanici.adi" required />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Ad soyad</span>
                <input value={create.fullName} onChange={(e) => setCreate({ ...create, fullName: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">E-posta</span>
                <input type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Geçici şifre *</span>
                <input value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} className={inputCls} placeholder="En az 6 karakter" required />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Rol</span>
                <select value={create.role} onChange={(e) => setCreate({ ...create, role: e.target.value })} className={inputCls}>
                  <option value="user">Üye</option>
                  <option value="admin">Yönetici</option>
                </select>
              </label>
              <button type="submit" disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Kullanıcı oluştur
              </button>
            </form>
          </section>

          <section className={cardCls}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><KeyRound className="h-4 w-4 text-indigo-600" /> Kendi yönetici şifremi değiştir</h3>
            <form onSubmit={changeOwn} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Mevcut şifre</span>
                <input type="password" value={own.currentPassword} onChange={(e) => setOwn({ ...own, currentPassword: e.target.value })} className={inputCls} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-600">Yeni şifre</span>
                <input type="password" value={own.newPassword} onChange={(e) => setOwn({ ...own, newPassword: e.target.value })} className={inputCls} placeholder="En az 6 karakter" required />
              </label>
              <button type="submit" disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                {busy === "own" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Şifremi güncelle
              </button>
              <p className="text-[10px] leading-relaxed text-slate-500">Şifreniz değişse bile oturumunuz açık kalır. Diğer cihazlardaki oturumlar 12 saat içinde sona erer.</p>
            </form>
          </section>
        </div>
      </div>

      {reset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">@{reset.username} için yeni şifre</h3>
            <p className="mt-1 text-xs text-slate-500">Yeni şifreyi belirleyin ve kullanıcıya güvenli bir kanalla iletin.</p>
            <input
              type="text"
              value={reset.value}
              onChange={(e) => setReset({ ...reset, value: e.target.value })}
              className={`${inputCls} mt-4`}
              placeholder="En az 6 karakter"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setReset(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Vazgeç</button>
              <button
                type="button"
                disabled={reset.value.length < 6 || busy !== null}
                onClick={async () => {
                  const ok = await call(`reset:${reset.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: reset.id, action: "password", value: reset.value }),
                  });
                  if (ok) setReset(null);
                }}
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
