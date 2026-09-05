export interface AssumptionRecord {
  key: string;
  label: string;
  value: string | number;
  formulaDescription?: string;
  isUserOverridden?: boolean;
}

export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  category: string;
  rawQuantity: number;
  wastagePercent: number;
  wastageQuantity: number;
  finalQuantity: number;
  unit: string;
  unitRate: number;
  cost: number;
  isCustomRate?: boolean;
}

export interface LabourRequirement {
  role: string;
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
}

export interface CalculationBreakdown {
  materialsCost: number;
  labourCost: number;
  equipmentCost: number;
  transportCost: number;
  finishingCost: number;
  contingencyCost: number;
  otherCost: number;
  grandTotal: number;
  totalCoveredAreaSqft: number;
  costPerSqft: number;
  materials: MaterialRequirement[];
  labour: LabourRequirement[];
  assumptions: AssumptionRecord[];
}

export interface CalculationSnapshot {
  id: string;
  projectId?: string;
  calculatorType: string;
  inputs: Record<string, any>;
  result: CalculationBreakdown;
  ratesSnapshot: Record<string, { rate: number; source: string; verifiedAt: string }>;
  createdAt: string;
}

export interface FloorHeightConfiguration {
  floorNumber: number; // 0 = Ground Floor, 1 = First Floor, -1 = Basement
  floorName: string;
  coveredAreaSqft: number;
  floorToFloorHeightFt: number; // default 10.5 ft
  clearCeilingHeightFt: number; // default 9.5 ft
  wallHeightFt: number; // default 9.5 ft
  roomsCount?: number;
  notes?: string;
}

export interface BuildingHeightParameters {
  foundationDepthFt: number; // default 4.5 ft
  plinthHeightFt: number; // default 3.0 ft
  parapetWallHeightFt: number; // default 3.5 ft
  floors: FloorHeightConfiguration[];
}

