"use client";

import React from "react";
import {
  Boxes,
  Layers,
  Building2,
  HardHat,
  Truck,
  Bath,
  DoorOpen,
  Sparkles,
  Percent
} from "lucide-react";
import { formatPKR, formatNumber } from "@/lib/formatters";

interface GreyStructureBreakdownGridProps {
  totalCost: number;
  coveredAreaSqft: number;
  floors: number;
  cementBags: number;
  steelKg: number;
  bricksCount: number;
  sandCft: number;
  crushCft: number;
  labourCost: number;
  transportCost: number;
  wastageCost: number;
  cementBagRate: number;
  steelKgRate: number;
  brickRate: number;
  sandCftRate: number;
  crushCftRate: number;
  labourRate: number;
}

export function GreyStructureBreakdownGrid({
  totalCost,
  coveredAreaSqft,
  floors,
  cementBags,
  steelKg,
  bricksCount,
  sandCft,
  crushCft,
  labourCost,
  transportCost,
  wastageCost,
  cementBagRate,
  steelKgRate,
  brickRate,
  sandCftRate,
  crushCftRate,
  labourRate
}: GreyStructureBreakdownGridProps) {
  // 1. Brick Masonry (Walls): ~60% of bricks + ~25% mortar cement + ~30% sand + 25% labour
  const wallBricks = Math.round(bricksCount * 0.78);
  const wallCement = Math.round(cementBags * 0.22);
  const wallSand = Math.round(sandCft * 0.32);
  const wallLabourManDays = Math.max(10, Math.round(coveredAreaSqft * 0.1));
  const wallCost = Math.round(
    wallBricks * brickRate + wallCement * cementBagRate + wallSand * sandCftRate + labourCost * 0.25
  );

  // 2. Plastering (Walls & Ceilings): ~18% cement + ~28% sand + 18% labour
  const plasterCement = Math.round(cementBags * 0.18);
  const plasterSand = Math.round(sandCft * 0.28);
  const plasterLabourManDays = Math.max(8, Math.round(coveredAreaSqft * 0.08));
  const plasterCost = Math.round(
    plasterCement * cementBagRate + plasterSand * sandCftRate + labourCost * 0.18
  );

  // 3. RCC (Slabs & Beams): ~32% cement + ~55% steel + ~25% sand + ~50% crush + 28% labour
  const slabCement = Math.round(cementBags * 0.32);
  const slabSteel = Math.round(steelKg * 0.55);
  const slabSand = Math.round(sandCft * 0.25);
  const slabLabourManDays = Math.max(12, Math.round(coveredAreaSqft * 0.14));
  const slabCost = Math.round(
    slabCement * cementBagRate + slabSteel * steelKgRate + slabSand * sandCftRate + labourCost * 0.28
  );

  // 4. Foundation & Excavation: ~12% cement + ~25% crush + excavation labour + lean concrete
  const foundCement = Math.round(cementBags * 0.12);
  const foundCrush = Math.round(crushCft * 0.28);
  const foundExcavationCft = Math.round(coveredAreaSqft * 0.45);
  const foundLabourManDays = Math.max(8, Math.round(coveredAreaSqft * 0.07));
  const foundationCost = Math.round(
    foundCement * cementBagRate + foundCrush * crushCftRate + labourCost * 0.12 + coveredAreaSqft * 35
  );

  // 5. Columns & Beams: ~16% cement + ~35% steel + ~15% sand + ~22% crush + 12% labour
  const colCement = Math.round(cementBags * 0.16);
  const colSteel = Math.round(steelKg * 0.35);
  const colSand = Math.round(sandCft * 0.15);
  const colLabourManDays = Math.max(8, Math.round(coveredAreaSqft * 0.09));
  const columnsCost = Math.round(
    colCement * cementBagRate + colSteel * steelKgRate + colSand * sandCftRate + labourCost * 0.12
  );

  // 6. Bathroom & Plumbing: dedicated partition bricks (22% of bricks) + water-proof screed + sanitary piping
  const bathCement = Math.round(cementBags * 0.08);
  const bathSand = Math.round(sandCft * 0.1);
  const bathTilesSqft = Math.round(floors * 2 * 120);
  const bathLabourManDays = Math.max(6, Math.round(floors * 2 * 15));
  const bathroomCost = Math.round(
    bathCement * cementBagRate + bathSand * sandCftRate + labourCost * 0.05 + floors * 2 * 35000
  );

  // 7. Doors & Windows (Structural Chowkhats & Lintels):
  const chowkhatUnits = Math.round(floors * 11);
  const doorsLabourManDays = Math.max(4, Math.round(floors * 20));
  const doorsCost = Math.round(chowkhatUnits * 3200 + doorsLabourManDays * 1200 + 8500);

  // 8. Miscellaneous & Wastage:
  const miscCost = Math.round(transportCost + wastageCost);

  const CARDS = [
    {
      title: "Brick Masonry (Walls)",
      cost: wallCost,
      icon: <Boxes className="w-4 h-4 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40",
      line1: `Bricks: ${formatNumber(wallBricks)} Nos`,
      line2: `Cement: ${formatNumber(wallCement)} Bags`,
      line3: `Sand: ${formatNumber(wallSand)} Cft`,
      line4: `Labour: ${wallLabourManDays} Man-days`
    },
    {
      title: "Plastering (Walls)",
      cost: plasterCost,
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-800/40",
      line1: `Cement: ${formatNumber(plasterCement)} Bags`,
      line2: `Sand: ${formatNumber(plasterSand)} Cft`,
      line3: `Area: ${formatNumber(Math.round(coveredAreaSqft * 3.2))} sqft`,
      line4: `Labour: ${plasterLabourManDays} Man-days`
    },
    {
      title: "RCC (Slabs & Beams)",
      cost: slabCost,
      icon: <Building2 className="w-4 h-4 text-cyan-500" />,
      bg: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200/60 dark:border-cyan-800/40",
      line1: `Cement: ${formatNumber(slabCement)} Bags`,
      line2: `Steel: ${formatNumber(slabSteel)} Kg`,
      line3: `Sand: ${formatNumber(slabSand)} Cft`,
      line4: `Labour: ${slabLabourManDays} Man-days`
    },
    {
      title: "Foundation & Excavation",
      cost: foundationCost,
      icon: <HardHat className="w-4 h-4 text-blue-500" />,
      bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40",
      line1: `Excavation: ${formatNumber(foundExcavationCft)} Cft`,
      line2: `Cement: ${formatNumber(foundCement)} Bags`,
      line3: `Crush: ${formatNumber(foundCrush)} Cft`,
      line4: `Labour: ${foundLabourManDays} Man-days`
    },
    {
      title: "Columns & Beams",
      cost: columnsCost,
      icon: <Building2 className="w-4 h-4 text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40",
      line1: `Cement: ${formatNumber(colCement)} Bags`,
      line2: `Steel: ${formatNumber(colSteel)} Kg`,
      line3: `Sand: ${formatNumber(colSand)} Cft`,
      line4: `Labour: ${colLabourManDays} Man-days`
    },
    {
      title: "Bathroom & Plumbing",
      cost: bathroomCost,
      icon: <Bath className="w-4 h-4 text-sky-500" />,
      bg: "bg-sky-50 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/40",
      line1: `Cement: ${formatNumber(bathCement)} Bags`,
      line2: `Sand: ${formatNumber(bathSand)} Cft`,
      line3: `Tiles/Sanitary: ${formatNumber(bathTilesSqft)} sqft`,
      line4: `Labour: ${bathLabourManDays} Man-days`
    },
    {
      title: "Doors & Windows (Structural)",
      cost: doorsCost,
      icon: <DoorOpen className="w-4 h-4 text-indigo-500" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40",
      line1: `Chowkhats: ${chowkhatUnits} Units`,
      line2: `Labour: ${doorsLabourManDays} Man-days`,
      line3: `Lintels: ${chowkhatUnits} Nos`,
      line4: `Transport: Included`
    },
    {
      title: "Miscellaneous & Wastage",
      cost: miscCost,
      icon: <Truck className="w-4 h-4 text-orange-500" />,
      bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/40",
      line1: `Transport: ${formatPKR(transportCost)}`,
      line2: `Wastage: 5% (${formatPKR(wastageCost)})`,
      line3: `Site Utilities: Water/Elect`,
      line4: `Contingency: 2%`
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Grey Structure Cost Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detailed dynamic pricing based on your selected inputs and location.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-semibold">Total:</div>
          <div className="text-lg sm:text-xl font-black text-[#059669] dark:text-emerald-400">
            {formatPKR(totalCost)}
          </div>
        </div>
      </div>

      {/* 8 Compact Cards Grid (4 columns x 2 rows on xl/lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all hover:shadow-sm space-y-2.5 ${card.bg}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xs shrink-0">
                  {card.icon}
                </div>
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                  {card.title}
                </h4>
              </div>
              <div className="font-black text-xs text-slate-900 dark:text-white shrink-0">
                {formatPKR(card.cost)}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 leading-tight pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex justify-between">
                <span>{card.line1}</span>
                <span>{card.line2}</span>
              </div>
              <div className="flex justify-between">
                <span>{card.line3}</span>
                <span>{card.line4}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

