"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBrickwork = calculateBrickwork;
const config_1 = require("@buildcost/config");
function calculateBrickwork(wallLengthFt, wallHeightFt, wallThicknessIn = 9, openingsSqft = 0, mortarMixKey = "1:5", wastagePercent = 5, rates = { brickPerThousand: 14000, cementPerBag: 1450, sandPerCft: 45, masonPerSqft: 40 }) {
    if (wallLengthFt <= 0 || wallHeightFt <= 0 || wallThicknessIn <= 0) {
        throw new Error("Wall dimensions must be positive numbers");
    }
    const thicknessFt = wallThicknessIn / 12;
    const grossWallAreaSqft = wallLengthFt * wallHeightFt;
    if (openingsSqft >= grossWallAreaSqft) {
        throw new Error("Openings area cannot be greater than or equal to total wall area");
    }
    const netWallAreaSqft = grossWallAreaSqft - openingsSqft;
    const grossVolumeCft = grossWallAreaSqft * thicknessFt;
    const deductionVolumeCft = openingsSqft * thicknessFt;
    const netMasonryCft = netWallAreaSqft * thicknessFt;
    // Brick estimation (13.5 bricks/cft standard)
    const bricksPerCft = config_1.CONSTRUCTION_DEFAULTS.brickwork.bricksPerCftStandard;
    const rawBricksCount = netMasonryCft * bricksPerCft;
    const finalBricksCount = Math.ceil(rawBricksCount * (1 + wastagePercent / 100));
    // Mortar calculation: 28% of net masonry volume
    const mortarWetCft = netMasonryCft * config_1.CONSTRUCTION_DEFAULTS.brickwork.mortarPercentageOfVolume;
    const mortarDryCft = mortarWetCft * config_1.CONSTRUCTION_DEFAULTS.brickwork.mortarWetToDryFactor; // 1.27
    const mix = config_1.CONSTRUCTION_DEFAULTS.brickwork.mortarMixRatios[mortarMixKey] ||
        config_1.CONSTRUCTION_DEFAULTS.brickwork.mortarMixRatios["1:5"];
    const totalParts = mix.cement + mix.sand;
    const rawCementCft = mortarDryCft * (mix.cement / totalParts);
    const rawCementBags = rawCementCft / config_1.CONSTRUCTION_DEFAULTS.concrete.cementBagVolumeCft;
    const rawSandCft = mortarDryCft * (mix.sand / totalParts);
    const finalCementBags = Math.ceil(rawCementBags * (1 + wastagePercent / 100));
    const finalSandCft = Math.round(rawSandCft * (1 + wastagePercent / 100) * 10) / 10;
    const bricksCost = (finalBricksCount / 1000) * rates.brickPerThousand;
    const cementCost = finalCementBags * rates.cementPerBag;
    const sandCost = finalSandCft * rates.sandPerCft;
    const labourCost = netWallAreaSqft * (rates.masonPerSqft ?? 0);
    const totalCost = bricksCost + cementCost + sandCost + labourCost;
    const materials = [
        {
            materialId: "bricks",
            materialName: "Red Clay Bricks (Awwal / A-Grade)",
            category: "masonry",
            rawQuantity: Math.round(rawBricksCount),
            wastagePercent,
            wastageQuantity: finalBricksCount - Math.round(rawBricksCount),
            finalQuantity: finalBricksCount,
            unit: "piece",
            unitRate: rates.brickPerThousand / 1000,
            cost: bricksCost
        },
        {
            materialId: "cement",
            materialName: "Portland Cement (50kg Bag)",
            category: "civil",
            rawQuantity: Math.round(rawCementBags * 10) / 10,
            wastagePercent,
            wastageQuantity: Math.round((finalCementBags - rawCementBags) * 10) / 10,
            finalQuantity: finalCementBags,
            unit: "bag",
            unitRate: rates.cementPerBag,
            cost: cementCost
        },
        {
            materialId: "sand",
            materialName: "Chenab/Ravi Sand (Mortar)",
            category: "civil",
            rawQuantity: Math.round(rawSandCft * 10) / 10,
            wastagePercent,
            wastageQuantity: Math.round((finalSandCft - rawSandCft) * 10) / 10,
            finalQuantity: finalSandCft,
            unit: "cft",
            unitRate: rates.sandPerCft,
            cost: sandCost
        }
    ];
    const assumptions = [
        { key: "brickStandard", label: "Bricks per CFT", value: bricksPerCft, formulaDescription: "13.5 Bricks per CFT (Nominal 9x4.5x3 in)" },
        { key: "mortarRatio", label: "Mortar Mix Ratio", value: mortarMixKey, formulaDescription: mix.name },
        { key: "mortarVolume", label: "Mortar Space Allowance", value: "28% of Masonry Volume" },
        { key: "wastage", label: "Wastage Allowance", value: `${wastagePercent}%` }
    ];
    return {
        grossVolumeCft: Math.round(grossVolumeCft * 100) / 100,
        deductionVolumeCft: Math.round(deductionVolumeCft * 100) / 100,
        netMasonryCft: Math.round(netMasonryCft * 100) / 100,
        bricksCount: finalBricksCount,
        mortarDryVolumeCft: Math.round(mortarDryCft * 100) / 100,
        cementBags: finalCementBags,
        sandCft: finalSandCft,
        bricksCost: Math.round(bricksCost),
        cementCost: Math.round(cementCost),
        sandCost: Math.round(sandCost),
        labourCost: Math.round(labourCost),
        totalCost: Math.round(totalCost),
        materials,
        assumptions
    };
}
