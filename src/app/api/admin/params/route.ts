import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getParams, setSetting } from "@/lib/settings";
import type { GvDilim, ProductParams } from "@/lib/calculators";

export const dynamic = "force-dynamic";

/** Oran alanları 0.15 veya 15 (yüzde) olarak girilebilir: üst sınırı aşan değerler yüzde sayılır */
function rate(v: unknown, max: number): number | null {
  let n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n > max) n = n / 100;
  return n >= 0 && n <= max ? n : null;
}

function amount(v: unknown, min: number, max: number): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ params: await getParams() });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const kidemTavani = amount(b.kidemTavani, 1000, 100_000_000);
  const asgariUcretBrut = amount(b.asgariUcretBrut, 1000, 100_000_000);
  const damgaOrani = rate(b.damgaOrani, 0.1);
  const sgkIsciOrani = rate(b.sgkIsciOrani, 0.5);
  const sgkIsverenOrani = rate(b.sgkIsverenOrani, 0.5);
  const issizlikIsciOrani = rate(b.issizlikIsciOrani, 0.5);
  const issizlikIsverenOrani = rate(b.issizlikIsverenOrani, 0.5);

  const rawDilim = Array.isArray(b.gvDilimleri) ? (b.gvDilimleri as Record<string, unknown>[]) : [];
  const gvDilimleri: GvDilim[] = [];
  for (const x of rawDilim) {
    const limit = amount(x.limit, 0, 1e13);
    const oran = rate(x.oran, 1);
    if (limit !== null && oran !== null) gvDilimleri.push({ limit, oran });
  }
  gvDilimleri.sort((a, c) => a.limit - c.limit);

  const fields: Record<string, number | null> = {
    "Kıdem tavanı": kidemTavani,
    "Asgari ücret (brüt)": asgariUcretBrut,
    "Damga vergisi oranı (0–0,1)": damgaOrani,
    "SGK işçi oranı": sgkIsciOrani,
    "SGK işveren oranı": sgkIsverenOrani,
    "İşsizlik işçi oranı": issizlikIsciOrani,
    "İşsizlik işveren oranı": issizlikIsverenOrani,
  };
  const bad = Object.entries(fields).find(([, v]) => v === null);
  if (bad) return NextResponse.json({ error: `Geçersiz değer: ${bad[0]}` }, { status: 400 });
  if (gvDilimleri.length === 0) {
    return NextResponse.json({ error: "En az bir gelir vergisi dilimi girin (ör. 190000 0.15)." }, { status: 400 });
  }

  const params: ProductParams = {
    kidemTavani: kidemTavani as number,
    asgariUcretBrut: asgariUcretBrut as number,
    damgaOrani: damgaOrani as number,
    sgkIsciOrani: sgkIsciOrani as number,
    sgkIsverenOrani: sgkIsverenOrani as number,
    issizlikIsciOrani: issizlikIsciOrani as number,
    issizlikIsverenOrani: issizlikIsverenOrani as number,
    gvDilimleri,
    updatedNote: String(b.updatedNote ?? "").trim().slice(0, 400),
  };
  await setSetting("params", params);
  return NextResponse.json({ params });
}
