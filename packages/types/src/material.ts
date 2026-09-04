export type MaterialCategoryKey =
  | "civil"
  | "structural"
  | "masonry"
  | "plaster"
  | "flooring"
  | "paint"
  | "electrical"
  | "plumbing"
  | "woodwork"
  | "aluminium"
  | "sanitary"
  | "insulation";

export interface MaterialCategory {
  id: string;
  key: MaterialCategoryKey;
  name: string;
  description?: string;
  sortOrder: number;
}

export type MaterialUnit = "bag" | "kg" | "ton" | "brick" | "1000_bricks" | "cft" | "cum" | "sqft" | "box" | "litre" | "piece";

export interface Material {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  specification: string;
  brand?: string;
  unit: MaterialUnit;
  defaultWastagePercent: number;
  isActive: boolean;
}
