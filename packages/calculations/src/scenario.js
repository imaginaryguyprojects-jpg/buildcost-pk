"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatePriceScenario = simulatePriceScenario;
function simulatePriceScenario(base, adjustments) {
    let scenarioMaterials = 0;
    for (const mat of base.materials) {
        let adjustmentFactor = 1.0;
        if (mat.materialId === "cement")
            adjustmentFactor += adjustments.cementPct / 100;
        else if (mat.materialId === "steel")
            adjustmentFactor += adjustments.steelPct / 100;
        else if (mat.materialId === "bricks")
            adjustmentFactor += adjustments.bricksPct / 100;
        else if (mat.category === "finishing")
            adjustmentFactor += adjustments.finishingPct / 100;
        scenarioMaterials += mat.cost * adjustmentFactor;
    }
    const labourFactor = 1.0 + adjustments.labourPct / 100;
    const scenarioLabour = Math.round(base.labourCost * labourFactor);
    const transportFactor = 1.0 + (adjustments.transportPct ?? 0) / 100;
    const scenarioTransport = Math.round(base.transportCost * transportFactor);
    const subtotal = scenarioMaterials + scenarioLabour + scenarioTransport + base.equipmentCost + base.otherCost;
    const scenarioContingency = Math.round(subtotal * 0.05);
    const scenarioTotal = Math.round(subtotal + scenarioContingency);
    const deltaAmount = scenarioTotal - base.grandTotal;
    const deltaPercentage = base.grandTotal > 0 ? (deltaAmount / base.grandTotal) * 100 : 0;
    const scenarioCostPerSqft = base.totalCoveredAreaSqft > 0 ? Math.round(scenarioTotal / base.totalCoveredAreaSqft) : 0;
    return {
        originalTotal: base.grandTotal,
        scenarioTotal,
        deltaAmount,
        deltaPercentage: Math.round(deltaPercentage * 100) / 100,
        originalCostPerSqft: base.costPerSqft,
        scenarioCostPerSqft,
        breakdown: {
            originalMaterials: base.materialsCost,
            scenarioMaterials: Math.round(scenarioMaterials),
            originalLabour: base.labourCost,
            scenarioLabour,
            originalTransport: base.transportCost,
            scenarioTransport,
            contingency: scenarioContingency
        }
    };
}
