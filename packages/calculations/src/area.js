"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertArea = convertArea;
exports.calculatePlotGeometry = calculatePlotGeometry;
exports.calculateZoningCoverage = calculateZoningCoverage;
const config_1 = require("@buildcost/config");
/**
 * Converts area from one unit to another using the designated Marla standard
 */
function convertArea(value, fromUnit, toUnit, marlaSqft = 225) {
    if (value < 0)
        throw new Error("Area cannot be negative");
    if (fromUnit === toUnit)
        return value;
    // Convert fromUnit to sqft
    let sqft = 0;
    if (fromUnit === "marla") {
        sqft = value * marlaSqft;
    }
    else if (fromUnit === "kanal") {
        sqft = value * 20 * marlaSqft;
    }
    else {
        sqft = value * config_1.AREA_CONVERSIONS_TO_SQFT[fromUnit];
    }
    // Convert sqft to toUnit
    if (toUnit === "marla") {
        return sqft / marlaSqft;
    }
    else if (toUnit === "kanal") {
        return sqft / (20 * marlaSqft);
    }
    else {
        return sqft / config_1.AREA_CONVERSIONS_TO_SQFT[toUnit];
    }
}
function calculatePlotGeometry(frontFt, depthFt, marlaSqft = 225) {
    if (frontFt <= 0 || depthFt <= 0) {
        throw new Error("Plot dimensions must be greater than zero");
    }
    const plotAreaSqft = frontFt * depthFt;
    return {
        plotAreaSqft,
        marla: plotAreaSqft / marlaSqft,
        kanal: plotAreaSqft / (20 * marlaSqft),
        sqyd: plotAreaSqft / 9,
        sqm: plotAreaSqft / 10.7639104
    };
}
function calculateZoningCoverage(plotAreaSqft, groundCoveredAreaSqft, totalCoveredAreaSqft) {
    if (plotAreaSqft <= 0)
        throw new Error("Plot area must be greater than zero");
    if (groundCoveredAreaSqft > plotAreaSqft) {
        throw new Error("Ground covered area cannot exceed total plot area");
    }
    const groundCoveragePercent = (groundCoveredAreaSqft / plotAreaSqft) * 100;
    const floorAreaRatio = totalCoveredAreaSqft / plotAreaSqft;
    const openAreaSqft = plotAreaSqft - groundCoveredAreaSqft;
    const openAreaPercent = (openAreaSqft / plotAreaSqft) * 100;
    return {
        groundCoveragePercent,
        floorAreaRatio,
        openAreaSqft,
        openAreaPercent
    };
}
