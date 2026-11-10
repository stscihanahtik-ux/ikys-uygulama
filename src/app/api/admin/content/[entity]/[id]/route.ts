import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteRow, isEntity, updateRow } from "@/lib/admin-entities";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ entity: string; id: string }> };

function dbError(e: unknown) {
  const code =
    (e as { code?: string } | null)?.code ?? (e as { cause?: { code?: string } } | null)?.cause?.code;
  if (code === "23505") {
    return NextResponse.json({ error: "Bu değer başka bir kayıtta zaten kullanılıyor." }, { status: 409 });
  }
  console.error("Admin content update error:", e);
  return NextResponse.json({ error: "Kayıt güncellenemedi." }, { status: 500 });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { entity, id: idStr } = await params;
  const id = Number(idStr);
  if (!isEntity(entity) || !Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  try {
    const result = await updateRow(entity, id, body as Record<string, unknown>);
    if (!result.ok) {
      if (result.error === "NOT_FOUND") return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ row: result.row });
  } catch (e) {
    return dbError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { entity, id: idStr } = await params;
  const id = Number(idStr);
  if (!isEntity(entity) || !Number.isInteger(id)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  try {
    await deleteRow(entity, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin content delete error:", e);
    return NextResponse.json({ error: "Kayıt silinemedi." }, { status: 500 });
  }
}
