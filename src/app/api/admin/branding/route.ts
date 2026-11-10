import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSetting, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export interface Branding {
  appName: string;
  tagline: string;
  footerNote: string;
  supportEmail: string;
  announcement: string;
}

export const DEFAULT_BRANDING: Branding = {
  appName: "İK & Mevzuat Akademisi",
  tagline: "Bu uygulama Cihan Ahtik tarafından yapılmıştır.",
  footerNote: "12 Kanun • SGK Çıkış Kodları • 10 İK Tekniği • 14 Metot • Yasal Süreler • Sesli Robot PRO",
  supportEmail: "",
  announcement: "",
};

const str = (v: unknown, fallback: string, max = 300): string => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || fallback;
};

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const v = await getSetting<Partial<Branding>>("branding");
  return NextResponse.json({ branding: { ...DEFAULT_BRANDING, ...(v ?? {}) } });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const branding: Branding = {
    appName: str(b.appName, DEFAULT_BRANDING.appName, 80),
    tagline: str(b.tagline, DEFAULT_BRANDING.tagline, 160),
    footerNote: str(b.footerNote, DEFAULT_BRANDING.footerNote, 300),
    supportEmail: typeof b.supportEmail === "string" ? b.supportEmail.trim().slice(0, 160) : "",
    announcement: typeof b.announcement === "string" ? b.announcement.trim().slice(0, 300) : "",
  };
  await setSetting("branding", branding);
  return NextResponse.json({ branding });
}
