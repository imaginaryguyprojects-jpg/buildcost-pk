"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlooringCalculatorSchema = exports.PaintCalculatorSchema = exports.SteelCalculatorSchema = exports.PlasterCalculatorSchema = exports.BrickworkCalculatorSchema = exports.ConcreteCalculatorSchema = exports.AreaCalculatorSchema = void 0;
const zod_1 = require("zod");
exports.AreaCalculatorSchema = zod_1.z.object({
    value: zod_1.z.number().positive("Value must be greater than zero"),
    fromUnit: zod_1.z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
    toUnit: zod_1.z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
    marlaSqft: zod_1.z.number().positive().default(225)
});
exports.ConcreteCalculatorSchema = zod_1.z.object({
    lengthFt: zod_1.z.number().positive("Length must be positive"),
    widthFt: zod_1.z.number().positive("Width must be positive"),
    depthFt: zod_1.z.number().positive("Depth / Thickness must be positive"),
    mixRatio: zod_1.z.enum(["1:2:4", "1:1.5:3", "1:1:2", "1:4:8"]).default("1:2:4"),
    wastagePercent: zod_1.z.number().min(0).max(25).default(5),
    cementRate: zod_1.z.number().positive().default(1450),
    sandRate: zod_1.z.number().positive().default(45),
    crushRate: zod_1.z.number().positive().default(65),
    labourRate: zod_1.z.number().min(0).default(35)
});
exports.BrickworkCalculatorSchema = zod_1.z.object({
    wallLengthFt: zod_1.z.number().positive("Wall length must be positive"),
    wallHeightFt: zod_1.z.number().positive("Wall height must be positive"),
    wallThicknessIn: zod_1.z.number().positive().default(9),
    openingsSqft: zod_1.z.number().min(0).default(0),
    mortarMix: zod_1.z.enum(["1:4", "1:5", "1:6"]).default("1:5"),
    wastagePercent: zod_1.z.number().min(0).max(25).default(5),
    brickRatePer1000: zod_1.z.number().positive().default(14000),
    cementRate: zod_1.z.number().positive().default(1450),
    sandRate: zod_1.z.number().positive().default(45),
    masonRatePerSqft: zod_1.z.number().min(0).default(40)
});
exports.PlasterCalculatorSchema = zod_1.z.object({
    wallAreaSqft: zod_1.z.number().positive("Area must be positive"),
    openingsSqft: zod_1.z.number().min(0).default(0),
    thicknessInches: zod_1.z.number().positive().default(0.5),
    mixRatio: zod_1.z.enum(["1:3", "1:4", "1:5"]).default("1:4"),
    wastagePercent: zod_1.z.number().min(0).max(25).default(7),
    cementRate: zod_1.z.number().positive().default(1450),
    sandRate: zod_1.z.number().positive().default(45),
    labourRatePerSqft: zod_1.z.number().min(0).default(25)
});
exports.SteelCalculatorSchema = zod_1.z.object({
    diameterMm: zod_1.z.number().positive("Diameter must be positive"),
    lengthMeters: zod_1.z.number().positive("Length must be positive"),
    numberOfBars: zod_1.z.number().int().positive().default(1),
    wastagePercent: zod_1.z.number().min(0).max(20).default(4),
    ratePerKg: zod_1.z.number().positive().default(260)
});
exports.PaintCalculatorSchema = zod_1.z.object({
    paintAreaSqft: zod_1.z.number().positive("Area must be positive"),
    coats: zod_1.z.number().int().min(1).max(5).default(2),
    includePrimer: zod_1.z.boolean().default(true),
    includePutty: zod_1.z.boolean().default(true),
    wastagePercent: zod_1.z.number().min(0).max(20).default(5),
    paintPerLitre: zod_1.z.number().positive().default(850),
    primerPerLitre: zod_1.z.number().min(0).default(600),
    puttyPerKg: zod_1.z.number().min(0).default(45),
    labourPerSqft: zod_1.z.number().min(0).default(20)
});
exports.FlooringCalculatorSchema = zod_1.z.object({
    roomAreaSqft: zod_1.z.number().positive("Area must be positive"),
    tileWidthIn: zod_1.z.number().positive().default(24),
    tileLengthIn: zod_1.z.number().positive().default(24),
    tilesPerBox: zod_1.z.number().int().positive().default(4),
    wastagePercent: zod_1.z.number().min(0).max(25).default(7),
    tileRatePerSqft: zod_1.z.number().positive().default(180),
    adhesivePerBag: zod_1.z.number().min(0).default(750),
    labourRatePerSqft: zod_1.z.number().min(0).default(45)
});
