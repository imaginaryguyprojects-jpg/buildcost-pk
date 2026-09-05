/**
 * BUILDCOST CONNECT — FULL HOUSE ESTIMATE & PROGRESSIVE ENGINE
 * Section 18 & 52–58: Grey Structure + Finishing + Labour + Contingency combined
 */

import { calculateGreyStructureEstimate, GreyStructureSummary } from "./grey_structure";
import { calculateCompleteFinishing, CompleteFinishingSummary } from "./finishing_estimator";

export type ConstructionQuality = "economy" | "standard" | "premium" | "luxury";

export interface FullEstimateInput {
  plotAreaMarla: number;
  marlaSqft?: number; // 225, 250, 272.25
  coveredAreaSqft: number;
  numberOfFloors: number;
  hasBasement?: boolean;
  quality?: ConstructionQuality;
  cityId?: string;
  cityName?: string;
  rates?: {
    cementBagRate?: number;
    sandCftRate?: number;
    crushCftRate?: number;
    brickRate?: number;
    steelKgRate?: number;
    greyLabourSqftRate?: number;
  };
}

export interface FloorCostBreakdown {
  floorNumber: number;
  name: string;
  coveredAreaSqft: number;
  greyCost: number;
  finishingCost: number;
  totalCost: number;
  costPerSqft: number;
}

export interface FullProjectEstimateResult {
  coveredAreaSqft: number;
  quality: ConstructionQuality;
  greyStructure: GreyStructureSummary;
  finishing: CompleteFinishingSummary;
  summary: {
    greyStructureCost: number;
    finishingCost: number;
    labourCost: number;
    transportCost: number;
    otherCost: number;
    contingencyCost: number;
    totalProjectEstimate: number;
    costPerSqft: number;
    costPerMarla: number;
  };
  percentages: {
    greyStructurePercent: number;
    finishingPercent: number;
    labourPercent: number;
    otherAndContingencyPercent: number;
  };
  floorBreakdown: FloorCostBreakdown[];
  progressiveLifecycle: {
    stage: string;
    description: string;
    cost: number;
    progressPercentage: number;
  }[];
}

export function calculateFullHouseEstimate(input: FullEstimateInput): FullProjectEstimateResult {
  const area = input.coveredAreaSqft;
  const floors = Math.max(1, input.numberOfFloors + (input.hasBasement ? 1 : 0));
  const quality = input.quality ?? "standard";

  // 1. Calculate Grey Structure
  const grey = calculateGreyStructureEstimate({
    coveredAreaSqft: area,
    numberOfFloors: floors,
    rates: input.rates
  });

  // 2. Calculate Finishing
  const finishing = calculateCompleteFinishing({
    coveredAreaSqft: area,
    numberOfFloors: floors,
    quality
  });

  // Combined totals
  const greyCost = grey.costs.materialCost;
  const finishingCost = finishing.totalMaterialCost;
  const combinedLabour = grey.costs.labourCost + finishing.totalLabourCost;
  const transportCost = grey.costs.transportCost;
  const otherCost = Math.round(area * 45); // site water, electricity, security, municipal fees

  const subtotal = greyCost + finishingCost + combinedLabour + transportCost + otherCost;
  const contingencyCost = Math.round(subtotal * 0.05); // 5% standard civil contingency
  const totalProjectEstimate = subtotal + contingencyCost;
  const costPerSqft = Math.round(totalProjectEstimate / (area || 1));
  const costPerMarla = Math.round(totalProjectEstimate / (input.plotAreaMarla || 5));

  // Percentages
  const greyStructurePercent = Math.round((greyCost / totalProjectEstimate) * 100);
  const finishingPercent = Math.round((finishingCost / totalProjectEstimate) * 100);
  const labourPercent = Math.round((combinedLabour / totalProjectEstimate) * 100);
  const otherAndContingencyPercent = 100 - (greyStructurePercent + finishingPercent + labourPercent);

  // Floor-by-floor allocation
  const areaPerFloor = Math.round(area / floors);
  const floorBreakdown: FloorCostBreakdown[] = [];

  for (let i = 0; i < floors; i++) {
    const isBasement = input.hasBasement && i === 0;
    const floorNumber = isBasement ? -1 : input.hasBasement ? i : i + 1;
    const name = isBasement
      ? "Basement Floor"
      : floorNumber === 1
      ? "Ground Floor"
      : floorNumber === 2
      ? "First Floor"
      : "Second Floor";

    // Basement has higher excavation/waterproofing cost factor (1.25x)
    const factor = isBasement ? 1.25 : 1.0;
    const fGrey = Math.round((greyCost / floors) * factor);
    const fFin = Math.round((finishingCost / floors) * (isBasement ? 0.9 : 1.0));
    const fLabour = Math.round((combinedLabour / floors) * factor);
    const fTotal = fGrey + fFin + fLabour;

    floorBreakdown.push({
      floorNumber,
      name,
      coveredAreaSqft: areaPerFloor,
      greyCost: fGrey,
      finishingCost: fFin,
      totalCost: fTotal,
      costPerSqft: Math.round(fTotal / (areaPerFloor || 1))
    });
  }

  // Progressive lifecycle stages per Prompt header
  const progressiveLifecycle = [
    { stage: "PLOT & ARCHITECTURE", description: "Soil test, boundary demarcation, architectural & structural drawings", cost: Math.round(area * 40), progressPercentage: 100 },
    { stage: "GREY STRUCTURE", description: "Excavation, RCC footings, columns, brickwork, beams, and roof slabs", cost: greyCost + grey.costs.labourCost, progressPercentage: 70 },
    { stage: "FINISHING WORKS", description: "Plaster, tiles, marble, woodwork, paint, electrical, plumbing & sanitary", cost: finishingCost + finishing.totalLabourCost, progressPercentage: 20 },
    { stage: "LABOUR EXPENSES", description: "Daily wages, contractor milestones & specialist sub-trades", cost: combinedLabour, progressPercentage: 45 },
    { stage: "MATERIAL PURCHASES", description: "Cement, sand, crush, bricks, steel, tiles, fittings & hardware", cost: greyCost + finishingCost, progressPercentage: 60 },
    { stage: "BUDGET & CONTINGENCY", description: "Unforeseen site variations, price escalations & logistics", cost: contingencyCost, progressPercentage: 15 }
  ];

  return {
    coveredAreaSqft: area,
    quality,
    greyStructure: grey,
    finishing,
    summary: {
      greyStructureCost: greyCost,
      finishingCost,
      labourCost: combinedLabour,
      transportCost,
      otherCost,
      contingencyCost,
      totalProjectEstimate,
      costPerSqft,
      costPerMarla
    },
    percentages: {
      greyStructurePercent,
      finishingPercent,
      labourPercent,
      otherAndContingencyPercent
    },
    floorBreakdown,
    progressiveLifecycle
  };
}
