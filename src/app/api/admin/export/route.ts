import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { exportCsv } from "@/lib/admin-entities";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const entity = req.nextUrl.searchParams.get("entity") ?? "";
  if (entity !== "laws" && entity !== "topics" && entity !== "questions") {
    return NextResponse.json({ error: "Geçersiz tablo" }, { status: 400 });
  }

  const { filename, csv } = await exportCsv(entity);
  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
