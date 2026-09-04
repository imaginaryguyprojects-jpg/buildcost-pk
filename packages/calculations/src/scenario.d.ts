import { CalculationBreakdown } from "@buildcost/types";
export interface ScenarioAdjustments {
    cementPct: number;
    steelPct: number;
    bricksPct: number;
    labourPct: number;
    finishingPct: number;
    transportPct?: number;
}
export interface ScenarioSimulationResult {
    originalTotal: number;
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
export declare function simulatePriceScenario(base: CalculationBreakdown, adjustments: ScenarioAdjustments): ScenarioSimulationResult;
