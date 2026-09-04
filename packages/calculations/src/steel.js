"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSteelWeight = calculateSteelWeight;
exports.estimateStructuralSteel = estimateStructuralSteel;
const config_1 = require("@buildcost/config");
/**
 * Calculates standard weight of rebar using D^2 / 162.2 (kg/m)
 */
function calculateSteelWeight(diameterMm, lengthMeters, numberOfBars = 1, wastagePercent = 4, ratePerKg = 260) {
    if (diameterMm <= 0 || lengthMeters <= 0 || numberOfBars <= 0) {
        throw new Error("Rebar parameters must be positive numbers");
    }
    // Weight formula: (D^2 / 162.2) * length in meters
    const unitWeightKgPerM = (diameterMm * diameterMm) / 162.2;
    const rawWeightKg = unitWeightKgPerM * lengthMeters * numberOfBars;
    const wastageFactor = 1 + wastagePercent / 100;
    const finalWeightKg = Math.round(rawWeightKg * wastageFactor * 10) / 10;
    const finalWeightTons = Math.round((finalWeightKg / 1000) * 1000) / 1000;
    const cost = Math.round(finalWeightKg * ratePerKg);
    const materials = [
        {
            materialId: "steel",
            materialName: `Deformed Steel Bar Grade 60 (#${Math.round(diameterMm / 3.175)} / ${diameterMm}mm)`,
            category: "structural",
            rawQuantity: Math.round(rawWeightKg * 10) / 10,
            wastagePercent,
            wastageQuantity: Math.round((finalWeightKg - rawWeightKg) * 10) / 10,
            finalQuantity: finalWeightKg,
            unit: "kg",
            unitRate: ratePerKg,
            cost
        }
    ];
    const assumptions = [
        {
            key: "unitWeightFormula",
            label: "Unit Weight Formula",
            value: `${Math.round(unitWeightKgPerM * 1000) / 1000} kg/m`,
            formulaDescription: `Weight = (D² / 162.2) = (${diameterMm}² / 162.2) = ${Math.round(unitWeightKgPerM * 1000) / 1000} kg/m`
        },
        { key: "barsCount", label: "Total Number of Bars", value: numberOfBars },
        { key: "barLength", label: "Length per Bar", value: `${lengthMeters} m (${Math.round(lengthMeters * 3.28084)} ft)` },
        { key: "wastage", label: "Lap / Cutting Wastage", value: `${wastagePercent}%` }
    ];
    return {
        weightKg: Math.round(rawWeightKg * 10) / 10,
        weightTons: Math.round((rawWeightKg / 1000) * 1000) / 1000,
        wastageWeightKg: Math.round((finalWeightKg - rawWeightKg) * 10) / 10,
        finalWeightKg,
        finalWeightTons,
        cost,
        materials,
        assumptions,
        disclaimer: config_1.BRAND_CONFIG.structuralSteelDisclaimer
    };
}
/**
 * Empirical rule-of-thumb structural steel estimation based on concrete volume
 */
function estimateStructuralSteel(concreteVolumeCft, memberType = "slab", wastagePercent = 4, ratePerKg = 260) {
    if (concreteVolumeCft <= 0) {
        throw new Error("Concrete volume must be positive");
    }
    let steelPercentage = config_1.CONSTRUCTION_DEFAULTS.steel.rccSlabSteelPercent; // 1.0%
    if (memberType === "beam")
        steelPercentage = config_1.CONSTRUCTION_DEFAULTS.steel.rccBeamSteelPercent; // 1.8%
    if (memberType === "column")
        steelPercentage = config_1.CONSTRUCTION_DEFAULTS.steel.rccColumnSteelPercent; // 2.5%
    if (memberType === "footing")
        steelPercentage = config_1.CONSTRUCTION_DEFAULTS.steel.rccFootingSteelPercent; // 0.9%
    // 1 CFT = 0.0283168 m3. Steel density = 7850 kg/m3.
    // Concrete volume in m3:
    const concreteVolumeM3 = concreteVolumeCft * 0.0283168;
    const rawWeightKg = concreteVolumeM3 * (steelPercentage / 100) * config_1.CONSTRUCTION_DEFAULTS.steel.densityKgPerCum;
    const finalWeightKg = Math.round(rawWeightKg * (1 + wastagePercent / 100) * 10) / 10;
    const finalWeightTons = Math.round((finalWeightKg / 1000) * 1000) / 1000;
    const cost = Math.round(finalWeightKg * ratePerKg);
    const materials = [
        {
            materialId: "steel",
            materialName: `Deformed Steel Bar Grade 60 (${memberType.toUpperCase()} Estimated)`,
            category: "structural",
            rawQuantity: Math.round(rawWeightKg * 10) / 10,
            wastagePercent,
            wastageQuantity: Math.round((finalWeightKg - rawWeightKg) * 10) / 10,
            finalQuantity: finalWeightKg,
            unit: "kg",
            unitRate: ratePerKg,
            cost
        }
    ];
    const assumptions = [
        { key: "memberType", label: "Structural Member", value: memberType.toUpperCase() },
        {
            key: "steelRuleOfThumb",
            label: "Steel Percentage of Concrete Volume",
            value: `${steelPercentage}%`,
            formulaDescription: `Density: 7,850 kg/m³. Approx ${(Math.round((rawWeightKg / concreteVolumeCft) * 10) / 10)} kg per CFT of concrete.`
        },
        { key: "wastage", label: "Wastage Allowance", value: `${wastagePercent}%` }
    ];
    return {
        weightKg: Math.round(rawWeightKg * 10) / 10,
        weightTons: Math.round((rawWeightKg / 1000) * 1000) / 1000,
        wastageWeightKg: Math.round((finalWeightKg - rawWeightKg) * 10) / 10,
        finalWeightKg,
        finalWeightTons,
        cost,
        materials,
        assumptions,
        disclaimer: config_1.BRAND_CONFIG.structuralSteelDisclaimer
    };
}
