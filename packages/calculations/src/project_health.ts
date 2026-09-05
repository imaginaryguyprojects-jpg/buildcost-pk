/**
 * BuildCost Connect — Project Health Score Engine (Section 38)
 * 
 * Calculates a deterministic 0-100 score based on real project parameters:
 * 1. Budget Health (30 pts): Spending vs. allocated budget
 * 2. Progress Alignment (25 pts): Physical construction progress vs. budget consumption
 * 3. Material Procurement (15 pts): On-time material deliveries
 * 4. Labour & Schedule (15 pts): Planned vs actual working days
 * 5. Vendor Khata & Invoicing (15 pts): Outstanding overdue balances
 */

export type ProjectHealthStatus = "ON TRACK" | "WARNING" | "AT RISK";

export interface ProjectHealthInput {
  totalBudget: number;
  actualCost: number;
  estimatedCost: number;
  physicalProgressPercent: number; // 0 to 100
  procurementProgressPercent?: number; // 0 to 100
  daysDelayed?: number; // 0 or positive
  vendorOverdueAmount?: number;
}

export interface ProjectHealthBreakdown {
  budgetScore: number; // Max 30
  progressScore: number; // Max 25
  materialsScore: number; // Max 15
  scheduleScore: number; // Max 15
  vendorScore: number; // Max 15
}

export interface ProjectHealthResult {
  score: number; // 0 to 100
  status: ProjectHealthStatus;
  breakdown: ProjectHealthBreakdown;
  recommendations: string[];
}

export function calculateProjectHealthScore(input: ProjectHealthInput): ProjectHealthResult {
  const {
    totalBudget,
    actualCost,
    estimatedCost,
    physicalProgressPercent,
    procurementProgressPercent = physicalProgressPercent,
    daysDelayed = 0,
    vendorOverdueAmount = 0
  } = input;

  const recommendations: string[] = [];

  // 1. Budget Score (30 points)
  // Check if actual cost is tracking within the estimated pro-rata budget
  let budgetScore = 30;
  const budgetUtilization = totalBudget > 0 ? (actualCost / totalBudget) * 100 : 0;
  if (totalBudget > 0 && actualCost > totalBudget) {
    const overrunRatio = (actualCost - totalBudget) / totalBudget;
    budgetScore = Math.max(0, Math.round(30 - overrunRatio * 60));
    recommendations.push("Project has exceeded total budget allocation. Review contingency reserve.");
  } else if (physicalProgressPercent > 0) {
    // Check if spending rate exceeds physical completion rate by more than 15%
    if (budgetUtilization > physicalProgressPercent + 15) {
      budgetScore -= 10;
      recommendations.push("Cash burn rate is accelerating ahead of physical site milestones.");
    }
  }

  // 2. Progress vs Spending Alignment Score (25 points)
  let progressScore = 25;
  const progressRatio = physicalProgressPercent / 100;
  const expectedCostAtCurrentProgress = (estimatedCost || totalBudget) * progressRatio;
  if (actualCost > expectedCostAtCurrentProgress * 1.25) {
    progressScore = Math.max(5, Math.round(25 - ((actualCost - expectedCostAtCurrentProgress) / (expectedCostAtCurrentProgress || 1)) * 30));
    recommendations.push("Actual site expenses are higher than estimated cost for current stage.");
  }

  // 3. Materials Score (15 points)
  let materialsScore = 15;
  if (procurementProgressPercent < physicalProgressPercent - 10) {
    materialsScore = Math.max(5, 15 - Math.round((physicalProgressPercent - procurementProgressPercent) * 0.5));
    recommendations.push("Material procurement is lagging behind physical construction activities.");
  }

  // 4. Schedule Score (15 points)
  let scheduleScore = 15;
  if (daysDelayed > 0) {
    const penalty = Math.min(12, Math.round(daysDelayed / 3));
    scheduleScore = Math.max(3, 15 - penalty);
    recommendations.push(`Construction is delayed by ${daysDelayed} calendar days.`);
  }

  // 5. Vendor Score (15 points)
  let vendorScore = 15;
  if (vendorOverdueAmount > 0) {
    const overdueRatio = totalBudget > 0 ? vendorOverdueAmount / totalBudget : 0.1;
    vendorScore = Math.max(4, Math.round(15 - overdueRatio * 50));
    recommendations.push("Outstanding overdue vendor khata balances require settlement.");
  }

  const totalScore = Math.min(100, Math.max(0, budgetScore + progressScore + materialsScore + scheduleScore + vendorScore));

  let status: ProjectHealthStatus = "ON TRACK";
  if (totalScore < 60) {
    status = "AT RISK";
  } else if (totalScore < 80) {
    status = "WARNING";
  }

  if (recommendations.length === 0) {
    recommendations.push("All site parameters, procurement, and expenditure are tracking according to plan.");
  }

  return {
    score: totalScore,
    status,
    breakdown: {
      budgetScore,
      progressScore,
      materialsScore,
      scheduleScore,
      vendorScore
    },
    recommendations
  };
}
