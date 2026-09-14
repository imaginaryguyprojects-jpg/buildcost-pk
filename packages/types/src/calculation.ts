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

// -------------------------------------------------------------
// VERSION 3.0.0: PRO EXACT CONSTRUCTION CALCULATION TYPES
// -------------------------------------------------------------
export interface ProBathroomItem {
  id: string;
  name: string;
  lengthFt: number;
  widthFt: number;
  heightMode: "auto" | "manual";
  heightFt: number;
}

export type ProFoundationType = "automatic" | "strip" | "isolated" | "raft" | "other";

export interface ProConstructionInputs {
  isProEnabled: boolean;
  
  // A. Wall Height
  wallHeightMode: "auto" | "manual";
  manualWallHeightFt: number; // default 10 ft
  
  // B. Bathrooms
  bathroomCountMode: "auto" | "manual";
  manualBathroomCount: number; // 1, 2, 3, 4, 5, 6+
  bathrooms: ProBathroomItem[];
  applySameBathroomSize: boolean;
  
  // C. Foundation
  foundationMode: "auto" | "manual";
  foundationDepthFt: number; // e.g. 4 ft
  foundationWidthFt: number; // e.g. 3 ft
  foundationType: ProFoundationType;
  
  // D. Columns
  columnMode: "auto" | "manual";
  manualColumnCount: number;
  columnWidthFt: number; // e.g. 0.75 ft (9 in) or 1.0 ft
  columnDepthFt: number; // e.g. 1.0 ft
  columnHeightMode: "auto" | "manual";
  manualColumnHeightFt: number;
  
  // E. Beams
  beamMode: "auto" | "manual";
  manualBeamCount: number;
  beamWidthFt: number; // e.g. 0.75 ft (9 in)
  beamDepthFt: number; // e.g. 1.25 ft (15 in)
  beamLengthMode: "auto" | "manual";
  manualBeamTotalLengthFt: number;
}

export interface ProDetailedEstimate {
  constructionAreaSqft: number;
  wallAreaSqft: number;
  wallVolumeCft: number;
  foundationVolumeCft: number;
  excavationVolumeCft: number;
  numberOfBathrooms: number;
  numberOfColumns: number;
  numberOfBeams: number;
  breakdown: {
    wallsCost: number;
    foundationCost: number;
    columnsCost: number;
    beamsCost: number;
    slabsCost: number;
    bathroomsCost: number;
    plasterCost: number;
    brickworkCost: number;
    bricksCost: number;
    cementCost: number;
    sandCost: number;
    crushCost: number;
    steelCost: number;
    labourCost: number;
    transportCost: number;
    wastageCost: number;
    otherCost: number;
  };
}

