import React from "react";
import { HelpCircle } from "lucide-react";

interface SimpleTooltipProps {
  content: string;
}

export function SimpleTooltip({ content }: SimpleTooltipProps) {
  return (
    <div className="tooltip-wrapper">
      <button
        type="button"
        className="p-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        data-tooltip={content}
        aria-label="Help"
        tabIndex={0}
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
