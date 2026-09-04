import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";
export interface BrickworkRates {
    brickPerThousand: number;
    cementPerBag: number;
    sandPerCft: number;
    masonPerSqft?: number;
}
export interface BrickworkCalculationResult {
    grossVolumeCft: number;
    deductionVolumeCft: number;
    netMasonryCft: number;
    bricksCount: number;
    mortarDryVolumeCft: number;
    cementBags: number;
    sandCft: number;
    bricksCost: number;
    cementCost: number;
    sandCost: number;
    labourCost: number;
    totalCost: number;
    materials: MaterialRequirement[];
    assumptions: AssumptionRecord[];
}
export declare function calculateBrickwork(wallLengthFt: number, wallHeightFt: number, wallThicknessIn?: number, openingsSqft?: number, mortarMixKey?: string, wastagePercent?: number, rates?: BrickworkRates): BrickworkCalculationResult;
