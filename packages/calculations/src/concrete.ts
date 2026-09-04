import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";

export interface ConcreteRates {
  cementPerBag: number;
  sandPerCft: number;
  crushPerCft: number;
  labourPerCft?: number;
}

export interface ConcreteCalculationResult {
  wetVolumeCft: number;
  dryVolumeCft: number;
  cementBags: number;
  sandCft: number;
  crushCft: number;
  cementCost: number;
  sandCost: number;
  crushCost: number;
  labourCost: number;
  totalCost: number;
  costPerCft: number;
  materials: MaterialRequirement[];
  assumptions: AssumptionRecord[];
}

export function calculateConcrete(
  lengthFt: number,
  widthFt: number,
  depthFt: number,
  mixRatioKey: string = "1:2:4",
  wastagePercent: number = 5,
  rates: ConcreteRates = { cementPerBag: 1450, sandPerCft: 45, crushPerCft: 65, labourPerCft: 35 }
): ConcreteCalculationResult {
  if (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0) {
    throw new Error("Concrete dimensions must be positive numbers");
  }

  const mix = CONSTRUCTION_DEFAULTS.concrete.mixRatios[mixRatioKey];
  if (!mix) {
    throw new Error(`Invalid concrete mix ratio: ${mixRatioKey}`);
  }

  const wetVolumeCft = lengthFt * widthFt * depthFt;
  const dryFactor = CONSTRUCTION_DEFAULTS.concrete.wetToDryFactor; // 1.54
  const dryVolumeCft = wetVolumeCft * dryFactor;

  const totalParts = mix.cement + mix.sand + mix.crush;

  // Raw quantities
  const rawCementCft = dryVolumeCft * (mix.cement / totalParts);
  const rawCementBags = rawCementCft / CONSTRUCTION_DEFAULTS.concrete.cementBagVolumeCft; // 1.25 cft/bag
  const rawSandCft = dryVolumeCft * (mix.sand / totalParts);
  const rawCrushCft = dryVolumeCft * (mix.crush / totalParts);

  // With wastage applied
  const wastageFactor = 1 + wastagePercent / 100;
  const finalCementBags = Math.ceil(rawCementBags * wastageFactor);
  const finalSandCft = Math.round(rawSandCft * wastageFactor * 10) / 10;
  const finalCrushCft = Math.round(rawCrushCft * wastageFactor * 10) / 10;

  const cementCost = finalCementBags * rates.cementPerBag;
  const sandCost = finalSandCft * rates.sandPerCft;
  const crushCost = finalCrushCft * rates.crushPerCft;
  const labourCost = wetVolumeCft * (rates.labourPerCft ?? 0);
  const totalCost = cementCost + sandCost + crushCost + labourCost;
  const costPerCft = wetVolumeCft > 0 ? totalCost / wetVolumeCft : 0;

  const materials: MaterialRequirement[] = [
    {
      materialId: "cement",
      materialName: "Portland Cement (50kg Bag)",
      category: "civil",
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
      materialName: "Chenab/Ravi Sand",
      category: "civil",
      rawQuantity: Math.round(rawSandCft * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalSandCft - rawSandCft) * 10) / 10,
      finalQuantity: finalSandCft,
      unit: "cft",
      unitRate: rates.sandPerCft,
      cost: sandCost
    },
    {
      materialId: "crush",
      materialName: "Margalla/Sargodha Crush (Bajri)",
      category: "civil",
      rawQuantity: Math.round(rawCrushCft * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalCrushCft - rawCrushCft) * 10) / 10,
      finalQuantity: finalCrushCft,
      unit: "cft",
      unitRate: rates.crushPerCft,
      cost: crushCost
    }
  ];

  const assumptions: AssumptionRecord[] = [
    { key: "mixRatio", label: "Mix Ratio", value: mixRatioKey, formulaDescription: mix.name },
    { key: "dryVolumeFactor", label: "Dry Volume Shrinkage Factor", value: dryFactor, formulaDescription: "Dry Volume = Wet Volume × 1.54" },
    { key: "bagVolume", label: "Cement Bag Volume", value: "1.25 CFT (50 kg)", formulaDescription: "1 Bag = 1.25 CFT" },
    { key: "wastage", label: "Wastage Allowance", value: `${wastagePercent}%` }
  ];

  return {
    wetVolumeCft: Math.round(wetVolumeCft * 100) / 100,
    dryVolumeCft: Math.round(dryVolumeCft * 100) / 100,
    cementBags: finalCementBags,
    sandCft: finalSandCft,
    crushCft: finalCrushCft,
    cementCost,
    sandCost,
    crushCost,
    labourCost,
    totalCost,
    costPerCft: Math.round(costPerCft * 100) / 100,
    materials,
    assumptions
  };
}
