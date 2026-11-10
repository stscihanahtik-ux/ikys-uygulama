"use client";

import React, { useMemo, useState } from "react";
import { Calculator, Bot, Scale, Info, PiggyBank, Clock, Umbrella, Wallet, Timer, FileSpreadsheet, FileDown } from "lucide-react";
import {
  hesaplaKidem,
  hesaplaIhbar,
  hesaplaYillikIzin,
  hesaplaBrutNet,
  hesaplaFazlaMesai,
  hesaplaIssizlik,
  fmtTL,
  DEFAULT_PARAMS,
  type ProductParams,
} from "@/lib/calculators";
import { downloadDocumentSafe, type DocModel } from "@/lib/documents";
import { DeadlineCalculator } from "./DeadlineCalculator";

interface CalculatorsViewProps {
  onAskRobot: (prompt: string) => void;
  params?: ProductParams;
}

function Card({ title, icon, lawRef, children }: { title: string; icon: React.ReactNode; lawRef: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          {icon}
          {title}
        </h3>
        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
          <Scale className="h-3 w-3" />
          {lawRef}
        </span>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function NumInput({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</span>
      <span className="relative block">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{suffix}</span>}
      </span>
    </label>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm">{children}</div>;
}

export function CalculatorsView({ onAskRobot, params = DEFAULT_PARAMS }: CalculatorsViewProps) {
  // Kıdem
  const [kBas, setKBas] = useState("2022-01-03");
  const [kBit, setKBit] = useState(new Date().toISOString().slice(0, 10));
  const [kUcret, setKUcret] = useState("60000");
  const kidem = useMemo(() => hesaplaKidem(kBas, kBit, Number(kUcret) || 0, params), [kBas, kBit, kUcret, params]);

  // İhbar
  const [iYil, setIYil] = useState("2");
  const [iUcret, setIUcret] = useState("60000");
  const ihbar = useMemo(() => hesaplaIhbar(Number(iYil) || 0, Number(iUcret) || 0), [iYil, iUcret]);

  // İzin
  const [izYil, setIzYil] = useState("6");
  const [izYas, setIzYas] = useState("35");
  const izin = useMemo(() => hesaplaYillikIzin(Number(izYil) || 0, Number(izYas) || 0), [izYil, izYas]);

  // Brüt-Net
  const [bBrut, setBBrut] = useState("85000");
  const [bKumulatif, setBKumulatif] = useState("0");
  const brutNet = useMemo(() => hesaplaBrutNet(Number(bBrut) || 0, Number(bKumulatif) || 0, params), [bBrut, bKumulatif, params]);

  // Fazla mesai
  const [fUcret, setFUcret] = useState("60000");
  const [fSaat, setFSaat] = useState("12");
  const mesai = useMemo(() => hesaplaFazlaMesai(Number(fUcret) || 0, Number(fSaat) || 0, "fazla-calisma"), [fUcret, fSaat]);

  // İşsizlik
  const [sGun, setSGun] = useState("1080");
  const [sOrtalama, setSOrtalama] = useState("55000");
  const [sIstifa, setSIstifa] = useState(false);
  const issizlik = useMemo(
    () => hesaplaIssizlik(Number(sGun) || 0, Number(sOrtalama) || 0, sIstifa, params),
    [sGun, sOrtalama, sIstifa, params]
  );

  const exportSummary = (format: "docx" | "xlsx" | "pdf") => {
    const rows: (string | number)[][] = [
      [
        "Kıdem tazminatı",
        `Brüt ${fmtTL(Number(kUcret) || 0)} • ${kBas} – ${kBit}`,
        kidem ? `Net ${fmtTL(kidem.kidemNet)} (brüt ${fmtTL(kidem.kidemBrut)})` : "Hesaplanamadı",
        "4857 s.K. m.14 / 1475 s.K. m.14",
      ],
      [
        "İhbar süresi ve tazminatı",
        `${iYil} yıl • brüt ${fmtTL(Number(iUcret) || 0)}`,
        `${ihbar.hafta} hafta • brüt ${fmtTL(ihbar.brutTazminat)}`,
        "4857 s.K. m.17",
      ],
      ["Yıllık ücretli izin", `${izYil} yıl • ${izYas} yaş`, `${izin.gun} iş günü`, "4857 s.K. m.53"],
      ["Fazla mesai", `${fSaat} saat • brüt ${fmtTL(Number(fUcret) || 0)}`, fmtTL(mesai.toplam), "4857 s.K. m.41"],
      [
        "İşsizlik ödeneği",
        `${sGun} gün prim • son 4 ay ort. ${fmtTL(Number(sOrtalama) || 0)}`,
        issizlik.hakEdiyor ? `${issizlik.sureGun} gün • ${fmtTL(issizlik.aylikTahmini)}/ay` : "Hak kazanılamıyor",
        "4447 s.K. m.50-51",
      ],
    ];
    if (brutNet) {
      rows.push(["Brüt → net maaş", fmtTL(brutNet.brut), `Net ${fmtTL(brutNet.net)} • İşveren maliyeti ${fmtTL(brutNet.isverenMaliyet)}`, "5510 s.K. • 193 s.K."]);
    }
    const model: DocModel = {
      title: "İK Hesap Özeti",
      subtitle: `Parametreler: kıdem tavanı ${fmtTL(params.kidemTavani)} • asgari ücret ${fmtTL(params.asgariUcretBrut)} • ${params.updatedNote}`,
      fileName: "ik-hesap-ozeti",
      blocks: [
        { type: "table", sheetName: "Hesap Özeti", headers: ["Hesap", "Girdi", "Sonuç", "Dayanak"], rows },
        { type: "p", italic: true, text: "Bilgilendirme amaçlıdır; resmî ve bağlayıcı hesaplar için İK/hukuk onayı gerekir." },
      ],
    };
    void downloadDocumentSafe(format, model);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-900 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Calculator className="h-4 w-4" /> İK Hesaplayıcıları
        </div>
        <h2 className="mt-2 font-serif text-2xl font-semibold">Kıdem, İhbar, İzin, Maaş ve Yasal Süreler</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-300">
          Türk iş mevzuatına göre saniyeler içinde tahmini hesap yapın. Güncel kıdem tavanı: <b>{fmtTL(params.kidemTavani)}</b> • Brüt asgari ücret:{" "}
          <b>{fmtTL(params.asgariUcretBrut)}</b>. Sonuçlar bilgilendirme amaçlıdır; kesin bordro için Resmî Gazete&apos;den teyit edin.
        </p>
        <p className="mt-1 text-[11px] text-indigo-200">{params.updatedNote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAskRobot("Kıdem tazminatı hesaplamak istiyorum, bana adım adım yardımcı ol")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-indigo-100"
          >
            <Bot className="h-4 w-4" /> Robotla Hesapla
          </button>
          <button
            type="button"
            onClick={() => exportSummary("xlsx")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-400"
          >
            <FileSpreadsheet className="h-4 w-4" /> Özeti Excel&apos;e indir
          </button>
          <button
            type="button"
            onClick={() => exportSummary("docx")}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
          >
            Özeti Word&apos;e indir
          </button>
          <button
            type="button"
            onClick={() => exportSummary("pdf")}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            <FileDown className="h-4 w-4" /> Özeti PDF indir
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Kıdem Tazminatı" icon={<PiggyBank className="h-4 w-4 text-indigo-600" />} lawRef="1475 s.K. m.14">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-slate-600">İşe Giriş</span>
              <input
                type="date"
                value={kBas}
                onChange={(e) => setKBas(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-slate-600">İşten Ayrılış</span>
              <input
                type="date"
                value={kBit}
                onChange={(e) => setKBit(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-3">
            <NumInput label="Son Giydirilmiş Brüt Ücret (yol+yemek dahil)" value={kUcret} onChange={setKUcret} suffix="₺" />
          </div>
          {kidem ? (
            <ResultBox>
              <p className="text-xs text-emerald-800">
                Toplam süre: <b>{kidem.toplamGun} gün</b>{" "}
                {kidem.tavanUygulandi && <span className="font-semibold text-amber-700">(Tavan uygulandı: {fmtTL(kidem.esasUcret)})</span>}
              </p>
              <p className="mt-2 text-xs text-emerald-900">
                Brüt kıdem: <b>{fmtTL(kidem.kidemBrut)}</b> • Damga: -{fmtTL(kidem.damgaVergisi)}
              </p>
              <p className="mt-1 text-lg font-extrabold text-emerald-950">Net Kıdem: {fmtTL(kidem.kidemNet)}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-emerald-800">{kidem.aciklama}</p>
            </ResultBox>
          ) : (
            <p className="mt-3 flex items-center gap-1 text-xs text-rose-600">
              <Info className="h-3.5 w-3.5" /> Geçerli tarih ve ücret girin (çıkış, girişten sonra olmalı).
            </p>
          )}
        </Card>

        <Card title="İhbar Süresi & Tazminatı" icon={<Clock className="h-4 w-4 text-indigo-600" />} lawRef="4857 s.K. m.17">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Kıdem (Yıl)" value={iYil} onChange={setIYil} suffix="yıl" />
            <NumInput label="Brüt Ücret" value={iUcret} onChange={setIUcret} suffix="₺" />
          </div>
          <ResultBox>
            <p className="text-xs text-emerald-900">
              İhbar süresi: <b>{ihbar.hafta} hafta ({ihbar.gun} gün)</b>
            </p>
            <p className="mt-1 text-xs text-emerald-900">
              Brüt tazminat: <b>{fmtTL(ihbar.brutTazminat)}</b> • Tahmini net: <b>{fmtTL(ihbar.netTazminat)}</b>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-emerald-800">{ihbar.aciklama}</p>
          </ResultBox>
        </Card>

        <Card title="Yıllık Ücretli İzin" icon={<Umbrella className="h-4 w-4 text-indigo-600" />} lawRef="4857 s.K. m.53">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Kıdem (Yıl)" value={izYil} onChange={setIzYil} suffix="yıl" />
            <NumInput label="Çalışan Yaşı" value={izYas} onChange={setIzYas} suffix="yaş" />
          </div>
          <ResultBox>
            <p className="text-lg font-extrabold text-emerald-950">Yıllık izin: {izin.gun} iş günü</p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">{izin.aciklama}</p>
          </ResultBox>
        </Card>

        <Card title="Brüt → Net Maaş" icon={<Wallet className="h-4 w-4 text-indigo-600" />} lawRef="5510 • 193 GVK">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Aylık Brüt Ücret" value={bBrut} onChange={setBBrut} suffix="₺" />
            <NumInput label="Yıl İçi Kümülatif GV Matrahı" value={bKumulatif} onChange={setBKumulatif} suffix="₺" />
          </div>
          {brutNet && (
            <ResultBox>
              <div className="space-y-1 text-xs text-emerald-900">
                <p>
                  SGK işçi payı: -{fmtTL(brutNet.sgkIsci)} • İşsizlik işçi payı: -{fmtTL(brutNet.issizlikIsci)}
                </p>
                <p>
                  Gelir vergisi (asgari istisna {fmtTL(brutNet.asgariIstisna)}): -{fmtTL(brutNet.gelirVergisi)} • Damga: -{fmtTL(brutNet.damga)}
                </p>
                <p className="pt-1 text-lg font-extrabold text-emerald-950">Net Maaş: {fmtTL(brutNet.net)}</p>
                <p>İşverene maliyet: ~{fmtTL(brutNet.isverenMaliyet)}</p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-emerald-800">{brutNet.aciklama}</p>
            </ResultBox>
          )}
        </Card>

        <Card title="Fazla Mesai Ücreti" icon={<Timer className="h-4 w-4 text-indigo-600" />} lawRef="4857 s.K. m.41">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Aylık Brüt Ücret" value={fUcret} onChange={setFUcret} suffix="₺" />
            <NumInput label="Fazla Mesai (Saat)" value={fSaat} onChange={setFSaat} suffix="saat" />
          </div>
          <ResultBox>
            <p className="text-xs text-emerald-900">
              Saat ücreti: {fmtTL(mesai.saatUcreti)} • %50 zamlı: {fmtTL(mesai.zamliSaat)}
            </p>
            <p className="mt-1 text-lg font-extrabold text-emerald-950">Toplam: {fmtTL(mesai.toplam)}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">{mesai.aciklama}</p>
          </ResultBox>
        </Card>

        <Card title="İşsizlik Maaşı Kontrolü" icon={<Umbrella className="h-4 w-4 text-indigo-600" />} lawRef="4447 s.K. m.50-51">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Son 3 Yıl Prim Günü" value={sGun} onChange={setSGun} suffix="gün" />
            <NumInput label="Son 4 Ay Ort. Brüt" value={sOrtalama} onChange={setSOrtalama} suffix="₺" />
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={sIstifa}
              onChange={(e) => setSIstifa(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Kendi isteğimle (istifa) ayrıldım
          </label>
          <ResultBox>
            <p className="text-sm font-bold text-emerald-950">
              {issizlik.hakEdiyor
                ? `✅ Hak kazanılıyor — ${issizlik.sureGun} gün, tahmini ${fmtTL(issizlik.aylikTahmini)}/ay`
                : "❌ Bu şartlarla hak kazanılamıyor"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">{issizlik.aciklama}</p>
          </ResultBox>
        </Card>
      </div>

      <DeadlineCalculator />

      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        ⚠️ Bu hesaplayıcılar Cihan Ahtik İK Akademisi tarafından bilgilendirme amaçlı sunulur; bağlayıcı bordro/tazminat hesabı değildir. Güncel değerler
        Yönetici Paneli &gt; Güncel Parametreler bölümünden yönetilir ve Resmî Gazete ile kontrol edilmelidir.
      </p>
    </div>
  );
}
