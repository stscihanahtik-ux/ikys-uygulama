"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, Search, Loader2, ExternalLink } from "lucide-react";

export type EntityKey = "laws" | "topics" | "questions" | "announcements" | "features" | "sgk";

type Row = Record<string, unknown> & { id: number };
type Form = Record<string, unknown>;
type Opt = { value: string; label: string };
type ItemField = { key: string; label: string; multiline?: boolean };
type FieldKind = "text" | "number" | "textarea" | "select" | "lines" | "tags" | "bool" | "items";

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  hint?: string;
  rows?: number;
  options?: Opt[];
  full?: boolean;
  itemLabel?: string;
  itemFields?: ItemField[];
}

interface EntityUi {
  singular: string;
  title: string;
  description: string;
  fields: FieldDef[];
  defaults: Form;
  label: (r: Row) => string;
  sub: (r: Row) => string;
  filter?: { key: string; options: Opt[] };
}

const STATUS_LABEL: Record<string, string> = {
  fikir: "Fikir",
  planlandi: "Planlandı",
  gelistiriliyor: "Geliştiriliyor",
  yayinda: "Yayında",
};
const PRIO_LABEL: Record<string, string> = { dusuk: "Düşük", orta: "Orta", yuksek: "Yüksek" };
const KIND_LABEL: Record<string, string> = { yenilik: "Yenilik", guncelleme: "Güncelleme", duyuru: "Duyuru", bakim: "Bakım" };
const toOpts = (m: Record<string, string>): Opt[] => Object.entries(m).map(([value, label]) => ({ value, label }));
const AREAS = ["Kanunlar", "Robot", "Hesaplayıcı", "Şablonlar", "Sorular", "Google Entegrasyonu", "Admin Paneli", "PWA / Play Store", "Diğer"];

const ENTITIES: Record<EntityKey, EntityUi> = {
  laws: {
    singular: "kanun",
    title: "Kanunlar",
    description:
      "Kanun maddeleri, İK uygulama etkileri, örnek senaryolar ve günlük ipuçları. Kaydettiğinizde kanun sayfası ve İK Robotu anında güncellenir.",
    fields: [
      { key: "lawNumber", label: "Kanun No", kind: "text", required: true, hint: "Örn: 4857" },
      { key: "title", label: "Kanun Adı", kind: "text", required: true, full: true },
      { key: "slug", label: "Slug (boş bırakılırsa otomatik)", kind: "text", hint: "Mevcut kanunda değiştirmeyin; bağlantılar bozulur." },
      { key: "category", label: "Kategori", kind: "text", hint: "Örn: Temel İş Hukuku, Sosyal Güvenlik, Vergi & İcra" },
      { key: "summary", label: "Özet", kind: "textarea", rows: 4, required: true, full: true },
      {
        key: "keyArticles",
        label: "Kritik Kanun Maddeleri",
        kind: "items",
        full: true,
        itemLabel: "Madde",
        itemFields: [
          { key: "articleNo", label: "Madde No (örn. Madde 17)" },
          { key: "title", label: "Madde Başlığı" },
          { key: "content", label: "Madde İçeriği", multiline: true },
          { key: "hrImpact", label: "İK Uygulama Etkisi", multiline: true },
        ],
      },
      { key: "practicalExample", label: "Örnek Senaryo", kind: "textarea", rows: 4, full: true },
      { key: "dailyTips", label: "Günlük İpuçları", kind: "lines", full: true, hint: "Her satıra bir ipucu yazın." },
      { key: "keywords", label: "Anahtar Kelimeler", kind: "tags", full: true, hint: "Virgülle ayırın. Robot arama eşleşmesinde kullanılır." },
      { key: "sortOrder", label: "Sıra", kind: "number" },
    ],
    defaults: {
      lawNumber: "",
      title: "",
      slug: "",
      category: "Temel İş Hukuku",
      summary: "",
      keyArticles: [],
      practicalExample: "",
      dailyTips: [],
      keywords: [],
      sortOrder: 0,
    },
    label: (r) => `${String(r.lawNumber ?? "")} — ${String(r.title ?? "")}`,
    sub: (r) => String(r.category ?? ""),
  },
  topics: {
    singular: "İK tekniği / metodu",
    title: "İK Teknikleri & Metotlar",
    description: "Süreç teknikleri (İK Tekniği) ve model/yöntemler (İK Metodu). Adımlar kartlar halinde gösterilir.",
    fields: [
      {
        key: "type",
        label: "Tür",
        kind: "select",
        required: true,
        options: [
          { value: "technique", label: "İK Tekniği (süreç)" },
          { value: "method", label: "İK Metodu (model/yöntem)" },
        ],
      },
      { key: "title", label: "Başlık", kind: "text", required: true, full: true },
      { key: "slug", label: "Slug (boş bırakılırsa otomatik)", kind: "text" },
      { key: "subtitle", label: "Alt Başlık", kind: "text", full: true, hint: "Örn: İK Tekniği • Eğitim Yönetimi" },
      { key: "summary", label: "Özet", kind: "textarea", rows: 4, required: true, full: true },
      {
        key: "stepsOrComponents",
        label: "Adımlar / Bileşenler",
        kind: "items",
        full: true,
        itemLabel: "Adım",
        itemFields: [
          { key: "title", label: "Başlık" },
          { key: "description", label: "Açıklama", multiline: true },
        ],
      },
      { key: "practicalExample", label: "Uygulamalı Örnek", kind: "textarea", rows: 3, full: true },
      { key: "relatedLaws", label: "İlişkili Kanun No'ları", kind: "tags", hint: "Örn: 4857, 5510" },
      { key: "sortOrder", label: "Sıra", kind: "number" },
      { key: "dailyTips", label: "Uzman İpuçları", kind: "lines", full: true },
      { key: "keywords", label: "Anahtar Kelimeler", kind: "tags", full: true },
    ],
    defaults: {
      type: "technique",
      title: "",
      slug: "",
      subtitle: "",
      summary: "",
      stepsOrComponents: [],
      practicalExample: "",
      relatedLaws: [],
      dailyTips: [],
      keywords: [],
      sortOrder: 0,
    },
    label: (r) => String(r.title ?? ""),
    sub: (r) => (r.type === "method" ? "İK Metodu" : "İK Tekniği"),
    filter: {
      key: "type",
      options: [
        { value: "technique", label: "Teknikler" },
        { value: "method", label: "Metotlar" },
      ],
    },
  },
  questions: {
    singular: "soru",
    title: "Soru Bankası",
    description: "Robotun ve Soru Bankası'nın kullandığı sorular. Konu başlığı ve yasal dayanağı mutlaka doldurun.",
    fields: [
      {
        key: "category",
        label: "Kategori",
        kind: "select",
        options: [
          { value: "kanun", label: "Kanun" },
          { value: "teknik", label: "İK Tekniği" },
          { value: "metot", label: "Metot" },
        ],
      },
      {
        key: "difficulty",
        label: "Zorluk",
        kind: "select",
        options: [
          { value: "Temel", label: "Temel" },
          { value: "Orta", label: "Orta" },
          { value: "İleri", label: "İleri" },
        ],
      },
      { key: "topicRef", label: "Konu / Kanun", kind: "text", required: true, full: true },
      { key: "question", label: "Soru", kind: "textarea", rows: 2, required: true, full: true },
      { key: "shortAnswer", label: "Kısa Cevap", kind: "textarea", rows: 2, required: true, full: true },
      { key: "detailedAnswer", label: "Detaylı Cevap", kind: "textarea", rows: 5, full: true },
      { key: "legalBasis", label: "Yasal Dayanak", kind: "text", hint: "Örn: 4857 m.17" },
      { key: "exampleScenario", label: "Örnek Senaryo", kind: "textarea", rows: 3, full: true },
    ],
    defaults: {
      category: "kanun",
      difficulty: "Orta",
      topicRef: "",
      question: "",
      shortAnswer: "",
      detailedAnswer: "",
      legalBasis: "",
      exampleScenario: "",
    },
    label: (r) => String(r.question ?? ""),
    sub: (r) => String(r.topicRef ?? ""),
  },
  announcements: {
    singular: "duyuru / sürüm notu",
    title: "Duyurular & Sürüm Notları",
    description:
      "Yayında olan kayıtlar kullanıcıların Günlük Bilgi sekmesinde 'Yenilikler & Duyurular' bölümünde görünür. Yeni sürüm çıktığında buradan duyurun.",
    fields: [
      { key: "title", label: "Başlık", kind: "text", required: true, full: true },
      { key: "kind", label: "Tür", kind: "select", options: toOpts(KIND_LABEL) },
      { key: "version", label: "Sürüm", kind: "text", hint: "Örn: 2.1.0" },
      { key: "body", label: "Açıklama", kind: "textarea", rows: 5, full: true },
      { key: "isActive", label: "Yayında (kullanıcılara göster)", kind: "bool" },
    ],
    defaults: { title: "", kind: "yenilik", version: "", body: "", isActive: true },
    label: (r) => String(r.title ?? ""),
    sub: (r) => `${KIND_LABEL[String(r.kind)] ?? ""} • ${String(r.version || "sürümsüz")} • ${r.isActive ? "Yayında" : "Taslak"}`,
  },
  sgk: {
    singular: "SGK çıkış kodu",
    title: "SGK İşten Ayrılış (Çıkış) Kodları",
    description:
      "İşten ayrılış bildirgesindeki çıkış nedeni kodları. Kıdem ve işsizlik alanları Çalışan Kayıtları, SGK Kodları sayfası ve İK Robotu'nda kullanılır. Değişiklikleri SGK e-Bildirge kılavuzundan kontrol edip girin.",
    fields: [
      { key: "code", label: "Kod (2 hane)", kind: "text", required: true, hint: "Örn: 03" },
      { key: "title", label: "Çıkış nedeni", kind: "text", required: true, full: true },
      {
        key: "category",
        label: "Grup",
        kind: "select",
        options: [
          { value: "isci", label: "İşçi kaynaklı" },
          { value: "isveren", label: "İşveren kaynaklı" },
          { value: "yasal", label: "Yasal / emeklilik / ölüm" },
          { value: "diger", label: "Diğer" },
        ],
      },
      {
        key: "severance",
        label: "Kıdem tazminatı",
        kind: "select",
        options: [
          { value: "evet", label: "Hak doğar" },
          { value: "hayir", label: "Hak doğmaz" },
          { value: "duruma_bagli", label: "Duruma bağlı" },
        ],
      },
      {
        key: "unemployment",
        label: "İşsizlik ödeneği",
        kind: "select",
        options: [
          { value: "evet", label: "Hak doğar" },
          { value: "hayir", label: "Hak doğmaz" },
          { value: "duruma_bagli", label: "Duruma bağlı" },
        ],
      },
      { key: "lawRef", label: "Yasal dayanak", kind: "text", hint: "Örn: 4857 s.K. m.17" },
      { key: "description", label: "Açıklama", kind: "textarea", rows: 3, full: true },
      { key: "notes", label: "Uyarı / not", kind: "textarea", rows: 3, full: true },
      { key: "sortOrder", label: "Sıra", kind: "number" },
    ],
    defaults: {
      code: "",
      title: "",
      category: "diger",
      severance: "hayir",
      unemployment: "hayir",
      lawRef: "",
      description: "",
      notes: "",
      sortOrder: 0,
    },
    label: (r) => `${String(r.code ?? "")} — ${String(r.title ?? "")}`,
    sub: (r) =>
      `Kıdem: ${({ evet: "Hak doğar", hayir: "Hak doğmaz", duruma_bagli: "Duruma bağlı" } as Record<string, string>)[String(r.severance)] ?? "-"} • İşsizlik: ${
        ({ evet: "Hak doğar", hayir: "Hak doğmaz", duruma_bagli: "Duruma bağlı" } as Record<string, string>)[String(r.unemployment)] ?? "-"
      }`,
  },
  features: {
    singular: "özellik talebi",
    title: "Özellik Talepleri",
    description:
      "Eklemek istediğiniz özellikleri fikir olarak kaydedin ve durumunu takip edin. Kod gerektiren yeni ekran veya hesaplayıcılar geliştirici tarafından eklenir; isteğinizi bu kayıtla birlikte iletebilirsiniz.",
    fields: [
      { key: "title", label: "Özellik Adı", kind: "text", required: true, full: true },
      { key: "area", label: "Bölüm", kind: "select", options: AREAS.map((v) => ({ value: v, label: v })) },
      { key: "status", label: "Durum", kind: "select", options: toOpts(STATUS_LABEL) },
      { key: "priority", label: "Öncelik", kind: "select", options: toOpts(PRIO_LABEL) },
      { key: "description", label: "Açıklama / İstenen davranış", kind: "textarea", rows: 5, full: true },
    ],
    defaults: { title: "", area: "Diğer", status: "fikir", priority: "orta", description: "" },
    label: (r) => String(r.title ?? ""),
    sub: (r) => `${STATUS_LABEL[String(r.status)] ?? ""} • ${PRIO_LABEL[String(r.priority)] ?? ""} • ${String(r.area ?? "")}`,
    filter: { key: "status", options: toOpts(STATUS_LABEL) },
  },
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none";

function toForm(fields: FieldDef[], row: Row | null, defaults: Form): Form {
  const src: Form = row ?? defaults;
  const out: Form = {};
  for (const fd of fields) {
    const v = src[fd.key];
    if (fd.kind === "lines") out[fd.key] = Array.isArray(v) ? (v as string[]).join("\n") : "";
    else if (fd.kind === "tags") out[fd.key] = Array.isArray(v) ? (v as string[]).join(", ") : "";
    else if (fd.kind === "items")
      out[fd.key] = Array.isArray(v) ? (v as Record<string, string>[]).map((o) => ({ ...o })) : [];
    else if (fd.kind === "bool") out[fd.key] = Boolean(v);
    else out[fd.key] = v === null || v === undefined ? "" : String(v);
  }
  return out;
}

function pickFields(o: Record<string, unknown>, fields: ItemField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.key] = String(o[f.key] ?? "").trim();
  return out;
}

function emptyItem(fields: ItemField[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.key] = "";
  return out;
}

function toPayload(fields: FieldDef[], form: Form): Form {
  const out: Form = {};
  for (const fd of fields) {
    const v = form[fd.key];
    if (fd.kind === "lines") out[fd.key] = String(v ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    else if (fd.kind === "tags") out[fd.key] = String(v ?? "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    else if (fd.kind === "items") {
      const list = Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
      out[fd.key] = list
        .map((o) => pickFields(o, fd.itemFields ?? []))
        .filter((o) => Object.values(o).some(Boolean));
    } else if (fd.kind === "bool") out[fd.key] = Boolean(v);
    else if (fd.kind === "number") out[fd.key] = Number(v) || 0;
    else out[fd.key] = String(v ?? "").trim();
  }
  return out;
}

export function AdminEntityManager({ entity }: { entity: EntityKey }) {
  const ui = ENTITIES[entity];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>({});
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${entity}`, { cache: "no-store" });
      const data = (await res.json()) as { rows?: Row[]; error?: string };
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "Kayıtlar yüklenemedi." });
      else setRows(data.rows ?? []);
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelected(null);
    setMsg(null);
    setFilter("");
    setQ("");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const list = useMemo(
    () =>
      rows.filter((r) => {
        if (ui.filter && filter && String(r[ui.filter.key]) !== filter) return false;
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return `${ui.label(r)} ${ui.sub(r)}`.toLowerCase().includes(term);
      }),
    [rows, q, filter, ui]
  );

  const openRow = (r: Row) => {
    setSelected(r.id);
    setForm(toForm(ui.fields, r, ui.defaults));
    setMsg(null);
  };

  const openNew = () => {
    setSelected("new");
    setForm(toForm(ui.fields, null, ui.defaults));
    setMsg(null);
  };

  const setField = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    for (const fd of ui.fields) {
      if (fd.required && String(form[fd.key] ?? "").trim() === "") {
        setMsg({ ok: false, text: `"${fd.label}" alanı zorunludur.` });
        return;
      }
    }
    setBusy(true);
    setMsg(null);
    const isNew = selected === "new";
    try {
      const res = await fetch(isNew ? `/api/admin/content/${entity}` : `/api/admin/content/${entity}/${selected}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(ui.fields, form)),
      });
      const data = (await res.json().catch(() => ({}))) as { row?: Row; error?: string };
      if (!res.ok || !data.row) {
        setMsg({ ok: false, text: data.error ?? "Kaydedilemedi." });
        return;
      }
      setMsg({ ok: true, text: "Kaydedildi ✓ — değişiklik sitede ve İK Robotu'nda hemen geçerli." });
      setSelected(data.row.id);
      setForm(toForm(ui.fields, data.row, ui.defaults));
      await load();
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (typeof selected !== "number") return;
    if (!window.confirm(`Bu ${ui.singular} silinsin mi? Bu işlem geri alınamaz.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content/${entity}/${selected}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg({ ok: false, text: d.error ?? "Silinemedi." });
        return;
      }
      setSelected(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const renderField = (fd: FieldDef) => {
    const id = `f-${entity}-${fd.key}`;
    const span = fd.full ? "md:col-span-2" : "";
    const v = form[fd.key];
    const label = (
      <label htmlFor={id} className="mb-1 block text-[11px] font-bold text-slate-600">
        {fd.label}
        {fd.required && <span className="text-rose-600"> *</span>}
      </label>
    );
    const hint = fd.hint ? <p className="mt-1 text-[10px] text-slate-400">{fd.hint}</p> : null;

    if (fd.kind === "bool") {
      return (
        <label key={fd.key} className={`${span} flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700`}>
          <input
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => setField(fd.key, e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          {fd.label}
        </label>
      );
    }

    if (fd.kind === "items") {
      const list = Array.isArray(v) ? (v as Record<string, string>[]) : [];
      return (
        <div key={fd.key} className={`${span} space-y-2`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600">{fd.label}</span>
            <button
              type="button"
              onClick={() => setField(fd.key, [...list, emptyItem(fd.itemFields)])}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3 w-3" /> {fd.itemLabel ?? "Öğe"} ekle
            </button>
          </div>
          {list.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
              Henüz öğe yok.
            </p>
          )}
          {list.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {fd.itemLabel ?? "Öğe"} {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setField(fd.key, list.filter((_, i) => i !== idx))}
                  className="rounded-lg p-1 text-rose-600 hover:bg-rose-50"
                  aria-label="Öğeyi kaldır"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {(fd.itemFields ?? []).map((inf) => {
                const onItem = (val: string) =>
                  setField(fd.key, list.map((x, i) => (i === idx ? { ...x, [inf.key]: val } : x)));
                return (
                  <div key={inf.key}>
                    <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">{inf.label}</label>
                    {inf.multiline ? (
                      <textarea rows={3} value={item[inf.key] ?? ""} onChange={(e) => onItem(e.target.value)} className={inputCls} />
                    ) : (
                      <input value={item[inf.key] ?? ""} onChange={(e) => onItem(e.target.value)} className={inputCls} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    if (fd.kind === "select") {
      return (
        <div key={fd.key} className={span}>
          {label}
          <select id={id} value={String(v ?? "")} onChange={(e) => setField(fd.key, e.target.value)} className={inputCls}>
            {(fd.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {hint}
        </div>
      );
    }

    if (fd.kind === "textarea" || fd.kind === "lines" || fd.kind === "tags") {
      return (
        <div key={fd.key} className={span}>
          {label}
          <textarea
            id={id}
            rows={fd.rows ?? (fd.kind === "textarea" ? 3 : 4)}
            value={String(v ?? "")}
            onChange={(e) => setField(fd.key, e.target.value)}
            className={inputCls}
          />
          {hint}
        </div>
      );
    }

    return (
      <div key={fd.key} className={span}>
        {label}
        <input
          id={id}
          type={fd.kind === "number" ? "number" : "text"}
          value={String(v ?? "")}
          onChange={(e) => setField(fd.key, e.target.value)}
          className={inputCls}
        />
        {hint}
      </div>
    );
  };

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      {/* Liste */}
      <section className="space-y-3 xl:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-900">{ui.title}</h2>
              <p className="text-[11px] text-slate-500">{rows.length} kayıt</p>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Yeni
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            {ui.filter && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">Tümü</option>
                {ui.filter.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              Kayıt bulunamadı.
            </p>
          ) : (
            list.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openRow(r)}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  selected === r.id
                    ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="line-clamp-2 text-xs font-bold text-slate-900">{ui.label(r)}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{ui.sub(r)}</p>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Form */}
      <section className="xl:col-span-8">
        {selected === null ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            <p className="mx-auto max-w-xl leading-relaxed">{ui.description}</p>
            <p className="mt-3 text-xs">
              Soldan bir kayıt seçin veya <b>Yeni</b> ile ekleyin.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-semibold text-slate-900">
                  {selected === "new" ? `Yeni ${ui.singular}` : `${ui.singular[0].toUpperCase()}${ui.singular.slice(1)} düzenle`}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{ui.description}</p>
              </div>
              {entity === "laws" && String(form.lawNumber ?? "").trim() !== "" && (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`site:mevzuat.gov.tr ${String(form.lawNumber)} sayılı kanun`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Google&apos;da resmî metni ara
                </a>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">{ui.fields.map(renderField)}</div>

            {msg && (
              <p
                className={`mt-4 rounded-xl px-3 py-2 text-xs font-semibold ${
                  msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                }`}
              >
                {msg.text}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div>
                {typeof selected === "number" && (
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Sil
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {busy ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
