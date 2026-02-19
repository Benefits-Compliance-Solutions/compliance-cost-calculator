/*
Design: Live-updating cost summary with animated counters
- Gradient-bordered card with pulse effect on updates
- Animated number counters for engaging visualization
- Color-coded cost categories
*/

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp } from "lucide-react";

interface CostSummaryProps {
  costs: {
    staffTimeCost: number;
    clientChurnCost: number;
    opportunityCost: number;
    productivityCost: number;
    penaltyRisk: number;
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
  const costBreakdown = [
    { label: "Staff Time on Compliance Issues", value: costs.staffTimeCost, color: "text-chart-1" },
    { label: "Client Churn", value: costs.clientChurnCost, color: "text-chart-2" },
    { label: "Lost Large Client Opportunities", value: costs.opportunityCost, color: "text-chart-3" },
    { label: "Lost Productivity", value: costs.productivityCost, color: "text-chart-4" },
    { label: "Penalty & Fine Risk", value: costs.penaltyRisk, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Total Cost Card */}
      <Card className="gradient-border-card bg-gradient-to-br from-card to-card/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            Total Annual Compliance Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-primary mb-2">
            <AnimatedCounter value={costs.totalCost} />
          </div>
          <p className="text-sm text-muted-foreground">
            Hidden costs draining your agency's resources
          </p>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-accent" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {costBreakdown.map((item, index) => {
            const percentage = costs.totalCost > 0 ? (item.value / costs.totalCost) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>
                    <AnimatedCounter value={item.value} duration={800} />
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {percentage.toFixed(1)}% of total cost
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="bg-accent/10 border-accent/30">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
              <p>
                <span className="font-semibold">Time drain:</span> Your team spends{" "}
                <span className="font-bold text-accent">
                  {(costs.staffTimeCost / (75 * 12)).toFixed(0)} hours/month
                </span>{" "}
                on compliance fires
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
              <p>
                <span className="font-semibold">Revenue impact:</span> Lost opportunities and churn cost{" "}
                <span className="font-bold text-accent">
                  ${(costs.clientChurnCost + costs.opportunityCost).toLocaleString()}
                </span>{" "}
                annually
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
              <p>
                <span className="font-semibold">Growth barrier:</span> Compliance limitations prevent you from pursuing larger clients
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
