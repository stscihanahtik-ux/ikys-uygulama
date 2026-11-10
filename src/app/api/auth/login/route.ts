import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  clearFailures,
  createSessionToken,
  ensureDefaultAdmin,
  findUserByUsername,
  recordFailure,
  setSessionCookie,
  toPublicUser,
  touchLogin,
  validatePassword,
  verifyPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Üye girişi (yönetici de giriş yapabilir; panel ayrı yetki ister) */
export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    if (!checkRateLimit(req).ok) return NextResponse.json({ error: "Çok fazla deneme. 10 dakika sonra tekrar deneyin." }, { status: 429 });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = validatePassword(body.password);
    if (!username || !password) return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });

    const user = await findUserByUsername(username);
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      recordFailure(req);
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
    }

    clearFailures(req);
    const token = await createSessionToken({ userId: user.id, username: user.username, role: user.role as "admin" | "user" });
    const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
    setSessionCookie(res, token, req, user.role === "admin" ? "admin" : "user");
    await touchLogin(user.id);
    return res;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json({ error: "Giriş yapılamadı." }, { status: 500 });
  }
}
