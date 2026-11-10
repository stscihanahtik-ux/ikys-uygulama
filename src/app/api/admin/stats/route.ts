import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  bookmarks,
  chatMessages,
  dailyInsights,
  employees,
  featureRequests,
  hrTopics,
  laws,
  questions,
  quizAttempts,
  sgkCodes,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const n = (rows: { value: number }[]) => Number(rows[0]?.value ?? 0);

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const [l, t, q, a, f, s, e, c, b, z, d, u] = await Promise.all([
    db.select({ value: count() }).from(laws),
    db.select({ value: count() }).from(hrTopics),
    db.select({ value: count() }).from(questions),
    db.select({ value: count() }).from(announcements),
    db.select({ value: count() }).from(featureRequests),
    db.select({ value: count() }).from(sgkCodes),
    db.select({ value: count() }).from(employees),
    db.select({ value: count() }).from(chatMessages),
    db.select({ value: count() }).from(bookmarks),
    db.select({ value: count() }).from(quizAttempts),
    db.select({ value: count() }).from(dailyInsights),
    db.select({ value: count() }).from(users).where(eq(users.role, "user")),
  ]);

  return NextResponse.json({
    laws: n(l),
    topics: n(t),
    questions: n(q),
    announcements: n(a),
    features: n(f),
    sgkCodes: n(s),
    employees: n(e),
    chatMessages: n(c),
    bookmarks: n(b),
    quizAttempts: n(z),
    dailyInsights: n(d),
    users: n(u),
  });
}
