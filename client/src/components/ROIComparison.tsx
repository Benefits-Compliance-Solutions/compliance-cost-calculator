/*
Design: ROI comparison showing savings with BCS partnership
- Before/after visualization
- Estimated savings and ROI percentage
- Call-to-action for partnership
*/

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingDown, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generateCompliancePDF } from "@/lib/generatePDF";
import LeadCaptureDialog, { LeadData } from "@/components/LeadCaptureDialog";

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
    clientChurnLTV?: number;
    clientChurnLTVTotal?: number;
    revenueGrowthLTV?: number;
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
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const sectionCardStyle = {
    borderColor: "rgba(43, 43, 104, 0.18)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
  } as const;

  const destructivePanelStyle = {
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderColor: "rgba(244, 63, 94, 0.45)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  } as const;

  const primaryPanelStyle = {
    backgroundColor: "rgba(43, 43, 104, 0.08)",
    borderColor: "rgba(43, 43, 104, 0.35)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  } as const;

  const accentPanelStyle = {
    background: "linear-gradient(135deg, rgba(116, 178, 175, 0.20), rgba(116, 178, 175, 0.08))",
    borderColor: "rgba(116, 178, 175, 0.55)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  } as const;

  const opportunityCalloutStyle = {
    background: "linear-gradient(135deg, rgba(116, 178, 175, 0.12), rgba(116, 178, 175, 0.05))",
    borderColor: "rgba(116, 178, 175, 0.60)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
  } as const;

  // Conservative estimate: BCS partnership reduces operational costs by 60-75%
  const reductionPercentage = 70;
  const estimatedSavings = costs.totalOperationalCost * (reductionPercentage / 100);
  const costWithBCS = costs.totalOperationalCost - estimatedSavings;
  
  // BCS partnership investment
  const estimatedBCSCost = 75000; // $75K annual investment
  const netSavings = estimatedSavings - estimatedBCSCost;
  const roi = estimatedBCSCost > 0 ? ((netSavings / estimatedBCSCost) * 100) : 0;

  const handleDownloadReport = () => {
    setShowLeadDialog(true);
  };

  const handleLeadSubmit = (data: LeadData) => {
    setLeadData(data);
    setShowLeadDialog(false);
    // Generate PDF with lead data
    generateCompliancePDF(costs, { ...inputs, leadData: data });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="text-3xl lg:text-4xl font-bold mb-4">
          What Fixing Compliance Is Worth to Your Practice
        </h3>
        <p className="text-lg text-muted-foreground">
          Your compliance gaps have a price. So does fixing them. Here's what the math looks like for your practice.
        </p>
      </div>

      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before: Current State */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TrendingDown className="w-5 h-5" />
              What You're Carrying Without BCS
            </CardTitle>
            <CardDescription>The current state of your practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-destructive mb-2">
                ${Math.round(costs.totalOperationalCost).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Annual operational costs</p>
            </div>
            
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <div className="text-2xl font-bold text-destructive mb-1">
                ${Math.round(costs.totalLiabilityExposure).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Liability exposure for entire book of business</p>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-destructive/20">
              <p className="text-sm font-medium">Current challenges:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Team spending hours every month on compliance emergencies instead of selling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Walking away from 6-figure accounts you can't confidently serve</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Losing accounts to brokers with stronger compliance programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>Carrying compliance risk across your entire book of business</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* After: With BCS */}
        <Card className="border-accent/30 bg-accent/5 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <span className="text-accent" aria-label="Opportunity">✅</span>
              What Your Practice Looks Like With BCS
            </CardTitle>
            <CardDescription>The opportunity in front of you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg border-2 border-accent/50 shadow-md">
                <p className="text-sm font-semibold mb-1" style={{color: 'var(--accent-text)'}}>NEW REVENUE OPPORTUNITY</p>
                <p className="text-3xl font-bold text-accent">${Math.round(costs.revenueGrowth).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Annual revenue from 6-figure accounts you can now confidently pursue</p>
                <p className="text-sm font-medium mt-1" style={{color: 'var(--accent-text)'}}>6-Year Lifetime Value: ${Math.round(costs.lifetimeValueGrowth).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Plus: Operational Cost Savings</p>
                <p className="text-2xl font-bold text-primary">${Math.round(estimatedSavings).toLocaleString()}</p>
                <Progress value={reductionPercentage} className="mt-2 h-2" />
                <p className="text-sm text-muted-foreground mt-1">{reductionPercentage}% reduction in compliance costs</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-accent/20">
              <p className="text-sm font-medium">What you gain:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Scalable compliance programs that grow with your book</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>The confidence to go after accounts your competitors can't match</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Expert backup when your clients have compliance questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Your team focused on selling and serving — not firefighting</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Analysis */}
      <Card
        className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-xl"
        style={sectionCardStyle}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">The Business Case for BCS</CardTitle>
          <CardDescription>Based on typical results from BCS agency partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div
              className="text-center p-6 rounded-lg bg-destructive/10 border-2 border-destructive/50 shadow-lg w-full sm:w-72"
              style={destructivePanelStyle}
            >
              <p className="text-sm font-semibold text-destructive mb-2">WITHOUT BCS</p>
              <p className="text-4xl font-bold text-destructive">${Math.round(costs.totalOperationalCost).toLocaleString()}</p>
              <p className="text-sm text-destructive/80 mt-2">Annual operational costs</p>
            </div>
            
            {/* Arrow 1 */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-primary hidden sm:block" />
              <div className="block sm:hidden rotate-90">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div
              className="text-center p-6 rounded-lg bg-primary/10 border-2 border-primary/40 w-full sm:w-72"
              style={primaryPanelStyle}
            >
              <p className="text-sm text-muted-foreground mb-2">Operational Cost Savings</p>
              <p className="text-4xl font-bold text-primary">${Math.round(estimatedSavings).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">Reduce costs by {reductionPercentage}%</p>
            </div>
            
            {/* Arrow 2 */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-accent hidden sm:block" />
              <div className="block sm:hidden rotate-90">
                <ArrowRight className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div
              className="text-center p-6 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/50 shadow-lg w-full sm:w-72"
              style={accentPanelStyle}
            >
              <p className="text-sm font-semibold text-accent mb-2">NEW REVENUE OPPORTUNITY</p>
              <p className="text-4xl font-bold text-accent">${Math.round(costs.revenueGrowth).toLocaleString()}</p>
              <p className="text-sm font-medium mt-2" style={{color: 'var(--accent-text)'}}>Annual revenue from large clients</p>
              <p className="text-sm text-muted-foreground mt-1">6-year LTV: ${Math.round(costs.lifetimeValueGrowth).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Revenue Impact Callout */}
          <div
            className="bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent p-6 rounded-lg mb-6"
            style={opportunityCalloutStyle}
          >
            <h4 className="text-lg font-bold text-accent mb-2">Your Total Annual Opportunity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cost Savings</p>
                <p className="text-2xl font-bold text-primary">${Math.round(estimatedSavings).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">New Revenue</p>
                <p className="text-2xl font-bold text-accent">${Math.round(costs.revenueGrowth).toLocaleString()}</p>
              </div>
              <div
                className="border-l-2 border-accent/30"
                style={{ borderLeftColor: "rgba(116, 178, 175, 0.35)" }}
              >
                <p className="text-sm font-semibold text-accent mb-1">Total Annual Benefit</p>
                <p className="text-3xl font-bold text-accent">${Math.round(estimatedSavings + costs.revenueGrowth).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              This is the combined value of what you're losing today and what you could be capturing with the right compliance capabilities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg px-8" asChild>
              <a href="https://calendly.com/benefitscompliancesolutions/bcs-strategy-session" target="_blank" rel="noopener noreferrer">
                Talk to a BCS Strategist
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
            These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.
          </p>
        </CardContent>
      </Card>

      {/* Lead Capture Dialog */}
      <LeadCaptureDialog
        open={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}
