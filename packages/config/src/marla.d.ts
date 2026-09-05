export interface MarlaStandardDefinition {
    id: string;
    name: string;
    sqft: number;
    description: string;
    regions: string[];
    isDefault?: boolean;
}
export declare const MARLA_STANDARDS: MarlaStandardDefinition[];
