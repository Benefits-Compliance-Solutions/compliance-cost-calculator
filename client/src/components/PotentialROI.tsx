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
      label: "New Business Revenue", 
      value: newBusinessRevenue, 
      icon: DollarSign,
      description: "Win high-value clients you can't pursue today",
      isRevenue: true
    },
    { 
      label: "Client Retention Value", 
      value: clientRetentionValue, 
      icon: Users,
      description: "Stop losing clients to compliance gaps",
      isRevenue: true
    },
    { 
      label: "Operational Efficiency Gains", 
      value: laborSavings, 
      icon: TrendingUp,
      description: "Free your team from compliance firefighting",
      isRevenue: false
    },
  ];

  return (
    <Card className="gradient-border-card bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Target className="w-5 h-5" />
          Revenue Growth Opportunity
        </CardTitle>
        <CardDescription>New revenue you could capture with compliance as a competitive advantage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-accent mb-2">
          ${newBusinessRevenue.toLocaleString()}
        </div>
        <p className="text-sm font-semibold text-accent mb-1">
          Annual new business revenue potential
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          From large clients you can confidently pursue with compliance capabilities<br/>
          <span className="font-medium">6-Year Lifetime Value: ${(newBusinessRevenue * 6).toLocaleString()}</span>
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
                  <span className={`font-semibold ${item.isRevenue ? 'text-accent' : 'text-muted-foreground'}`}>${item.value.toLocaleString()}</span>
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

        <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent rounded-lg">
          <p className="text-sm text-foreground">
            <strong className="text-accent">Why This Matters:</strong> Agency principals don't just want to reduce costs—they want to grow revenue. 
            With compliance capabilities, you can pursue 6-figure clients, retain your best accounts, and position compliance 
            as a competitive differentiator in your sales process. This is about <strong>revenue growth</strong>, not just cost reduction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
