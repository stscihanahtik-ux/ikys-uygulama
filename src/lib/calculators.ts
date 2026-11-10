// İK Hesaplayıcıları — Türk iş mevzuatına göre TAHMİNİ hesaplamalar.
// Asgari ücret, kıdem tavanı, prim oranları ve vergi dilimleri Yönetici Paneli >
// "Güncel Parametreler" bölümünden değiştirilebilir. Aşağıdakiler varsayılan değerlerdir.

export interface GvDilim {
  limit: number; // yıllık kümülatif üst sınır (TL)
  oran: number; // 0.15 = %15
}

export interface ProductParams {
  kidemTavani: number;
  asgariUcretBrut: number;
  damgaOrani: number;
  sgkIsciOrani: number;
  sgkIsverenOrani: number;
  issizlikIsciOrani: number;
  issizlikIsverenOrani: number;
  gvDilimleri: GvDilim[];
  updatedNote: string;
}

export const DEFAULT_PARAMS: ProductParams = {
  kidemTavani: 73729.87,
  asgariUcretBrut: 33030,
  damgaOrani: 0.00759,
  sgkIsciOrani: 0.14,
  sgkIsverenOrani: 0.155,
  issizlikIsciOrani: 0.01,
  issizlikIsverenOrani: 0.02,
  gvDilimleri: [
    { limit: 190000, oran: 0.15 },
    { limit: 400000, oran: 0.2 },
    { limit: 1500000, oran: 0.27 },
    { limit: 5300000, oran: 0.35 },
    { limit: 999999999999, oran: 0.4 },
  ],
  updatedNote:
    "2026 değerleri: brüt asgari ücret 33.030 TL (net 28.075,50 TL); kıdem tavanı 1 Temmuz – 31 Aralık 2026 dönemi için 73.729,87 TL; 2026 gelir vergisi tarifesi (%15 / %20 / %27 / %35 / %40).",
};

/** Geriye dönük uyumluluk için varsayılan değerler */
export const KIDEM_TAVANI = DEFAULT_PARAMS.kidemTavani;
export const ASGARI_BURUT = DEFAULT_PARAMS.asgariUcretBrut;

export function fmtTL(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

export interface KidemResult {
  brutUcret: number;
  tavanUygulandi: boolean;
  esasUcret: number;
  toplamGun: number;
  kidemBrut: number;
  damgaVergisi: number;
  kidemNet: number;
  aciklama: string;
}

export function hesaplaKidem(
  baslangic: string,
  bitis: string,
  brutUcret: number,
  p: ProductParams = DEFAULT_PARAMS
): KidemResult | null {
  const d1 = new Date(baslangic);
  const d2 = new Date(bitis);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 <= d1 || brutUcret <= 0) return null;
  const toplamGun = Math.floor((d2.getTime() - d1.getTime()) / 86400000);
  const esasUcret = Math.min(brutUcret, p.kidemTavani);
  const kidemBrut = (esasUcret / 365) * toplamGun;
  const damgaVergisi = kidemBrut * p.damgaOrani;
  return {
    brutUcret,
    tavanUygulandi: brutUcret > p.kidemTavani,
    esasUcret,
    toplamGun,
    kidemBrut,
    damgaVergisi,
    kidemNet: kidemBrut - damgaVergisi,
    aciklama:
      "Kıdem tazminatı = (Tavanı aşmayan giydirilmiş brüt ücret / 365) × toplam çalışılan gün. Gelir vergisi ve SGK primi kesilmez; yalnızca damga vergisi kesilir (193 s.K. m.25/7). En az 1 yıl çalışma şartı aranır.",
  };
}

export interface IhbarResult {
  yil: number;
  hafta: number;
  gun: number;
  brutTazminat: number;
  gv: number;
  dv: number;
  netTazminat: number;
  aciklama: string;
}

export function ihbarSuresi(yil: number): { hafta: number; gun: number } {
  if (yil < 0.5) return { hafta: 2, gun: 14 };
  if (yil < 1.5) return { hafta: 4, gun: 28 };
  if (yil < 3) return { hafta: 6, gun: 42 };
  return { hafta: 8, gun: 56 };
}

export function hesaplaIhbar(yil: number, brutUcret: number): IhbarResult {
  const { hafta, gun } = ihbarSuresi(yil);
  const brutTazminat = (brutUcret / 30) * gun;
  // İhbar tazminatı ücret gibi vergilenir — sadeleştirilmiş tahmini kesinti
  const gv = brutTazminat * 0.15;
  const dv = brutTazminat * 0.00759;
  return {
    yil,
    hafta,
    gun,
    brutTazminat,
    gv,
    dv,
    netTazminat: brutTazminat - gv - dv,
    aciklama:
      "4857 s.K. m.17: 6 aydan az kıdemde 2 hafta, 6 ay–1,5 yılda 4 hafta, 1,5–3 yılda 6 hafta, 3 yıldan fazla kıdemde 8 hafta ihbar süresi uygulanır. Süre kullandırılmazsa ihbar tazminatı ödenir ve ücret gibi vergilenir.",
  };
}

export interface IzinResult {
  gun: number;
  aciklama: string;
}

export function hesaplaYillikIzin(yil: number, yas: number): IzinResult {
  let gun: number;
  if (yil < 1) gun = 0;
  else if (yil < 5) gun = 14;
  else if (yil < 15) gun = 20;
  else gun = 26;
  if ((yas > 0 && yas <= 18) || yas >= 50) gun = Math.max(gun, yil >= 1 ? 20 : 0);
  return {
    gun,
    aciklama:
      "4857 s.K. m.53: 1–5 yıl arası en az 14 gün, 5–15 yıl arası en az 20 gün, 15 yıl ve fazlası en az 26 gün. 18 yaş altı ve 50 yaş üstü çalışanlarda izin 20 günden az olamaz. 1 yıl dolmadan ücretli izin hakkı doğmaz.",
  };
}

export interface BrutNetResult {
  brut: number;
  sgkIsci: number;
  issizlikIsci: number;
  gvMatrah: number;
  gelirVergisi: number;
  asgariIstisna: number;
  damga: number;
  net: number;
  isverenMaliyet: number;
  aciklama: string;
}

export function hesaplaBrutNet(
  brut: number,
  kumulatifMatrah = 0,
  p: ProductParams = DEFAULT_PARAMS
): BrutNetResult | null {
  if (brut <= 0) return null;
  const sgkIsci = brut * p.sgkIsciOrani;
  const issizlikIsci = brut * p.issizlikIsciOrani;
  const gvMatrah = brut - sgkIsci - issizlikIsci;

  // Kümülatif dilim hesabı
  const vergiHesapla = (toplamMatrah: number): number => {
    let vergi = 0;
    let onceki = 0;
    for (const d of p.gvDilimleri) {
      if (toplamMatrah > onceki) {
        vergi += (Math.min(toplamMatrah, d.limit) - onceki) * d.oran;
        onceki = d.limit;
      } else break;
    }
    return vergi;
  };

  const oncekiVergi = vergiHesapla(kumulatifMatrah);
  const gelirVergisiBrut = vergiHesapla(kumulatifMatrah + gvMatrah) - oncekiVergi;

  // Asgari ücret gelir vergisi istisnası (asgari ücretin net kısmı üzerinden)
  const asgariMatrah = p.asgariUcretBrut * (1 - p.sgkIsciOrani - p.issizlikIsciOrani);
  const asgariIstisna = Math.min(vergiHesapla(asgariMatrah), Math.max(0, gelirVergisiBrut));
  const gelirVergisi = Math.max(0, gelirVergisiBrut - asgariIstisna);
  const damga = Math.max(0, brut - p.asgariUcretBrut) * p.damgaOrani;
  const net = brut - sgkIsci - issizlikIsci - gelirVergisi - damga;
  const isverenMaliyet = brut * (1 + p.sgkIsverenOrani + p.issizlikIsverenOrani);

  return {
    brut,
    sgkIsci,
    issizlikIsci,
    gvMatrah,
    gelirVergisi,
    asgariIstisna,
    damga,
    net,
    isverenMaliyet,
    aciklama:
      "5510 s.K.: SGK ve işsizlik işçi payları ile 193 s.K. vergi dilimleri Güncel Parametreler'den alınır. Asgari ücrete isabet eden kısım gelir ve damga vergisinden istisnadır. Sonuçlar tahminidir; engellilik indirimi, BES ve diğer istisnalara göre değişir.",
  };
}

export interface FazlaMesaiResult {
  saatUcreti: number;
  zamliSaat: number;
  toplam: number;
  aciklama: string;
}

export function hesaplaFazlaMesai(
  aylikBrut: number,
  saat: number,
  tur: "fazla-calisma" | "fazla-sure"
): FazlaMesaiResult {
  const saatUcreti = aylikBrut / 225;
  const katsayi = tur === "fazla-calisma" ? 1.5 : 1.25;
  const zamliSaat = saatUcreti * katsayi;
  return {
    saatUcreti,
    zamliSaat,
    toplam: zamliSaat * saat,
    aciklama:
      tur === "fazla-calisma"
        ? "4857 s.K. m.41: Haftalık 45 saati aşan fazla çalışma %50 zamlı ödenir. Saat ücreti = Aylık brüt / 225. Yıllık fazla çalışma 270 saati aşamaz."
        : "4857 s.K. m.41: Sözleşmede haftalık süre 45 saatin altında belirlenmişse bu süreyi aşan ve 45 saate kadar olan çalışmalar fazla sürelerle çalışma sayılır ve %25 zamlı ödenir.",
  };
}

export interface IssizlikResult {
  hakEdiyor: boolean;
  sureGun: number;
  aylikTahmini: number;
  aciklama: string;
}

export function hesaplaIssizlik(
  son3YilPrimGun: number,
  son4AyOrtalamaBrut: number,
  kendiIstegiyleMi: boolean,
  p: ProductParams = DEFAULT_PARAMS
): IssizlikResult {
  if (kendiIstegiyleMi) {
    return {
      hakEdiyor: false,
      sureGun: 0,
      aylikTahmini: 0,
      aciklama:
        "4447 s.K. m.51: Kendi istek ve kusuru dışında işsiz kalmak şarttır. İstifa (SGK kodu 03) halinde kural olarak işsizlik ödeneği bağlanmaz.",
    };
  }
  let sureGun = 0;
  if (son3YilPrimGun >= 1080) sureGun = 300;
  else if (son3YilPrimGun >= 900) sureGun = 240;
  else if (son3YilPrimGun >= 600) sureGun = 180;

  if (sureGun === 0) {
    return {
      hakEdiyor: false,
      sureGun: 0,
      aylikTahmini: 0,
      aciklama:
        "4447 s.K. m.50: Son 3 yılda en az 600 gün işsizlik sigortası primi ve son 120 gün hizmet akdine tabi çalışma gerekir.",
    };
  }
  const hesaplanan = son4AyOrtalamaBrut * 0.4;
  const tavan = p.asgariUcretBrut * 0.8;
  return {
    hakEdiyor: true,
    sureGun,
    aylikTahmini: Math.min(hesaplanan, tavan),
    aciklama: `4447 s.K. m.50: ${son3YilPrimGun} gün prim ile ${sureGun} gün ödenek. Tahmini ödenek: son 4 ay prime esas kazanç ortalamasının %40'ı; hesapta brüt asgari ücretin %80'i üst sınır olarak kullanılır. 30 gün içinde İŞKUR'a başvurulmalıdır.`,
  };
}
