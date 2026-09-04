export type DocumentType = "estimate" | "calculation" | "boq" | "quotation" | "cost_report";

export interface ShareLink {
  id: string;
  userId: string;
  projectId?: string;
  documentType: DocumentType;
  documentId: string;
  documentData: any;
  token: string;
  title: string;
  isActive: boolean;
  allowDownload: boolean;
  viewOnly: boolean;
  expiresAt?: string | null;
  revokedAt?: string | null;
  
  // Privacy controls
  includeClientName: boolean;
  includePhone: boolean;
  includeCompany: boolean;
  includeProjectAddress: boolean;
  
  // Analytics
  viewCount: number;
  downloadCount: number;
  lastViewedAt?: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface CalculatorTemplate {
  id: string;
  userId: string;
  title: string;
  description?: string;
  calculatorType: string;
  plotSize?: number;
  plotUnit?: string;
  coveredArea?: number;
  floors?: number;
  constructionQuality?: string;
  cityId?: string;
  inputs: Record<string, any>;
  isSystemPreset?: boolean;
  createdAt: string;
}

export interface MaterialWatchlistItem {
  id: string;
  userId: string;
  materialId: string;
  cityId: string;
  targetAlertRate?: number;
  alertOnIncrease: boolean;
  alertOnDecrease: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  createdAt: string;
}

export type ChecklistStage =
  | "planning"
  | "site_preparation"
  | "foundation"
  | "structure"
  | "masonry"
  | "plaster"
  | "electrical"
  | "plumbing"
  | "flooring"
  | "paint"
  | "doors_windows"
  | "final_inspection";

export type ChecklistStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface ProjectChecklistItem {
  id: string;
  projectId: string;
  stage: ChecklistStage;
  title: string;
  description?: string;
  status: ChecklistStatus;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
}

export type NoteCategory = "general" | "site" | "procurement" | "contractor" | "payment" | "quality";

export interface ProjectNote {
  id: string;
  projectId: string;
  userId: string;
  category: NoteCategory;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  versionName: string;
  rateSnapshotDate: string;
  summaryData: {
    totalCoveredAreaSqft: number;
    grandTotal: number;
    costPerSqft: number;
    materialsCost: number;
    labourCost: number;
    finishingCost: number;
  };
  ratesSnapshot: Record<string, { rate: number; source: string; verifiedAt: string }>;
  deltaAmount: number;
  deltaPercentage: number;
  createdAt: string;
}
