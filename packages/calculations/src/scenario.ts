import { CalculationBreakdown } from "@buildcost/types";

export interface ScenarioAdjustments {
  cementPct?: number; // e.g. +5% or -10%
  steelPct?: number; // e.g. +10%
  bricksPct?: number; // e.g. -3%
  labourPct?: number; // e.g. +8%
  finishingPct?: number; // e.g. +5%
  transportPct?: number;
}

export interface ScenarioSimulationResult {
  originalTotal: number;
  baselineTotal: number;
  scenarioTotal: number;
  deltaAmount: number;
  deltaPercentage: number;
  originalCostPerSqft: number;
  scenarioCostPerSqft: number;
  breakdown: {
    originalMaterials: number;
    scenarioMaterials: number;
    originalLabour: number;
    scenarioLabour: number;
    originalTransport: number;
    scenarioTransport: number;
    contingency: number;
  };
}

export function simulatePriceScenario(
  base: CalculationBreakdown,
  adjustments: ScenarioAdjustments
): ScenarioSimulationResult {
  let scenarioMaterials = 0;

  const cementAdj = adjustments.cementPct ?? 0;
  const steelAdj = adjustments.steelPct ?? 0;
  const bricksAdj = adjustments.bricksPct ?? 0;
  const finishingAdj = adjustments.finishingPct ?? 0;

  for (const mat of base.materials) {
    let adjustmentFactor = 1.0;
    if (mat.materialId === "cement") adjustmentFactor += cementAdj / 100;
    else if (mat.materialId === "steel") adjustmentFactor += steelAdj / 100;
    else if (mat.materialId === "bricks") adjustmentFactor += bricksAdj / 100;
    else if (mat.category === "finishing") adjustmentFactor += finishingAdj / 100;

    scenarioMaterials += mat.cost * adjustmentFactor;
  }

  const labourFactor = 1.0 + (adjustments.labourPct ?? 0) / 100;
  const scenarioLabour = Math.round(base.labourCost * labourFactor);

  const transportFactor = 1.0 + (adjustments.transportPct ?? 0) / 100;
  const scenarioTransport = Math.round(base.transportCost * transportFactor);

  const subtotal = scenarioMaterials + scenarioLabour + scenarioTransport + base.equipmentCost + base.otherCost;
  const scenarioContingency = Math.round(subtotal * 0.05);
  const scenarioTotal = Math.round(subtotal + scenarioContingency);

  const deltaAmount = scenarioTotal - base.grandTotal;
  const deltaPercentage = base.grandTotal > 0 ? (deltaAmount / base.grandTotal) * 100 : 0;

  const scenarioCostPerSqft = base.totalCoveredAreaSqft > 0 ? Math.round(scenarioTotal / base.totalCoveredAreaSqft) : 0;

  return {
    originalTotal: base.grandTotal,
    baselineTotal: base.grandTotal,
    scenarioTotal,
    deltaAmount,
    deltaPercentage: Math.round(deltaPercentage * 100) / 100,
    originalCostPerSqft: base.costPerSqft,
    scenarioCostPerSqft,
    breakdown: {
      originalMaterials: base.materialsCost,
      scenarioMaterials: Math.round(scenarioMaterials),
      originalLabour: base.labourCost,
      scenarioLabour,
      originalTransport: base.transportCost,
      scenarioTransport,
      contingency: scenarioContingency
    }
  };
}
