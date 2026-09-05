/**
 * BuildCost Connect — Transport & Logistics Calculator
 * (Section 24 & 25)
 *
 * Models freight, haulage, vehicle trip scheduling, and manual unloading
 * ("Palledari") charges standard to the Pakistani construction industry.
 */

export type VehicleType = "tractor_trolley" | "dumper_truck" | "mazda_truck" | "shehzore_pickup" | "suzuki_ravi";

export interface VehicleCapacity {
  name: string;
  urduName: string;
  defaultTripCost: number; // PKR per typical local haul (10-25 km)
  maxBricks: number;
  maxSandCft: number;
  maxCrushCft: number;
  maxCementBags: number;
  maxSteelTons: number;
  palledariPerTrip: number; // Unloading labour charge in PKR
}

export const PAK_VEHICLE_CAPACITIES: Record<VehicleType, VehicleCapacity> = {
  tractor_trolley: {
    name: "Tractor Trolley",
    urduName: "ٹریکٹر ٹرالی",
    defaultTripCost: 4500,
    maxBricks: 3000,
    maxSandCft: 250,
    maxCrushCft: 250,
    maxCementBags: 120,
    maxSteelTons: 3,
    palledariPerTrip: 1200,
  },
  dumper_truck: {
    name: "Dumper Truck (10-Wheeler)",
    urduName: "ڈمپر ٹرک",
    defaultTripCost: 16000,
    maxBricks: 7000,
    maxSandCft: 750,
    maxCrushCft: 750,
    maxCementBags: 350,
    maxSteelTons: 15,
    palledariPerTrip: 800, // Hydraulic tipping, minimal manual labour
  },
  mazda_truck: {
    name: "Mazda Heavy Truck",
    urduName: "مزدہ ٹرک",
    defaultTripCost: 12000,
    maxBricks: 5000,
    maxSandCft: 450,
    maxCrushCft: 450,
    maxCementBags: 250,
    maxSteelTons: 8,
    palledariPerTrip: 2500,
  },
  shehzore_pickup: {
    name: "Hyundai Shehzore",
    urduName: "شہزور پک اپ",
    defaultTripCost: 3500,
    maxBricks: 1200,
    maxSandCft: 120,
    maxCrushCft: 120,
    maxCementBags: 70,
    maxSteelTons: 2.5,
    palledariPerTrip: 900,
  },
  suzuki_ravi: {
    name: "Suzuki Ravi Pickup",
    urduName: "سوزوکی راوی",
    defaultTripCost: 2000,
    maxBricks: 500,
    maxSandCft: 50,
    maxCrushCft: 50,
    maxCementBags: 25,
    maxSteelTons: 0.8,
    palledariPerTrip: 500,
  },
};

export interface MaterialTransportInput {
  bricksCount?: number;
  sandCft?: number;
  crushCft?: number;
  cementBags?: number;
  steelTons?: number;
  preferredAggregateVehicle?: "tractor_trolley" | "dumper_truck";
  distanceKm?: number; // Optional distance factor
  fuelSurchargePercent?: number;
}

export interface MaterialTripBreakdown {
  material: string;
  quantity: number;
  unit: string;
  vehicleType: VehicleType;
  vehicleName: string;
  tripsRequired: number;
  freightRatePerTrip: number;
  freightCost: number;
  palledariRatePerTrip: number;
  palledariCost: number;
  totalCost: number;
}

export interface TransportLogisticsResult {
  totalFreightCost: number;
  totalPalledariCost: number;
  totalLogisticsCost: number;
  totalTripsCount: number;
  breakdown: MaterialTripBreakdown[];
  summaryUrdu: string;
}

/**
 * Calculates itemized transport trips and loading/unloading (palledari)
 * for standard Pakistani construction materials.
 */
export function calculateTransportLogistics(input: MaterialTransportInput): TransportLogisticsResult {
  const {
    bricksCount = 0,
    sandCft = 0,
    crushCft = 0,
    cementBags = 0,
    steelTons = 0,
    preferredAggregateVehicle = "tractor_trolley",
    distanceKm = 15,
    fuelSurchargePercent = 0,
  } = input;

  const breakdown: MaterialTripBreakdown[] = [];
  let totalFreight = 0;
  let totalPalledari = 0;
  let totalTrips = 0;

  // Distance multiplier: Baseline is 15 km
  const distanceFactor = Math.max(0.7, Math.min(2.5, distanceKm / 15));
  const fuelMultiplier = 1 + (fuelSurchargePercent / 100);

  // 1. Bricks: Transported via Tractor Trolley standard
  if (bricksCount > 0) {
    const vType: VehicleType = "tractor_trolley";
    const cap = PAK_VEHICLE_CAPACITIES[vType];
    const trips = Math.ceil(bricksCount / cap.maxBricks);
    const tripRate = Math.round(cap.defaultTripCost * distanceFactor * fuelMultiplier);
    const freight = trips * tripRate;
    // Palledari for bricks is standard Rs 450 per 1000 bricks
    const palledari = Math.round((bricksCount / 1000) * 450);

    breakdown.push({
      material: "Bricks (اول اینٹیں)",
      quantity: bricksCount,
      unit: "Bricks",
      vehicleType: vType,
      vehicleName: cap.name,
      tripsRequired: trips,
      freightRatePerTrip: tripRate,
      freightCost: freight,
      palledariRatePerTrip: Math.round(palledari / trips),
      palledariCost: palledari,
      totalCost: freight + palledari,
    });

    totalFreight += freight;
    totalPalledari += palledari;
    totalTrips += trips;
  }

  // 2. Sand (Rait): Tractor Trolley or Dumper
  if (sandCft > 0) {
    const vType: VehicleType = preferredAggregateVehicle;
    const cap = PAK_VEHICLE_CAPACITIES[vType];
    const trips = Math.ceil(sandCft / cap.maxSandCft);
    const tripRate = Math.round(cap.defaultTripCost * distanceFactor * fuelMultiplier);
    const freight = trips * tripRate;
    const palledari = trips * cap.palledariPerTrip;

    breakdown.push({
      material: "Sand (ریت - چناب / راوی)",
      quantity: sandCft,
      unit: "CFT",
      vehicleType: vType,
      vehicleName: cap.name,
      tripsRequired: trips,
      freightRatePerTrip: tripRate,
      freightCost: freight,
      palledariRatePerTrip: cap.palledariPerTrip,
      palledariCost: palledari,
      totalCost: freight + palledari,
    });

    totalFreight += freight;
    totalPalledari += palledari;
    totalTrips += trips;
  }

  // 3. Crush (Bajri): Tractor Trolley or Dumper
  if (crushCft > 0) {
    const vType: VehicleType = preferredAggregateVehicle;
    const cap = PAK_VEHICLE_CAPACITIES[vType];
    const trips = Math.ceil(crushCft / cap.maxCrushCft);
    const tripRate = Math.round(cap.defaultTripCost * distanceFactor * fuelMultiplier);
    const freight = trips * tripRate;
    const palledari = trips * cap.palledariPerTrip;

    breakdown.push({
      material: "Crush (مارگلہ / سرگودھا بجری)",
      quantity: crushCft,
      unit: "CFT",
      vehicleType: vType,
      vehicleName: cap.name,
      tripsRequired: trips,
      freightRatePerTrip: tripRate,
      freightCost: freight,
      palledariRatePerTrip: cap.palledariPerTrip,
      palledariCost: palledari,
      totalCost: freight + palledari,
    });

    totalFreight += freight;
    totalPalledari += palledari;
    totalTrips += trips;
  }

  // 4. Cement: Tractor Trolley or Shehzore
  if (cementBags > 0) {
    const vType: VehicleType = cementBags > 150 ? "tractor_trolley" : "shehzore_pickup";
    const cap = PAK_VEHICLE_CAPACITIES[vType];
    const trips = Math.ceil(cementBags / cap.maxCementBags);
    const tripRate = Math.round(cap.defaultTripCost * distanceFactor * fuelMultiplier);
    const freight = trips * tripRate;
    // Standard cement unloading palledari is Rs 15-20 / bag
    const palledari = cementBags * 15;

    breakdown.push({
      material: "Cement Bags (سیمنٹ بوریاں)",
      quantity: cementBags,
      unit: "Bags",
      vehicleType: vType,
      vehicleName: cap.name,
      tripsRequired: trips,
      freightRatePerTrip: tripRate,
      freightCost: freight,
      palledariRatePerTrip: Math.round(palledari / trips),
      palledariCost: palledari,
      totalCost: freight + palledari,
    });

    totalFreight += freight;
    totalPalledari += palledari;
    totalTrips += trips;
  }

  // 5. Deformed Steel (Saria): Mazda Heavy Truck or Shehzore
  if (steelTons > 0) {
    const vType: VehicleType = steelTons > 4 ? "mazda_truck" : "shehzore_pickup";
    const cap = PAK_VEHICLE_CAPACITIES[vType];
    const trips = Math.ceil(steelTons / cap.maxSteelTons);
    const tripRate = Math.round(cap.defaultTripCost * distanceFactor * fuelMultiplier);
    const freight = trips * tripRate;
    // Standard steel unloading palledari is Rs 1200 / ton
    const palledari = Math.round(steelTons * 1200);

    breakdown.push({
      material: "Grade 60 Steel (سریا)",
      quantity: steelTons,
      unit: "Tons",
      vehicleType: vType,
      vehicleName: cap.name,
      tripsRequired: trips,
      freightRatePerTrip: tripRate,
      freightCost: freight,
      palledariRatePerTrip: Math.round(palledari / trips),
      palledariCost: palledari,
      totalCost: freight + palledari,
    });

    totalFreight += freight;
    totalPalledari += palledari;
    totalTrips += trips;
  }

  const totalLogistics = totalFreight + totalPalledari;
  const summaryUrdu = `کل ${totalTrips} چکر برائے ترسیل، مال برداری لاگت: Rs. ${totalFreight.toLocaleString()}, پلے داری / مزدوری: Rs. ${totalPalledari.toLocaleString()}`;

  return {
    totalFreightCost: totalFreight,
    totalPalledariCost: totalPalledari,
    totalLogisticsCost: totalLogistics,
    totalTripsCount: totalTrips,
    breakdown,
    summaryUrdu,
  };
}

export const calculateTransportCost = calculateTransportLogistics;

