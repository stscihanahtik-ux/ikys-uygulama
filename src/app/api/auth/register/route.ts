import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  checkRateLimit,
  clearFailures,
  createSessionToken,
  ensureDefaultAdmin,
  findUserByUsername,
  hashPassword,
  recordFailure,
  setSessionCookie,
  toPublicUser,
  validatePassword,
  validateUsername,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Herkese açık üye kaydı */
export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    if (!checkRateLimit(req).ok) {
      return NextResponse.json({ error: "Çok fazla deneme. 10 dakika sonra tekrar deneyin." }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const username = validateUsername(body.username);
    const password = validatePassword(body.password);
    if (!username) return NextResponse.json({ error: "Kullanıcı adı 3–40 karakter, yalnızca harf, rakam, nokta, _ veya - içerebilir." }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });

    const existing = await findUserByUsername(username);
    if (existing) return NextResponse.json({ error: "Bu kullanıcı adı zaten alınmış." }, { status: 409 });

    const [row] = await db
      .insert(users)
      .values({
        username,
        fullName: String(body.fullName ?? "").trim().slice(0, 120),
        email: String(body.email ?? "").trim().slice(0, 160),
        passwordHash: hashPassword(password),
        role: "user",
        isActive: true,
        lastLoginAt: new Date(),
      })
      .returning();
    if (!row) return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 500 });

    clearFailures(req);
    const token = await createSessionToken({ userId: row.id, username: row.username, role: "user" });
    const res = NextResponse.json({ ok: true, user: toPublicUser(row) }, { status: 201 });
    setSessionCookie(res, token, req, "user");
    return res;
  } catch (error) {
    recordFailure(req);
    console.error("Register error:", error);
    return NextResponse.json({ error: "Kayıt yapılamadı." }, { status: 500 });
  }
}
