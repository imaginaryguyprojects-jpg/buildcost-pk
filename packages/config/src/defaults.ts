export const CONSTRUCTION_DEFAULTS = {
  // Concrete Constants
  concrete: {
    wetToDryFactor: 1.54, // Industry standard dry shrinkage allowance
    cementBagVolumeCft: 1.25, // 50kg cement bag = 1.25 CFT
    cementBagWeightKg: 50,
    mixRatios: {
      "1:2:4": { cement: 1, sand: 2, crush: 4, name: "1:2:4 (Nominal Mix - Beams, Slabs, General RCC)" },
      "1:1.5:3": { cement: 1, sand: 1.5, crush: 3, name: "1:1.5:3 (Standard Structural RCC - Columns, Heavy Footings)" },
      "1:1:2": { cement: 1, sand: 1, crush: 2, name: "1:1:2 (High Strength RCC - Water Tanks, Retaining Walls)" },
      "1:4:8": { cement: 1, sand: 4, crush: 8, name: "1:4:8 (PCC / Lean Concrete Foundation Bed)" }
    } as Record<string, { cement: number; sand: number; crush: number; name: string }>,
    defaultMix: "1:2:4",
    defaultWastagePercent: 5
  },

  // Brickwork Constants
  brickwork: {
    nominalBrickLengthIn: 9,
    nominalBrickWidthIn: 4.5,
    nominalBrickHeightIn: 3,
    bricksPerCftStandard: 13.5, // Standard practical rule of thumb in Pakistan
    mortarPercentageOfVolume: 0.28, // ~28% volume occupied by mortar
    mortarWetToDryFactor: 1.27, // Dry volume multiplier for cement-sand mortar
    mortarMixRatios: {
      "1:4": { cement: 1, sand: 4, name: "1:4 (Load-bearing 9-inch walls, high strength)" },
      "1:5": { cement: 1, sand: 5, name: "1:5 (Standard internal partition walls)" },
      "1:6": { cement: 1, sand: 6, name: "1:6 (General non-load-bearing 4.5-inch partitions)" }
    },
    defaultMortarMix: "1:5",
    defaultWastagePercent: 5
  },

  // Plaster Constants
  plaster: {
    defaultThicknessInches: 0.5, // 1/2 inch (12-15mm)
    ceilingThicknessInches: 0.375, // 3/8 inch (10mm)
    externalThicknessInches: 0.75, // 3/4 inch (20mm)
    wetToDryFactor: 1.27,
    mixRatios: {
      "1:4": { cement: 1, sand: 4, name: "1:4 (Internal plaster - smooth finish)" },
      "1:3": { cement: 1, sand: 3, name: "1:3 (External plaster & ceilings - weather resistant)" },
      "1:5": { cement: 1, sand: 5, name: "1:5 (Economy internal plaster)" }
    },
    defaultMix: "1:4",
    defaultWastagePercent: 7
  },

  // Paint Constants
  paint: {
    coverageSqftPerLitre: 120, // Average 2 coats coverage per litre
    primerCoverageSqftPerLitre: 140,
    puttyCoverageSqftPerKg: 15,
    defaultCoats: 2,
    defaultWastagePercent: 5
  },

  // Flooring Constants
  flooring: {
    defaultWastagePercent: 7, // 5-8% for tiles cutting and borders
    adhesiveBagCoverageSqft: 40 // ~20kg bag covers 35-45 sqft
  },

  // Steel / Rebar Empirical Rules of Thumb (Estimating only)
  steel: {
    densityKgPerCum: 7850,
    // Structural steel consumption per CFT of RCC
    rccSlabSteelPercent: 1.0, // 1.0% of concrete volume (~2.2 kg/cft)
    rccBeamSteelPercent: 1.8, // 1.8% of concrete volume (~4.0 kg/cft)
    rccColumnSteelPercent: 2.5, // 2.5% of concrete volume (~5.5 kg/cft)
    rccFootingSteelPercent: 0.9, // 0.9% of concrete volume (~2.0 kg/cft)
    defaultWastagePercent: 4
  }
} as const;
