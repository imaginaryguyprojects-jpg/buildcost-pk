/**
 * BUILDCOST CONNECT — GREY STRUCTURE ESTIMATOR
 * Sections 2, 3, and 11: Shell & structural material and cost calculations
 */

export interface ItemizedMaterialQuantity {
  materialId: string;
  name: string;
  unit: string;
  requiredQuantity: number;
  wastagePercent: number;
  finalQuantity: number;
  unitRate: number;
  totalCost: number;
}

export interface GreyStructureInput {
  coveredAreaSqft: number;
  numberOfFloors: number;
  plotAreaMarla?: number;
  foundationDepthFt?: number; // default 4 ft
  plinthHeightFt?: number; // default 3 ft
  floorHeightFt?: number; // default 10.5 ft
  rates?: {
    cementBagRate?: number; // default 1450
    sandCftRate?: number; // default 45
    crushCftRate?: number; // default 95
    brickRate?: number; // default 14.5
    steelKgRate?: number; // default 260
    labourSqftRate?: number; // default 420
    transportRate?: number; // default 50000
  };
}

export interface GreyStructureSummary {
  coveredAreaSqft: number;
  materials: {
    cement: ItemizedMaterialQuantity;
    sand: ItemizedMaterialQuantity;
    crush: ItemizedMaterialQuantity;
    bricks: ItemizedMaterialQuantity;
    steel: ItemizedMaterialQuantity;
  };
  totalConcreteVolumeCft: number;
  costs: {
    materialCost: number;
    labourCost: number;
    transportCost: number;
    contingencyCost: number;
    grandTotal: number;
    costPerSqft: number;
  };
  elementsBreakdown: {
    foundationCost: number;
    columnsCost: number;
    beamsAndLintelsCost: number;
    roofSlabsCost: number;
    brickMasonryCost: number;
    plinthAndDpcCost: number;
    staircaseCost: number;
  };
  phaseSpecificBreakdown?: {
    brickMasonry: {
      titleEn: string;
      titleUr: string;
      totalCost: number;
      brickCount: number;
      mortarCementBags: number;
      mortarSandCft: number;
      inclusions: string[];
    };
    plastering: {
      titleEn: string;
      titleUr: string;
      totalCost: number;
      plasterAreaSqft: number;
      cementBags: number;
      sandCft: number;
      inclusions: string[];
    };
    roofSlabCasting: {
      titleEn: string;
      titleUr: string;
      totalCost: number;
      slabConcreteCft: number;
      steelKg: number;
      cementBags: number;
      crushCft: number;
      sandCft: number;
      inclusions: string[];
    };
    foundationAndDpc: {
      titleEn: string;
      titleUr: string;
      totalCost: number;
      inclusions: string[];
    };
  };
  disclaimer: string;
}

export function calculateGreyStructureEstimate(input: GreyStructureInput): GreyStructureSummary {
  const area = input.coveredAreaSqft;
  const floors = Math.max(1, input.numberOfFloors);

  // Rates
  const rCement = input.rates?.cementBagRate ?? 1450;
  const rSand = input.rates?.sandCftRate ?? 45;
  const rCrush = input.rates?.crushCftRate ?? 95;
  const rBricks = input.rates?.brickRate ?? 14.5;
  const rSteel = input.rates?.steelKgRate ?? 260;
  const rLabour = input.rates?.labourSqftRate ?? 420;
  const rTransport = input.rates?.transportRate ?? Math.round(area * 35);

  // 1. Structural Concrete volume based on Pakistan empirical standards
  // Slabs (~5 in thick) = area * (5/12)
  const slabConcreteCft = area * (5.5 / 12);
  // Beams & Lintels (~15% of slab volume)
  const beamsConcreteCft = slabConcreteCft * 0.20;
  // Columns (~12% of slab volume)
  const columnsConcreteCft = slabConcreteCft * 0.15;
  // Footings & Plinth Beams
  const footingConcreteCft = (area / floors) * 0.35;

  const totalWetConcreteCft = slabConcreteCft + beamsConcreteCft + columnsConcreteCft + footingConcreteCft;
  const totalDryConcreteCft = totalWetConcreteCft * 1.54;

  // Mix 1:2:4 parts = 7
  const rccCementCft = (totalDryConcreteCft * 1) / 7;
  const rawRccCementBags = rccCementCft / 1.25;
  const rawRccSandCft = (totalDryConcreteCft * 2) / 7;
  const rawRccCrushCft = (totalDryConcreteCft * 4) / 7;

  // Steel: Empirical ~3.8 kg per sqft covered area for standard Pakistani RCC frame
  const reqSteelKg = Math.round(area * 3.85);
  const steelWastage = 4;
  const finSteelKg = Math.ceil(reqSteelKg * (1 + steelWastage / 100));

  // 2. Brickwork: Empirical ~26 bricks per sqft covered area (including foundation & boundary wall)
  const reqBricks = Math.round(area * 26);
  const brickWastage = 5;
  const finBricks = Math.ceil(reqBricks * (1 + brickWastage / 100));

  // Mortar cement & sand for brickwork
  // 1000 bricks need ~1.8 bags cement & ~9 CFT sand
  const brickworkCementBags = Math.ceil((finBricks / 1000) * 1.8);
  const brickworkSandCft = Math.round((finBricks / 1000) * 9.5);

  // Aggregate Raw vs Wastage vs Final
  const reqCementBags = Math.round(rawRccCementBags + brickworkCementBags);
  const cementWastage = 3;
  const finCementBags = Math.ceil(reqCementBags * (1 + cementWastage / 100));

  const reqSandCft = Math.round(rawRccSandCft + brickworkSandCft);
  const sandWastage = 5;
  const finSandCft = Math.round(reqSandCft * (1 + sandWastage / 100));

  const reqCrushCft = Math.round(rawRccCrushCft);
  const crushWastage = 5;
  const finCrushCft = Math.round(reqCrushCft * (1 + crushWastage / 100));

  // Costs
  const costCement = finCementBags * rCement;
  const costSand = finSandCft * rSand;
  const costCrush = finCrushCft * rCrush;
  const costBricks = finBricks * rBricks;
  const costSteel = finSteelKg * rSteel;

  const totalMaterialCost = costCement + costSand + costCrush + costBricks + costSteel;
  const totalLabourCost = Math.round(area * rLabour);
  const totalTransportCost = rTransport;
  const subtotal = totalMaterialCost + totalLabourCost + totalTransportCost;
  const contingencyCost = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + contingencyCost;
  const costPerSqft = Math.round(grandTotal / (area || 1));

  // Element distributions
  const foundationCost = Math.round(grandTotal * 0.16);
  const columnsCost = Math.round(grandTotal * 0.12);
  const beamsAndLintelsCost = Math.round(grandTotal * 0.14);
  const roofSlabsCost = Math.round(grandTotal * 0.28);
  const brickMasonryCost = Math.round(grandTotal * 0.20);
  const plinthAndDpcCost = Math.round(grandTotal * 0.06);
  const staircaseCost = Math.round(grandTotal * 0.04);

  return {
    coveredAreaSqft: area,
    materials: {
      cement: {
        materialId: "cement",
        name: "Portland Cement (50kg Bags)",
        unit: "bags",
        requiredQuantity: reqCementBags,
        wastagePercent: cementWastage,
        finalQuantity: finCementBags,
        unitRate: rCement,
        totalCost: costCement
      },
      sand: {
        materialId: "sand",
        name: "Ravi / Chenab Sand (Rait)",
        unit: "CFT",
        requiredQuantity: reqSandCft,
        wastagePercent: sandWastage,
        finalQuantity: finSandCft,
        unitRate: rSand,
        totalCost: costSand
      },
      crush: {
        materialId: "crush",
        name: "Margalla / Sargodha Crush (Bajri)",
        unit: "CFT",
        requiredQuantity: reqCrushCft,
        wastagePercent: crushWastage,
        finalQuantity: finCrushCft,
        unitRate: rCrush,
        totalCost: costCrush
      },
      bricks: {
        materialId: "bricks",
        name: "Awwal Red Clay Bricks",
        unit: "nos",
        requiredQuantity: reqBricks,
        wastagePercent: brickWastage,
        finalQuantity: finBricks,
        unitRate: rBricks,
        totalCost: costBricks
      },
      steel: {
        materialId: "steel",
        name: "Deformed Grade 60 Steel (Saria)",
        unit: "kg",
        requiredQuantity: reqSteelKg,
        wastagePercent: steelWastage,
        finalQuantity: finSteelKg,
        unitRate: rSteel,
        totalCost: costSteel
      }
    },
    totalConcreteVolumeCft: Math.round(totalWetConcreteCft),
    costs: {
      materialCost: totalMaterialCost,
      labourCost: totalLabourCost,
      transportCost: totalTransportCost,
      contingencyCost,
      grandTotal,
      costPerSqft
    },
    elementsBreakdown: {
      foundationCost,
      columnsCost,
      beamsAndLintelsCost,
      roofSlabsCost,
      brickMasonryCost,
      plinthAndDpcCost,
      staircaseCost
    },
    phaseSpecificBreakdown: {
      brickMasonry: {
        titleEn: "Brick Masonry (Walls)",
        titleUr: "دیواریں چڑھانا",
        totalCost: brickMasonryCost,
        brickCount: finBricks,
        mortarCementBags: brickworkCementBags,
        mortarSandCft: brickworkSandCft,
        inclusions: [
          "Awwal red clay kiln-fired bricks (اول اینٹیں)",
          "1:6 & 1:4 cement-sand mortar mixing (سیمنٹ ریت کا مسالہ)",
          "9-inch load-bearing exterior perimeter walls",
          "4.5-inch interior room partition walls",
          "Roof parapet walls & boundary wall construction",
          "Mason (Mistry) & labour laying with vertical plumb check"
        ]
      },
      plastering: {
        titleEn: "Cement Plastering",
        titleUr: "پلستر کرنا",
        totalCost: Math.round(grandTotal * 0.12),
        plasterAreaSqft: Math.round(area * 3.4),
        cementBags: Math.ceil((area * 3.4 * (0.5 / 12) / 1.25) * 0.25),
        sandCft: Math.round(area * 3.4 * (0.5 / 12) * 0.75 * 1.54),
        inclusions: [
          "Internal 0.5-inch 1:4 cement-sand smooth plaster (اندرونی پلستر)",
          "External 0.75-inch 1:3 weather-resistant plaster (بیرونی پلستر)",
          "Ceiling underside chip-free plastering (چھت کا پلستر)",
          "Chicken wire mesh (مرغی جالی) on RCC-brick joints to prevent cracks",
          "Scaffolding (بانس پہاڑ) and 7-day water curing (ترائی)"
        ]
      },
      roofSlabCasting: {
        titleEn: "RCC Roof Slab Casting & Framing",
        titleUr: "چھت ڈالنا اور لنٹر",
        totalCost: roofSlabsCost + beamsAndLintelsCost,
        slabConcreteCft: Math.round(slabConcreteCft),
        steelKg: finSteelKg,
        cementBags: Math.ceil(rawRccCementBags),
        crushCft: finCrushCft,
        sandCft: Math.round(rawRccSandCft),
        inclusions: [
          "Grade 60 deformed steel rebar bending and binding (سریے کی باندھائی)",
          "1:2:4 ratio Margalla / Sargodha crushed stone concrete (1:2:4 لنٹر)",
          "Steel/marine ply shuttering formwork with prop supports (شٹرنگ)",
          "Electrical conduit pipe & fan box embedding before casting",
          "Mechanical vibrator compaction & 14-day continuous pond curing (ترائی)"
        ]
      },
      foundationAndDpc: {
        titleEn: "Excavation, Foundation & DPC",
        titleUr: "بنیادیں اور ڈی پی سی",
        totalCost: foundationCost + plinthAndDpcCost,
        inclusions: [
          "Trench excavation up to solid soil depth (4–5 ft)",
          "Termite chemical treatment spray (دیمک سپرے)",
          "Lean concrete (1:4:8) soling base",
          "Stepped brick foundation with reinforced plinth beam",
          "Double layer bitumen DPC with polythene sheet (نمی سے بچاؤ)"
        ]
      }
    },
    disclaimer:
      "Construction Estimation only. Does NOT include finishing works. Structural engineering verification required."
  };
}
