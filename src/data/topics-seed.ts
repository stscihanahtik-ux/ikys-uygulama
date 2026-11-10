import type { MethodComponent } from "@/db/schema";

export interface HrTopicSeedItem {
  slug: string;
  type: "technique" | "method";
  title: string;
  subtitle: string;
  summary: string;
  stepsOrComponents: MethodComponent[];
  practicalExample: string;
  relatedLaws: string[];
  dailyTips: string[];
  keywords: string[];
  sortOrder: number;
}

export const HR_TOPICS_SEED: HrTopicSeedItem[] = [
  // ==================== 10 İK TEKNİKLERİ ====================
  {
    slug: "stratejik-ik-ve-is-gucu-planlamasi",
    type: "technique",
    title: "Stratejik İK ve İş Gücü Planlaması",
    subtitle: "İK Tekniği • Organizasyonel Uyum & Norm Kadro",
    summary:
      "Şirketin uzun vadeli iş stratejileri ile insan kaynağını hizalar; gelecekte ihtiyaç duyulacak yetkinlikleri, norm kadro sayılarını, yedekleme planlarını ve bütçe projeksiyonlarını belirler.",
    stepsOrComponents: [
      {
        title: "1. İş Stratejisi ve İş Gücü Arz-Talep Analizi",
        description:
          "Büyüme hedefleri, yeni yatırımlar veya otomasyon planlarına göre departman bazlı norm kadro ihtiyacı çıkarılır.",
      },
      {
        title: "2. Yetkinlik Açığı (Skill Gap) Tespiti",
        description:
          "Mevcut çalışanların becerileri ile gelecekteki rollerin gerektirdiği yetkinlikler kıyaslanarak eğitim veya dış alım kararı verilir.",
      },
      {
        title: "3. Yedekleme Planlaması (Succession Planning)",
        description:
          "Kritik pozisyonlar için potansiyel iç adaylar belirlenir ve gelişim programlarına alınır.",
      },
      {
        title: "4. Mevzuat ve Maliyet Optimizasyonu",
        description:
          "Engelli çalıştırma kotası (4857 m.30: %3), Ar-Ge destek oranları (5746) ve SGK teşvikleri iş gücü planına entegre edilir.",
      },
    ],
    practicalExample:
      "Örnek: 2027 yılında yapay zeka tabanlı yeni bir ürün çıkaracak bir yazılım şirketi, 6 ay önceden iş gücü planlaması yapar. Mevcut 50 yazılımcıdan 8'ine 70-20-10 modeliyle veri mühendisliği eğitimi verilmesine, 4 yeni kıdemli uzmanın dışarıdan alınmasına ve 5746 s.K. Ar-Ge teşvikinden yararlanmak için yüksek lisanslı adaylara öncelik verilmesine karar verilir.",
    relatedLaws: ["4857", "5746", "5510"],
    dailyTips: [
      "50 ve üzeri çalışanı olan özel sektör işyerlerinde %3 oranında engelli personel çalıştırma zorunluluğu iş gücü planlamasında takip edilmelidir (4857 s.K. m.30).",
      "Norm kadro planlamasında sadece baş sayısı (headcount) değil, kritik yetkinliklerin yedeklenme oranı da ölçülmelidir.",
    ],
    keywords: [
      "stratejik ik",
      "iş gücü planlaması",
      "norm kadro",
      "yedekleme",
      "skill gap",
      "engelli kotası",
    ],
    sortOrder: 1,
  },
  {
    slug: "ise-alim-ve-yetenek-kazanimi",
    type: "technique",
    title: "İşe Alım ve Yetenek Kazanımı",
    subtitle: "İK Tekniği • İşveren Markası, Seçme & Yerleştirme",
    summary:
      "Doğru adayı doğru zamanda ve doğru maliyetle kuruma kazandırma sürecidir. İlan tasarımından STAR mülakatlarına, referans kontrolünden KVKK uyumlu teklif yönetimine kadar uçtan uca yönetilir.",
    stepsOrComponents: [
      {
        title: "1. İş Analizi ve Yetkinlik Bazlı İlan",
        description:
          "4857 m.5 eşit davranma ilkesine uygun, cinsiyet/yaş ayrımcılığı içermeyen objektif görev tanımı ve ilan hazırlanır.",
      },
      {
        title: "2. Aday Tarama ve KVKK Aydınlatması",
        description:
          "Başvuru anında 6698 s.K. m.10 uyarınca Aday Aydınlatma Metni sunulur; yetenek havuzu için açık rıza alınır.",
      },
      {
        title: "3. Yapılandırılmış Mülakat ve Değerlendirme",
        description:
          "STAR tekniği, vaka çalışmaları ve kişilik envanterleri (DISC/MBTI) ile objektif skorlama yapılır.",
      },
      {
        title: "4. Referans Kontrolü ve İş Teklifi",
        description:
          "Adayın açık rızasıyla referans kontrolü yapılır, brüt/net ücret ve yan haklar yazılı teklif mektubu ile iletilir.",
      },
    ],
    practicalExample:
      "Örnek: Bir satış müdürü alımında İK, tüm adaylara aynı 6 yetkinlik sorusunu STAR metoduyla sorar ve 1-5 puan skalasında puanlar. İlan metninde 'genç ve dinamik' gibi yaş ayrımcılığı riski taşıyan ifadeler yerine 'dinamik tempoya uyum sağlayabilen' ifadesi kullanılır. Referans araması öncesi adaydan yazılı e-posta onayı alınır.",
    relatedLaws: ["4857", "6698", "4721"],
    dailyTips: [
      "İşe alım mülakatlarında adaylara medeni hal, çocuk planı veya siyasi görüş gibi özel hayata dair sorular sormak 4857 m.5 ve KVKK'ya aykırıdır.",
      "Referans kontrolü yaparken mutlaka adayın bilgisini ve açık rızasını alın.",
    ],
    keywords: [
      "işe alım",
      "yetenek kazanımı",
      "mülakat",
      "aday",
      "iş ilanı",
      "referans",
      "teklif",
    ],
    sortOrder: 2,
  },
  {
    slug: "calisana-uyum-ve-baglilik-onboarding",
    type: "technique",
    title: "Çalışana Uyum ve Bağlılık (Onboarding)",
    subtitle: "İK Tekniği • İlk 90 Gün & Kurumsal Entegrasyon",
    summary:
      "Yeni işe başlayan çalışanın yasal özlük/İSG işlemlerinin tamamlanması, şirket kültürüne adapte edilmesi, rol netliğinin sağlanması ve erken dönem işten ayrılmaların önlenmesi sürecidir.",
    stepsOrComponents: [
      {
        title: "1. İşbaşı Öncesi Hazırlık (Pre-boarding)",
        description:
          "İşbaşı tarihinden en geç 1 gün önce SGK işe giriş bildirgesi (5510 m.8) yapılır; ekipman, e-posta ve buddy (rehber) atanır.",
      },
      {
        title: "2. İlk Gün: İSG ve Yasal Uyum",
        description:
          "6331 m.15-17 gereği sağlık raporu ve temel İSG eğitimi tamamlanır; iş sözleşmesi (4857) ve KVKK metinleri imzalanır.",
      },
      {
        title: "3. 30-60-90 Gün Planı",
        description:
          "İlk 30 günde öğrenme, 60 günde katkı sağlama, 90 günde tam otonomi hedefleri yöneticiyle belirlenir.",
      },
      {
        title: "4. Deneme Süresi Değerlendirmesi",
        description:
          "4857 m.15 kapsamındaki 2 aylık deneme süresi bitmeden 45. günde geri bildirim ve nabız anketi yapılır.",
      },
    ],
    practicalExample:
      "Örnek: Yeni başlayan finans uzmanına işbaşı yapmadan 3 gün önce hoş geldin kiti ve ilk hafta programı gönderilir. İşbaşından 1 gün önce SGK girişi yapılır. İlk gün sabah İSG eğitimi ve özlük evrakları tamamlanır, öğleden sonra ekiple tanışma ve Buddy eşleşmesi yapılır. 45. günde İK ile uyum görüşmesi gerçekleştirilir.",
    relatedLaws: ["5510", "6331", "4857", "6698"],
    dailyTips: [
      "Yapılandırılmış bir onboarding programı, yeni çalışanların ilk 6 ayda şirkette kalma oranını %50'nin üzerinde artırır.",
      "4857 m.15'teki 2 aylık deneme süresini kaçırmamak için takvime 45. gün değerlendirme hatırlatması ekleyin.",
    ],
    keywords: [
      "onboarding",
      "oryantasyon",
      "uyum",
      "bağlılık",
      "buddy",
      "30-60-90",
      "deneme süresi",
    ],
    sortOrder: 3,
  },
  {
    slug: "performans-ve-yetenek-yonetimi",
    type: "technique",
    title: "Performans ve Yetenek Yönetimi",
    subtitle: "İK Tekniği • Hedef Belirleme, Değerlendirme & Kalibrasyon",
    summary:
      "Çalışanların performansını objektif ölçütlerle değerlendirme, yüksek potansiyelli yetenekleri geliştirme ve düşük performans durumlarını hukuka uygun (4857 m.18-19) şekilde yönetme sürecidir.",
    stepsOrComponents: [
      {
        title: "1. Hedef ve Yetkinlik Belirleme",
        description:
          "Dönem başında KPI ve OKR metodolojileriyle ölçülebilir hedefler tanımlanır.",
      },
      {
        title: "2. Sürekli Geri Bildirim ve Ara Değerlendirme",
        description:
          "Yıl ortasında 1:1 görüşmeler ve 360 derece geri bildirimlerle gelişim alanları desteklenir.",
      },
      {
        title: "3. Kalibrasyon ve 9-Box Değerlendirmesi",
        description:
          "Yöneticiler arası değerlendirme standartlarını eşitlemek için kalibrasyon toplantıları yapılır; çalışanlar 9-Box matrisine yerleştirilir.",
      },
      {
        title: "4. Performans Geliştirme Planı (PIP)",
        description:
          "Düşük performans gösteren çalışanlar için yazılı gelişim planı (PIP) ve koçluk uygulanır; sonuç alınamazsa 4857 m.19 savunma prosedürü işletilir.",
      },
    ],
    practicalExample:
      "Örnek: Bir çağrı merkezi takım lideri yıllık değerlendirmede düşük puan almıştır. İK doğrudan fesih yerine 60 günlük bir PIP başlatır; haftalık takip toplantıları kayıt altına alınır ve koçluk sağlanır. Bu sayede çalışan ya performansını yükseltir ya da olası bir fesih durumunda işverenin elinde geçerli hukuki kanıt oluşur.",
    relatedLaws: ["4857", "4721"],
    dailyTips: [
      "Yargıtay kararlarına göre işveren, sadece performans düşüklüğü iddiasıyla değil; objektif ölçütler ve eğitim/gelişim fırsatı sunduktan sonra geçerli fesih yapabilir.",
      "Performans notlarının ücret ve terfi kararlarıyla şeffaf biçimde bağlanması çalışan adalet algısını güçlendirir.",
    ],
    keywords: [
      "performans",
      "yetenek yönetimi",
      "pip",
      "kalibrasyon",
      "geri bildirim",
      "terfi",
    ],
    sortOrder: 4,
  },
  {
    slug: "ogrenme-ve-gelisim-egitim-yonetimi",
    type: "technique",
    title: "Öğrenme ve Gelişim (Eğitim Yönetimi)",
    subtitle: "İK Tekniği • Eğitim İhtiyaç Analizi & Gelişim Akademisi",
    summary:
      "Çalışanların teknik, davranışsal ve yasal (İSG, KVKK) yetkinliklerini artırmak için eğitim ihtiyaç analizi yapılması, program tasarımı ve eğitim yatırım getirisinin (ROI) ölçülmesi sürecidir.",
    stepsOrComponents: [
      {
        title: "1. Eğitim İhtiyaç Analizi (TNA)",
        description:
          "Performans sonuçları, stratejik hedefler ve yasal zorunluluklar (6331 İSG, 6698 KVKK) taranarak yıllık eğitim kataloğu oluşturulur.",
      },
      {
        title: "2. Tasarım ve Sunum (ADDIE & 70-20-10)",
        description:
          "Eğitimler sınıf içi, e-öğrenme, mentorluk ve işbaşı projelerle harmanlanır.",
      },
      {
        title: "3. Etki Değerlendirme (Kirkpatrick)",
        description:
          "Sadece memnuniyet anketiyle kalınmaz; davranış değişikliği ve iş sonuçlarına etkisi ölçülür.",
      },
      {
        title: "4. Eğitim Maliyeti ve Yasal Şartlar",
        description:
          "Zorunlu İSG eğitimleri çalışma süresinden sayılır; yüksek maliyetli sertifika eğitimleri için TBK ilkelerine uygun makul süreli eğitim gideri taahhütnamesi düzenlenebilir.",
      },
    ],
    practicalExample:
      "Örnek: Şirket, üretim şeflerine liderlik gelişim programı planlar. ADDIE modeliyle içerik tasarlanır, %70 işbaşı proje + %20 koçluk + %10 atölye (70-20-10) uygulanır. 3 ay sonra Kirkpatrick 3. ve 4. seviye kapsamında ekip bağlılığı ve vardiya verimliliği ölçülerek eğitimin iş etkisi raporlanır.",
    relatedLaws: ["6331", "6098", "4857"],
    dailyTips: [
      "Eğitim taahhütnamesi imzalatırken ceza tutarı çalışanın aldığı gerçek ve belgelenebilir eğitim maliyetiyle orantılı olmalıdır (TBK m.420/Yargıtay içtihatları).",
      "6331 s.K. kapsamındaki zorunlu İSG eğitimlerinin maliyeti çalışanlara yansıtılamaz.",
    ],
    keywords: [
      "eğitim",
      "öğrenme ve gelişim",
      "akademi",
      "ihtiyaç analizi",
      "taahhütname",
      "mentorluk",
    ],
    sortOrder: 5,
  },
  {
    slug: "ucret-ve-yan-haklar-yonetimi",
    type: "technique",
    title: "Ücret ve Yan Haklar Yönetimi",
    subtitle: "İK Tekniği • Ücret Yapısı, Piyasa Kıyaslama & Total Rewards",
    summary:
      "İç adalet ve dış rekabetçiliği sağlayan ücret bantlarının oluşturulması, prim/ikramiye sistemleri ile vergi-SGK avantajlı yan haklar paketlerinin yönetilmesidir.",
    stepsOrComponents: [
      {
        title: "1. İş Değerleme ve Kademelendirme",
        description:
          "Hay Group gibi metotlarla her pozisyonun kuruma katkısı puanlanarak ücret kademeleri (grade) belirlenir.",
      },
      {
        title: "2. Piyasa Ücret Araştırması ve Bant Oluşturma",
        description:
          "Sektör benchmark verileriyle her kademe için minimum-orta-maksimum ücret bantları kurulur.",
      },
      {
        title: "3. Yan Haklar ve Vergi Optimizasyonu",
        description:
          "193 s.K. ve 5510 s.K. m.80 istisnaları gözetilerek yemek, ulaşım, özel sağlık sigortası ve esnek yan haklar tasarlanır.",
      },
      {
        title: "4. Eşit İşe Eşit Ücret Denetimi",
        description:
          "4857 m.5 doğrultusunda cinsiyet ve diğer demografik kırılımlarda ücret eşitsizliği analizi yapılır.",
      },
    ],
    practicalExample:
      "Örnek: Şirket enflasyonist dönemde çalışanlara 3.000 TL nakit zam yerine; GVK m.23 yemek istisnası sınırında yemek kartı artışı, ulaşım kartı desteği ve BES işveren katkısı kombinasyonu sunarak hem işverenin SGK/vergi yükünü optimize eder hem de çalışanın eline geçen net değeri artırır.",
    relatedLaws: ["193", "5510", "4857", "5746"],
    dailyTips: [
      "Ücret bantlarında çalışanın bant içi konumu (Compa-Ratio = Mevcut Ücret / Bant Orta Noktası) terfi ve zam dağıtımında adaleti sağlar.",
      "4857 m.22'ye göre çalışma koşullarında işçi aleyhine esaslı değişiklik (ücret veya yan hak düşüşü) çalışanın 6 iş günü içinde yazılı onayı olmadan yapılamaz.",
    ],
    keywords: [
      "ücret",
      "yan haklar",
      "maaş",
      "compa-ratio",
      "prim",
      "esnek yan haklar",
      "bant",
    ],
    sortOrder: 6,
  },
  {
    slug: "endustriyel-ve-calisan-iliskileri",
    type: "technique",
    title: "Endüstriyel ve Çalışan İlişkileri",
    subtitle: "İK Tekniği • Sendika, TİS, Disiplin & Çalışan Memnuniyeti",
    summary:
      "İşveren, çalışanlar ve sendikalar arasındaki ilişkilerin barışçıl ve mevzuata uygun yürütülmesini; disiplin süreçleri, etik hat ve toplu iş sözleşmesi (TİS) müzakerelerini kapsar.",
    stepsOrComponents: [
      {
        title: "1. Sendikal İlişkiler ve TİS Yönetimi",
        description:
          "6356 ve 4688 sayılı kanunlar çerçevesinde sendika temsilcileriyle düzenli diyalog ve TİS müzakereleri yürütülür.",
      },
      {
        title: "2. Disiplin Kurulu ve Savunma Süreçleri",
        description:
          "Tutanak, 4857 m.19 savunma istemi ve 6 iş günlük hak düşürücü süre (m.26) gözetilerek adil disiplin kararları alınır.",
      },
      {
        title: "3. Mobbing ve Etik Bildirim Yönetimi",
        description:
          "6098 TBK m.417 uyarınca psikolojik ve cinsel taciz iddiaları gizlilik ve tarafsızlıkla soruşturulur.",
      },
      {
        title: "4. Çalışan Bağlılığı ve Nabız Anketleri",
        description:
          "eNPS ve memnuniyet anketleriyle iş barışını bozabilecek riskler erken tespit edilir.",
      },
    ],
    practicalExample:
      "Örnek: Bir üretim tesisinde iki çalışan arasında tartışma yaşanmıştır. Disiplin süreci için olay günü görgü tanıklarıyla tutanak tutulur, ilgili çalışanlardan yazılı savunma istenir ve 6 iş günü içinde Disiplin Kurulu toplanır. Benzer olaylarda geçmişte uygulanan kararlarla tutarlı (TMK m.2) bir yaptırım uygulanır.",
    relatedLaws: ["6356", "4688", "4857", "6098", "4721"],
    dailyTips: [
      "Disiplin cezalarında ölçülülük ve tutarlılık ilkesi esastır; aynı ihlale bir çalışana uyarı, diğerine fesih verilmesi ayrımcılık ve kötü niyet sayılır.",
      "Sendikalı işyerlerinde TİS hükümleri iş sözleşmesi hükümlerinden çalışanın lehine olduğu ölçüde önceliklidir.",
    ],
    keywords: [
      "endüstriyel ilişkiler",
      "çalışan ilişkileri",
      "disiplin",
      "etik",
      "tis",
      "sendika",
      "enps",
    ],
    sortOrder: 7,
  },
  {
    slug: "ozluk-isleri-ve-bordrolama",
    type: "technique",
    title: "Özlük İşleri ve Bordrolama",
    subtitle: "İK Tekniği • Yasal Dosyalama, Puantaj, Tahakkuk & İcra",
    summary:
      "Çalışanların işe girişten çıkışa kadar tüm yasal belgelerinin (4857 m.75) arşivlenmesi, puantaj, izin, rapor, SGK bildirgeleri, gelir vergisi ve maaş haczi kesintilerinin hatasız hesaplanmasıdır.",
    stepsOrComponents: [
      {
        title: "1. Özlük Dosyası Oluşturma (4857 m.75)",
        description:
          "Kimlik, ikametgah, sağlık raporu, diploma, adli sicil, iş sözleşmesi ve KVKK onayları eksiksiz dosyalanır.",
      },
      {
        title: "2. Puantaj, Fazla Mesai ve Rapor Takibi",
        description:
          "Giriş-çıkış saatleri, hafta tatili, resmi tatil ve istirahat raporları (vizite/e-Ödenek) bordroya işlenir.",
      },
      {
        title: "3. Bordro Tahakkuku (193, 5510, 4447, 5746)",
        description:
          "Brüt-net hesaplama, asgari ücret vergi istisnası, SGK teşvikleri ve Ar-Ge istisnaları uygulanır; imzalı/e-imzalı bordro paylaşılır.",
      },
      {
        title: "4. İcra ve Nafaka Kesintileri (2004 İİK)",
        description:
          "Gelen haciz müzekkerelerine 7 gün içinde yanıt verilir; nafaka öncelikli olmak üzere 1/4 kesintiler zamanında yatırılır.",
      },
    ],
    practicalExample:
      "Örnek: Ay sonunda bir çalışan 5 gün raporlu (istirahatli), 6 saat fazla mesaili ve 1/4 maaş hacizlidir. Bordro uzmanı 5510'a göre raporlu günleri SGK'dan eksik gün (01-İstirahat) bildirir, 4857 m.41'e göre 6 saat fazla mesaiyi %50 zamlı ekler, 193'e göre asgari ücret istisnasını düşer ve oluşan net maaşın 1/4'ünü İcra Dairesi IBAN'ına yatırarak makbuzu özlük dosyasına ekler.",
    relatedLaws: ["4857", "5510", "193", "2004", "4447", "5746", "6698"],
    dailyTips: [
      "4857 s.K. m.75 gereği işveren her işçi için özlük dosyası düzenlemek zorundadır; denetimlerde eksik özlük dosyası idari para cezasına konu olur.",
      "Ücret hesap pusulasının (bordro) her ay çalışana verilmesi veya KEP/dijital onaylı erişime açılması ispat hukuku açısından kritik önemdedir (4857 m.37).",
    ],
    keywords: [
      "özlük",
      "bordro",
      "puantaj",
      "maaş hesabı",
      "eksik gün",
      "hesap pusulası",
      "icra kesintisi",
    ],
    sortOrder: 8,
  },
  {
    slug: "ik-analitigi-ve-raporlama",
    type: "technique",
    title: "İK Analitiği ve Raporlama",
    subtitle: "İK Tekniği • Veri Odaklı İK & Tahminleme Metrikleri",
    summary:
      "İş gücü devir oranı (turnover), devamsızlık, işe alım süresi, eğitim ROI'si ve ücret dağılımı gibi İK verilerinin analiz edilerek yönetime karar destek sunulmasıdır.",
    stepsOrComponents: [
      {
        title: "1. Temel İK Metriklerinin Tanımlanması",
        description:
          "Turnover (gönüllü/gönülsüz), Time-to-Hire, Cost-per-Hire, Devamsızlık Oranı (Absenteeism) ve eNPS standart formüllerle ölçülür.",
      },
      {
        title: "2. Veri Kalitesi ve KVKK Anonimleştirme",
        description:
          "Raporlamada kişisel veriler anonimleştirilir veya toplulaştırılır (6698 s.K. uyumu).",
      },
      {
        title: "3. Kök Neden ve Tahminleme Analizi",
        description:
          "Çıkış mülakatı verileri ile ilk yıl işten ayrılma nedenleri korelasyon analizine tabi tutulur.",
      },
      {
        title: "4. Yönetici Paneli (Executive Dashboard)",
        description:
          "Bütçe, fazla mesai maliyeti, izin birikimi riski ve kritik rol doluluk oranları aylık olarak üst yönetime raporlanır.",
      },
    ],
    practicalExample:
      "Örnek: İK analitik panelinde ilk 6 ayda işten ayrılma oranının %28'e çıktığı görülüyor. Veriler departmana ve yöneticiye göre kırıldığında, artışın tek bir şubedeki zayıf onboarding ve yoğun fazla mesaiden kaynaklandığı tespit edilir. Müdahale sonrası 6 ayda turnover %12'ye düşürülür.",
    relatedLaws: ["6698", "4857"],
    dailyTips: [
      "Aylık İş Gücü Devir Oranı = (Ay İçinde Ayrılanlar / Ortalama Çalışan Sayısı) x 100 formülüyle hesaplanır; gönüllü ve istemsiz ayrılmalar ayrı izlenmelidir.",
      "Birikmiş yıllık izin günlerinin finansal karşılığı (izin yükü) yıl sonu bilançosu için mutlaka raporlanmalıdır.",
    ],
    keywords: [
      "ik analitiği",
      "raporlama",
      "turnover",
      "devir oranı",
      "metrik",
      "dashboard",
      "time to hire",
    ],
    sortOrder: 9,
  },
  {
    slug: "isten-cikis-surecleri-offboarding",
    type: "technique",
    title: "İşten Çıkış Süreçleri (Offboarding)",
    subtitle: "İK Tekniği • Yasal Fesih, Devir Teslim & Çıkış Mülakatı",
    summary:
      "Çalışanın istifa, emeklilik, ikale veya işveren feshiyle kurumdan ayrılmasında tüm hukuki, mali, güvenlik ve deneyim adımlarının eksiksiz yönetilmesidir.",
    stepsOrComponents: [
      {
        title: "1. Hukuki Fesih Prosedürü ve İhbar/Kıdem",
        description:
          "4857 m.17-25 uyarınca fesih gerekçesi, savunma (m.19), ihbar süresi/tazminatı ve kıdem tazminatı hesaplanır.",
      },
      {
        title: "2. SGK Çıkış Bildirimi ve 4447 Uyumu",
        description:
          "5510 m.9 gereği 10 gün içinde doğru SGK çıkış koduyla bildirim yapılır; çalışma belgesi (4857 m.28) hazırlanır.",
      },
      {
        title: "3. Zimmet Teslimi ve Bilgi Güvenliği",
        description:
          "Şirket bilgisayarı, kartlar ve dijital erişimler kapatılır; gizlilik ve rekabet yasağı (6098 m.444) yükümlülükleri hatırlatılır.",
      },
      {
        title: "4. Çıkış Mülakatı ve Banka Ödemesi / İbra",
        description:
          "Çıkış mülakatı yapılır; tüm hak edişler banka yoluyla ödenir ve TBK m.420 uyarınca 1 ay dolmadan geçersiz ibraname düzenlenmez.",
      },
    ],
    practicalExample:
      "Örnek: Kıdemli bir mühendis istifa ettiğinde 4857 m.17'ye göre ihbar süresini çalışarak tamamlar. Son gün zimmet devri yapılır, e-posta ve VPN erişimleri sonlandırılır, çıkış mülakatı uygulanır. Kalan yıllık izin ücreti son bordroya eklenerek bankadan ödenir, 10 gün içinde SGK Kod 03 ile çıkış verilir ve çalışma belgesi teslim edilir.",
    relatedLaws: ["4857", "5510", "6098", "4447", "6698"],
    dailyTips: [
      "4857 m.28 gereği işten ayrılan işçiye işinin çeşidini ve süresini gösteren 'Çalışma Belgesi' verilmesi zorunludur.",
      "İşten ayrılış tarihinden itibaren hak ediş ödemeleri geciktirilmeden banka hesabına yatırılmalı; ibraname için TBK m.420'deki 1 aylık süre kuralı unutulmamalıdır.",
    ],
    keywords: [
      "offboarding",
      "işten çıkış",
      "fesih",
      "çıkış mülakatı",
      "zimmet",
      "çalışma belgesi",
      "kıdem",
      "ihbar",
    ],
    sortOrder: 10,
  },

  // ==================== 14 İK METOTLARI ====================
  {
    slug: "360-derece-geri-bildirim",
    type: "method",
    title: "360 Derece Geri Bildirim",
    subtitle: "İK Metodu • Çok Kaynaklı Yetkinlik Değerlendirmesi",
    summary:
      "Bir çalışanın davranışsal yetkinliklerinin yalnızca yöneticisi tarafından değil; çalışma arkadaşları (eş düzey), astları, müşterileri ve kendisi tarafından çok yönlü olarak değerlendirildiği gelişim odaklı metodolojidir.",
    stepsOrComponents: [
      {
        title: "1. Öz Değerlendirme (Self)",
        description:
          "Çalışanın kendi güçlü ve gelişim alanlarına dair farkındalığını ölçer.",
      },
      {
        title: "2. Yönetici ve Ast Değerlendirmesi",
        description:
          "Yukarıdan aşağıya beklenti uyumu ve aşağıdan yukarıya liderlik etkisini ortaya koyar.",
      },
      {
        title: "3. Eş Düzey (Peer) ve Paydaş Görüşü",
        description:
          "Takım çalışması, iletişim ve iş birliği becerilerini yatay perspektiften ölçer.",
      },
      {
        title: "4. Anonim Raporlama ve Gelişim Planı",
        description:
          "KVKK gizlilik ilkeleri gözetilerek anonimleştirilen rapor, koçluk görüşmesiyle Bireysel Gelişim Planına (IDP) dönüştürülür.",
      },
    ],
    practicalExample:
      "Örnek: Bir proje yöneticisi teknik olarak çok başarılıdır ancak ekibiyle iletişiminde kör noktalar vardır. 360 derece değerlendirmede yöneticisi kendisine 4.5/5 verirken, astları 'dinleme ve geri bildirim verme' yetkinliğine 2.3/5 vermiştir. Yönetici bu objektif veriyi gördükten sonra iletişim koçluğu almaya gönüllü olur.",
    relatedLaws: ["6698", "4857"],
    dailyTips: [
      "360 derece geri bildirimde psikolojik güvenlik için en az 3-4 eş düzey/ast yanıtı toplanmadan sonuçlar açılmamalıdır.",
      "İlk uygulamada 360 derece sonuçlarını doğrudan maaş/primle bağlamak yerine gelişim amaçlı kullanmak dürüst geri bildirimi artırır.",
    ],
    keywords: ["360 derece", "geri bildirim", "yetkinlik", "kör nokta", "değerlendirme"],
    sortOrder: 11,
  },
  {
    slug: "9-box-matrix",
    type: "method",
    title: "9-Box Matrix (9 Kutulu Matris)",
    subtitle: "İK Metodu • Performans ve Potansiyel Yetenek Haritası",
    summary:
      "Çalışanları dikey eksende 'Potansiyel' (Düşük-Orta-Yüksek) ve yatay eksende 'Performans' (Düşük-Orta-Yüksek) boyutlarında 9 kutuya ayırarak yedekleme, terfi ve gelişim stratejisi belirleyen araçtır.",
    stepsOrComponents: [
      {
        title: "Kutu 9 (Yüksek Performans / Yüksek Potansiyel - Yıldız)",
        description:
          "Kritik liderlik yedekleme havuzuna alınır; stratejik projeler ve hızlandırılmış gelişim sunulur.",
      },
      {
        title: "Kutu 6 & 8 (Gelecek Vadedenler & Büyüme Yıldızları)",
        description:
          "Güçlü performans veya yüksek potansiyele sahiptir; mentorluk ve çapraz görevlerle üst kutuya hazırlanır.",
      },
      {
        title: "Kutu 3 & 5 (Çekirdek / Güvenilir Profesyoneller)",
        description:
          "Şirketin omurgasını oluşturur; uzmanlık derinleşmesi ve takdir mekanizmalarıyla elde tutulur.",
      },
      {
        title: "Kutu 1 (Düşük Performans / Düşük Potansiyel - Risk)",
        description:
          "Rol uyumu gözden geçirilir; PIP (Performans Geliştirme Planı) uygulanır, sonuç alınamazsa 4857 m.18-19 süreci işletilir.",
      },
    ],
    practicalExample:
      "Örnek: Yıl sonu kalibrasyon kurulunda 120 uzman değerlendirilir. 9-Box haritasında 'Yüksek Potansiyel - Orta Performans' kutusunda yer alan 6 genç çalışana daha net KPI hedefleri ve kıdemli mentor atanırken, 'Yüksek Performans - Yüksek Potansiyel' kutusundaki 4 çalışan Müdürlük Yedekleme Programına alınır.",
    relatedLaws: ["4857", "4721"],
    dailyTips: [
      "9-Box tek bir yöneticinin sübjektif kararıyla değil, kalibrasyon toplantısında kanıtlara dayalı olarak doldurulmalıdır.",
      "Potansiyel değerlendirmesi mevcut işteki başarıyı değil, daha karmaşık rollerdeki öğrenme çevikliğini ölçer.",
    ],
    keywords: ["9-box", "9 kutulu matris", "potansiyel", "performans", "yetenek havuzu", "yedekleme"],
    sortOrder: 12,
  },
  {
    slug: "kpi-anahtar-performans-gostergesi",
    type: "method",
    title: "KPI (Anahtar Performans Göstergesi)",
    subtitle: "İK Metodu • Sayısal Operasyonel Performans Ölçümü",
    summary:
      "Kurumun, departmanın veya çalışanın kritik iş süreçlerindeki başarısını sürekli ve sayısal olarak izleyen ölçülebilir göstergelerdir (Key Performance Indicators).",
    stepsOrComponents: [
      {
        title: "1. SMART Kriterleri ile Tanımlama",
        description:
          "Belirli (Specific), Ölçülebilir (Measurable), Ulaşılabilir (Achievable), İlgili (Relevant) ve Zamanlı (Time-bound) olmalıdır.",
      },
      {
        title: "2. Öncü (Leading) ve Artçı (Lagging) Göstergeler",
        description:
          "Satış cirosu artçı bir KPI iken, haftalık müşteri ziyaret sayısı sonucu etkileyen öncü bir KPI'dır.",
      },
      {
        title: "3. Hedef, Eşik ve Tavan Belirleme",
        description:
          "Performans primi veya değerlendirme için %80 eşik, %100 hedef, %120 üstün başarı seviyeleri tanımlanır.",
      },
      {
        title: "4. Periyodik İzleme ve Raporlama",
        description:
          "Aylık veya çeyreklik panellerle sapmalar erken tespit edilir.",
      },
    ],
    practicalExample:
      "Örnek: İK departmanının temel KPI'ları: Ortalama İşe Alım Süresi (Time-to-Hire ≤ 35 gün), İlk 90 Gün İşten Ayrılma Oranı (< %8), Yıllık İSG Eğitim Tamamlama Oranı (%100) ve Bordro Hatasızlık Oranı (%99,8).",
    relatedLaws: ["4857", "6331"],
    dailyTips: [
      "Bir çalışana 4-6 adetten fazla KPI atamak odaklanmayı azaltır; en kritik göstergeler seçilmelidir.",
      "KPI hedefleri çalışanın kontrol edebildiği değişkenlere dayanmalıdır.",
    ],
    keywords: ["kpi", "performans göstergesi", "smart", "ölçüm", "hedef"],
    sortOrder: 13,
  },
  {
    slug: "okr-objectives-and-key-results",
    type: "method",
    title: "OKR (Objectives and Key Results)",
    subtitle: "İK Metodu • Çevik Amaçlar ve Anahtar Sonuçlar",
    summary:
      "Şirket, ekip ve birey hedeflerini hizalayan; ilham verici 'Amaçlar' (Objectives) ile bu amaçlara ulaşıldığını kanıtlayan ölçülebilir 'Anahtar Sonuçları' (Key Results) çeyreklik döngülerde birleştiren hedef yönetimi sistemidir.",
    stepsOrComponents: [
      {
        title: "1. Amaç (Objective) - Nereye Gitmek İstiyoruz?",
        description:
          "Nitel, ilham verici ve yön belirleyici cümlelerdir (Örn: 'Sektörde en hızlı ve aday dostu işe alım deneyimini sunmak').",
      },
      {
        title: "2. Anahtar Sonuçlar (Key Results) - Oraya Vardığımızı Nasıl Anlarız?",
        description:
          "Her amaç için 3-5 adet sayısal, çıktıyı değil etkiyi ölçen sonuç belirlenir (Örn: 'Aday NPS skorunu 42'den 70'e çıkarmak').",
      },
      {
        title: "3. Dikey ve Yatay Hizalama",
        description:
          "Şirket OKR'ları şeffaf biçimde yayınlanır; ekipler kendi OKR'larını üst hedeflere katkı sağlayacak şekilde yazar.",
      },
      {
        title: "4. Çeyreklik Ritim ve %70 Başarı Kuralı",
        description:
          "İddialı (stretch) OKR'larda %70-%80 gerçekleşme yüksek başarı sayılır; prim/maaş sisteminden ayrı tutulması cesur hedef koymayı teşvik eder.",
      },
    ],
    practicalExample:
      "Örnek: İK Q2 OKR'ı — Objective: 'Yeni çalışanların ilk 90 günde tam verime ulaşmasını hızlandırmak.' KR1: Onboarding memnuniyet puanını 3.8'den 4.6'ya çıkarmak. KR2: İlk 90 gün ayrılma oranını %15'ten %5'e düşürmek. KR3: Yöneticilerin %100'ünün 30-60-90 gün görüşmesini zamanında tamamlamasını sağlamak.",
    relatedLaws: ["4857"],
    dailyTips: [
      "KPI günlük sağlığı ölçen 'gösterge paneli', OKR ise sizi ileriye taşıyan 'navigasyon rotasıdır'; ikisi birlikte kullanılabilir.",
      "OKR'larda görev listesi (to-do) yazmak yerine ölçülebilir değer/etki değişikliği yazılmalıdır.",
    ],
    keywords: ["okr", "amaç", "anahtar sonuç", "çeyreklik hedef", "hizalama"],
    sortOrder: 14,
  },
  {
    slug: "star-metodu",
    type: "method",
    title: "STAR Metodu",
    subtitle: "İK Metodu • Davranışsal Mülakat ve Somut Kanıt Tekniği",
    summary:
      "Geçmiş davranışların gelecek performansın en iyi göstergesi olduğu ilkesine dayanarak mülakatlarda adayın gerçek deneyimlerini Situation (Durum), Task (Görev), Action (Eylem) ve Result (Sonuç) adımlarıyla sorgulayan tekniktir.",
    stepsOrComponents: [
      {
        title: "S - Situation (Durum)",
        description:
          "Adayın karşılaştığı somut iş bağlamı, zaman, yer ve koşullar netleştirilir.",
      },
      {
        title: "T - Task (Görev)",
        description:
          "Bu durumda adayın şahsi sorumluluğu ve ulaşması gereken hedef sorgulanır.",
      },
      {
        title: "A - Action (Eylem)",
        description:
          "Ekibin değil, bizzat adayın ('Ben ne yaptım?') attığı somut adımlar ve kullandığı yöntemler incelenir.",
      },
      {
        title: "R - Result (Sonuç)",
        description:
          "Eylemin ölçülebilir iş sonucu, öğrenilen dersler ve karşı tarafın tepkisi alınır.",
      },
    ],
    practicalExample:
      "Örnek Mülakat Sorusu: 'Zor bir müşteri veya yönetici itirazını ikna ettiğiniz bir anı anlatır mısınız?' — Aday 'Genelde iyi iletişim kurarım' derse mülakatçı STAR ile derinleşir: 'Hangi projeydi (S)? Sizin sorumluluğunuz neydi (T)? Tam olarak hangi adımları attınız (A)? Sonuçta ne değişti (R)?'",
    relatedLaws: ["4857", "6698"],
    dailyTips: [
      "STAR mülakatında aday 'Biz yaptık' diye konuşuyorsa mutlaka 'Burada tam olarak sizin bireysel aksiyonunuz neydi?' diye sorun.",
      "Aynı soruların tüm adaylara sorulması 4857 m.5 eşit davranma ilkesini işe alımda da güvence altına alır.",
    ],
    keywords: ["star", "mülakat", "davranışsal", "situation", "task", "action", "result"],
    sortOrder: 15,
  },
  {
    slug: "7s-modeli-mckinsey",
    type: "method",
    title: "7S Modeli (McKinsey)",
    subtitle: "İK Metodu • Organizasyonel Uyum ve Değişim Yönetimi",
    summary:
      "Bir organizasyonun etkinliğini belirleyen 7 birbirine bağlı unsuru (3 Sert Unsur: Strateji, Yapı, Sistemler; 4 Yumuşak Unsur: Paylaşılan Değerler, Beceriler, Çalışanlar, Yönetim Tarzı) bütünsel analiz eden stratejik modeldir.",
    stepsOrComponents: [
      {
        title: "Sert Unsurlar (Hard S)",
        description:
          "Strategy (Strateji), Structure (Organizasyon Yapısı) ve Systems (İK/ERP/Bordro Sistemleri).",
      },
      {
        title: "Yumuşak Unsurlar (Soft S)",
        description:
          "Shared Values (Kurum Kültürü - Merkezde), Style (Liderlik Tarzı), Staff (Yetenek Profili) ve Skills (Kurumsal Yetkinlikler).",
      },
      {
        title: "Hizalama Analizi",
        description:
          "Örneğin strateji 'çevik inovasyon' iken yapı katı hiyerarşik veya ödül sistemleri risk almayı cezalandırıyorsa uyumsuzluk vardır.",
      },
    ],
    practicalExample:
      "Örnek: Bir banka dijital dönüşüm (Strateji) kararı almıştır. McKinsey 7S analizi yapan İK; organizasyon şemasını ürün takımlarına (Structure), performans primini ekip çevikliğine (Systems) dönüştürür, çalışanlara ürün yönetimi becerisi (Skills) kazandırır ve yöneticilere koçluk tarzı (Style) eğitimi verir.",
    relatedLaws: ["4857"],
    dailyTips: [
      "Organizasyonel değişim projelerinin başarısız olmasının ana sebebi sadece Yapı ve Strateji'yi değiştirip Yumuşak Unsurları (Kültür, Liderlik Tarzı) ihmal etmektir.",
    ],
    keywords: ["7s", "mckinsey", "organizasyon", "değişim yönetimi", "kültür", "yapı"],
    sortOrder: 16,
  },
  {
    slug: "70-20-10-gelisim-kurali",
    type: "method",
    title: "70-20-10 Gelişim Kuralı",
    subtitle: "İK Metodu • Yetişkin Öğrenme ve Gelişim Mimarisi",
    summary:
      "Yetişkin çalışanların iş yerindeki kalıcı öğrenmelerinin %70'inin zorlayıcı işbaşı deneyimlerden, %20'sinin sosyal etkileşim/mentorluktan, %10'unun ise formal sınıf içi/online eğitimlerden geldiğini savunan modeldir.",
    stepsOrComponents: [
      {
        title: "%70 Deneyimsel Öğrenme (İşbaşında)",
        description:
          "Rotasyon, proje liderliği, kriz yönetimi, yeni müşteri kazanımı gibi gerçek sorumluluklar.",
      },
      {
        title: "%20 Sosyal Öğrenme (Başkalarından)",
        description:
          "Koçluk, mentorluk, gölgeleme (shadowing), akran öğrenme toplulukları ve düzenli geri bildirim.",
      },
      {
        title: "%10 Formal Öğrenme (Eğitimlerden)",
        description:
          "Sınıf içi atölyeler, LMS e-öğrenme modülleri, sertifika programları ve kitap/makale çalışmaları.",
      },
    ],
    practicalExample:
      "Örnek: Bir İK uzmanını İK İş Ortağı (HRBP) rolüne hazırlamak için: %10 olarak iş hukuku ve analitik eğitimi verilir; %20 olarak kıdemli bir HRBP ile aylık mentorluk ve gölgeleme yapılır; %70 olarak da 100 kişilik bir satış ekibinin performans ve işe alım süreçlerinin sorumluluğu verilir.",
    relatedLaws: ["6331"],
    dailyTips: [
      "Sadece sınıf içi eğitim (%10) ile davranış değişikliği beklemek verimsizdir; eğitim sonrası mutlaka %70 işbaşı uygulama görevi tanımlayın.",
    ],
    keywords: ["70-20-10", "gelişim", "mentorluk", "koçluk", "işbaşı öğrenme"],
    sortOrder: 17,
  },
  {
    slug: "addie-modeli",
    type: "method",
    title: "ADDIE Modeli",
    subtitle: "İK Metodu • Sistematik Eğitim Tasarım Döngüsü",
    summary:
      "Kurumsal eğitim programlarının sıfırdan yapılandırılması için kullanılan 5 aşamalı öğretim tasarımı modelidir: Analyze (Analiz), Design (Tasarım), Develop (Geliştirme), Implement (Uygulama), Evaluate (Değerlendirme).",
    stepsOrComponents: [
      {
        title: "A - Analyze (Analiz)",
        description:
          "Hedef kitle, mevcut performans açığı, öğrenme hedefleri ve kısıtlar belirlenir.",
      },
      {
        title: "D - Design (Tasarım)",
        description:
          "Eğitim müfredatı, modül akışı, yöntemler (video, vaka, simülasyon) ve ölçme araçları planlanır.",
      },
      {
        title: "D - Develop (Geliştirme)",
        description:
          "Sunumlar, çalışma kitapları, e-öğrenme içerikleri ve vaka senaryoları üretilir, pilot test yapılır.",
      },
      {
        title: "I - Implement (Uygulama) & E - Evaluate (Değerlendirme)",
        description:
          "Eğitim eğitmen veya LMS üzerinden sunulur; Kirkpatrick seviyeleriyle etkinliği ölçülerek iyileştirilir.",
      },
    ],
    practicalExample:
      "Örnek: Şirket genelinde 6698 KVKK farkındalık eğitimi tasarlanacaktır. ADDIE ile: (A) İK, Satış ve IT ekiplerinin farklı veri riskleri analiz edilir; (D) Rol bazlı 15 dakikalık senaryolar tasarlanır; (D) İnteraktif e-öğrenme geliştirilir; (I) Tüm personele atanır; (E) Quiz sonuçları ve ihlal vakalarındaki düşüş ölçülür.",
    relatedLaws: ["6698", "6331"],
    dailyTips: [
      "ADDIE'de 'Analiz' aşamasını atlayıp doğrudan içerik hazırlamak, çalışanların gerçek ihtiyacına dokunmayan eğitimlere yol açar.",
    ],
    keywords: ["addie", "eğitim tasarımı", "öğretim tasarımı", "müfredat", "lms"],
    sortOrder: 18,
  },
  {
    slug: "raci-matrisi",
    type: "method",
    title: "RACI Matrisi",
    subtitle: "İK Metodu • Rol ve Sorumluluk Netleştirme Matrisi",
    summary:
      "Süreç ve projelerde kimin işi yapacağını (Responsible), kimin nihai onay ve hesap verebilirliğe sahip olduğunu (Accountable), kime danışılacağını (Consulted) ve kimin bilgilendirileceğini (Informed) netleştiren sorumluluk matrisidir.",
    stepsOrComponents: [
      {
        title: "R - Responsible (Sorumlu / İşi Yapan)",
        description: "Görevi fiilen yerine getiren kişi veya ekiptir.",
      },
      {
        title: "A - Accountable (Hesap Veren / Nihai Onay)",
        description:
          "İşin sonucundan nihai olarak sorumlu olan tek kişidir (Her satırda mutlaka 1 adet A olmalıdır).",
      },
      {
        title: "C - Consulted (Danışılan)",
        description:
          "Karar öncesi uzman görüşü alınan iki yönlü iletişim kurulan taraftır (Örn: Hukuk, İSG).",
      },
      {
        title: "I - Informed (Bilgilendirilen)",
        description:
          "Karar veya süreç tamamlandığında tek yönlü bilgilendirilen paydaştır.",
      },
    ],
    practicalExample:
      "Örnek (İşe Alım RACI): İlan & İlk Tarama (İK: R, Birim Müdürü: C, İK Müdürü: A, Finans: I) | Teklif Onayı (İK: R, Genel Müdür/Bütçe Sahibi: A, Birim Müdürü: C, Bordro: I) | SGK İşe Giriş (Özlük Uzmanı: R, İK Müdürü: A, Aday & Yönetici: I).",
    relatedLaws: ["5510", "4857"],
    dailyTips: [
      "RACI matrisinde bir görev satırında birden fazla 'A' (Accountable) varsa karar tıkanıklığı ve sorumluluk karmaşası doğar.",
      "Özellikle işten çıkış ve bordro süreçlerinde RACI çizmek yasal sürelerin (SGK 10 gün, İcra 7 gün) kaçırılmasını önler.",
    ],
    keywords: ["raci", "sorumluluk", "matris", "yetki", "onay", "süreç yönetimi"],
    sortOrder: 19,
  },
  {
    slug: "disc-kisilik-envanteri",
    type: "method",
    title: "DISC Kişilik Envanteri",
    subtitle: "İK Metodu • Davranışsal Stil ve İletişim Analizi",
    summary:
      "İnsanların iş ortamındaki gözlemlenebilir davranış eğilimlerini 4 ana eksende analiz eden pratik araçtır: Dominance (Dominant/Sonuç Odaklı), Influence (Etkileyici/Sosyal), Steadiness (Sabırlı/Uyumlu), Conscientiousness (Uyumlu/Analitik).",
    stepsOrComponents: [
      {
        title: "D - Dominance (Kırmızı - Sonuç & Hız)",
        description:
          "Kararlı, rekabetçi, doğrudan iletişim kuran ve sonuca hızla gitmek isteyen profildir.",
      },
      {
        title: "I - Influence (Sarı - İletişim & İkna)",
        description:
          "Enerjik, sosyal, ikna gücü yüksek, ekip motivasyonunu yükselten profildir.",
      },
      {
        title: "S - Steadiness (Yeşil - İstikrar & Destek)",
        description:
          "Sabırlı, güvenilir, iyi dinleyici, takım içi uyumu ve istikrarı koruyan profildir.",
      },
      {
        title: "C - Conscientiousness (Mavi - Analiz & Kalite)",
        description:
          "Detaycı, kuralcı, veri odaklı, kalite ve doğruluk standartlarına önem veren profildir.",
      },
    ],
    practicalExample:
      "Örnek: Bordro ve Özlük Uzmanı pozisyonunda yüksek 'C' (detay ve mevzuat doğruluğu) ve 'S' (süreklilik) özellikleri güçlü destek sağlarken; İş Geliştirme rolünde 'D' ve 'I' özellikleri öne çıkar. Ancak DISC tek başına eleme aracı değil, ekip içi iletişim ve yönetici koçluğu aracı olarak kullanılmalıdır.",
    relatedLaws: ["4857", "6698"],
    dailyTips: [
      "DISC 'iyi' veya 'kötü' kişilik belirlemez; iletişim dilini karşı tarafın stiline göre uyarlamayı öğretir.",
      "Kişilik envanteri sonuçları kişisel veri olduğundan KVKK kapsamında yalnızca yetkili İK ve adayın kendisiyle paylaşılmalıdır.",
    ],
    keywords: ["disc", "kişilik envanteri", "davranış", "iletişim stili", "kırmızı mavi"],
    sortOrder: 20,
  },
  {
    slug: "mbti-myers-briggs",
    type: "method",
    title: "MBTI (Myers-Briggs Tip Göstergesi)",
    subtitle: "İK Metodu • 16 Bilişsel Tercih ve Takım Dinamiği",
    summary:
      "Carl Jung'un psikolojik tipler teorisine dayanan; bireylerin enerji odağı (E/I), bilgi alma (S/N), karar verme (T/F) ve dış dünyaya yaklaşım (J/P) tercihlerinden 16 farklı kişilik tipini (örn. ENTJ, ISFJ) çıkaran gelişim envanteridir.",
    stepsOrComponents: [
      {
        title: "E / I (Dışadönük - İçedönük)",
        description: "Enerjiyi dış etkileşimden mi yoksa içsel düşünceden mi aldığı.",
      },
      {
        title: "S / N (Duyusal - Sezgisel)",
        description: "Somut gerçeklere ve deneyime mi yoksa büyük resme ve olasılıklara mı odaklandığı.",
      },
      {
        title: "T / F (Düşünen - Hisseden)",
        description: "Kararları nesnel mantıkla mı yoksa değerler ve insan etkisiyle mi aldığı.",
      },
      {
        title: "J / P (Yargılayan - Algılayan)",
        description: "Planlı ve yapılandırılmış düzeni mi yoksa esnek ve spontane akışı mı tercih ettiği.",
      },
    ],
    practicalExample:
      "Örnek: Bir ürün geliştirme ekibinde liderlik atölyesi yapılır. Ekibin çoğunun 'N' (büyük resim) ve 'P' (esnek) olduğu, bu yüzden teslim tarihlerinde sıkıştığı görülür. Ekip içine 'S' ve 'J' tercihli bir proje koordinasyon yaklaşımı entegre edilerek hem yaratıcılık hem zamanında teslim dengelenir.",
    relatedLaws: ["6698", "4857"],
    dailyTips: [
      "MBTI uluslararası standartlarda işe alım eleme testi olarak değil, takım geliştirme, liderlik ve kariyer koçluğu aracı olarak kullanılmalıdır.",
    ],
    keywords: ["mbti", "myers briggs", "16 kişilik", "takım dinamiği", "jung"],
    sortOrder: 21,
  },
  {
    slug: "gallup-cliftonstrengths",
    type: "method",
    title: "Gallup CliftonStrengths (Güçlü Yönler Analizi)",
    subtitle: "İK Metodu • Pozitif Psikoloji & Doğal Yetenek Odaklı Gelişim",
    summary:
      "Zayıf yönleri ortalama hale getirmeye çalışmak yerine, çalışanın doğal olarak en güçlü olduğu ilk 5 (veya 34) yetenek temasını 4 alanda (Uygulama, Etkileme, İlişki Kurma, Stratejik Düşünme) keşfedip güce dönüştüren yaklaşımdır.",
    stepsOrComponents: [
      {
        title: "1. Uygulama (Executing) Alanı",
        description: "Fikirleri gerçeğe dönüştüren temalar (Başarı, Sorumluluk, Odaklanma, Disiplin).",
      },
      {
        title: "2. Etkileme (Influencing) Alanı",
        description: "Fikirlerin duyulmasını ve ekibin harekete geçmesini sağlayan temalar (İletişim, İnisiyatif, Komuta).",
      },
      {
        title: "3. İlişki Kurma (Relationship Building) Alanı",
        description: "Ekibi bir arada tutan bağlayıcı güç (Empati, Uyum, Geliştirici, Bireyselleştirme).",
      },
      {
        title: "4. Stratejik Düşünme (Strategic Thinking) Alanı",
        description: "Bilgiyi analiz eden ve geleceği öngören temalar (Analitik, Öğrenen, Stratejik, Fikir Üretme).",
      },
    ],
    practicalExample:
      "Örnek: Bir ekip yöneticisi ekip içi görev dağılımında CliftonStrengths haritasını çıkarır. 'Empati' ve 'Geliştirici' temaları güçlü olan kıdemli uzmanı yeni işe başlayanların Buddy/Mentoru yaparken; 'Analitik' ve 'Odaklanma' temalı uzmanı süreç otomasyon projesine lider atar.",
    relatedLaws: ["4857"],
    dailyTips: [
      "Gallup araştırmalarına göre güçlü yönlerini her gün kullanma fırsatı bulan çalışanların iş bağlılığı 6 kat daha yüksektir.",
    ],
    keywords: ["gallup", "cliftonstrengths", "güçlü yönler", "yetenek teması", "bağlılık"],
    sortOrder: 22,
  },
  {
    slug: "kirkpatrick-egitim-degerlendirme",
    type: "method",
    title: "Kirkpatrick Eğitim Değerlendirme Modeli",
    subtitle: "İK Metodu • 4 Seviyeli Eğitim Etki ve ROI Ölçümü",
    summary:
      "Eğitim ve gelişim programlarının etkinliğini sadece katılımcı beğenisiyle değil, öğrenme, davranış değişikliği ve iş sonuçlarına katkısıyla 4 kademede ölçen altın standart modeldir.",
    stepsOrComponents: [
      {
        title: "Seviye 1: Tepki (Reaction)",
        description:
          "Katılımcılar eğitimi, eğitmeni ve materyali ne kadar beğendi ve işiyle ilgili buldu? (Memnuniyet anketi).",
      },
      {
        title: "Seviye 2: Öğrenme (Learning)",
        description:
          "Katılımcılar hedeflenen bilgi, beceri veya tutumu gerçekten kazandı mı? (Ön test / Son test, uygulama sınavı).",
      },
      {
        title: "Seviye 3: Davranış (Behavior)",
        description:
          "Öğrenilenler 1-3 ay içinde gerçek iş ortamına transfer edildi mi? (Yönetici gözlemi, çağrı/iş kalitesi kontrolü).",
      },
      {
        title: "Seviye 4: Sonuçlar (Results)",
        description:
          "Eğitim kurumun hedeflerine (satış artışı, iş kazası azalışı, hata düşüşü, turnover azalması) somut katkı sağladı mı?",
      },
    ],
    practicalExample:
      "Örnek (İSG Eğitimi): (1) Katılımcılar eğitimi 4.7/5 puanladı. (2) Eğitim sonu testinde ortalama 88 puan alındı. (3) 1 ay sonraki saha denetiminde KKD (kişisel koruyucu donanım) kullanım oranı %72'den %96'ya çıktı. (4) 6 ay sonunda ramak kala ve iş kazası sayısı %45 azaldı.",
    relatedLaws: ["6331"],
    dailyTips: [
      "Çoğu kurum eğitim değerlendirmesini Seviye 1 (anket) aşamasında bırakır; iş değerini kanıtlamak için kritik eğitimlerde mutlaka Seviye 3 ve 4 ölçülmelidir.",
    ],
    keywords: ["kirkpatrick", "eğitim değerlendirme", "roi", "tepki", "öğrenme", "davranış", "sonuç"],
    sortOrder: 23,
  },
  {
    slug: "hay-group-ucret-ve-is-degerleme",
    type: "method",
    title: "Hay Group Ücret ve İş Değerleme Metodu",
    subtitle: "İK Metodu • Know-How, Problem Çözme & Sorumluluk Puanlaması",
    summary:
      "Korn Ferry Hay Group tarafından geliştirilen; kişiyi değil doğrudan 'pozisyonun kendisini' 3 evrensel faktör üzerinden puanlayarak objektif kademe yapısı ve adil ücret skalası kuran iş değerleme metodudur.",
    stepsOrComponents: [
      {
        title: "1. Bilgi ve Beceri (Know-How)",
        description:
          "Pozisyonun gerektirdiği teknik uzmanlık derinliği, yönetim kapsamı ve insan ilişkileri/iletişim becerisi.",
      },
      {
        title: "2. Problem Çözme (Problem Solving)",
        description:
          "Pozisyonun karşılaştığı problemlerin karmaşıklığı ve düşünme özgürlüğü çerçevesi (Know-How'ın yüzdesi olarak ölçülür).",
      },
      {
        title: "3. Sorumluluk (Accountability)",
        description:
          "Pozisyonun hareket serbestliği, etki alanı (finansal/operasyonel büyüklük) ve sonuca etkisi.",
      },
      {
        title: "4. Hay Puanı, Grade ve Ücret Politikası",
        description:
          "Toplam Hay puanı kademelere (Grade) dönüştürülür; aynı kademedeki farklı unvanlar için eşit işe eşit ücret temeli kurulur.",
      },
    ],
    practicalExample:
      "Örnek: Şirkette 'Kıdemli Muhasebe Uzmanı' ile 'Kıdemli İK Uzmanı' rollerinin ücret adaleti tartışılmaktadır. Hay metoduyla iki iş tanımı puanlanır: Her ikisi de benzer teknik uzmanlık (Know-How), prosedür içi problem çözme ve bütçe etki alanına sahip olduğu için Grade 11 (ör. 310 Hay puanı) seviyesinde eşitlenir ve aynı ücret bandına yerleştirilir.",
    relatedLaws: ["4857"],
    dailyTips: [
      "İş değerlemede altın kural: Masada oturan kişinin diplomasını veya performansını değil, pozisyonun görev tanımını puanlayın.",
      "Hay metoduyla kurulan kademe yapısı 4857 m.5 'eşit işe eşit ücret' ilkesinin en güçlü kurumsal güvencesidir.",
    ],
    keywords: ["hay group", "iş değerleme", "know-how", "problem çözme", "sorumluluk", "grade", "kademe"],
    sortOrder: 24,
  },
];
