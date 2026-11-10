export interface TemplateItem {
  id: string;
  title: string;
  lawRef: string;
  description: string;
  warning?: string;
  fields: { key: string; label: string; placeholder: string }[];
  body: string;
}

const STD_FIELDS = [
  { key: "calisan", label: "Çalışan Adı Soyadı", placeholder: "Ayşe Yılmaz" },
  { key: "sirket", label: "Şirket Unvanı", placeholder: "ABC Teknoloji A.Ş." },
  { key: "tarih", label: "Tarih", placeholder: "18.06.2026" },
];

export const TEMPLATES: TemplateItem[] = [
  {
    id: "savunma",
    title: "Savunma İstemi Yazısı",
    lawRef: "4857 s.K. m.19",
    description: "İş güvencesi kapsamındaki çalışandan fesih öncesi yazılı savunma istemek için zorunlu yazı.",
    warning: "Savunma alınmadan yapılan performans/davranış feshi geçersiz sayılır. En az 2-3 iş günü süre verin.",
    fields: [...STD_FIELDS, { key: "olay", label: "Olayın Özeti", placeholder: "vardiyaya geç gelme / performans düşüklüğü" }],
    body: "SAVUNMA İSTEMİ YAZISI\n\nSayı: [....]    Tarih: {{tarih}}\n\nSayın {{calisan}}\n{{sirket}} bünyesinde görev yapmaktasınız.\n\nHakkınızda tespit edilen \"{{olay}}\" hususu ile ilgili olarak, 4857 Sayılı İş Kanunu'nun 19. maddesi uyarınca savunmanızı işbu yazının tebliğinden itibaren 3 iş günü içinde yazılı olarak İnsan Kaynakları Departmanına iletmenizi rica ederiz.\n\nSavunmanız değerlendirilmeden hakkınızda herhangi bir fesih kararı verilmeyeceğini bilgilerinize sunarız.\n\n{{sirket}}\nİnsan Kaynakları Departmanı\nİmza / Kaşe\n\nTebellüğ Eden: {{calisan}}    Tarih/İmza: ................",
  },
  {
    id: "tutanak",
    title: "Olay Tespit Tutanağı",
    lawRef: "4857 s.K. m.25-26",
    description: "İşyeri olaylarını tanıklarıyla belgeleyen, disiplin ve fesih süreçlerinde delil olan tutanak.",
    warning: "Haklı fesih (m.25/II) yetkisi olayın öğrenilmesinden itibaren 6 iş günü içinde kullanılmalıdır (m.26).",
    fields: [...STD_FIELDS, { key: "olay", label: "Olayın Özeti", placeholder: "Kim, ne zaman, nerede, ne yaptı?" }],
    body: "OLAY TESPİT TUTANAĞI\n\nŞirket: {{sirket}}\nTarih/Saat: {{tarih}}\nİlgili Çalışan: {{calisan}}\n\nOLAYIN ÖZETİ:\n{{olay}}\n\nGÖRGÜ TANIKLARI:\n1) Ad Soyad: ....................  İmza: ............\n2) Ad Soyad: ....................  İmza: ............\n\nEKLER: ( ) Kamera kaydı  ( ) Puantaj  ( ) E-posta/yazışma  ( ) Diğer: ........\n\nTutanak Düzenleyen: ....................  İmza: ............\nBirim Yöneticisi: ....................  İmza: ............",
  },
  {
    id: "izin-formu",
    title: "Yıllık Ücretli İzin Talep Formu",
    lawRef: "4857 s.K. m.53-56",
    description: "Çalışanın yıllık izin talebini ve izin bakiyesini kayıt altına alan form.",
    fields: [...STD_FIELDS, { key: "olay", label: "İzin Tarih Aralığı", placeholder: "01.07.2026 – 12.07.2026 (10 iş günü)" }],
    body: "YILLIK ÜCRETLİ İZİN TALEP FORMU\n\nŞirket: {{sirket}}\nÇalışan: {{calisan}}\nTalep Tarihi: {{tarih}}\n\nHak Edilen İzin: ...... gün   Kullanılan: ...... gün   Kalan: ...... gün\nTalep Edilen İzin Aralığı: {{olay}}\nİzinde Ulaşılacak Adres/Telefon: ....................................\n\nÇalışan İmzası: ................\nYönetici Onayı: ................\nİK Onayı: ................\n\nNot: Yıllık ücretli izin hakkından vazgeçilemez; izin bölünerek kullandırılabilir (m.56).",
  },
  {
    id: "calisma-belgesi",
    title: "Çalışma Belgesi",
    lawRef: "4857 s.K. m.28",
    description: "İşten ayrılan çalışana verilmesi zorunlu, görev ve çalışma süresini gösteren belge.",
    warning: "Belge verilmemesi veya gerçeğe aykırı düzenlenmesi idari para cezasına tabidir.",
    fields: [...STD_FIELDS, { key: "olay", label: "Görev ve Çalışma Aralığı", placeholder: "01.03.2022 – 18.06.2026 arasında İK Uzmanı" }],
    body: "ÇALIŞMA BELGESİ\n\n{{sirket}} bünyesinde {{olay}} olarak görev yapan Sayın {{calisan}}'nın iş sözleşmesi sona ermiştir.\n\nİşbu belge, 4857 Sayılı İş Kanunu'nun 28. maddesi uyarınca {{tarih}} tarihinde düzenlenmiştir.\n\n{{sirket}}\nİnsan Kaynakları Departmanı\nİmza / Kaşe",
  },
  {
    id: "onboarding-listesi",
    title: "İşe Giriş (Onboarding) Kontrol Listesi",
    lawRef: "5510 m.8 • 6331 m.15-17 • 4857 m.75",
    description: "Yeni çalışanın yasal ve operasyonel tüm işbaşı adımlarını eksiksiz tamamlamak için kontrol listesi.",
    fields: STD_FIELDS,
    body: "İŞE GİRİŞ KONTROL LİSTESİ\n\nŞirket: {{sirket}}   Çalışan: {{calisan}}   Tarih: {{tarih}}\n\n☐ SGK işe giriş bildirgesi işbaşından en geç 1 gün önce verildi (5510 m.8)\n☐ İşe giriş sağlık raporu alındı (6331 m.15) — raporsuz işbaşı yapılmaz\n☐ Temel İSG eğitimi tamamlandı, tutanak dosyada (6331 m.17)\n☐ İş sözleşmesi imzalandı (deneme süresi en fazla 2 ay — m.15)\n☐ KVKK Aydınlatma Metni tebliğ edildi (6698 m.10)\n☐ Özlük dosyası tam: kimlik, ikametgâh, diploma, adli sicil (4857 m.75)\n☐ Ekipman, e-posta, sistem erişimleri hazır; Buddy atandı\n☐ 30-60-90 gün planı yapıldı; 45. gün deneme değerlendirmesi takvime işlendi\n\nİK Sorumlusu İmza: ................",
  },
  {
    id: "offboarding-listesi",
    title: "İşten Çıkış (Offboarding) Kontrol Listesi",
    lawRef: "4857 m.17-28 • 5510 m.9 • TBK m.420",
    description: "Ayrılışta tazminat, SGK bildirimi, zimmet ve belge adımlarını kaçırmamak için kontrol listesi.",
    warning: "İbraname çıkış günü İMZALATILMAZ. TBK m.420: ayrılıştan en az 1 ay sonra, banka ödemesiyle ve kalem kalem düzenlenir.",
    fields: STD_FIELDS,
    body: "İŞTEN ÇIKIŞ KONTROL LİSTESİ\n\nŞirket: {{sirket}}   Çalışan: {{calisan}}   Tarih: {{tarih}}\n\n☐ Fesih/istifa yazısı (gerekiyorsa m.19 savunma tutanağı) dosyada\n☐ İhbar (m.17) ve kıdem tazminatı hesabı onaylandı\n☐ Kullanılmamış yıllık izin ücreti son bordroya eklendi (m.59)\n☐ Zimmet teslim alındı: laptop, telefon, kart, anahtar\n☐ BT erişimleri kapatıldı (e-posta, VPN, uygulamalar)\n☐ SGK işten ayrılış bildirgesi 10 gün içinde doğru kodla verilecek (5510 m.9)\n☐ Çalışma Belgesi teslim edildi (m.28)\n☐ Çıkış mülakatı yapıldı\n☐ Tüm hak edişler banka yoluyla ödendi; dekont dosyada\n\nİK Sorumlusu İmza: ................",
  },
  {
    id: "fazla-mesai-onay",
    title: "Fazla Çalışma Onay Formu",
    lawRef: "4857 s.K. m.41",
    description: "Fazla mesainin önceden yazılı onayını ve saat kayıtlarını belgeleyen form.",
    warning: "Yıllık fazla çalışma 270 saati aşamaz; onaylar özlük dosyasında saklanmalıdır.",
    fields: [...STD_FIELDS, { key: "olay", label: "Mesai Tarih ve Saati", placeholder: "20.06.2026, 18:00–21:00 (3 saat)" }],
    body: "FAZLA ÇALIŞMA ONAY FORMU\n\nŞirket: {{sirket}}   Çalışan: {{calisan}}\nMesai Tarih/Saati: {{olay}}\nMesai Gerekçesi: ................................................\n\nFazla çalışma karşılığının ☐ %50 zamlı ücret olarak ödenmesini / ☐ serbest zaman olarak kullandırılmasını talep ederim.\n\nÇalışan İmzası: ................    Tarih: {{tarih}}\nYönetici Onayı: ................\n\n4857 Sayılı İş Kanunu m.41 uyarınca düzenlenmiştir.",
  },
];
