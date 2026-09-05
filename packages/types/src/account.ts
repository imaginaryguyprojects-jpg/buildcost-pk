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

export type PlotCategory = "3_marla" | "5_marla" | "7_marla" | "10_marla" | "1_kanal";

export interface RoomPlanElement {
  id: string;
  name: string;
  urduName?: string;
  category: "bedroom" | "bathroom" | "kitchen" | "living" | "drawing" | "porch" | "stairs" | "lawn" | "terrace" | "store";
  widthFt: number;
  depthFt: number;
  x: number; // grid x coordinate
  y: number; // grid y coordinate
  doors?: { wall: "top" | "bottom" | "left" | "right"; offsetFt: number }[];
  windows?: { wall: "top" | "bottom" | "left" | "right"; widthFt: number; offsetFt: number }[];
  hasAttachedBath?: boolean;
}

export interface HouseLayout {
  id: string;
  title: string;
  plotCategory: PlotCategory;
  plotAreaSqft: number;
  plotWidthFt: number;
  plotDepthFt: number;
  coveredAreaSqft: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  hasCarPorch: boolean;
  hasDrawingRoom: boolean;
  hasTvLounge: boolean;
  hasServantRoom: boolean;
  hasDirtyKitchen: boolean;
  isCornerPlot: boolean;
  description: string;
  planData: {
    groundFloor: RoomPlanElement[];
    firstFloor?: RoomPlanElement[];
  };
  isFavorite?: boolean;
  isSystemPreset: boolean;
  createdAt: string;
}

export type VendorCategory =
  | "cement"
  | "steel"
  | "bricks"
  | "sand"
  | "crush"
  | "blocks"
  | "tiles"
  | "paint"
  | "electrical"
  | "plumbing"
  | "sanitary"
  | "wood"
  | "aluminium"
  | "glass"
  | "hardware"
  | "contractor"
  | "other";

export interface Vendor {
  id: string;
  userId: string;
  vendorName: string;
  businessName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  alternativeNumber?: string;
  email?: string;
  address?: string;
  cityId: string;
  category: VendorCategory;
  notes?: string;
  rating: number;
  status: "active" | "inactive" | "preferred";
  totalPurchases?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  createdAt: string;
}

export type PurchaseStatus = "draft" | "ordered" | "partially_delivered" | "delivered" | "cancelled";
export type PurchasePaymentStatus = "unpaid" | "partially_paid" | "paid";

export interface PurchaseOrder {
  id: string;
  userId: string;
  projectId: string;
  vendorId?: string;
  vendorName?: string;
  materialId: string;
  materialName: string;
  brand?: string;
  specification?: string;
  quantity: number;
  unit: string;
  rate: number;
  subtotal: number;
  discount: number;
  transportCharges: number;
  loadingCharges: number;
  unloadingCharges: number;
  otherCharges: number;
  totalAmount: number;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  deliveredAt?: string;
  billUrl?: string;
  materialPhotoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface VendorPayment {
  id: string;
  userId: string;
  vendorId: string;
  projectId?: string;
  purchaseId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "other";
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  projectId: string;
  materialId: string;
  materialName: string;
  unit: string;
  openingQuantity: number;
  purchasedQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  minStockThreshold: number;
  isLowStock: boolean;
  updatedAt: string;
}

export interface MaterialUsage {
  id: string;
  projectId: string;
  materialId: string;
  quantityUsed: number;
  usageDate: string;
  constructionStage: string;
  notes?: string;
  createdAt: string;
}

export type ReminderPriority = "low" | "medium" | "high" | "urgent";
export type ReminderRepeat = "none" | "daily" | "weekly" | "monthly";
export type ReminderStatus = "pending" | "completed" | "cancelled";

export interface ProjectReminder {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  reminderDate: string;
  reminderTime?: string;
  repeatFrequency: ReminderRepeat;
  priority: ReminderPriority;
  status: ReminderStatus;
  notes?: string;
  createdAt: string;
}

export interface SiteDiaryEntry {
  id: string;
  projectId: string;
  logDate: string;
  weather: "sunny" | "cloudy" | "rainy" | "hot" | "cold";
  workersPresent: number;
  workCompleted: string;
  materialsReceived?: string;
  issues?: string;
  photoUrls?: string[];
  notes?: string;
  createdAt: string;
}
