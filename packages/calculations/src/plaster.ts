import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";

export interface PlasterRates {
  cementPerBag: number;
  sandPerCft: number;
  labourPerSqft?: number;
}

export interface PlasterCalculationResult {
  netAreaSqft: number;
  wetVolumeCft: number;
  dryVolumeCft: number;
  cementBags: number;
  sandCft: number;
  cementCost: number;
  sandCost: number;
  labourCost: number;
  totalCost: number;
  costPerSqft: number;
  materials: MaterialRequirement[];
  assumptions: AssumptionRecord[];
}

export function calculatePlaster(
  wallAreaSqft: number,
  openingsSqft: number = 0,
  thicknessInches: number = 0.5,
  mixRatioKey: string = "1:4",
  wastagePercent: number = 7,
  rates: PlasterRates = { cementPerBag: 1450, sandPerCft: 45, labourPerSqft: 25 }
): PlasterCalculationResult {
  if (wallAreaSqft <= 0 || thicknessInches <= 0) {
    throw new Error("Plaster area and thickness must be positive");
  }

  const netAreaSqft = Math.max(0, wallAreaSqft - openingsSqft);
  const thicknessFt = thicknessInches / 12;
  const wetVolumeCft = netAreaSqft * thicknessFt;
  const dryFactor = CONSTRUCTION_DEFAULTS.plaster.wetToDryFactor; // 1.27
  const dryVolumeCft = wetVolumeCft * dryFactor;

  const mix =
    CONSTRUCTION_DEFAULTS.plaster.mixRatios[mixRatioKey as "1:3" | "1:4" | "1:5"] ||
    CONSTRUCTION_DEFAULTS.plaster.mixRatios["1:4"];
  const totalParts = mix.cement + mix.sand;

  const rawCementCft = dryVolumeCft * (mix.cement / totalParts);
  const rawCementBags = rawCementCft / CONSTRUCTION_DEFAULTS.concrete.cementBagVolumeCft;
  const rawSandCft = dryVolumeCft * (mix.sand / totalParts);

  const wastageMultiplier = 1 + wastagePercent / 100;
  const finalCementBags = Math.ceil(rawCementBags * wastageMultiplier);
  const finalSandCft = Math.round(rawSandCft * wastageMultiplier * 10) / 10;

  const cementCost = finalCementBags * rates.cementPerBag;
  const sandCost = finalSandCft * rates.sandPerCft;
  const labourCost = netAreaSqft * (rates.labourPerSqft ?? 0);
  const totalCost = cementCost + sandCost + labourCost;
  const costPerSqft = netAreaSqft > 0 ? totalCost / netAreaSqft : 0;

  const materials: MaterialRequirement[] = [
    {
      materialId: "cement",
      materialName: "Portland Cement (Plaster)",
      category: "plaster",
      rawQuantity: Math.round(rawCementBags * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalCementBags - rawCementBags) * 10) / 10,
      finalQuantity: finalCementBags,
      unit: "bag",
      unitRate: rates.cementPerBag,
      cost: cementCost
    },
    {
      materialId: "sand",
      materialName: "Fine Sieved Sand",
      category: "plaster",
      rawQuantity: Math.round(rawSandCft * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalSandCft - rawSandCft) * 10) / 10,
      finalQuantity: finalSandCft,
      unit: "cft",
      unitRate: rates.sandPerCft,
      cost: sandCost
    }
  ];

  const assumptions: AssumptionRecord[] = [
    { key: "thickness", label: "Plaster Thickness", value: `${thicknessInches} inches (${Math.round(thicknessInches * 25.4)} mm)` },
    { key: "mixRatio", label: "Mortar Ratio", value: mixRatioKey, formulaDescription: mix.name },
    { key: "dryFactor", label: "Dry Volume Factor", value: dryFactor, formulaDescription: "Dry Volume = Wet Volume × 1.27" },
    { key: "wastage", label: "Wastage Allowance", value: `${wastagePercent}%` }
  ];

  return {
    netAreaSqft: Math.round(netAreaSqft * 100) / 100,
    wetVolumeCft: Math.round(wetVolumeCft * 100) / 100,
    dryVolumeCft: Math.round(dryVolumeCft * 100) / 100,
    cementBags: finalCementBags,
    sandCft: finalSandCft,
    cementCost: Math.round(cementCost),
    sandCost: Math.round(sandCost),
    labourCost: Math.round(labourCost),
    totalCost: Math.round(totalCost),
    costPerSqft: Math.round(costPerSqft * 100) / 100,
    materials,
    assumptions
  };
}
