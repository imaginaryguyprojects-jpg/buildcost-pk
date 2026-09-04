export declare const CONSTRUCTION_DEFAULTS: {
    readonly concrete: {
        readonly wetToDryFactor: 1.54;
        readonly cementBagVolumeCft: 1.25;
        readonly cementBagWeightKg: 50;
        readonly mixRatios: Record<string, {
            cement: number;
            sand: number;
            crush: number;
            name: string;
        }>;
        readonly defaultMix: "1:2:4";
        readonly defaultWastagePercent: 5;
    };
    readonly brickwork: {
        readonly nominalBrickLengthIn: 9;
        readonly nominalBrickWidthIn: 4.5;
        readonly nominalBrickHeightIn: 3;
        readonly bricksPerCftStandard: 13.5;
        readonly mortarPercentageOfVolume: 0.28;
        readonly mortarWetToDryFactor: 1.27;
        readonly mortarMixRatios: {
            readonly "1:4": {
                readonly cement: 1;
                readonly sand: 4;
                readonly name: "1:4 (Load-bearing 9-inch walls, high strength)";
            };
            readonly "1:5": {
                readonly cement: 1;
                readonly sand: 5;
                readonly name: "1:5 (Standard internal partition walls)";
            };
            readonly "1:6": {
                readonly cement: 1;
                readonly sand: 6;
                readonly name: "1:6 (General non-load-bearing 4.5-inch partitions)";
            };
        };
        readonly defaultMortarMix: "1:5";
        readonly defaultWastagePercent: 5;
    };
    readonly plaster: {
        readonly defaultThicknessInches: 0.5;
        readonly ceilingThicknessInches: 0.375;
        readonly externalThicknessInches: 0.75;
        readonly wetToDryFactor: 1.27;
        readonly mixRatios: {
            readonly "1:4": {
                readonly cement: 1;
                readonly sand: 4;
                readonly name: "1:4 (Internal plaster - smooth finish)";
            };
            readonly "1:3": {
                readonly cement: 1;
                readonly sand: 3;
                readonly name: "1:3 (External plaster & ceilings - weather resistant)";
            };
            readonly "1:5": {
                readonly cement: 1;
                readonly sand: 5;
                readonly name: "1:5 (Economy internal plaster)";
            };
        };
        readonly defaultMix: "1:4";
        readonly defaultWastagePercent: 7;
    };
    readonly paint: {
        readonly coverageSqftPerLitre: 120;
        readonly primerCoverageSqftPerLitre: 140;
        readonly puttyCoverageSqftPerKg: 15;
        readonly defaultCoats: 2;
        readonly defaultWastagePercent: 5;
    };
    readonly flooring: {
        readonly defaultWastagePercent: 7;
        readonly adhesiveBagCoverageSqft: 40;
    };
    readonly steel: {
        readonly densityKgPerCum: 7850;
        readonly rccSlabSteelPercent: 1;
        readonly rccBeamSteelPercent: 1.8;
        readonly rccColumnSteelPercent: 2.5;
        readonly rccFootingSteelPercent: 0.9;
        readonly defaultWastagePercent: 4;
    };
};
