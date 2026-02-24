# UX Fixes Implementation Checklist

## P0 - Launch Blockers (Fix Immediately)

### 1. Input Validation and Error States
- [ ] Add validation to Agency Name field (required, min 2 characters)
- [ ] Add visual error states (red border, error message)
- [ ] Add success states (green checkmark when valid)
- [ ] Ensure all inputs have proper validation before allowing PDF download
- [ ] Add inline validation messages below each field

### 2. Accessibility Violations
- [ ] Add direct numeric input fields alongside all sliders
- [ ] Implement visible focus indicators (2px outline) on all interactive elements
- [ ] Add ARIA labels to all form controls
- [ ] Add ARIA live regions for dynamic calculation updates
- [ ] Add text labels alongside color coding (not just red/green)
- [ ] Ensure keyboard navigation works for all interactive elements
- [ ] Test with screen reader (basic verification)

### 3. Privacy Policy
- [ ] Create Privacy Policy page/modal
- [ ] Add privacy policy link in footer
- [ ] Add privacy notice in lead capture form
- [ ] Explain data handling: "We'll use your information to send your report and follow up within 1 business day"

---

## P1 - High Impact (Fix Within 2 Weeks)

### 4. Save/Resume Functionality
- [ ] Implement localStorage to save form state
- [ ] Add auto-save on every input change (debounced)
- [ ] Show "Resume previous calculation" prompt on page load if data exists
- [ ] Add "Clear calculation" button to start fresh
- [ ] Store timestamp of last save

### 5. Calculation Transparency
- [ ] Add "How is this calculated?" expandable sections under each major result
- [ ] Show formulas in plain language (e.g., "Staff hours × hourly rate × issues per month")
- [ ] Add methodology document link
- [ ] Show breakdown of each cost component
- [ ] Add tooltips explaining each input's impact

### 6. Trust Signals
- [ ] Add "About BCS" section with company info
- [ ] Add 3-5 client testimonials with real names/companies
- [ ] Add trust badges (certifications, partnerships)
- [ ] Add "Based on 150+ agency partnerships" social proof
- [ ] Include founding year and credentials
- [ ] Add case study links

### 7. Liability Exposure Reframing
- [ ] Change from total ($36.4M) to per-employer average ($182K)
- [ ] Add context: "Based on industry data: $70K-$150K for small employers, $350K+ for large"
- [ ] Add confidence intervals or ranges
- [ ] Reframe as "risk assessment" not "guaranteed penalty"
- [ ] Add disclaimer about theoretical maximum vs. actual risk

---

## P2 - Medium Impact (Fix Within 1 Month)

### 8. Progressive Disclosure / Cognitive Overload
- [ ] Implement accordion-style sections (collapsible)
- [ ] Add "Expand All" / "Collapse All" toggle
- [ ] Consider wizard-style flow with steps
- [ ] Add progress indicator showing completion %
- [ ] Auto-expand next section when current is complete
- [ ] Add smooth scroll to next section

### 9. Slider Precision Problems
- [ ] Add numeric input field next to each slider
- [ ] Sync slider and input field bidirectionally
- [ ] Add increment/decrement buttons (+ / -)
- [ ] Allow keyboard input for exact values
- [ ] Add units/formatting to input fields ($, hours, etc.)

### 10. Micro-Conversions
- [ ] Add "Save My Calculation" button (no form required)
- [ ] Add "Email Me Results" option (email only)
- [ ] Add "Share with CFO" pre-populated email template
- [ ] Add "Print Results" option
- [ ] Show preview of report contents in lead capture modal
- [ ] Add value reinforcement in modal: "Your 2-page report includes..."

### 11. Mobile Optimizations
- [ ] Implement tabbed interface for mobile: "Your Inputs" / "Your Results"
- [ ] Reduce input sections on mobile (show only essential)
- [ ] Optimize slider touch targets (larger hit areas)
- [ ] Test on actual mobile devices (iOS Safari, Chrome Android)
- [ ] Add sticky CTA bar on mobile
- [ ] Reduce scroll depth with progressive disclosure

---

## Implementation Notes

- Work in order: P0 → P1 → P2
- Test each fix before moving to next
- Ensure no regressions to existing functionality
- Maintain current design aesthetic while improving UX
- Document any technical decisions or trade-offs
