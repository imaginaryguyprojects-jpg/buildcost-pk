export interface CityDefinition {
    id: string;
    name: string;
    urduName: string;
    province: "Federal" | "Punjab" | "Sindh" | "KPK" | "Balochistan" | "AJK" | "Gilgit-Baltistan";
    defaultMarlaSqft: number;
    isActive: boolean;
}
export declare const PAKISTANI_CITIES: CityDefinition[];
export declare const PAK_CITIES: CityDefinition[];
