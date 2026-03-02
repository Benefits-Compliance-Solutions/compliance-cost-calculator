/**
 * SliderWithInput - Accessible hybrid control combining slider and numeric input
 * Addresses P0 accessibility issue: provides keyboard-accessible alternative to slider-only controls
 */

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { SimpleTooltip } from "@/components/SimpleTooltip";

interface SliderWithInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  helpText?: string;
  tooltip?: string;
  required?: false;
  onFirstInteraction?: () => void;
}

export default function SliderWithInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  helpText,
  tooltip,
  required = false,
  onFirstInteraction,
}: SliderWithInputProps) {
  const handleInteraction = () => {
    if (onFirstInteraction) onFirstInteraction();
  };
  // Calculate input width based on max value digits
  const getInputWidth = () => {
    const maxDigits = max.toString().length;
    const unitWidth = unit ? 2 : 0; // Extra space for unit symbol
    if (maxDigits >= 6) return 'w-36'; // 144px for 6+ digits
    if (maxDigits >= 5) return 'w-32'; // 128px for 5 digits
    if (maxDigits >= 4) return 'w-28'; // 112px for 4 digits
    return 'w-24'; // 96px for 3 or fewer digits
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      newValue = min;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="flex-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && <SimpleTooltip content={tooltip} />}
      </div>
      
      <div className="flex items-center gap-4">
        <Slider
          id={id}
          value={[value]}
          onValueChange={([newValue]) => { handleInteraction(); onChange(newValue); }}
          onFocus={handleInteraction}
          min={min}
          max={max}
          step={step}
          className="flex-1"
          aria-label={label}
        />
        <div className={`relative ${getInputWidth()}`}>
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInteraction}
            min={min}
            max={max}
            step={step}
            className="text-right pr-8 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`${label} value`}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
      
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
