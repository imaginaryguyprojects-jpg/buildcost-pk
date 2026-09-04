"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCompleteHouseEstimate = calculateCompleteHouseEstimate;
const config_1 = require("@buildcost/config");
function calculateCompleteHouseEstimate(input) {
    const { coveredAreaSqft, quality, numberOfFloors, marlaSqft } = input;
    if (coveredAreaSqft <= 0) {
        throw new Error("Covered area must be greater than zero");
    }
    // Quality multipliers (base: standard = 1.0)
    const qualityMultipliers = {
        economy: { baseRatePerSqft: 2900, finishingMultiplier: 0.8 },
        standard: { baseRatePerSqft: 3600, finishingMultiplier: 1.0 },
        premium: { baseRatePerSqft: 4500, finishingMultiplier: 1.35 },
        luxury: { baseRatePerSqft: 5800, finishingMultiplier: 1.8 },
        custom: { baseRatePerSqft: 3600, finishingMultiplier: 1.0 }
    };
    const selectedTier = qualityMultipliers[quality] || qualityMultipliers.standard;
    // Rate overrides or defaults
    const cementRate = input.customCementRate ?? 1450; // per bag
    const steelRate = input.customSteelRate ?? 260; // per kg
    const brickRate = input.customBrickRate ?? 14; // per brick (Rs 14,000 / 1000)
    const sandRate = input.customSandRate ?? 45; // per cft
    const crushRate = input.customCrushRate ?? 65; // per cft
    // Empirical engineering material consumption per sqft of covered area for typical Pakistani RCC residential construction
    // Cement: ~0.45 to 0.50 bags per sqft of covered area (grey structure + plaster)
    const totalCementBags = Math.round(coveredAreaSqft * 0.48);
    // Steel: ~3.5 to 4.2 kg per sqft of covered area (Grade 60)
    const totalSteelKg = Math.round(coveredAreaSqft * 3.8);
    // Bricks: ~18 to 22 bricks per sqft of covered area (internal + external walls)
    const totalBricks = Math.round(coveredAreaSqft * 20);
    // Sand: ~1.8 CFT per sqft of covered area
    const totalSandCft = Math.round(coveredAreaSqft * 1.8);
    // Crush / Bajri: ~1.4 CFT per sqft of covered area
    const totalCrushCft = Math.round(coveredAreaSqft * 1.4);
    const cementCost = totalCementBags * cementRate;
    const steelCost = totalSteelKg * steelRate;
    const bricksCost = totalBricks * brickRate;
    const sandCost = totalSandCft * sandRate;
    const crushCost = totalCrushCft * crushRate;
    // Raw civil/structural materials
    const greyMaterialsCost = cementCost + steelCost + bricksCost + sandCost + crushCost;
    // Finishing materials based on quality tier (Flooring, Paint, Woodwork, Sanitary, Plumbing, Electrical, Aluminium/Glass)
    const finishingCostPerSqft = (selectedTier.baseRatePerSqft * 0.38) * selectedTier.finishingMultiplier;
    const finishingMaterialsCost = Math.round(coveredAreaSqft * finishingCostPerSqft);
    const totalMaterialsCost = greyMaterialsCost + finishingMaterialsCost;
    // Labour Cost: Typically ~22% to 25% of total project value in Pakistan
    const labourRatePerSqft = Math.round(selectedTier.baseRatePerSqft * 0.23);
    const totalLabourCost = Math.round(coveredAreaSqft * labourRatePerSqft);
    // Transport Cost: ~3.5%
    const totalTransportCost = Math.round(totalMaterialsCost * 0.04);
    // Equipment & Shuttering Machinery Cost: ~2.5%
    const totalEquipmentCost = Math.round(coveredAreaSqft * 85);
    // Contingency & Unforeseen Allowance: 5%
    const subtotalBeforeContingency = totalMaterialsCost + totalLabourCost + totalTransportCost + totalEquipmentCost;
    const contingencyCost = Math.round(subtotalBeforeContingency * 0.05);
    // Site Prep, Approvals, Testing & Municipal: ~2%
    const otherCost = Math.round(subtotalBeforeContingency * 0.02);
    const grandTotal = subtotalBeforeContingency + contingencyCost + otherCost;
    const costPerSqft = Math.round(grandTotal / coveredAreaSqft);
    const materials = [
        {
            materialId: "cement",
            materialName: "Portland Cement (50kg Bag)",
            category: "civil",
            rawQuantity: Math.round(totalCementBags * 0.95),
            wastagePercent: 5,
            wastageQuantity: Math.round(totalCementBags * 0.05),
            finalQuantity: totalCementBags,
            unit: "bag",
            unitRate: cementRate,
            cost: cementCost,
            isCustomRate: !!input.customCementRate
        },
        {
            materialId: "steel",
            materialName: "Deformed Rebar Grade 60",
            category: "structural",
            rawQuantity: Math.round(totalSteelKg * 0.96),
            wastagePercent: 4,
            wastageQuantity: Math.round(totalSteelKg * 0.04),
            finalQuantity: totalSteelKg,
            unit: "kg",
            unitRate: steelRate,
            cost: steelCost,
            isCustomRate: !!input.customSteelRate
        },
        {
            materialId: "bricks",
            materialName: "Red Clay Bricks (Awwal)",
            category: "masonry",
            rawQuantity: Math.round(totalBricks * 0.95),
            wastagePercent: 5,
            wastageQuantity: Math.round(totalBricks * 0.05),
            finalQuantity: totalBricks,
            unit: "piece",
            unitRate: brickRate,
            cost: bricksCost,
            isCustomRate: !!input.customBrickRate
        },
        {
            materialId: "sand",
            materialName: "Chenab/Ravi Sand",
            category: "civil",
            rawQuantity: Math.round(totalSandCft * 0.95),
            wastagePercent: 5,
            wastageQuantity: Math.round(totalSandCft * 0.05),
            finalQuantity: totalSandCft,
            unit: "cft",
            unitRate: sandRate,
            cost: sandCost,
            isCustomRate: !!input.customSandRate
        },
        {
            materialId: "crush",
            materialName: "Margalla/Sargodha Crush (Bajri)",
            category: "civil",
            rawQuantity: Math.round(totalCrushCft * 0.95),
            wastagePercent: 5,
            wastageQuantity: Math.round(totalCrushCft * 0.05),
            finalQuantity: totalCrushCft,
            unit: "cft",
            unitRate: crushRate,
            cost: crushCost,
            isCustomRate: !!input.customCrushRate
        },
        {
            materialId: "finishing_bundle",
            materialName: `Architectural Finishing Package (${quality.toUpperCase()} Tier)`,
            category: "finishing",
            rawQuantity: coveredAreaSqft,
            wastagePercent: 0,
            wastageQuantity: 0,
            finalQuantity: coveredAreaSqft,
            unit: "sqft",
            unitRate: Math.round(finishingCostPerSqft),
            cost: finishingMaterialsCost
        }
    ];
    const labour = [
        { role: "Civil & Masonry Team", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.45), cost: Math.round(totalLabourCost * 0.45) },
        { role: "Steel Fixing & Shuttering", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.25), cost: Math.round(totalLabourCost * 0.25) },
        { role: "Plumbing & Sanitary", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) },
        { role: "Electrical Installation", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) },
        { role: "Paint & Polish Application", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) }
    ];
    const assumptions = [
        { key: "marlaStandard", label: "Marla Standard", value: `${marlaSqft} sqft / Marla` },
        { key: "qualityTier", label: "Construction Specification Tier", value: quality.toUpperCase() },
        { key: "floors", label: "Number of Floors", value: numberOfFloors },
        { key: "cityRates", label: "Target City Market", value: input.cityName },
        { key: "disclaimer", label: "Legal Notice", value: config_1.BRAND_CONFIG.disclaimer }
    ];
    return {
        materialsCost: totalMaterialsCost,
        labourCost: totalLabourCost,
        equipmentCost: totalEquipmentCost,
        transportCost: totalTransportCost,
        finishingCost: finishingMaterialsCost,
        contingencyCost,
        otherCost,
        grandTotal,
        totalCoveredAreaSqft: coveredAreaSqft,
        costPerSqft,
        materials,
        labour,
        assumptions
    };
}
