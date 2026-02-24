/**
 * Resume Calculation Banner
 * Addresses P1 issue: no save/resume functionality
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { formatTimestamp } from "@/lib/storage";

interface ResumeCalculationBannerProps {
  lastSaved: Date;
  onResume: () => void;
  onDismiss: () => void;
}

export default function ResumeCalculationBanner({
  lastSaved,
  onResume,
  onDismiss,
}: ResumeCalculationBannerProps) {
  return (
    <Alert className="mb-6 border-primary bg-primary/5">
      <Clock className="h-4 w-4" />
      <AlertTitle>Resume Your Previous Calculation</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between gap-4">
        <span className="text-sm">
          You have a saved calculation from {formatTimestamp(lastSaved)}. Would you like to continue where you left off?
        </span>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            onClick={onResume}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Resume
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="w-4 h-4 mr-1" />
            Start Fresh
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
