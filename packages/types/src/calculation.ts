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
