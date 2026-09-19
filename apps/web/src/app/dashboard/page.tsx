'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Layers, 
  Calculator, 
  Settings, 
  User, 
  ChevronDown,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// شہر کے لحاظ سے مرلہ کے رقبے کا معیار (Sq Ft)
const MARLA_STANDARDS = {
  islamabad: { name: 'اسلام آباد (CDA)', sqft: 272.25 },
  lahore: { name: 'لاہور (LDA)', sqft: 250 },
  karachi: { name: 'کراچی / سندھ', sqft: 225 },
} as const;

type CityKey = keyof typeof MARLA_STANDARDS;

// پاکستانی معیاری پلاٹ سائز (لمبائی x چوڑائی)
const PLOT_PRESETS: Record<number, { length: number; width: number; label: string }> = {
  5: { length: 45, width: 25, label: '5 Marla' },
  10: { length: 65, width: 35, label: '10 Marla' },
  20: { length: 90, width: 50, label: '1 Kanal' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [city, setCity] = useState<CityKey>('islamabad');
  const [selectedMarla, setSelectedMarla] = useState<number>(5);
  const [length, setLength] = useState<number>(45);
  const [width, setWidth] = useState<number>(25);
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'calculator' | 'settings'>('home');
  const [showCalculateSuccess, setShowCalculateSuccess] = useState<boolean>(false);

  // ڈسپلے نام (لاگ ان صارف یا ڈیفالٹ)
  const userName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'احمد خان');

  // کل رقبہ (Sq Ft)
  const plotArea = useMemo(() => {
    return Math.max(0, (length || 0) * (width || 0));
  }, [length, width]);

  // مرلہ کا حساب
  const marlaSize = MARLA_STANDARDS[city].sqft;
  const calculatedMarla = useMemo(() => {
    return plotArea > 0 ? (plotArea / marlaSize).toFixed(1) : '0';
  }, [plotArea, marlaSize]);

  // تخمینہ شدہ کورڈ ایریا (ڈبل اسٹوری مکان کا اوسط ~1.4 گنا)
  const coveredArea = useMemo(() => {
    return Math.round(plotArea * 1.4);
  }, [plotArea]);

  // پاکستانی کنسٹرکشن معیارات کے مطابق مٹیریل کھپت (Material Consumption)
  const materials = useMemo(() => {
    return {
      bricks: Math.round(coveredArea * 27),        // ~27 اینٹیں فی مربع فٹ کورڈ ایریا
      steelKg: Math.round(coveredArea * 3.4),       // ~3.4 کلو سریا (Grade 60)
      sandCft: Math.round(coveredArea * 0.72),      // ~0.72 مکعب فٹ چناب/راوی ریت
      crushCft: Math.round(coveredArea * 0.60),     // ~0.60 مکعب فٹ مارگلہ/سرگودھا بجری
      cementBags: Math.round(coveredArea * 0.52),   // ~0.52 بیگز سیمنٹ
    };
  }, [coveredArea]);

  // تخمینہ شدہ لاگت اور بریک ڈاؤن (PKR)
  const costBreakdown = useMemo(() => {
    // موجودہ پاکستانی مارکیٹ ریٹ: ~4,500 PKR فی مربع فٹ (گرے اسٹرکچر + معیاری فنشنگ)
    const ratePerSqFt = 4500;
    const totalCost = coveredArea * ratePerSqFt;

    return {
      totalCost,
      totalInMillion: (totalCost / 1000000).toFixed(2),
      bricksPercent: 38,
      steelPercent: 28,
      cementPercent: 18,
      laborPercent: 16,
    };
  }, [coveredArea]);

  // تعمیراتی وقت کا تخمینہ
  const timelineDays = useMemo(() => {
    if (plotArea <= 1250) return { days: 180, text: '4 / 6 months', progress: 65 };
    if (plotArea <= 2500) return { days: 270, text: '5 / 9 months', progress: 55 };
    return { days: 365, text: '6 / 12 months', progress: 50 };
  }, [plotArea]);

  // پلاٹ سائز تبدیل کرنے کا ہینڈلر
  const handleMarlaSelect = (marla: number) => {
    setSelectedMarla(marla);
    if (PLOT_PRESETS[marla]) {
      setLength(PLOT_PRESETS[marla].length);
      setWidth(PLOT_PRESETS[marla].width);
    }
  };

  const handleCalculateNow = () => {
    setShowCalculateSuccess(true);
    setTimeout(() => setShowCalculateSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-12 transition-colors">
      {/* موبائل و ویب کے لیے ریسپانسیو فریم کنٹینر */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* ہیڈر (Header) */}
        <header className="flex items-center justify-between pb-1">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">خوش آمدید،</p>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{userName}</h1>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-slate-300">Dashboard</span>
          </div>
          <Link 
            href="/profile"
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:ring-2 hover:ring-teal-500 transition"
          >
            <User className="w-5 h-5" />
          </Link>
        </header>

        {/* شہر اور کرنسی کا انتخاب */}
        <div className="flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 shadow-xs">
            <span className="text-slate-400">شہر:</span>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value as CityKey)}
              className="bg-transparent font-medium text-xs focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100"
            >
              <option value="islamabad" className="dark:bg-slate-900">{MARLA_STANDARDS.islamabad.name} (272.25 sq ft)</option>
              <option value="lahore" className="dark:bg-slate-900">{MARLA_STANDARDS.lahore.name} (250 sq ft)</option>
              <option value="karachi" className="dark:bg-slate-900">{MARLA_STANDARDS.karachi.name} (225 sq ft)</option>
            </select>
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-xs text-xs">
            PKR <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>

        {/* پلاٹ کیلکولیٹر کارڈ */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Estimate Your Build Cost</h2>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              Live Rates
            </span>
          </div>

          {/* لمبائی اور چوڑائی کے خانے */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Length (لمبائی)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  min="1"
                  value={length || ''}
                  onChange={(e) => setLength(Math.max(0, Number(e.target.value)))}
                  className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-slate-800 dark:focus:border-teal-500 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Width (چوڑائی)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  min="1"
                  value={width || ''}
                  onChange={(e) => setWidth(Math.max(0, Number(e.target.value)))}
                  className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-slate-800 dark:focus:border-teal-500 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
          </div>

          {/* پری سیٹ سائز بٹنز (5 مرلہ، 10 مرلہ، 1 کنال) */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Standard Plot Presets</span>
            <div className="flex gap-2">
              {[
                { label: '5 Marla (25×45)', value: 5 },
                { label: '10 Marla (35×65)', value: 10 },
                { label: '1 Kanal (50×90)', value: 20 }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleMarlaSelect(item.value)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedMarla === item.value 
                      ? 'bg-[#1E293B] dark:bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* کل رقبہ اور مرلہ سمری */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Plot Area:</span>
              <span className="text-slate-800 dark:text-slate-100 font-bold">{plotArea.toLocaleString()} sq ft</span>
            </div>
            <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/50">
              {calculatedMarla} Marla
            </span>
          </div>

          {/* Calculate Now بٹن */}
          <button 
            type="button"
            onClick={handleCalculateNow}
            className="w-full py-2.5 bg-[#1E293B] dark:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 dark:hover:bg-teal-500 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
          >
            {showCalculateSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 dark:text-white animate-bounce" />
                <span>Updated Successfully!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-teal-400 dark:text-white" />
                <span>Calculate Now</span>
              </>
            )}
          </button>
        </section>

        {/* مٹیریل کنزمپشن اور کاسٹ بریک ڈاؤن */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Material Consumption (خودکار حساب) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex justify-between items-center">
              <span>Materials</span>
              <span className="text-[9px] text-slate-400 font-normal">Est.</span>
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Bricks (اینٹیں)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{materials.bricks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Steel (سریا)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{materials.steelKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Sand (ریت)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{materials.sandCft.toLocaleString()} cft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Crush (بجری)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{materials.crushCft.toLocaleString()} cft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Cement (سیمنٹ)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{materials.cementBags.toLocaleString()} bags</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown (خودکار ڈونٹ چارٹ) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Cost Breakdown</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                PKR {costBreakdown.totalCost.toLocaleString()}
              </p>
            </div>

            {/* SVG ڈونٹ چارٹ */}
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" />
                {/* Bricks (38%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#0F766E" strokeWidth="4" strokeDasharray="38 100" strokeDashoffset="0" />
                {/* Steel (28%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#14B8A6" strokeWidth="4" strokeDasharray="28 100" strokeDashoffset="-38" />
                {/* Cement (18%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#2DD4BF" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="-66" />
                {/* Labor (16%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#FBBF24" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-84" />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{costBreakdown.totalInMillion}M</span>
                <span className="text-[8px] text-slate-400">PKR</span>
              </div>
            </div>

            {/* لیجنڈز */}
            <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0"></span>Bricks ({costBreakdown.bricksPercent}%)</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0"></span>Steel ({costBreakdown.steelPercent}%)</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0"></span>Cement ({costBreakdown.cementPercent}%)</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBBF24] shrink-0"></span>Labor ({costBreakdown.laborPercent}%)</div>
            </div>
          </div>
        </div>

        {/* پروجیکٹ ٹائم لائن کارڈ */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" /> Project Timeline
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{timelineDays.text}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Days to Completion: {timelineDays.days} Days</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">On Schedule</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#0F766E] dark:bg-teal-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${timelineDays.progress}%` }}
            ></div>
          </div>
        </section>

        {/* تفصیلی کیلکولیٹرز کے فوری لنکس */}
        <div className="pt-2">
          <Link
            href="/calculator"
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-between shadow-xs transition group"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>تمام تفصیلی سول انجینئرنگ کیلکولیٹرز دیکھیں</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>

      </main>

      {/* باٹم نیویگیشن بار (موبائل و کیپیسیٹر ایپ) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-40 shadow-lg">
        <Link 
          href="/dashboard"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center transition ${activeTab === 'home' ? 'text-[#0F766E] dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link 
          href="/projects"
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center transition ${activeTab === 'projects' ? 'text-[#0F766E] dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Projects</span>
        </Link>
        <Link 
          href="/calculator"
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center transition ${activeTab === 'calculator' ? 'text-[#0F766E] dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Calculator</span>
        </Link>
        <Link 
          href="/settings"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center transition ${activeTab === 'settings' ? 'text-[#0F766E] dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
