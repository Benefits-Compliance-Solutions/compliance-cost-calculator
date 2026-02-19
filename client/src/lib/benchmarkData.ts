/*
 * Industry Benchmark Data for Employee Benefits Agencies
 * 
 * Based on industry research and typical compliance cost patterns:
 * - Small agencies (1-25 employees): Higher per-employee compliance costs due to lack of scale
 * - Medium agencies (26-100 employees): Moderate costs with some economies of scale
 * - Large agencies (101+ employees): Lower per-employee costs with dedicated compliance resources
 * 
 * Cost factors as % of total costs:
 * - Staff time: 5-15% (varies by agency size and processes)
 * - Client churn: 8-12% (retention challenges from compliance gaps)
 * - Lost opportunities: 40-60% (inability to pursue larger clients)
 * - Productivity loss: 20-30% (team distraction from core work)
 * - Penalty risk: 5-10% (exposure to ACA, COBRA, ERISA violations)
 */

export interface BenchmarkRange {
  low: number;
  average: number;
  high: number;
}

export interface AgencySizeBenchmark {
  sizeCategory: string;
  employeeRange: string;
  totalCostPerEmployee: BenchmarkRange;
  costBreakdown: {
    staffTimePercent: BenchmarkRange;
    clientChurnPercent: BenchmarkRange;
    lostOpportunitiesPercent: BenchmarkRange;
    productivityLossPercent: BenchmarkRange;
    penaltyRiskPercent: BenchmarkRange;
  };
}

export const AGENCY_SIZE_BENCHMARKS: AgencySizeBenchmark[] = [
  {
    sizeCategory: "Small Agency",
    employeeRange: "1-25 employees",
    totalCostPerEmployee: {
      low: 4000,
      average: 6000,
      high: 8500
    },
    costBreakdown: {
      staffTimePercent: { low: 10, average: 13, high: 18 },
      clientChurnPercent: { low: 8, average: 10, high: 14 },
      lostOpportunitiesPercent: { low: 45, average: 52, high: 60 },
      productivityLossPercent: { low: 22, average: 18, high: 15 },
      penaltyRiskPercent: { low: 5, average: 7, high: 10 }
    }
  },
  {
    sizeCategory: "Medium Agency",
    employeeRange: "26-100 employees",
    totalCostPerEmployee: {
      low: 3000,
      average: 4500,
      high: 6500
    },
    costBreakdown: {
      staffTimePercent: { low: 8, average: 10, high: 14 },
      clientChurnPercent: { low: 9, average: 11, high: 13 },
      lostOpportunitiesPercent: { low: 42, average: 48, high: 55 },
      productivityLossPercent: { low: 20, average: 23, high: 28 },
      penaltyRiskPercent: { low: 6, average: 8, high: 10 }
    }
  },
  {
    sizeCategory: "Large Agency",
    employeeRange: "101+ employees",
    totalCostPerEmployee: {
      low: 2000,
      average: 3500,
      high: 5000
    },
    costBreakdown: {
      staffTimePercent: { low: 6, average: 8, high: 12 },
      clientChurnPercent: { low: 8, average: 10, high: 12 },
      lostOpportunitiesPercent: { low: 38, average: 45, high: 52 },
      productivityLossPercent: { low: 24, average: 27, high: 32 },
      penaltyRiskPercent: { low: 6, average: 10, high: 12 }
    }
  }
];

export function getAgencySizeBenchmark(numberOfEmployees: number): AgencySizeBenchmark {
  if (numberOfEmployees <= 25) {
    return AGENCY_SIZE_BENCHMARKS[0]; // Small
  } else if (numberOfEmployees <= 100) {
    return AGENCY_SIZE_BENCHMARKS[1]; // Medium
  } else {
    return AGENCY_SIZE_BENCHMARKS[2]; // Large
  }
}

export type ComparisonLevel = "below" | "average" | "above";

export interface BenchmarkComparison {
  level: ComparisonLevel;
  percentageDifference: number;
  message: string;
  urgency: "low" | "medium" | "high";
}

export function compareToBenchmark(
  actualCost: number,
  benchmark: BenchmarkRange
): BenchmarkComparison {
  const { low, average, high } = benchmark;
  
  // Calculate percentage difference from average
  const percentageDifference = ((actualCost - average) / average) * 100;
  
  let level: ComparisonLevel;
  let message: string;
  let urgency: "low" | "medium" | "high";
  
  if (actualCost < low) {
    level = "below";
    message = "Your costs are below industry average - great job!";
    urgency = "low";
  } else if (actualCost <= average) {
    level = "below";
    message = "Your costs are slightly below average";
    urgency = "low";
  } else if (actualCost <= high) {
    level = "average";
    message = "Your costs are in the typical range for agencies your size";
    urgency = "medium";
  } else if (actualCost <= high * 1.25) {
    level = "above";
    message = "Your costs are above industry average";
    urgency = "high";
  } else {
    level = "above";
    message = "Your costs are significantly above industry average";
    urgency = "high";
  }
  
  return {
    level,
    percentageDifference,
    message,
    urgency
  };
}

export function calculateCostPerEmployee(operationalCost: number, numberOfEmployees: number): number {
  return numberOfEmployees > 0 ? Math.round((operationalCost / numberOfEmployees) * 100) / 100 : 0;
}

export interface CategoryComparison {
  category: string;
  actualPercent: number;
  benchmarkRange: BenchmarkRange;
  status: "optimal" | "typical" | "high";
}

export function compareCostBreakdown(
  costs: {
    staffTimeCost: number;
    clientChurnCost: number;
    opportunityCost: number;
    productivityCost: number;
    penaltyRisk: number;
    totalCost: number;
  },
  numberOfEmployees: number
): CategoryComparison[] {
  const benchmark = getAgencySizeBenchmark(numberOfEmployees);
  const { totalCost } = costs;
  
  if (totalCost === 0) return [];
  
  const categories: CategoryComparison[] = [
    {
      category: "Staff Time",
      actualPercent: (costs.staffTimeCost / totalCost) * 100,
      benchmarkRange: benchmark.costBreakdown.staffTimePercent,
      status: "typical"
    },
    {
      category: "Client Churn",
      actualPercent: (costs.clientChurnCost / totalCost) * 100,
      benchmarkRange: benchmark.costBreakdown.clientChurnPercent,
      status: "typical"
    },
    {
      category: "Lost Opportunities",
      actualPercent: (costs.opportunityCost / totalCost) * 100,
      benchmarkRange: benchmark.costBreakdown.lostOpportunitiesPercent,
      status: "typical"
    },
    {
      category: "Productivity Loss",
      actualPercent: (costs.productivityCost / totalCost) * 100,
      benchmarkRange: benchmark.costBreakdown.productivityLossPercent,
      status: "typical"
    },
    {
      category: "Penalty Risk",
      actualPercent: (costs.penaltyRisk / totalCost) * 100,
      benchmarkRange: benchmark.costBreakdown.penaltyRiskPercent,
      status: "typical"
    }
  ];
  
  // Determine status for each category
  categories.forEach(cat => {
    if (cat.actualPercent < cat.benchmarkRange.low) {
      cat.status = "optimal";
    } else if (cat.actualPercent > cat.benchmarkRange.high) {
      cat.status = "high";
    } else {
      cat.status = "typical";
    }
  });
  
  return categories;
}
