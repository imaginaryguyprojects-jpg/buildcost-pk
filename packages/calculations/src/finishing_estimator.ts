/**
 * BUILDCOST CONNECT — FINISHING ESTIMATOR
 * Sections 12–17: Dedicated 17-category finishing estimation engine
 */

export interface FinishingCategoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  materialCost: number;
  labourCost: number;
  totalCost: number;
  details?: string;
}

export interface FinishingInput {
  coveredAreaSqft: number;
  numberOfFloors: number;
  quality?: "economy" | "standard" | "premium" | "luxury";
  rates?: {
    plasterLabourPerSqft?: number;
    tileLabourPerSqft?: number;
    marbleLabourPerSqft?: number;
    paintLabourPerSqft?: number;
    electricalPointRate?: number;
    plumbingBathRate?: number;
  };
}

export interface CompleteFinishingSummary {
  coveredAreaSqft: number;
  quality: "economy" | "standard" | "premium" | "luxury";
  categories: {
    plaster: FinishingCategoryItem;
    flooring: FinishingCategoryItem;
    tiles: FinishingCategoryItem;
    marble: FinishingCategoryItem;
    paint: FinishingCategoryItem;
    doors: FinishingCategoryItem;
    windows: FinishingCategoryItem;
    aluminium: FinishingCategoryItem;
    glass: FinishingCategoryItem;
    falseCeiling: FinishingCategoryItem;
    kitchen: FinishingCategoryItem;
    wardrobes: FinishingCategoryItem;
    sanitary: FinishingCategoryItem;
    electrical: FinishingCategoryItem;
    plumbing: FinishingCategoryItem;
    waterproofing: FinishingCategoryItem;
    otherFinishing: FinishingCategoryItem;
  };
  totalMaterialCost: number;
  totalLabourCost: number;
  grandTotal: number;
  costPerSqft: number;
}

export function calculateCompleteFinishing(input: FinishingInput): CompleteFinishingSummary {
  const area = input.coveredAreaSqft;
  const quality = input.quality ?? "standard";

  // Quality multipliers affecting material grades
  const qMultiplier =
    quality === "economy" ? 0.75 : quality === "standard" ? 1.0 : quality === "premium" ? 1.4 : 1.85;

  // Approximate surface areas based on covered area:
  // Plaster area (internal + external) = ~3.6x covered area
  const plasterAreaSqft = Math.round(area * 3.6);
  const plasterMatCost = Math.round(plasterAreaSqft * 32 * qMultiplier);
  const plasterLabCost = Math.round(plasterAreaSqft * (input.rates?.plasterLabourPerSqft ?? 24));

  // Flooring & Tiles: ~80% of covered area gets tile/marble
  const tileAreaSqft = Math.round(area * 0.55);
  const tileMatCost = Math.round(tileAreaSqft * 165 * qMultiplier);
  const tileLabCost = Math.round(tileAreaSqft * (input.rates?.tileLabourPerSqft ?? 45));

  const marbleAreaSqft = Math.round(area * 0.25);
  const marbleMatCost = Math.round(marbleAreaSqft * 210 * qMultiplier);
  const marbleLabCost = Math.round(marbleAreaSqft * (input.rates?.marbleLabourPerSqft ?? 65));

  // Paint: Internal walls + ceilings = ~3.2x covered area
  const paintAreaSqft = Math.round(area * 3.2);
  const paintMatCost = Math.round(paintAreaSqft * 28 * qMultiplier);
  const paintLabCost = Math.round(paintAreaSqft * (input.rates?.paintLabourPerSqft ?? 18));

  // Woodwork & Doors (~1 door per 200 sqft)
  const doorsCount = Math.max(4, Math.round(area / 200));
  const doorUnitRate = quality === "economy" ? 18000 : quality === "standard" ? 32000 : quality === "premium" ? 55000 : 85000;
  const doorsMatCost = doorsCount * doorUnitRate;
  const doorsLabCost = doorsCount * 3500;

  // Windows & Aluminium (~1 window per 250 sqft)
  const windowsSqft = Math.round(area * 0.12);
  const winRate = quality === "economy" ? 550 : quality === "standard" ? 850 : 1350;
  const windowsMatCost = Math.round(windowsSqft * winRate);
  const windowsLabCost = Math.round(windowsSqft * 120);

  // False Ceiling: ~40% of rooms
  const ceilingSqft = Math.round(area * 0.45);
  const ceilingMatCost = Math.round(ceilingSqft * 95 * qMultiplier);
  const ceilingLabCost = Math.round(ceilingSqft * 35);

  // Kitchen Cabinetry & Granite
  const kitchensCount = Math.max(1, Math.round(area / 2200));
  const kitchenBase = quality === "economy" ? 150000 : quality === "standard" ? 320000 : quality === "premium" ? 650000 : 1100000;
  const kitchenMatCost = kitchensCount * kitchenBase;
  const kitchenLabCost = kitchensCount * 45000;

  // Wardrobes
  const bedroomsCount = Math.max(2, Math.round(area / 450));
  const wardrobeBase = quality === "economy" ? 60000 : quality === "standard" ? 120000 : 220000;
  const wardrobeMatCost = bedroomsCount * wardrobeBase;
  const wardrobeLabCost = bedroomsCount * 18000;

  // Sanitary & Bathroom Fixtures
  const bathsCount = bedroomsCount + 1;
  const bathBase = quality === "economy" ? 55000 : quality === "standard" ? 115000 : quality === "premium" ? 220000 : 380000;
  const sanitaryMatCost = bathsCount * bathBase;
  const sanitaryLabCost = bathsCount * 15000;

  // Electrical Wiring, Switch Plates, Lighting
  const electricalMatCost = Math.round(area * 140 * qMultiplier);
  const electricalLabCost = Math.round(area * 48);

  // Plumbing & Drainage
  const plumbingMatCost = Math.round(area * 110 * qMultiplier);
  const plumbingLabCost = Math.round(area * 38);

  // Waterproofing (Roofs, bathrooms, water tank)
  const wpAreaSqft = Math.round(area * 0.40);
  const wpMatCost = Math.round(wpAreaSqft * 45 * qMultiplier);
  const wpLabCost = Math.round(wpAreaSqft * 20);

  // Glass, Aluminium railings, miscellaneous
  const glassMatCost = Math.round(area * 35 * qMultiplier);
  const glassLabCost = Math.round(area * 12);

  const otherMatCost = Math.round(area * 40);
  const otherLabCost = Math.round(area * 15);

  const categories = {
    plaster: {
      id: "plaster",
      name: "Internal & External Plaster",
      unit: "sqft",
      quantity: plasterAreaSqft,
      materialCost: plasterMatCost,
      labourCost: plasterLabCost,
      totalCost: plasterMatCost + plasterLabCost,
      details: "Cement, sand mortar mix (1:4 internal, 1:3 external)"
    },
    flooring: {
      id: "flooring",
      name: "Subfloor Screed & Base Preparation",
      unit: "sqft",
      quantity: Math.round(area * 0.85),
      materialCost: Math.round(area * 0.85 * 30),
      labourCost: Math.round(area * 0.85 * 18),
      totalCost: Math.round(area * 0.85 * 48),
      details: "PCC floor bed and screed leveling"
    },
    tiles: {
      id: "tiles",
      name: "Porcelain & Ceramic Tiles",
      unit: "sqft",
      quantity: tileAreaSqft,
      materialCost: tileMatCost,
      labourCost: tileLabCost,
      totalCost: tileMatCost + tileLabCost,
      details: "Living areas, bathrooms, and kitchen tiles + bond adhesive"
    },
    marble: {
      id: "marble",
      name: "Marble & Granite Countertops",
      unit: "sqft",
      quantity: marbleAreaSqft,
      materialCost: marbleMatCost,
      labourCost: marbleLabCost,
      totalCost: marbleMatCost + marbleLabCost,
      details: "Stairs treads, vanity tops, and borders with polishing"
    },
    paint: {
      id: "paint",
      name: "Wall Putty, Primer & Emulsion Paint",
      unit: "sqft",
      quantity: paintAreaSqft,
      materialCost: paintMatCost,
      labourCost: paintLabCost,
      totalCost: paintMatCost + paintLabCost,
      details: "2 coats putty, 1 coat primer, 2-3 coats premium emulsion"
    },
    doors: {
      id: "doors",
      name: "Internal & Main Entrance Doors",
      unit: "leaves",
      quantity: doorsCount,
      materialCost: doorsMatCost,
      labourCost: doorsLabCost,
      totalCost: doorsMatCost + doorsLabCost,
      details: "Engineered solid wood frames, locks, and handles"
    },
    windows: {
      id: "windows",
      name: "Windows & Glazing",
      unit: "sqft",
      quantity: windowsSqft,
      materialCost: windowsMatCost,
      labourCost: windowsLabCost,
      totalCost: windowsMatCost + windowsLabCost,
      details: "Powder-coated aluminium frames with 5mm/6mm tinted glass"
    },
    aluminium: {
      id: "aluminium",
      name: "Aluminium Sections & Profiles",
      unit: "kg",
      quantity: Math.round(windowsSqft * 1.5),
      materialCost: Math.round(windowsSqft * 45),
      labourCost: Math.round(windowsSqft * 20),
      totalCost: Math.round(windowsSqft * 65),
      details: "Heavy commercial 1.6mm gauge sections"
    },
    glass: {
      id: "glass",
      name: "Shower Cabins & Glass Railings",
      unit: "sqft",
      quantity: Math.round(area * 0.06),
      materialCost: glassMatCost,
      labourCost: glassLabCost,
      totalCost: glassMatCost + glassLabCost,
      details: "10mm/12mm tempered safety glass"
    },
    falseCeiling: {
      id: "false_ceiling",
      name: "False Ceiling (Gypsum / POP)",
      unit: "sqft",
      quantity: ceilingSqft,
      materialCost: ceilingMatCost,
      labourCost: ceilingLabCost,
      totalCost: ceilingMatCost + ceilingLabCost,
      details: "Galvanized channel framing, gypsum boards, and tape"
    },
    kitchen: {
      id: "kitchen",
      name: "Modular Kitchen Cabinetry",
      unit: "kitchens",
      quantity: kitchensCount,
      materialCost: kitchenMatCost,
      labourCost: kitchenLabCost,
      totalCost: kitchenMatCost + kitchenLabCost,
      details: "UV / Acrylic sheet shutters, hydraulic hinges, sink"
    },
    wardrobes: {
      id: "wardrobes",
      name: "Bedroom Built-in Wardrobes",
      unit: "units",
      quantity: bedroomsCount,
      materialCost: wardrobeMatCost,
      labourCost: wardrobeLabCost,
      totalCost: wardrobeMatCost + wardrobeLabCost,
      details: "Tactile laminate finish with internal drawers and hangers"
    },
    sanitary: {
      id: "sanitary",
      name: "Sanitary Ware & Faucets",
      unit: "bathrooms",
      quantity: bathsCount,
      materialCost: sanitaryMatCost,
      labourCost: sanitaryLabCost,
      totalCost: sanitaryMatCost + sanitaryLabCost,
      details: "Commode sets, vanity basins, mixer taps, shower sets"
    },
    electrical: {
      id: "electrical",
      name: "Electrical Wiring, Switches & Fixtures",
      unit: "sqft",
      quantity: area,
      materialCost: electricalMatCost,
      labourCost: electricalLabCost,
      totalCost: electricalMatCost + electricalLabCost,
      details: "Pakistan Cables / Fast Cables, modular switches, LED downlights"
    },
    plumbing: {
      id: "plumbing",
      name: "Plumbing (PPRC & PVC Drainage)",
      unit: "sqft",
      quantity: area,
      materialCost: plumbingMatCost,
      labourCost: plumbingLabCost,
      totalCost: plumbingMatCost + plumbingLabCost,
      details: "IIL / Popular pipes, fittings, overhead water tank, geyser"
    },
    waterproofing: {
      id: "waterproofing",
      name: "Roof & Wet Area Waterproofing",
      unit: "sqft",
      quantity: wpAreaSqft,
      materialCost: wpMatCost,
      labourCost: wpLabCost,
      totalCost: wpMatCost + wpLabCost,
      details: "Bitumen membrane or polymer cementitious coating"
    },
    otherFinishing: {
      id: "other",
      name: "Miscellaneous Finishing Touches",
      unit: "item",
      quantity: 1,
      materialCost: otherMatCost,
      labourCost: otherLabCost,
      totalCost: otherMatCost + otherLabCost,
      details: "Cleaning, exterior gate paint, boundary details"
    }
  };

  const totalMaterialCost = Object.values(categories).reduce((sum, c) => sum + c.materialCost, 0);
  const totalLabourCost = Object.values(categories).reduce((sum, c) => sum + c.labourCost, 0);
  const grandTotal = totalMaterialCost + totalLabourCost;
  const costPerSqft = Math.round(grandTotal / (area || 1));

  return {
    coveredAreaSqft: area,
    quality,
    categories,
    totalMaterialCost,
    totalLabourCost,
    grandTotal,
    costPerSqft
  };
}
