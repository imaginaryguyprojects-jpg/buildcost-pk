/**
 * BuildCost Connect — What-If Price Simulator Engine (Section 42)
 * 
 * Simulates project cost impact when key material or labour market rates
 * fluctuate by user-defined percentages (e.g., Steel +10%, Cement +5%, Labour +15%).
 */

export interface MaterialCostComponent {
  name: string; // e.g., "Steel", "Cement", "Bricks", "Labour", "Tiles", "Sand", "Crush"
  originalCost: number;
  percentageChange: number; // e.g. +10, -5, +15
}

export interface WhatIfInput {
  baseTotalCost: number;
  components: MaterialCostComponent[];
}

export interface WhatIfComponentResult {
  name: string;
  originalCost: number;
  percentageChange: number;
  newCost: number;
  costDifference: number;
}

export interface WhatIfResult {
  originalTotalCost: number;
  newTotalCost: number;
  totalCostDifference: number;
  percentageDifference: number;
  components: WhatIfComponentResult[];
}

export function calculateWhatIfScenario(input: WhatIfInput): WhatIfResult {
  const { baseTotalCost, components } = input;

  let totalDelta = 0;
  const componentResults: WhatIfComponentResult[] = components.map((comp) => {
    const delta = comp.originalCost * (comp.percentageChange / 100);
    const newCost = Math.round(comp.originalCost + delta);
    totalDelta += delta;

    return {
      name: comp.name,
      originalCost: comp.originalCost,
      percentageChange: comp.percentageChange,
      newCost,
      costDifference: Math.round(delta)
    };
  });

  const newTotalCost = Math.round(baseTotalCost + totalDelta);
  const totalCostDifference = Math.round(totalDelta);
  const percentageDifference = baseTotalCost > 0
    ? Number(((totalCostDifference / baseTotalCost) * 100).toFixed(2))
    : 0;

  return {
    originalTotalCost: baseTotalCost,
    newTotalCost,
    totalCostDifference,
    percentageDifference,
    components: componentResults
  };
}
