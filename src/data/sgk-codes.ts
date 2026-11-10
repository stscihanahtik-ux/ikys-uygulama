// SGK işten ayrılış (çıkış nedeni) kodları.
// Kaynak: SGK işten ayrılış bildirgesi kodları; birden fazla resmî ve uzman kaynakta doğrulanan kodlar listelenmiştir.
// Nadir kodlar için Yönetici Paneli > SGK Çıkış Kodları bölümünden kayıt eklenebilir.

export type SgkCategory = "isci" | "isveren" | "yasal" | "diger";
export type SgkFlag = "evet" | "hayir" | "duruma_bagli";

export interface SgkCodeSeed {
  code: string;
  title: string;
  category: SgkCategory;
  severance: SgkFlag;
  unemployment: SgkFlag;
  lawRef: string;
  description: string;
  notes: string;
  sortOrder: number;
}

const HAKLI_NOT =
  "Haklı neden ispatlanmalıdır. Kıdem ve ihbar tazminatı doğmaz; işsizlik ödeneği bağlanmaz. Fesih 6 iş günü içinde kullanılmalıdır (4857 s.K. m.26).";

const madde25 = (code: string, title: string, description: string, bent: string): SgkCodeSeed => ({
  code,
  title,
  category: "isveren",
  severance: "hayir",
  unemployment: "hayir",
  lawRef: `4857 s.K. m.25/II-${bent}`,
  description,
  notes: HAKLI_NOT,
  sortOrder: Number(code),
});

export const SGK_CODES_SEED: SgkCodeSeed[] = [
  {
    code: "01", title: "Deneme süreli iş sözleşmesinin işverence feshi", category: "isveren",
    severance: "hayir", unemployment: "hayir", lawRef: "4857 s.K. m.15",
    description: "İşveren, deneme süresi içinde iş sözleşmesini feshetmiştir.",
    notes: "Deneme süresinde kıdem ve ihbar tazminatı doğmaz. Deneme süresi en fazla 2 aydır.", sortOrder: 1,
  },
  {
    code: "02", title: "Deneme süreli iş sözleşmesinin işçi tarafından feshi", category: "isci",
    severance: "hayir", unemployment: "hayir", lawRef: "4857 s.K. m.15",
    description: "Çalışan deneme süresi içinde iş sözleşmesini feshetmiştir.",
    notes: "Kıdem tazminatı ve işsizlik ödeneği doğmaz.", sortOrder: 2,
  },
  {
    code: "03", title: "Belirsiz süreli iş sözleşmesinin işçi tarafından feshi (istifa)", category: "isci",
    severance: "hayir", unemployment: "hayir", lawRef: "4857 s.K. m.17",
    description: "Çalışan, bildirim süresine uyarak kendi isteğiyle ayrılmıştır.",
    notes: "Kıdem tazminatı ve işsizlik ödeneği doğmaz. Bildirim süresine uyulmazsa işveren ihbar tazminatı talep edebilir.", sortOrder: 3,
  },
  {
    code: "04", title: "Belirsiz süreli iş sözleşmesinin işveren tarafından haklı sebep bildirilmeden feshi", category: "isveren",
    severance: "evet", unemployment: "evet", lawRef: "4857 s.K. m.17",
    description: "İşveren, haklı neden göstermeden sözleşmeyi bildirim süresi vererek feshetmiştir.",
    notes: "En az 1 yıl kıdem varsa kıdem tazminatı doğar. Bildirim süresi kullandırılmadıysa ihbar tazminatı ödenir. İşsizlik ödeneği için 4447 şartları aranır.", sortOrder: 4,
  },
  {
    code: "05", title: "Belirli süreli iş sözleşmesinin sona ermesi", category: "yasal",
    severance: "duruma_bagli", unemployment: "evet", lawRef: "4857 s.K. m.11",
    description: "Sözleşmede belirlenen süre dolmuştur.",
    notes: "Kıdem, sözleşmenin zincirleme yenilenip yenilenmediğine ve 1 yıl şartına göre değerlendirilir. İşsizlik için 4447 şartları (son 120 gün, 600 gün prim) aranır.", sortOrder: 5,
  },
  {
    code: "08", title: "Yaşlılık (emeklilik) nedeniyle ayrılış", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "1475 s.K. m.14",
    description: "Çalışan emeklilik hakkı kazanarak ayrılmıştır.",
    notes: "Emeklilik nedeniyle kıdem tazminatı hakkı doğar (1 yıl şartı). İşsizlik ödeneği bağlanmaz.", sortOrder: 8,
  },
  {
    code: "09", title: "Malulen emeklilik", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "5510 s.K.; 1475 s.K. m.14",
    description: "Çalışan malullük nedeniyle sigortalılıktan ayrılmıştır.",
    notes: "Kıdem tazminatı hakkı doğar. İşsizlik ödeneği bağlanmaz.", sortOrder: 9,
  },
  {
    code: "10", title: "Ölüm", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "1475 s.K. m.14",
    description: "Çalışanın vefatı nedeniyle iş sözleşmesi sona ermiştir.",
    notes: "Kıdem tazminatı yasal mirasçılara ödenir.", sortOrder: 10,
  },
  {
    code: "11", title: "İş kazası sonucu ölüm", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "5510 s.K. m.13; 1475 s.K. m.14",
    description: "İş kazası sonucu vefat nedeniyle sözleşme sona ermiştir.",
    notes: "Kıdem tazminatı mirasçılara ödenir. Kaza SGK'ya ayrıca bildirilmelidir.", sortOrder: 11,
  },
  {
    code: "12", title: "Askerlik", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "1475 s.K. m.14",
    description: "Çalışan askerlik görevine çağrıldığı için ayrılmıştır.",
    notes: "Kıdem hakkı için 1 yıl çalışma şartı aranır. İşsizlik ödeneği bağlanmaz.", sortOrder: 12,
  },
  {
    code: "13", title: "Kadın işçinin evlenmesi", category: "yasal",
    severance: "evet", unemployment: "hayir", lawRef: "1475 s.K. m.14",
    description: "Kadın çalışan, evlenme tarihinden itibaren 1 yıl içinde ayrılmıştır.",
    notes: "Kıdem tazminatı hakkı doğar. İşsizlik ödeneği bağlanmaz.", sortOrder: 13,
  },
  {
    code: "14", title: "Emeklilik için yaş dışındaki şartların tamamlanması", category: "yasal",
    severance: "duruma_bagli", unemployment: "hayir", lawRef: "5510 s.K.",
    description: "Yaş dışındaki emeklilik şartlarını tamamlayan çalışan ayrılmıştır.",
    notes: "Kıdem hakkı çalışma süresi ve kurum kayıtlarına göre değerlendirilir.", sortOrder: 14,
  },
  {
    code: "17", title: "İşyerinin kapanması", category: "isveren",
    severance: "evet", unemployment: "evet", lawRef: "4857 s.K. m.17",
    description: "İşveren işyerini kapatmış; sözleşmeler işveren kaynaklı olarak sona ermiştir.",
    notes: "Kıdem ve ihbar tazminatı doğar. İşsizlik ödeneği için 4447 şartları aranır.", sortOrder: 17,
  },
  {
    code: "18", title: "İşin sona ermesi", category: "isveren",
    severance: "evet", unemployment: "evet", lawRef: "4857 s.K. m.17",
    description: "Yapılan iş tamamlanmış veya sona ermiştir.",
    notes: "Kıdem ve ihbar tazminatı doğar. İşsizlik ödeneği için 4447 şartları aranır.", sortOrder: 18,
  },
  {
    code: "19", title: "Mevsim bitimi (iş sözleşmesinin askıya alınması)", category: "yasal",
    severance: "hayir", unemployment: "duruma_bagli", lawRef: "4857 s.K.",
    description: "Mevsimlik işin bitmesiyle iş sözleşmesi askıya alınmıştır.",
    notes: "Sözleşme feshedilmediği için kıdem doğmaz. İşsizlik ödeneği için 4447 şartları aranır.", sortOrder: 19,
  },
  {
    code: "20", title: "Kampanya bitimi (iş sözleşmesinin askıya alınması)", category: "yasal",
    severance: "hayir", unemployment: "duruma_bagli", lawRef: "4857 s.K.",
    description: "Kampanya işinin bitmesiyle iş sözleşmesi askıya alınmıştır.",
    notes: "Sözleşme tekrar başlatılmayacaksa ilgili fesih kodu kullanılmalıdır.", sortOrder: 20,
  },
  {
    code: "21", title: "Statü değişikliği", category: "diger",
    severance: "duruma_bagli", unemployment: "duruma_bagli", lawRef: "5510 s.K.",
    description: "Çalışanın sigortalılık statüsü değişmiştir.",
    notes: "Kıdem ve işsizlik hakkı yeni statüye göre değerlendirilir.", sortOrder: 21,
  },
  {
    code: "22", title: "Diğer nedenler", category: "diger",
    severance: "hayir", unemployment: "hayir", lawRef: "5510 s.K.",
    description: "Yukarıdaki kodlara girmeyen nedenlerle ayrılış.",
    notes: "Kıdem ve işsizlik ödeneği doğmaz. Özel durumlarda SGK kayıtları ve hukuk birimiyle birlikte değerlendirin.", sortOrder: 22,
  },
  {
    code: "23", title: "İşçi tarafından zorlayıcı nedenlerle fesih", category: "isci",
    severance: "duruma_bagli", unemployment: "duruma_bagli", lawRef: "4857 s.K. m.24",
    description: "İşçi, zorlayıcı bir neden (ör. işin bir haftadan fazla durması) nedeniyle derhal fesih yapmıştır.",
    notes: "Kıdem için en az 1 yıl çalışma ve haklı nedenin ispatı gerekir.", sortOrder: 23,
  },
  {
    code: "24", title: "İşçi tarafından sağlık nedeniyle fesih", category: "isci",
    severance: "evet", unemployment: "evet", lawRef: "4857 s.K. m.24/I",
    description: "Çalışan sağlık nedeniyle iş sözleşmesini feshetmiştir.",
    notes: "Kıdem tazminatı doğar (1 yıl şartı). İşsizlik ödeneği şartlara bağlı olarak talep edilebilir.", sortOrder: 24,
  },
  {
    code: "25", title: "İşçi tarafından işverenin ahlak ve iyi niyet kurallarına aykırı davranışı nedeniyle fesih", category: "isci",
    severance: "evet", unemployment: "evet", lawRef: "4857 s.K. m.24/II",
    description: "İşveren ahlak ve iyi niyet kurallarına aykırı davranmış; çalışan derhal feshetmiştir.",
    notes: "Kıdem tazminatı doğar (1 yıl şartı). İhbar tazminatı doğmaz.", sortOrder: 25,
  },
  {
    code: "29", title: "(Kaldırıldı) İşverenin ahlak ve iyi niyet feshi", category: "diger",
    severance: "hayir", unemployment: "hayir", lawRef: "SGK Genelgesi 2021/9",
    description: "Bu kod 01.04.2021 tarihinde kaldırılmıştır; yerine 42–50 kodları kullanılır.",
    notes: "Yalnızca eski kayıtlar için bilgi amaçlıdır; yeni bildirimde kullanılmaz.", sortOrder: 29,
  },
  {
    code: "32", title: "Özelleştirme nedeniyle fesih", category: "yasal",
    severance: "duruma_bagli", unemployment: "duruma_bagli", lawRef: "4046 s.K. m.21",
    description: "Özelleştirme sürecinde iş sözleşmesi feshedilmiştir.",
    notes: "Kıdem ve işsizlik hakkı 4046 sayılı Kanun hükümlerine göre değerlendirilir.", sortOrder: 32,
  },
  {
    code: "38", title: "Doğum nedeniyle işten ayrılma", category: "yasal",
    severance: "duruma_bagli", unemployment: "hayir", lawRef: "4857 s.K. m.74",
    description: "Çalışan doğum nedeniyle işten ayrılmıştır.",
    notes: "Kıdem hakkı ayrılış şekline ve koşullara göre değerlendirilir. Doğum izni hükümlerini kontrol edin.", sortOrder: 38,
  },
  {
    code: "40", title: "696 sayılı KHK ile kamu işçiliğine geçilememesi", category: "yasal",
    severance: "duruma_bagli", unemployment: "hayir", lawRef: "696 s. KHK",
    description: "Kamu işçiliğine geçilemediği için ayrılış yapılmıştır.",
    notes: "İşsizlik ödeneği 4447 s.K. m.51 kapsamında sayılmamıştır.", sortOrder: 40,
  },
  madde25("42", "İşçinin işvereni yanıltması", "İş sözleşmesi yapılırken gerekli vasıf veya şartların bulunmadığını ileri sürmek ya da gerçeğe aykırı bilgi vermek.", "a"),
  madde25("43", "Şeref ve namusa dokunan söz/davranış, asılsız ihbar", "İşverene veya ailesinin üyelerine şeref ve namusa dokunacak söz veya davranışta bulunmak; asılsız ihbar veya isnatta bulunmak.", "b"),
  madde25("44", "İşverenin başka işçisine cinsel taciz", "İşyerinde başka bir işçiye cinsel tacizde bulunmak.", "c"),
  madde25("45", "Sataşma; sarhoş veya uyuşturucu etkisinde işe gelme", "İşverene, ailesine veya başka işçilere sataşmak; işe sarhoş veya uyuşturucu madde etkisinde gelmek ya da işyerinde kullanmak.", "d"),
  madde25("46", "Güveni kötüye kullanma, hırsızlık, meslek sırrı", "Güveni kötüye kullanmak, hırsızlık yapmak, meslek sırlarını açıklamak gibi doğruluk ve bağlılığa aykırı davranışlarda bulunmak.", "e"),
  madde25("47", "Ertelenmeyen ağır suç (7 günden fazla hapis)", "İşyerinde yedi günden fazla hapisle cezalandırılan ve cezası ertelenmeyen bir suç işlemek.", "f"),
  madde25("48", "İzinsiz ve haklı nedensiz devamsızlık", "İzinsiz ve haklı neden olmadan devamsızlık yapmak (ardı ardına 2 iş günü; bir ayda tatil sonrası 2 kez veya 3 iş günü).", "g"),
  madde25("49", "Görevi yapmakta ısrar etmeme", "Görevleri hatırlatılmasına rağmen yapmakta ısrar etmek.", "h"),
  madde25("50", "İş güvenliğini tehlikeye düşürme veya ağır zarar", "Kendi isteği veya savsaması yüzünden iş güvenliğini tehlikeye düşürmek ya da işyeri eşyasına 30 günlük ücret tutarını aşan zarar vermek.", "ı"),
];
