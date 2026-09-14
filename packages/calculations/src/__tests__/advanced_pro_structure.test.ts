import { describe, it, expect } from "vitest";
import {
  calculateWallVolume,
  calculateBathroomWalls,
  calculateProFoundation,
  calculateProColumns,
  calculateProBeams,
  calculateAdvancedGreyStructure
} from "../advanced_pro_structure";
import { ProConstructionInputs } from "@buildcost/types";

describe("Advanced PRO Construction Engine (v3.0.0)", () => {
  const baseInputs: ProConstructionInputs = {
    isProEnabled: true,
    wallHeightMode: "auto",
    manualWallHeightFt: 10,
    bathroomCountMode: "auto",
    manualBathroomCount: 2,
    bathrooms: [
      { id: "b1", name: "Master Bath", lengthFt: 8, widthFt: 6, heightMode: "auto", heightFt: 10 },
      { id: "b2", name: "Guest Bath", lengthFt: 8, widthFt: 6, heightMode: "auto", heightFt: 10 }
    ],
    applySameBathroomSize: true,
    foundationMode: "auto",
    foundationType: "strip",
    foundationDepthFt: 3.5,
    foundationWidthFt: 2.5,
    columnMode: "auto",
    manualColumnCount: 16,
    columnWidthFt: 1.0,
    columnDepthFt: 1.0,
    columnHeightMode: "auto",
    manualColumnHeightFt: 10,
    beamMode: "auto",
    manualBeamCount: 20,
    beamWidthFt: 0.75,
    beamDepthFt: 1.25,
    beamLengthMode: "auto",
    manualBeamTotalLengthFt: 300
  };

  describe("Wall Volume Calculations", () => {
    it("scales wall volume, bricks, and mortar proportionally when wall height increases", () => {
      const standard10 = calculateWallVolume({
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        wallHeightFt: 10,
        wallThicknessInches: 9
      });
      const high11 = calculateWallVolume({
        coveredAreaSqft: 2000,
        numberOfFloors: 2,
        wallHeightFt: 11,
        wallThicknessInches: 9
      });

      expect(high11.netWallVolumeCft).toBeGreaterThan(standard10.netWallVolumeCft);
      expect(high11.finalBricks).toBeGreaterThan(standard10.finalBricks);
      expect(high11.mortarCementBags).toBeGreaterThan(standard10.mortarCementBags);
      expect(high11.mortarSandCft).toBeGreaterThan(standard10.mortarSandCft);
      expect(high11.finalBricks).toBeCloseTo(standard10.finalBricks * (11 / 10), -2);
    });
  });

  describe("Bathroom Partition Wall Calculations", () => {
    it("computes 0 partition walls when bathroom list is empty", () => {
      const res = calculateBathroomWalls({ bathrooms: [], defaultWallHeightFt: 10 });
      expect(res.bathroomCount).toBe(0);
      expect(res.netWallAreaSqft).toBe(0);
      expect(res.finalBricks).toBe(0);
    });

    it("computes partition masonry for multiple custom bathrooms", () => {
      const bathrooms = [
        { id: "1", name: "Bath 1", lengthFt: 8, widthFt: 6, heightMode: "auto" as const, heightFt: 10 },
        { id: "2", name: "Bath 2", lengthFt: 9, widthFt: 7, heightMode: "auto" as const, heightFt: 10 }
      ];
      const res = calculateBathroomWalls({ bathrooms, defaultWallHeightFt: 10 });
      expect(res.netWallAreaSqft).toBeGreaterThan(0);
      expect(res.finalBricks).toBeGreaterThan(1000);
      expect(res.mortarCementBags).toBeGreaterThan(5);
    });
  });

  describe("Foundation Calculations", () => {
    it("handles strip foundation and scales with depth", () => {
      const shallow = calculateProFoundation({
        buildingFootprintSqft: 2000,
        depthFt: 3,
        widthFt: 2.5,
        foundationType: "strip"
      });
      const deep = calculateProFoundation({
        buildingFootprintSqft: 2000,
        depthFt: 5,
        widthFt: 2.5,
        foundationType: "strip"
      });

      expect(deep.excavationVolumeCft).toBeGreaterThan(shallow.excavationVolumeCft);
      expect(deep.totalFoundationCost).toBeGreaterThan(shallow.totalFoundationCost);
      expect(shallow.pccVolumeCft).toBeGreaterThan(0);
    });

    it("calculates raft foundation correctly", () => {
      const raft = calculateProFoundation({
        buildingFootprintSqft: 2000,
        depthFt: 4,
        widthFt: 3,
        foundationType: "raft"
      });
      expect(raft.rccOrMasonryVolumeCft).toBeGreaterThan(500);
      expect(raft.foundationSteelKg).toBeGreaterThan(1500);
    });
  });

  describe("Columns and Beams Calculations", () => {
    it("scales column concrete and steel as column count changes", () => {
      const col12 = calculateProColumns({ count: 12, widthFt: 1, depthFt: 1, heightFt: 10 });
      const col16 = calculateProColumns({ count: 16, widthFt: 1, depthFt: 1, heightFt: 10 });

      expect(col16.totalVolumeCft).toBeGreaterThan(col12.totalVolumeCft);
      expect(col16.breakdown.steelKg).toBeGreaterThan(col12.breakdown.steelKg);
      expect(col16.shutteringAreaSqft).toBeGreaterThan(col12.shutteringAreaSqft);
    });

    it("scales beam concrete and steel as total length changes", () => {
      const beam200 = calculateProBeams({ totalRunningLengthFt: 200, widthFt: 0.75, depthFt: 1.25 });
      const beam400 = calculateProBeams({ totalRunningLengthFt: 400, widthFt: 0.75, depthFt: 1.25 });

      expect(beam400.totalVolumeCft).toBeCloseTo(beam200.totalVolumeCft * 2, 0);
      expect(beam400.breakdown.steelKg).toBeCloseTo(beam200.breakdown.steelKg * 2, 0);
    });
  });

  describe("Integrated Master Calculation Engine & Zero Double Counting", () => {
    it("produces zero double counting with traceable line items for 10 Marla (225 sqft standard)", () => {
      const res = calculateAdvancedGreyStructure({
        coveredAreaSqft: 3200,
        numberOfFloors: 2,
        plotAreaMarla: 10,
        proInputs: baseInputs
      });

      expect(res.detailedEstimate.breakdown.wallsCost).toBeGreaterThan(0);
      expect(res.detailedEstimate.breakdown.foundationCost).toBeGreaterThan(0);
      expect(res.detailedEstimate.breakdown.columnsCost).toBeGreaterThan(0);
      expect(res.detailedEstimate.breakdown.beamsCost).toBeGreaterThan(0);
      expect(res.detailedEstimate.breakdown.slabsCost).toBeGreaterThan(0);
      expect(res.detailedEstimate.breakdown.bathroomsCost).toBeGreaterThan(0);

      // Total grey cost should equal sum of components
      const b = res.detailedEstimate.breakdown;
      const materialSum =
        b.cementCost +
        b.steelCost +
        b.bricksCost +
        b.sandCost +
        b.crushCost +
        b.labourCost +
        b.transportCost +
        b.wastageCost +
        b.otherCost;

      expect(res.totalCost).toBe(materialSum);
      expect(res.materials.bricks.finalQuantity).toBeGreaterThan(20000);
      expect(res.materials.cement.finalQuantity).toBeGreaterThan(400);
      expect(res.materials.steel.finalQuantity).toBeGreaterThan(3000);
    });

    it("handles 10 Marla with 272.25 sqft standard and 20 Marla (1 Kanal)", () => {
      const res10Traditional = calculateAdvancedGreyStructure({
        coveredAreaSqft: 3800,
        numberOfFloors: 2,
        plotAreaMarla: 10,
        proInputs: baseInputs
      });

      const resKanal = calculateAdvancedGreyStructure({
        coveredAreaSqft: 6500,
        numberOfFloors: 2,
        plotAreaMarla: 20,
        proInputs: {
          ...baseInputs,
          manualColumnCount: 28,
          manualBathroomCount: 4,
          manualBeamTotalLengthFt: 600
        }
      });

      expect(resKanal.totalCost).toBeGreaterThan(res10Traditional.totalCost);
      expect(resKanal.materials.steel.finalQuantity).toBeGreaterThan(res10Traditional.materials.steel.finalQuantity);
    });

    it("accurately changes totals when switching from 10ft to 11ft wall height in manual mode", () => {
      const res10 = calculateAdvancedGreyStructure({
        coveredAreaSqft: 3000,
        numberOfFloors: 2,
        plotAreaMarla: 10,
        proInputs: { ...baseInputs, wallHeightMode: "manual", manualWallHeightFt: 10 }
      });

      const res11 = calculateAdvancedGreyStructure({
        coveredAreaSqft: 3000,
        numberOfFloors: 2,
        plotAreaMarla: 10,
        proInputs: { ...baseInputs, wallHeightMode: "manual", manualWallHeightFt: 11 }
      });

      expect(res11.totalCost).toBeGreaterThan(res10.totalCost);
      expect(res11.materials.bricks.finalQuantity).toBeGreaterThan(res10.materials.bricks.finalQuantity);
      expect(res11.materials.cement.finalQuantity).toBeGreaterThan(res10.materials.cement.finalQuantity);
    });
  });
});
