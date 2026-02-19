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
  const operationalBreakdown = [
    { label: "Staff Time on Compliance Issues", value: costs.staffTimeCost, icon: Clock },
    { label: "Client Churn", value: costs.clientChurnCost, icon: TrendingDown },
    { label: "Lost Large Client Opportunities", value: costs.opportunityCost, icon: DollarSign },
    { label: "Lost Productivity", value: costs.productivityCost, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Operational Costs Card */}
      <Card className="gradient-border-card bg-gradient-to-br from-card to-card/50 shadow-lg border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            Operational Costs
          </CardTitle>
          <CardDescription>Labor, lost deals, and client churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-primary mb-4">
            <AnimatedCounter value={costs.totalOperationalCost} />
          </div>
          <p className="text-sm text-muted-foreground mb-6">Annual cost from compliance inefficiencies</p>
          
          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              Cost Breakdown
            </h4>
            {operationalBreakdown.map((item, index) => {
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
                    <span className="font-semibold text-primary">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
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
            Liability Exposure
          </CardTitle>
          <CardDescription>Potential penalties for entire book of business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-destructive mb-4">
            <AnimatedCounter value={costs.totalLiabilityExposure} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Compliance penalty risk across all clients
          </p>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive-foreground">
              <strong>Risk Assessment:</strong> Based on your book of business, this represents the potential 
              financial exposure from compliance violations across all client employers. Industry data shows 
              average penalties of $70K-$150K for smaller employers and $350K+ for larger employers.
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
              <p><strong>Time drain:</strong> Your team spends significant hours each month on compliance fires</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">●</span>
              <p><strong>Revenue impact:</strong> Lost opportunities and churn cost ${(costs.clientChurnCost + costs.opportunityCost).toLocaleString()} annually</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">●</span>
              <p><strong>Growth barrier:</strong> Compliance limitations prevent you from pursuing larger clients</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-destructive">●</span>
              <p><strong>Exposure risk:</strong> Your book of business carries substantial compliance liability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
