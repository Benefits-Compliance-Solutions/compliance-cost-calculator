/*
Design: Live-updating cost summary with two separate categories
- Operational Costs (labor, lost deals, churn)
- Liability Exposure (potential penalties for book of business)
- Animated number counters for engaging visualization
*/

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, AlertTriangle, TrendingDown, Users, Clock } from "lucide-react";
import CalculationMethodology from "@/components/CalculationMethodology";

interface CostSummaryProps {
  costs: {
    staffTimeCost: number;
    clientChurnCost: number;
    opportunityCost: number;
    productivityCost: number;
    totalOperationalCost: number;
    totalLiabilityExposure: number;
    totalCost: number;
  };
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + difference * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="cost-counter">
      ${Math.round(displayValue).toLocaleString()}
    </span>
  );
}

export default function CostSummary({ costs }: CostSummaryProps) {
  // Revenue-focused breakdown - prioritize revenue loss over operational costs
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;
  const operationalCosts = costs.staffTimeCost + costs.productivityCost;
  
  const costBreakdown = [
    { label: "Revenue Lost to Client Churn", value: costs.clientChurnCost, icon: TrendingDown, isRevenue: true },
    { label: "Large Accounts You Can't Compete For", value: costs.opportunityCost, icon: DollarSign, isRevenue: true },
    { label: "Hours Spent Firefighting Compliance", value: costs.staffTimeCost, icon: Clock, isRevenue: false },
    { label: "Productivity Drained by Compliance Drag", value: costs.productivityCost, icon: Users, isRevenue: false },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Impact Card - Lead with what matters to principals */}
      <Card className="gradient-border-card bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <span className="text-destructive" aria-label="Risk">⚠️</span>
            What Compliance Gaps Are Costing You
          </CardTitle>
          <CardDescription>Revenue you're losing and opportunities you're missing — every year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-destructive mb-2">
            <AnimatedCounter value={costs.totalOperationalCost} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total annual impact</p>
          <div className="flex gap-4 text-sm mb-6">
            <div>
              <span className="font-semibold text-destructive">${Math.round(revenueImpact).toLocaleString()}</span>
              <span className="text-muted-foreground"> revenue loss</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">${Math.round(operationalCosts).toLocaleString()}</span>
              <span className="text-muted-foreground"> operational costs</span>
            </div>
          </div>
          
          <CalculationMethodology
            title="Revenue Impact Calculation"
            formula="Client Churn Revenue + Missed Opportunities + Staff Time + Productivity Loss"
            explanation="This calculation prioritizes revenue impact: (1) Direct revenue lost from client churn, (2) Revenue you're missing from opportunities you can't pursue, (3) Labor costs from compliance firefighting, and (4) Productivity losses. The first two are pure revenue loss—money that should be hitting your bottom line."
            example="Losing 2 clients at $50K each = $100K annual revenue loss. Missing 1 large client at $150K = another $150K. That's $250K in revenue you're walking away from, plus operational drag from compliance issues."
          />
          
          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              Cost Breakdown
            </h4>
            {costBreakdown.map((item, index) => {
              const percentage = costs.totalOperationalCost > 0 
                ? (item.value / costs.totalOperationalCost) * 100 
                : 0;
              const Icon = item.icon;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="w-3 h-3" />
                      {item.label}
                    </span>
                    <span className={`font-semibold ${item.isRevenue ? 'text-destructive' : 'text-muted-foreground'}`}>
                      ${Math.round(item.value).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liability Exposure Card */}
      <Card className="gradient-border-card bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Client Compliance Risk Exposure
          </CardTitle>
          <CardDescription>The aggregate compliance risk your clients carry — and that you're responsible for managing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-destructive mb-4">
            <AnimatedCounter value={costs.totalLiabilityExposure} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Average estimated compliance risk across your book of business
          </p>
          
          <CalculationMethodology
            title="Liability Exposure Calculation"
            formula="(Small Clients × $110K avg) + (Large Clients × $350K avg)"
            explanation="This estimates the total potential penalty exposure across your entire book of business. We assume 70% of your clients are smaller employers (under 50 employees) with average penalty risk of $70K-$150K, and 30% are larger employers with higher risk ($350K+). This is a theoretical maximum exposure, not a prediction of actual penalties."
            example="For 200 clients: 140 small clients × $110K + 60 large clients × $350K = $36.4M total exposure. This shows the scale of risk you're managing, not what will definitely occur."
          />
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Risk Assessment:</strong> Based on your book of business, this represents the potential 
              financial exposure from compliance violations across all client employers. Industry average risk for non-compliance within smaller employers is $70K–$150K, and $350K+ for larger employers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-accent/5 border-accent/30">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-accent">●</span>
              <p><strong>Time drain:</strong> Your team is spending hours every month on compliance fires instead of client growth</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">●</span>
              <p><strong>Revenue impact:</strong> Compliance gaps are costing you ${Math.round(costs.clientChurnCost + costs.opportunityCost).toLocaleString()} annually in lost accounts and missed opportunities</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">●</span>
              <p><strong>Growth barrier:</strong> You're walking away from larger, more profitable accounts because you can't confidently serve their compliance needs</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-destructive">●</span>
              <p><strong>Competitive risk:</strong> Competing brokers are using compliance as a wedge to take your accounts — and winning</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
