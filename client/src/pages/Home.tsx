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
import { Calculator, TrendingUp, Users, AlertCircle, DollarSign, Clock, FileText, Building2, Target } from "lucide-react";
import CostSummary from "@/components/CostSummary";
import PotentialROI from "@/components/PotentialROI";
import ROIComparison from "@/components/ROIComparison";

interface CostInputs {
  // Company basics
  numberOfEmployees: number;
  averageHourlyRate: number;
  totalClients: number;
  
  // Staff time costs
  hoursPerComplianceIssue: number;
  complianceIssuesPerMonth: number;
  
  // Client churn
  clientsLostPerYear: number;
  averageClientValue: number;
  
  // Opportunity costs
  largeClientsLost: number;
  averageLargeClientValue: number;
  
  // Revenue growth
  newClientsWonPerYear: number;
  averageNewClientValue: number;
  
  // Lost productivity
  employeesAffectedByCompliance: number;
  productivityLossPercentage: number;
}

export default function Home() {
  const [inputs, setInputs] = useState<CostInputs>({
    numberOfEmployees: 50,
    averageHourlyRate: 75,
    totalClients: 200,
    hoursPerComplianceIssue: 3,
    complianceIssuesPerMonth: 8,
    clientsLostPerYear: 2,
    averageClientValue: 50000,
    largeClientsLost: 1,
    averageLargeClientValue: 150000,
    newClientsWonPerYear: 5,
    averageNewClientValue: 20000,
    employeesAffectedByCompliance: 3,
    productivityLossPercentage: 15,
  });

  // Results are always visible - no toggle needed

  const updateInput = (field: keyof CostInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateCosts = () => {
    // OPERATIONAL COSTS (Labor, Lost Deals, Churn)
    
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
    
    // Total operational costs
    const totalOperationalCost = staffTimeCost + clientChurnCost + opportunityCost + productivityCost;
    
    // LIABILITY EXPOSURE (Potential penalties for entire book of business)
    
    // Calculate penalty risk based on client portfolio
    // Count clients by size (assuming average employer size distribution)
    const smallClients = Math.floor(inputs.totalClients * 0.7); // 70% under 50 employees
    const largeClients = inputs.totalClients - smallClients; // 30% over 50 employees
    
    // Average liability: $70K-$150K for small, $350K for large
    const smallClientRisk = smallClients * 110000; // midpoint of $70K-$150K
    const largeClientRisk = largeClients * 350000;
    const totalLiabilityExposure = smallClientRisk + largeClientRisk;
    
    // Revenue growth from new clients
    const revenueGrowth = inputs.newClientsWonPerYear * inputs.averageNewClientValue;
    const lifetimeValueGrowth = revenueGrowth * 6; // 6-year industry standard
    
    // Combined total for benchmark comparison
    const totalCost = totalOperationalCost + totalLiabilityExposure;
    
    return {
      // Operational costs breakdown
      staffTimeCost,
      clientChurnCost,
      opportunityCost,
      productivityCost,
      totalOperationalCost,
      
      // Liability exposure
      totalLiabilityExposure,
      
      // Revenue growth
      revenueGrowth,
      lifetimeValueGrowth,
      
      // Legacy fields for compatibility
      penaltyRisk: totalLiabilityExposure,
      totalCost,
    };
  };

  const costs = calculateCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">BCS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Compliance Cost Calculator</h1>
              <p className="text-xs text-muted-foreground">Benefits Compliance Solutions</p>
            </div>
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
            Employee benefits agencies lose thousands every year to compliance challenges. Calculate your hidden costs and discover the ROI of partnering with compliance experts.
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
                  <Label htmlFor="employees">Number of Employee Benefits Staff Members</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="employees"
                      value={[inputs.numberOfEmployees]}
                      onValueChange={([value]) => updateInput('numberOfEmployees', value)}
                      min={1}
                      max={500}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.numberOfEmployees}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Average Hourly Rate ($)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="hourlyRate"
                      value={[inputs.averageHourlyRate]}
                      onValueChange={([value]) => updateInput('averageHourlyRate', value)}
                      min={25}
                      max={200}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">${inputs.averageHourlyRate}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalClients">Total Number of Employers in Your Book of Business</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="totalClients"
                      value={[inputs.totalClients]}
                      onValueChange={([value]) => updateInput('totalClients', value)}
                      min={50}
                      max={1000}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.totalClients}</span>
                  </div>
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
                    <span className="text-sm font-semibold w-16 text-right">{inputs.hoursPerComplianceIssue}h</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Industry average: 2-4 hours per issue</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuesPerMonth">Compliance Issues per Month</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="issuesPerMonth"
                      value={[inputs.complianceIssuesPerMonth]}
                      onValueChange={([value]) => updateInput('complianceIssuesPerMonth', value)}
                      min={0}
                      max={30}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.complianceIssuesPerMonth}</span>
                  </div>
                </div>
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
                  <div className="flex items-center gap-4">
                    <Slider
                      id="clientsLost"
                      value={[inputs.clientsLostPerYear]}
                      onValueChange={([value]) => updateInput('clientsLostPerYear', value)}
                      min={0}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.clientsLostPerYear}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientValue">Average Annual Client Value ($)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="clientValue"
                      value={[inputs.averageClientValue]}
                      onValueChange={([value]) => updateInput('averageClientValue', value)}
                      min={50000}
                      max={700000}
                      step={10000}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-20 text-right">${(inputs.averageClientValue / 1000).toFixed(0)}K</span>
                  </div>
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
                  <div className="flex items-center gap-4">
                    <Slider
                      id="largeClientsLost"
                      value={[inputs.largeClientsLost]}
                      onValueChange={([value]) => updateInput('largeClientsLost', value)}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.largeClientsLost}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largeClientValue">Average Large Client Value ($)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="largeClientValue"
                      value={[inputs.averageLargeClientValue]}
                      onValueChange={([value]) => updateInput('averageLargeClientValue', value)}
                      min={50000}
                      max={500000}
                      step={10000}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-20 text-right">${(inputs.averageLargeClientValue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Growth */}
            <Card className="gradient-border-card border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Revenue Growth from New Clients
                </CardTitle>
                <CardDescription>Additional revenue potential with better compliance capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newClients">New Clients Won per Year</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="newClients"
                      value={[inputs.newClientsWonPerYear]}
                      onValueChange={([value]) => updateInput('newClientsWonPerYear', value)}
                      min={0}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.newClientsWonPerYear}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newClientValue">Average New Client Value ($)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="newClientValue"
                      value={[inputs.averageNewClientValue]}
                      onValueChange={([value]) => updateInput('averageNewClientValue', value)}
                      min={5000}
                      max={200000}
                      step={5000}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-20 text-right">${(inputs.averageNewClientValue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mt-4">
                  <p className="text-sm font-semibold text-accent-foreground">
                    Potential Annual Revenue Growth: ${costs.revenueGrowth.toLocaleString()}
                  </p>
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
                <CardDescription>Employee benefits team members distracted by compliance concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="affectedEmployees">Employees Affected by Compliance Work</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="affectedEmployees"
                      value={[inputs.employeesAffectedByCompliance]}
                      onValueChange={([value]) => updateInput('employeesAffectedByCompliance', value)}
                      min={0}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-16 text-right">{inputs.employeesAffectedByCompliance}</span>
                  </div>
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
                    <span className="text-sm font-semibold w-16 text-right">{inputs.productivityLossPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <CostSummary costs={costs} />
            <PotentialROI 
              costs={{
                clientChurnCost: costs.clientChurnCost,
                staffTimeCost: costs.staffTimeCost,
                productivityCost: costs.productivityCost,
              }}
              revenueGrowth={costs.revenueGrowth}
            />
          </div>
        </div>

        {/* ROI Comparison Section */}
        {
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
        }
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 Benefits Compliance Solutions. All rights reserved.</p>
            <p className="mt-2">These estimates are based on typical results from BCS partnerships. Actual savings may vary based on your specific situation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
