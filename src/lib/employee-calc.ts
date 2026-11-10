import { addDays, addMonths, diffDays } from "@/lib/business-days";
import { hesaplaIhbar, hesaplaKidem, hesaplaYillikIzin, type ProductParams } from "@/lib/calculators";

// Çalışan kaydından yasal takvim ve tahmini ödemeleri üretir (yalnızca hesaplama; veri yazmaz).

export interface EmployeeRecord {
  id: number;
  fullName: string;
  department: string;
  jobTitle: string;
  contractType: string;
  startDate: string;
  endDate: string | null;
  grossSalary: number;
  probationMonths: number;
  usedLeaveDays: number;
  exitCode: string;
  kvkkNoticeDate: string;
  notes: string;
}

export interface SgkRecord {
  code: string;
  title: string;
  category: string;
  severance: string;
  unemployment: string;
  lawRef: string;
  notes: string;
}

export interface TimelineItem {
  label: string;
  date: string;
  lawRef: string;
}

export interface EmployeeComputed {
  status: "aktif" | "ayrildi";
  kidemGun: number;
  kidemText: string;
  denemeBitis: string | null;
  sgkGirisSon: string;
  izinHakki: number;
  kalanIzin: number;
  gunlukUcret: number;
  izinUcreti: number;
  timeline: TimelineItem[];
  kidem: { brut: number; net: number } | null;
  ihbar: { hafta: number; brut: number } | null;
  warnings: string[];
}

/** 1 yıl 2 ay 3 gün biçiminde süre metni */
export function yilAyGun(gun: number): string {
  const yil = Math.floor(gun / 365);
  const kalan = gun % 365;
  const ay = Math.floor(kalan / 30);
  const g = kalan % 30;
  const parts = [yil ? `${yil} yıl` : "", ay ? `${ay} ay` : "", g ? `${g} gün` : ""].filter(Boolean);
  return parts.length ? parts.join(" ") : "0 gün";
}

export function computeEmployee(
  e: EmployeeRecord,
  p: ProductParams,
  sgk: SgkRecord | undefined,
  today: string
): EmployeeComputed {
  const end = e.endDate || null;
  const kidemGun = Math.max(0, diffDays(e.startDate, end ?? today));
  const kidemYil = kidemGun / 365.25;
  const denemeBitis = e.probationMonths > 0 ? addDays(addMonths(e.startDate, e.probationMonths), -1) : null;
  const sgkGirisSon = addDays(e.startDate, -1);
  const izinHakki = kidemYil >= 1 ? hesaplaYillikIzin(kidemYil, 0).gun : 0;
  const kalanIzin = Math.max(0, izinHakki - e.usedLeaveDays);
  const gunlukUcret = e.grossSalary / 30;
  const izinUcreti = kalanIzin * gunlukUcret;

  const timeline: TimelineItem[] = [
    { label: "SGK işe giriş bildirgesi (son gün)", date: sgkGirisSon, lawRef: "5510 s.K. m.8" },
  ];
  if (denemeBitis) timeline.push({ label: "Deneme süresi sonu (en fazla 2 ay)", date: denemeBitis, lawRef: "4857 s.K. m.15" });
  const birinciYil = addMonths(e.startDate, 12);
  if (birinciYil > today) timeline.push({ label: "1. yıl dolumu (yıllık izin hakkı doğar)", date: birinciYil, lawRef: "4857 s.K. m.53" });

  const warnings: string[] = [];
  let kidem: EmployeeComputed["kidem"] = null;
  let ihbar: EmployeeComputed["ihbar"] = null;

  if (end) {
    timeline.push({ label: "SGK işten ayrılış bildirgesi (son gün)", date: addDays(end, 10), lawRef: "5510 s.K. m.9" });
    if (sgk && sgk.unemployment !== "hayir") {
      timeline.push({ label: "İŞKUR işsizlik başvurusu (son gün)", date: addDays(end, 30), lawRef: "4447 s.K. m.50" });
    }
    timeline.push({ label: "İbraname için uygun tarih (ayrılıştan 1 ay sonra)", date: addMonths(end, 1), lawRef: "6098 s.K. m.420" });
    timeline.push({ label: "İşçilik alacakları zamanaşımı (5 yıl)", date: addMonths(end, 60), lawRef: "6098 s.K. m.146" });

    if (sgk) {
      if (sgk.severance !== "hayir") {
        if (kidemYil >= 1) {
          const r = hesaplaKidem(e.startDate, end, e.grossSalary, p);
          if (r) kidem = { brut: r.kidemBrut, net: r.kidemNet };
        } else {
          warnings.push("1 yıldan kısa çalışma: kıdem tazminatı doğmaz.");
        }
        if (sgk.severance === "duruma_bagli") warnings.push("Kıdem hakkı duruma bağlı; koşulları hukuk biriminizle doğrulayın.");
      }
      if (sgk.severance === "evet" && sgk.category === "isveren") {
        const r = hesaplaIhbar(kidemYil, e.grossSalary);
        ihbar = { hafta: r.hafta, brut: r.brutTazminat };
        warnings.push("İhbar tazminatı yalnızca bildirim süresi kullandırılmadıysa ödenir.");
      }
    } else if (e.exitCode) {
      warnings.push(`SGK çıkış kodu bulunamadı: ${e.exitCode}`);
    } else {
      warnings.push("Çıkış kodu seçilmemiş; SGK bildirimi için kod girin.");
    }
  }

  if (!e.kvkkNoticeDate) warnings.push("KVKK aydınlatma tarihi girilmemiş.");

  return {
    status: end ? "ayrildi" : "aktif",
    kidemGun,
    kidemText: yilAyGun(kidemGun),
    denemeBitis,
    sgkGirisSon,
    izinHakki,
    kalanIzin,
    gunlukUcret,
    izinUcreti,
    timeline,
    kidem,
    ihbar,
    warnings,
  };
}
