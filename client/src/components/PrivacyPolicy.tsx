/**
 * Privacy Policy Dialog
 * Addresses P0 issue: missing privacy policy
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyProps {
  trigger?: React.ReactNode;
  asLink?: boolean;
}

export default function PrivacyPolicy({ trigger, asLink = false }: PrivacyPolicyProps) {
  const defaultTrigger = asLink ? (
    <button className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
      Privacy Policy
    </button>
  ) : (
    <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            How Benefits Compliance Solutions handles your information
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">Information We Collect</h3>
              <p className="text-muted-foreground">
                When you use our Compliance Cost Calculator, we collect the following information:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Contact information (name, email, phone number, company name)</li>
                <li>Business metrics you input into the calculator</li>
                <li>Calculated results and estimates</li>
                <li>Usage data and analytics (anonymized)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">How We Use Your Information</h3>
              <p className="text-muted-foreground">
                We use the information you provide to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Generate your personalized compliance cost report</li>
                <li>Contact you to discuss your results and potential partnership opportunities</li>
                <li>Improve our calculator and services</li>
                <li>Send you relevant information about compliance solutions (you can opt out anytime)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">When We Contact You</h3>
              <p className="text-muted-foreground">
                After you download your report, a BCS compliance specialist will contact you within 1 business day to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Answer questions about your results</li>
                <li>Discuss how BCS can help address your specific compliance challenges</li>
                <li>Schedule a consultation if you're interested</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Data Storage and Security</h3>
              <p className="text-muted-foreground">
                Your data is stored securely and is never sold to third parties. We use industry-standard encryption and security practices to protect your information.
              </p>
              <p className="text-muted-foreground mt-2">
                Calculator inputs are temporarily saved in your browser's local storage to allow you to resume your calculation if interrupted. This data remains on your device and is automatically deleted after 30 days.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Your Rights</h3>
              <p className="text-muted-foreground">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Request a copy of your data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Update your contact preferences</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Contact Us</h3>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy or how we handle your data, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Benefits Compliance Solutions</strong><br />
                Email: info@benefitscompliancesolutions.com
              </p>
            </section>

            <section>
              <p className="text-xs text-muted-foreground mt-6">
                Last updated: February 2026
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
