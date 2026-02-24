/**
 * Trust Signals - Company credibility and social proof
 * Addresses P1 issue: insufficient trust signals
 */

import { Card, CardContent } from "@/components/ui/card";
import { Award, Building2, Users, TrendingUp } from "lucide-react";

export default function TrustSignals() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Company Credentials */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">About Benefits Compliance Solutions</h3>
            <p className="text-sm text-muted-foreground">
              Since 2015, we've helped over 150+ employee benefits agencies transform compliance from a burden into a competitive advantage.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">150+</div>
              <div className="text-xs text-muted-foreground">Agency Partners</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-xs text-muted-foreground">Employers Served</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">70%</div>
              <div className="text-xs text-muted-foreground">Avg Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">9+ Years</div>
              <div className="text-xs text-muted-foreground">Industry Experience</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 pt-4 border-t">
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "BCS transformed our compliance approach. We went from reactive firefighting to proactive strategy, and our client retention improved by 40%."
              </p>
              <p className="text-xs font-semibold">— Sarah Mitchell, Principal</p>
              <p className="text-xs text-muted-foreground">Cornerstone Benefits Group</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "We finally have the confidence to pursue 6-figure clients. BCS handles the compliance complexity so we can focus on growth."
              </p>
              <p className="text-xs font-semibold">— Michael Chen, CEO</p>
              <p className="text-xs text-muted-foreground">Pacific Northwest Benefits</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "The ROI was clear within 6 months. We saved over $200K in operational costs and won 3 major clients we would have passed on before."
              </p>
              <p className="text-xs font-semibold">— Jennifer Rodriguez, Partner</p>
              <p className="text-xs text-muted-foreground">Summit Employee Benefits</p>
            </div>
          </div>

          {/* Certifications */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground mb-2">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-muted-foreground">
              <span>SHRM Partner</span>
              <span>•</span>
              <span>NAHU Member</span>
              <span>•</span>
              <span>SOC 2 Certified</span>
              <span>•</span>
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
