import { BRAND_CONFIG } from "@buildcost/config";
import { ConstructionQuality, CalculationBreakdown, MaterialRequirement, LabourRequirement, AssumptionRecord, BuildingHeightParameters } from "@buildcost/types";

export interface HouseEstimateInput {
  plotAreaMarla: number;
  marlaSqft: number;
  coveredAreaSqft: number;
  numberOfFloors: number;
  hasBasement?: boolean;
  quality: ConstructionQuality;
  cityId: string;
  cityName: string;
  buildingHeights?: BuildingHeightParameters;
  customCementRate?: number;
  customSteelRate?: number;
  customBrickRate?: number;
  customSandRate?: number;
  customCrushRate?: number;
}

export function calculateCompleteHouseEstimate(input: HouseEstimateInput): CalculationBreakdown {
  const { coveredAreaSqft, quality, numberOfFloors, marlaSqft, buildingHeights } = input;
  if (coveredAreaSqft <= 0) {
    throw new Error("Covered area must be greater than zero");
  }

  // Quality multipliers (base: standard = 1.0)
  const qualityMultipliers: Record<ConstructionQuality, { baseRatePerSqft: number; finishingMultiplier: number }> = {
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

  // Building height and floor-by-floor scaling (Sections 12 & 13)
  // Standard benchmark: 9.5 ft clear wall height, 4.5 ft foundation, 3.0 ft plinth
  let wallHeightMultiplier = 1.0;
  let foundationDepthMultiplier = 1.0;
  let plinthHeightMultiplier = 1.0;

  if (buildingHeights) {
    if (buildingHeights.foundationDepthFt > 0) {
      foundationDepthMultiplier = Math.max(0.7, Math.min(2.0, buildingHeights.foundationDepthFt / 4.5));
    }
    if (buildingHeights.plinthHeightFt > 0) {
      plinthHeightMultiplier = Math.max(0.7, Math.min(2.0, buildingHeights.plinthHeightFt / 3.0));
    }

    if (buildingHeights.floors && buildingHeights.floors.length > 0) {
      const totalFloorArea = buildingHeights.floors.reduce((acc, f) => acc + (f.coveredAreaSqft || 0), 0) || coveredAreaSqft;
      const weightedHeight = buildingHeights.floors.reduce((acc, f) => {
        const area = f.coveredAreaSqft || (coveredAreaSqft / buildingHeights.floors.length);
        const height = f.wallHeightFt || f.floorToFloorHeightFt || 9.5;
        return acc + (area * height);
      }, 0);
      const avgWallHeight = weightedHeight / totalFloorArea;
      wallHeightMultiplier = Math.max(0.7, Math.min(2.0, avgWallHeight / 9.5));
    }
  }

  // Empirical engineering material consumption per sqft of covered area for typical Pakistani RCC residential construction
  // Bricks scale directly with wall height + plinth/foundation masonry
  const baseBricks = Math.round(coveredAreaSqft * 20);
  const totalBricks = Math.round(baseBricks * (0.85 * wallHeightMultiplier + 0.10 * foundationDepthMultiplier + 0.05 * plinthHeightMultiplier));

  // Cement: grey structure RCC + masonry mortar + plaster
  // Concrete remains constant per slab sqft, while plaster and masonry mortar scale with wall height
  const baseCementBags = Math.round(coveredAreaSqft * 0.48);
  const totalCementBags = Math.round(baseCementBags * (0.60 + 0.35 * wallHeightMultiplier + 0.05 * foundationDepthMultiplier));

  // Steel: ~3.5 to 4.2 kg per sqft (columns extend with height)
  const baseSteelKg = Math.round(coveredAreaSqft * 3.8);
  const totalSteelKg = Math.round(baseSteelKg * (0.80 + 0.20 * wallHeightMultiplier));

  // Sand: ~1.8 CFT per sqft
  const totalSandCft = Math.round(coveredAreaSqft * 1.8 * (0.50 + 0.50 * wallHeightMultiplier));

  // Crush / Bajri: ~1.4 CFT per sqft (footings + plinth beam scale with foundation)
  const totalCrushCft = Math.round(coveredAreaSqft * 1.4 * (0.85 + 0.15 * foundationDepthMultiplier));

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

  const materials: MaterialRequirement[] = [
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

  const labour: LabourRequirement[] = [
    { role: "Civil & Masonry Team", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.45), cost: Math.round(totalLabourCost * 0.45) },
    { role: "Steel Fixing & Shuttering", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.25), cost: Math.round(totalLabourCost * 0.25) },
    { role: "Plumbing & Sanitary", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) },
    { role: "Electrical Installation", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) },
    { role: "Paint & Polish Application", quantity: coveredAreaSqft, unit: "sqft", rate: Math.round(labourRatePerSqft * 0.10), cost: Math.round(totalLabourCost * 0.10) }
  ];

  const assumptions: AssumptionRecord[] = [
    { key: "marlaStandard", label: "Marla Standard", value: `${marlaSqft} sqft / Marla` },
    { key: "qualityTier", label: "Construction Specification Tier", value: quality.toUpperCase() },
    { key: "floors", label: "Number of Floors", value: numberOfFloors },
    { key: "cityRates", label: "Target City Market", value: input.cityName },
    { key: "disclaimer", label: "Legal Notice", value: BRAND_CONFIG.disclaimer }
  ];

  if (buildingHeights) {
    assumptions.push({
      key: "foundationDepth",
      label: "Foundation Depth",
      value: `${buildingHeights.foundationDepthFt} ft`
    });
    assumptions.push({
      key: "plinthHeight",
      label: "Plinth Level",
      value: `${buildingHeights.plinthHeightFt} ft`
    });
    if (buildingHeights.floors && buildingHeights.floors.length > 0) {
      buildingHeights.floors.forEach((f) => {
        assumptions.push({
          key: `floorHeight_${f.floorNumber}`,
          label: `${f.floorName} Wall Height`,
          value: `${f.wallHeightFt || 9.5} ft (Floor-to-Floor: ${f.floorToFloorHeightFt || 10.5} ft)`
        });
      });
    }
  }

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
