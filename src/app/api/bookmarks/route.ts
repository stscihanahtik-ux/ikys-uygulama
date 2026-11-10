import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(bookmarks)
      .orderBy(desc(bookmarks.createdAt));
    return NextResponse.json({ bookmarks: rows });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json(
      { error: "Yer imleri yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemType, itemId, title } = body;

    if (!itemType || typeof itemId !== "number" || !title) {
      return NextResponse.json(
        { error: "Eksik yer imi bilgisi." },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(eq(bookmarks.itemType, itemType), eq(bookmarks.itemId, itemId))
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return NextResponse.json({ removed: true, itemType, itemId });
    }

    const [created] = await db
      .insert(bookmarks)
      .values({ itemType, itemId, title })
      .returning();

    return NextResponse.json({ removed: false, bookmark: created });
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json(
      { error: "Yer imi güncellenemedi." },
      { status: 500 }
    );
  }
}
