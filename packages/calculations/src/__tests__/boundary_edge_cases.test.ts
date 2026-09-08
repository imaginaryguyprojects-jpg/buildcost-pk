import { describe, it, expect } from "vitest";
import {
  calculateConcrete,
  calculateBrickwork,
  calculatePlaster,
  calculateSteelWeight,
  calculateCompleteFinishing,
  calculateTransportLogistics,
  resolveMaterialRate
} from "../index.ts";

describe("BOUNDARY & STRESS EDGE-CASE AUDIT", () => {
  describe("1. Zero & Negative Input Protections", () => {
    it("throws appropriate descriptive error on zero or negative concrete dimensions", () => {
      expect(() => calculateConcrete(0, 10, 1)).toThrow("Concrete dimensions must be positive numbers");
      expect(() => calculateConcrete(-5, 10, 1)).toThrow("Concrete dimensions must be positive numbers");
      expect(() => calculateConcrete(10, -5, 1)).toThrow("Concrete dimensions must be positive numbers");
      expect(() => calculateConcrete(10, 10, -1)).toThrow("Concrete dimensions must be positive numbers");
    });

    it("throws appropriate error on zero or negative brick wall dimensions", () => {
      expect(() => calculateBrickwork(0, 10, 9)).toThrow("Wall dimensions must be positive numbers");
      expect(() => calculateBrickwork(-10, 10, 9)).toThrow("Wall dimensions must be positive numbers");
      expect(() => calculateBrickwork(10, -10, 9)).toThrow("Wall dimensions must be positive numbers");
    });

    it("throws error when openings exceed wall area in brickwork", () => {
      expect(() => calculateBrickwork(10, 10, 9, 100)).toThrow("Openings area cannot be greater than or equal to total wall area");
      expect(() => calculateBrickwork(10, 10, 9, 150)).toThrow("Openings area cannot be greater than or equal to total wall area");
    });

    it("throws error on zero or negative plaster dimensions", () => {
      expect(() => calculatePlaster(0, 0, 0.5)).toThrow("Plaster area and thickness must be positive");
      expect(() => calculatePlaster(-100, 0, 0.5)).toThrow("Plaster area and thickness must be positive");
    });

    it("throws error on zero or negative steel parameters", () => {
      expect(() => calculateSteelWeight(0, 12, 1)).toThrow("Rebar parameters must be positive numbers");
      expect(() => calculateSteelWeight(-12, 12, 1)).toThrow("Rebar parameters must be positive numbers");
      expect(() => calculateSteelWeight(12, 0, 1)).toThrow("Rebar parameters must be positive numbers");
    });
  });

  describe("2. Extreme Large Values & Decimal Precision (No Overflow, No NaN)", () => {
    it("handles large commercial multi-acre concrete pours without NaN or Infinity", () => {
      // 50,000 sqft slab 1 ft thick = 50,000 CFT
      const res = calculateConcrete(500, 100, 1, "1:2:4", 5);
      expect(Number.isFinite(res.wetVolumeCft)).toBe(true);
      expect(Number.isFinite(res.dryVolumeCft)).toBe(true);
      expect(Number.isFinite(res.cementBags)).toBe(true);
      expect(Number.isFinite(res.totalCost)).toBe(true);
      expect(res.cementBags).toBeGreaterThan(5000);
      expect(Number.isNaN(res.totalCost)).toBe(false);
    });

    it("handles large high-rise brickwork without NaN or overflow", () => {
      const res = calculateBrickwork(500, 80, 9, 5000, "1:4", 5);
      expect(Number.isFinite(res.bricksCount)).toBe(true);
      expect(Number.isFinite(res.totalCost)).toBe(true);
      expect(Number.isNaN(res.totalCost)).toBe(false);
      expect(res.bricksCount).toBeGreaterThan(100000);
    });

    it("handles decimal inputs with fractional thickness", () => {
      // 0.375 ft (4.5 inch wall)
      const res = calculateBrickwork(15.5, 9.75, 4.5, 21.25, "1:5", 5);
      expect(Number.isFinite(res.netMasonryCft)).toBe(true);
      expect(Number.isFinite(res.bricksCount)).toBe(true);
      expect(Number.isNaN(res.bricksCount)).toBe(false);
    });
  });

  describe("3. Rate Resolver Fallbacks & Unknown Materials", () => {
    it("returns zero rate safely when material is completely unknown without crashing", () => {
      const res = resolveMaterialRate({
        materialKey: "unobtainium",
        globalDefaultRates: {}
      });
      expect(res.unitRate).toBe(0);
      expect(res.source).toBe("global_default");
    });

    it("handles zero or negative custom rates by falling back to next tier", () => {
      const res = resolveMaterialRate({
        materialKey: "cement",
        cityId: "isb",
        projectCustomRates: { cement: 0 }, // 0 custom rate -> should fallback
        cityVerifiedRates: [{ materialKey: "cement", cityId: "isb", deliveredRate: 1420 }],
        globalDefaultRates: { cement: 1450 }
      });
      expect(res.source).toBe("city_verified");
      expect(res.unitRate).toBe(1420);
    });
  });
});
