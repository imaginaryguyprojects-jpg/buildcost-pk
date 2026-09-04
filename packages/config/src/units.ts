export type LengthUnit = "ft" | "in" | "m" | "cm" | "mm";
export type AreaUnit = "sqft" | "sqyd" | "sqm" | "marla" | "kanal" | "acre";
export type VolumeUnit = "cft" | "cum";
export type WeightUnit = "kg" | "ton" | "mound";
export type CurrencyUnit = "PKR";

export const AREA_CONVERSIONS_TO_SQFT = {
  sqft: 1,
  sqyd: 9,
  sqm: 10.7639104,
  acre: 43560
} as const;

export const LENGTH_CONVERSIONS_TO_FEET = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
  mm: 0.00328084
} as const;
