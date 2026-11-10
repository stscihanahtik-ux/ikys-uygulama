import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  ADMIN_COOKIE,
  checkRateLimit,
  clearFailures,
  clearSessionCookie,
  createSessionToken,
  ensureDefaultAdmin,
  findUserByUsername,
  hashPassword,
  readSession,
  recordFailure,
  setSessionCookie,
  toPublicUser,
  touchLogin,
  validatePassword,
  verifyPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Panel açılırken: yapılandırılmış mı, oturum var mı + güvenli tanılama bilgisi */
export async function GET(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    const session = await readSession(req);
    const fwd = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    return NextResponse.json({
      configured: true,
      authenticated: !!session && session.role === "admin",
      user: session ? { username: session.username, role: session.role, fullName: session.fullName } : null,
      diag: {
        db: "ok",
        sessionRole: session?.role ?? null,
        adminCookie: req.cookies.has(ADMIN_COOKIE),
        userCookie: req.cookies.has("ik_user_session"),
        https: fwd === "https" || req.nextUrl.protocol === "https:",
        sessionDays: 7,
      },
    });
  } catch (error) {
    console.error("Admin login GET error:", error);
    return NextResponse.json({
      configured: false,
      authenticated: false,
      diag: { db: "error", detail: error instanceof Error ? error.message : "bilinmeyen" },
    }, { status: 200 });
  }
}

/** Yönetici girişi: kullanıcı adı + şifre (veritabanından doğrulanır) */
export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    const limit = checkRateLimit(req);
    if (!limit.ok) return NextResponse.json({ error: limit.retry }, { status: 429 });

    const body = (await req.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
    const username = String(body.username ?? "admin").trim().toLowerCase();
    const password = validatePassword(body.password);
    if (!password) return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });

    const user = await findUserByUsername(username);
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      recordFailure(req);
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Bu hesap yönetici yetkisine sahip değil." }, { status: 403 });
    }

    clearFailures(req);
    const token = await createSessionToken({ userId: user.id, username: user.username, role: "admin" });
    const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
    setSessionCookie(res, token, req);
    await touchLogin(user.id);
    return res;
  } catch (error) {
    console.error("Admin login POST error:", error);
    return NextResponse.json({ error: "Giriş yapılamadı." }, { status: 500 });
  }
}

/** Kendi şifresini değiştir (yönetici oturumu gerekir) */
export async function PUT(req: NextRequest) {
  const session = await readSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim. Lütfen Admin girişi yapın." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { currentPassword?: unknown; newPassword?: unknown };
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

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res, req);
  return res;
}
