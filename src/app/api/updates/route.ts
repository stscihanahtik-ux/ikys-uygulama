import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";

export const dynamic = "force-dynamic";

// Kullanıcılara açık: yalnızca yayındaki duyuru ve sürüm notları
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.id))
      .limit(10);
    return NextResponse.json({ announcements: rows });
  } catch (error) {
    console.error("Updates GET error:", error);
    return NextResponse.json({ announcements: [] });
  }
}
