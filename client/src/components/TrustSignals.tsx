/**
 * Trust Signals - Company credibility and social proof
 * Addresses P1 issue: insufficient trust signals
 * Updated with authentic testimonials from BCS website
 */

import { Card, CardContent } from "@/components/ui/card";
import { Award, Building2, Users } from "lucide-react";

export default function TrustSignals() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Company Credentials */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">About Benefits Compliance Solutions</h3>
            <p className="text-sm text-muted-foreground">
              Since 2015, we've helped over 25+ employee benefits agencies transform compliance from a burden into a competitive advantage.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">25+</div>
              <div className="text-sm text-muted-foreground">Agency Partners</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Employers Served</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">99%+</div>
              <div className="text-sm text-muted-foreground">Agency Partner Retention Rate</div>
            </div>
          </div>

          {/* Authentic Testimonials from BCS Website */}
          <div className="space-y-4 pt-4 border-t">
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "BCS has delivered big time. They've given our team so much confidence with compliance, and I can't even begin to explain the business impacts. We've literally won dozens of BORs because of them!"
              </p>
              <p className="text-sm font-semibold">— Mike Johnson, VP of Employee Benefits</p>
              <p className="text-sm text-muted-foreground">Hausmann-Johnson Insurance</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "We used to spend days solving problems that takes BCS a matter of hours. They're a partner to us just like we're a partner to our employer clients. They make us shine brighter!"
              </p>
              <p className="text-sm font-semibold">— Edwige Ligonde</p>
              <p className="text-sm text-muted-foreground">2021 Benefits Pro Broker of the Year | Partner, Market Director</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-sm italic text-muted-foreground mb-2">
                "I won 2 large accounts with the tools they provide in Q4 alone"
              </p>
              <p className="text-sm font-semibold">— Anne Vallette, Senior Benefits Consultant</p>
              <p className="text-sm text-muted-foreground">CGI Business Solutions</p>
            </div>
          </div>

          {/* Certifications */}
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground mb-2">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-muted-foreground">
              <span>SHRM Partner</span>
              <span>•</span>
              <span>NABIP Member</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
