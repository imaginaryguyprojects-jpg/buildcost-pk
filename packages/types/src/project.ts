import { AreaUnit } from "@buildcost/config";

export type ProjectType = "residential" | "commercial" | "industrial" | "renovation" | "addition" | "other";

export type ConstructionQuality = "economy" | "standard" | "premium" | "luxury" | "custom";

export type ProjectStatus = "planning" | "estimating" | "quotation" | "approved" | "under_construction" | "completed" | "on_hold";

export interface Project {
  id: string;
  userId: string;
  projectName: string;
  clientName?: string;
  projectType: ProjectType;
  cityId: string;
  location: string;
  plotArea: number;
  plotUnit: AreaUnit;
  marlaStandardId: string;
  coveredArea: number;
  coveredAreaUnit: AreaUnit;
  numberOfFloors: number;
  hasBasement: boolean;
  hasGroundFloor: boolean;
  hasRoof: boolean;
  constructionQuality: ConstructionQuality;
  totalBudget?: number;
  startDate?: string;
  expectedCompletion?: string;
  notes?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FloorDefinition {
  id: string;
  projectId: string;
  name: string; // e.g. "Ground Floor", "First Floor", "Basement"
  floorNumber: number;
  heightFt: number;
  coveredAreaSqft: number;
  slabThicknessIn: number;
}
