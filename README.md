# İK & Mevzuat Akademisi — Yönetim ve Geliştirme Rehberi

Bu uygulama **Cihan Ahtik** tarafından yapılmıştır. Next.js (App Router) + PostgreSQL (Drizzle ORM). PWA olarak telefona kurulabilir ve Google Play'e TWA ile paketlenebilir.

## 1. Kurulum

```bash
npm install
# .env: DATABASE_URL, ADMIN_PASSWORD (ve önerilen ADMIN_SECRET)
npx drizzle-kit push --force   # tabloları oluşturur / günceller
npm run build && npm run start # http://localhost:3000 — yönetici paneli: /admin
```

## 2. Ortam değişkenleri ve yönetici girişi

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | Evet | PostgreSQL bağlantı adresi |
| `ADMIN_PASSWORD` | Hayır | Varsayılan yönetici şifresi. Yoksa `S0m1JT0G0hfG4uYP` kullanılır. |
| `ADMIN_SECRET` | Hayır | Artık kullanılmıyor; oturum anahtarı veritabanında tutulur. |
| `OPENAI_API_KEY` | Hayır | Tanımlanırsa İK Robotu yanıtlarını dil modeliyle zenginleştirir. |

**Önemli (yetkisiz erişim hatasının çözümü):** Kullanıcılar, şifreler (scrypt hash) ve oturum imzalama anahtarı artık `users` ve `site_settings` tablolarında tutulur. Platform her derlemede `.env` dosyasını yeniden yazsa bile oturumlar ve şifreler korunur. İlk açılışta `admin` kullanıcısı otomatik oluşturulur.

- Varsayılan yönetici: kullanıcı adı `admin`, şifre `S0m1JT0G0hfG4uYP`.
- Şifreyi **Yönetici Paneli → Şifremi değiştir** veya **Kullanıcılar** bölümünden değiştirin.
- Üyeler `/kayit` adresinden kayıt olur, `/hesabim` adresinden giriş yapıp kendi şifrelerini değiştirebilir.
- Yönetici, Kullanıcılar bölümünden tüm üyeleri görür; şifre sıfırlar, hesapları aktif/pasif yapar, rol değiştirir veya siler.
- Oturum 12 saat geçerlidir. Süre dolarsa panel otomatik olarak giriş ekranına döner ve uyarı gösterir.

Canlıya almadan önce yönetici şifresini değiştirin ve siteyi HTTPS üzerinden yayınlayın.

## 3. Sitedeki bölümler

| Bölüm | İçerik |
|---|---|
| Günlük Bilgi | Her gün yeni bir kanun/teknik/metot bilgisi, duyurular ve sürüm notları |
| Kanunlar | 12 temel kanun, kritik maddeler, örnekler; **PDF, Word (.docx) ve Excel (.xlsx)** indirme |
| İK Teknikleri / Metotlar | Süreç teknikleri ve metotlar, adımlar, ilişkili kanunlar; **Word / Excel / PDF** indirme |
| Sorular | Soru bankası, quiz modu; **Word / Excel / PDF** dışa aktarma |
| Test | **Çoktan seçmeli sınav**: 4 seçenek, yanlış cevapta doğru cevap + kanun maddesi + ayrıntılı açıklama + örnek vaka; skor, yanlışları tekrar sorma, Word/Excel/PDF sonuç |
| İndirme Merkezi | Tüm kanunlar/tek kanun PDF-Word-Excel; **SGK kodları, soru bankası, İK teknikleri/metotları ve günlük bilgiler de PDF olarak**; ayrıca "Tüm İK İçerikleri" tek PDF dosyası |
| SGK Kodları | İşten ayrılış (çıkış) nedeni kodları; kıdem ve işsizlik ödeneği durumu; **Word / Excel / PDF** |
| Hesaplayıcılar | Kıdem, ihbar, izin, brüt→net, fazla mesai, işsizlik; **Yasal Süre & İK Takvimi** (.ics takvim dosyası, Word, Excel, PDF) |
| Şablonlar | Savunma yazısı, tutanak, izin formu, çalışma belgesi, kontrol listeleri — **Word (.docx), Excel (.xlsx) ve PDF** |
| İK Robotu | Sesli ve yazılı soru-cevap; SGK kodu, yasal süre, hesap, belge taslağı ve quiz |

## 4. Yönetici Paneli (`/admin`)

| Bölüm | Ne yapar? |
|---|---|
| Özet | Sayılar ve "nasıl yapılır?" rehberi |
| Kanunlar / İK Teknik & Metot / Soru Bankası | Kayıt ekleme, düzenleme, silme. Değişiklik anında sitede ve robotta geçerli olur. |
| Günlük Bilgiler | Günlük bilgi kayıtlarını elle düzenleme/silme; **her kanun için kendi özeti, ipucu ve örneğinden otomatik günlük bilgi üretme** (teknik/metotlar da eklenebilir) |
| Kullanıcılar | Üyeleri listeleme, yeni kullanıcı oluşturma, şifre sıfırlama, aktif/pasif, rol değiştirme, silme, kendi yönetici şifresini değiştirme |
| Dışa Aktarma | Tüm tabloları Word/Excel/CSV olarak indirme (kullanıcı şifreleri hariç) |
| Site Ayarları | Uygulama adı, imza, alt bilgi, destek e-postası ve üst duyuru şeridi |
| SGK Çıkış Kodları | Kod, çıkış nedeni, kıdem ve işsizlik durumu, yasal dayanak ve uyarılar |
| Çalışan Kayıtları | İşe giriş/çıkış, ücret, deneme süresi, izin, SGK kodu. Otomatik yasal takvim, tahmini tazminat ve Word/Excel dosyaları. **Kişisel veri içerir (KVKK).** |
| Sheets & CSV | Google Sheets bağlantısı veya CSV ile toplu içe/dışa aktarma |
| Güncel Parametreler | Asgari ücret, kıdem tavanı, SGK/işsizlik oranları, gelir vergisi dilimleri |
| Duyurular & Sürümler | Günlük Bilgi ekranında görünen yenilik ve güncelleme kayıtları |
| Özellik Talepleri | Eklenecek özellikleri fikir → planlandı → geliştiriliyor → yayında olarak takip edin |

## 5. Güncelleme akışı

- **İçerik, SGK kodları, parametreler, duyurular:** Yönetici Paneli'nden yapılır; yeniden yayın gerekmez.
- **Arayüz ve kod değişikliği:** Kodu sunucuya gönderin, `npm run build` ile yeniden başlatın. `public/sw.js` içindeki `CACHE` sürümünü artırarak telefon önbelleğini yenileyin.
- **Google Play:** Web değişiklikleri TWA üzerinden uygulamaya otomatik yansır. Yalnızca paket bilgisi (ikon, ad, sürüm kodu) değişirse yeni `.aab` üretin.

## 6. Yeni özellik nasıl eklenir?

1. Özelliği **Özellik Talepleri** bölümüne kaydedin.
2. Bileşeni `src/components/` altında oluşturun (`"use client"`).
3. Tablo gerekiyorsa `src/db/schema.ts` içinde tanımlayın, ardından `npx drizzle-kit push --force` çalıştırın.
4. Sunucu rotasını `src/app/api/<ad>/route.ts` olarak ekleyin. Yönetici işlemleri için `requireAdmin(req)` kullanın.
5. Sekmeyi `src/components/HrWorkspace.tsx` içindeki `navTabs` listesine ve `WorkspaceTab` tipine (`src/types/hr.ts`) ekleyin.
6. Doğrulama: `npx next typegen && npx tsc --noEmit && npm run build`.

## 7. Belge dışa aktarma

Word ve Excel dosyaları `POST /api/export` rotasında oluşturulur (`docx` ve `exceljs` kütüphaneleri). İstemci tarafında `src/lib/documents.ts` içindeki `downloadDocument` kullanılır. Yeni bir belge türü için belge modelini (`DocModel`: başlık, metin, liste ve tablo blokları) oluşturup bu fonksiyona vermeniz yeterlidir.

## 8. Güvenlik ve veri notları

- Yönetici API'leri HttpOnly oturum çerezi ile korunur; oturum 12 saat geçerlidir. IP başına 10 dakikada 10 hatalı denemeden sonra giriş geçici olarak engellenir.
- Çalışan kayıtları kişisel veridir. Yalnızca yönetici panelinde tutulur; aydınlatma tarihini kaydedin ve saklama süresi sonunda silin.
- SGK kodları, yasal süreler ve tutarlar bilgilendirme amaçlıdır. Resmî işlemlerde Resmî Gazete, mevzuat.gov.tr ve SGK kılavuzu esas alınmalıdır.
