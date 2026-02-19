/*
Design: Potential ROI section showing revenue gains from BCS partnership
- Client retention value
- Labor cost savings
- New business revenue from compliance capabilities
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface PotentialROIProps {
  costs: {
    clientChurnCost: number;
    staffTimeCost: number;
    productivityCost: number;
  };
  revenueGrowth: number;
}

export default function PotentialROI({ costs, revenueGrowth }: PotentialROIProps) {
  // Calculate potential gains
  const clientRetentionValue = costs.clientChurnCost * 0.8; // 80% of churn prevented
  const laborSavings = (costs.staffTimeCost + costs.productivityCost) * 0.7; // 70% efficiency gain
  const newBusinessRevenue = revenueGrowth; // From inputs
  const totalPotentialROI = clientRetentionValue + laborSavings + newBusinessRevenue;

  const roiBreakdown = [
    { 
      label: "Client Retention Value", 
      value: clientRetentionValue, 
      icon: Users,
      description: "Keep your best clients with confidence"
    },
    { 
      label: "Labor Cost Savings", 
      value: laborSavings, 
      icon: TrendingUp,
      description: "Reduce time spent on compliance fires"
    },
    { 
      label: "New Business Revenue", 
      value: newBusinessRevenue, 
      icon: DollarSign,
      description: "Win deals by leading with compliance"
    },
  ];

  return (
    <Card className="gradient-border-card bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Target className="w-5 h-5" />
          Potential ROI
        </CardTitle>
        <CardDescription>Revenue gains from stronger compliance capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-accent mb-6">
          ${totalPotentialROI.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Annual revenue opportunity beyond cost savings
        </p>
        
        {/* ROI Breakdown */}
        <div className="space-y-4">
          {roiBreakdown.map((item, index) => {
            const percentage = totalPotentialROI > 0 
              ? (item.value / totalPotentialROI) * 100 
              : 0;
            const Icon = item.icon;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Icon className="w-4 h-4 text-accent" />
                    {item.label}
                  </span>
                  <span className="font-semibold text-accent">${item.value.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{item.description}</p>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-sm text-foreground">
            <strong>Growth Impact:</strong> By solving compliance challenges, you can retain more clients, 
            free up your team to focus on revenue-generating activities, and confidently win new business 
            by leading with compliance expertise in your sales process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
