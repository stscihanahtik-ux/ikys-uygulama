import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, readSession, validatePassword, verifyPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Giriş yapmış kullanıcı kendi şifresini değiştirir */
export async function PUT(req: NextRequest) {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const current = String(body.currentPassword ?? "");
  const next = validatePassword(body.newPassword);
  if (!next) return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalıdır." }, { status: 400 });

  const rows = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(current, user.passwordHash)) {
    return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 400 });
  }
  await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true, message: "Şifreniz güncellendi." });
}
