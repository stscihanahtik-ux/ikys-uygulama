"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function PwaManager() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (standalone) { setInstalled(true); return; }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios && !dismissed) { setIsIOS(true); setVisible(true); }

    const onInstalled = () => { setInstalled(true); setVisible(false); };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !visible) return null;

  const dismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md rounded-3xl border border-indigo-200 bg-white p-4 shadow-2xl lg:bottom-6" role="dialog" aria-label="Uygulamayı yükle">
      <button type="button" onClick={dismiss} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Kapat"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="İK Akademisi ikonu" className="h-12 w-12 rounded-2xl shadow" />
        <div className="min-w-0 pr-4">
          <p className="text-sm font-bold text-slate-900">İK Akademisi'ni Telefona Yükle</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">Ana ekrana ekleyin; uygulama gibi tam ekran, hızlı ve çevrimdışı kabukla açılır. Google Play sürümüyle aynı içerik!</p>
        </div>
      </div>
      {isIOS ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"><Share className="h-4 w-4 shrink-0 text-indigo-600" /> Safari'de Paylaş → "Ana Ekrana Ekle" seçeneğini kullanın.</p>
      ) : (
        <button type="button" onClick={install} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"><Download className="h-4 w-4" /> Şimdi Yükle</button>
      )}
      <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Smartphone className="h-3 w-3" /> Bu uygulama Cihan Ahtik tarafından yapılmıştır.</p>
    </div>
  );
}
