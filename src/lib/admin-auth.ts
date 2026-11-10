import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSetting } from "@/lib/settings";

export const ADMIN_COOKIE = "ik_admin_session";
export const USER_COOKIE = "ik_user_session";
// 7 gün: panel uzun süre açık kalsa da oturum ansızın düşmesin.
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export type UserRole = "admin" | "user";

export interface SessionUser {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface PublicUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

// ---------- Şifre hashleme (scrypt + rastgele tuz) ----------
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

// ---------- Oturum imzalama anahtarı ----------
// .env dosyası platform tarafından her derlemede yeniden yazılabildiği için anahtar
// veritabanında tutulur. Next.js route'ları ayrı modül örneklerinde çalışabileceğinden
// "önce ekle, sonra tekrar oku" yöntemiyle yarış durumu (race) tamamen engellenir.
let secretPromise: Promise<string> | null = null;

/** Veritabanına erişilemediğinde dahi tüm route paketlerinin aynı anahtarı üretmesini sağlar. */
function fallbackSecret(): string {
  return createHash("sha256")
    .update(`ik-akademisi-session-v2|${process.env.DATABASE_URL ?? "local"}`)
    .digest("hex");
}

async function getSigningSecret(): Promise<string> {
  if (!secretPromise) {
    secretPromise = (async () => {
      try {
        const existing = await getSetting<string>("auth_secret");
        if (typeof existing === "string" && existing.length >= 32) return existing;
        const candidate = randomBytes(32).toString("hex");
        // ON CONFLICT DO NOTHING: ilk yazan kazanır, kimse başkasının anahtarını ezmez.
        await db
          .insert(siteSettings)
          .values({ key: "auth_secret", value: candidate, updatedAt: new Date() })
          .onConflictDoNothing();
        // Kendi ürettiğimiz değeri DEĞİL, veritabanındaki kazanan değeri döndür.
        const stored = await getSetting<string>("auth_secret");
        if (typeof stored === "string" && stored.length >= 32) return stored;
        return candidate;
      } catch (err) {
        console.error("auth_secret okunamadı, deterministik yedek anahtar kullanılıyor:", err);
        return fallbackSecret();
      }
    })().catch((err) => {
      secretPromise = null;
      throw err;
    });
  }
  return secretPromise;
}

/** İmza doğrulamasında denenecek anahtarlar (geçici DB hatasında oturum düşmesin). */
async function candidateSecrets(): Promise<string[]> {
  const list: string[] = [await getSigningSecret(), fallbackSecret()];
  const legacy =
    process.env.ADMIN_SECRET?.trim() ||
    (process.env.ADMIN_PASSWORD?.trim() ? `ik-admin:${process.env.ADMIN_PASSWORD!.trim()}` : "");
  if (legacy) list.push(legacy);
  return [...new Set(list)];
}

function signatureMatches(payload: string, sig: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

export async function createSessionToken(user: Pick<SessionUser, "userId" | "username" | "role">): Promise<string> {
  const secret = await getSigningSecret();
  const payload = base64url(
    JSON.stringify({ uid: user.userId, u: user.username, r: user.role, exp: Date.now() + SESSION_MS })
  );
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function readSession(req: NextRequest): Promise<SessionUser | null> {
  // Yönetici ve üye oturumları ayrı çerezlerdedir; biri diğerini ezmez.
  const tokens = [
    req.cookies.get(ADMIN_COOKIE)?.value,
    req.cookies.get(USER_COOKIE)?.value,
  ].filter((t): t is string => Boolean(t));
  if (tokens.length === 0) return null;

  let secrets: string[];
  try {
    secrets = await candidateSecrets();
  } catch {
    return null;
  }

  for (const token of tokens) {
    const [payload, sig] = token.split(".");
    if (!payload || !sig || !secrets.some((s) => signatureMatches(payload, sig, s))) continue;

    let data: { uid?: number; u?: string; r?: string; exp?: number };
    try {
      data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
      continue;
    }
    if (!data.uid || !data.exp || data.exp < Date.now()) continue;

    try {
      const rows = await db.select().from(users).where(eq(users.id, data.uid as number)).limit(1);
      const row = rows[0];
      if (!row || !row.isActive || row.role !== data.r) continue;
      return { userId: row.id, username: row.username, fullName: row.fullName, role: row.role as UserRole };
    } catch (err) {
      console.error("Oturum kullanıcı doğrulaması sırasında veritabanı hatası:", err);
      continue;
    }
  }
  return null;
}

export function toPublicUser(row: typeof users.$inferSelect): PublicUser {
  return {
    id: row.id,
    username: row.username,
    fullName: row.fullName,
    email: row.email,
    role: row.role as UserRole,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
  };
}

/** İlk çalıştırmada varsayılan yöneticiyi oluşturur (şifre .env'den alınır, yoksa varsayılan). */
let bootstrapPromise: Promise<void> | null = null;

export async function ensureDefaultAdmin(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
      if (admins.length > 0) return;
      // .env dosyası platform tarafından her derlemede yeniden yazılabildiği için
      // varsayılan şifre koddan da gelebilir; her iki durumda aynı şifre kullanılır.
      // Canlıya almadan önce panelden mutlaka değiştirilmelidir.
      const envPassword = process.env.ADMIN_PASSWORD?.trim();
      const password = envPassword && envPassword.length >= 6 ? envPassword : "S0m1JT0G0hfG4uYP";
      await db
        .insert(users)
        .values({
          username: "admin",
          fullName: "Cihan Ahtik",
          email: "",
          passwordHash: hashPassword(password),
          role: "admin",
          isActive: true,
        })
        .onConflictDoNothing();
      // Oturum anahtarını da erkenden oluştur
      await getSigningSecret();
    })().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

/** Yönetici API'lerinde kullanılır. Yetkisizse 401 yanıtı döner, yetkiliyse null. */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const session = await readSession(req);
  if (session?.role === "admin") return null;
  return NextResponse.json(
    { error: "Yetkisiz erişim. Lütfen Admin girişi yapın." },
    { status: 401 }
  );
}

/** Giriş yapmış herhangi bir kullanıcı için */
export async function requireUser(req: NextRequest): Promise<NextResponse | null> {
  const session = await readSession(req);
  if (session) return null;
  return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
}

/** Kaba kuvvet koruması: IP başına 10 dakikada en fazla 10 hatalı deneme */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function checkRateLimit(req: NextRequest): { ok: boolean; retry?: string } {
  const key = clientKey(req);
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.resetAt > now && entry.count >= 10) {
    return { ok: false, retry: "Çok fazla hatalı deneme. 10 dakika sonra tekrar deneyin." };
  }
  return { ok: true };
}

export function recordFailure(req: NextRequest): void {
  const key = clientKey(req);
  const now = Date.now();
  const entry = attempts.get(key);
  const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + 10 * 60 * 1000 };
  current.count += 1;
  attempts.set(key, current);
}

export function clearFailures(req: NextRequest): void {
  attempts.delete(clientKey(req));
}

/**
 * `secure` yalnızca istek gerçekten HTTPS ise açılır.
 * Üretim derlemesi HTTP üzerinden (localhost / LAN / ters proxy arkası) açıldığında
 * Secure çerezi tarayıcı saklamadığı için "admindeyken yetkisiz erişim" hatası oluşuyordu.
 */
export function setSessionCookie(
  res: NextResponse,
  token: string,
  req?: NextRequest,
  role: UserRole = "admin"
): void {
  const fwd = req?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const isHttps = fwd === "https" || req?.nextUrl.protocol === "https:";
  const name = role === "admin" ? ADMIN_COOKIE : USER_COOKIE;
  res.cookies.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export function clearSessionCookie(res: NextResponse, req?: NextRequest): void {
  const fwd = req?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const isHttps = fwd === "https" || req?.nextUrl.protocol === "https:";
  for (const name of [ADMIN_COOKIE, USER_COOKIE]) {
    res.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 0,
    });
  }
}

export async function findUserByUsername(username: string) {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

export async function touchLogin(userId: number): Promise<void> {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}

export function validateUsername(value: unknown): string | null {
  const s = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,40}$/.test(s)) return null;
  return s;
}

export function validatePassword(value: unknown): string | null {
  const s = String(value ?? "");
  if (s.length < 6 || s.length > 200) return null;
  return s;
}

/** Tüm oturumları geçersiz kılmak istenirse kullanılır. Anahtar tek bir değerle yazılır. */
export async function rotateSigningSecret(): Promise<void> {
  const value = randomBytes(32).toString("hex");
  await db
    .insert(siteSettings)
    .values({ key: "auth_secret", value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  secretPromise = null;
  await getSigningSecret();
}
