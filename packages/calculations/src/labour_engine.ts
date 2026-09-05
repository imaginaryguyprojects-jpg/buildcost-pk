/**
 * BUILDCOST CONNECT — LABOUR & PRODUCTIVITY ENGINE
 * Sections 19–31: Workforce sizing, trade rates, productivity, duration & scenario optimizer
 */

export interface LabourTradeItem {
  id: string;
  role: string;
  count: number;
  rateType: "daily" | "per_sqft" | "per_unit";
  dailyRate: number;
  perSqftRate?: number;
  totalDays?: number;
}

export interface PhaseLabourConfig {
  phaseName: string;
  mistriCount: number;
  labourCount: number;
  specialistCount?: number;
  specialistRole?: string;
  estimatedWorkQuantity: number; // e.g. 10000 sqft or 500 bags
  unit: string;
}

export interface ProductivityConstants {
  brickworkSqftPerDayTeam: number; // default 45 sqft/day (1 Mistri + 2 Labourers)
  plasterSqftPerDayTeam: number; // default 130 sqft/day (1 Mistri + 1 Labourer)
  tilesSqftPerDayTeam: number; // default 90 sqft/day
  paintSqftPerDayPainter: number; // default 350 sqft/day
  steelKgPerDayTeam: number; // default 260 kg/day (1 Steel Fixer + 1 Labourer)
  concreteCftPerDayTeam: number; // default 90 CFT/day
}

export const DEFAULT_PRODUCTIVITY: ProductivityConstants = {
  brickworkSqftPerDayTeam: 45,
  plasterSqftPerDayTeam: 130,
  tilesSqftPerDayTeam: 90,
  paintSqftPerDayPainter: 350,
  steelKgPerDayTeam: 260,
  concreteCftPerDayTeam: 90
};

export const DEFAULT_TRADE_RATES: Record<string, { role: string; dailyRate: number; perSqftRate?: number }> = {
  mistri: { role: "Head Mason / Mistri", dailyRate: 2600, perSqftRate: 28 },
  labour: { role: "General Labourer / Mazdoor", dailyRate: 1600, perSqftRate: 16 },
  steel_fixer: { role: "Steel Fixer (Saria Kar)", dailyRate: 2700, perSqftRate: 15 },
  shuttering: { role: "Shuttering Carpenter", dailyRate: 2600, perSqftRate: 22 },
  plaster_mistri: { role: "Plaster Mistri", dailyRate: 2800, perSqftRate: 24 },
  tile_mistri: { role: "Tile / Marble Mistri", dailyRate: 3000, perSqftRate: 45 },
  painter: { role: "Master Painter", dailyRate: 2400, perSqftRate: 18 },
  electrician: { role: "Certified Electrician", dailyRate: 2700, perSqftRate: 48 },
  plumber: { role: "Sanitary Plumber", dailyRate: 2700, perSqftRate: 38 },
  carpenter: { role: "Woodwork Carpenter", dailyRate: 2800, perSqftRate: 55 }
};

export interface LabourDurationResult {
  estimatedWorkingDays: number;
  estimatedCalendarDays: number;
  estimatedCompletionDate: string;
  totalLabourCost: number;
  disclaimer: string;
}

export function estimateConstructionDuration(
  coveredAreaSqft: number,
  team: {
    mistriCount: number;
    labourCount: number;
    steelFixerCount?: number;
    carpenterCount?: number;
  },
  productivity: ProductivityConstants = DEFAULT_PRODUCTIVITY,
  workingDaysPerWeek: number = 6
): LabourDurationResult {
  const m = Math.max(1, team.mistriCount);
  const l = Math.max(1, team.labourCount);

  // Balanced team size multiplier relative to baseline team (2 mistris + 3 labourers)
  const baselinePower = 2 * 1.0 + 3 * 0.5; // 3.5
  const currentPower = m * 1.0 + l * 0.5;
  const powerRatio = currentPower / baselinePower;

  // Base working days for an average 2000 sqft house with standard team ~ 150 working days
  const baseDays = Math.round((coveredAreaSqft / 2000) * 150);
  const estimatedWorkingDays = Math.max(25, Math.round(baseDays / powerRatio));

  // Calendar days factoring in 6 working days/week + weather contingency
  const calendarDays = Math.round((estimatedWorkingDays / workingDaysPerWeek) * 7 * 1.1);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + calendarDays);

  // Daily cost of configured team
  const dailyTeamCost =
    m * DEFAULT_TRADE_RATES.mistri.dailyRate +
    l * DEFAULT_TRADE_RATES.labour.dailyRate +
    (team.steelFixerCount ?? 0) * DEFAULT_TRADE_RATES.steel_fixer.dailyRate +
    (team.carpenterCount ?? 0) * DEFAULT_TRADE_RATES.shuttering.dailyRate;

  const totalLabourCost = dailyTeamCost * estimatedWorkingDays;

  return {
    estimatedWorkingDays,
    estimatedCalendarDays: calendarDays,
    estimatedCompletionDate: completionDate.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    totalLabourCost,
    disclaimer:
      "Estimated duration only. Actual completion depends on weather, material arrivals, site conditions, and working hours."
  };
}

export interface WorkforceScenario {
  id: string;
  name: string;
  mistriCount: number;
  labourCount: number;
  dailyCost: number;
  estimatedDays: number;
  totalCost: number;
  timeSavedDays: number;
  costDifference: number;
  isRecommended?: boolean;
}

export function compareWorkforceScenarios(
  coveredAreaSqft: number,
  baseRate = { mistri: 2600, labour: 1600 }
): {
  scenarios: WorkforceScenario[];
  recommendedScenarioId: string;
} {
  const options = [
    { id: "A", name: "Economy Team (2 Mistris + 3 Labourers)", m: 2, l: 3 },
    { id: "B", name: "Standard Balanced Team (3 Mistris + 5 Labourers)", m: 3, l: 5, recommended: true },
    { id: "C", name: "Accelerated Express Team (5 Mistris + 8 Labourers)", m: 5, l: 8 }
  ];

  const results = options.map((opt) => {
    const dur = estimateConstructionDuration(coveredAreaSqft, {
      mistriCount: opt.m,
      labourCount: opt.l
    });
    const dailyCost = opt.m * baseRate.mistri + opt.l * baseRate.labour;

    return {
      id: opt.id,
      name: opt.name,
      mistriCount: opt.m,
      labourCount: opt.l,
      dailyCost,
      estimatedDays: dur.estimatedWorkingDays,
      totalCost: dailyCost * dur.estimatedWorkingDays,
      timeSavedDays: 0,
      costDifference: 0,
      isRecommended: !!opt.recommended
    };
  });

  const baselineDays = results[0].estimatedDays;
  const baselineCost = results[0].totalCost;

  for (const s of results) {
    s.timeSavedDays = Math.max(0, baselineDays - s.estimatedDays);
    s.costDifference = s.totalCost - baselineCost;
  }

  return {
    scenarios: results,
    recommendedScenarioId: "B"
  };
}
