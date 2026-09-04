import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";

export interface FlooringRates {
  tilePerSqft: number;
  bondAdhesivePerBag?: number;
  labourPerSqft?: number;
}

export interface FlooringCalculationResult {
  netAreaSqft: number;
  grossAreaSqft: number;
  totalTilesCount: number;
  tileBoxCount: number;
  adhesiveBags: number;
  tilesCost: number;
  adhesiveCost: number;
  labourCost: number;
  totalCost: number;
  costPerSqft: number;
  materials: MaterialRequirement[];
  assumptions: AssumptionRecord[];
}

export function calculateFlooring(
  roomAreaSqft: number,
  tileWidthIn: number = 24, // 24" x 24" standard 60x60cm porcelain
  tileLengthIn: number = 24,
  tilesPerBox: number = 4,
  wastagePercent: number = 7,
  rates: FlooringRates = { tilePerSqft: 180, bondAdhesivePerBag: 750, labourPerSqft: 45 }
): FlooringCalculationResult {
  if (roomAreaSqft <= 0 || tileWidthIn <= 0 || tileLengthIn <= 0) {
    throw new Error("Flooring dimensions must be positive");
  }

  const singleTileAreaSqft = (tileWidthIn * tileLengthIn) / 144;
  const wastageFactor = 1 + wastagePercent / 100;
  const grossAreaSqft = roomAreaSqft * wastageFactor;

  const rawTileCount = roomAreaSqft / singleTileAreaSqft;
  const totalTilesCount = Math.ceil(rawTileCount * wastageFactor);
  const tileBoxCount = Math.ceil(totalTilesCount / tilesPerBox);

  const adhesiveBags = Math.ceil(roomAreaSqft / CONSTRUCTION_DEFAULTS.flooring.adhesiveBagCoverageSqft);

  const tilesCost = Math.round(grossAreaSqft * rates.tilePerSqft);
  const adhesiveCost = Math.round(adhesiveBags * (rates.bondAdhesivePerBag ?? 0));
  const labourCost = Math.round(roomAreaSqft * (rates.labourPerSqft ?? 0));
  const totalCost = tilesCost + adhesiveCost + labourCost;
  const costPerSqft = roomAreaSqft > 0 ? totalCost / roomAreaSqft : 0;

  const materials: MaterialRequirement[] = [
    {
      materialId: "tiles",
      materialName: `Porcelain / Ceramic Tiles (${tileWidthIn}x${tileLengthIn} in)`,
      category: "flooring",
      rawQuantity: Math.round(roomAreaSqft * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((grossAreaSqft - roomAreaSqft) * 10) / 10,
      finalQuantity: Math.round(grossAreaSqft * 10) / 10,
      unit: "sqft",
      unitRate: rates.tilePerSqft,
      cost: tilesCost
    },
    {
      materialId: "adhesive",
      materialName: "Tile Bond Adhesive (20kg Bag)",
      category: "flooring",
      rawQuantity: Math.round((roomAreaSqft / CONSTRUCTION_DEFAULTS.flooring.adhesiveBagCoverageSqft) * 10) / 10,
      wastagePercent: 0,
      wastageQuantity: 0,
      finalQuantity: adhesiveBags,
      unit: "bag",
      unitRate: rates.bondAdhesivePerBag ?? 0,
      cost: adhesiveCost
    }
  ];

  const assumptions: AssumptionRecord[] = [
    { key: "tileSize", label: "Tile Size", value: `${tileWidthIn}" × ${tileLengthIn}" (${Math.round(singleTileAreaSqft * 100) / 100} sqft/tile)` },
    { key: "boxPackaging", label: "Packaging", value: `${tilesPerBox} tiles per box (${Math.round(tilesPerBox * singleTileAreaSqft * 10) / 10} sqft/box)` },
    { key: "adhesiveCoverage", label: "Bond Coverage", value: `1 Bag per ${CONSTRUCTION_DEFAULTS.flooring.adhesiveBagCoverageSqft} sqft` },
    { key: "wastage", label: "Cutting & Border Wastage", value: `${wastagePercent}%` }
  ];

  return {
    netAreaSqft: roomAreaSqft,
    grossAreaSqft: Math.round(grossAreaSqft * 10) / 10,
    totalTilesCount,
    tileBoxCount,
    adhesiveBags,
    tilesCost,
    adhesiveCost,
    labourCost,
    totalCost,
    costPerSqft: Math.round(costPerSqft * 100) / 100,
    materials,
    assumptions
  };
}
