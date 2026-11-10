import type { LawArticle } from "@/db/schema";

export interface LawSeedItem {
  lawNumber: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  keyArticles: LawArticle[];
  practicalExample: string;
  dailyTips: string[];
  keywords: string[];
  sortOrder: number;
}

export const LAWS_SEED: LawSeedItem[] = [
  {
    lawNumber: "4857",
    title: "4857 Sayılı İş Kanunu",
    slug: "4857-is-kanunu",
    category: "Temel İş Hukuku",
    summary:
      "İşverenler ile bir iş sözleşmesine dayanarak çalıştırılan işçilerin çalışma şartları ve çalışma ortamına ilişkin hak ve sorumluluklarını düzenleyen temel iş kanunudur. İş sözleşmesi türleri, ihbar ve kıdem hakları, fazla çalışma, yıllık ücretli izin, eşit davranma ilkesi ve fesih süreçlerinin ana çerçevesini çizer.",
    keyArticles: [
      {
        articleNo: "Madde 5",
        title: "Eşit Davranma İlkesi",
        content:
          "İş ilişkisinde dil, ırk, renk, cinsiyet, engellilik, siyasal düşünce, felsefî inanç, din ve mezhep ve benzeri sebeplere dayalı ayrım yapılamaz. İşveren, biyolojik veya işin niteliğine ilişkin sebepler zorunlu kılmadıkça, bir işçiye iş sözleşmesinin yapılmasında, şartlarının oluşturulmasında, uygulanmasında ve sona ermesinde farklı işlem yapamaz.",
        hrImpact:
          "İşe alım ilanlarından terfi ve ücret politikalarına kadar tüm İK süreçlerinde objektif ve ölçülebilir kriterler kullanılmalıdır. İhlali halinde 4 aya kadar ücret tutarında ayrımcılık tazminatı doğar.",
      },
      {
        articleNo: "Madde 17",
        title: "Süreli Fesih ve İhbar Süreleri",
        content:
          "Belirsiz süreli iş sözleşmelerinin feshinden önce durumun diğer tarafa bildirilmesi gerekir: 6 aydan az çalışanlar için 2 hafta, 6 ay–1,5 yıl arası 4 hafta, 1,5–3 yıl arası 6 hafta, 3 yıldan fazla çalışanlar için 8 hafta ihbar süresi uygulanır.",
        hrImpact:
          "Offboarding süreçlerinde ihbar öneline uyulmalı veya ihbar tazminatı peşin ödenmelidir. İhbar süresi içinde günde en az 2 saat yeni iş arama izni verilmesi zorunludur.",
      },
      {
        articleNo: "Madde 18 - 21",
        title: "İş Güvencesi ve Geçerli Fesih",
        content:
          "Otuz veya daha fazla işçi çalıştıran işyerlerinde en az altı aylık kıdemi olan belirsiz süreli iş sözleşmeli işçinin iş akdinin feshi, işçinin yeterliliğinden veya davranışlarından ya da işletmenin gereklerinden kaynaklanan geçerli bir sebebe dayanmak zorundadır.",
        hrImpact:
          "Performans veya davranış kaynaklı fesihlerde Madde 19 uyarınca mutlaka yazılı savunma alınmalı, performans geliştirme planı (PIP) kayıtları tutulmalıdır.",
      },
      {
        articleNo: "Madde 25",
        title: "İşverenin Haklı Nedenle Derhal Fesih Hakkı",
        content:
          "Sağlık sebepleri, ahlak ve iyi niyet kurallarına uymayan haller (Madde 25/II) ve zorlayıcı sebeplerle işveren sözleşmeyi derhal feshedebilir. 25/II kapsamındaki fesihlerde kıdem ve ihbar tazminatı ödenmez.",
        hrImpact:
          "25/II fesihlerinde olayın öğrenildiği tarihten itibaren 6 iş günü ve her halde olaydan itibaren 1 yıllık hak düşürücü süreye (Madde 26) kesinlikle uyulmalıdır.",
      },
      {
        articleNo: "Madde 41 & 53",
        title: "Fazla Çalışma ve Yıllık Ücretli İzin",
        content:
          "Haftalık 45 saati aşan çalışmalar fazla çalışmadır ve saatlik ücret %50 zamlı ödenir (yıllık sınır 270 saattir). 1 yılını dolduran işçiye kıdemine göre en az 14, 20 veya 26 iş günü yıllık ücretli izin verilir.",
        hrImpact:
          "Puantaj kayıtları ve fazla mesai onayları yazılı/dijital imza ile arşivlenmeli, yıllık izinler kullandırılmalıdır.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: 45 çalışanı olan bir teknoloji şirketinde 2 yıldır çalışan bir uzman, son 3 aydır hedeflerinin %40 altında kalmaktadır. İK departmanı doğrudan çıkış verirse İş Kanunu Madde 18-19 gereği işe iade davasını kaybeder. Doğru süreç: Önce objektif KPI verileriyle eksiklikler yazılı bildirilir, 30-60 günlük Performans Geliştirme Planı (PIP) uygulanır, gelişim sağlanmazsa Madde 19'a göre yazılı savunması alınır ve Madde 17 uyarınca 6 haftalık ihbar süresi (veya ihbar tazminatı) ile kıdem tazminatı ödenerek geçerli fesih yapılır.",
    dailyTips: [
      "4857 s.K. m.26 gereği işverenin haklı fesih yetkisi, olayın öğrenilmesinden itibaren 6 iş günü içinde kullanılmalıdır.",
      "4857 s.K. m.53'e göre yıllık ücretli izin hakkından vazgeçilemez; iş akdi devam ederken izin yerine para ödenemez.",
      "Deneme süresi iş sözleşmelerinde en fazla 2 ay olarak belirlenebilir; toplu iş sözleşmesiyle 4 aya çıkarılabilir (m.15).",
    ],
    keywords: [
      "4857",
      "iş kanunu",
      "ihbar",
      "kıdem",
      "fesih",
      "yıllık izin",
      "fazla mesai",
      "deneme süresi",
      "savunma",
      "işe iade",
      "haklı neden",
      "ayrımcılık",
    ],
    sortOrder: 1,
  },
  {
    lawNumber: "5510",
    title: "5510 Sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu",
    slug: "5510-sosyal-sigortalar-kanunu",
    category: "Sosyal Güvenlik",
    summary:
      "Çalışanların sosyal sigortalar ve genel sağlık sigortasından yararlanma şartlarını, işe giriş-çıkış SGK bildirim sürelerini, prime esas kazançları, iş kazası/meslek hastalığı bildirimlerini ve rapor (iş göremezlik) süreçlerini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 8",
        title: "Sigortalı Bildirimi ve Tescili",
        content:
          "İşverenler, 4/1-a kapsamında sigortalı sayılan kişileri işe başlatmadan en geç bir gün önce SGK'ya sigortalı işe giriş bildirgesi ile bildirmekle yükümlüdür (inşaat, balıkçılık ve tarım işyerlerinde aynı gün).",
        hrImpact:
          "Onboarding sürecinde adayın SGK işe giriş bildirgesi mutlaka fiili iş başından en az 1 gün önce verilmelidir; aksi halde asgari ücret tutarında idari para cezası kesilir.",
      },
      {
        articleNo: "Madde 9",
        title: "Sigortalılığın Sona Ermesi (İşten Ayrılış Bildirgesi)",
        content:
          "Sigortalılığın sona ermesini takip eden 10 gün içinde SGK'ya İşten Ayrılış Bildirgesi verilmelidir.",
        hrImpact:
          "Offboarding kontrol listesinde 10 günlük süre ve doğru SGK işten ayrılış kodu (örn. 04, 03, 29, 46 gibi) seçimi kritik öneme sahiptir; işsizlik maaşı hakkını doğrudan etkiler.",
      },
      {
        articleNo: "Madde 13",
        title: "İş Kazasının Tanımı ve Bildirimi",
        content:
          "İş kazası, sigortalının işyerinde bulunduğu sırada veya işveren tarafından yürütülmekte olan iş nedeniyle meydana gelen kazadır. İşveren iş kazasını kolluk kuvvetlerine derhal, SGK'ya ise kazadan sonraki 3 iş günü içinde bildirmek zorundadır.",
        hrImpact:
          "İK ve İSG birimleri kaza anında koordineli hareket etmeli ve 3 iş günü kuralını kesinlikle kaçırmamalıdır.",
      },
      {
        articleNo: "Madde 80",
        title: "Prime Esas Kazançlar",
        content:
          "Ücret, prim, ikramiye ve benzeri ödemeler prime esas kazanca dahildir. Yemek, çocuk ve aile zammının belirli istisna tutarları prime tabi tutulmaz.",
        hrImpact:
          "Bordrolama sürecinde yan hakların SGK prim matrahına dahil edilip edilmeyeceği Madde 80 istisnalarına göre doğru parametrelenmelidir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Yeni işe alınan bir yazılım mühendisi Pazartesi günü saat 09:00'da işbaşı yapacaktır. İK uzmanı Pazar günü saat 23:59'a kadar e-SGK üzerinden işe giriş bildirgesini onaylamalıdır. Eğer bildirim Pazartesi sabahı yapılırsa SGK tarafından 1 brüt asgari ücret idari para cezası uygulanır ve yararlanılan SGK teşvikleri riske girer.",
    dailyTips: [
      "5510 s.K. m.8 uyarınca sigortalı işe giriş bildirgesi (inşaat/tarım hariç) işe başlama tarihinden en geç 1 gün önce verilmelidir.",
      "İş kazası SGK'ya kazayı takip eden 3 iş günü içinde bildirilmelidir (m.13).",
      "İşten ayrılış bildirgesindeki çıkış kodu 10 gün içinde e-SGK'dan düzeltilebilir; sonrası için dilekçe ve belge gerekir.",
    ],
    keywords: [
      "5510",
      "sgk",
      "sosyal sigorta",
      "işe giriş bildirgesi",
      "işten ayrılış",
      "iş kazası",
      "prime esas kazanç",
      "rapor",
      "istirahat",
      "teşvik",
      "çıkış kodu",
    ],
    sortOrder: 2,
  },
  {
    lawNumber: "6331",
    title: "6331 Sayılı İş Sağlığı ve Güvenliği Kanunu",
    slug: "6331-is-sagligi-ve-guvenligi",
    category: "İş Sağlığı ve Güvenliği",
    summary:
      "İşyerlerinde iş sağlığı ve güvenliğinin sağlanması ve mevcut sağlık ve güvenlik şartlarının iyileştirilmesi için işveren ve çalışanların görev, yetki, sorumluluk, hak ve yükümlülüklerini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 4",
        title: "İşverenin Genel Yükümlülüğü",
        content:
          "İşveren, çalışanların işle ilgili sağlık ve güvenliğini sağlamakla yükümlüdür; mesleki risklerin önlenmesi, eğitim ve bilgi verilmesi dahil her türlü tedbiri alır ve denetler.",
        hrImpact:
          "İSG sorumluluğu yalnızca İSG uzmanına devredilemez; İK prosedürleri ve disiplin yönetmeliği İSG kurallarına uyumu desteklemelidir.",
      },
      {
        articleNo: "Madde 15",
        title: "Sağlık Gözetimi",
        content:
          "İşveren; işe girişlerde, iş değişikliğinde, iş kazası/meslek hastalığı sonrası dönüşlerde ve tehlike sınıfına göre düzenli aralıklarla çalışanların sağlık muayenelerini yaptırmak zorundadır.",
        hrImpact:
          "İşe alım onayından sonra aday fiilen çalıştırılmadan önce 'İşe Giriş Sağlık Raporu' (Ek-2) işyeri hekiminden alınarak özlük dosyasına konmalıdır.",
      },
      {
        articleNo: "Madde 17",
        title: "Çalışanların Eğitimi",
        content:
          "İşveren, çalışanların iş sağlığı ve güvenliği eğitimlerini almasını sağlar. Bu eğitim özellikle işe başlamadan önce, çalışma yeri veya iş değişikliğinde ve iş ekipmanının değişmesi hâlinde verilir.",
        hrImpact:
          "Onboarding programının ilk gününe mutlaka İSG temel eğitimi dahil edilmeli ve katılım tutanakları özlük dosyasında saklanmalıdır.",
      },
      {
        articleNo: "Madde 13",
        title: "Çalışmaktan Kaçınma Hakkı",
        content:
          "Ciddi ve yakın tehlike ile karşı karşıya kalan çalışanlar kurula veya işverene başvurarak durumun tespit edilmesini ve gerekli tedbirlerin alınmasını talep edebilir.",
        hrImpact:
          "Çalışanların İSG bildirim kanalları açık tutulmalı, çalışan temsilcisi seçimleri usulüne uygun yapılmalıdır.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir üretim tesisinde yeni alınan forklift operatörü, henüz işe giriş sağlık raporu ve temel İSG eğitimi tamamlanmadan vardiyaya çıkarılırsa ve kaza yaşanırsa işveren 6331 s.K. m.15 ve m.17 ihlalinden ağır hukuki ve cezai sorumlulukla karşılaşır. İK, sağlık raporu ve İSG eğitimi tamamlanmadan kart/vardiya aktivasyonu yapmayan bir kontrol kapısı kurmalıdır.",
    dailyTips: [
      "6331 s.K. m.15'e göre tehlikeli ve çok tehlikeli sınıfta yer alan işlerde çalışacaklar, yapacakları işe uygun olduklarını belirten sağlık raporu olmadan işe başlatılamaz.",
      "Az tehlikeli işyerlerinde 5 yılda bir, tehlikeli sınıfta 3 yılda bir, çok tehlikeli sınıfta yılda bir periyodik sağlık muayenesi yenilenmelidir.",
      "İSG eğitimlerinde geçen süre çalışma süresinden sayılır ve çalışana ek maliyet yüklenemez (m.17/7).",
    ],
    keywords: [
      "6331",
      "isg",
      "iş sağlığı",
      "iş güvenliği",
      "sağlık raporu",
      "risk değerlendirmesi",
      "isg eğitimi",
      "tehlike sınıfı",
      "işyeri hekimi",
    ],
    sortOrder: 3,
  },
  {
    lawNumber: "6698",
    title: "6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK)",
    slug: "6698-kvkk",
    category: "Veri & Medeni Hukuk",
    summary:
      "Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere kişilerin temel hak ve özgürlüklerini korumak ve veri sorumlularının yükümlülüklerini belirlemek amacıyla çıkarılmıştır. İK süreçleri en yoğun kişisel veri ve özel nitelikli veri işlenen alandır.",
    keyArticles: [
      {
        articleNo: "Madde 5",
        title: "Kişisel Verilerin İşlenme Şartları",
        content:
          "Kişisel veriler ilgili kişinin açık rızası olmaksızın işlenemez; ancak kanunlarda açıkça öngörülmesi, sözleşmenin kurulması/ifası veya hukuki yükümlülük gibi istisnalar mevcuttur.",
        hrImpact:
          "Çalışanın bordro ve SGK bilgileri hukuki yükümlülük gereği açık rıza olmadan işlenebilir; ancak referans araştırması, işten ayrılan aday CV saklama veya fotoğraf paylaşımı için açık rıza şarttır.",
      },
      {
        articleNo: "Madde 6",
        title: "Özel Nitelikli Kişisel Veriler",
        content:
          "Sağlık verileri, ceza mahkumiyeti/adli sicil kaydı, sendika üyeliği ve biyometrik veriler (parmak izi, yüz tanıma) özel nitelikli kişisel veridir ve sıkı koruma altındadır.",
        hrImpact:
          "Puantaj takibinde parmak izi veya yüz tanıma cihazı kullanımı ölçülülük ilkesine aykırı bulunabilmektedir; kartlı geçiş veya mobil QR gibi alternatifler tercih edilmelidir.",
      },
      {
        articleNo: "Madde 10",
        title: "Aydınlatma Yükümlülüğü",
        content:
          "Veri sorumlusu, verilerin elde edilmesi sırasında ilgili kişiye veri sorumlusunun kimliğini, işleme amacını, aktarım yapılacağı tarafları ve haklarını bildirmek zorundadır.",
        hrImpact:
          "Aday Başvuru Aydınlatma Metni ve Çalışan Aydınlatma Metni ayrı ayrı hazırlanmalı, imzalı/onaylı şekilde kayıt altına alınmalıdır.",
      },
      {
        articleNo: "Madde 7",
        title: "Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi",
        content:
          "İşlenmesini gerektiren sebeplerin ortadan kalkması halinde kişisel veriler resen veya talep üzerine silinir, yok edilir veya anonim hale getirilir.",
        hrImpact:
          "Olumsuz sonuçlanan aday CV'leri veri saklama ve imha politikasında belirtilen makul süre (genellikle 1-2 yıl) sonunda imha edilmelidir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir şirket işe alım portalından başvuran adayların CV'lerini 5 yıl boyunca açık rıza ve aydınlatma metni olmadan saklarsa ve başka grup şirketleriyle paylaşırsa KVKK Kurulu tarafından idari para cezası uygulanır. Doğru uygulama: Başvuru ekranında 'Aday Aydınlatma Metni' sunulur, yetenek havuzunda saklama ve grup şirketleriyle paylaşım için ayrı, kutucuğu boş bırakılmış 'Açık Rıza' onayı alınır.",
    dailyTips: [
      "KVKK m.10 gereği aydınlatma metni ile açık rıza metni birbirinden ayrı tutulmalı; çalışana rıza vermeme özgürlüğü tanınmalıdır.",
      "Özlük dosyasında yer alan adli sicil kaydı ve sağlık raporları özel nitelikli veri olduğu için kilitli dolapta veya şifreli sistemlerde saklanmalıdır.",
      "İşyerinde biyometrik (parmak izi) devam kontrol sistemi yerine kartlı veya şifreli sistemlerin kullanılması KVKK kararlarıyla uyumludur.",
    ],
    keywords: [
      "6698",
      "kvkk",
      "kişisel veri",
      "açık rıza",
      "aydınlatma metni",
      "özel nitelikli veri",
      "adli sicil",
      "biyometrik",
      "cv saklama",
      "verbis",
    ],
    sortOrder: 4,
  },
  {
    lawNumber: "6098",
    title: "6098 Sayılı Türk Borçlar Kanunu",
    slug: "6098-turk-borclar-kanunu",
    category: "Temel İş Hukuku",
    summary:
      "4857 Sayılı İş Kanunu kapsamı dışında kalan çalışanların hizmet sözleşmelerini düzenler; ayrıca İş Kanunu'nda boşluk bulunan ibra sözleşmesi (ibraname), rekabet yasağı, cezai şart ve işverenin işçiyi gözetme borcu gibi kritik hükümleri içerir.",
    keyArticles: [
      {
        articleNo: "Madde 420",
        title: "İbra Sözleşmesi (İbraname) Şartları",
        content:
          "İşçinin işverenden alacağına ilişkin ibra sözleşmesinin yazılı olması, ibra tarihi itibarıyla sözleşmenin sona ermesinden başlayarak en az bir aylık sürenin geçmiş bulunması, alacak kalemlerinin türünün ve miktarının açıkça belirtilmesi ve ödemenin noksansız ve banka aracılığıyla yapılması şarttır.",
        hrImpact:
          "İşten çıkış günü imzalatılan matbu ibraname geçersizdir! İbraname çıkıştan en az 1 ay sonra, banka dekontu ve tek tek alacak kalemleri yazılarak düzenlenmelidir.",
      },
      {
        articleNo: "Madde 444 - 447",
        title: "Rekabet Yasağı Sözleşmesi",
        content:
          "İşçi, işverene karşı sözleşme sona erdikten sonra da rekabet etmeme borcu altına girebilir. Ancak bu yasak yer, zaman (en fazla 2 yıl) ve işlerin türü bakımından işçinin ekonomik geleceğini hakkaniyete aykırı olarak tehlikeye düşürecek şekilde sınırlanamaz.",
        hrImpact:
          "Üst düzey yöneticiler veya Ar-Ge çalışanları için hazırlanan rekabet yasağı maddeleri en fazla 2 yıl ile sınırlandırılmalı ve makul bir coğrafi/sektörel kapsam içermelidir.",
      },
      {
        articleNo: "Madde 417",
        title: "İşçinin Kişiliğinin Korunması (Mobbing Önleme)",
        content:
          "İşveren, hizmet ilişkisinde işçinin kişiliğini korumak ve saygı göstermek, işyerinde dürüstlük ilkelerine uygun bir düzeni sağlamakla, özellikle işçilerin psikolojik ve cinsel tacize uğramamaları için gerekli önlemleri almakla yükümlüdür.",
        hrImpact:
          "Etik hat, psikolojik taciz (mobbing) inceleme prosedürü ve güvenli çalışma ortamı politikaları İK tarafından aktif yönetilmelidir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir çalışan istifa ederken aynı gün kendisine 'tüm haklarımı aldım, işvereni ibra ediyorum' yazılı belge imzalatılmıştır. Daha sonra çalışan fazla mesai davası açtığında mahkeme TBK Madde 420 uyarınca '1 aylık süre geçmediği ve kalemler banka ödemesiyle detaylandırılmadığı için' ibranameyi kesin hükümsüz sayar. İK süreçlerinde ibraname yerine kalem kalem 'Hesap Pusulası / Ödeme Dekontu' kullanılmalı veya 1 ay sonra ibra alınmalıdır.",
    dailyTips: [
      "TBK m.420 uyarınca işten çıkış günü imzalatılan ibraname geçersizdir; sözleşme bitiminden itibaren en az 1 ay geçmiş olmalıdır.",
      "Rekabet yasağı sözleşmesi özel durumlar ve koşullar dışında 2 yılı aşamaz (TBK m.445).",
      "TBK m.417 işverene işyerinde psikolojik tacizi (mobbing) önleme yükümlülüğü getirir.",
    ],
    keywords: [
      "6098",
      "borçlar kanunu",
      "ibraname",
      "ibra",
      "rekabet yasağı",
      "mobbing",
      "psikolojik taciz",
      "cezai şart",
      "hizmet sözleşmesi",
    ],
    sortOrder: 5,
  },
  {
    lawNumber: "4447",
    title: "4447 Sayılı İşsizlik Sigortası Kanunu",
    slug: "4447-issizlik-sigortasi-kanunu",
    category: "Sosyal Güvenlik",
    summary:
      "Sigortalıların işsiz kalmaları halinde belirli süre ve şartlarla işsizlik ödeneği almasını, işsizlik sigortası prim oranlarını ve İş-Kur üzerinden sağlanan aktif işgücü ile istihdam teşviklerini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 50 & 51",
        title: "İşsizlik Ödeneğine Hak Kazanma Şartları",
        content:
          "Kendi istek ve kusuru dışında işsiz kalan, hizmet akdinin sona ermesinden önceki son 120 gün hizmet akdine tabi olan, son 3 yıl içinde en az 600 gün işsizlik sigortası primi ödemiş ve işten ayrılışından sonraki 30 gün içinde İŞKUR'a başvuran sigortalılara 180, 240 veya 300 gün süreyle ödenek verilir.",
        hrImpact:
          "SGK işten ayrılış kodu çalışanın işsizlik maaşı alıp alamayacağını belirler. İşveren feshi (Kod 04) hak kazandırırken, istifa (Kod 03) veya ahlak/iyi niyet ihlali (Kod 42-50) ödenek hakkını ortadan kaldırır.",
      },
      {
        articleNo: "Madde 49",
        title: "İşsizlik Sigortası Prim Oranları",
        content:
          "Prime esas aylık brüt kazanç üzerinden %1 sigortalı, %2 işveren ve %1 Devlet payı olarak işsizlik sigortası primi ödenir.",
        hrImpact:
          "Bordro hesaplamalarında brüt ücretten %1 işçi ve %2 işveren işsizlik primi kesintisi doğru uygulanmalıdır.",
      },
      {
        articleNo: "Ek Madde 2",
        title: "Kısa Çalışma Ödeneği",
        content:
          "Genel ekonomik, sektörel, bölgesel kriz veya zorlayıcı sebeplerle işyerindeki haftalık çalışma sürelerinin geçici olarak en az üçte bir oranında azaltılması durumunda çalışanlara İŞKUR tarafından kısa çalışma ödeneği ödenir.",
        hrImpact:
          "Kriz ve doğal afet dönemlerinde işten çıkarma yerine kısa çalışma başvurusu ile istihdam korunabilir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: 4 yıldır çalışan bir personel, işverenin organizasyonel küçülme kararıyla 4857 m.17 kapsamında işten çıkarılıyor (SGK Kod 04). Son 3 yılda 1080 gün primi olduğu için 4447 s.K. m.50 uyarınca 300 gün (10 ay) boyunca işsizlik ödeneği almaya hak kazanır. İK, çıkış evraklarıyla birlikte personele 30 gün içinde e-Devlet/İŞKUR üzerinden başvuru yapması gerektiğini hatırlatmalıdır.",
    dailyTips: [
      "İşsizlik maaşı için son 3 yılda en az 600 gün prim ve son 120 gün hizmet akdine tabi çalışma şartı aranır (4447 s.K. m.50).",
      "İşten ayrılış tarihinden itibaren 30 gün içinde İŞKUR'a başvurulmazsa gecikilen süre toplam hak sahipliğinden düşülür.",
      "İkale (karşılıklı anlaşma - Kod 22) ile işten ayrılan çalışanlar kural olarak işsizlik ödeneğinden yararlanamaz.",
    ],
    keywords: [
      "4447",
      "işsizlik",
      "işsizlik maaşı",
      "işkur",
      "kısa çalışma",
      "600 gün",
      "120 gün",
      "prim",
      "teşvik",
    ],
    sortOrder: 6,
  },
  {
    lawNumber: "193",
    title: "193 Sayılı Gelir Vergisi Kanunu",
    slug: "193-gelir-vergisi-kanunu",
    category: "Vergi & İcra",
    summary:
      "Çalışanların ücret gelirlerinden yapılacak gelir vergisi tevkifatını (stopaj), artan oranlı vergi dilimlerini, asgari ücret gelir vergisi istisnasını, yemek/ulaşım yardımı vergi istisnalarını ve engellilik indirimini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 61",
        title: "Ücretin Tarifi",
        content:
          "Ücret, işverene tabi ve belirli bir işyerine bağlı olarak çalışanlara hizmet karşılığı verilen para ve ayınlar ile sağlanan ve para ile temsil edilebilen menfaatlerdir.",
        hrImpact:
          "Ayni veya nakdi tüm yan haklar (prim, ikramiye, hediye çeki, özel sağlık sigortası) ücret kapsamında değerlendirilip vergi istisnası sınırları kontrol edilmelidir.",
      },
      {
        articleNo: "Madde 23/18",
        title: "Asgari Ücret Vergi İstisnası",
        content:
          "Hizmet erbabının, ödemenin yapıldığı ayda geçerli olan asgari ücretin aylık brüt tutarından işçi SGK ve işsizlik primleri düşüldükten sonra kalan tutarına isabet eden ücretleri gelir vergisinden istisnadır.",
        hrImpact:
          "Tüm çalışanların bordrolarında asgari ücrete kadar olan kısım gelir ve damga vergisinden istisna edilir; net ücret hesabında kümülatif vergi matrahı doğru takip edilmelidir.",
      },
      {
        articleNo: "Madde 23/8 & 23/10",
        title: "Yemek ve Yol Yardımı İstisnaları",
        content:
          "İşverenlerce belirlenen günlük yemek bedeli istisnası ve toplu taşıma kartı/bileti şeklindeki ulaşım bedeli istisnaları belirlenen güncel limitler dahilinde gelir vergisinden muaftır.",
        hrImpact:
          "Yan haklar paketini tasarlarken yemek kartı veya toplu taşıma kartı olarak verilen destekler vergi avantajı sağlayarak çalışanın net faydasını artırır.",
      },
      {
        articleNo: "Madde 31",
        title: "Engellilik İndirimi",
        content:
          "Çalışma gücünün asgari %80'ini, %60'ını veya %40'ını kaybeden hizmet erbabı sırasıyla 1., 2. ve 3. derece engelli sayılır ve gelir vergisi matrahından yıllık belirlenen tutarlarda indirim uygulanır.",
        hrImpact:
          "Engelli raporu olan çalışanların vergi dairesi yazısı bordro sistemine işlenerek vergi matrahı indirimi uygulanmalıdır.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir çalışan yıl içinde aynı anda terfi alıp başka bir işverene geçerse, yeni işverende gelir vergisi matrahı sıfırdan (%15 diliminden) başlar. Ancak GVK m.86 gereği çalışan, yıl sonunda iki işverenden aldığı toplam ücret yasal beyan sınırını aşarsa yıllık gelir vergisi beyannamesi vermek zorundadır. İK, işten ayrılan ve işe yeni giren çalışanlara kümülatif matrah yazısı (Ücret Bordrosu Özeti) vererek bilgilendirme yapmalıdır.",
    dailyTips: [
      "193 s.K. m.23 uyarınca asgari ücret tutarına isabet eden gelir ve damga vergisi istisnası tüm ücretliler için bordroda uygulanır.",
      "Yemek bedeli nakit olarak verilirse de belirlenen günlük yasal istisna tutarına kadar gelir vergisinden muaftır.",
      "Özel sağlık sigortası ve bireysel emeklilik işveren katkı paylarında brüt ücretin %15'ine (ve yıllık asgari ücret toplamına) kadar vergi indirimi avantajı vardır (m.63).",
    ],
    keywords: [
      "193",
      "gelir vergisi",
      "vergi dilimi",
      "kümülatif matrah",
      "bordro",
      "asgari ücret istisnası",
      "yemek yardımı",
      "engellilik indirimi",
      "stopaj",
    ],
    sortOrder: 7,
  },
  {
    lawNumber: "2004",
    title: "2004 Sayılı İcra ve İflas Kanunu",
    slug: "2004-icra-ve-iflas-kanunu",
    category: "Vergi & İcra",
    summary:
      "Çalışanların ücret ve diğer alacaklarına gelen maaş hacizleri, nafaka kesintileri ve işverenin İcra Dairesine karşı bildirim ve ödeme yükümlülüklerini (Madde 355-356) düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 83",
        title: "Kısmen Haczedilebilen Şeyler (Maaş Haczi Sınırı)",
        content:
          "Maaşlar, tahsisat ve her nevi ücretler borçlu ve ailesinin geçinmeleri için icra memurunca lüzumlu olarak takdir edilen miktar tenzil edildikten sonra haczolunabilir. Ancak haczolunacak miktar bunların dörtte birinden (1/4) az olamaz.",
        hrImpact:
          "Kural olarak net maaşın 1/4'ü oranında icra kesintisi yapılır. Ancak nafaka alacaklarında öncelik vardır ve aylık nafaka tutarı maaşın 1/4'üne bakılmaksızın tam olarak kesilir.",
      },
      {
        articleNo: "Madde 355",
        title: "Maaş Kesintisinde İşverenin Sorumluluğu",
        content:
          "İcra dairesinden gelen haciz müzekkeresini alan işveren, bir hafta içinde haczin icra edildiğini ve borçlunun maaş/ücret miktarını icra dairesine bildirmeye ve kesintiyi yapıp yatırmaya mecburdur.",
        hrImpact:
          "İK veya Bordro birimi tebligatı aldığı günden itibaren 7 gün içinde mutlaka İcra Dairesine yazılı cevap vermelidir. Çalışan işten ayrılmışsa bu da 7 gün içinde bildirilmelidir.",
      },
      {
        articleNo: "Madde 356",
        title: "Kesinti Yapmayan İşverenin Şahsi Sorumluluğu",
        content:
          "İşveren kesinti yapmaz veya ilk vasıta ile icra dairesine göndermezse, kesmediği veya ilk vasıta ile göndermediği para ayrıca mahkemeden hüküm alınmasına hacet kalmaksızın icra dairesince işverenin kendi malvarlığından tahsil olunur.",
        hrImpact:
          "Maaş haczi sırası (önce gelen dosya sıraya alınır, nafaka her zaman en öndedir) titizlikle takip edilmezse şirket borcu ödemek zorunda kalabilir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir çalışanın aynı ay içinde 2 ayrı icra dosyasından maaş haczi yazısı ve 1 adet de aylık 6.000 TL nafaka haczi yazısı gelmiştir. İK bordro ekibi öncelikle 6.000 TL'lik nafaka kesintisini net maaştan doğrudan keser. Kalan net maaşın 1/4'ünü ise ilk tebliğ edilen icra dosyasına yatırır; ikinci icra dosyasına 7 gün içinde 'çalışanın maaşında halen nafaka ve 1. sıra haciz bulunduğu, sıraya alındığı' yönünde resmi cevap yazısı gönderir.",
    dailyTips: [
      "İİK m.355 uyarınca icra müzekkeresine 7 gün içinde cevap verilmesi zorunludur; personel ayrılmış olsa dahi cevap yazılmalıdır.",
      "Birden fazla maaş haczi varsa aynı anda iki icra kesintisi yapılmaz; tebliğ tarihine göre sıraya konur (nafaka hariç).",
      "Kıdem ve ihbar tazminatlarının tamamı ücret niteliğinde sayılmadığı için Yargıtay içtihatlarına göre tamamı haczedilebilir niteliktedir.",
    ],
    keywords: [
      "2004",
      "icra",
      "maaş haczi",
      "nafaka",
      "haciz müzekkeresi",
      "355",
      "356",
      "dörtte bir",
      "sıra",
    ],
    sortOrder: 8,
  },
  {
    lawNumber: "6356",
    title: "6356 Sayılı Sendikalar ve Toplu İş Sözleşmesi Kanunu",
    slug: "6356-sendikalar-ve-tis-kanunu",
    category: "Sendikal Hukuk",
    summary:
      "Özel sektör ve kamudaki işçilerin sendika kurma, sendikaya üye olma/çekilme özgürlüklerini, sendika güvencesini, toplu iş sözleşmesi (TİS) yetki süreçlerini, grev ve lokavt kurallarını düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 25",
        title: "Sendika Özgürlüğünün Güvencesi",
        content:
          "İşçilerin işe alınmaları belli bir sendikaya girmeleri veya girmemeleri şartına bağlanamaz. İşveren, sendika üyesi olan işçilerle sendika üyesi olmayan işçiler arasında çalışma şartları veya çalıştırmaya son verilmesi bakımından ayrım yapamaz.",
        hrImpact:
          "Sendikal nedenle fesih ispatlanırsa işverene en az 1 yıllık ücret tutarında sendikal tazminat yaptırımı uygulanır.",
      },
      {
        articleNo: "Madde 24",
        title: "İşyeri Sendika Temsilcisinin Güvencesi",
        content:
          "İşveren, işyeri sendika temsilcisinin iş sözleşmesini haklı bir neden olmadıkça ve nedenini yazılı olarak açık ve kesin şekilde belirtmedikçe feshedemez; yazılı rızası olmadıkça işyerini veya işini esaslı tarzda değiştiremez.",
        hrImpact:
          "Sendika temsilcisinin görev yeri değişikliği veya fesih süreçlerinde mutlak yasal koruma gözetilmelidir.",
      },
      {
        articleNo: "Madde 39 & 41",
        title: "Toplu İş Sözleşmesi (TİS) ve Yetki",
        content:
          "Sendikanın TİS yapabilmesi için işkolunda %1 barajını ve işyerinde %50'den fazla (işletmede %40) çoğunluğu sağlaması gerekir. TİS'ten yararlanmak için sendika üyesi olmak veya dayanışma aidatı ödemek gerekir.",
        hrImpact:
          "Endüstriyel ilişkiler ekibi TİS müzakerelerinde ücret zamları, ikramiyeler ve sosyal yardımları sürdürülebilir bütçe ile müzakere etmelidir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir fabrikada çalışanların bir kısmı sendikaya üye olduktan kısa süre sonra performans gerekçesi gösterilmeden işten çıkarılıyor. İşçiler 6356 s.K. m.25 uyarınca sendikal tazminat davası açarsa, mahkeme feshin sendikal nedene dayandığına kanaat getirdiği takdirde 1 yıllık brüt ücretin altında olmamak üzere sendikal tazminata hükmeder. İK, yöneticilere sendikal haklar konusunda düzenli eğitim vermelidir.",
    dailyTips: [
      "6356 s.K. m.25'e göre sendikal tazminat tutarı işçinin bir yıllık ücretinden az olamaz.",
      "Sendikaya üye olmayan çalışanlar da TİS'ten yararlanmak isterlerse sendikaya dayanışma aidatı ödeyerek faydalanabilirler (m.39).",
      "Sendika üyelik aidatları işveren tarafından işçinin ücretinden kesilerek sendikaya aktarılır (check-off sistemi, m.18).",
    ],
    keywords: [
      "6356",
      "sendika",
      "toplu iş sözleşmesi",
      "tis",
      "grev",
      "lokavt",
      "sendikal tazminat",
      "dayanışma aidatı",
      "temsilci",
    ],
    sortOrder: 9,
  },
  {
    lawNumber: "5746",
    title: "5746 Sayılı Ar-Ge ve Tasarım Faaliyetlerinin Desteklenmesi Kanunu",
    slug: "5746-arge-ve-tasarim-kanunu",
    category: "Vergi & İcra",
    summary:
      "Ar-Ge merkezleri, tasarım merkezleri ve Teknopark kapsamındaki Ar-Ge/tasarım/destek personelinin ücretlerine uygulanan gelir vergisi stopajı teşviki, SGK işveren hissesi desteği ve uzaktan çalışma sürelerini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 3/2",
        title: "Gelir Vergisi Stopajı Teşviki",
        content:
          "Ar-Ge, tasarım ve destek personelinin bu çalışmaları karşılığında elde ettikleri ücretlerin; doktoralı olanlar için %95'i, yüksek lisanslılar veya temel bilimler mezunları için %90'ı, diğerleri için %80'i gelir vergisinden müstesnadır.",
        hrImpact:
          "İK özlük ekibi Ar-Ge personelinin diploma (doktora, yüksek lisans, temel bilimler) belgelerini eksiksiz toplayıp bordroda doğru teşvik oranını tanımlamalıdır.",
      },
      {
        articleNo: "Madde 3/3",
        title: "Sigorta Primi İşveren Hissesi Desteği",
        content:
          "Ar-Ge ve tasarım merkezlerindeki personelin bu faaliyetleri karşılığında elde ettikleri ücretleri üzerinden hesaplanan sigorta primi işveren hissesinin yarısı (%50) Maliye Bakanlığı bütçesinden karşılanır.",
        hrImpact:
          "Bordrolamada 5746 kanun numarasıyla SGK bildirgesi verilerek şirketin işçilik maliyetinde önemli tasarruf sağlanır.",
      },
      {
        articleNo: "Madde 3 (Uzaktan Çalışma)",
        title: "Merkez Dışında Geçirilen Süreler",
        content:
          "Ar-Ge ve tasarım merkezlerinde çalışan personelin merkez dışında (uzaktan) geçirdikleri sürelerin Cumhurbaşkanı kararıyla belirlenen oranı (%75'e kadar, bilişimde %100'e kadar uygulanabilen dönemler) teşvik kapsamında sayılır.",
        hrImpact:
          "Hibrit çalışma planlaması PDKS/turnike ve proje zaman çizelgesi (timesheet) kayıtları ile uyumlu takip edilmelidir.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir Ar-Ge merkezine yüksek lisans mezunu bir veri bilimci işe alınmıştır. İK uzmanı çalışanın yüksek lisans diplomasını e-Devlet barkodlu olarak özlük dosyasına ekler ve bordro sisteminde personeli %90 gelir vergisi stopaj teşvikine ve %50 SGK işveren primi desteğine tanımlar. Ayrıca personelin ay içindeki merkez içi/dışı çalışma günleri puantajla belgelenerek denetime hazır tutulur.",
    dailyTips: [
      "5746 s.K. kapsamında destek personelinin sayısı toplam tam zaman eşdeğer Ar-Ge/tasarım personel sayısının %10'unu geçemez.",
      "Doktoralı Ar-Ge personelinde gelir vergisi stopaj teşvik oranı %95'tir (m.3/2).",
      "Ar-Ge merkezinde geçirilen süreler turnike veya onaylı dijital zaman takip kayıtları ile ispatlanmalıdır.",
    ],
    keywords: [
      "5746",
      "ar-ge",
      "tasarım merkezi",
      "teknopark",
      "stopaj teşviki",
      "sgk desteği",
      "uzaktan çalışma",
      "destek personeli",
    ],
    sortOrder: 10,
  },
  {
    lawNumber: "4721",
    title: "4721 Sayılı Türk Medeni Kanunu",
    slug: "4721-turk-medeni-kanunu",
    category: "Veri & Medeni Hukuk",
    summary:
      "İK uygulamalarında dürüstlük kuralı, hakkın kötüye kullanılması yasağı, kişilik haklarının korunması, fiil ehliyeti (18 yaş/erginlik), evlilik ve aile hukuku kaynaklı çalışan hakları (soyadı değişikliği, velayet/nafaka temeli) için temel referanstır.",
    keyArticles: [
      {
        articleNo: "Madde 2",
        title: "Dürüstlük Kuralı ve Hakkın Kötüye Kullanılması Yasağı",
        content:
          "Herkes, haklarını kullanırken ve borçlarını yerine getirirken dürüstlük kurallarına uymak zorundadır. Bir hakkın açıkça kötüye kullanılmasını hukuk düzeni korumaz.",
        hrImpact:
          "Performans değerlendirme, prim dağıtımı, görev değişikliği veya fesih yetkisi işveren tarafından keyfi ve kötü niyetli kullanılamaz; Yargıtay kararları sıkça TMK Madde 2'ye dayanır.",
      },
      {
        articleNo: "Madde 23 - 25",
        title: "Kişilik Haklarının Korunması",
        content:
          "Kimse, hak ve fiil ehliyetinden kısmen de olsa vazgeçemez; özgürlüklerinden vazgeçemez veya onları hukuka ya da ahlâka aykırı olarak sınırlayamaz.",
        hrImpact:
          "İş sözleşmelerine çalışanın temel kişilik haklarını veya özel hayatını aşırı kısıtlayan (örneğin evlenmeme şartı gibi) hükümler konulamaz.",
      },
      {
        articleNo: "Madde 11 - 16",
        title: "Fiil Ehliyeti ve Erginlik",
        content:
          "Erginlik on sekiz yaşın doldurulmasıyla başlar. Ayırt etme gücüne sahip küçükler sözleşme yaparken yasal temsilcilerinin (veli/vasi) rızasına ihtiyaç duyar.",
        hrImpact:
          "18 yaş altı çırak, stajyer veya genç işçi istihdamında iş sözleşmesi ve İSG onayları mutlaka veli/vasi imzası ile alınmalıdır.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir lise stajyeri (17 yaşında) yaz dönemi stajı için şirkete kabul edilmiştir. 4721 s.K. m.16 gereği 18 yaşından küçük olduğu için tek başına borç altına sokan iş/staj sözleşmesini ve KVKK açık rıza metnini imzalaması hukuken eksik kalır. İK, staj sözleşmesi ve aydınlatma/rıza formlarında mutlaka velisinin de ıslak imzasını alır.",
    dailyTips: [
      "TMK m.2'deki dürüstlük kuralı, işverenin yönetim hakkını keyfi kullanmasını engelleyen en temel hukuki sınırdır.",
      "18 yaşından küçük stajyer ve genç çalışanların tüm sözleşmelerinde veli onayı alınmalıdır (TMK m.16).",
      "Evlilik veya boşanma sonrası kimlik/soyadı değişikliği olan çalışanların SGK ve banka kayıtları güncel nüfus cüzdanına göre revize edilmelidir.",
    ],
    keywords: [
      "4721",
      "medeni kanun",
      "dürüstlük kuralı",
      "kişilik hakkı",
      "fiil ehliyeti",
      "18 yaş",
      "stajyer",
      "veli onayı",
      "hakkın kötüye kullanılması",
    ],
    sortOrder: 11,
  },
  {
    lawNumber: "4688",
    title: "4688 Sayılı Kamu Görevlileri Sendikaları ve Toplu Sözleşme Kanunu",
    slug: "4688-kamu-gorevlileri-sendikalari",
    category: "Sendikal Hukuk",
    summary:
      "Kamu kurum ve kuruluşlarında görev yapan memur ve diğer kamu görevlilerinin sendikal haklarını, sendika üyeliğini, kurum idari kurullarını ve kamu toplu sözleşme süreçlerini düzenler.",
    keyArticles: [
      {
        articleNo: "Madde 14 & 15",
        title: "Sendika Üyeliği ve Üye Olamayacaklar",
        content:
          "Kamu görevlileri çalıştıkları işyerinin girdiği hizmet kolunda kurulu bir sendikaya üye olabilirler. Üst düzey yöneticiler, yargı mensupları, askerler ve emniyet hizmetleri sınıfı personeli sendika üyesi olamaz.",
        hrImpact:
          "Kamu İK ve personel birimleri, personelin kadro unvanına göre sendika üyelik uygunluğunu ve hizmet kolunu doğru kontrol etmelidir.",
      },
      {
        articleNo: "Madde 18",
        title: "Sendika Üyelerinin ve Yöneticilerinin Güvencesi",
        content:
          "Kamu görevlileri, iş saatleri dışında veya işverenin izni ile iş saatleri içinde sendika faaliyetlerine katılmalarından dolayı farklı bir işleme tabi tutulamaz ve görevlerine son verilemez.",
        hrImpact:
          "Kamu kurumlarında sendika temsilcisinin görev yeri haklı ve açık bir sebep olmadıkça değiştirilemez.",
      },
      {
        articleNo: "Madde 22 & 28",
        title: "Kurum İdari Kurulları ve Toplu Sözleşme",
        content:
          "Kurum düzeyinde çalışma koşulları ve hakların iyileştirilmesi için yılda iki kez Kurum İdari Kurulları toplanır; mali ve sosyal haklar 2 yılda bir Ağustos ayında yapılan Toplu Sözleşme ile belirlenir.",
        hrImpact:
          "Kamu personel birimleri Toplu Sözleşme ikramiyesi ve mali hak güncellemelerini bordro sistemine eksiksiz yansıtmalıdır.",
      },
    ],
    practicalExample:
      "Örnek Senaryo: Bir kamu kurumunda personel dairesi, sendika işyeri temsilcisi olan bir memuru haklı bir gerekçe göstermeden başka bir ilçedeki birime atamaya karar verirse 4688 s.K. m.18 ihlal edilmiş olur. Kurum insan kaynakları birimi, sendika temsilcisi için görev yeri değişikliği öncesi sendikanın ve ilgili mevzuatın öngördüğü açık, somut gerekçeleri hukuk müşavirliğiyle doğrulamalıdır.",
    dailyTips: [
      "4688 s.K. kapsamındaki kamu görevlileri 4857 ve 6356 sayılı kanunlardan farklı olarak grev hakkına sahip değildir; uyuşmazlıklar Kamu Görevlileri Hakem Kurulu ile çözülür.",
      "Kamu sendika üyelik aidatı üyelik formunun kuruma verilmesini izleyen ay başından itibaren maaştan kesilir (m.25).",
      "Kurum İdari Kurulları yılda iki kez Nisan ve Ekim aylarında toplanarak kurum içi çalışma koşullarını görüşür.",
    ],
    keywords: [
      "4688",
      "kamu görevlileri",
      "memur sendikası",
      "toplu sözleşme",
      "kurum idari kurulu",
      "hizmet kolu",
      "sendika temsilcisi",
    ],
    sortOrder: 12,
  },
];
