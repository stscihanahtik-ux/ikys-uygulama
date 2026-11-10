import { NextRequest, NextResponse } from "next/server";
import { desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  hashPassword,
  readSession,
  requireAdmin,
  toPublicUser,
  validatePassword,
  validateUsername,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 200): string =>
  (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim().slice(0, max);

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const rows = await db.select().from(users).orderBy(desc(users.id));
  return NextResponse.json({ rows: rows.map(toPublicUser) });
}

/** Yönetici yeni kullanıcı oluşturur */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const username = validateUsername(b.username);
  const password = validatePassword(b.password);
  if (!username) return NextResponse.json({ error: "Geçersiz kullanıcı adı (3–40 karakter, harf/rakam/._-)." }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (existing.length) return NextResponse.json({ error: "Bu kullanıcı adı zaten var." }, { status: 409 });

  const role = b.role === "admin" ? "admin" : "user";
  const [row] = await db
    .insert(users)
    .values({
      username,
      fullName: str(b.fullName, 120),
      email: str(b.email, 160),
      passwordHash: hashPassword(password),
      role,
      isActive: true,
    })
    .returning();
  return NextResponse.json({ row: row ? toPublicUser(row) : null }, { status: 201 });
}

/** Şifre sıfırlama, aktif/pasif, rol değiştirme */
export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const session = await readSession(req);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(b.id);
  const action = str(b.action, 30);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Geçersiz kullanıcı" }, { status: 400 });

  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const target = rows[0];
  if (!target) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  if (action === "password") {
    const next = validatePassword(b.value);
    if (!next) return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalıdır." }, { status: 400 });
    await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, id));
    return NextResponse.json({ ok: true, message: `${target.username} kullanıcısının şifresi güncellendi.` });
  }
  if (action === "active") {
    if (id === session?.userId) return NextResponse.json({ error: "Kendi hesabınızı pasifleştiremezsiniz." }, { status: 400 });
    await db.update(users).set({ isActive: b.value !== false }).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  }
  if (action === "role") {
    if (id === session?.userId) return NextResponse.json({ error: "Kendi rolünüzü değiştiremezsiniz." }, { status: 400 });
    const role = b.value === "admin" ? "admin" : "user";
    if (target.role === "admin" && role !== "admin") {
      const [{ value: adminCount }] = await db.select({ value: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "admin"));
      if (Number(adminCount) <= 1) return NextResponse.json({ error: "Son yönetici hesabı kaldırılamaz." }, { status: 400 });
    }
    await db.update(users).set({ role }).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  }
  if (action === "profile") {
    await db.update(users).set({ fullName: str(b.fullName, 120), email: str(b.email, 160) }).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const session = await readSession(req);
  let id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) {
    const body = (await req.json().catch(() => ({}))) as { id?: unknown };
    id = Number(body.id);
  }
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Geçersiz kullanıcı" }, { status: 400 });
  if (id === session?.userId) return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });

  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const target = rows[0];
  if (!target) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (target.role === "admin") {
    const others = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(2);
    if (others.filter((x) => x.id !== id).length === 0) {
      return NextResponse.json({ error: "Son yönetici hesabı silinemez." }, { status: 400 });
    }
  }
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
