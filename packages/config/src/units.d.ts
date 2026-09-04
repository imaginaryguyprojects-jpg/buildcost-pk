export type LengthUnit = "ft" | "in" | "m" | "cm" | "mm";
export type AreaUnit = "sqft" | "sqyd" | "sqm" | "marla" | "kanal" | "acre";
export type VolumeUnit = "cft" | "cum";
export type WeightUnit = "kg" | "ton" | "mound";
export type CurrencyUnit = "PKR";
export declare const AREA_CONVERSIONS_TO_SQFT: {
    readonly sqft: 1;
    readonly sqyd: 9;
    readonly sqm: 10.7639104;
    readonly acre: 43560;
};
export declare const LENGTH_CONVERSIONS_TO_FEET: {
    readonly ft: 1;
    readonly in: number;
    readonly m: 3.28084;
    readonly cm: 0.0328084;
    readonly mm: 0.00328084;
};
