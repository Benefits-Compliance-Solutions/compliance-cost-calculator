/**
 * Calculation Methodology - Explains how costs are calculated
 * Addresses P1 issue: lack of calculation transparency
 */

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

interface MethodologyProps {
  title: string;
  formula: string;
  explanation: string;
  example?: string;
}

export default function CalculationMethodology({
  title,
  formula,
  explanation,
  example,
}: MethodologyProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1">
        <Info className="w-4 h-4" />
        <span>How is this calculated?</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold text-foreground">{title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border">
              {formula}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{explanation}</p>
          </div>
          {example && (
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-foreground mb-1">Example:</p>
              <p className="text-xs text-muted-foreground">{example}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
