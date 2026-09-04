import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";

export interface PaintRates {
  paintPerLitre: number;
  primerPerLitre?: number;
  puttyPerKg?: number;
  labourPerSqft?: number;
}

export interface PaintCalculationResult {
  netAreaSqft: number;
  paintLitres: number;
  primerLitres: number;
  puttyKg: number;
  paintCost: number;
  primerCost: number;
  puttyCost: number;
  labourCost: number;
  totalCost: number;
  costPerSqft: number;
  materials: MaterialRequirement[];
  assumptions: AssumptionRecord[];
}

export function calculatePaint(
  paintAreaSqft: number,
  coats: number = 2,
  includePrimer: boolean = true,
  includePutty: boolean = true,
  wastagePercent: number = 5,
  rates: PaintRates = { paintPerLitre: 850, primerPerLitre: 600, puttyPerKg: 45, labourPerSqft: 20 }
): PaintCalculationResult {
  if (paintAreaSqft <= 0 || coats <= 0) {
    throw new Error("Area and coats must be positive");
  }

  const wastageMultiplier = 1 + wastagePercent / 100;

  // Single coat coverage is ~240 sqft/L. For 2 coats: ~120 sqft/L.
  // Generally: Paint litres = (Area * coats / coveragePerCoat)
  const coveragePerSingleCoat = 240;
  const rawPaintLitres = (paintAreaSqft * coats) / coveragePerSingleCoat;
  const finalPaintLitres = Math.ceil(rawPaintLitres * wastageMultiplier);

  const rawPrimerLitres = includePrimer ? paintAreaSqft / CONSTRUCTION_DEFAULTS.paint.primerCoverageSqftPerLitre : 0;
  const finalPrimerLitres = Math.ceil(rawPrimerLitres * wastageMultiplier);

  const rawPuttyKg = includePutty ? paintAreaSqft / CONSTRUCTION_DEFAULTS.paint.puttyCoverageSqftPerKg : 0;
  const finalPuttyKg = Math.ceil(rawPuttyKg * wastageMultiplier);

  const paintCost = Math.round(finalPaintLitres * rates.paintPerLitre);
  const primerCost = Math.round(finalPrimerLitres * (rates.primerPerLitre ?? 0));
  const puttyCost = Math.round(finalPuttyKg * (rates.puttyPerKg ?? 0));
  const labourCost = Math.round(paintAreaSqft * (rates.labourPerSqft ?? 0));
  const totalCost = paintCost + primerCost + puttyCost + labourCost;
  const costPerSqft = paintAreaSqft > 0 ? totalCost / paintAreaSqft : 0;

  const materials: MaterialRequirement[] = [
    {
      materialId: "paint",
      materialName: `Emulsion / Matt Finish Paint (${coats} Coats)`,
      category: "paint",
      rawQuantity: Math.round(rawPaintLitres * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalPaintLitres - rawPaintLitres) * 10) / 10,
      finalQuantity: finalPaintLitres,
      unit: "litre",
      unitRate: rates.paintPerLitre,
      cost: paintCost
    }
  ];

  if (includePrimer) {
    materials.push({
      materialId: "primer",
      materialName: "Wall Sealer / Primer",
      category: "paint",
      rawQuantity: Math.round(rawPrimerLitres * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalPrimerLitres - rawPrimerLitres) * 10) / 10,
      finalQuantity: finalPrimerLitres,
      unit: "litre",
      unitRate: rates.primerPerLitre ?? 0,
      cost: primerCost
    });
  }

  if (includePutty) {
    materials.push({
      materialId: "putty",
      materialName: "Wall Putty (Base Coat)",
      category: "paint",
      rawQuantity: Math.round(rawPuttyKg * 10) / 10,
      wastagePercent,
      wastageQuantity: Math.round((finalPuttyKg - rawPuttyKg) * 10) / 10,
      finalQuantity: finalPuttyKg,
      unit: "kg",
      unitRate: rates.puttyPerKg ?? 0,
      cost: puttyCost
    });
  }

  const assumptions: AssumptionRecord[] = [
    { key: "coats", label: "Number of Coats", value: coats },
    { key: "coverage", label: "Paint Coverage", value: `${coveragePerSingleCoat} sqft / Litre per single coat` },
    { key: "primerIncluded", label: "Undercoat Primer", value: includePrimer ? "Yes" : "No" },
    { key: "puttyIncluded", label: "Wall Putty Base", value: includePutty ? "Yes" : "No" },
    { key: "wastage", label: "Application Wastage", value: `${wastagePercent}%` }
  ];

  return {
    netAreaSqft: paintAreaSqft,
    paintLitres: finalPaintLitres,
    primerLitres: finalPrimerLitres,
    puttyKg: finalPuttyKg,
    paintCost,
    primerCost,
    puttyCost,
    labourCost,
    totalCost,
    costPerSqft: Math.round(costPerSqft * 100) / 100,
    materials,
    assumptions
  };
}
