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
  simulatePriceScenario,
  calculateColumns,
  calculateRoofSlab,
  calculateBrickMasonry,
  calculateFoundation,
  calculateGreyStructureEstimate,
  calculateCompleteFinishing,
  estimateConstructionDuration,
  compareWorkforceScenarios,
  calculateFullHouseEstimate,
  calculateProjectHealthScore,
  calculateWhatIfScenario
} from "../index.ts";

describe("BuildCost Connect Calculation Engine Test Suite", () => {
  describe("Area and Plot Calculations", () => {
    it("converts 1 Marla to 225 sqft in CDA/Modern standard", () => {
      const sqft = convertArea(1, "marla", "sqft", 225);
      expect(sqft).toBe(225);
    });

    it("converts 1 Marla to 272.25 sqft in Traditional Punjab standard", () => {
      const sqft = convertArea(1, "marla", "sqft", 272.25);
      expect(sqft).toBe(272.25);
    });

    it("converts 1 Kanal to 20 Marlas", () => {
      const marlas = convertArea(1, "kanal", "marla", 225);
      expect(marlas).toBe(20);
    });

    it("calculates plot geometry accurately for a 5 Marla plot (25x45 ft)", () => {
      const plot = calculatePlotGeometry(25, 45, 225);
      expect(plot.plotAreaSqft).toBe(1125);
      expect(plot.marla).toBe(5);
      expect(plot.sqyd).toBe(125);
    });

    it("calculates zoning coverage and FAR correctly", () => {
      const coverage = calculateZoningCoverage(2250, 1500, 3000);
      expect(coverage.groundCoveragePercent).toBeCloseTo(66.67, 1);
      expect(coverage.floorAreaRatio).toBeCloseTo(1.333, 2);
      expect(coverage.openAreaSqft).toBe(750);
    });

    it("rejects negative plot dimensions", () => {
      expect(() => calculatePlotGeometry(-10, 45, 225)).toThrow();
    });
  });

  describe("Concrete Calculations", () => {
    it("calculates wet and dry volume using 1.54 factor for 10x10x1 slab", () => {
      const result = calculateConcrete(10, 10, 1, "1:2:4", 5);
      expect(result.wetVolumeCft).toBe(100);
      expect(result.dryVolumeCft).toBe(154);
      // For 1:2:4 (Sum = 7): Cement = 154 * (1/7) = 22 cft. Bags = 22 / 1.25 = 17.6 bags. + 5% wastage = ~19 bags.
      expect(result.cementBags).toBe(19);
      // Sand = 154 * (2/7) = 44 cft. + 5% wastage = ~46.2 cft
      expect(result.sandCft).toBeCloseTo(46.2, 1);
      // Crush = 154 * (4/7) = 88 cft. + 5% wastage = ~92.4 cft
      expect(result.crushCft).toBeCloseTo(92.4, 1);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("rejects invalid mix ratio", () => {
      expect(() => calculateConcrete(10, 10, 1, "invalid_mix")).toThrow();
    });
  });

  describe("Brickwork Calculations", () => {
    it("calculates bricks and mortar for 10ft x 10ft 9-inch wall with 1 door opening", () => {
      // 10ft x 10ft = 100 sqft wall. Door = 21 sqft (3x7ft). Net area = 79 sqft.
      // Net volume = 79 * (9/12) = 59.25 CFT.
      // Raw bricks @ 13.5 bricks/cft = 799.875 bricks. + 5% wastage = ~840 bricks.
      const result = calculateBrickwork(10, 10, 9, 21, "1:5", 5);
      expect(result.netMasonryCft).toBeCloseTo(59.25, 1);
      expect(result.bricksCount).toBe(840);
      expect(result.cementBags).toBeGreaterThan(0);
      expect(result.sandCft).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("rejects openings larger than the wall itself", () => {
      expect(() => calculateBrickwork(10, 10, 9, 150)).toThrow();
    });
  });

  describe("Plaster Calculations", () => {
    it("calculates plaster mortar and bags for 500 sqft wall with 0.5 inch thickness", () => {
      const result = calculatePlaster(500, 0, 0.5, "1:4", 7);
      expect(result.netAreaSqft).toBe(500);
      // 500 * (0.5/12) = 20.83 CFT wet. Dry = 20.83 * 1.27 = 26.46 CFT.
      expect(result.dryVolumeCft).toBeCloseTo(26.46, 1);
      expect(result.cementBags).toBeGreaterThan(0);
      expect(result.sandCft).toBeGreaterThan(0);
      expect(result.costPerSqft).toBeGreaterThan(0);
    });
  });

  describe("Steel Calculations", () => {
    it("computes rebar weight using D^2 / 162.2 for 12mm rebar", () => {
      // Unit weight = 144 / 162.2 = ~0.8878 kg/m
      // For 10 bars of 12 meters: raw = 0.8878 * 12 * 10 = ~106.5 kg. + 4% wastage = ~110.8 kg.
      const result = calculateSteelWeight(12, 12, 10, 4, 260);
      expect(result.finalWeightKg).toBeCloseTo(110.8, 1);
      expect(result.cost).toBeGreaterThan(0);
      expect(result.disclaimer).toBeDefined();
    });

    it("estimates structural steel from concrete volume", () => {
      const result = estimateStructuralSteel(1000, "slab", 4, 260);
      expect(result.finalWeightKg).toBeGreaterThan(0);
      expect(result.finalWeightTons).toBeGreaterThan(0);
    });
  });

  describe("Flooring and Paint Calculations", () => {
    it("calculates 60x60cm (24x24 in) porcelain tile requirements", () => {
      // 200 sqft room. 24x24 in tile = 4 sqft. Raw tiles = 50. + 7% wastage = 54 tiles.
      const result = calculateFlooring(200, 24, 24, 4, 7);
      expect(result.totalTilesCount).toBe(54);
      expect(result.tileBoxCount).toBe(14);
      expect(result.adhesiveBags).toBeGreaterThan(0);
    });

    it("calculates paint and primer requirements", () => {
      const result = calculatePaint(1000, 2, true, true, 5);
      expect(result.paintLitres).toBeGreaterThan(0);
      expect(result.primerLitres).toBeGreaterThan(0);
      expect(result.puttyKg).toBeGreaterThan(0);
    });
  });

  describe("Complete House Estimator & Price Simulator", () => {
    it("produces full 30-category estimate for a 5 Marla 2-story house (2200 sqft covered area)", () => {
      const estimate = calculateCompleteHouseEstimate({
        plotAreaMarla: 5,
        marlaSqft: 225,
        coveredAreaSqft: 2200,
        numberOfFloors: 2,
        quality: "standard",
        cityId: "isb",
        cityName: "Islamabad"
      });

      expect(estimate.totalCoveredAreaSqft).toBe(2200);
      expect(estimate.grandTotal).toBeGreaterThan(5000000); // Realistic multi-million PKR total
      expect(estimate.costPerSqft).toBeGreaterThan(2500);
      expect(estimate.materials.length).toBeGreaterThan(0);
      expect(estimate.labour.length).toBeGreaterThan(0);
      expect(estimate.assumptions.length).toBeGreaterThan(0);
    });

    it("simulates What-If price scenarios correctly", () => {
      const base = calculateCompleteHouseEstimate({
        plotAreaMarla: 5,
        marlaSqft: 225,
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        quality: "standard",
        cityId: "lhe",
        cityName: "Lahore"
      });

      const scenario = simulatePriceScenario(base, {
        cementPct: 10,
        steelPct: 15,
        bricksPct: -5,
        labourPct: 8,
        finishingPct: 5
      });

      expect(scenario.scenarioTotal).toBeGreaterThan(scenario.originalTotal);
      expect(scenario.deltaAmount).toBe(scenario.scenarioTotal - scenario.originalTotal);
      expect(scenario.deltaPercentage).toBeGreaterThan(0);
    });

    it("correctly increases brickwork and cement quantities when wall height is increased", () => {
      const standardHeight = calculateCompleteHouseEstimate({
        plotAreaMarla: 5,
        marlaSqft: 225,
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        quality: "standard",
        cityId: "isb",
        cityName: "Islamabad",
        buildingHeights: {
          foundationDepthFt: 4.5,
          plinthHeightFt: 3.0,
          parapetWallHeightFt: 3.5,
          floors: [
            { floorNumber: 0, floorName: "Ground Floor", coveredAreaSqft: 1000, floorToFloorHeightFt: 10.5, clearCeilingHeightFt: 9.5, wallHeightFt: 9.5 },
            { floorNumber: 1, floorName: "First Floor", coveredAreaSqft: 1000, floorToFloorHeightFt: 10.0, clearCeilingHeightFt: 9.5, wallHeightFt: 9.5 }
          ]
        }
      });

      const highCeiling = calculateCompleteHouseEstimate({
        plotAreaMarla: 5,
        marlaSqft: 225,
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        quality: "standard",
        cityId: "isb",
        cityName: "Islamabad",
        buildingHeights: {
          foundationDepthFt: 4.5,
          plinthHeightFt: 3.0,
          parapetWallHeightFt: 3.5,
          floors: [
            { floorNumber: 0, floorName: "Ground Floor", coveredAreaSqft: 1000, floorToFloorHeightFt: 12.0, clearCeilingHeightFt: 11.0, wallHeightFt: 11.0 },
            { floorNumber: 1, floorName: "First Floor", coveredAreaSqft: 1000, floorToFloorHeightFt: 11.5, clearCeilingHeightFt: 10.5, wallHeightFt: 10.5 }
          ]
        }
      });

      const stdBricks = standardHeight.materials.find((m) => m.materialId === "bricks")!.finalQuantity;
      const highBricks = highCeiling.materials.find((m) => m.materialId === "bricks")!.finalQuantity;
      expect(highBricks).toBeGreaterThan(stdBricks);

      // Verify that assumptions record the configured heights
      const groundAssumption = highCeiling.assumptions.find((a) => a.key === "floorHeight_0");
      expect(groundAssumption).toBeDefined();
      expect(groundAssumption?.value).toContain("11 ft");
    });
  });

  describe("Phase 1.1: Advanced Construction Estimation Suite", () => {
    it("calculates batch columns with multiple column types (Type A & Type B)", () => {
      const res = calculateColumns([
        { name: "Type A (12x12)", lengthInches: 12, widthInches: 12, heightFt: 10, quantity: 12 },
        { name: "Type B (9x12)", lengthInches: 9, widthInches: 12, heightFt: 10, quantity: 8 }
      ]);
      expect(res.totalVolumeCft).toBeGreaterThan(0);
      expect(res.totalCementBags).toBeGreaterThan(0);
      expect(res.totalSteelKg).toBeGreaterThan(0);
      expect(res.disclaimer).toContain("Construction Estimation");
    });

    it("calculates roof slab concrete and rebar correctly", () => {
      const res = calculateRoofSlab([
        { lengthFt: 50, widthFt: 30, thicknessInches: 5.5 }
      ]);
      expect(res.totalAreaSqft).toBe(1500);
      expect(res.breakdown.cementBags).toBeGreaterThan(50);
      expect(res.breakdown.steelKg).toBeGreaterThan(1000);
    });

    it("calculates brick masonry with door and window opening deductions", () => {
      const withOpenings = calculateBrickMasonry({
        wallLengthFt: 60,
        wallHeightFt: 10,
        wallThicknessInches: 9,
        openings: [
          { name: "Main Door", widthFt: 4, heightFt: 7, quantity: 1 },
          { name: "Window", widthFt: 5, heightFt: 4, quantity: 2 }
        ]
      });

      const withoutOpenings = calculateBrickMasonry({
        wallLengthFt: 60,
        wallHeightFt: 10,
        wallThicknessInches: 9
      });

      expect(withOpenings.netMasonryVolumeCft).toBeLessThan(withoutOpenings.netMasonryVolumeCft);
      expect(withOpenings.finalBricks).toBeLessThan(withoutOpenings.finalBricks);
      expect(withOpenings.openingDeductionAreaSqft).toBe(68); // 28 + 40
    });

    it("calculates complete Grey Structure with itemized quantities and wastage", () => {
      const grey = calculateGreyStructureEstimate({
        coveredAreaSqft: 2000,
        numberOfFloors: 2
      });

      expect(grey.materials.cement.finalQuantity).toBeGreaterThan(grey.materials.cement.requiredQuantity);
      expect(grey.materials.cement.wastagePercent).toBe(3);
      expect(grey.materials.steel.wastagePercent).toBe(4);
      expect(grey.costs.grandTotal).toBeGreaterThan(2000000);
      expect(grey.costs.costPerSqft).toBeGreaterThan(1200);
    });

    it("calculates 17-category Finishing Estimator", () => {
      const fin = calculateCompleteFinishing({
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        quality: "standard"
      });

      expect(fin.categories.plaster.totalCost).toBeGreaterThan(0);
      expect(fin.categories.tiles.totalCost).toBeGreaterThan(0);
      expect(fin.categories.electrical.totalCost).toBeGreaterThan(0);
      expect(fin.grandTotal).toBeGreaterThan(1500000);
    });

    it("estimates construction duration and compares workforce scenarios", () => {
      const dur = estimateConstructionDuration(2000, { mistriCount: 2, labourCount: 3 });
      expect(dur.estimatedWorkingDays).toBeGreaterThan(30);
      expect(dur.disclaimer).toContain("Estimated duration only");

      const scenarios = compareWorkforceScenarios(2000);
      expect(scenarios.scenarios.length).toBe(3);
      // Accelerated team should finish faster than Economy team
      expect(scenarios.scenarios[2].estimatedDays).toBeLessThan(scenarios.scenarios[0].estimatedDays);
    });

    it("calculates Full Project Estimate combining Grey, Finishing, and Contingency", () => {
      const full = calculateFullHouseEstimate({
        plotAreaMarla: 5,
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        quality: "standard"
      });

      expect(full.summary.totalProjectEstimate).toBeGreaterThan(full.summary.greyStructureCost);
      expect(full.floorBreakdown.length).toBe(2);
      expect(full.percentages.greyStructurePercent + full.percentages.finishingPercent + full.percentages.labourPercent).toBeLessThanOrEqual(100);
      expect(full.progressiveLifecycle.length).toBe(6);
    });

    it("evaluates Project Health Score with realistic parameters", () => {
      const healthy = calculateProjectHealthScore({
        totalBudget: 10000000,
        actualCost: 3500000,
        estimatedCost: 10000000,
        physicalProgressPercent: 38,
        procurementProgressPercent: 40
      });
      expect(healthy.score).toBeGreaterThanOrEqual(80);
      expect(healthy.status).toBe("ON TRACK");

      const atRisk = calculateProjectHealthScore({
        totalBudget: 5000000,
        actualCost: 6200000, // Over budget
        estimatedCost: 5000000,
        physicalProgressPercent: 45,
        daysDelayed: 45,
        vendorOverdueAmount: 800000
      });
      expect(atRisk.score).toBeLessThan(60);
      expect(atRisk.status).toBe("AT RISK");
      expect(atRisk.recommendations.length).toBeGreaterThan(0);
    });

    it("simulates What-If price swings accurately", () => {
      const result = calculateWhatIfScenario({
        baseTotalCost: 10000000,
        components: [
          { name: "Steel", originalCost: 2500000, percentageChange: 10 },
          { name: "Cement", originalCost: 1500000, percentageChange: 5 }
        ]
      });

      // Steel +10% = +250k, Cement +5% = +75k, total delta = +325k
      expect(result.totalCostDifference).toBe(325000);
      expect(result.newTotalCost).toBe(10325000);
      expect(result.percentageDifference).toBe(3.25);
      expect(result.components[0].newCost).toBe(2750000);
    });
  });
});


