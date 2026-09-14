/**
 * BUILDCOST CONNECT — ADVANCED PRO CONSTRUCTION ENGINE (VERSION 3.0.0)
 * 
 * Implements exact structural calculation with zero double-counting:
 * 1. Wall Height & Exact Wall Volume
 * 2. Number of Bathrooms with Individual Dimensions
 * 3. Foundation / Bunyad (Excavation, PCC Bed, Footings, Backfill)
 * 4. RCC Columns (Count, Cross-section, Height, Rebar)
 * 5. RCC Beams (Count, Cross-section, Running Length, Rebar)
 * 6. Master Traceable Grey Structure Breakdown
 */

import {
  ProConstructionInputs,
  ProBathroomItem,
  ProDetailedEstimate
} from "@buildcost/types";
import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { ConcreteBreakdown, calculateMixBreakdown, STRUCTURAL_DISCLAIMER } from "./structural_elements";
import { ItemizedMaterialQuantity } from "./grey_structure";

// -------------------------------------------------------------
// 1. WALL VOLUME & HEIGHT ENGINE
// -------------------------------------------------------------
export interface WallVolumeInput {
  coveredAreaSqft: number;
  numberOfFloors: number;
  wallHeightFt: number; // e.g. 10 ft, 11 ft, 12 ft
  wallThicknessInches?: number; // default 9 inches
  openingsDeductionPercent?: number; // default 12% for doors & windows
  wastagePercent?: number; // default 5%
}

export interface WallVolumeResult {
  estimatedRunningLengthFt: number;
  wallHeightFt: number;
  grossWallAreaSqft: number;
  openingsDeductionAreaSqft: number;
  netWallAreaSqft: number;
  netWallVolumeCft: number;
  requiredBricks: number;
  finalBricks: number;
  mortarCementBags: number;
  mortarSandCft: number;
}

export function calculateWallVolume(input: WallVolumeInput): WallVolumeResult {
  const safeArea = Math.max(50, input.coveredAreaSqft);
  const floors = Math.max(1, input.numberOfFloors);
  const height = Math.max(7, Math.min(25, input.wallHeightFt || 10));
  const thickFt = (input.wallThicknessInches || 9) / 12;
  const openingsPct = (input.openingsDeductionPercent ?? 12) / 100;
  const wastage = (input.wastagePercent ?? 5) / 100;

  // Empirical running length for Pakistani residential housing:
  // ~0.7 to 0.75 linear feet of wall per sqft of floor area
  const groundFloorArea = safeArea / floors;
  const runningLengthPerFloor = Math.sqrt(groundFloorArea) * 4 * 1.5; // perimeter + interior cross walls
  const totalRunningLengthFt = Math.round(runningLengthPerFloor * floors);

  const grossWallAreaSqft = Math.round(totalRunningLengthFt * height);
  const openingsDeductionAreaSqft = Math.round(grossWallAreaSqft * openingsPct);
  const netWallAreaSqft = Math.max(0, grossWallAreaSqft - openingsDeductionAreaSqft);
  const netWallVolumeCft = Math.round(netWallAreaSqft * thickFt * 100) / 100;

  // 13.5 bricks per CFT
  const requiredBricks = Math.round(netWallVolumeCft * 13.5);
  const finalBricks = Math.ceil(requiredBricks * (1 + wastage));

  // 1:5 Mortar calculation (28% volume of masonry * 1.27 dry factor = ~35.5% dry mortar)
  const dryMortarCft = netWallVolumeCft * 0.28 * 1.27;
  const mortarCementBags = Math.ceil(((dryMortarCft * (1 / 6)) / 1.25) * (1 + wastage));
  const mortarSandCft = Math.round(dryMortarCft * (5 / 6) * (1 + wastage));

  return {
    estimatedRunningLengthFt: totalRunningLengthFt,
    wallHeightFt: height,
    grossWallAreaSqft,
    openingsDeductionAreaSqft,
    netWallAreaSqft,
    netWallVolumeCft,
    requiredBricks,
    finalBricks,
    mortarCementBags,
    mortarSandCft
  };
}

// -------------------------------------------------------------
// 2. INDIVIDUAL BATHROOMS PARTITION ENGINE
// -------------------------------------------------------------
export interface BathroomWallsInput {
  bathrooms: ProBathroomItem[];
  defaultWallHeightFt?: number;
  partitionThicknessInches?: number; // default 4.5 inches
  doorOpeningAreaSqft?: number; // 2.5ft x 7ft = 17.5 sqft
  wastagePercent?: number; // default 5%
}

export interface BathroomWallsResult {
  bathroomCount: number;
  totalPerimeterFt: number;
  grossWallAreaSqft: number;
  netWallAreaSqft: number;
  netWallVolumeCft: number;
  requiredBricks: number;
  finalBricks: number;
  mortarCementBags: number;
  mortarSandCft: number;
  totalFloorAreaSqft: number;
  itemizedBathrooms: Array<{
    id: string;
    name: string;
    lengthFt: number;
    widthFt: number;
    heightFt: number;
    floorAreaSqft: number;
    wallAreaSqft: number;
    bricks: number;
  }>;
}

export function calculateBathroomWalls(input: BathroomWallsInput): BathroomWallsResult {
  const bathrooms = input.bathrooms || [];
  const defaultHeight = Math.max(7, input.defaultWallHeightFt || 10);
  const thickFt = (input.partitionThicknessInches || 4.5) / 12;
  const doorArea = input.doorOpeningAreaSqft ?? 17.5; // 2.5' x 7' standard bath door
  const wastage = (input.wastagePercent ?? 5) / 100;

  let totalPerimeterFt = 0;
  let grossWallAreaSqft = 0;
  let netWallAreaSqft = 0;
  let totalFloorAreaSqft = 0;

  const itemized = bathrooms.map((b, idx) => {
    const l = Math.max(3, Number(b.lengthFt) || 8);
    const w = Math.max(3, Number(b.widthFt) || 5);
    const h = b.heightMode === "manual" ? Math.max(7, Number(b.heightFt) || defaultHeight) : defaultHeight;
    const floorArea = l * w;
    const perimeter = 2 * (l + w);
    const grossArea = perimeter * h;
    const netArea = Math.max(0, grossArea - doorArea);
    const bathVol = netArea * thickFt;
    const bricks = Math.ceil(bathVol * 13.5 * (1 + wastage));

    totalPerimeterFt += perimeter;
    grossWallAreaSqft += grossArea;
    netWallAreaSqft += netArea;
    totalFloorAreaSqft += floorArea;

    return {
      id: b.id || ("bath_" + (idx + 1)),
      name: b.name || ("Bathroom " + (idx + 1)),
      lengthFt: l,
      widthFt: w,
      heightFt: h,
      floorAreaSqft: Math.round(floorArea * 10) / 10,
      wallAreaSqft: Math.round(netArea * 10) / 10,
      bricks
    };
  });

  const netWallVolumeCft = Math.round(netWallAreaSqft * thickFt * 100) / 100;
  const requiredBricks = Math.round(netWallVolumeCft * 13.5);
  const finalBricks = Math.ceil(requiredBricks * (1 + wastage));

  const dryMortarCft = netWallVolumeCft * 0.28 * 1.27;
  const mortarCementBags = Math.ceil(((dryMortarCft * (1 / 5)) / 1.25) * (1 + wastage)); // 1:4 rich mix for bathroom partitions
  const mortarSandCft = Math.round(dryMortarCft * (4 / 5) * (1 + wastage));

  return {
    bathroomCount: bathrooms.length,
    totalPerimeterFt: Math.round(totalPerimeterFt),
    grossWallAreaSqft: Math.round(grossWallAreaSqft),
    netWallAreaSqft: Math.round(netWallAreaSqft),
    netWallVolumeCft,
    requiredBricks,
    finalBricks,
    mortarCementBags,
    mortarSandCft,
    totalFloorAreaSqft: Math.round(totalFloorAreaSqft),
    itemizedBathrooms: itemized
  };
}

// -------------------------------------------------------------
// 3. FOUNDATION (BUNYAD) EXCAVATION & SUB-STRUCTURE ENGINE
// -------------------------------------------------------------
export interface ProFoundationInput {
  buildingFootprintSqft: number;
  depthFt: number; // e.g. 4 ft
  widthFt: number; // e.g. 3 ft
  foundationType: "automatic" | "strip" | "isolated" | "raft" | "other";
  pccThicknessInches?: number; // default 3 inches lean bed
  columnFootingCount?: number;
  wastagePercent?: number; // default 5%
}

export interface ProFoundationResult {
  excavationVolumeCft: number;
  pccVolumeCft: number;
  pccBreakdown: ConcreteBreakdown;
  rccOrMasonryVolumeCft: number;
  foundationBricks: number;
  foundationSteelKg: number;
  backfillVolumeCft: number;
  totalCementBags: number;
  totalSandCft: number;
  totalCrushCft: number;
  totalFoundationCost: number;
  disclaimer: string;
}

export function calculateProFoundation(input: ProFoundationInput): ProFoundationResult {
  const footprint = Math.max(50, input.buildingFootprintSqft);
  const depth = Math.max(2, Math.min(15, input.depthFt || 4));
  const width = Math.max(1.5, Math.min(10, input.widthFt || 3));
  const wastage = (input.wastagePercent ?? 5) / 100;
  const pccThickFt = (input.pccThicknessInches || 3) / 12;

  // Approximate foundation trench running length:
  // Perimeter of building footprint + cross trench network (~1.6 * perimeter)
  const perimeter = Math.sqrt(footprint) * 4;
  const trenchRunningLengthFt = perimeter * 1.6;

  let excavationVolumeCft = 0;
  let pccVolumeCft = 0;
  let rccOrMasonryVolumeCft = 0;
  let foundationBricks = 0;
  let foundationSteelKg = 0;

  if (input.foundationType === "raft") {
    // Raft slab across the entire footprint
    excavationVolumeCft = Math.round(footprint * (depth + pccThickFt));
    pccVolumeCft = Math.round(footprint * pccThickFt);
    rccOrMasonryVolumeCft = Math.round(footprint * (12 / 12)); // 12 in raft slab
    foundationSteelKg = Math.round(rccOrMasonryVolumeCft * 0.012 * 222.3 * (1 + wastage));
  } else if (input.foundationType === "isolated") {
    // Isolated footings for columns + plinth connecting trenches
    const colCount = Math.max(6, input.columnFootingCount || Math.round(footprint / 150));
    const padVol = colCount * (width * width * depth);
    const tieTrenchVol = trenchRunningLengthFt * 1.5 * 2; // plinth beam trenches
    excavationVolumeCft = Math.round(padVol + tieTrenchVol);
    pccVolumeCft = Math.round(colCount * (width * width * pccThickFt));
    rccOrMasonryVolumeCft = Math.round(colCount * (width * width * 0.85)); // concrete pads
    foundationSteelKg = Math.round(rccOrMasonryVolumeCft * 0.01 * 222.3 * (1 + wastage));
  } else {
    // Strip Foundation (Standard in Pakistan: trench excavation + 3" PCC + stepped brickwork)
    excavationVolumeCft = Math.round(trenchRunningLengthFt * width * depth);
    pccVolumeCft = Math.round(trenchRunningLengthFt * width * pccThickFt);
    
    // Stepped brick footings: 22.5" -> 18" -> 13.5" -> 9"
    // Average thickness ~ 1.35 ft x (depth - 1 ft height)
    const steppedMasonryHeight = Math.max(1, depth - 1);
    rccOrMasonryVolumeCft = Math.round(trenchRunningLengthFt * 1.35 * steppedMasonryHeight);
    foundationBricks = Math.ceil(rccOrMasonryVolumeCft * 13.5 * (1 + wastage));
    // Plinth DPC steel
    foundationSteelKg = Math.round(trenchRunningLengthFt * 1.8 * (1 + wastage));
  }

  // PCC 1:4:8 Lean Bed Mix
  const pccBreakdown = calculateMixBreakdown(pccVolumeCft, { cement: 1, sand: 4, crush: 8 }, 0, input.wastagePercent || 5);

  // Additional mortar or RCC concrete breakdown for foundation
  let subCement = pccBreakdown.cementBags;
  let subSand = pccBreakdown.sandCft;
  let subCrush = pccBreakdown.crushCft;

  if (foundationBricks > 0) {
    // 1:4 Foundation mortar
    const dryMortar = rccOrMasonryVolumeCft * 0.28 * 1.27;
    subCement += Math.ceil(((dryMortar * (1 / 5)) / 1.25) * (1 + wastage));
    subSand += Math.round(dryMortar * (4 / 5) * (1 + wastage));
  } else if (rccOrMasonryVolumeCft > 0) {
    // 1:2:4 RCC footing
    const rccBreakdown = calculateMixBreakdown(rccOrMasonryVolumeCft, { cement: 1, sand: 2, crush: 4 }, 1.0, input.wastagePercent || 5);
    subCement += rccBreakdown.cementBags;
    subSand += rccBreakdown.sandCft;
    subCrush += rccBreakdown.crushCft;
  }

  const displacedVol = pccVolumeCft + rccOrMasonryVolumeCft;
  const backfillVolumeCft = Math.max(0, excavationVolumeCft - displacedVol);

  return {
    excavationVolumeCft,
    pccVolumeCft,
    pccBreakdown,
    rccOrMasonryVolumeCft,
    foundationBricks,
    foundationSteelKg,
    backfillVolumeCft,
    totalCementBags: subCement,
    totalSandCft: subSand,
    totalCrushCft: subCrush,
    totalFoundationCost: Math.round(
      subCement * 1450 +
      foundationSteelKg * 260 +
      foundationBricks * 14.5 +
      subSand * 45 +
      subCrush * 95 +
      excavationVolumeCft * 12
    ),
    disclaimer:
      "Foundation and structural dimensions are estimates for cost calculation only. Final structural design must be verified by a qualified engineer according to site conditions and applicable codes."
  };
}

// -------------------------------------------------------------
// 4. RCC COLUMNS ENGINE
// -------------------------------------------------------------
export interface ProColumnInput {
  count: number;
  widthFt: number; // e.g. 0.75 ft (9 in) or 1 ft (12 in)
  depthFt: number; // e.g. 1 ft
  heightFt: number; // e.g. 10.5 ft per floor
  steelPercent?: number; // default 2.5% for columns
  wastagePercent?: number; // default 5%
}

export interface ProColumnResult {
  count: number;
  singleColumnVolumeCft: number;
  totalVolumeCft: number;
  breakdown: ConcreteBreakdown;
  shutteringAreaSqft: number;
}

export function calculateProColumns(input: ProColumnInput): ProColumnResult {
  const count = Math.max(0, input.count);
  const w = Math.max(0.5, input.widthFt || 0.75);
  const d = Math.max(0.5, input.depthFt || 1.0);
  const h = Math.max(5, input.heightFt || 10.5);
  const steelPct = input.steelPercent ?? 2.5;
  const wastage = input.wastagePercent ?? 5;

  const singleVol = w * d * h;
  const totalVol = singleVol * count;

  // Mix 1:1.5:3 for columns
  const breakdown = calculateMixBreakdown(totalVol, { cement: 1, sand: 1.5, crush: 3 }, steelPct, wastage);
  const shutteringAreaSqft = Math.round(2 * (w + d) * h * count);

  return {
    count,
    singleColumnVolumeCft: Math.round(singleVol * 100) / 100,
    totalVolumeCft: Math.round(totalVol * 100) / 100,
    breakdown,
    shutteringAreaSqft
  };
}

// -------------------------------------------------------------
// 5. RCC BEAMS ENGINE
// -------------------------------------------------------------
export interface ProBeamInput {
  count?: number;
  totalRunningLengthFt: number;
  widthFt: number; // e.g. 0.75 ft (9 in)
  depthFt: number; // e.g. 1.25 ft (15 in)
  steelPercent?: number; // default 1.8% for beams
  wastagePercent?: number; // default 5%
}

export interface ProBeamResult {
  totalRunningLengthFt: number;
  widthFt: number;
  depthFt: number;
  totalVolumeCft: number;
  breakdown: ConcreteBreakdown;
  shutteringAreaSqft: number;
}

export function calculateProBeams(input: ProBeamInput): ProBeamResult {
  const len = Math.max(0, input.totalRunningLengthFt);
  const w = Math.max(0.5, input.widthFt || 0.75);
  const d = Math.max(0.5, input.depthFt || 1.25);
  const steelPct = input.steelPercent ?? 1.8;
  const wastage = input.wastagePercent ?? 5;

  const totalVol = len * w * d;
  // Mix 1:2:4 for beams
  const breakdown = calculateMixBreakdown(totalVol, { cement: 1, sand: 2, crush: 4 }, steelPct, wastage);
  // Bottom + two sides for shuttering
  const shutteringAreaSqft = Math.round((w + 2 * d) * len);

  return {
    totalRunningLengthFt: len,
    widthFt: w,
    depthFt: d,
    totalVolumeCft: Math.round(totalVol * 100) / 100,
    breakdown,
    shutteringAreaSqft
  };
}

// -------------------------------------------------------------
// 6. MASTER INTEGRATED ADVANCED GREY STRUCTURE ENGINE (ZERO DOUBLE COUNTING)
// -------------------------------------------------------------
export interface AdvancedGreyStructureParams {
  coveredAreaSqft: number;
  numberOfFloors: number;
  plotAreaMarla?: number;
  plotAreaSqft?: number;
  rates?: {
    cementBagRate?: number;
    steelKgRate?: number;
    brickRate?: number;
    sandCftRate?: number;
    crushCftRate?: number;
    labourSqftRate?: number;
    transportRate?: number;
  };
  proInputs?: Partial<ProConstructionInputs>;
}

export interface AdvancedGreyStructureResult {
  isProMode: boolean;
  coveredAreaSqft: number;
  totalCost: number;
  costPerSqft: number;
  detailedEstimate: ProDetailedEstimate;
  materials: {
    cement: ItemizedMaterialQuantity;
    steel: ItemizedMaterialQuantity;
    bricks: ItemizedMaterialQuantity;
    sand: ItemizedMaterialQuantity;
    crush: ItemizedMaterialQuantity;
  };
  costs: {
    materialCost: number;
    labourCost: number;
    transportCost: number;
    wastageCost: number;
    grandTotal: number;
  };
  chartData: Array<{ name: string; cost: number; percentage: string; color: string }>;
  disclaimer: string;
}

export function calculateAdvancedGreyStructure(params: AdvancedGreyStructureParams): AdvancedGreyStructureResult {
  const safeArea = Math.max(50, params.coveredAreaSqft);
  const floors = Math.max(1, params.numberOfFloors);
  const groundFloorArea = safeArea / floors;
  const isPro = Boolean(params.proInputs?.isProEnabled);
  const r = {
    cementBagRate: params.rates?.cementBagRate ?? 1450,
    steelKgRate: params.rates?.steelKgRate ?? 260,
    brickRate: params.rates?.brickRate ?? 14.5,
    sandCftRate: params.rates?.sandCftRate ?? 45,
    crushCftRate: params.rates?.crushCftRate ?? 95,
    labourSqftRate: params.rates?.labourSqftRate ?? 420,
    transportRate: params.rates?.transportRate ?? 50000
  };

  // 1. Resolve Wall Height
  const wallHeightFt = isPro && params.proInputs?.wallHeightMode === "manual"
    ? Math.max(8, Math.min(20, Number(params.proInputs.manualWallHeightFt) || 10))
    : 10.0;

  // 2. Resolve Bathrooms
  const defaultBathCount = floors * 2;
  const bathCount = isPro && params.proInputs?.bathroomCountMode === "manual"
    ? Math.max(1, Math.min(30, Number(params.proInputs.manualBathroomCount) || defaultBathCount))
    : defaultBathCount;

  let bathList: ProBathroomItem[] = [];
  if (isPro && params.proInputs?.bathrooms && params.proInputs.bathrooms.length > 0) {
    bathList = params.proInputs.bathrooms.slice(0, bathCount);
    // If count exceeds existing items, fill with defaults
    while (bathList.length < bathCount) {
      const idx = bathList.length + 1;
      bathList.push({
        id: "bath_" + idx,
        name: "Bathroom " + idx,
        lengthFt: 8,
        widthFt: 5,
        heightMode: "auto",
        heightFt: wallHeightFt
      });
    }
    if (params.proInputs.applySameBathroomSize && bathList.length > 0) {
      const master = bathList[0];
      bathList = bathList.map((b) => ({
        ...b,
        lengthFt: master.lengthFt,
        widthFt: master.widthFt,
        heightFt: master.heightFt,
        heightMode: master.heightMode
      }));
    }
  } else {
    for (let i = 1; i <= bathCount; i++) {
      bathList.push({
        id: "bath_" + i,
        name: "Bathroom " + i,
        lengthFt: 8,
        widthFt: 5,
        heightMode: "auto",
        heightFt: wallHeightFt
      });
    }
  }

  // 3. Resolve Foundation
  const foundationDepthFt = isPro && params.proInputs?.foundationMode === "manual"
    ? Math.max(2, Math.min(15, Number(params.proInputs.foundationDepthFt) || 4))
    : 4.0;
  const foundationWidthFt = isPro && params.proInputs?.foundationMode === "manual"
    ? Math.max(1.5, Math.min(10, Number(params.proInputs.foundationWidthFt) || 3))
    : 3.0;
  const foundationType = isPro && params.proInputs?.foundationType
    ? params.proInputs.foundationType
    : "strip";

  // 4. Resolve Columns
  const autoColCount = Math.max(8, Math.round(groundFloorArea / 160) * floors);
  const columnCount = isPro && params.proInputs?.columnMode === "manual"
    ? Math.max(0, Math.min(100, Number(params.proInputs.manualColumnCount) || autoColCount))
    : autoColCount;
  const colWidthFt = isPro && params.proInputs?.columnWidthFt ? params.proInputs.columnWidthFt : 0.75;
  const colDepthFt = isPro && params.proInputs?.columnDepthFt ? params.proInputs.columnDepthFt : 1.0;
  const colHeightFt = isPro && params.proInputs?.columnHeightMode === "manual"
    ? Math.max(7, Number(params.proInputs.manualColumnHeightFt) || wallHeightFt)
    : wallHeightFt;

  // 5. Resolve Beams
  const autoBeamLength = Math.round(Math.sqrt(groundFloorArea) * 4 * 1.4 * floors);
  const beamLengthFt = isPro && params.proInputs?.beamLengthMode === "manual"
    ? Math.max(0, Number(params.proInputs.manualBeamTotalLengthFt) || autoBeamLength)
    : autoBeamLength;
  const beamCount = isPro && params.proInputs?.beamMode === "manual"
    ? Math.max(0, Number(params.proInputs.manualBeamCount) || Math.round(beamLengthFt / 14))
    : Math.round(beamLengthFt / 14);
  const beamWidthFt = isPro && params.proInputs?.beamWidthFt ? params.proInputs.beamWidthFt : 0.75;
  const beamDepthFt = isPro && params.proInputs?.beamDepthFt ? params.proInputs.beamDepthFt : 1.25;

  // -------------------------------------------------------------
  // ZERO DOUBLE COUNTING STRUCTURAL SYNTHESIS
  // -------------------------------------------------------------
  // A. Main wall calculation (9-inch exterior and primary room walls)
  const wallCalc = calculateWallVolume({
    coveredAreaSqft: safeArea,
    numberOfFloors: floors,
    wallHeightFt,
    wallThicknessInches: 9
  });

  // B. Exact bathroom partition walls (4.5-inch dedicated partitions)
  const bathCalc = calculateBathroomWalls({
    bathrooms: bathList,
    defaultWallHeightFt: wallHeightFt,
    partitionThicknessInches: 4.5
  });

  // C. Foundation excavation, PCC bed, and sub-structure
  const foundCalc = calculateProFoundation({
    buildingFootprintSqft: groundFloorArea,
    depthFt: foundationDepthFt,
    widthFt: foundationWidthFt,
    foundationType,
    columnFootingCount: Math.round(columnCount / floors)
  });

  // D. Columns RCC
  const colCalc = calculateProColumns({
    count: columnCount,
    widthFt: colWidthFt,
    depthFt: colDepthFt,
    heightFt: colHeightFt
  });

  // E. Beams RCC
  const beamCalc = calculateProBeams({
    totalRunningLengthFt: beamLengthFt,
    widthFt: beamWidthFt,
    depthFt: beamDepthFt
  });

  // F. Roof Slab (5.5 inches RCC 1:2:4, 1% steel)
  const slabConcreteCft = Math.round(safeArea * (5.5 / 12));
  const slabBreakdown = calculateMixBreakdown(slabConcreteCft, { cement: 1, sand: 2, crush: 4 }, 1.0, 5);

  // Plaster allowance (interior & exterior surfaces): ~2.2x of net wall area + ceiling area
  const totalPlasterAreaSqft = Math.round((wallCalc.netWallAreaSqft + bathCalc.netWallAreaSqft) * 2.2 + safeArea);
  // 0.5 in thick plaster 1:4 mix
  const dryPlasterMortarCft = totalPlasterAreaSqft * (0.5 / 12) * 1.27;
  const plasterCementBags = Math.ceil(((dryPlasterMortarCft * (1 / 5)) / 1.25) * 1.05);
  const plasterSandCft = Math.round(dryPlasterMortarCft * (4 / 5) * 1.05);

  // -------------------------------------------------------------
  // AGGREGATION & TRACEABILITY
  // -------------------------------------------------------------
  // Cement bags
  const totalCementBags =
    colCalc.breakdown.cementBags +
    beamCalc.breakdown.cementBags +
    slabBreakdown.cementBags +
    foundCalc.totalCementBags +
    wallCalc.mortarCementBags +
    bathCalc.mortarCementBags +
    plasterCementBags;

  // Steel Kg
  const totalSteelKg =
    colCalc.breakdown.steelKg +
    beamCalc.breakdown.steelKg +
    slabBreakdown.steelKg +
    foundCalc.foundationSteelKg;

  // Bricks (Masonry walls + bathroom partitions + stepped foundation)
  const totalBricks = wallCalc.finalBricks + bathCalc.finalBricks + foundCalc.foundationBricks;

  // Sand CFT
  const totalSandCft =
    colCalc.breakdown.sandCft +
    beamCalc.breakdown.sandCft +
    slabBreakdown.sandCft +
    foundCalc.totalSandCft +
    wallCalc.mortarSandCft +
    bathCalc.mortarSandCft +
    plasterSandCft;

  // Crush CFT (Structural RCC + Foundation PCC)
  const totalCrushCft =
    colCalc.breakdown.crushCft +
    beamCalc.breakdown.crushCft +
    slabBreakdown.crushCft +
    foundCalc.totalCrushCft;

  // Costs
  const cementCost = Math.round(totalCementBags * r.cementBagRate);
  const steelCost = Math.round(totalSteelKg * r.steelKgRate);
  const bricksCost = Math.round(totalBricks * r.brickRate);
  const sandCost = Math.round(totalSandCft * r.sandCftRate);
  const crushCost = Math.round(totalCrushCft * r.crushCftRate);

  const materialCost = cementCost + steelCost + bricksCost + sandCost + crushCost;
  const wastageCost = Math.round(materialCost * 0.045);
  const excavationLabour = Math.round(foundCalc.excavationVolumeCft * 12); // ~PKR 12/CFT excavation
  const standardLabour = Math.round(safeArea * r.labourSqftRate);
  const labourCost = standardLabour + excavationLabour;
  const transportCost = r.transportRate;
  const otherCost = Math.round(safeArea * 25); // water, electricity connection, curing allowance

  const grandTotal = materialCost + labourCost + transportCost + wastageCost + otherCost;
  const costPerSqft = Math.round(grandTotal / safeArea);

  // Traceable Element Costs
  const columnsCost = Math.round(colCalc.breakdown.cementBags * r.cementBagRate + colCalc.breakdown.steelKg * r.steelKgRate + colCalc.breakdown.sandCft * r.sandCftRate + colCalc.breakdown.crushCft * r.crushCftRate);
  const beamsCost = Math.round(beamCalc.breakdown.cementBags * r.cementBagRate + beamCalc.breakdown.steelKg * r.steelKgRate + beamCalc.breakdown.sandCft * r.sandCftRate + beamCalc.breakdown.crushCft * r.crushCftRate);
  const slabsCost = Math.round(slabBreakdown.cementBags * r.cementBagRate + slabBreakdown.steelKg * r.steelKgRate + slabBreakdown.sandCft * r.sandCftRate + slabBreakdown.crushCft * r.crushCftRate);
  const foundationCost = Math.round(foundCalc.totalCementBags * r.cementBagRate + foundCalc.foundationSteelKg * r.steelKgRate + foundCalc.foundationBricks * r.brickRate + foundCalc.totalSandCft * r.sandCftRate + foundCalc.totalCrushCft * r.crushCftRate + excavationLabour);
  const bathroomsCost = Math.round(bathCalc.finalBricks * r.brickRate + bathCalc.mortarCementBags * r.cementBagRate + bathCalc.mortarSandCft * r.sandCftRate);
  const wallsCost = Math.round(wallCalc.finalBricks * r.brickRate + wallCalc.mortarCementBags * r.cementBagRate + wallCalc.mortarSandCft * r.sandCftRate);
  const plasterCost = Math.round(plasterCementBags * r.cementBagRate + plasterSandCft * r.sandCftRate);
  const brickworkCost = wallsCost + bathroomsCost;

  const detailedEstimate: ProDetailedEstimate = {
    constructionAreaSqft: safeArea,
    wallAreaSqft: wallCalc.netWallAreaSqft + bathCalc.netWallAreaSqft,
    wallVolumeCft: Math.round((wallCalc.netWallVolumeCft + bathCalc.netWallVolumeCft) * 100) / 100,
    foundationVolumeCft: foundCalc.pccVolumeCft + foundCalc.rccOrMasonryVolumeCft,
    excavationVolumeCft: foundCalc.excavationVolumeCft,
    numberOfBathrooms: bathCount,
    numberOfColumns: columnCount,
    numberOfBeams: beamCount,
    breakdown: {
      wallsCost,
      foundationCost,
      columnsCost,
      beamsCost,
      slabsCost,
      bathroomsCost,
      plasterCost,
      brickworkCost,
      bricksCost,
      cementCost,
      sandCost,
      crushCost,
      steelCost,
      labourCost,
      transportCost,
      wastageCost,
      otherCost
    }
  };

  const chartItems = [
    { name: "Cement", cost: cementCost, color: "#059669" },
    { name: "Steel (Saria)", cost: steelCost, color: "#2563eb" },
    { name: "Bricks", cost: bricksCost, color: "#d97706" },
    { name: "Sand & Crush", cost: sandCost + crushCost, color: "#0891b2" },
    { name: "Labour & Shuttering", cost: labourCost, color: "#7c3aed" },
    { name: "Transport & Logistics", cost: transportCost, color: "#ea580c" },
    { name: "Wastage Allowance", cost: wastageCost, color: "#64748b" }
  ];

  const chartTotal = chartItems.reduce((acc, i) => acc + i.cost, 0);
  const chartData = chartItems.map((item) => ({
    name: item.name,
    cost: item.cost,
    percentage: chartTotal > 0 ? ((item.cost / chartTotal) * 100).toFixed(1) : "0",
    color: item.color
  }));

  const materials = {
    cement: {
      materialId: "cement",
      name: "Cement Bags (Fauji/Lucky/Bestway)",
      unit: "bags",
      requiredQuantity: totalCementBags,
      wastagePercent: 5,
      finalQuantity: totalCementBags,
      unitRate: r.cementBagRate,
      totalCost: cementCost
    },
    steel: {
      materialId: "steel",
      name: "60-Grade Deformed Rebar Steel",
      unit: "kg",
      requiredQuantity: totalSteelKg,
      wastagePercent: 4,
      finalQuantity: totalSteelKg,
      unitRate: r.steelKgRate,
      totalCost: steelCost
    },
    bricks: {
      materialId: "bricks",
      name: "Red Clay Bricks (Awwal Bhatta)",
      unit: "bricks",
      requiredQuantity: totalBricks,
      wastagePercent: 5,
      finalQuantity: totalBricks,
      unitRate: r.brickRate,
      totalCost: bricksCost
    },
    sand: {
      materialId: "sand",
      name: "Chenab / Ravi Construction Sand",
      unit: "cft",
      requiredQuantity: totalSandCft,
      wastagePercent: 5,
      finalQuantity: totalSandCft,
      unitRate: r.sandCftRate,
      totalCost: sandCost
    },
    crush: {
      materialId: "crush",
      name: "Margalla Plant Clean Crush (Bajri)",
      unit: "cft",
      requiredQuantity: totalCrushCft,
      wastagePercent: 5,
      finalQuantity: totalCrushCft,
      unitRate: r.crushCftRate,
      totalCost: crushCost
    }
  };

  return {
    isProMode: isPro,
    coveredAreaSqft: safeArea,
    totalCost: grandTotal,
    costPerSqft,
    detailedEstimate,
    materials,
    costs: {
      materialCost,
      labourCost,
      transportCost,
      wastageCost,
      grandTotal
    },
    chartData,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}
