/**
 * BUILDCOST CONNECT — ADVANCED STRUCTURAL ELEMENTS ENGINE
 * Sections 4–10: Dedicated RCC and Brickwork element calculators
 * 
 * IMPORTANT DISCLAIMER:
 * These calculations are for Construction Estimation and planning only.
 * Rebar sizing, bar bending schedules, and structural capacities must be verified
 * by a licensed structural engineer.
 */

import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";

export const STRUCTURAL_DISCLAIMER =
  "Construction Estimation only. Structural design, rebar sizing, and bar bending schedules must be verified by a qualified structural engineer.";

export type DimensionUnit = "ft" | "inch" | "mm" | "cm" | "m";

/** Convert any dimension into feet */
export function toFeet(value: number, unit: DimensionUnit = "ft"): number {
  switch (unit) {
    case "ft":
      return value;
    case "inch":
      return value / 12;
    case "mm":
      return value / 304.8;
    case "cm":
      return value / 30.48;
    case "m":
      return value * 3.28084;
    default:
      return value;
  }
}

export interface ConcreteBreakdown {
  wetVolumeCft: number;
  dryVolumeCft: number; // wet * 1.54
  cementBags: number;
  sandCft: number;
  crushCft: number;
  steelKg: number;
  steelTons: number;
}

export function calculateMixBreakdown(
  wetVolumeCft: number,
  mixRatio: { cement: number; sand: number; crush: number } = { cement: 1, sand: 2, crush: 4 },
  steelPercent: number = 1.0, // % of concrete volume
  wastagePercent: number = 5
): ConcreteBreakdown {
  const dryFactor = CONSTRUCTION_DEFAULTS.concrete.wetToDryFactor; // 1.54
  const dryVolumeCft = wetVolumeCft * dryFactor;
  const totalParts = mixRatio.cement + mixRatio.sand + mixRatio.crush;

  const rawCementCft = (dryVolumeCft * mixRatio.cement) / totalParts;
  const cementBags = Math.ceil((rawCementCft / CONSTRUCTION_DEFAULTS.concrete.cementBagVolumeCft) * (1 + wastagePercent / 100));

  const rawSandCft = (dryVolumeCft * mixRatio.sand) / totalParts;
  const sandCft = Math.round(rawSandCft * (1 + wastagePercent / 100));

  const rawCrushCft = (dryVolumeCft * mixRatio.crush) / totalParts;
  const crushCft = Math.round(rawCrushCft * (1 + wastagePercent / 100));

  // Steel density: 7850 kg/m3 = ~222.3 kg/cft. steelPercent% of volume:
  // Empirical standard: 1.0% volume = ~2.22 kg / cft of wet concrete
  const steelKg = Math.round(wetVolumeCft * (steelPercent / 100) * 222.3 * (1 + wastagePercent / 100));
  const steelTons = Math.round((steelKg / 1000) * 100) / 100;

  return {
    wetVolumeCft: Math.round(wetVolumeCft * 100) / 100,
    dryVolumeCft: Math.round(dryVolumeCft * 100) / 100,
    cementBags,
    sandCft,
    crushCft,
    steelKg,
    steelTons
  };
}

// -------------------------------------------------------------
// SECTION 5: COLUMN CALCULATOR (Supports multiple column types)
// -------------------------------------------------------------
export interface ColumnTypeInput {
  name: string; // e.g. "Column Type A", "Type B"
  lengthInches: number; // e.g. 12 in
  widthInches: number; // e.g. 12 in
  heightFt: number; // e.g. 10.5 ft
  quantity: number; // e.g. 12
  steelPercent?: number; // default 2.5% for columns
}

export interface ColumnCalculationResult {
  columns: Array<{
    name: string;
    volumePerColumnCft: number;
    totalVolumeCft: number;
    breakdown: ConcreteBreakdown;
  }>;
  totalVolumeCft: number;
  totalCementBags: number;
  totalSandCft: number;
  totalCrushCft: number;
  totalSteelKg: number;
  totalSteelTons: number;
  disclaimer: string;
}

export function calculateColumns(
  types: ColumnTypeInput[],
  mixRatio = { cement: 1, sand: 1.5, crush: 3 }, // standard column mix 1:1.5:3
  wastagePercent = 5
): ColumnCalculationResult {
  let totalVolumeCft = 0;
  let totalCementBags = 0;
  let totalSandCft = 0;
  let totalCrushCft = 0;
  let totalSteelKg = 0;

  const columns = types.map((col) => {
    const lFt = col.lengthInches / 12;
    const wFt = col.widthInches / 12;
    const singleVol = lFt * wFt * col.heightFt;
    const colTotalVol = singleVol * col.quantity;
    const breakdown = calculateMixBreakdown(colTotalVol, mixRatio, col.steelPercent ?? 2.5, wastagePercent);

    totalVolumeCft += colTotalVol;
    totalCementBags += breakdown.cementBags;
    totalSandCft += breakdown.sandCft;
    totalCrushCft += breakdown.crushCft;
    totalSteelKg += breakdown.steelKg;

    return {
      name: col.name,
      volumePerColumnCft: Math.round(singleVol * 100) / 100,
      totalVolumeCft: Math.round(colTotalVol * 100) / 100,
      breakdown
    };
  });

  return {
    columns,
    totalVolumeCft: Math.round(totalVolumeCft * 100) / 100,
    totalCementBags,
    totalSandCft,
    totalCrushCft,
    totalSteelKg,
    totalSteelTons: Math.round((totalSteelKg / 1000) * 100) / 100,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}

// -------------------------------------------------------------
// SECTION 6: BEAM CALCULATOR
// -------------------------------------------------------------
export interface BeamInput {
  name?: string;
  lengthFt: number;
  widthInches: number; // e.g. 9 in or 12 in
  depthInches: number; // e.g. 15 in or 18 in
  quantity: number;
  steelPercent?: number; // default 1.8% for beams
}

export function calculateBeams(
  beams: BeamInput[],
  mixRatio = { cement: 1, sand: 2, crush: 4 },
  wastagePercent = 5
) {
  let totalVolumeCft = 0;
  for (const b of beams) {
    const wFt = b.widthInches / 12;
    const dFt = b.depthInches / 12;
    totalVolumeCft += b.lengthFt * wFt * dFt * b.quantity;
  }
  const breakdown = calculateMixBreakdown(totalVolumeCft, mixRatio, 1.8, wastagePercent);
  return {
    totalVolumeCft: Math.round(totalVolumeCft * 100) / 100,
    breakdown,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}

// -------------------------------------------------------------
// SECTION 7: LINTEL CALCULATOR
// -------------------------------------------------------------
export interface LintelInput {
  lengthFt: number;
  widthInches: number; // e.g. 9 in or 4.5 in
  depthInches: number; // e.g. 6 in or 9 in
  quantity: number;
}

export function calculateLintels(
  lintels: LintelInput[],
  mixRatio = { cement: 1, sand: 2, crush: 4 },
  wastagePercent = 5
) {
  let totalVolumeCft = 0;
  for (const l of lintels) {
    const wFt = l.widthInches / 12;
    const dFt = l.depthInches / 12;
    totalVolumeCft += l.lengthFt * wFt * dFt * l.quantity;
  }
  const breakdown = calculateMixBreakdown(totalVolumeCft, mixRatio, 1.2, wastagePercent);
  return {
    totalVolumeCft: Math.round(totalVolumeCft * 100) / 100,
    breakdown,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}

// -------------------------------------------------------------
// SECTION 8: ROOF SLAB CALCULATOR
// -------------------------------------------------------------
export interface SlabInput {
  lengthFt: number;
  widthFt: number;
  thicknessInches: number; // typically 5 in, 5.5 in, or 6 in
  steelPercent?: number; // typically 1.0%
}

export function calculateRoofSlab(
  slabs: SlabInput[],
  mixRatio = { cement: 1, sand: 2, crush: 4 },
  wastagePercent = 5
) {
  let totalAreaSqft = 0;
  let totalVolumeCft = 0;

  for (const s of slabs) {
    const area = s.lengthFt * s.widthFt;
    const vol = area * (s.thicknessInches / 12);
    totalAreaSqft += area;
    totalVolumeCft += vol;
  }

  const breakdown = calculateMixBreakdown(totalVolumeCft, mixRatio, 1.0, wastagePercent);

  return {
    totalAreaSqft: Math.round(totalAreaSqft),
    totalVolumeCft: Math.round(totalVolumeCft * 100) / 100,
    breakdown,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}

// -------------------------------------------------------------
// SECTION 9: BRICK MASONRY WITH OPENING DEDUCTIONS
// -------------------------------------------------------------
export interface OpeningInput {
  name: string; // e.g. "Main Door", "Standard Window"
  widthFt: number;
  heightFt: number;
  quantity: number;
}

export interface BrickMasonryInput {
  wallLengthFt: number;
  wallHeightFt: number;
  wallThicknessInches: number; // 9 in or 4.5 in
  openings?: OpeningInput[];
  brickLengthInches?: number; // 9
  brickWidthInches?: number; // 4.5
  brickHeightInches?: number; // 3
  mortarRatio?: { cement: number; sand: number }; // default 1:5
  wastagePercent?: number; // default 5%
}

export function calculateBrickMasonry(input: BrickMasonryInput) {
  const thickFt = input.wallThicknessInches / 12;
  const grossWallAreaSqft = input.wallLengthFt * input.wallHeightFt;
  const grossVolumeCft = grossWallAreaSqft * thickFt;

  let totalOpeningAreaSqft = 0;
  let totalOpeningVolumeCft = 0;

  if (input.openings && input.openings.length > 0) {
    for (const op of input.openings) {
      const opArea = op.widthFt * op.heightFt * op.quantity;
      totalOpeningAreaSqft += opArea;
      totalOpeningVolumeCft += opArea * thickFt;
    }
  }

  const netVolumeCft = Math.max(0, grossVolumeCft - totalOpeningVolumeCft);
  const netWallAreaSqft = Math.max(0, grossWallAreaSqft - totalOpeningAreaSqft);

  // Standard practical rule of thumb in Pakistan: 13.5 bricks per CFT of masonry
  const wastageFactor = 1 + (input.wastagePercent ?? 5) / 100;
  const requiredBricks = Math.round(netVolumeCft * CONSTRUCTION_DEFAULTS.brickwork.bricksPerCftStandard);
  const finalBricks = Math.ceil(requiredBricks * wastageFactor);

  // Mortar calculation: Mortar occupies ~28% of brickwork volume
  const wetMortarCft = netVolumeCft * CONSTRUCTION_DEFAULTS.brickwork.mortarPercentageOfVolume;
  const dryMortarCft = wetMortarCft * CONSTRUCTION_DEFAULTS.brickwork.mortarWetToDryFactor; // 1.27

  const ratio = input.mortarRatio ?? { cement: 1, sand: 5 };
  const parts = ratio.cement + ratio.sand;

  const rawCementCft = (dryMortarCft * ratio.cement) / parts;
  const cementBags = Math.ceil((rawCementCft / CONSTRUCTION_DEFAULTS.concrete.cementBagVolumeCft) * wastageFactor);

  const rawSandCft = (dryMortarCft * ratio.sand) / parts;
  const sandCft = Math.round(rawSandCft * wastageFactor);

  return {
    grossWallAreaSqft: Math.round(grossWallAreaSqft),
    grossVolumeCft: Math.round(grossVolumeCft * 100) / 100,
    openingDeductionAreaSqft: Math.round(totalOpeningAreaSqft),
    openingDeductionVolumeCft: Math.round(totalOpeningVolumeCft * 100) / 100,
    netWallAreaSqft: Math.round(netWallAreaSqft),
    netMasonryVolumeCft: Math.round(netVolumeCft * 100) / 100,
    requiredBricks,
    finalBricks,
    cementBags,
    sandCft,
    wastagePercent: input.wastagePercent ?? 5,
    disclaimer: "Construction estimation based on standard 9x4.5x3 inch bricks and specified mortar mix."
  };
}

// -------------------------------------------------------------
// SECTION 10: FOUNDATION CALCULATOR
// -------------------------------------------------------------
export type FoundationType = "isolated" | "strip" | "combined" | "raft";

export interface FoundationInput {
  type: FoundationType;
  lengthFt: number;
  widthFt: number;
  depthFt: number; // excavation depth
  quantity: number;
  pccThicknessInches?: number; // 3 in or 4 in lean concrete bed (1:4:8)
  rccThicknessInches?: number; // 9 in or 12 in footing pad (1:2:4)
  steelPercent?: number; // default 0.9% for footings
}

export function calculateFoundation(input: FoundationInput) {
  const excavationVolCft = input.lengthFt * input.widthFt * input.depthFt * input.quantity;

  const pccThickFt = (input.pccThicknessInches ?? 3) / 12;
  const pccVolCft = input.lengthFt * input.widthFt * pccThickFt * input.quantity;
  const pccBreakdown = calculateMixBreakdown(pccVolCft, { cement: 1, sand: 4, crush: 8 }, 0, 5);

  const rccThickFt = (input.rccThicknessInches ?? 10) / 12;
  const rccVolCft = input.lengthFt * input.widthFt * rccThickFt * input.quantity;
  const rccBreakdown = calculateMixBreakdown(rccVolCft, { cement: 1, sand: 2, crush: 4 }, input.steelPercent ?? 0.9, 5);

  // Backfilling volume = excavation volume minus concrete footprint
  const concreteDisplacedCft = pccVolCft + rccVolCft;
  const backfillingVolCft = Math.max(0, excavationVolCft - concreteDisplacedCft);

  return {
    type: input.type,
    excavationVolumeCft: Math.round(excavationVolCft),
    backfillingVolumeCft: Math.round(backfillingVolCft),
    pccVolumeCft: Math.round(pccVolCft * 100) / 100,
    pccBreakdown,
    rccVolumeCft: Math.round(rccVolCft * 100) / 100,
    rccBreakdown,
    totalCementBags: pccBreakdown.cementBags + rccBreakdown.cementBags,
    totalSandCft: pccBreakdown.sandCft + rccBreakdown.sandCft,
    totalCrushCft: pccBreakdown.crushCft + rccBreakdown.crushCft,
    totalSteelKg: rccBreakdown.steelKg,
    disclaimer: STRUCTURAL_DISCLAIMER
  };
}
