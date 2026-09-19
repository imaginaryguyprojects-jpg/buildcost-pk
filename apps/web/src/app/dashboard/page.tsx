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

    const bricksCost = Math.round(totalCost * 0.38);
    const steelCost = Math.round(totalCost * 0.28);
    const cementCost = Math.round(totalCost * 0.18);
    const laborCost = Math.max(0, totalCost - bricksCost - steelCost - cementCost); // 16%

    return {
      totalCost,
      ratePerSqFt,
      totalInMillion: (totalCost / 1000000).toFixed(2),
      bricksCost,
      steelCost,
      cementCost,
      laborCost,
      bricksPercent: 38,
      steelPercent: 28,
      cementPercent: 18,
      laborPercent: 16,
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
        ['Structural Bricks', `38%`, `PKR ${costBreakdown.bricksCost.toLocaleString()}`],
        ['Grade-60 Steel Rebar', `28%`, `PKR ${costBreakdown.steelCost.toLocaleString()}`],
        ['Cement Bags', `18%`, `PKR ${costBreakdown.cementCost.toLocaleString()}`],
        ['Labor, Aggregate & Finishing Works', `16%`, `PKR ${costBreakdown.laborCost.toLocaleString()}`],
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-12 transition-colors font-sans">
      {/* Mobile-first responsive container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-3.5">
        
        {/* Header & User Identity (English Localization & Custom Avatar) */}
        <header className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            {/* Interactive Avatar with Upload Trigger */}
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center cursor-pointer relative"
                title="Click to change profile picture or company logo"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={userName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                )}
                {/* Subtle camera icon badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0F766E] dark:bg-teal-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs hover:scale-110 transition"
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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome,</p>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 shadow-xs">
              PKR
            </span>
            <Link 
              href="/profile"
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-xs hover:border-teal-500 transition"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* City & Municipal Standards Selector */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              City & Municipal Standard
            </label>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {effectiveMarlaSqft} sq ft / Marla
            </span>
          </div>

          {/* City Selector Dropdown */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value as CityOption)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 cursor-pointer"
            >
              <option value="islamabad_rawalpindi">Rawalpindi / Islamabad (Default: 272.25 sq ft / Marla)</option>
              <option value="lahore">Lahore (Default: 250 sq ft / Marla)</option>
              <option value="karachi">Karachi (Default: 225 sq ft / Marla - Primary: Sq Yards)</option>
              <option value="peshawar">Peshawar (272.25 sq ft / Marla)</option>
              <option value="custom">Custom Municipal Standard</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Marla Standard Override Pills & Custom input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                    className="w-20 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-right focus:outline-none"
                    placeholder="272.25"
                  />
                  <span className="text-[10px] text-slate-400">sq ft</span>
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
                    className={`py-1.5 px-2 rounded-lg text-center transition border ${
                      isSelected
                        ? 'bg-[#1E293B] dark:bg-teal-600 text-white border-[#1E293B] dark:border-teal-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{pill.label}</div>
                    <div className={`text-[9px] ${isSelected ? 'text-teal-200 dark:text-white/80' : 'text-slate-400'}`}>
                      {pill.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Toggle: Marla / Kanal vs Sq Yards */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Unit Mode:
              </span>
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleUnitToggle('marla')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    unitMode === 'marla'
                      ? 'bg-white dark:bg-teal-600 text-[#0F766E] dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Marla / Kanal
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('yards')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    unitMode === 'yards'
                      ? 'bg-white dark:bg-teal-600 text-[#0F766E] dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Sq Yards (گز)
                </button>
              </div>
            </div>

            {/* Standard Presets Based on Mode */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 font-medium">Standard Plot Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {(unitMode === 'marla' ? MARLA_PRESETS : YARDS_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl text-center transition border ${
                      selectedPresetId === preset.id
                        ? 'bg-[#1E293B] dark:bg-teal-600 text-white border-[#1E293B] dark:border-teal-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Real-Time Custom Dimension Calculator Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              Plot Dimensions & Cost Engine
            </h2>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              Live Rates
            </span>
          </div>

          {/* Length & Width Real-time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
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
                  className="w-full text-sm font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
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
                  className="w-full text-sm font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-medium">ft</span>
              </div>
            </div>
          </div>

          {/* Area & Unit Conversion Summary Badges */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-medium text-slate-400 block">Total Area</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {plotArea.toLocaleString()} <span className="text-xs font-normal text-slate-500">sq ft</span>
              </span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-medium text-slate-400 block">Equivalent Unit</span>
              <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60 inline-block">
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

          {/* Actions: Calculate Now & Export PDF Quote */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              type="button"
              onClick={handleCalculateNow}
              className="py-2.5 px-3 bg-[#1E293B] dark:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 dark:hover:bg-teal-500 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
            >
              {showCalculateSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 dark:text-white animate-bounce" />
                  <span>Calculated!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 dark:text-white" />
                  <span>Calculate Now</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPdf || plotArea <= 0}
              className="py-2.5 px-3 bg-white dark:bg-slate-800 text-[#0F766E] dark:text-teal-400 border border-teal-300 dark:border-teal-700/60 hover:bg-teal-50/50 dark:hover:bg-slate-700 text-xs font-bold rounded-xl shadow-xs active:scale-[0.99] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF Quote'}</span>
            </button>
          </div>
        </section>

        {/* Dynamic Materials Breakdown & Cost Donut Card */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Real-Time Material Quantities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                Materials
              </h3>
              <span className="text-[9px] text-slate-400 font-medium">Est. Quantities</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600 dark:text-slate-400">Bricks (اینٹیں)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{materials.bricks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600 dark:text-slate-400">Steel (60-Grade)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{materials.steelKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600 dark:text-slate-400">Sand (ریت)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{materials.sandCft.toLocaleString()} cft</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600 dark:text-slate-400">Crush (بجری)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{materials.crushCft.toLocaleString()} cft</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600 dark:text-slate-400">Cement (سیمنٹ)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{materials.cementBags.toLocaleString()} bags</span>
              </div>
            </div>
          </div>

          {/* Real-time SVG Cost Donut Chart Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <PieChartIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                  Cost Share
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
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
                  stroke="currentColor" 
                  className="text-slate-100 dark:text-slate-800" 
                  strokeWidth="3.8" 
                />
                {/* Bricks (38%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#0F766E" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.bricksPercent} 100`} 
                  strokeDashoffset="0" 
                />
                {/* Steel (28%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#14B8A6" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.steelPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent}`} 
                />
                {/* Cement (18%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#2DD4BF" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.cementPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent + costBreakdown.steelPercent}`} 
                />
                {/* Labor (16%) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="transparent" 
                  stroke="#F59E0B" 
                  strokeWidth="3.8" 
                  strokeDasharray={`${costBreakdown.laborPercent} 100`} 
                  strokeDashoffset={`-${costBreakdown.bricksPercent + costBreakdown.steelPercent + costBreakdown.cementPercent}`} 
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">
                  {costBreakdown.totalInMillion}M
                </span>
                <span className="text-[8px] font-semibold text-slate-400">PKR</span>
              </div>
            </div>

            {/* Donut Legend Tags */}
            <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-600 dark:text-slate-400 font-semibold pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0"></span>
                Bricks 38%
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0"></span>
                Steel 28%
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0"></span>
                Cement 18%
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0"></span>
                Labor 16%
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              Project Timeline
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {timeline.label}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Days to Completion: <span className="text-[#0F766E] dark:text-teal-400">{timeline.days} Days</span>
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50">
              {timeline.status}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#0F766E] dark:bg-teal-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${timeline.progress}%` }}
            ></div>
          </div>
        </section>

        {/* Link to Full Civil Engineering Calculators */}
        <div>
          <Link
            href="/calculator"
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between shadow-xs transition group"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Explore All Detailed Civil Engineering Calculators</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>

      </main>

      {/* Modern Active Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-40 shadow-lg">
        <Link 
          href="/dashboard"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center transition ${
            activeTab === 'home' 
              ? 'text-[#0F766E] dark:text-teal-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
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
              ? 'text-[#0F766E] dark:text-teal-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
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
              ? 'text-[#0F766E] dark:text-teal-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
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
              ? 'text-[#0F766E] dark:text-teal-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
