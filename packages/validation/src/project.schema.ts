import { z } from "zod";

export const ProjectCreateSchema = z.object({
  projectName: z.string().min(2, "Project name must have at least 2 characters").max(100),
  clientName: z.string().max(100).optional(),
  projectType: z.enum(["residential", "commercial", "industrial", "renovation", "addition", "other"]),
  cityId: z.string().min(1, "Please select a city"),
  location: z.string().min(2, "Location or sector/society is required").max(150),
  plotArea: z.number().positive("Plot area must be greater than zero"),
  plotUnit: z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
  marlaStandardId: z.string().default("marla_225"),
  coveredArea: z.number().positive("Covered area must be greater than zero"),
  coveredAreaUnit: z.enum(["sqft", "sqm"]),
  numberOfFloors: z.number().int().min(1, "Must have at least 1 floor").max(25),
  hasBasement: z.boolean().default(false),
  hasGroundFloor: z.boolean().default(true),
  hasRoof: z.boolean().default(true),
  constructionQuality: z.enum(["economy", "standard", "premium", "luxury", "custom"]).default("standard"),
  totalBudget: z.number().nonnegative().optional(),
  startDate: z.string().optional(),
  expectedCompletion: z.string().optional(),
  notes: z.string().max(1000).optional()
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
