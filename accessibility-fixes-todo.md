# Accessibility Fixes Todo List

## Priority 0: Legal/Compliance Blockers (Implement Immediately)

- [ ] Fix muted text contrast (3.78:1 → 5.2:1)
  - Change `--muted-foreground` from `oklch(0.50 0.02 280)` to `oklch(0.42 0.02 280)`
  - Test across all instances
  
- [ ] Fix accent text contrast (2.14:1 → 6.5:1)
  - Create new `--accent-text` variable at `oklch(0.45 0.10 180)`
  - Replace accent color usage in text with new variable
  - Keep original accent for backgrounds/borders
  
- [ ] Add non-color indicators to risk/opportunity states
  - Add ⚠️ icon to red "Revenue at Risk" sections
  - Add ✓ icon to green "Revenue Growth Opportunity" sections
  - Include text labels where appropriate

## Priority 1: Accessibility Improvements

- [ ] Increase extra-small text from 12px → 14px
  - Update `text-xs` usage to `text-sm` where appropriate
  - Reserve 12px only for truly supplementary content
  
- [ ] Implement mobile-specific font size overrides
  - Ensure all inputs are 16px on mobile (prevent iOS auto-zoom)
  - Scale small text up to 14-16px on mobile
  
- [ ] Verify and fix touch target sizes
  - Ensure 44x44px minimum on mobile for all interactive elements
  - Add padding to help icons (?) to meet minimum
  
- [ ] Increase focus ring visibility
  - Remove 50% opacity from focus indicators
  - Add focus-visible styles to all interactive elements

## Priority 2: Readability Enhancements

- [ ] Implement fluid typography with clamp()
  - Apply to hero heading, large numbers, body text
  
- [ ] Increase large number line height from 1.11 → 1.3
  
- [ ] Add responsive scaling to small text
  - Change `text-sm` to `text-sm md:text-base` for labels
