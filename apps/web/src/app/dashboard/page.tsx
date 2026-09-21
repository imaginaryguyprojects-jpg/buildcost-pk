'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Layers, 
  Calculator, 
  Settings, 
  User, 
  Camera, 
  ChevronDown,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileDown,
  MapPin,
  Maximize2,
  Boxes,
  PieChart as PieChartIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuthStore } from '@/stores/authStore';

// City definitions and municipal Marla standards
type CityOption = 'islamabad_rawalpindi' | 'lahore' | 'karachi' | 'peshawar' | 'custom';
type AreaUnitMode = 'marla' | 'yards';

interface CityConfig {
  name: string;
  defaultMarlaSqft: number;
  recommendedUnit: AreaUnitMode;
}

const CITY_STANDARDS: Record<CityOption, CityConfig> = {
  islamabad_rawalpindi: { 
    name: 'Rawalpindi / Islamabad', 
    defaultMarlaSqft: 272.25, 
    recommendedUnit: 'marla' 
  },
  lahore: { 
    name: 'Lahore', 
    defaultMarlaSqft: 250, 
    recommendedUnit: 'marla' 
  },
  karachi: { 
    name: 'Karachi', 
    defaultMarlaSqft: 225, 
    recommendedUnit: 'yards' 
  },
  peshawar: { 
    name: 'Peshawar', 
    defaultMarlaSqft: 272.25, 
    recommendedUnit: 'marla' 
  },
  custom: { 
    name: 'Custom', 
    defaultMarlaSqft: 272.25, 
    recommendedUnit: 'marla' 
  },
};

// Standard plot presets for Marla and Sq Yards
interface PlotPreset {
  id: string;
  label: string;
  length: number;
  width: number;
}

const MARLA_PRESETS: PlotPreset[] = [
  { id: '5marla', label: '5 Marla (25×45)', length: 45, width: 25 },
  { id: '10marla', label: '10 Marla (35×65)', length: 65, width: 35 },
  { id: '1kanal', label: '1 Kanal (50×90)', length: 90, width: 50 },
];

const YARDS_PRESETS: PlotPreset[] = [
  { id: '120yards', label: '120 Yards', length: 45, width: 24 }, // 1080 sq ft
  { id: '240yards', label: '240 Yards', length: 60, width: 36 }, // 2160 sq ft
  { id: '500yards', label: '500 Yards', length: 90, width: 50 }, // 4500 sq ft
];

const STORAGE_AVATAR_KEY = 'buildcost_custom_avatar_logo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // City & Standards State
  const [city, setCity] = useState<CityOption>('islamabad_rawalpindi');
  const [marlaSqft, setMarlaSqft] = useState<number>(272.25);
  const [customMarlaInput, setCustomMarlaInput] = useState<string>('272.25');
  const [unitMode, setUnitMode] = useState<AreaUnitMode>('marla');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('5marla');

  // Dimension inputs (ft)
  const [length, setLength] = useState<number>(45);
  const [width, setWidth] = useState<number>(25);

  // Avatar / Logo State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'calculator' | 'settings'>('home');
  const [showCalculateSuccess, setShowCalculateSuccess] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Synchronize avatar from user profile or local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImage = localStorage.getItem(STORAGE_AVATAR_KEY);
      if (storedImage) {
        setAvatarPreview(storedImage);
      } else if (user?.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user?.avatarUrl]);

  // Clean Display Name defaulting to "Umer Shahzad"
  const userName = useMemo(() => {
    if (user?.fullName) {
      // Clean "(Super Admin)" suffixes for high-contrast aesthetic greeting
      return user.fullName.replace(/\s*\(Super Admin\)/i, '').trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Umer Shahzad';
  }, [user]);

  // Handle city change with municipal standard presets
  const handleCityChange = (newCity: CityOption) => {
    setCity(newCity);
    const standardSqft = CITY_STANDARDS[newCity].defaultMarlaSqft;
    setMarlaSqft(standardSqft);
    setCustomMarlaInput(standardSqft.toString());

    // Focus on recommended municipal unit (Karachi -> Sq Yards)
    const recommended = CITY_STANDARDS[newCity].recommendedUnit;
    setUnitMode(recommended);
    if (recommended === 'yards') {
      setSelectedPresetId('120yards');
      setLength(45);
      setWidth(24);
    } else {
      setSelectedPresetId('5marla');
      setLength(45);
      setWidth(25);
    }
  };

  // Handle Marla conversion factor toggle/override
  const handleMarlaStandardSelect = (sqft: number) => {
    setMarlaSqft(sqft);
    setCustomMarlaInput(sqft.toString());
    if (city !== 'custom' && sqft !== CITY_STANDARDS[city].defaultMarlaSqft) {
      setCity('custom');
    }
  };

  // Handle Unit Mode Toggle (Marla vs Sq Yards)
  const handleUnitToggle = (mode: AreaUnitMode) => {
    setUnitMode(mode);
    if (mode === 'marla') {
      setSelectedPresetId('5marla');
      setLength(45);
      setWidth(25);
    } else {
      setSelectedPresetId('120yards');
      setLength(45);
      setWidth(24);
    }
  };

  // Handle Preset selection
  const handlePresetSelect = (preset: PlotPreset) => {
    setSelectedPresetId(preset.id);
    setLength(preset.length);
    setWidth(preset.width);
  };

  // Avatar / Logo upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('Please select an image smaller than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setAvatarPreview(base64);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_AVATAR_KEY, base64);
        }
        if (user) {
          updateProfile({ avatarUrl: base64 });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Total Plot Area (Sq Ft)
  const plotArea = useMemo(() => {
    return Math.max(0, (length || 0) * (width || 0));
  }, [length, width]);

  // Conversions
  const effectiveMarlaSqft = useMemo(() => {
    return marlaSqft > 0 ? marlaSqft : 272.25;
  }, [marlaSqft]);

  const calculatedMarla = useMemo(() => {
    return plotArea > 0 ? plotArea / effectiveMarlaSqft : 0;
  }, [plotArea, effectiveMarlaSqft]);

  const calculatedKanal = useMemo(() => {
    return calculatedMarla / 20;
  }, [calculatedMarla]);

  const calculatedSqYards = useMemo(() => {
    return plotArea / 9;
  }, [plotArea]);

  // Estimated Covered Area (Standard Double Story ~1.4x footprint)
  const coveredArea = useMemo(() => {
    return Math.round(plotArea * 1.4);
  }, [plotArea]);

  // Real-time Material Consumption based on Pakistani Engineering Standards
  const materials = useMemo(() => {
    return {
      bricks: Math.round(coveredArea * 27),        // ~27 bricks per sq ft covered area
      steelKg: Math.round(coveredArea * 3.4),       // ~3.4 kg Grade-60 Deformed Steel
      sandCft: Math.round(coveredArea * 0.72),      // ~0.72 cft Chenab/Ravi Sand
      crushCft: Math.round(coveredArea * 0.60),     // ~0.60 cft Margalla/Sargodha Crush
      cementBags: Math.round(coveredArea * 0.52),   // ~0.52 bags OPC Cement
    };
  }, [coveredArea]);

  // Dynamic Cost Breakdown & Segment Percentages
  const costBreakdown = useMemo(() => {
    // Current Pakistan market standard average: 4,500 PKR / sq ft (Grey structure + Standard finishing)
    const ratePerSqFt = 4500;
    const totalCost = coveredArea * ratePerSqFt;

    const bricksCost = Math.round(totalCost * 0.28);
    const steelCost = Math.round(totalCost * 0.24);
    const cementCost = Math.round(totalCost * 0.18);
    const sandAggregateCost = Math.round(totalCost * 0.12);
    const laborCost = Math.max(0, totalCost - bricksCost - steelCost - cementCost - sandAggregateCost); // ~18%

    return {
      totalCost,
      ratePerSqFt,
      totalInMillion: (totalCost / 1000000).toFixed(2),
      bricksCost,
      steelCost,
      cementCost,
      sandAggregateCost,
      laborCost,
      bricksPercent: 28,
      steelPercent: 24,
      cementPercent: 18,
      sandAggregatePercent: 12,
      laborPercent: 18,
    };
  }, [coveredArea]);

  // Project Timeline Estimation (Days to Completion)
  const timeline = useMemo(() => {
    if (plotArea <= 1125) {
      return { days: 180, label: '4 - 6 Months', progress: 70, status: 'On Schedule' };
    }
    if (plotArea <= 2500) {
      return { days: 270, label: '6 - 9 Months', progress: 58, status: 'Standard Pace' };
    }
    if (plotArea <= 4500) {
      return { days: 365, label: '9 - 12 Months', progress: 48, status: 'Comprehensive' };
    }
    return { days: 450, label: '12 - 15 Months', progress: 40, status: 'Mega Project' };
  }, [plotArea]);

  // Handle Calculate Now feedback
  const handleCalculateNow = () => {
    setShowCalculateSuccess(true);
    setTimeout(() => setShowCalculateSuccess(false), 2400);
  };

  // Export PDF Quote
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [15, 118, 110]; // #0F766E (Teal 700)
      const slateDark = [15, 23, 42];      // #0F172A (Slate 900)

      // Header Banner
      doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // Add Company Logo / Custom Avatar if present
      let textStartX = 16;
      if (avatarPreview && avatarPreview.startsWith('data:image')) {
        try {
          const imgFormat = avatarPreview.includes('png') ? 'PNG' : 'JPEG';
          doc.addImage(avatarPreview, imgFormat, 14, 8, 24, 24);
          textStartX = 44;
        } catch {
          textStartX = 16;
        }
      }

      // Branding Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BUILDCOST PK', textStartX, 18);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(45, 212, 191); // Teal 400
      doc.text('Pakistan Municipal Construction Cost & BOQ Estimate', textStartX, 25);

      // Quote metadata on top-right
      const quoteRef = `BCPK-${Math.floor(100000 + Math.random() * 900000)}`;
      doc.setTextColor(226, 232, 240);
      doc.setFontSize(8);
      doc.text(`Date: ${new Date().toLocaleDateString('en-PK')}`, 150, 16);
      doc.text(`Quote Ref: ${quoteRef}`, 150, 22);
      doc.text(`Standard: ${CITY_STANDARDS[city].name}`, 150, 28);

      // Client & Project Info Block
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(14, 46, 182, 34, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 46, 182, 34, 2, 2, 'S');

      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Prepared For: ${userName}`, 20, 54);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`City Jurisdiction: ${CITY_STANDARDS[city].name} (${effectiveMarlaSqft} sq ft / Marla)`, 20, 61);
      doc.text(`Plot Dimensions: ${length} ft × ${width} ft (${plotArea.toLocaleString()} sq ft)`, 20, 67);
      doc.text(
        `Equivalent Sizing: ${calculatedMarla.toFixed(2)} Marla (${calculatedKanal.toFixed(2)} Kanal) | ${calculatedSqYards.toFixed(1)} Sq Yards`,
        20,
        73
      );

      // Total Cost Highlight Box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(132, 50, 58, 26, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.text('TOTAL ESTIMATED BUDGET', 136, 56);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`PKR ${costBreakdown.totalCost.toLocaleString()}`, 136, 64);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Est. ${timeline.days} Days (${timeline.label})`, 136, 71);

      // Materials Table
      const materialRows = [
        ['1', 'Bricks (First-Class Awal)', `${materials.bricks.toLocaleString()} Units`, 'Structural Masonry Walls & Foundation'],
        ['2', 'Grade-60 Deformed Steel', `${materials.steelKg.toLocaleString()} kg`, 'RCC Columns, Beams, Lintels & Slabs'],
        ['3', 'Chenab / Ravi Coarse Sand', `${materials.sandCft.toLocaleString()} cft`, 'Plaster, Mortar & Concrete Works'],
        ['4', 'Margalla / Sargodha Crush', `${materials.crushCft.toLocaleString()} cft`, 'RCC 1:2:4 Foundations & Roof Slabs'],
        ['5', 'OPC Cement Bags (50kg)', `${materials.cementBags.toLocaleString()} Bags`, 'Standard High-Strength Structural Mix'],
      ];

      autoTable(doc, {
        startY: 86,
        head: [['#', 'Material & Specification', 'Estimated Quantity', 'Application Phase']],
        body: materialRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 62 },
          2: { cellWidth: 42, fontStyle: 'bold', textColor: [15, 118, 110] },
          3: { cellWidth: 68 },
        },
      });

      // Cost Breakdown Table
      const finalY = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text('Capital Expenditure Breakdown (PKR)', 14, finalY);

      const costRows = [
        ['Bricks & Structural Masonry', `28%`, `PKR ${costBreakdown.bricksCost.toLocaleString()}`],
        ['Grade-60 Deformed Steel Rebar', `24%`, `PKR ${costBreakdown.steelCost.toLocaleString()}`],
        ['Grey Structure / Cement Bags', `18%`, `PKR ${costBreakdown.cementCost.toLocaleString()}`],
        ['Sand & Aggregate (Chenab/Margalla)', `12%`, `PKR ${costBreakdown.sandAggregateCost.toLocaleString()}`],
        ['Labor & Architectural Finishing', `18%`, `PKR ${costBreakdown.laborCost.toLocaleString()}`],
        ['Total Estimated Project Cost', '100%', `PKR ${costBreakdown.totalCost.toLocaleString()} (~${costBreakdown.totalInMillion}M PKR)`],
      ];

      autoTable(doc, {
        startY: finalY + 3,
        head: [['Cost Component', 'Share (%)', 'Subtotal (PKR)']],
        body: costRows,
        theme: 'plain',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontSize: 8,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.2,
        },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 72, halign: 'right', fontStyle: 'bold' },
        },
      });

      // Footer Notes
      const footerY = 272;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, footerY, 196, footerY);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Note: Material quantities and rates are generated per Pakistani engineering averages and are subject to market fluctuations. Valid for 14 days.',
        14,
        footerY + 5
      );
      doc.text(
        'Generated via BuildCost PK Mobile & Web Intelligence Engine. For architectural planning & engineering consultations, visit buildcost.pk.',
        14,
        footerY + 9
      );

      // Trigger download
      const fileName = `BuildCost_Quote_${CITY_STANDARDS[city].name.replace(/[^a-zA-Z0-9]/g, '_')}_${plotArea}sqft.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-24 md:pb-12 font-sans transition-colors">
      {/* Mobile-first responsive container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-3.5">
        
        {/* 1. Header & Welcome Profile Card (Refined Gradient) */}
        <header className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white border border-sky-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Interactive Avatar with Upload Trigger */}
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-emerald-400 ring-2 ring-emerald-100 shadow-sm flex items-center justify-center cursor-pointer relative transition-transform group-hover:scale-105"
                title="Click to change profile picture or company logo"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={userName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-6 h-6 text-emerald-600" />
                )}
                {/* Subtle camera icon badge overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 rounded-full border border-white flex items-center justify-center text-white shadow-xs hover:scale-110 transition"
                title="Upload custom logo or profile image"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
              />
            </div>

            <div>
              <p className="text-slate-500 font-medium text-xs tracking-wider uppercase">Welcome,</p>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-white/80 border border-slate-200 text-emerald-700 rounded-lg shadow-sm">
              PKR
            </span>
            <Link 
              href="/profile"
              className="w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 hover:border-indigo-300 hover:text-indigo-600 transition"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* 2. City & Municipal Standard Card (Warm Sand / Amber Tone) */}
        <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              City & Municipal Standard
            </label>
            <span className="text-[11px] font-semibold text-amber-900/80 bg-amber-100/70 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
              {effectiveMarlaSqft} sq ft / Marla
            </span>
          </div>

          {/* City Selector Dropdown */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value as CityOption)}
              className="w-full text-xs font-semibold bg-white border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 rounded-xl px-3 py-2.5 text-slate-800 appearance-none focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="islamabad_rawalpindi">Rawalpindi / Islamabad (Default: 272.25 sq ft / Marla)</option>
              <option value="lahore">Lahore (Default: 250 sq ft / Marla)</option>
              <option value="karachi">Karachi (Default: 225 sq ft / Marla - Primary: Sq Yards)</option>
              <option value="peshawar">Peshawar (272.25 sq ft / Marla)</option>
              <option value="custom">Custom Municipal Standard</option>
            </select>
            <ChevronDown className="w-4 h-4 text-amber-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Marla Standard Override Pills & Custom input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Marla Standard Factor:
              </span>
              {city === 'custom' && (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    step="0.25"
                    value={customMarlaInput}
                    onChange={(e) => {
                      setCustomMarlaInput(e.target.value);
                      const parsed = parseFloat(e.target.value);
                      if (parsed > 0) setMarlaSqft(parsed);
                    }}
                    className="w-20 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-200 bg-white text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="272.25"
                  />
                  <span className="text-[10px] text-amber-700">sq ft</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '272.25', sub: 'ISB/RWP', value: 272.25 },
                { label: '250', sub: 'LHR', value: 250 },
                { label: '225', sub: 'KHI', value: 225 },
                { label: 'Custom', sub: 'Manual', value: -1 },
              ].map((pill) => {
                const isSelected = pill.value === -1 ? city === 'custom' : marlaSqft === pill.value && city !== 'custom';
                return (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => {
                      if (pill.value === -1) {
                        setCity('custom');
                      } else {
                        handleMarlaStandardSelect(pill.value);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-center transition border ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm font-semibold border-emerald-700'
                        : 'bg-white/90 text-slate-600 border-amber-200/60 hover:bg-amber-100/50 shadow-xs'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{pill.label}</div>
                    <div className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {pill.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Toggle: Marla / Kanal vs Sq Yards */}
          <div className="pt-2 border-t border-amber-200/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Unit Mode:
              </span>
              <div className="inline-flex p-0.5 rounded-xl bg-white border border-amber-200/70 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleUnitToggle('marla')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    unitMode === 'marla'
                      ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Marla / Kanal
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('yards')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    unitMode === 'yards'
                      ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sq Yards (گز)
                </button>
              </div>
            </div>

            {/* Standard Presets Based on Mode */}
            <div>
              <span className="text-[10px] text-slate-500 block mb-1 font-semibold">Standard Plot Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {(unitMode === 'marla' ? MARLA_PRESETS : YARDS_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl text-center transition border ${
                      selectedPresetId === preset.id
                        ? 'bg-emerald-700 text-white shadow-sm font-semibold border-emerald-700'
                        : 'bg-white/90 text-slate-600 border-amber-200/60 hover:bg-amber-100/50 shadow-xs'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Plot Dimensions & Cost Engine Card (Mint / Emerald Tone) */}
        <section className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-700" />
              Plot Dimensions & Cost Engine
            </h2>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Rates
            </span>
          </div>

          {/* Length & Width Real-time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Length (لمبائی)
              </label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  min="1"
                  value={length || ''}
                  onChange={(e) => {
                    setSelectedPresetId('');
                    setLength(Math.max(0, Number(e.target.value)));
                  }}
                  className="w-full text-sm font-bold bg-white border border-emerald-200 rounded-xl px-3 py-2 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition shadow-xs"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Width (چوڑائی)
              </label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  min="1"
                  value={width || ''}
                  onChange={(e) => {
                    setSelectedPresetId('');
                    setWidth(Math.max(0, Number(e.target.value)));
                  }}
                  className="w-full text-sm font-bold bg-white border border-emerald-200 rounded-xl px-3 py-2 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition shadow-xs"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
          </div>

          {/* Area & Unit Conversion Summary Badges (Split Pastel Cards) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Total Area Card */}
            <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl p-2.5 shadow-xs">
              <span className="text-[10px] font-semibold text-cyan-700 block uppercase tracking-wider">Total Area</span>
              <span className="text-sm font-extrabold text-cyan-950 block mt-0.5">
                {plotArea.toLocaleString()} <span className="text-xs font-normal text-cyan-700">sq ft</span>
              </span>
            </div>

            {/* Equivalent Unit Card */}
            <div className="bg-purple-50 border border-purple-200 text-purple-900 font-bold rounded-xl p-2.5 shadow-xs text-right">
              <span className="text-[10px] font-semibold text-purple-700 block uppercase tracking-wider">Equivalent Unit</span>
              <span className="text-xs font-bold text-purple-950 block mt-0.5">
                {unitMode === 'marla' ? (
                  calculatedMarla >= 20 ? (
                    `${calculatedMarla.toFixed(2)} Marla (${calculatedKanal.toFixed(2)} Kanal)`
                  ) : (
                    `${calculatedMarla.toFixed(2)} Marla`
                  )
                ) : (
                  `${calculatedSqYards.toFixed(1)} Sq Yards`
                )}
              </span>
            </div>
          </div>

          {/* 5. Actions: Calculate Now & Export PDF Quote (Modern Floating Look) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              type="button"
              onClick={handleCalculateNow}
              className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-800 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              {showCalculateSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>Calculated!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Calculate Now</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPdf || plotArea <= 0}
              className="py-2.5 px-3 bg-white text-teal-700 border-2 border-teal-500/30 hover:bg-teal-50/50 shadow-sm text-xs font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF Quote'}</span>
            </button>
          </div>
        </section>

        {/* 4. Cost Breakdown & Charts Section (Pastel Multi-Color Scheme) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Real-Time Material Quantities */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                  Materials
                </h3>
                <span className="text-[9px] text-slate-500 font-semibold bg-white border border-slate-200/60 px-1.5 py-0.5 rounded-md">Est. Qty</span>
              </div>

              <div className="space-y-1.5 text-[11px] pt-2">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600">Bricks (اینٹیں)</span>
                  <span className="font-bold text-slate-900">{materials.bricks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600">Steel (60-Grade)</span>
                  <span className="font-bold text-slate-900">{materials.steelKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600">Sand (ریت)</span>
                  <span className="font-bold text-slate-900">{materials.sandCft.toLocaleString()} cft</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600">Crush (بجری)</span>
                  <span className="font-bold text-slate-900">{materials.crushCft.toLocaleString()} cft</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600">Cement (سیمنٹ)</span>
                  <span className="font-bold text-slate-900">{materials.cementBags.toLocaleString()} bags</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 text-center font-medium">
              Covered Area: <span className="font-bold text-slate-800">{coveredArea.toLocaleString()} sq ft</span>
            </div>
          </div>

          {/* Real-time SVG Cost Donut Chart Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <PieChartIcon className="w-3.5 h-3.5 text-teal-600" />
                  Cost Share
                </h3>
              </div>
              <p className="text-[11px] text-slate-900 font-extrabold mt-0.5">
                PKR {costBreakdown.totalCost.toLocaleString()}
              </p>
            </div>

            {/* SVG Donut Chart with mathematically exact circumference of 100 */}
            <div className="relative flex items-center justify-center my-1.5">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#e2e8f0" 
                  strokeWidth="3.8" 
                />
                {/* 1. Bricks & Masonry (28%) - Warm Terra-cotta / Orange #fb923c */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#fb923c" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.bricksPercent} 100`} 
                  strokeDashoffset="0" 
                />
                {/* 2. Steel (60-Grade) (24%) - Slate Indigo #818cf8 */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#818cf8" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.steelPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent}`} 
                />
                {/* 3. Grey Structure / Cement (18%) - Soft Blue #38bdf8 */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#38bdf8" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.cementPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent + costBreakdown.steelPercent}`} 
                />
                {/* 4. Sand & Aggregate (12%) - Soft Amber #facc15 */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#facc15" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.sandAggregatePercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent + costBreakdown.steelPercent + costBreakdown.cementPercent}`} 
                />
                {/* 5. Labor & Finishing (18%) - Fresh Emerald #34d399 */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#34d399" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.laborPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent + costBreakdown.steelPercent + costBreakdown.cementPercent + costBreakdown.sandAggregatePercent}`} 
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[11px] font-extrabold text-slate-900">
                  {costBreakdown.totalInMillion}M
                </span>
                <span className="text-[8px] font-semibold text-slate-500">PKR</span>
              </div>
            </div>

            {/* Donut Legend Tags with Pastel Badges */}
            <div className="space-y-1 text-[9px] font-semibold pt-1.5 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#fb923c] shrink-0"></span>
                  Bricks
                </span>
                <span className="bg-orange-100 text-orange-800 px-1 rounded text-[8px] font-bold">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#818cf8] shrink-0"></span>
                  Steel 60-G
                </span>
                <span className="bg-indigo-100 text-indigo-800 px-1 rounded text-[8px] font-bold">24%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] shrink-0"></span>
                  Cement
                </span>
                <span className="bg-sky-100 text-sky-800 px-1 rounded text-[8px] font-bold">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#facc15] shrink-0"></span>
                  Sand/Agg
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-[8px] font-bold">12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#34d399] shrink-0"></span>
                  Labor/Finish
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-1 rounded text-[8px] font-bold">18%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline Card */}
        <section className="bg-indigo-50/30 border border-indigo-100/70 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Project Timeline
            </h3>
            <span className="text-[11px] text-slate-600 font-medium">
              {timeline.label}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Days to Completion: <span className="text-teal-700 font-extrabold">{timeline.days} Days</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
              {timeline.status}
            </span>
          </div>

          <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${timeline.progress}%` }}
            ></div>
          </div>
        </section>

        {/* Link to Full Civil Engineering Calculators */}
        <div>
          <Link
            href="/calculator"
            className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200/80 hover:border-teal-400 text-slate-800 text-xs font-bold flex items-center justify-between shadow-sm hover:shadow-md transition group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Calculator className="w-4 h-4" />
              </div>
              <span>Explore All Detailed Civil Engineering Calculators</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
          </Link>
        </div>

      </main>

      {/* Modern Active Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40 shadow-lg">
        <Link 
          href="/dashboard"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center transition ${
            activeTab === 'home' 
              ? 'text-teal-700 font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link 
          href="/projects"
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center transition ${
            activeTab === 'projects' 
              ? 'text-teal-700 font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Projects</span>
        </Link>
        <Link 
          href="/calculator"
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center transition ${
            activeTab === 'calculator' 
              ? 'text-teal-700 font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Calculator</span>
        </Link>
        <Link 
          href="/settings"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center transition ${
            activeTab === 'settings' 
              ? 'text-teal-700 font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
