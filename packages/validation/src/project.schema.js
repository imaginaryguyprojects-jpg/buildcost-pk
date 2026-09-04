"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCreateSchema = void 0;
const zod_1 = require("zod");
exports.ProjectCreateSchema = zod_1.z.object({
    projectName: zod_1.z.string().min(2, "Project name must have at least 2 characters").max(100),
    clientName: zod_1.z.string().max(100).optional(),
    projectType: zod_1.z.enum(["residential", "commercial", "industrial", "renovation", "addition", "other"]),
    cityId: zod_1.z.string().min(1, "Please select a city"),
    location: zod_1.z.string().min(2, "Location or sector/society is required").max(150),
    plotArea: zod_1.z.number().positive("Plot area must be greater than zero"),
    plotUnit: zod_1.z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
    marlaStandardId: zod_1.z.string().default("marla_225"),
    coveredArea: zod_1.z.number().positive("Covered area must be greater than zero"),
    coveredAreaUnit: zod_1.z.enum(["sqft", "sqm"]),
    numberOfFloors: zod_1.z.number().int().min(1, "Must have at least 1 floor").max(25),
    hasBasement: zod_1.z.boolean().default(false),
    hasGroundFloor: zod_1.z.boolean().default(true),
    hasRoof: zod_1.z.boolean().default(true),
    constructionQuality: zod_1.z.enum(["economy", "standard", "premium", "luxury", "custom"]).default("standard"),
    totalBudget: zod_1.z.number().nonnegative().optional(),
    startDate: zod_1.z.string().optional(),
    expectedCompletion: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(1000).optional()
});
