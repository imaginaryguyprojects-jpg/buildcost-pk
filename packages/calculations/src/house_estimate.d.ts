import { ConstructionQuality, CalculationBreakdown } from "@buildcost/types";
export interface HouseEstimateInput {
    plotAreaMarla: number;
    marlaSqft: number;
    coveredAreaSqft: number;
    numberOfFloors: number;
    hasBasement?: boolean;
    quality: ConstructionQuality;
    cityId: string;
    cityName: string;
    customCementRate?: number;
    customSteelRate?: number;
    customBrickRate?: number;
    customSandRate?: number;
    customCrushRate?: number;
}
export declare function calculateCompleteHouseEstimate(input: HouseEstimateInput): CalculationBreakdown;
