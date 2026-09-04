import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";
export interface FlooringRates {
    tilePerSqft: number;
    bondAdhesivePerBag?: number;
    labourPerSqft?: number;
}
export interface FlooringCalculationResult {
    netAreaSqft: number;
    grossAreaSqft: number;
    totalTilesCount: number;
    tileBoxCount: number;
    adhesiveBags: number;
    tilesCost: number;
    adhesiveCost: number;
    labourCost: number;
    totalCost: number;
    costPerSqft: number;
    materials: MaterialRequirement[];
    assumptions: AssumptionRecord[];
}
export declare function calculateFlooring(roomAreaSqft: number, tileWidthIn?: number, // 24" x 24" standard 60x60cm porcelain
tileLengthIn?: number, tilesPerBox?: number, wastagePercent?: number, rates?: FlooringRates): FlooringCalculationResult;
