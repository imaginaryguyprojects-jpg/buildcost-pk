import { MaterialRequirement, AssumptionRecord } from "@buildcost/types";
export interface ConcreteRates {
    cementPerBag: number;
    sandPerCft: number;
    crushPerCft: number;
    labourPerCft?: number;
}
export interface ConcreteCalculationResult {
    wetVolumeCft: number;
    dryVolumeCft: number;
    cementBags: number;
    sandCft: number;
    crushCft: number;
    cementCost: number;
    sandCost: number;
    crushCost: number;
    labourCost: number;
    totalCost: number;
    costPerCft: number;
    materials: MaterialRequirement[];
    assumptions: AssumptionRecord[];
}
export declare function calculateConcrete(lengthFt: number, widthFt: number, depthFt: number, mixRatioKey?: string, wastagePercent?: number, rates?: ConcreteRates): ConcreteCalculationResult;
