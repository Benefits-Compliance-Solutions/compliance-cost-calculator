/*
Design: Industry benchmark comparison with visual status indicators
- Shows how agency's costs compare to similar-sized agencies
- Color-coded status indicators (green/yellow/red)
- Category-by-category breakdown
- Urgency messaging to drive action
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingDown, TrendingUp, Minus, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getAgencySizeBenchmark,
  compareToBenchmark,
  calculateCostPerEmployee,
  compareCostBreakdown,
  type BenchmarkComparison as BenchmarkComparisonType,
  type CategoryComparison
} from "@/lib/benchmarkData";

interface BenchmarkComparisonProps {
  costs: {
    staffTimeCost: number;
    clientChurnCost: number;
    opportunityCost: number;
    productivityCost: number;
    penaltyRisk: number;
    totalCost: number;
  };
  numberOfEmployees: number;
}

function StatusBadge({ status }: { status: "optimal" | "typical" | "high" }) {
  const config = {
    optimal: {
      icon: TrendingDown,
      text: "Below Average",
      className: "bg-accent/20 text-accent border-accent/30"
    },
    typical: {
      icon: Minus,
      text: "Typical",
      className: "bg-muted text-muted-foreground border-border"
    },
    high: {
      icon: TrendingUp,
      text: "Above Average",
      className: "bg-destructive/20 text-destructive border-destructive/30"
    }
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  );
}

function ComparisonIndicator({ comparison }: { comparison: BenchmarkComparisonType }) {
  const { level, percentageDifference, message, urgency } = comparison;

  const urgencyConfig = {
    low: "text-accent",
    medium: "text-primary",
    high: "text-destructive"
  };

  const iconConfig = {
    below: TrendingDown,
    average: Minus,
    above: TrendingUp
  };

  const Icon = iconConfig[level];
  const colorClass = urgencyConfig[urgency];

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${urgency === 'high' ? 'bg-destructive/10' : urgency === 'medium' ? 'bg-primary/10' : 'bg-accent/10'}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">
          {Math.abs(percentageDifference).toFixed(1)}% {percentageDifference > 0 ? 'above' : 'below'} industry average
        </p>
      </div>
    </div>
  );
}

export default function BenchmarkComparison({ costs, numberOfEmployees }: BenchmarkComparisonProps) {
  const benchmark = getAgencySizeBenchmark(numberOfEmployees);
  const costPerEmployee = calculateCostPerEmployee(costs.totalCost, numberOfEmployees);
  const overallComparison = compareToBenchmark(costPerEmployee, benchmark.totalCostPerEmployee);
  const categoryComparisons = compareCostBreakdown(costs, numberOfEmployees);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="text-3xl lg:text-4xl font-bold mb-4">
          Industry Benchmark Analysis
        </h3>
        <p className="text-lg text-muted-foreground">
          See how your compliance costs compare to similar-sized employee benefits agencies
        </p>
      </div>

      {/* Overall Comparison Card */}
      <Card className={`border-2 ${
        overallComparison.urgency === 'high' 
          ? 'border-destructive/30 bg-destructive/5' 
          : overallComparison.urgency === 'medium'
          ? 'border-primary/30 bg-primary/5'
          : 'border-accent/30 bg-accent/5'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Your Agency vs. Industry Benchmarks
          </CardTitle>
          <CardDescription>
            {benchmark.sizeCategory} ({benchmark.employeeRange})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cost per Employee Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Cost per Employee</p>
              <p className="text-3xl font-bold text-primary">
                ${costPerEmployee.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Industry Average</p>
              <p className="text-3xl font-bold text-muted-foreground">
                ${benchmark.totalCostPerEmployee.average.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Range: ${benchmark.totalCostPerEmployee.low.toLocaleString()}</span>
                <ArrowRight className="w-3 h-3" />
                <span>${benchmark.totalCostPerEmployee.high.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Industry Range</span>
              <span className="font-medium">Your Position</span>
            </div>
            <div className="relative h-8 bg-gradient-to-r from-accent/30 via-muted to-destructive/30 rounded-lg">
              {/* Markers for low, average, high */}
              <div className="absolute top-0 left-0 h-full w-px bg-accent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-primary" />
              <div className="absolute top-0 right-0 h-full w-px bg-destructive" />
              
              {/* Your position marker */}
              {(() => {
                const { low, high } = benchmark.totalCostPerEmployee;
                const range = high - low;
                const position = Math.min(Math.max(((costPerEmployee - low) / range) * 100, 0), 100);
                
                return (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-lg"
                    style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
                  />
                );
              })()}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Average</span>
              <span>High</span>
            </div>
          </div>

          {/* Status Message */}
          <ComparisonIndicator comparison={overallComparison} />

          {/* Urgency Alert */}
          {overallComparison.urgency === 'high' && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Action Recommended</p>
                  <p className="text-sm text-muted-foreground">
                    Your compliance costs are significantly higher than industry benchmarks. 
                    This represents a major opportunity for cost reduction and efficiency improvement 
                    through partnership with compliance specialists.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Category Analysis</CardTitle>
          <CardDescription>
            How your spending in each category compares to industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categoryComparisons.map((cat, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{cat.category}</span>
                    <StatusBadge status={cat.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Your spend: {cat.actualPercent.toFixed(1)}%</span>
                    <span>•</span>
                    <span>
                      Industry range: {cat.benchmarkRange.low}% - {cat.benchmarkRange.high}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Visual indicator */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                {/* Benchmark range */}
                <div 
                  className="absolute h-full bg-accent/30"
                  style={{
                    left: `${cat.benchmarkRange.low}%`,
                    width: `${cat.benchmarkRange.high - cat.benchmarkRange.low}%`
                  }}
                />
                {/* Your percentage */}
                <div 
                  className={`absolute h-full w-1 ${
                    cat.status === 'optimal' ? 'bg-accent' : 
                    cat.status === 'high' ? 'bg-destructive' : 
                    'bg-primary'
                  }`}
                  style={{ left: `${Math.min(cat.actualPercent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">What This Means for Your Agency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {overallComparison.urgency === 'high' && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
              <p>
                <span className="font-semibold">High Priority:</span> Your compliance costs are {Math.abs(overallComparison.percentageDifference).toFixed(0)}% above industry average, 
                representing approximately <span className="font-bold text-destructive">
                  ${((costPerEmployee - benchmark.totalCostPerEmployee.average) * numberOfEmployees).toLocaleString()}
                </span> in excess annual costs.
              </p>
            </div>
          )}
          
          {categoryComparisons.some(cat => cat.status === 'high') && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <p>
                <span className="font-semibold">Focus Areas:</span> You're spending more than typical in{' '}
                {categoryComparisons
                  .filter(cat => cat.status === 'high')
                  .map(cat => cat.category.toLowerCase())
                  .join(', ')}
                —these are prime opportunities for improvement.
              </p>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
            <p>
              <span className="font-semibold">Industry Trend:</span> Agencies that partner with compliance specialists 
              typically reduce their total compliance costs by 60-75%, moving them well below industry averages.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
            <p>
              <span className="font-semibold">Competitive Advantage:</span> Lower compliance costs free up resources 
              to invest in growth, technology, and client service—helping you win and retain larger clients.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
