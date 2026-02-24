/*
Design: LTV Education Component
- Helps CFOs understand lifetime value in recurring revenue business
- Shows industry retention rate data with citations
- Visualizes the difference between annual value and lifetime value
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import { RETENTION_RATES, LTV_MULTIPLIERS, LTV_CITATIONS, calculateClientRetention } from "@/lib/ltvCalculations";

interface LTVEducationProps {
  averageClientValue: number;
  totalClients: number;
}

export default function LTVEducation({ averageClientValue, totalClients }: LTVEducationProps) {
  // Calculate examples
  const industryAvgLTV = averageClientValue * LTV_MULTIPLIERS.INDUSTRY_AVERAGE;
  const topPerformerLTV = averageClientValue * LTV_MULTIPLIERS.TOP_PERFORMER;
  const ltvImprovement = topPerformerLTV - industryAvgLTV;
  const improvementPercentage = ((ltvImprovement / industryAvgLTV) * 100).toFixed(0);
  
  // Calculate clients remaining after 6 years
  const industryAvgRemaining = (calculateClientRetention(RETENTION_RATES.INDUSTRY_AVERAGE, 6) * 100).toFixed(0);
  const topPerformerRemaining = (calculateClientRetention(RETENTION_RATES.TOP_PERFORMER, 6) * 100).toFixed(0);
  
  // Calculate total book value
  const industryBookValue = totalClients * industryAvgLTV;
  const topPerformerBookValue = totalClients * topPerformerLTV;
  const bookValueGap = topPerformerBookValue - industryBookValue;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5" />
          Understanding Lifetime Value in Your Business
        </CardTitle>
        <CardDescription className="text-blue-700">
          Most CFOs think in annual terms, but benefits agencies are recurring revenue businesses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* The Core Concept */}
        <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
          <h4 className="font-bold text-blue-900 mb-3">The Recurring Revenue Reality</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">What CFOs See</p>
              <p className="text-3xl font-bold text-blue-900">${averageClientValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Annual client value</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-400">
              <p className="text-sm font-semibold text-blue-900 mb-1">What It's Really Worth</p>
              <p className="text-3xl font-bold text-blue-900">${industryAvgLTV.toLocaleString()}</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">6-year lifetime value (84% retention)</p>
            </div>
          </div>
          <p className="text-sm text-center text-blue-800 mt-4 font-medium">
            That's a <strong className="text-blue-900">{LTV_MULTIPLIERS.INDUSTRY_AVERAGE.toFixed(2)}x</strong> multiplier. 
            Every decision should account for this.
          </p>
        </div>

        {/* Industry Data */}
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Industry Retention Benchmarks
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-400">
              <div>
                <p className="font-semibold text-red-900">Industry Average</p>
                <p className="text-xs text-muted-foreground">Most benefits agencies</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-900">{(RETENTION_RATES.INDUSTRY_AVERAGE * 100).toFixed(0)}%</p>
                <p className="text-xs text-red-700">Annual retention</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded border-l-4 border-green-500">
              <div>
                <p className="font-semibold text-green-900">Top Performers</p>
                <p className="text-xs text-muted-foreground">With strong compliance capabilities</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">{(RETENTION_RATES.TOP_PERFORMER * 100).toFixed(0)}%</p>
                <p className="text-xs text-green-700">Annual retention</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>What this means after 6 years:</strong>
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Industry Average (84%)</p>
                <p className="text-xl font-bold text-red-700">{industryAvgRemaining}%</p>
                <p className="text-xs text-muted-foreground">of clients remain</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top Performers (93%)</p>
                <p className="text-xl font-bold text-green-700">{topPerformerRemaining}%</p>
                <p className="text-xs text-muted-foreground">of clients remain</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Retention Gap */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300">
          <h4 className="font-bold text-amber-900 mb-3">The Retention Gap = The Revenue Gap</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">LTV at 84% retention:</span>
              <span className="text-lg font-bold text-amber-900">${industryAvgLTV.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">LTV at 93% retention:</span>
              <span className="text-lg font-bold text-green-700">${topPerformerLTV.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-amber-300 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-900">LTV Improvement per Client:</span>
              <span className="text-xl font-bold text-green-700">+${ltvImprovement.toLocaleString()}</span>
            </div>
            <p className="text-xs text-center text-amber-800 font-medium">
              That's a <strong>{improvementPercentage}% increase</strong> in the value of every client relationship
            </p>
          </div>
        </div>

        {/* Your Book of Business */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300">
          <h4 className="font-bold text-indigo-900 mb-3">What This Means for Your Book of Business</h4>
          <div className="space-y-3">
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your {totalClients} Clients</p>
              <p className="text-sm text-muted-foreground">at ${averageClientValue.toLocaleString()} average annual value</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-muted-foreground mb-1">At 84% Retention</p>
                <p className="text-2xl font-bold text-red-900">${(industryBookValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground mt-1">Total book LTV</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-400">
                <p className="text-xs text-muted-foreground mb-1">At 93% Retention</p>
                <p className="text-2xl font-bold text-green-900">${(topPerformerBookValue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground mt-1">Total book LTV</p>
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-400">
              <p className="text-sm font-semibold text-indigo-900 mb-1">Additional Book Value from Better Retention</p>
              <p className="text-3xl font-bold text-indigo-900">${(bookValueGap / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-indigo-700 mt-1">
                This is the hidden value you unlock by improving retention from 84% to 93%
              </p>
            </div>
          </div>
        </div>

        {/* Citation */}
        <div className="p-3 bg-white rounded border border-blue-200">
          <p className="text-xs text-muted-foreground">
            <strong>Source:</strong> {LTV_CITATIONS.PRIMARY.source} ({LTV_CITATIONS.PRIMARY.year}) - 
            Industry average retention rate: {LTV_CITATIONS.PRIMARY.stats.industryAverage}, 
            Top performers: {LTV_CITATIONS.PRIMARY.stats.topPerformers}. 
            Supporting data from {LTV_CITATIONS.SUPPORTING.source} confirms {LTV_CITATIONS.SUPPORTING.stats.acquisitionCost} acquisition cost premium.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
