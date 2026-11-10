"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, Sparkles } from "lucide-react";

interface AnnRow {
  id: number;
  title: string;
  kind: string;
  version: string;
  body: string;
  createdAt: string;
}

const KIND: Record<string, { label: string; cls: string }> = {
  yenilik: { label: "Yenilik", cls: "bg-emerald-100 text-emerald-800" },
  guncelleme: { label: "Güncelleme", cls: "bg-indigo-100 text-indigo-800" },
  duyuru: { label: "Duyuru", cls: "bg-amber-100 text-amber-800" },
  bakim: { label: "Bakım", cls: "bg-rose-100 text-rose-800" },
};

const SEEN_KEY = "ik-announcement-seen";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export function AnnouncementsPanel() {
  const [items, setItems] = useState<AnnRow[] | null>(null);
  const [seenId, setSeenId] = useState(0);

  useEffect(() => {
    setSeenId(Number(localStorage.getItem(SEEN_KEY) ?? 0));
    let alive = true;
    fetch("/api/updates", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { announcements?: AnnRow[] }) => {
        if (alive) setItems(d.announcements ?? []);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      localStorage.setItem(SEEN_KEY, String(Math.max(...items.map((a) => a.id))));
    }
  }, [items]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Megaphone className="h-4 w-4 text-indigo-600" /> Yenilikler &amp; Duyurular
      </h3>

      {items === null ? (
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
      ) : items.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">Henüz yayınlanmış bir duyuru yok.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((a) => {
            const kind = KIND[a.kind] ?? KIND.yenilik;
            const isNew = a.id > seenId;
            return (
              <li key={a.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${kind.cls}`}>{kind.label}</span>
                  {a.version && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      v{a.version}
                    </span>
                  )}
                  {isNew && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      <Sparkles className="h-3 w-3" /> YENİ
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-400">{fmtDate(a.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">{a.title}</p>
                {a.body && <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{a.body}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
