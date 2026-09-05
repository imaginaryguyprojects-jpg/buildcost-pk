/**
 * BuildCost Connect — Additional Dedicated Calculators & Utility Aliases
 * (Sections 13, 104 & 105)
 */

import { calculateFlooring } from "./flooring";
import { calculateColumns, calculateRoofSlab, calculateBeams, calculateLintels } from "./structural_elements";
import { calculateConcrete } from "./concrete";
import { estimateConstructionDuration } from "./labour_engine";
import { calculateFullHouseEstimate } from "./full_estimate";

// -------------------------------------------------------------
// SECTION 13: MARBLE CALCULATOR
// -------------------------------------------------------------

export interface MarbleCalculatorInput {
  areaSqft: number;
  marbleType?: string; // e.g. "Sunny Grey", "Tavera", "Badal", "Ziarat White"
  marbleRatePerSqft?: number;
  wastagePercent?: number; // 7% standard
  installationRatePerSqft?: number; // 40-60 Rs/sqft
  polishingRatePerSqft?: number; // 25-35 Rs/sqft chemical polish
}

export interface MarbleCalculatorResult {
  netAreaSqft: number;
  marbleType: string;
  wastagePercent: number;
  wastageQuantitySqft: number;
  requiredQuantitySqft: number;
  materialCost: number;
  installationCost: number;
  polishingCost: number;
  totalCost: number;
  costPerSqft: number;
}

export function calculateMarble(input: MarbleCalculatorInput): MarbleCalculatorResult {
  const {
    areaSqft,
    marbleType = "Sunny Grey (First Quality)",
    marbleRatePerSqft = 145,
    wastagePercent = 7,
    installationRatePerSqft = 45,
    polishingRatePerSqft = 30
  } = input;

  if (areaSqft <= 0) {
    throw new Error("Marble area must be positive");
  }

  const wastageQuantitySqft = Math.round((areaSqft * (wastagePercent / 100)) * 10) / 10;
  const requiredQuantitySqft = Math.round((areaSqft + wastageQuantitySqft) * 10) / 10;

  const materialCost = Math.round(requiredQuantitySqft * marbleRatePerSqft);
  const installationCost = Math.round(areaSqft * installationRatePerSqft);
  const polishingCost = Math.round(areaSqft * polishingRatePerSqft);
  const totalCost = materialCost + installationCost + polishingCost;
  const costPerSqft = Math.round((totalCost / areaSqft) * 100) / 100;

  return {
    netAreaSqft: areaSqft,
    marbleType,
    wastagePercent,
    wastageQuantitySqft,
    requiredQuantitySqft,
    materialCost,
    installationCost,
    polishingCost,
    totalCost,
    costPerSqft
  };
}

// -------------------------------------------------------------
// SECTION 104: GEOMETRY & VOLUME CALCULATOR
// -------------------------------------------------------------

export function calculateVolume(length: number, width: number, depth: number, unit: "ft" | "m" = "ft"): { volumeCft: number; volumeM3: number } {
  if (length <= 0 || width <= 0 || depth <= 0) {
    throw new Error("Dimensions must be positive");
  }

  if (unit === "m") {
    const volumeM3 = length * width * depth;
    const volumeCft = volumeM3 * 35.3147;
    return {
      volumeCft: Math.round(volumeCft * 100) / 100,
      volumeM3: Math.round(volumeM3 * 100) / 100
    };
  }

  const volumeCft = length * width * depth;
  const volumeM3 = volumeCft / 35.3147;
  return {
    volumeCft: Math.round(volumeCft * 100) / 100,
    volumeM3: Math.round(volumeM3 * 100) / 100
  };
}

// -------------------------------------------------------------
// SECTION 104: CEMENT, SAND & CRUSH STANDALONE CALCULATOR
// -------------------------------------------------------------

export function calculateCement(dryVolumeCft: number, mixRatio: any = "1:2:4"): { cementCft: number; cementBags: number } {
  const concrete = calculateConcrete(1, 1, dryVolumeCft / 1.54, mixRatio, 0);
  return {
    cementCft: Math.round(concrete.cementBags * 1.25 * 10) / 10,
    cementBags: concrete.cementBags
  };
}

export function calculateSand(dryVolumeCft: number, mixRatio: any = "1:2:4"): { sandCft: number } {
  const concrete = calculateConcrete(1, 1, dryVolumeCft / 1.54, mixRatio, 0);
  return { sandCft: concrete.sandCft };
}

export function calculateCrush(dryVolumeCft: number, mixRatio: any = "1:2:4"): { crushCft: number } {
  const concrete = calculateConcrete(1, 1, dryVolumeCft / 1.54, mixRatio, 0);
  return { crushCft: concrete.crushCft };
}

// -------------------------------------------------------------
// SECTION 104: BUDGET VARIANCE & PROGRESS CALCULATORS
// -------------------------------------------------------------

export interface BudgetVarianceResult {
  totalBudget: number;
  actualCost: number;
  estimatedCost: number;
  remainingBudget: number;
  variancePkr: number;
  variancePercent: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  health: "HEALTHY" | "WARNING" | "CRITICAL";
}

export function calculateBudgetVariance(budget: number, actual: number, estimated?: number): BudgetVarianceResult {
  const est = estimated || budget;
  const remainingBudget = Math.round(budget - actual);
  const variancePkr = Math.round(actual - est);
  const variancePercent = est > 0 ? Number(((variancePkr / est) * 100).toFixed(2)) : 0;
  const utilizationPercent = budget > 0 ? Number(((actual / budget) * 100).toFixed(1)) : 0;
  const isOverBudget = actual > budget;

  let health: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (isOverBudget) {
    health = "CRITICAL";
  } else if (utilizationPercent > 85) {
    health = "WARNING";
  }

  return {
    totalBudget: budget,
    actualCost: actual,
    estimatedCost: est,
    remainingBudget,
    variancePkr,
    variancePercent,
    utilizationPercent,
    isOverBudget,
    health
  };
}

export interface ProgressStageInput {
  name: string;
  progressPercent: number;
  weight?: number;
}

export interface ProgressCalculationResult {
  overallProgressPercent: number;
  completedStagesCount: number;
  inProgressStagesCount: number;
  pendingStagesCount: number;
  totalStagesCount: number;
}

export function calculateProgress(stages: ProgressStageInput[]): ProgressCalculationResult {
  if (!stages || stages.length === 0) {
    return {
      overallProgressPercent: 0,
      completedStagesCount: 0,
      inProgressStagesCount: 0,
      pendingStagesCount: 0,
      totalStagesCount: 0
    };
  }

  let totalWeight = 0;
  let weightedProgressSum = 0;
  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  for (const stg of stages) {
    const weight = stg.weight || 1;
    totalWeight += weight;
    weightedProgressSum += Math.min(100, Math.max(0, stg.progressPercent)) * weight;

    if (stg.progressPercent >= 100) {
      completed++;
    } else if (stg.progressPercent > 0) {
      inProgress++;
    } else {
      pending++;
    }
  }

  const overallProgressPercent = totalWeight > 0 ? Math.round(weightedProgressSum / totalWeight) : 0;

  return {
    overallProgressPercent,
    completedStagesCount: completed,
    inProgressStagesCount: inProgress,
    pendingStagesCount: pending,
    totalStagesCount: stages.length
  };
}

// -------------------------------------------------------------
// SECTION 104 CONVENIENCE ALIASES
// -------------------------------------------------------------

export const calculateTile = calculateFlooring;
export const calculateColumn = calculateColumns;
export const calculateBeam = calculateBeams;
export const calculateLintel = calculateLintels;
export const calculateSlab = calculateRoofSlab;
export const calculateDuration = estimateConstructionDuration;
export const calculateProjectCost = calculateFullHouseEstimate;
