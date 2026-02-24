/*
Design: Corporate Minimalism with Data Visualization Focus + UX Improvements
- Split-screen layout: inputs left, live calculations right
- BCS brand colors with animated counters
- Progressive disclosure with collapsible sections (P2)
- Accessibility improvements: hybrid slider+input controls (P0)
- Save/resume functionality (P1)
- Calculation transparency (P1)
- Trust signals and social proof (P1)
*/

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Users, AlertCircle, DollarSign, Clock, FileText, Building2, Target, Save, RefreshCw } from "lucide-react";
import CostSummary from "@/components/CostSummary";
import PotentialROI from "@/components/PotentialROI";
import ROIComparison from "@/components/ROIComparison";
import SliderWithInput from "@/components/SliderWithInput";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TrustSignals from "@/components/TrustSignals";
import ResumeCalculationBanner from "@/components/ResumeCalculationBanner";
import { validateAgencyName } from "@/lib/validation";
import { saveCalculatorData, loadCalculatorData, clearCalculatorData, getLastSavedTimestamp } from "@/lib/storage";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface CostInputs {
  // Company basics
  agencyName: string;
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
  // Using sonner for toast notifications
  const [inputs, setInputs] = useState<CostInputs>({
    agencyName: "",
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

  // P0: Input validation state
  const [agencyNameError, setAgencyNameError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  // P1: Save/resume state
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [lastSavedDate, setLastSavedDate] = useState<Date | null>(null);

  // P2: Progressive disclosure state
  const [sectionsOpen, setSectionsOpen] = useState({
    basics: true,
    staffTime: true,
    clientChurn: true,
    lostOpportunities: true,
    productivity: true,
  });

  // Check for saved data on mount (P1)
  useEffect(() => {
    const savedData = loadCalculatorData();
    if (savedData) {
      const lastSaved = getLastSavedTimestamp();
      if (lastSaved) {
        setLastSavedDate(lastSaved);
        setShowResumeBanner(true);
      }
    }
  }, []);

  // Auto-save on input change (P1) - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputs.agencyName) {
        saveCalculatorData(inputs);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [inputs]);

  const updateInput = (field: keyof CostInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    
    // P0: Validate agency name on change
    if (field === 'agencyName' && touched) {
      const validation = validateAgencyName(value as string);
      setAgencyNameError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handleAgencyNameBlur = () => {
    setTouched(true);
    const validation = validateAgencyName(inputs.agencyName);
    setAgencyNameError(validation.isValid ? "" : validation.error || "");
  };

  const handleResume = () => {
    const savedData = loadCalculatorData();
    if (savedData) {
      setInputs(savedData.inputs);
      setShowResumeBanner(false);
      toast.success("Calculation Resumed", {
        description: "Your previous inputs have been restored.",
      });
    }
  };

  const handleStartFresh = () => {
    clearCalculatorData();
    setShowResumeBanner(false);
    toast.info("Starting Fresh", {
      description: "Previous calculation cleared.",
    });
  };

  const handleClearCalculation = () => {
    clearCalculatorData();
    setInputs({
      agencyName: "",
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
    setAgencyNameError("");
    setTouched(false);
    toast.info("Calculation Cleared", {
      description: "All inputs have been reset to defaults.",
    });
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAllSections = () => {
    const allOpen = Object.values(sectionsOpen).every(v => v);
    const newState = !allOpen;
    setSectionsOpen({
      basics: newState,
      staffTime: newState,
      clientChurn: newState,
      lostOpportunities: newState,
      productivity: newState,
    });
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
    // P1 Fix: Reframed to show per-employer average instead of scary total
    
    // Calculate penalty risk based on client portfolio
    const smallClients = Math.floor(inputs.totalClients * 0.7); // 70% under 50 employees
    const largeClients = inputs.totalClients - smallClients; // 30% over 50 employees
    
    // Average liability: $70K-$150K for small, $350K for large
    const smallClientRisk = smallClients * 110000; // midpoint of $70K-$150K
    const largeClientRisk = largeClients * 350000;
    const totalLiabilityExposure = smallClientRisk + largeClientRisk;
    const averageLiabilityPerEmployer = totalLiabilityExposure / inputs.totalClients;
    
    // Revenue growth from lost opportunities
    const revenueGrowth = inputs.largeClientsLost * inputs.averageLargeClientValue;
    const lifetimeValueGrowth = revenueGrowth * 6; // 6-year industry standard
    
    return {
      // Operational costs breakdown
      staffTimeCost,
      clientChurnCost,
      opportunityCost,
      productivityCost,
      totalOperationalCost,
      
      // Liability exposure
      totalLiabilityExposure,
      averageLiabilityPerEmployer,
      
      // Revenue growth
      revenueGrowth,
      lifetimeValueGrowth,
      
      // Legacy fields for compatibility
      penaltyRisk: totalLiabilityExposure,
      totalCost: totalOperationalCost + totalLiabilityExposure,
    };
  };

  const costs = calculateCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/sKRTXuhESaBvPVmV.jpg" 
              alt="Benefits Compliance Solutions" 
              className="h-14 w-auto"
            />
            <div className="border-l border-border pl-3">
              <h1 className="text-lg font-bold">Compliance Cost Calculator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 lg:py-12">
        {/* P1: Resume Calculation Banner */}
        {showResumeBanner && lastSavedDate && (
          <ResumeCalculationBanner
            lastSaved={lastSavedDate}
            onResume={handleResume}
            onDismiss={handleStartFresh}
          />
        )}

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
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
            {/* P2: Section Controls */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Input Sections</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllSections}
                  className="text-xs focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {Object.values(sectionsOpen).every(v => v) ? "Collapse All" : "Expand All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCalculation}
                  className="text-xs focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Company Basics - Collapsible (P2) */}
            <Collapsible open={sectionsOpen.basics} onOpenChange={() => toggleSection('basics')}>
              <Card className="gradient-border-card">
                <CollapsibleTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Company Basics
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.basics ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    <CardDescription className="text-left">Tell us about your agency</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    {/* P0: Agency Name with validation */}
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">
                        Agency Name
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="agencyName"
                        type="text"
                        placeholder="Enter your agency name"
                        value={inputs.agencyName}
                        onChange={(e) => updateInput('agencyName', e.target.value)}
                        onBlur={handleAgencyNameBlur}
                        className={`text-base focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          agencyNameError ? 'border-destructive focus:ring-destructive' : ''
                        }`}
                        aria-invalid={!!agencyNameError}
                        aria-describedby={agencyNameError ? "agencyName-error" : undefined}
                      />
                      {agencyNameError && (
                        <p id="agencyName-error" className="text-sm text-destructive" role="alert">
                          {agencyNameError}
                        </p>
                      )}
                      {!agencyNameError && inputs.agencyName && touched && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <span className="text-green-600">✓</span> Valid
                        </p>
                      )}
                    </div>

                    {/* P0 + P2: Hybrid Slider+Input Controls */}
                    <SliderWithInput
                      id="employees"
                      label="Number of Employee Benefits Staff Members"
                      value={inputs.numberOfEmployees}
                      onChange={(value) => updateInput('numberOfEmployees', value)}
                      min={1}
                      max={500}
                      step={1}
                      tooltip="The number of full-time staff members who work on employee benefits and compliance matters. This helps calculate labor costs."
                    />

                    <SliderWithInput
                      id="hourlyRate"
                      label="Average Hourly Rate"
                      value={inputs.averageHourlyRate}
                      onChange={(value) => updateInput('averageHourlyRate', value)}
                      min={25}
                      max={200}
                      step={5}
                      unit="$"
                      tooltip="The average fully-loaded hourly cost (salary + benefits + overhead) for your benefits staff. Industry average is $60-$90/hour."
                    />

                    <SliderWithInput
                      id="totalClients"
                      label="Total Number of Employers in Your Book of Business"
                      value={inputs.totalClients}
                      onChange={(value) => updateInput('totalClients', value)}
                      min={50}
                      max={1000}
                      step={10}
                      tooltip="The total number of employer clients you serve. This affects liability exposure calculations."
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Staff Time Costs - Collapsible (P2) */}
            <Collapsible open={sectionsOpen.staffTime} onOpenChange={() => toggleSection('staffTime')}>
              <Card className="gradient-border-card">
                <CollapsibleTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Staff Time on Compliance "Fires"
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.staffTime ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    <CardDescription className="text-left">
                      How much time does your team spend putting out compliance emergencies?
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <SliderWithInput
                      id="hoursPerIssue"
                      label="Hours per Compliance Issue"
                      value={inputs.hoursPerComplianceIssue}
                      onChange={(value) => updateInput('hoursPerComplianceIssue', value)}
                      min={0.5}
                      max={8}
                      step={0.5}
                      unit="h"
                      helpText="Industry average: 2-4 hours per issue"
                      tooltip="Time spent researching, resolving, and documenting each compliance issue or question from clients."
                    />

                    <SliderWithInput
                      id="issuesPerMonth"
                      label="Compliance Issues per Month"
                      value={inputs.complianceIssuesPerMonth}
                      onChange={(value) => updateInput('complianceIssuesPerMonth', value)}
                      min={0}
                      max={30}
                      step={1}
                      tooltip="Average number of compliance emergencies, questions, or issues your team handles each month."
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Client Churn - Collapsible (P2) */}
            <Collapsible open={sectionsOpen.clientChurn} onOpenChange={() => toggleSection('clientChurn')}>
              <Card className="gradient-border-card">
                <CollapsibleTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Client Churn Due to Compliance Gaps
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.clientChurn ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    <CardDescription className="text-left">
                      Clients lost when you can't meet compliance expectations
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <SliderWithInput
                      id="clientsLost"
                      label="Clients Lost per Year"
                      value={inputs.clientsLostPerYear}
                      onChange={(value) => updateInput('clientsLostPerYear', value)}
                      min={0}
                      max={20}
                      step={1}
                      tooltip="Number of clients who leave annually due to compliance concerns, lack of expertise, or inability to handle complex requirements."
                    />

                    <SliderWithInput
                      id="clientValue"
                      label="Average Annual Client Value"
                      value={inputs.averageClientValue}
                      onChange={(value) => updateInput('averageClientValue', value)}
                      min={10000}
                      max={200000}
                      step={5000}
                      unit="$"
                      tooltip="Average annual revenue (commissions + fees) from a typical client."
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Lost Opportunities - Collapsible (P2) */}
            <Collapsible open={sectionsOpen.lostOpportunities} onOpenChange={() => toggleSection('lostOpportunities')}>
              <Card className="gradient-border-card">
                <CollapsibleTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Lost Opportunities (Mid to Large Group Employers)
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.lostOpportunities ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    <CardDescription className="text-left">
                      Large clients you couldn't pursue due to compliance limitations
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <SliderWithInput
                      id="largeClientsLost"
                      label="Large Clients Lost per Year"
                      value={inputs.largeClientsLost}
                      onChange={(value) => updateInput('largeClientsLost', value)}
                      min={0}
                      max={10}
                      step={1}
                      tooltip="Number of larger, more profitable opportunities you passed on or lost because you lacked the compliance capabilities to serve them confidently."
                    />

                    <SliderWithInput
                      id="largeClientValue"
                      label="Average Large Client Value"
                      value={inputs.averageLargeClientValue}
                      onChange={(value) => updateInput('averageLargeClientValue', value)}
                      min={50000}
                      max={500000}
                      step={10000}
                      unit="$"
                      tooltip="Average annual revenue potential from a large employer client (typically 100+ employees)."
                    />

                    {costs.revenueGrowth > 0 && (
                      <div className="mt-4 p-3 bg-accent/10 border border-accent rounded-lg">
                        <p className="text-sm font-semibold text-accent-foreground">
                          Potential Annual Revenue Growth: ${costs.revenueGrowth.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Lost Productivity - Collapsible (P2) */}
            <Collapsible open={sectionsOpen.productivity} onOpenChange={() => toggleSection('productivity')}>
              <Card className="gradient-border-card">
                <CollapsibleTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Lost Productivity
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.productivity ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    <CardDescription className="text-left">
                      Employee benefits team members distracted by compliance concerns
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <SliderWithInput
                      id="employeesAffected"
                      label="Employees Affected by Compliance Work"
                      value={inputs.employeesAffectedByCompliance}
                      onChange={(value) => updateInput('employeesAffectedByCompliance', value)}
                      min={1}
                      max={50}
                      step={1}
                      tooltip="Number of staff whose productivity is reduced by ongoing compliance distractions and concerns."
                    />

                    <SliderWithInput
                      id="productivityLoss"
                      label="Productivity Loss Percentage"
                      value={inputs.productivityLossPercentage}
                      onChange={(value) => updateInput('productivityLossPercentage', value)}
                      min={0}
                      max={50}
                      step={1}
                      unit="%"
                      helpText="Industry average: 10-20% of affected staff time lost to compliance distractions"
                      tooltip="Percentage of work time lost due to compliance stress, context switching, and reactive problem-solving instead of proactive client service."
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <CostSummary costs={costs} />
            <PotentialROI costs={costs} revenueGrowth={costs.revenueGrowth} />
          </div>
        </div>

        {/* P1: Trust Signals Section */}
        <div className="mb-12">
          <TrustSignals />
        </div>

        {/* ROI Comparison Section */}
        <ROIComparison totalCost={costs.totalCost} costs={costs} inputs={inputs} />

        {/* Footer with Privacy Policy (P0) */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Benefits Compliance Solutions. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <PrivacyPolicy asLink />
            <span>•</span>
            <a 
              href="https://www.benefitscompliancesolutions.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              About BCS
            </a>
          </div>
          <p className="mt-4 text-xs">
            These estimates are based on typical results from BCS partnerships. Actual savings may vary based on your specific situation.
          </p>
        </footer>
      </main>
    </div>
  );
}
