import { AreaUnit } from "@buildcost/config";
/**
 * Converts area from one unit to another using the designated Marla standard
 */
export declare function convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit, marlaSqft?: number): number;
export interface PlotGeometryResult {
    plotAreaSqft: number;
    marla: number;
    kanal: number;
    sqyd: number;
    sqm: number;
}
export declare function calculatePlotGeometry(frontFt: number, depthFt: number, marlaSqft?: number): PlotGeometryResult;
export interface ZoningCoverageResult {
    groundCoveragePercent: number;
    floorAreaRatio: number;
    openAreaSqft: number;
    openAreaPercent: number;
}
export declare function calculateZoningCoverage(plotAreaSqft: number, groundCoveredAreaSqft: number, totalCoveredAreaSqft: number): ZoningCoverageResult;
