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
export declare function calculatePaint(paintAreaSqft: number, coats?: number, includePrimer?: boolean, includePutty?: boolean, wastagePercent?: number, rates?: PaintRates): PaintCalculationResult;
