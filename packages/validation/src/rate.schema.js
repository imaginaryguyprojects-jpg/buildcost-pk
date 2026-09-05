"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRateInputSchema = void 0;
const zod_1 = require("zod");
exports.MaterialRateInputSchema = zod_1.z.object({
    materialId: zod_1.z.string().min(1, "Material is required"),
    cityId: zod_1.z.string().min(1, "City is required"),
    brand: zod_1.z.string().optional(),
    grade: zod_1.z.string().optional(),
    unit: zod_1.z.enum(["bag", "kg", "ton", "brick", "1000_bricks", "cft", "cum", "sqft", "box", "litre", "piece"]),
    baseRate: zod_1.z.number().positive("Base rate must be positive"),
    transportRate: zod_1.z.number().nonnegative().default(0),
    loadingRate: zod_1.z.number().nonnegative().default(0),
    unloadingRate: zod_1.z.number().nonnegative().default(0),
    deliveredRate: zod_1.z.number().positive("Delivered rate must be positive"),
    sourceName: zod_1.z.string().min(2, "Source name is required"),
    sourceType: zod_1.z.enum(["official", "supplier", "market_survey", "public_source", "admin_verified", "demo_sample"]),
    confidenceScore: zod_1.z.enum(["HIGH", "MEDIUM", "LOW", "ESTIMATED"]).default("HIGH"),
    reasonForUpdate: zod_1.z.string().min(3, "Please provide a reason or audit note for this rate change")
});
