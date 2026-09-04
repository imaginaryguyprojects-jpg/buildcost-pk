import { z } from "zod";

export const MaterialRateInputSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  cityId: z.string().min(1, "City is required"),
  brand: z.string().optional(),
  grade: z.string().optional(),
  unit: z.enum(["bag", "kg", "ton", "brick", "1000_bricks", "cft", "cum", "sqft", "box", "litre", "piece"]),
  baseRate: z.number().positive("Base rate must be positive"),
  transportRate: z.number().nonnegative().default(0),
  loadingRate: z.number().nonnegative().default(0),
  unloadingRate: z.number().nonnegative().default(0),
  deliveredRate: z.number().positive("Delivered rate must be positive"),
  sourceName: z.string().min(2, "Source name is required"),
  sourceType: z.enum(["official", "supplier", "market_survey", "public_source", "admin_verified", "demo_sample"]),
  confidenceScore: z.enum(["HIGH", "MEDIUM", "LOW", "ESTIMATED"]).default("HIGH"),
  reasonForUpdate: z.string().min(3, "Please provide a reason or audit note for this rate change")
});

export type MaterialRateInput = z.infer<typeof MaterialRateInputSchema>;
