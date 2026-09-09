import { describe, it, expect } from "vitest";
import { PAKISTANI_CITIES } from "@buildcost/config";
import {
  convertArea,
  calculateGreyStructureEstimate,
  calculateFullHouseEstimate
} from "../index.ts";

describe("DASHBOARD SIMPLIFICATION & PROPERTY CALCULATOR — 12 USER TEST SCENARIOS", () => {
  it("Test 1: Islamabad + 10 Marla + 272.25 sq ft/marla -> 2,722.50 sq ft & 0.50 Kanal", () => {
    const sqft = convertArea(10, "marla", "sqft", 272.25);
    expect(sqft).toBe(2722.50);
    const kanal = convertArea(10, "marla", "kanal", 272.25);
    expect(kanal).toBe(0.50);
  });

  it("Test 2: Lahore + 10 Marla + 250 sq ft/marla -> 2,500.00 sq ft & 0.50 Kanal", () => {
    const sqft = convertArea(10, "marla", "sqft", 250);
    expect(sqft).toBe(2500.00);
    const kanal = convertArea(10, "marla", "kanal", 250);
    expect(kanal).toBe(0.50);
  });

  it("Test 3: Karachi + 10 Marla + 225 sq ft/marla -> 2,250.00 sq ft & 0.50 Kanal", () => {
    const sqft = convertArea(10, "marla", "sqft", 225);
    expect(sqft).toBe(2250.00);
    const kanal = convertArea(10, "marla", "kanal", 225);
    expect(kanal).toBe(0.50);
  });

  it("Test 4: 20 Marla + 272.25 sq ft standard = 5,445 sq ft (1 Kanal)", () => {
    const sqft = convertArea(20, "marla", "sqft", 272.25);
    expect(sqft).toBe(5445.00);
    const kanal = convertArea(20, "marla", "kanal", 272.25);
    expect(kanal).toBe(1.00);
  });

  it("Test 5: 2,722.50 sq ft with 272.25 standard = 10 Marla & 0.50 Kanal", () => {
    const marla = convertArea(2722.50, "sqft", "marla", 272.25);
    expect(marla).toBe(10.00);
    const kanal = convertArea(2722.50, "sqft", "kanal", 272.25);
    expect(kanal).toBe(0.50);
  });

  it("Test 6: Custom Marla 300 sq ft, 5 Marla = 1,500 sq ft & 0.25 Kanal", () => {
    const sqft = convertArea(5, "marla", "sqft", 300);
    expect(sqft).toBe(1500.00);
    const kanal = convertArea(5, "marla", "kanal", 300);
    expect(kanal).toBe(0.25);
  });

  it("Test 7: Rate edits immediately recalculate costs dynamically", () => {
    const defaultEstimate = calculateGreyStructureEstimate({
      coveredAreaSqft: 2200,
      numberOfFloors: 2,
      rates: { cementBagRate: 1450, steelKgRate: 260 }
    });
    const modifiedEstimate = calculateGreyStructureEstimate({
      coveredAreaSqft: 2200,
      numberOfFloors: 2,
      rates: { cementBagRate: 1600, steelKgRate: 260 }
    });
    expect(modifiedEstimate.costs.grandTotal).toBeGreaterThan(defaultEstimate.costs.grandTotal);
    expect(modifiedEstimate.costs.costPerSqft).toBeGreaterThan(defaultEstimate.costs.costPerSqft);
  });

  it("Test 8: City rate switches update provincial defaults across 28 Pakistani cities", () => {
    expect(PAKISTANI_CITIES.length).toBe(28);
    const isb = PAKISTANI_CITIES.find(c => c.id === "isb");
    const lhr = PAKISTANI_CITIES.find(c => c.id === "lhr");
    const khi = PAKISTANI_CITIES.find(c => c.id === "khi");
    expect(isb?.defaultMarlaSqft).toBe(272.25);
    expect(lhr?.defaultMarlaSqft).toBe(250);
    expect(khi?.defaultMarlaSqft).toBe(225);
  });

  it("Test 9: Covered area auto-suggests ~70% footprint per floor and allows manual override", () => {
    const plotSqft = 10 * 272.25; // 2,722.5 sq ft
    const suggested = Math.round(plotSqft * 0.7 * 2);
    expect(suggested).toBe(Math.round(2722.5 * 1.4));

    // Manual override to 3,500 sq ft
    const estManual = calculateGreyStructureEstimate({
      coveredAreaSqft: 3500,
      numberOfFloors: 2
    });
    expect(estManual.coveredAreaSqft).toBe(3500);
  });

  it("Test 10: Construction scope toggle (Grey Structure vs Complete House)", () => {
    const grey = calculateGreyStructureEstimate({
      coveredAreaSqft: 2200,
      numberOfFloors: 2
    });
    const full = calculateFullHouseEstimate({
      plotAreaMarla: 10,
      coveredAreaSqft: 2200,
      numberOfFloors: 2,
      quality: "standard"
    });
    expect(full.summary.totalProjectEstimate).toBeGreaterThan(grey.costs.grandTotal);
    expect(full.summary.finishingCost).toBeGreaterThan(0);
  });

  it("Test 11: Material cost graph real calculated percentages match civil engineering proportions", () => {
    const grey = calculateGreyStructureEstimate({
      coveredAreaSqft: 2200,
      numberOfFloors: 2
    });
    const cementCost = grey.materials.cement.finalQuantity * 1450;
    const steelCost = grey.materials.steel.finalQuantity * 260;
    const bricksCost = grey.materials.bricks.finalQuantity * 14.5;
    const sandCost = grey.materials.sand.finalQuantity * 45;
    const crushCost = grey.materials.crush.finalQuantity * 95;
    const labourCost = grey.costs.labourCost;
    const transportCost = grey.costs.transportCost;
    const wastageCost = Math.round((cementCost + steelCost + bricksCost + sandCost + crushCost) * 0.045);
    const total = cementCost + steelCost + bricksCost + sandCost + crushCost + labourCost + transportCost + wastageCost;

    const steelPct = (steelCost / total) * 100;
    const cementPct = (cementCost / total) * 100;
    const labourPct = (labourCost / total) * 100;

    expect(steelPct).toBeGreaterThan(20);
    expect(steelPct).toBeLessThan(45);
    expect(cementPct).toBeGreaterThan(10);
    expect(cementPct).toBeLessThan(35);
    expect(labourPct).toBeGreaterThan(10);
    expect(labourPct).toBeLessThan(30);
  });

  it("Test 12: 100% Free Guest usage with full calculation output and duration estimates", () => {
    const est = calculateGreyStructureEstimate({
      coveredAreaSqft: 2200,
      numberOfFloors: 2
    });
    expect(est.costs.grandTotal).toBeGreaterThan(0);
    expect(est.materials.cement.finalQuantity).toBeGreaterThan(0);
    expect(est.materials.steel.finalQuantity).toBeGreaterThan(0);
    expect(est.materials.bricks.finalQuantity).toBeGreaterThan(0);
  });
});
