import { z } from "zod";

export const ProjectCreateSchema = z.object({
  projectName: z.string().min(2, "Project name must have at least 2 characters").max(100),
  clientName: z.string().max(100).optional().default(""),
  clientContact: z.string().max(50).optional().default(""),
  clientWhatsApp: z.string().max(50).optional().default(""),
  referenceNumber: z.string().max(50).optional().default(""),
  projectType: z.enum(["residential", "commercial", "industrial", "renovation", "addition", "other"]).default("residential"),
  cityId: z.string().min(1, "Please select a city market"),
  location: z.string().min(2, "Location or sector/society is required").max(150),
  society: z.string().max(100).optional().default(""),
  plotArea: z.number().positive("Plot area must be greater than zero"),
  plotUnit: z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]).default("marla"),
  marlaStandardId: z.string().default("marla_225"),
  plotFront: z.number().nonnegative().optional(),
  plotDepth: z.number().nonnegative().optional(),
  coveredArea: z.number().positive("Covered area must be greater than zero"),
  coveredAreaUnit: z.enum(["sqft", "sqm"]).default("sqft"),
  numberOfFloors: z.number().int().min(1, "Must have at least 1 floor").max(25).default(1),
  hasBasement: z.boolean().default(false),
  hasGroundFloor: z.boolean().default(true),
  hasRoof: z.boolean().default(true),
  constructionQuality: z.enum(["economy", "standard", "premium", "luxury", "custom"]).default("standard"),
  buildingHeight: z.number().nonnegative().optional(),
  plinthHeight: z.number().nonnegative().optional(),
  floorToFloorHeight: z.number().nonnegative().optional(),
  clearCeilingHeight: z.number().nonnegative().optional(),
  wallHeight: z.number().nonnegative().optional(),
  foundationDepth: z.number().nonnegative().optional(),
  slabThickness: z.number().nonnegative().optional(),
  totalBudget: z.number().nonnegative().optional().default(0),
  startDate: z.string().optional(),
  expectedCompletion: z.string().optional(),
  notes: z.string().max(2000).optional().default(""),
  projectImageUrl: z.string().url().or(z.literal("")).optional(),
  status: z.enum(["planning", "active", "estimating", "quotation", "approved", "under_construction", "completed", "on_hold", "archived"]).default("planning")
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial();

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
