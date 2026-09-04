import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";
export interface SteelDirectCalculationResult {
    weightKg: number;
    weightTons: number;
    wastageWeightKg: number;
    finalWeightKg: number;
    finalWeightTons: number;
    cost: number;
    materials: MaterialRequirement[];
    assumptions: AssumptionRecord[];
    disclaimer: string;
}
/**
 * Calculates standard weight of rebar using D^2 / 162.2 (kg/m)
 */
export declare function calculateSteelWeight(diameterMm: number, lengthMeters: number, numberOfBars?: number, wastagePercent?: number, ratePerKg?: number): SteelDirectCalculationResult;
export type StructuralMemberType = "slab" | "beam" | "column" | "footing";
/**
 * Empirical rule-of-thumb structural steel estimation based on concrete volume
 */
export declare function estimateStructuralSteel(concreteVolumeCft: number, memberType?: StructuralMemberType, wastagePercent?: number, ratePerKg?: number): SteelDirectCalculationResult;
