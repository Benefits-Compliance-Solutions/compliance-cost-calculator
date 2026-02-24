/**
 * Lifetime Value (LTV) Calculations for Benefits Agency Clients
 * 
 * Based on industry retention rate data:
 * - Industry Average: 84% annual retention (Agency Performance Partners, 2025)
 * - Top Performers: 93-95% annual retention
 * - Cost of acquisition: 7-9x more than retention (Ease/IIADALLAS, 2019)
 */

// Industry-standard retention rates
export const RETENTION_RATES = {
  INDUSTRY_AVERAGE: 0.84, // 84% - Average benefits agency
  TOP_PERFORMER: 0.93,     // 93% - Top performing agencies
  ELITE: 0.95,             // 95% - Elite performers
} as const;

// Standard LTV calculation period (years)
export const LTV_YEARS = 6;

/**
 * Calculate Lifetime Value multiplier based on retention rate
 * 
 * Formula: LTV = Annual Value × (1 + r + r² + r³ + r⁴ + r⁵)
 * Where r = retention rate
 * 
 * @param retentionRate - Annual retention rate (0-1)
 * @param years - Number of years to calculate (default: 6)
 * @returns LTV multiplier
 */
export function calculateLTVMultiplier(
  retentionRate: number,
  years: number = LTV_YEARS
): number {
  let multiplier = 1; // Year 1
  let currentRetention = retentionRate;
  
  for (let i = 1; i < years; i++) {
    multiplier += currentRetention;
    currentRetention *= retentionRate;
  }
  
  return multiplier;
}

/**
 * Calculate Lifetime Value from annual value
 * 
 * @param annualValue - Annual client value
 * @param retentionRate - Annual retention rate (0-1)
 * @param years - Number of years (default: 6)
 * @returns Total lifetime value
 */
export function calculateLTV(
  annualValue: number,
  retentionRate: number,
  years: number = LTV_YEARS
): number {
  const multiplier = calculateLTVMultiplier(retentionRate, years);
  return annualValue * multiplier;
}

/**
 * Calculate the percentage of clients remaining after N years
 * 
 * @param retentionRate - Annual retention rate (0-1)
 * @param years - Number of years
 * @returns Percentage of clients remaining (0-1)
 */
export function calculateClientRetention(
  retentionRate: number,
  years: number
): number {
  return Math.pow(retentionRate, years);
}

/**
 * Calculate LTV improvement from retention rate increase
 * 
 * @param currentRate - Current retention rate (0-1)
 * @param improvedRate - Improved retention rate (0-1)
 * @param years - Number of years (default: 6)
 * @returns Object with improvement metrics
 */
export function calculateRetentionImprovement(
  currentRate: number,
  improvedRate: number,
  years: number = LTV_YEARS
) {
  const currentMultiplier = calculateLTVMultiplier(currentRate, years);
  const improvedMultiplier = calculateLTVMultiplier(improvedRate, years);
  const improvement = improvedMultiplier - currentMultiplier;
  const improvementPercentage = (improvement / currentMultiplier) * 100;
  
  return {
    currentMultiplier,
    improvedMultiplier,
    improvement,
    improvementPercentage,
    currentClientsRemaining: calculateClientRetention(currentRate, years),
    improvedClientsRemaining: calculateClientRetention(improvedRate, years),
  };
}

/**
 * Get pre-calculated LTV multipliers for common scenarios
 */
export const LTV_MULTIPLIERS = {
  INDUSTRY_AVERAGE: calculateLTVMultiplier(RETENTION_RATES.INDUSTRY_AVERAGE), // 4.06x
  TOP_PERFORMER: calculateLTVMultiplier(RETENTION_RATES.TOP_PERFORMER),       // 5.04x
  ELITE: calculateLTVMultiplier(RETENTION_RATES.ELITE),                       // 5.30x
} as const;

/**
 * Calculate total book of business lifetime value
 * 
 * @param numberOfClients - Total number of clients
 * @param averageClientValue - Average annual client value
 * @param retentionRate - Annual retention rate (0-1)
 * @param years - Number of years (default: 6)
 * @returns Total book lifetime value
 */
export function calculateBookLTV(
  numberOfClients: number,
  averageClientValue: number,
  retentionRate: number,
  years: number = LTV_YEARS
): number {
  const singleClientLTV = calculateLTV(averageClientValue, retentionRate, years);
  return numberOfClients * singleClientLTV;
}

/**
 * Format LTV insights for display
 * 
 * @param annualValue - Annual client value
 * @param currentRetention - Current retention rate (default: industry average)
 * @param improvedRetention - Improved retention rate (default: top performer)
 * @returns Formatted insights object
 */
export function getLTVInsights(
  annualValue: number,
  currentRetention: number = RETENTION_RATES.INDUSTRY_AVERAGE,
  improvedRetention: number = RETENTION_RATES.TOP_PERFORMER
) {
  const currentLTV = calculateLTV(annualValue, currentRetention);
  const improvedLTV = calculateLTV(annualValue, improvedRetention);
  const improvement = calculateRetentionImprovement(currentRetention, improvedRetention);
  
  return {
    annualValue,
    currentRetention: currentRetention * 100,
    improvedRetention: improvedRetention * 100,
    currentLTV,
    improvedLTV,
    ltvGain: improvedLTV - currentLTV,
    ltvGainPercentage: improvement.improvementPercentage,
    currentMultiplier: improvement.currentMultiplier,
    improvedMultiplier: improvement.improvedMultiplier,
    currentClientsRemainingAfter6Years: improvement.currentClientsRemaining * 100,
    improvedClientsRemainingAfter6Years: improvement.improvedClientsRemaining * 100,
  };
}

/**
 * Industry data citations
 */
export const LTV_CITATIONS = {
  PRIMARY: {
    source: "Agency Performance Partners",
    year: 2025,
    url: "https://www.agencyperformancepartners.com/blog/is-your-agency-above-the-average-retention-rate-for-insurance-industry/",
    stats: {
      industryAverage: "84%",
      topPerformers: "93-95%",
      profitImpact: "5% retention increase can double profit in 5 years",
    },
  },
  SUPPORTING: {
    source: "Ease / Independent Insurance Agents of Dallas",
    year: 2019,
    url: "https://www.ease.com/blog/insurance-agency-client-retention/",
    stats: {
      industryAverage: "84%",
      topFive: "93-95%",
      acquisitionCost: "7-9x more expensive than retention",
    },
  },
} as const;
