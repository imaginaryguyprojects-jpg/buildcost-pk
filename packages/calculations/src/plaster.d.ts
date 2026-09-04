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
export declare function calculatePlaster(wallAreaSqft: number, openingsSqft?: number, thicknessInches?: number, mixRatioKey?: string, wastagePercent?: number, rates?: PlasterRates): PlasterCalculationResult;
