"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectUpdateSchema = exports.ProjectCreateSchema = void 0;
const zod_1 = require("zod");
exports.ProjectCreateSchema = zod_1.z.object({
    projectName: zod_1.z.string().min(2, "Project name must have at least 2 characters").max(100),
    clientName: zod_1.z.string().max(100).optional().default(""),
    clientContact: zod_1.z.string().max(50).optional().default(""),
    clientWhatsApp: zod_1.z.string().max(50).optional().default(""),
    referenceNumber: zod_1.z.string().max(50).optional().default(""),
    projectType: zod_1.z.enum(["residential", "commercial", "industrial", "renovation", "addition", "other"]).default("residential"),
    cityId: zod_1.z.string().min(1, "Please select a city market"),
    location: zod_1.z.string().min(2, "Location or sector/society is required").max(150),
    society: zod_1.z.string().max(100).optional().default(""),
    plotArea: zod_1.z.number().positive("Plot area must be greater than zero"),
    plotUnit: zod_1.z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]).default("marla"),
    marlaStandardId: zod_1.z.string().default("marla_225"),
    plotFront: zod_1.z.number().nonnegative().optional(),
    plotDepth: zod_1.z.number().nonnegative().optional(),
    coveredArea: zod_1.z.number().positive("Covered area must be greater than zero"),
    coveredAreaUnit: zod_1.z.enum(["sqft", "sqm"]).default("sqft"),
    numberOfFloors: zod_1.z.number().int().min(1, "Must have at least 1 floor").max(25).default(1),
    hasBasement: zod_1.z.boolean().default(false),
    hasGroundFloor: zod_1.z.boolean().default(true),
    hasRoof: zod_1.z.boolean().default(true),
    constructionQuality: zod_1.z.enum(["economy", "standard", "premium", "luxury", "custom"]).default("standard"),
    buildingHeight: zod_1.z.number().nonnegative().optional(),
    plinthHeight: zod_1.z.number().nonnegative().optional(),
    floorToFloorHeight: zod_1.z.number().nonnegative().optional(),
    clearCeilingHeight: zod_1.z.number().nonnegative().optional(),
    wallHeight: zod_1.z.number().nonnegative().optional(),
    foundationDepth: zod_1.z.number().nonnegative().optional(),
    slabThickness: zod_1.z.number().nonnegative().optional(),
    totalBudget: zod_1.z.number().nonnegative().optional().default(0),
    startDate: zod_1.z.string().optional(),
    expectedCompletion: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(2000).optional().default(""),
    projectImageUrl: zod_1.z.string().url().or(zod_1.z.literal("")).optional(),
    status: zod_1.z.enum(["planning", "active", "estimating", "quotation", "approved", "under_construction", "completed", "on_hold", "archived"]).default("planning")
});
exports.ProjectUpdateSchema = exports.ProjectCreateSchema.partial();
