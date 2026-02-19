/*
Design: ROI comparison showing savings with BCS partnership
- Before/after visualization
- Estimated savings and ROI percentage
- Call-to-action for partnership
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingDown, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generateCompliancePDF } from "@/lib/generatePDF";

interface ROIComparisonProps {
  totalCost: number;
  costs: {
    staffTimeCost: number;
    clientChurnCost: number;
    opportunityCost: number;
    productivityCost: number;
    totalOperationalCost: number;
    totalLiabilityExposure: number;
    revenueGrowth: number;
    lifetimeValueGrowth: number;
    penaltyRisk: number;
    totalCost: number;
  };
  inputs: {
    agencyName?: string;
    numberOfEmployees: number;
    averageHourlyRate: number;
    hoursPerComplianceIssue: number;
    complianceIssuesPerMonth: number;
    totalClients?: number;
    newClientsWonPerYear?: number;
    averageNewClientValue?: number;
  };
}

export default function ROIComparison({ totalCost, costs, inputs }: ROIComparisonProps) {
  // Conservative estimate: BCS partnership reduces operational costs by 60-75%
  const reductionPercentage = 70;
  const estimatedSavings = costs.totalOperationalCost * (reductionPercentage / 100);
  const costWithBCS = costs.totalOperationalCost - estimatedSavings;
  
  // BCS partnership investment
  const estimatedBCSCost = 75000; // $75K annual investment
  const netSavings = estimatedSavings - estimatedBCSCost;
  const roi = estimatedBCSCost > 0 ? ((netSavings / estimatedBCSCost) * 100) : 0;

  const handleDownloadReport = () => {
    generateCompliancePDF(costs, inputs);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="text-3xl lg:text-4xl font-bold mb-4">
          The ROI of Partnership
        </h3>
        <p className="text-lg text-muted-foreground">
          See how partnering with Benefits Compliance Solutions transforms your agency's compliance burden into a competitive advantage
        </p>
      </div>

      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before: Current State */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TrendingDown className="w-5 h-5" />
              Without BCS Partnership
            </CardTitle>
            <CardDescription>Your current compliance burden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-destructive mb-2">
                ${costs.totalOperationalCost.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Annual operational costs</p>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-destructive/20">
              <p className="text-sm font-medium">Current challenges:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Team constantly fighting compliance fires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Unable to pursue larger, more profitable clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Client churn from unmet compliance expectations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Exposure to penalties and regulatory risks</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* After: With BCS */}
        <Card className="border-accent/30 bg-accent/5 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="w-5 h-5" />
              With BCS Partnership
            </CardTitle>
            <CardDescription>Transform compliance into an advantage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border border-accent/20">                <p className="text-xs text-muted-foreground mb-1">Annual Savings</p>
                <p className="text-2xl font-bold text-accent">${estimatedSavings.toLocaleString()}</p>
                <Progress value={reductionPercentage} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">Savings from reducing your current ${costs.totalOperationalCost.toLocaleString()} operational costs by {reductionPercentage}%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Annual New Business Revenue</p>
                <p className="text-2xl font-bold text-accent">${costs.revenueGrowth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime Value (6 years): ${costs.lifetimeValueGrowth.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-accent/20">
              <p className="text-sm font-medium">What you gain:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Scalable compliance processes that grow with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Confidence to win and retain 6-figure clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Expert support when compliance issues arise</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Team freed to focus on growth and client service</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Analysis */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Investment Analysis</CardTitle>
          <CardDescription>Conservative estimate based on typical BCS partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 rounded-lg bg-card border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Partnership Investment</p>
              <p className="text-3xl font-bold text-primary">${estimatedBCSCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Annual</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-destructive/10 border-2 border-destructive/50 shadow-lg">
              <p className="text-sm font-semibold text-destructive mb-2">WITHOUT BCS Partnership</p>
              <p className="text-3xl font-bold text-destructive">${costs.totalOperationalCost.toLocaleString()}</p>
              <p className="text-xs text-destructive/80 mt-2">Annual operational costs draining your agency</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40">
              <p className="text-sm text-muted-foreground mb-2">Annual New Business Revenue</p>
              <p className="text-3xl font-bold text-accent">${costs.revenueGrowth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">From winning new clients with compliance expertise</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg px-8" asChild>
              <a href="https://calendly.com/benefitscompliancesolutions/bcs-strategy-session" target="_blank" rel="noopener noreferrer">
                Schedule a Consultation
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-lg px-8"
              onClick={handleDownloadReport}
            >
              <Download className="w-5 h-5" />
              Download Report
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            These estimates are based on typical results from BCS partnerships. 
            Actual savings may vary based on your specific situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
