import { AreaUnit } from "@buildcost/config";

export type ProjectType = "residential" | "commercial" | "industrial" | "renovation" | "addition" | "other";

export type ConstructionQuality = "economy" | "standard" | "premium" | "luxury" | "custom";

export type ProjectStatus =
  | "planning"
  | "active"
  | "estimating"
  | "quotation"
  | "approved"
  | "under_construction"
  | "completed"
  | "on_hold"
  | "archived";

export interface Project {
  id: string;
  userId: string;
  projectName: string;
  clientName?: string;
  clientContact?: string;
  clientWhatsApp?: string;
  referenceNumber?: string;
  projectType: ProjectType;
  cityId: string;
  location: string;
  society?: string;
  plotArea: number;
  plotUnit: AreaUnit;
  marlaStandardId: string;
  plotFront?: number;
  plotDepth?: number;
  coveredArea: number;
  coveredAreaUnit: AreaUnit;
  numberOfFloors: number;
  hasBasement: boolean;
  hasGroundFloor: boolean;
  hasRoof: boolean;
  constructionQuality: ConstructionQuality;
  buildingHeight?: number;
  plinthHeight?: number;
  floorToFloorHeight?: number;
  clearCeilingHeight?: number;
  wallHeight?: number;
  foundationDepth?: number;
  slabThickness?: number;
  totalBudget?: number;
  startDate?: string;
  expectedCompletion?: string;
  notes?: string;
  projectImageUrl?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
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

export type ProjectAuditAction =
  | "project_created"
  | "project_edited"
  | "budget_changed"
  | "project_archived"
  | "project_restored"
  | "project_duplicated"
  | "project_deleted";

export interface ProjectAuditLog {
  id: string;
  projectId: string;
  userId: string;
  action: ProjectAuditAction;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ProjectEstimateVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  versionName: string;
  rateSnapshotDate: string;
  ratesSnapshot: Record<string, any>;
  quantities?: Record<string, any>;
  assumptions?: Record<string, any>;
  totalCost: number;
  costPerSqft: number;
  createdAt: string;
}
