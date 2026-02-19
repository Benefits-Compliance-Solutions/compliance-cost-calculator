/*
Design: Corporate Minimalism with Data Visualization Focus
- Split-screen layout: inputs left, live calculations right
- BCS brand colors with animated counters
- Progressive disclosure for cost factors
*/

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Users, AlertCircle, DollarSign, Clock, FileText } from "lucide-react";
import CostSummary from "@/components/CostSummary";
import ROIComparison from "@/components/ROIComparison";

interface CostInputs {
  // Company basics
  numberOfEmployees: number;
  averageHourlyRate: number;
  
  // Staff time costs
  hoursPerComplianceIssue: number;
  complianceIssuesPerMonth: number;
  
  // Penalty risks
  estimatedAnnualPenaltyRisk: number;
  
  // Client churn
  clientsLostPerYear: number;
  averageClientValue: number;
  
  // Opportunity costs
  largeClientsLost: number;
  averageLargeClientValue: number;
  
  // Lost productivity
  employeesAffectedByCompliance: number;
  productivityLossPercentage: number;
}

export default function Home() {
  const [inputs, setInputs] = useState<CostInputs>({
    numberOfEmployees: 50,
    averageHourlyRate: 75,
    hoursPerComplianceIssue: 3,
    complianceIssuesPerMonth: 8,
    estimatedAnnualPenaltyRisk: 25000,
    clientsLostPerYear: 2,
    averageClientValue: 15000,
    largeClientsLost: 1,
    averageLargeClientValue: 150000,
    employeesAffectedByCompliance: 3,
    productivityLossPercentage: 15,
  });

  const [showResults, setShowResults] = useState(false);

  const updateInput = (field: keyof CostInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateCosts = () => {
    // Staff time costs
    const staffTimeCost = inputs.hoursPerComplianceIssue * 
                          inputs.complianceIssuesPerMonth * 
                          12 * 
                          inputs.averageHourlyRate;
    
    // Client churn costs
    const clientChurnCost = inputs.clientsLostPerYear * inputs.averageClientValue;
    
    // Opportunity costs (large clients)
    const opportunityCost = inputs.largeClientsLost * inputs.averageLargeClientValue;
    
    // Lost productivity costs
    const productivityCost = inputs.employeesAffectedByCompliance * 
                            inputs.averageHourlyRate * 
                            2080 * // hours per year
                            (inputs.productivityLossPercentage / 100);
    
    // Penalty risk
    const penaltyRisk = inputs.estimatedAnnualPenaltyRisk;
    
    const totalCost = staffTimeCost + clientChurnCost + opportunityCost + productivityCost + penaltyRisk;
    
    return {
      staffTimeCost,
      clientChurnCost,
      opportunityCost,
      productivityCost,
      penaltyRisk,
      totalCost,
    };
  };

  const costs = calculateCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">BCS</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Compliance Cost Calculator</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Benefits Compliance Solutions</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowResults(!showResults)}
              variant="default"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">View Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            What Is Compliance Costing Your Agency?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Employee benefits agencies lose thousands every year to compliance challenges. 
            Calculate your hidden costs and discover the ROI of partnering with compliance experts.
          </p>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            {/* Company Basics */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Company Basics
                </CardTitle>
                <CardDescription>Tell us about your agency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={inputs.numberOfEmployees}
                    onChange={(e) => updateInput('numberOfEmployees', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Average Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={inputs.averageHourlyRate}
                    onChange={(e) => updateInput('averageHourlyRate', Number(e.target.value))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Staff Time Costs */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Staff Time on Compliance "Fires"
                </CardTitle>
                <CardDescription>How much time does your team spend putting out compliance emergencies?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hoursPerIssue">Hours per Compliance Issue</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="hoursPerIssue"
                      value={[inputs.hoursPerComplianceIssue]}
                      onValueChange={([value]) => updateInput('hoursPerComplianceIssue', value)}
                      min={0.5}
                      max={8}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-12 text-right">{inputs.hoursPerComplianceIssue}h</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Industry average: 2-4 hours per issue</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuesPerMonth">Compliance Issues per Month</Label>
                  <Input
                    id="issuesPerMonth"
                    type="number"
                    value={inputs.complianceIssuesPerMonth}
                    onChange={(e) => updateInput('complianceIssuesPerMonth', Number(e.target.value))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Penalty Risks */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Penalty & Fine Risks
                </CardTitle>
                <CardDescription>Estimated annual exposure to compliance penalties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="penaltyRisk">Estimated Annual Penalty Risk ($)</Label>
                <Input
                  id="penaltyRisk"
                  type="number"
                  value={inputs.estimatedAnnualPenaltyRisk}
                  onChange={(e) => updateInput('estimatedAnnualPenaltyRisk', Number(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  ACA penalties alone can range from $2,880 to $4,320 per employee
                </p>
              </CardContent>
            </Card>

            {/* Client Churn */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Client Churn Due to Compliance Gaps
                </CardTitle>
                <CardDescription>Clients lost when you can't meet compliance expectations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientsLost">Clients Lost per Year</Label>
                  <Input
                    id="clientsLost"
                    type="number"
                    value={inputs.clientsLostPerYear}
                    onChange={(e) => updateInput('clientsLostPerYear', Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientValue">Average Annual Client Value ($)</Label>
                  <Input
                    id="clientValue"
                    type="number"
                    value={inputs.averageClientValue}
                    onChange={(e) => updateInput('averageClientValue', Number(e.target.value))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Opportunity Costs */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Lost Opportunities (6-Figure Clients)
                </CardTitle>
                <CardDescription>Large clients you couldn't pursue due to compliance limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="largeClientsLost">Large Clients Lost per Year</Label>
                  <Input
                    id="largeClientsLost"
                    type="number"
                    value={inputs.largeClientsLost}
                    onChange={(e) => updateInput('largeClientsLost', Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largeClientValue">Average Large Client Value ($)</Label>
                  <Input
                    id="largeClientValue"
                    type="number"
                    value={inputs.averageLargeClientValue}
                    onChange={(e) => updateInput('averageLargeClientValue', Number(e.target.value))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lost Productivity */}
            <Card className="gradient-border-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Lost Productivity
                </CardTitle>
                <CardDescription>Team members distracted by compliance concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="affectedEmployees">Employees Affected by Compliance Work</Label>
                  <Input
                    id="affectedEmployees"
                    type="number"
                    value={inputs.employeesAffectedByCompliance}
                    onChange={(e) => updateInput('employeesAffectedByCompliance', Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productivityLoss">Productivity Loss Percentage</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="productivityLoss"
                      value={[inputs.productivityLossPercentage]}
                      onValueChange={([value]) => updateInput('productivityLossPercentage', value)}
                      min={0}
                      max={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-12 text-right">{inputs.productivityLossPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <CostSummary costs={costs} />
          </div>
        </div>

        {/* ROI Comparison Section */}
        {showResults && (
          <div className="mt-12">
            <ROIComparison 
              totalCost={costs.totalCost} 
              costs={costs}
              inputs={{
                numberOfEmployees: inputs.numberOfEmployees,
                averageHourlyRate: inputs.averageHourlyRate,
                hoursPerComplianceIssue: inputs.hoursPerComplianceIssue,
                complianceIssuesPerMonth: inputs.complianceIssuesPerMonth,
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Benefits Compliance Solutions. All rights reserved.</p>
          <p className="mt-2">Partner with us to reduce compliance costs and grow your agency.</p>
        </div>
      </footer>
    </div>
  );
}
