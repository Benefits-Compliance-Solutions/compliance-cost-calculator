/**
 * SliderWithInput — Accessible hybrid control combining a range slider and a numeric text input.
 *
 * UX Design Principles (best practice for paired slider + number input):
 *
 * 1. LOCAL STRING STATE — The input box maintains its own `localValue` string while the user
 *    is actively typing. This allows the user to freely delete all digits, type a new number
 *    from scratch, or enter intermediate values (e.g. "1" while typing "150") without the
 *    field snapping back or blocking keystrokes.
 *
 * 2. COMMIT ON BLUR — The parent `onChange` is only called when the user leaves the field
 *    (onBlur). At that point the value is clamped to [min, max] and snapped to the nearest
 *    step. If the field is empty or non-numeric, it resets to the current `value` prop.
 *
 * 3. SYNC FROM SLIDER — When the slider moves, `localValue` is updated immediately so the
 *    text box always reflects the slider position.
 *
 * 4. SYNC FROM PROP — If the parent updates `value` while the input is NOT focused (e.g.
 *    "Clear" button resets all fields), `localValue` is updated to match.
 *
 * 5. NO BROWSER SPINNERS — type="text" inputMode="numeric" avoids the browser's built-in
 *    number spinner arrows and the browser's own min/max enforcement, which was the root
 *    cause of the "can't delete the first digit" bug with type="number".
 */

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

/** Snap a number to the nearest multiple of `step`, then clamp to [min, max]. */
function clampAndSnap(n: number, min: number, max: number, step: number): number {
  const snapped = Math.round((n - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

/** Format a number for display in the input box (no trailing decimals for whole numbers). */
function formatDisplay(n: number, step: number): string {
  // If step is a whole number, show no decimal places
  if (Number.isInteger(step)) return String(Math.round(n));
  // Otherwise show enough decimal places to represent the step
  const decimals = step.toString().split(".")[1]?.length ?? 1;
  return n.toFixed(decimals);
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
  // Local string state for the text input — allows free editing without snapping
  const [localValue, setLocalValue] = useState<string>(formatDisplay(value, step));
  const isFocused = useRef(false);

  // Sync local display when the slider moves OR when an external reset changes `value`
  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(formatDisplay(value, step));
    }
  }, [value, step]);

  const handleInteraction = () => {
    if (onFirstInteraction) onFirstInteraction();
  };

  // Slider change: commit immediately (slider always produces valid values)
  const handleSliderChange = ([newValue]: number[]) => {
    handleInteraction();
    setLocalValue(formatDisplay(newValue, step));
    onChange(newValue);
  };

  // Text input change: just update local string — do NOT call onChange yet
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits, a leading minus (for future use), and a decimal point
    const raw = e.target.value;
    // Only allow characters that can form a valid number
    if (/^-?\d*\.?\d*$/.test(raw)) {
      setLocalValue(raw);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocused.current = true;
    handleInteraction();
    // Select all text on focus so the user can immediately type a new value
    e.target.select();
  };

  // On blur: parse, clamp, snap, commit to parent
  const handleBlur = () => {
    isFocused.current = false;
    const parsed = parseFloat(localValue);
    const committed = isNaN(parsed)
      ? value // revert to last valid value if field is empty/invalid
      : clampAndSnap(parsed, min, max, step);
    setLocalValue(formatDisplay(committed, step));
    onChange(committed);
  };

  // Calculate input width based on max value digits
  const getInputWidth = () => {
    const maxDigits = max.toString().length;
    if (maxDigits >= 6) return "w-36";
    if (maxDigits >= 5) return "w-32";
    if (maxDigits >= 4) return "w-28";
    return "w-24";
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
          onValueChange={handleSliderChange}
          onFocus={handleInteraction}
          min={min}
          max={max}
          step={step}
          className="flex-1"
          aria-label={label}
        />
        <div className={`relative ${getInputWidth()}`}>
          <Input
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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

      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}
