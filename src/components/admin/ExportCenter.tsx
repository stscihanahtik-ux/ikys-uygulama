"use client";

import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, FileDown, Loader2, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { downloadDocumentSafe, type DocFormat, type DocModel, type DocBlock } from "@/lib/documents";

interface ExportCenterProps {
  onGoTab: (tab: string) => void;
}

type Entity = "laws" | "topics" | "questions" | "sgk" | "employees" | "announcements" | "features" | "users";

const ENTITIES: { id: Entity; label: string; adminPath?: string }[] = [
  { id: "laws", label: "Kanunlar", adminPath: "/api/admin/content/laws" },
  { id: "topics", label: "İK Teknikleri & Metotlar", adminPath: "/api/admin/content/topics" },
  { id: "questions", label: "Soru Bankası", adminPath: "/api/admin/content/questions" },
  { id: "sgk", label: "SGK Çıkış Kodları", adminPath: "/api/admin/content/sgk" },
  { id: "employees", label: "Çalışan Kayıtları", adminPath: "/api/admin/content/employees" },
  { id: "announcements", label: "Duyurular & Sürümler", adminPath: "/api/admin/content/announcements" },
  { id: "features", label: "Özellik Talepleri", adminPath: "/api/admin/content/features" },
  { id: "users", label: "Kayıtlı Kullanıcılar", adminPath: "/api/admin/users" },
];

const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";

const HEADERS: Record<Entity, string[]> = {
  laws: ["Kanun No", "Başlık", "Kategori", "Özet", "Örnek Senaryo", "Sıra"],
  topics: ["Tür", "Başlık", "Alt Başlık", "Özet", "Örnek", "Sıra"],
  questions: ["Kategori", "Konu", "Soru", "Kısa Cevap", "Detaylı Cevap", "Yasal Dayanak", "Zorluk"],
  sgk: ["Kod", "Çıkış Nedeni", "Grup", "Kıdem", "İşsizlik", "Yasal Dayanak", "Not"],
  employees: ["Ad Soyad", "Departman", "Pozisyon", "İşe Giriş", "Çıkış", "Brüt Ücret", "SGK Kodu"],
  announcements: ["Başlık", "Tür", "Sürüm", "Açıklama", "Yayında"],
  features: ["Özellik", "Bölüm", "Durum", "Öncelik", "Açıklama"],
  users: ["Kullanıcı Adı", "Ad Soyad", "E-posta", "Rol", "Durum", "Son Giriş"],
};

function rowFor(entity: Entity, r: Record<string, unknown>): (string | number)[] {
  const s = (k: string) => (r[k] === null || r[k] === undefined ? "" : String(r[k]));
  const b = (k: string) => (r[k] === true ? "Evet" : r[k] === false ? "Hayır" : "");
  switch (entity) {
    case "laws":
      return [s("lawNumber"), s("title"), s("category"), s("summary"), s("practicalExample"), Number(r.sortOrder) || 0];
    case "topics":
      return [r.type === "method" ? "Metot" : "İK Tekniği", s("title"), s("subtitle"), s("summary"), s("practicalExample"), Number(r.sortOrder) || 0];
    case "questions":
      return [s("category"), s("topicRef"), s("question"), s("shortAnswer"), s("detailedAnswer"), s("legalBasis"), s("difficulty")];
    case "sgk":
      return [s("code"), s("title"), s("category"), s("severance"), s("unemployment"), s("lawRef"), s("notes")];
    case "employees":
      return [s("fullName"), s("department"), s("jobTitle"), s("startDate"), s("endDate"), Number(r.grossSalary) || 0, s("exitCode")];
    case "announcements":
      return [s("title"), s("kind"), s("version"), s("body"), b("isActive")];
    case "features":
      return [s("title"), s("area"), s("status"), s("priority"), s("description")];
    case "users":
      return [s("username"), s("fullName"), s("email"), r.role === "admin" ? "Yönetici" : "Üye", b("isActive"), s("lastLoginAt")];
  }
}

export function ExportCenter() {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (entity: Entity, format: DocFormat) => {
    const key = `${entity}:${format}`;
    setBusy(key);
    setMsg(null);
    try {
      const def = ENTITIES.find((e) => e.id === entity)!;
      const res = await fetch(def.adminPath!, { cache: "no-store" });
      if (!res.ok) throw new Error("Veriler alınamadı. Oturumunuzu kontrol edin.");
      const d = (await res.json()) as { rows?: Record<string, unknown>[] };
      const rows = (d.rows ?? []).map((r) => rowFor(entity, r));
      const headers = HEADERS[entity];
      const blocks: DocBlock[] = [
        { type: "table", sheetName: def.label.slice(0, 28), headers, rows },
        { type: "p", italic: true, text: "Bu belge Cihan Ahtik İK Akademisi Yönetici Paneli tarafından üretilmiştir. Kişisel veri içeren dosyaları KVKK'ya uygun saklayın." },
      ];
      const model: DocModel = {
        title: def.label,
        subtitle: `${rows.length} kayıt • ${new Date().toLocaleString("tr-TR")} • Cihan Ahtik İK Akademisi`,
        fileName: entity,
        blocks,
      };
      await downloadDocumentSafe(format, model);
      const label = format === "docx" ? "Word" : format === "pdf" ? "PDF" : "Excel";
      setMsg({ ok: true, text: `${def.label} ${label} olarak indirildi (${rows.length} kayıt).` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Dışa aktarma başarısız." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><Package className="h-5 w-5 text-indigo-300" /> Yönetici Dışa Aktarma Merkezi</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Veritabanındaki tüm tabloları tek tıkla Word, Excel veya PDF olarak indirin. Kullanıcı şifreleri hiçbir zaman dışa aktarılmaz.
        </p>
      </div>

      {msg && (
        <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{msg.text}
        </p>
      )}

      <div className={cardCls}>
        <div className="space-y-2">
          {ENTITIES.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{e.label}</p>
                <p className="text-[11px] text-slate-500">{HEADERS[e.id].length} sütun</p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" disabled={busy !== null} onClick={() => run(e.id, "docx")} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                  {busy === `${e.id}:docx` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Word
                </button>
                <button type="button" disabled={busy !== null} onClick={() => run(e.id, "xlsx")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {busy === `${e.id}:xlsx` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Excel
                </button>
                <button type="button" disabled={busy !== null} onClick={() => run(e.id, "pdf")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50">
                  {busy === `${e.id}:pdf` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />} PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardCls}>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Download className="h-4 w-4 text-sky-600" /> CSV ve kullanıcı indirmeleri</h3>
        <p className="mt-1 text-xs text-slate-500">CSV, Google Sheets&apos;e aktarmak için idealdir. Kullanıcı tarafındaki tüm indirmeler İndirme Merkezi&apos;ndedir.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["laws", "topics", "questions"] as const).map((k) => (
            <a key={k} href={`/api/admin/export?entity=${k}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> {k === "laws" ? "Kanunlar" : k === "topics" ? "Teknik & Metot" : "Sorular"} CSV
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
