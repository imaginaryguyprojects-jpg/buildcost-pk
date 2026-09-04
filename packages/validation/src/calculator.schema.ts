import { z } from "zod";

export const AreaCalculatorSchema = z.object({
  value: z.number().positive("Value must be greater than zero"),
  fromUnit: z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
  toUnit: z.enum(["marla", "kanal", "sqft", "sqyd", "sqm"]),
  marlaSqft: z.number().positive().default(225)
});

export const ConcreteCalculatorSchema = z.object({
  lengthFt: z.number().positive("Length must be positive"),
  widthFt: z.number().positive("Width must be positive"),
  depthFt: z.number().positive("Depth / Thickness must be positive"),
  mixRatio: z.enum(["1:2:4", "1:1.5:3", "1:1:2", "1:4:8"]).default("1:2:4"),
  wastagePercent: z.number().min(0).max(25).default(5),
  cementRate: z.number().positive().default(1450),
  sandRate: z.number().positive().default(45),
  crushRate: z.number().positive().default(65),
  labourRate: z.number().min(0).default(35)
});

export const BrickworkCalculatorSchema = z.object({
  wallLengthFt: z.number().positive("Wall length must be positive"),
  wallHeightFt: z.number().positive("Wall height must be positive"),
  wallThicknessIn: z.number().positive().default(9),
  openingsSqft: z.number().min(0).default(0),
  mortarMix: z.enum(["1:4", "1:5", "1:6"]).default("1:5"),
  wastagePercent: z.number().min(0).max(25).default(5),
  brickRatePer1000: z.number().positive().default(14000),
  cementRate: z.number().positive().default(1450),
  sandRate: z.number().positive().default(45),
  masonRatePerSqft: z.number().min(0).default(40)
});

export const PlasterCalculatorSchema = z.object({
  wallAreaSqft: z.number().positive("Area must be positive"),
  openingsSqft: z.number().min(0).default(0),
  thicknessInches: z.number().positive().default(0.5),
  mixRatio: z.enum(["1:3", "1:4", "1:5"]).default("1:4"),
  wastagePercent: z.number().min(0).max(25).default(7),
  cementRate: z.number().positive().default(1450),
  sandRate: z.number().positive().default(45),
  labourRatePerSqft: z.number().min(0).default(25)
});

export const SteelCalculatorSchema = z.object({
  diameterMm: z.number().positive("Diameter must be positive"),
  lengthMeters: z.number().positive("Length must be positive"),
  numberOfBars: z.number().int().positive().default(1),
  wastagePercent: z.number().min(0).max(20).default(4),
  ratePerKg: z.number().positive().default(260)
});

export const PaintCalculatorSchema = z.object({
  paintAreaSqft: z.number().positive("Area must be positive"),
  coats: z.number().int().min(1).max(5).default(2),
  includePrimer: z.boolean().default(true),
  includePutty: z.boolean().default(true),
  wastagePercent: z.number().min(0).max(20).default(5),
  paintPerLitre: z.number().positive().default(850),
  primerPerLitre: z.number().min(0).default(600),
  puttyPerKg: z.number().min(0).default(45),
  labourPerSqft: z.number().min(0).default(20)
});

export const FlooringCalculatorSchema = z.object({
  roomAreaSqft: z.number().positive("Area must be positive"),
  tileWidthIn: z.number().positive().default(24),
  tileLengthIn: z.number().positive().default(24),
  tilesPerBox: z.number().int().positive().default(4),
  wastagePercent: z.number().min(0).max(25).default(7),
  tileRatePerSqft: z.number().positive().default(180),
  adhesivePerBag: z.number().min(0).default(750),
  labourRatePerSqft: z.number().min(0).default(45)
});
