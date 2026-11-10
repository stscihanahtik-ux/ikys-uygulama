"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, Save, Trash2, Search, Loader2, ShieldAlert, FileText, FileSpreadsheet, FileDown, UserPlus, AlertTriangle, CalendarClock } from "lucide-react";
import { DEFAULT_PARAMS, fmtTL, type ProductParams } from "@/lib/calculators";
import { formatTr, formatTrLong, todayIso } from "@/lib/business-days";
import { computeEmployee, type EmployeeComputed, type EmployeeRecord, type SgkRecord } from "@/lib/employee-calc";
import { downloadDocumentSafe, type DocModel } from "@/lib/documents";

type EmployeeRow = EmployeeRecord & { createdAt?: string };
type SgkRow = SgkRecord & { id: number };

interface Form {
  fullName: string;
  department: string;
  jobTitle: string;
  contractType: string;
  startDate: string;
  endDate: string;
  grossSalary: string;
  probationMonths: string;
  usedLeaveDays: string;
  exitCode: string;
  kvkkNoticeDate: string;
  notes: string;
}

const FLAG_LABEL: Record<string, string> = { evet: "Hak doğar", hayir: "Hak doğmaz", duruma_bagli: "Duruma bağlı" };

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";
const cardCls = "rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs";

const emptyForm = (): Form => ({
  fullName: "",
  department: "",
  jobTitle: "",
  contractType: "belirsiz",
  startDate: todayIso(),
  endDate: "",
  grossSalary: "0",
  probationMonths: "2",
  usedLeaveDays: "0",
  exitCode: "",
  kvkkNoticeDate: "",
  notes: "",
});

const toForm = (r: EmployeeRecord): Form => ({
  fullName: r.fullName,
  department: r.department,
  jobTitle: r.jobTitle,
  contractType: r.contractType,
  startDate: r.startDate,
  endDate: r.endDate ?? "",
  grossSalary: String(r.grossSalary),
  probationMonths: String(r.probationMonths),
  usedLeaveDays: String(r.usedLeaveDays),
  exitCode: r.exitCode,
  kvkkNoticeDate: r.kvkkNoticeDate,
  notes: r.notes,
});

const toRecord = (f: Form, id: number): EmployeeRecord => ({
  id,
  fullName: f.fullName.trim(),
  department: f.department.trim(),
  jobTitle: f.jobTitle.trim(),
  contractType: f.contractType,
  startDate: f.startDate,
  endDate: f.endDate || null,
  grossSalary: Number(f.grossSalary) || 0,
  probationMonths: Number(f.probationMonths) || 0,
  usedLeaveDays: Number(f.usedLeaveDays) || 0,
  exitCode: f.exitCode,
  kvkkNoticeDate: f.kvkkNoticeDate,
  notes: f.notes,
});

const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

const CHECK_EXIT = [
  "Fesih/istifa yazısı ve gerekiyorsa savunma tutanağı dosyada",
  "SGK işten ayrılış bildirgesi son gün içinde doğru kodla verildi",
  "Kıdem, ihbar ve izin ücreti hesabı onaylandı",
  "Son bordroda izin ücreti ve ödemeler banka yoluyla yapıldı",
  "Çalışma belgesi teslim edildi (4857 s.K. m.28)",
  "Zimmet teslimi ve sistem erişimleri kapatıldı",
  "İbraname en erken ayrılıştan 1 ay sonra, kalem kalem düzenlenecek (TBK m.420)",
  "İşsizlik başvurusu gerekiyorsa İŞKUR'a 30 gün içinde başvuru bilgisi verildi",
];

const CHECK_ACTIVE = [
  "SGK işe giriş bildirgesi işbaşından en geç 1 gün önce verildi (5510 s.K. m.8)",
  "İşe giriş sağlık raporu ve İSG eğitimi tamamlandı (6331 s.K. m.15, m.17)",
  "İş sözleşmesi imzalandı; deneme süresi en fazla 2 ay (4857 s.K. m.15)",
  "KVKK aydınlatma metni tebliğ edildi (6698 s.K. m.10)",
  "Özlük dosyası tamamlandı (4857 s.K. m.75)",
  "Deneme süresi sonu değerlendirmesi takvime işlendi",
  "Yıllık izin hakkı (1 yıl dolumu) takibi planlandı (4857 s.K. m.53)",
];

/** Çalışan dosyası (Word/Excel): bilgiler, yasal takvim, ödemeler ve kontrol listesi */
function employeeDoc(e: EmployeeRecord, c: EmployeeComputed, sgk: SgkRecord | undefined, today: string): DocModel {
  const ayrildi = c.status === "ayrildi";
  const blocks: DocModel["blocks"] = [];
  blocks.push({ type: "h", text: "Çalışan Bilgileri" });
  blocks.push({
    type: "ul",
    items: [
      `Ad soyad: ${e.fullName}`,
      `Departman / pozisyon: ${e.department || "—"} / ${e.jobTitle || "—"}`,
      `Sözleşme türü: ${e.contractType === "belirli" ? "Belirli süreli" : "Belirsiz süreli"}`,
      `İşe giriş: ${formatTrLong(e.startDate)}`,
      `Çıkış: ${e.endDate ? formatTrLong(e.endDate) : "Çalışmaya devam ediyor"}`,
      `Brüt ücret: ${fmtTL(e.grossSalary)}`,
      `Çalışma süresi: ${c.kidemText}`,
      `Kalan yıllık izin: ${c.kalanIzin} gün`,
      `KVKK aydınlatma tarihi: ${e.kvkkNoticeDate ? formatTr(e.kvkkNoticeDate) : "Girilmedi"}`,
    ],
  });
  blocks.push({ type: "h", text: "Yasal Takvim" });
  blocks.push({
    type: "table",
    sheetName: "Yasal Takvim",
    headers: ["İşlem", "Son gün", "Dayanak"],
    rows: c.timeline.map((t) => [t.label, formatTr(t.date), t.lawRef]),
  });
  if (ayrildi && sgk) {
    blocks.push({ type: "h", text: "SGK Çıkış Nedeni" });
    blocks.push({
      type: "p",
      text: `${sgk.code} — ${sgk.title}\nKıdem tazminatı: ${FLAG_LABEL[sgk.severance] ?? "—"}\nİşsizlik ödeneği: ${FLAG_LABEL[sgk.unemployment] ?? "—"}\nYasal dayanak: ${sgk.lawRef || "—"}${sgk.notes ? `\nNot: ${sgk.notes}` : ""}`,
    });
  }
  if (ayrildi) {
    const rows: (string | number)[][] = [];
    if (c.kidem) {
      rows.push(["Kıdem tazminatı (brüt)", fmtTL(c.kidem.brut), "4857 s.K. m.14 / 1475 s.K. m.14"]);
      rows.push(["Kıdem tazminatı (net, damga vergisi sonrası)", fmtTL(c.kidem.net), "193 s.K. m.25/7"]);
    }
    if (c.ihbar) rows.push(["İhbar tazminatı (brüt, süre kullandırılmadıysa)", fmtTL(c.ihbar.brut), `4857 s.K. m.17 (${c.ihbar.hafta} hafta)`]);
    rows.push(["Kullanılmayan izin ücreti (tahmini, brüt)", fmtTL(c.izinUcreti), "4857 s.K. m.59"]);
    blocks.push({ type: "h", text: "Tahmini Ödemeler" });
    blocks.push({ type: "table", sheetName: "Ödemeler", headers: ["Kalem", "Tutar", "Dayanak"], rows });
  }
  blocks.push({ type: "h", text: "Kontrol Listesi" });
  blocks.push({ type: "ul", items: (ayrildi ? CHECK_EXIT : CHECK_ACTIVE).map((x) => `☐ ${x}`) });
  if (c.warnings.length > 0) {
    blocks.push({ type: "ul", items: c.warnings.map((w) => `Uyarı: ${w}`) });
  }
  blocks.push({
    type: "p",
    italic: true,
    text: "Bu belge kişisel veri içerir. KVKK kapsamında yalnızca yetkili İK personeliyle paylaşın. Hesaplamalar bilgilendirme amaçlıdır; bağlayıcı bordro ve tazminat hesabı için İK/hukuk birimi onayı gerekir.",
  });
  return {
    title: `${e.fullName} — ${ayrildi ? "İşten Ayrılış Dosyası" : "Yasal Takvim ve Özlük Dosyası"}`,
    subtitle: `Hazırlanma tarihi: ${formatTrLong(today)} • Cihan Ahtik İK Akademisi`,
    fileName: `${e.fullName} ${ayrildi ? "isten-ayrilis" : "yasal-takvim"}`,
    blocks,
  };
}

/** Tüm çalışanların özet listesi (Excel) */
function listDoc(rows: EmployeeRow[], params: ProductParams, sgkMap: Map<string, SgkRecord>, today: string): DocModel {
  const body = rows.map((r) => {
    const c = computeEmployee(r, params, sgkMap.get(r.exitCode), today);
    return [
      r.fullName,
      r.department,
      r.jobTitle,
      formatTr(r.startDate),
      r.endDate ? formatTr(r.endDate) : "—",
      c.status === "ayrildi" ? "Ayrıldı" : "Aktif",
      c.kidemText,
      c.denemeBitis ? formatTr(c.denemeBitis) : "—",
      c.izinHakki,
      c.kalanIzin,
      fmtTL(r.grossSalary),
      r.exitCode || "—",
      c.warnings.length,
    ];
  });
  return {
    title: "Çalışan Listesi ve Yasal Durum",
    subtitle: `${rows.length} kayıt • ${formatTrLong(today)} • Kişisel veri içerir (KVKK)`,
    fileName: "calisan-listesi",
    blocks: [
      {
        type: "table",
        sheetName: "Çalışanlar",
        headers: [
          "Ad soyad", "Departman", "Pozisyon", "İşe giriş", "Çıkış", "Durum", "Çalışma süresi",
          "Deneme bitişi", "İzin hakkı (gün)", "Kalan izin (gün)", "Brüt ücret", "SGK çıkış kodu", "Uyarı sayısı",
        ],
        rows: body,
      },
    ],
  };
}

export function EmployeesAdmin() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [codes, setCodes] = useState<SgkRow[]>([]);
  const [params, setParams] = useState<ProductParams>(DEFAULT_PARAMS);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "aktif" | "ayrildi">("all");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const today = todayIso();

  const load = async () => {
    try {
      const [e, s, p] = await Promise.all([
        fetch("/api/admin/content/employees", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/content/sgk", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/params", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setRows((e as { rows?: EmployeeRow[] }).rows ?? []);
      setCodes((s as { rows?: SgkRow[] }).rows ?? []);
      setParams((p as { params?: ProductParams }).params ?? DEFAULT_PARAMS);
    } catch {
      setMsg({ ok: false, text: "Veriler yüklenemedi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sgkMap = useMemo(() => new Map<string, SgkRecord>(codes.map((c) => [c.code, c])), [codes]);

  const list = useMemo(
    () =>
      rows.filter((r) => {
        const st = r.endDate ? "ayrildi" : "aktif";
        if (filter !== "all" && st !== filter) return false;
        const term = q.trim().toLowerCase();
        return !term || `${r.fullName} ${r.department} ${r.jobTitle}`.toLowerCase().includes(term);
      }),
    [rows, q, filter]
  );

  const preview: EmployeeComputed | null = useMemo(() => {
    if (!validDate(form.startDate)) return null;
    const id = typeof selected === "number" ? selected : 0;
    try {
      return computeEmployee(toRecord(form, id), params, sgkMap.get(form.exitCode), today);
    } catch {
      return null;
    }
  }, [form, params, sgkMap, selected, today]);

  const openRow = (r: EmployeeRow) => {
    setSelected(r.id);
    setForm(toForm(r));
    setMsg(null);
  };

  const openNew = () => {
    setSelected("new");
    setForm(emptyForm());
    setMsg(null);
  };

  const setField = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.fullName.trim()) return setMsg({ ok: false, text: "Ad soyad zorunludur." });
    if (!validDate(form.startDate)) return setMsg({ ok: false, text: "Geçerli bir işe giriş tarihi girin." });
    setBusy(true);
    setMsg(null);
    const isNew = selected === "new";
    try {
      const res = await fetch(isNew ? "/api/admin/content/employees" : `/api/admin/content/employees/${selected}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grossSalary: Number(form.grossSalary) || 0,
          probationMonths: Number(form.probationMonths) || 0,
          usedLeaveDays: Number(form.usedLeaveDays) || 0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { row?: EmployeeRow; error?: string };
      if (!res.ok || !data.row) {
        setMsg({ ok: false, text: data.error ?? "Kaydedilemedi." });
        return;
      }
      setMsg({ ok: true, text: "Kaydedildi ✓" });
      setSelected(data.row.id);
      setForm(toForm(data.row));
      await load();
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (typeof selected !== "number") return;
    if (!window.confirm("Bu çalışan kaydı silinsin mi? Bu işlem geri alınamaz.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content/employees/${selected}`, { method: "DELETE" });
      if (!res.ok) {
        setMsg({ ok: false, text: "Silinemedi." });
        return;
      }
      setSelected(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const currentRow = typeof selected === "number" ? rows.find((r) => r.id === selected) : undefined;
  const currentComputed = currentRow ? computeEmployee(currentRow, params, sgkMap.get(currentRow.exitCode), today) : null;

  const inp = (label: string, key: keyof Form, type = "text", full = false) => (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-bold text-slate-600">{label}</span>
      <input type={type} value={form[key]} onChange={(e) => setField(key, e.target.value)} className={inputCls} />
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Users className="h-5 w-5 text-indigo-300" /> Çalışan Kayıtları &amp; Otomatik Yasal Takvim
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          İşe giriş ve çıkış tarihlerini girin; deneme süresi, SGK bildirim, işsizlik başvurusu, ibraname, izin ve tahmini tazminat tarihleri otomatik
          hesaplanır. Dosyayı Word veya Excel olarak indirebilirsiniz.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Bu bölüm kişisel veri içerir (KVKK). Yalnızca yetkili İK personeli kullanmalı; gereksiz bilgi girmeyin, aydınlatma tarihini kaydedin ve
          ayrılan çalışanların kayıtlarını saklama süresi sonunda silin.
        </p>
      </div>

      {msg && (
        <p className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {msg.text}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Liste */}
        <section className="space-y-3 xl:col-span-4">
          <div className={cardCls}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Çalışanlar</h3>
                <p className="text-[11px] text-slate-500">{rows.length} kayıt</p>
              </div>
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4" /> Yeni
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ad, departman..."
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "aktif" | "ayrildi")}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">Tümü</option>
                <option value="aktif">Aktif</option>
                <option value="ayrildi">Ayrılan</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => downloadDocumentSafe("xlsx", listDoc(list, params, sgkMap, today))}
              disabled={list.length === 0}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              <FileSpreadsheet className="h-4 w-4" /> Listeyi Excel&apos;e indir ({list.length})
            </button>
            <button
              type="button"
              onClick={() => downloadDocumentSafe("pdf", listDoc(list, params, sgkMap, today))}
              disabled={list.length === 0}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40"
            >
              <FileDown className="h-4 w-4" /> Listeyi PDF&apos;e indir ({list.length})
            </button>
          </div>

          <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center p-8 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : list.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                Kayıt bulunamadı.
              </p>
            ) : (
              list.map((r) => {
                const c = computeEmployee(r, params, sgkMap.get(r.exitCode), today);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => openRow(r)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      selected === r.id ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/20" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-900">{r.fullName}</p>
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          c.status === "ayrildi" ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.status === "ayrildi" ? "Ayrıldı" : "Aktif"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {r.department || "—"} • {r.jobTitle || "—"} • {c.kidemText}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Form ve hesaplar */}
        <section className="space-y-5 xl:col-span-8">
          {selected === null ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              Soldan bir çalışan seçin veya <b>Yeni</b> ile ekleyin.
            </div>
          ) : (
            <>
              <div className={cardCls}>
                <h3 className="mb-4 text-sm font-bold text-slate-900">{selected === "new" ? "Yeni çalışan" : "Çalışan bilgileri"}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {inp("Ad soyad *", "fullName", "text", true)}
                  {inp("Departman", "department")}
                  {inp("Pozisyon", "jobTitle")}
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-600">Sözleşme türü</span>
                    <select value={form.contractType} onChange={(e) => setField("contractType", e.target.value)} className={inputCls}>
                      <option value="belirsiz">Belirsiz süreli</option>
                      <option value="belirli">Belirli süreli</option>
                    </select>
                  </label>
                  {inp("İşe giriş tarihi *", "startDate", "date")}
                  {inp("İşten ayrılış tarihi (boşsa çalışıyor)", "endDate", "date")}
                  {inp("Brüt aylık ücret (TL)", "grossSalary", "number")}
                  {inp("Deneme süresi (ay, en fazla 2)", "probationMonths", "number")}
                  {inp("Kullanılan yıllık izin (gün)", "usedLeaveDays", "number")}
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-600">SGK çıkış kodu</span>
                    <select value={form.exitCode} onChange={(e) => setField("exitCode", e.target.value)} className={inputCls}>
                      <option value="">— Çıkış yok / seçilmedi —</option>
                      {codes.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code} — {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  {inp("KVKK aydınlatma tarihi", "kvkkNoticeDate", "date")}
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-[11px] font-bold text-slate-600">Notlar</span>
                    <textarea rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} className={inputCls} />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  {typeof selected === "number" ? (
                    <button
                      type="button"
                      onClick={remove}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" /> Sil
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
                  </button>
                </div>
              </div>

              {preview && (
                <div className={cardCls}>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <CalendarClock className="h-4 w-4 text-indigo-600" /> Yasal takvim ve hesaplar
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Metric label="Çalışma süresi" value={preview.kidemText} />
                    <Metric label="Deneme süresi sonu" value={formatTr(preview.denemeBitis)} />
                    <Metric label="SGK giriş son gün" value={formatTr(preview.sgkGirisSon)} />
                    <Metric label="Yıllık izin hakkı" value={`${preview.izinHakki} gün`} sub={`Kalan: ${preview.kalanIzin} gün`} />
                    <Metric label="Tahmini izin ücreti" value={fmtTL(preview.izinUcreti)} />
                    {preview.kidem && <Metric label="Kıdem (net, tahmini)" value={fmtTL(preview.kidem.net)} />}
                    {preview.ihbar && <Metric label="İhbar (brüt, tahmini)" value={fmtTL(preview.ihbar.brut)} sub={`${preview.ihbar.hafta} hafta`} />}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    {preview.timeline.map((t) => (
                      <div key={t.label + t.date} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900">{t.label}</p>
                          <p className="text-[10px] text-slate-500">{t.lawRef}</p>
                        </div>
                        <p className="shrink-0 text-xs font-extrabold text-indigo-700">{formatTr(t.date)}</p>
                      </div>
                    ))}
                  </div>

                  {preview.warnings.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {preview.warnings.map((w) => (
                        <li key={w} className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  )}

                  {form.exitCode && sgkMap.get(form.exitCode) && (
                    <p className="mt-4 text-[11px] text-slate-600">
                      <b>SGK {form.exitCode}:</b> Kıdem — {FLAG_LABEL[sgkMap.get(form.exitCode)?.severance ?? ""] ?? "—"} • İşsizlik —{" "}
                      {FLAG_LABEL[sgkMap.get(form.exitCode)?.unemployment ?? ""] ?? "—"}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => currentRow && downloadDocumentSafe("docx", employeeDoc(toRecord(form, currentRow.id), preview, sgkMap.get(form.exitCode), today))}
                      disabled={!currentRow}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      title={currentRow ? "" : "Önce kaydedin"}
                    >
                      <FileText className="h-4 w-4" /> Dosya (Word)
                    </button>
                    <button
                      type="button"
                      onClick={() => currentRow && downloadDocumentSafe("xlsx", employeeDoc(toRecord(form, currentRow.id), preview, sgkMap.get(form.exitCode), today))}
                      disabled={!currentRow}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                      title={currentRow ? "" : "Önce kaydedin"}
                    >
                      <FileSpreadsheet className="h-4 w-4" /> Dosya (Excel)
                    </button>
                    <button
                      type="button"
                      onClick={() => currentRow && downloadDocumentSafe("pdf", employeeDoc(toRecord(form, currentRow.id), preview, sgkMap.get(form.exitCode), today))}
                      disabled={!currentRow}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40"
                      title={currentRow ? "" : "Önce kaydedin"}
                    >
                      <FileDown className="h-4 w-4" /> Dosya (PDF)
                    </button>
                    {currentComputed && <span className="self-center text-[10px] text-slate-400">Dosyalar kayıtlı bilgilerle oluşturulur.</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}
