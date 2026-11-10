"use client";

import React from "react";
import { X, Rocket, Globe, KeyRound, TerminalSquare, TestTube2, Store, CheckCircle2 } from "lucide-react";

interface PlayStoreGuideProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: <Globe className="h-5 w-5" />,
    title: "1. Uygulamayı Kendi Alan Adınızda Yayınlayın (HTTPS Şart)",
    text: "Bu proje zaten PWA hazır: manifest.webmanifest, uygulama ikonları (192/512), service worker ve çevrimdışı kabuk kurulu. Vercel/Netlify/kendi sunucunuzda HTTPS ile yayınlayın. Örn: https://ikakademisi.com",
  },
  {
    icon: <TerminalSquare className="h-5 w-5" />,
    title: "2. Bubblewrap ile Android Paketini (TWA) Oluşturun",
    text: "Bilgisayarınızda: npm i -g @bubblewrap/cli → bubblewrap init --manifest https://ALANADINIZ/manifest.webmanifest → bubblewrap build. Bu komutlar imzalı .aab (Android App Bundle) dosyanızı üretir. Paket adı önerisi: com.cihanahtik.ikakademi",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "3. Dijital Varlık Bağlantısını (assetlinks.json) Doğrulayın",
    text: "Uygulamadaki /.well-known/assetlinks.json dosyası hazır. Play Console > Uygulama bütünlüğü bölümündeki SHA-256 sertifika parmak izini kopyalayıp dosyadaki 'BURAYA_PLAY_APP_SIGNING_SHA256_EKLEYIN' alanıyla değiştirin. Böylece uygulama adres çubuğu olmadan tam ekran açılır.",
  },
  {
    icon: <Store className="h-5 w-5" />,
    title: "4. Google Play Console Hesabı Açın (Tek Seferlik 25 $)",
    text: "play.google.com/console üzerinden geliştirici hesabı oluşturun. Yeni uygulama: Ad 'İK & Mevzuat Akademisi', dil Türkçe (tr-TR), tür: Uygulama, ücretsiz. Mağaza girişine bu uygulamadaki ikon (512) ve ekran görüntülerini yükleyin.",
  },
  {
    icon: <TestTube2 className="h-5 w-5" />,
    title: "5. Kapalı Test (14 Gün / 12 Test Kullanıcısı)",
    text: "Google'ın güncel kuralı: Yeni kişisel hesaplar üretimden önce en az 12 test kullanıcısıyla 14 gün kapalı test yapmalıdır. .aab dosyanızı 'Kapalı test' kanalına yükleyin, test kullanıcılarının e-postalarını ekleyin ve 14 gün aktif test edin.",
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "6. Üretime Alın ve Güncellemeleri Otomatik Yayınlayın",
    text: "Test sonrası 'Üretim' kanalına aynı .aab'yi yükseltin. En güzel tarafı: İçerik güncellemeleriniz (yeni kanun, yeni soru) webden anında yansır; yalnızca paket değişiminde yeni .aab gerekir. Veri gizliliği formunda: uygulama sunucu sohbet geçmişi saklar; mikrofon yalnızca sesli soruda kullanılır — bunları beyan edin.",
  },
];

export function PlayStoreGuide({ open, onClose }: PlayStoreGuideProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Google Play yayın rehberi">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Rocket className="h-5 w-5 text-emerald-300" /> Google Play Yayın Rehberi</h2>
            <p className="text-xs text-indigo-200">Bu uygulama Play'e yüklenmeye hazır (PWA + TWA). Adımları izleyin:</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Kapat"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 px-6 py-5">
          {STEPS.map((s) => (
            <div key={s.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">{s.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-900"><CheckCircle2 className="h-4 w-4" /> Uygulamada Hazır Olanlar</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-emerald-800">
              <li>manifest.webmanifest (ad, ikonlar, kısayollar, standalone)</li>
              <li>512×512 ve 192×192 uygulama ikonları + maskable ikon</li>
              <li>Service Worker ile çevrimdışı kabuk</li>
              <li>assetlinks.json şablonu (/.well-known/)</li>
              <li>Mobil alt navigasyon + ana ekrana ekleme istemi</li>
            </ul>
            <p className="mt-3 text-[11px] font-medium text-emerald-700">Bu uygulama Cihan Ahtik tarafından yapılmıştır.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
