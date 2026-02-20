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
              Your Current Compliance Burden
            </CardTitle>
            <CardDescription>Without BCS Partnership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-destructive mb-2">
                ${costs.totalOperationalCost.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Annual operational costs</p>
            </div>
            
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <div className="text-2xl font-bold text-destructive mb-1">
                ${costs.totalLiabilityExposure.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Liability exposure for entire book of business</p>
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
              Transform Compliance Into An Advantage
            </CardTitle>
            <CardDescription>With BCS Partnership</CardDescription>
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
                <p className="text-xs text-muted-foreground mt-1">From large clients you could pursue with compliance capabilities<br/>Lifetime Value (6 years): ${costs.lifetimeValueGrowth.toLocaleString()}</p>
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
            <div className="text-center p-6 rounded-lg bg-destructive/10 border-2 border-destructive/50 shadow-lg">
              <p className="text-sm font-semibold text-destructive mb-2">WITHOUT BCS Partnership</p>
              <p className="text-3xl font-bold text-destructive">${costs.totalOperationalCost.toLocaleString()}</p>
              <p className="text-xs text-destructive/80 mt-2">Annual operational costs</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/10 border-2 border-primary/40">
              <p className="text-sm text-muted-foreground mb-2">Operational Cost Savings</p>
              <p className="text-3xl font-bold text-primary">${estimatedSavings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">What you save annually with BCS</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40">
              <p className="text-sm text-muted-foreground mb-2">Potential Annual New Business Revenue</p>
              <p className="text-3xl font-bold text-accent">${costs.revenueGrowth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">From large clients you could pursue</p>
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

      {/* Lead Capture Dialog */}
      <LeadCaptureDialog
        open={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}
