import { z } from "zod";
export declare const AreaCalculatorSchema: z.ZodObject<{
    value: z.ZodNumber;
    fromUnit: z.ZodEnum<["marla", "kanal", "sqft", "sqyd", "sqm"]>;
    toUnit: z.ZodEnum<["marla", "kanal", "sqft", "sqyd", "sqm"]>;
    marlaSqft: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    value: number;
    fromUnit: "marla" | "kanal" | "sqft" | "sqyd" | "sqm";
    toUnit: "marla" | "kanal" | "sqft" | "sqyd" | "sqm";
    marlaSqft: number;
}, {
    value: number;
    fromUnit: "marla" | "kanal" | "sqft" | "sqyd" | "sqm";
    toUnit: "marla" | "kanal" | "sqft" | "sqyd" | "sqm";
    marlaSqft?: number | undefined;
}>;
export declare const ConcreteCalculatorSchema: z.ZodObject<{
    lengthFt: z.ZodNumber;
    widthFt: z.ZodNumber;
    depthFt: z.ZodNumber;
    mixRatio: z.ZodDefault<z.ZodEnum<["1:2:4", "1:1.5:3", "1:1:2", "1:4:8"]>>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    cementRate: z.ZodDefault<z.ZodNumber>;
    sandRate: z.ZodDefault<z.ZodNumber>;
    crushRate: z.ZodDefault<z.ZodNumber>;
    labourRate: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lengthFt: number;
    widthFt: number;
    depthFt: number;
    mixRatio: "1:2:4" | "1:1.5:3" | "1:1:2" | "1:4:8";
    wastagePercent: number;
    cementRate: number;
    sandRate: number;
    crushRate: number;
    labourRate: number;
}, {
    lengthFt: number;
    widthFt: number;
    depthFt: number;
    mixRatio?: "1:2:4" | "1:1.5:3" | "1:1:2" | "1:4:8" | undefined;
    wastagePercent?: number | undefined;
    cementRate?: number | undefined;
    sandRate?: number | undefined;
    crushRate?: number | undefined;
    labourRate?: number | undefined;
}>;
export declare const BrickworkCalculatorSchema: z.ZodObject<{
    wallLengthFt: z.ZodNumber;
    wallHeightFt: z.ZodNumber;
    wallThicknessIn: z.ZodDefault<z.ZodNumber>;
    openingsSqft: z.ZodDefault<z.ZodNumber>;
    mortarMix: z.ZodDefault<z.ZodEnum<["1:4", "1:5", "1:6"]>>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    brickRatePer1000: z.ZodDefault<z.ZodNumber>;
    cementRate: z.ZodDefault<z.ZodNumber>;
    sandRate: z.ZodDefault<z.ZodNumber>;
    masonRatePerSqft: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    wastagePercent: number;
    cementRate: number;
    sandRate: number;
    wallLengthFt: number;
    wallHeightFt: number;
    wallThicknessIn: number;
    openingsSqft: number;
    mortarMix: "1:4" | "1:5" | "1:6";
    brickRatePer1000: number;
    masonRatePerSqft: number;
}, {
    wallLengthFt: number;
    wallHeightFt: number;
    wastagePercent?: number | undefined;
    cementRate?: number | undefined;
    sandRate?: number | undefined;
    wallThicknessIn?: number | undefined;
    openingsSqft?: number | undefined;
    mortarMix?: "1:4" | "1:5" | "1:6" | undefined;
    brickRatePer1000?: number | undefined;
    masonRatePerSqft?: number | undefined;
}>;
export declare const PlasterCalculatorSchema: z.ZodObject<{
    wallAreaSqft: z.ZodNumber;
    openingsSqft: z.ZodDefault<z.ZodNumber>;
    thicknessInches: z.ZodDefault<z.ZodNumber>;
    mixRatio: z.ZodDefault<z.ZodEnum<["1:3", "1:4", "1:5"]>>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    cementRate: z.ZodDefault<z.ZodNumber>;
    sandRate: z.ZodDefault<z.ZodNumber>;
    labourRatePerSqft: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    mixRatio: "1:4" | "1:5" | "1:3";
    wastagePercent: number;
    cementRate: number;
    sandRate: number;
    openingsSqft: number;
    wallAreaSqft: number;
    thicknessInches: number;
    labourRatePerSqft: number;
}, {
    wallAreaSqft: number;
    mixRatio?: "1:4" | "1:5" | "1:3" | undefined;
    wastagePercent?: number | undefined;
    cementRate?: number | undefined;
    sandRate?: number | undefined;
    openingsSqft?: number | undefined;
    thicknessInches?: number | undefined;
    labourRatePerSqft?: number | undefined;
}>;
export declare const SteelCalculatorSchema: z.ZodObject<{
    diameterMm: z.ZodNumber;
    lengthMeters: z.ZodNumber;
    numberOfBars: z.ZodDefault<z.ZodNumber>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    ratePerKg: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    wastagePercent: number;
    diameterMm: number;
    lengthMeters: number;
    numberOfBars: number;
    ratePerKg: number;
}, {
    diameterMm: number;
    lengthMeters: number;
    wastagePercent?: number | undefined;
    numberOfBars?: number | undefined;
    ratePerKg?: number | undefined;
}>;
export declare const PaintCalculatorSchema: z.ZodObject<{
    paintAreaSqft: z.ZodNumber;
    coats: z.ZodDefault<z.ZodNumber>;
    includePrimer: z.ZodDefault<z.ZodBoolean>;
    includePutty: z.ZodDefault<z.ZodBoolean>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    paintPerLitre: z.ZodDefault<z.ZodNumber>;
    primerPerLitre: z.ZodDefault<z.ZodNumber>;
    puttyPerKg: z.ZodDefault<z.ZodNumber>;
    labourPerSqft: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    wastagePercent: number;
    paintAreaSqft: number;
    coats: number;
    includePrimer: boolean;
    includePutty: boolean;
    paintPerLitre: number;
    primerPerLitre: number;
    puttyPerKg: number;
    labourPerSqft: number;
}, {
    paintAreaSqft: number;
    wastagePercent?: number | undefined;
    coats?: number | undefined;
    includePrimer?: boolean | undefined;
    includePutty?: boolean | undefined;
    paintPerLitre?: number | undefined;
    primerPerLitre?: number | undefined;
    puttyPerKg?: number | undefined;
    labourPerSqft?: number | undefined;
}>;
export declare const FlooringCalculatorSchema: z.ZodObject<{
    roomAreaSqft: z.ZodNumber;
    tileWidthIn: z.ZodDefault<z.ZodNumber>;
    tileLengthIn: z.ZodDefault<z.ZodNumber>;
    tilesPerBox: z.ZodDefault<z.ZodNumber>;
    wastagePercent: z.ZodDefault<z.ZodNumber>;
    tileRatePerSqft: z.ZodDefault<z.ZodNumber>;
    adhesivePerBag: z.ZodDefault<z.ZodNumber>;
    labourRatePerSqft: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    wastagePercent: number;
    labourRatePerSqft: number;
    roomAreaSqft: number;
    tileWidthIn: number;
    tileLengthIn: number;
    tilesPerBox: number;
    tileRatePerSqft: number;
    adhesivePerBag: number;
}, {
    roomAreaSqft: number;
    wastagePercent?: number | undefined;
    labourRatePerSqft?: number | undefined;
    tileWidthIn?: number | undefined;
    tileLengthIn?: number | undefined;
    tilesPerBox?: number | undefined;
    tileRatePerSqft?: number | undefined;
    adhesivePerBag?: number | undefined;
}>;
