import { describe, it, expect } from "vitest";
import {
  convertArea,
  calculatePlotGeometry,
  calculateZoningCoverage,
  calculateConcrete,
  calculateBrickwork,
  calculatePlaster,
  calculateSteelWeight,
  estimateStructuralSteel,
  calculateFlooring,
  calculatePaint,
  calculateCompleteHouseEstimate,
  calculateGreyStructureEstimate,
  calculateCompleteFinishing,
  estimateConstructionDuration,
  compareWorkforceScenarios,
  calculateTransportLogistics,
  resolveMaterialRate,
  resolveAllMaterialRates
} from "../index.ts";

describe("DEEP PRE-LAUNCH QA — CALCULATION & ENGINE RIGOR", () => {
  describe("1. Area Conversions & 3 Marla Standards", () => {
    it("converts 5 Marla across CDA (225), LDA/DHA (250), and Traditional Punjab (272.25)", () => {
      expect(convertArea(5, "marla", "sqft", 225)).toBe(1125);
      expect(convertArea(5, "marla", "sqft", 250)).toBe(1250);
      expect(convertArea(5, "marla", "sqft", 272.25)).toBe(1361.25);
    });

    it("handles decimal Marlas and Kanals without precision drift", () => {
      const sqft = convertArea(2.5, "marla", "sqft", 225);
      expect(sqft).toBe(562.5);
      const kanalSqft = convertArea(0.5, "kanal", "sqft", 225);
      expect(kanalSqft).toBe(2250);
    });

    it("calculates plot geometry with zoning coverage and FAR", () => {
      const geom = calculatePlotGeometry(30, 60, 225);
      expect(geom.plotAreaSqft).toBe(1800);
      expect(geom.marla).toBe(8);
      const zoning = calculateZoningCoverage(1800, 1200, 2400);
      expect(zoning.groundCoveragePercent).toBeCloseTo(66.67, 1);
      expect(zoning.floorAreaRatio).toBeCloseTo(1.333, 2);
    });
  });

  describe("2. Concrete & RCC Calculations (1:2:4, Dry Volume 1.54)", () => {
    it("calculates exact dry volume, cement bags, sand, and crush with 5% wastage", () => {
      // 20 x 10 x 0.5 = 100 CFT wet -> 154 CFT dry
      const res = calculateConcrete(20, 10, 0.5, "1:2:4", 5);
      expect(res.wetVolumeCft).toBe(100);
      expect(res.dryVolumeCft).toBe(154);
      expect(res.cementBags).toBe(19);
      expect(res.sandCft).toBeCloseTo(46.2, 1);
      expect(res.crushCft).toBeCloseTo(92.4, 1);
      expect(Number.isFinite(res.totalCost)).toBe(true);
      expect(Number.isNaN(res.totalCost)).toBe(false);
    });

    it("verifies 0% and 10% wastage impact on concrete", () => {
      const zeroWastage = calculateConcrete(10, 10, 1, "1:2:4", 0);
      const tenWastage = calculateConcrete(10, 10, 1, "1:2:4", 10);
      expect(tenWastage.cementBags).toBeGreaterThanOrEqual(zeroWastage.cementBags);
      expect(tenWastage.totalCost).toBeGreaterThan(zeroWastage.totalCost);
    });
  });

  describe("3. Brick Masonry & Openings Deduction", () => {
    it("correctly deducts door and window openings from masonry volume", () => {
      // 40ft x 10ft = 400 sqft wall. Openings = 42 sqft. Net = 358 sqft. 9-inch = 0.75 ft. Volume = 268.5 CFT.
      const res = calculateBrickwork(40, 10, 9, 42, "1:5", 5);
      expect(res.grossAreaSqft).toBe(400);
      expect(res.netAreaSqft).toBe(358);
      expect(res.netMasonryCft).toBeCloseTo(268.5, 1);
      expect(res.bricksCount).toBeGreaterThan(3500);
      expect(Number.isFinite(res.totalCost)).toBe(true);
    });

    it("computes 4.5-inch partition walls correctly", () => {
      const res = calculateBrickwork(20, 10, 4.5, 21, "1:4", 5);
      expect(res.netAreaSqft).toBe(179);
      expect(res.netMasonryCft).toBeCloseTo(67.125, 1);
    });
  });

  describe("4. Steel Rebar Formula (D^2 / 162.2 kg/m)", () => {
    it("computes rebar weight for 12mm Grade 60 steel", () => {
      const res = calculateSteelWeight(12, 12, 10, 4, 260);
      expect(res.finalWeightKg).toBeCloseTo(110.8, 1);
      expect(res.finalWeightTons).toBeCloseTo(0.111, 2);
      expect(res.cost).toBeGreaterThan(0);
    });

    it("computes rebar weight for 16mm and 25mm heavy structural bars", () => {
      const bar16 = calculateSteelWeight(16, 12, 5, 4, 260);
      const bar25 = calculateSteelWeight(25, 12, 5, 4, 260);
      expect(bar25.finalWeightKg).toBeGreaterThan(bar16.finalWeightKg);
    });
  });

  describe("5. Finishing Works (15+ Elements)", () => {
    it("computes complete 15-category finishing breakdown for residential construction", () => {
      const res = calculateCompleteFinishing({ coveredAreaSqft: 2000, numberOfFloors: 2, quality: "standard" });
      expect(res.grandTotal).toBeGreaterThan(0);
      expect(res.totalMaterialCost).toBeGreaterThan(0);
      expect(res.totalLabourCost).toBeGreaterThan(0);
      expect(Object.keys(res.categories).length).toBeGreaterThanOrEqual(15);
      expect(Number.isFinite(res.costPerSqft)).toBe(true);
    });
  });

  describe("6. Labour Engine & Workforce Scenarios", () => {
    it("estimates construction duration and trade breakdown", () => {
      const dur = estimateConstructionDuration(2500, { mistriCount: 3, labourCount: 5 });
      expect(dur.estimatedWorkingDays).toBeGreaterThan(50);
      expect(dur.estimatedCalendarDays).toBeGreaterThan(dur.estimatedWorkingDays);
      expect(Number.isFinite(dur.totalLabourCost)).toBe(true);
    });

    it("compares Standard vs FastTrack vs Economy workforce scenarios", () => {
      const scn = compareWorkforceScenarios(2500);
      expect(scn.scenarios.length).toBe(3);
      expect(scn.recommendedScenarioId).toBe("B");
      const economy = scn.scenarios.find(s => s.id === "A");
      const fast = scn.scenarios.find(s => s.id === "C");
      expect(fast.estimatedDays).toBeLessThan(economy.estimatedDays);
    });
  });

  describe("7. Transport Logistics & Palledari Unloading", () => {
    it("calculates exact trip count and vehicle capacity constraints", () => {
      const res = calculateTransportLogistics({
        distanceKm: 25,
        bricksCount: 6000,
        cementBags: 150
      });
      expect(res.totalTripsCount).toBeGreaterThanOrEqual(2);
      expect(res.totalFreightCost).toBeGreaterThan(0);
      expect(res.totalPalledariCost).toBeGreaterThan(0);
      expect(res.summaryUrdu).toBeDefined();
    });
  });

  describe("8. Material Rate Precedence Hierarchy", () => {
    it("strictly follows: Project Custom > Vendor > City Verified > Global Default", () => {
      // 1. Custom wins
      const r1 = resolveMaterialRate({
        materialKey: "cement",
        projectCustomRates: { cement: 1350 },
        vendorRates: [{ materialKey: "cement", vendorId: "v1", unitPrice: 1380 }],
        cityVerifiedRates: [{ materialKey: "cement", cityId: "isb", deliveredRate: 1420 }],
        globalDefaultRates: { cement: 1450 }
      });
      expect(r1.source).toBe("project_custom");
      expect(r1.unitRate).toBe(1350);

      // 2. Vendor wins when no custom
      const r2 = resolveMaterialRate({
        materialKey: "cement",
        selectedVendorId: "v1",
        vendorRates: [{ materialKey: "cement", vendorId: "v1", unitPrice: 1380 }],
        cityVerifiedRates: [{ materialKey: "cement", cityId: "isb", deliveredRate: 1420 }],
        globalDefaultRates: { cement: 1450 }
      });
      expect(r2.source).toBe("vendor");
      expect(r2.unitRate).toBe(1380);

      // 3. City wins when no custom & no vendor
      const r3 = resolveMaterialRate({
        materialKey: "cement",
        cityId: "isb",
        cityVerifiedRates: [{ materialKey: "cement", cityId: "isb", deliveredRate: 1420 }],
        globalDefaultRates: { cement: 1450 }
      });
      expect(r3.source).toBe("city_verified");
      expect(r3.unitRate).toBe(1420);

      // 4. Global default fallback
      const r4 = resolveMaterialRate({
        materialKey: "cement",
        globalDefaultRates: { cement: 1450 }
      });
      expect(r4.source).toBe("global_default");
      expect(r4.unitRate).toBe(1450);
    });

    it("resolves batch material rates accurately", () => {
      const batch = resolveAllMaterialRates(["cement", "steel", "sand"], {
        cityId: "isb",
        globalDefaultRates: { cement: 1450, steel: 260, sand: 45 }
      });
      expect(batch.cement.unitRate).toBe(1450);
      expect(batch.steel.unitRate).toBe(260);
      expect(batch.sand.unitRate).toBe(45);
    });
  });
});
