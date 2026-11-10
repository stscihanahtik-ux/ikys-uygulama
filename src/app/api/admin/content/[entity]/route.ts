import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createRow, isEntity, listRows } from "@/lib/admin-entities";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string }> };

function dbError(e: unknown) {
  const code =
    (e as { code?: string } | null)?.code ?? (e as { cause?: { code?: string } } | null)?.cause?.code;
  if (code === "23505") {
    return NextResponse.json({ error: "Bu kayıt zaten mevcut (benzersiz alan çakışması)." }, { status: 409 });
  }
  console.error("Admin content error:", e);
  return NextResponse.json({ error: "Kayıt işlenemedi." }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { entity } = await params;
  if (!isEntity(entity)) return NextResponse.json({ error: "Geçersiz tablo" }, { status: 404 });
  try {
    await ensureSeeded();
    const rows = await listRows(entity);
    return NextResponse.json({ rows });
  } catch (e) {
    return dbError(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { entity } = await params;
  if (!isEntity(entity)) return NextResponse.json({ error: "Geçersiz tablo" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  try {
    const result = await createRow(entity, body as Record<string, unknown>);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ row: result.row }, { status: 201 });
  } catch (e) {
    return dbError(e);
  }
}
