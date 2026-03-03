/**
 * BCS Compliance Cost Report — PDF Generator
 *
 * Faithful port of the approved design-optimized PDF prototype.
 * All font sizes, colors, spacing, and layout match the approved PDF exactly.
 *
 * Key design values:
 * - Outfit font family (Regular, SemiBold, Bold)
 * - BCS navy: #3D3A8E  |  BCS teal: #4AADA8
 * - Hero card: NAVY bg, all text WHITE and BOLD (high contrast)
 * - Liability card: NAVY_LIGHT (#EEEDF8) bg, NAVY border, BOLD text
 * - Disclaimer at TOP of page 3, not bottom of page 2
 * - Partnership comparison cards: full content width (50/50 split)
 * - Font sizes: section headings 13pt, body 10pt, sub-labels 9pt
 */

import jsPDF from 'jspdf';
import { RETENTION_RATES, LTV_CITATIONS } from './ltvCalculations';
import { BCS_WHITE_LOGO_BASE64 } from './logoBase64';
import {
  Outfit_Regular_BASE64,
  Outfit_Bold_BASE64,
  Outfit_SemiBold_BASE64,
} from './outfitFonts';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface CostData {
  staffTimeCost: number;
  clientChurnCost: number;
  opportunityCost: number;
  productivityCost: number;
  totalOperationalCost: number;
  totalLiabilityExposure: number;
  penaltyRisk: number;
  revenueGrowth: number;
  lifetimeValueGrowth: number;
  totalCost: number;
  clientChurnLTV?: number;
  clientChurnLTVTotal?: number;
  revenueGrowthLTV?: number;
}

interface LeadData {
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface CompanyInputs {
  agencyName?: string;
  numberOfEmployees: number;
  averageHourlyRate: number;
  hoursPerComplianceIssue: number;
  complianceIssuesPerMonth: number;
  totalClients?: number;
  newClientsWonPerYear?: number;
  averageNewClientValue?: number;
  leadData?: LeadData;
}

// ─── Brand palette ────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const NAVY        = hexToRgb('#3D3A8E');
const TEAL        = hexToRgb('#4AADA8');
const NAVY_LIGHT  = hexToRgb('#EEEDF8');  // lavender card bg
const TEAL_LIGHT  = hexToRgb('#E8F6F5');  // mint card bg
const GRAY_DARK   = hexToRgb('#3D3D3D');
const GRAY_MID    = hexToRgb('#6B7280');
const GRAY_LIGHT  = hexToRgb('#F3F4F6');
const RULE_COLOR  = hexToRgb('#D1D5DB');
const WHITE       = hexToRgb('#FFFFFF');
const HEADER_MUTED = hexToRgb('#C7C5E8');
const HEADER_DIM   = hexToRgb('#A8A5D8');

// ─── Page geometry ────────────────────────────────────────────────────────────
const PW = 215.9;        // letter width mm
const PH = 279.4;        // letter height mm
const ML = 14;           // left/right margin mm
const CW = PW - ML * 2; // content width = 187.9mm

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}
function setColor(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}
function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setStroke(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

// ─── Section rule ─────────────────────────────────────────────────────────────
function drawSectionRule(doc: jsPDF, y: number) {
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y, ML + CW, y);
}

// ─── Section heading: Outfit-Bold 13pt navy + thin gray rule ─────────────────
function drawSectionHeading(doc: jsPDF, label: string, y: number): number {
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(13);
  setColor(doc, NAVY);
  doc.text(label, ML, y);
  drawSectionRule(doc, y + 2);
  return y + 2;
}

// ─── Register Outfit fonts ────────────────────────────────────────────────────
function registerFonts(doc: jsPDF) {
  doc.addFileToVFS('Outfit-Regular.ttf', Outfit_Regular_BASE64);
  doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');
  doc.addFileToVFS('Outfit-Bold.ttf', Outfit_Bold_BASE64);
  doc.addFont('Outfit-Bold.ttf', 'Outfit', 'bold');
  doc.addFileToVFS('Outfit-SemiBold.ttf', Outfit_SemiBold_BASE64);
  doc.addFont('Outfit-SemiBold.ttf', 'OutfitSemiBold', 'normal');
}

// ─── Page 1 header (31mm tall) ────────────────────────────────────────────────
function drawHeader1(doc: jsPDF, agencyName: string, dateStr: string) {
  const hH = 31;
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');
  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  // White logo — left side
  const logoH = 18;
  const logoW = logoH * (1588 / 560);
  try {
    doc.addImage(BCS_WHITE_LOGO_BASE64, 'PNG', ML, (hH - logoH) / 2, logoW, logoH);
  } catch (_) { /* skip */ }

  // Title
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(18);
  setColor(doc, WHITE);
  doc.text('COMPLIANCE COST ANALYSIS', PW - ML, 11, { align: 'right' });

  // Prepared for
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(`Prepared for: ${agencyName}`, PW - ML, 19, { align: 'right' });

  // Date
  doc.setFontSize(8.5);
  setColor(doc, HEADER_DIM);
  doc.text(`Report Generated: ${dateStr}`, PW - ML, 25.5, { align: 'right' });
}

// ─── Pages 2-3 header (25.4mm tall) ──────────────────────────────────────────
function drawHeader2(doc: jsPDF, title: string, subtitle: string) {
  const hH = 25.4;
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');
  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  const logoH = 14;
  const logoW = logoH * (1588 / 560);
  try {
    doc.addImage(BCS_WHITE_LOGO_BASE64, 'PNG', ML, (hH - logoH) / 2, logoW, logoH);
  } catch (_) { /* skip */ }

  doc.setFont('Outfit', 'bold');
  doc.setFontSize(16);
  setColor(doc, WHITE);
  doc.text(title, PW - ML, 11, { align: 'right' });

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(subtitle, PW - ML, 19, { align: 'right' });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number) {
  const fy = PH - 7;
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, fy - 3.5, PW - ML, fy - 3.5);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(7.5);
  setColor(doc, GRAY_MID);
  doc.text('Benefits Compliance Solutions', ML, fy);
  doc.setFont('Outfit', 'normal');
  doc.text(`Page ${pageNum}`, PW / 2, fy, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW - ML, fy, { align: 'right' });
}

// ─── Bar row ──────────────────────────────────────────────────────────────────
function drawBarRow(
  doc: jsPDF, y: number,
  label: string, subLabel: string,
  value: number, pct: number, maxVal: number
) {
  const col1W = 70.6;
  const col2X = ML + col1W + 2.8;
  const col2W = 77.6;
  const col3X = col2X + col2W + 2.8;
  const rowH = 14;  // slightly taller for breathing room

  // Label — Outfit-Bold 10pt gray-dark (BOLD per approved design)
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(10);
  setColor(doc, GRAY_DARK);
  doc.text(label, ML, y + 8);

  // Sub-label — Outfit 8pt gray-mid
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text(subLabel, ML, y + 12.5);

  // Bar background
  const barH = 2.5;
  const barY = y + 6.5;
  const barMaxW = col2W - 5.6;
  doc.setFillColor(0xE5, 0xE7, 0xEB);
  doc.roundedRect(col2X, barY, barMaxW, barH, 1, 1, 'F');

  // Bar fill — NAVY
  const fillW = Math.max(2.8, barMaxW * (value / maxVal));
  setFill(doc, NAVY);
  doc.roundedRect(col2X, barY, fillW, barH, 1, 1, 'F');

  // Value — Outfit-Bold 10pt gray-dark
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(10);
  setColor(doc, GRAY_DARK);
  doc.text(fmt(value), col3X + 39.5, y + 8, { align: 'right' });

  // Pct — Outfit 8.5pt gray-mid
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, GRAY_MID);
  doc.text(`${pct.toFixed(1)}%`, col3X + 39.5, y + 12.5, { align: 'right' });

  // Bottom divider
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y + rowH, ML + CW, y + rowH);

  return rowH;
}

// ─── Accent bullet ────────────────────────────────────────────────────────────
function drawAccentBullet(doc: jsPDF, y: number, text: string): number {
  // Teal accent bar: 3pt wide × 16pt tall
  setFill(doc, TEAL);
  doc.rect(ML, y + 0.5, 1.1, 6, 'F');

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(10);  // larger for readability per approved design
  setColor(doc, GRAY_DARK);
  const lines = doc.splitTextToSize(text, CW - 5.5);
  let ly = y + 5.5;
  lines.forEach((line: string) => {
    doc.text(line, ML + 3.8, ly);
    ly += 5.5;
  });

  return Math.max(8.5, lines.length * 5.5 + 1.5);
}

// ─── Rounded colored card ─────────────────────────────────────────────────────
function drawCard(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  bg: [number, number, number],
  border?: [number, number, number],
  radius = 1.4
) {
  setFill(doc, bg);
  if (border) {
    setStroke(doc, border);
    doc.setLineWidth(0.53);
    doc.roundedRect(x, y, w, h, radius, radius, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, radius, radius, 'F');
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF({ unit: 'mm', format: [PW, PH] });
  registerFonts(doc);

  const agencyLabel = inputs.agencyName || inputs.leadData?.company || 'Your Agency';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const reductionPct = 70;
  const costWithBCS = Math.round(costs.totalOperationalCost * (1 - reductionPct / 100));
  const operationalSavings = Math.round(costs.totalOperationalCost * 0.7);
  const totalClients = inputs.totalClients || 0;
  const monthlyHours = Math.round(costs.staffTimeCost / (inputs.averageHourlyRate * 12));
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;
  const maxCostVal = Math.max(costs.clientChurnCost, costs.opportunityCost, costs.staffTimeCost, costs.productivityCost);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COMPLIANCE COST ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  drawHeader1(doc, agencyLabel, dateStr);
  let y = 44;

  // ── EXECUTIVE SUMMARY ─────────────────────────────────────────────────────
  drawSectionHeading(doc, 'EXECUTIVE SUMMARY', y);
  y += 2 + 5;  // rule + spacer

  // Hero card — NAVY bg, all text WHITE and BOLD (high contrast per approved design)
  // Approved design: title ~13pt bold white, number ~36pt bold white, subtitle ~11pt bold white
  const heroH = 46;
  drawCard(doc, ML, y, CW, heroH, NAVY, undefined, 2.1);

  // Title — Outfit-Bold 13pt WHITE (high contrast, clearly readable)
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(13);
  setColor(doc, WHITE);
  doc.text("Your Agency's Total Compliance Cost", PW / 2, y + 11, { align: 'center' });

  // Big number — Outfit-Bold 36pt WHITE
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(36);
  setColor(doc, WHITE);
  doc.text(fmt(costs.totalOperationalCost), PW / 2, y + 28, { align: 'center' });

  // Subtitle — Outfit-Bold 11pt WHITE (bold for contrast per approved design)
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(11);
  setColor(doc, WHITE);
  doc.text('Annual operational impact \u2014 labor, lost deals, and client churn', PW / 2, y + 40, { align: 'center' });

  y += heroH + 8;

  // ── Cost Breakdown ────────────────────────────────────────────────────────
  y += 4;
  drawSectionHeading(doc, 'Cost Breakdown', y);
  y += 2 + 4;

  // Column headers
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(8.5);
  setColor(doc, GRAY_MID);
  doc.text('Category', ML, y);
  doc.text('Proportion', ML + 70.6 + 2.8 + 10, y);
  doc.text('Annual Cost', ML + CW, y, { align: 'right' });
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y + 2.5, ML + CW, y + 2.5);
  y += 2.5 + 2;

  const costRows = [
    {
      label: 'Client Churn (Lost Revenue)',
      sub: costs.clientChurnLTVTotal
        ? `6-Year Lifetime Value: ${fmt(costs.clientChurnLTVTotal)}`
        : '6-Year Lifetime Value impact included',
      value: costs.clientChurnCost,
      pct: (costs.clientChurnCost / costs.totalOperationalCost) * 100,
    },
    {
      label: 'Missed Large Client Opportunities',
      sub: costs.lifetimeValueGrowth
        ? `6-Year Lifetime Value: ${fmt(costs.lifetimeValueGrowth)}`
        : '6-Year Lifetime Value impact included',
      value: costs.opportunityCost,
      pct: (costs.opportunityCost / costs.totalOperationalCost) * 100,
    },
    {
      label: 'Staff Time on Compliance Issues',
      sub: 'Based on hours \u00d7 hourly rate',
      value: costs.staffTimeCost,
      pct: (costs.staffTimeCost / costs.totalOperationalCost) * 100,
    },
    {
      label: 'Lost Productivity',
      sub: 'Staff distracted by compliance concerns',
      value: costs.productivityCost,
      pct: (costs.productivityCost / costs.totalOperationalCost) * 100,
    },
  ];

  costRows.forEach((row) => {
    const rh = drawBarRow(doc, y, row.label, row.sub, row.value, row.pct, maxCostVal);
    y += rh + 3;
  });

  y += 3;

  // ── KEY INSIGHTS ──────────────────────────────────────────────────────────
  y += 4;
  drawSectionHeading(doc, 'KEY INSIGHTS', y);
  y += 2 + 3;

  const insights = [
    `Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `Lost opportunities and client churn cost ${fmt(revenueImpact)} annually`,
    'Compliance limitations prevent pursuit of larger, more profitable clients',
    'Current approach creates ongoing drain on resources and growth potential',
  ];

  insights.forEach((ins) => {
    const bh = drawAccentBullet(doc, y, ins);
    y += bh + 1.5;
  });

  drawFooter(doc, 1);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ROI ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');
  y = 30;

  // ── Liability Exposure ────────────────────────────────────────────────────
  y += 5;
  drawSectionHeading(doc, 'Liability Exposure', y);
  y += 2 + 3;

  // Liability hero card — NAVY_LIGHT bg, NAVY border, BOLD text (high contrast)
  // Approved: title bold navy ~12pt, number bold navy ~32pt, subtitle bold navy ~11pt
  const liabH = 40;
  drawCard(doc, ML, y, CW, liabH, NAVY_LIGHT, NAVY, 2.1);

  // Title — Outfit-Bold 12pt NAVY (bold, high contrast on lavender bg)
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(12);
  setColor(doc, NAVY);
  doc.text('Potential penalties for your entire book of business', PW / 2, y + 10, { align: 'center' });

  // Big number — Outfit-Bold 32pt NAVY
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(32);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalLiabilityExposure), PW / 2, y + 26, { align: 'center' });

  // Subtitle — Outfit-Bold 11pt NAVY
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(11);
  setColor(doc, NAVY);
  doc.text(
    `Based on ${totalClients} employer clients at average penalty exposure`,
    PW / 2, y + 36, { align: 'center' }
  );

  y += liabH + 4;

  // Risk note box — GRAY_LIGHT bg, RULE_COLOR border, 10pt text
  const riskText = `Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry data shows average penalties of $70K\u2013$150K for smaller employers and $350K+ for larger employers.`;
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(10);
  const riskLines = doc.splitTextToSize(riskText, CW - 10);
  const riskBoxH = riskLines.length * 5.5 + 8;
  drawCard(doc, ML, y, CW, riskBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);
  setColor(doc, GRAY_DARK);
  let ry = y + 6;
  riskLines.forEach((line: string) => { doc.text(line, ML + 5, ry); ry += 5.5; });
  y += riskBoxH + 5;

  // ── Partnership Comparison ────────────────────────────────────────────────
  y += 4;
  drawSectionHeading(doc, 'Partnership Comparison', y);
  y += 2 + 3;

  // Two cards: full content width, 50/50 split with gap (per approved design)
  const compGap = 5;
  const compCardW = (CW - compGap) / 2;
  const compCardH = 32;

  // Card 1 — WITHOUT BCS
  drawCard(doc, ML, y, compCardW, compCardH, NAVY_LIGHT, NAVY, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('WITHOUT BCS \u2014 Annual Operational Costs', ML + compCardW / 2, y + 7, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(26);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalOperationalCost), ML + compCardW / 2, y + 21, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('Draining your agency', ML + compCardW / 2, y + 28, { align: 'center' });

  // Card 2 — WITH BCS
  const compX2 = ML + compCardW + compGap;
  drawCard(doc, compX2, y, compCardW, compCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('WITH BCS \u2014 Reduced Annual Costs', compX2 + compCardW / 2, y + 7, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(26);
  setColor(doc, TEAL);
  doc.text(fmt(costWithBCS), compX2 + compCardW / 2, y + 21, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text(`${reductionPct}% Reduction`, compX2 + compCardW / 2, y + 28, { align: 'center' });

  y += compCardH + 5;

  // ── INVESTMENT SUMMARY ────────────────────────────────────────────────────
  y += 4;
  drawSectionHeading(doc, 'INVESTMENT SUMMARY', y);
  y += 2 + 3;

  // Three equal cards
  const invGap = 4;
  const invCardW = (CW - invGap * 2) / 3;
  const invCardH = 40;

  // Card 1 — WITHOUT BCS
  drawCard(doc, ML, y, invCardW, invCardH, NAVY_LIGHT, NAVY, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('WITHOUT BCS', ML + invCardW / 2, y + 8, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalOperationalCost), ML + invCardW / 2, y + 24, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('Annual operational costs', ML + invCardW / 2, y + 34, { align: 'center' });

  // Card 2 — Operational Cost Savings
  const invX2 = ML + invCardW + invGap;
  drawCard(doc, invX2, y, invCardW, invCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('Operational Cost Savings', invX2 + invCardW / 2, y + 8, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, TEAL);
  doc.text(fmt(operationalSavings), invX2 + invCardW / 2, y + 24, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('What you save annually', invX2 + invCardW / 2, y + 34, { align: 'center' });

  // Card 3 — Potential New Revenue
  const invX3 = invX2 + invCardW + invGap;
  drawCard(doc, invX3, y, invCardW, invCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('Potential New Revenue', invX3 + invCardW / 2, y + 8, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, TEAL);
  doc.text(fmt(costs.revenueGrowth), invX3 + invCardW / 2, y + 24, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('From winning new clients', invX3 + invCardW / 2, y + 34, { align: 'center' });

  y += invCardH;

  drawFooter(doc, 2);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — BENEFITS + CTA
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');
  y = 30;

  // ── Disclaimer at TOP of page 3 (per approved design) ────────────────────
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(10);
  setColor(doc, GRAY_MID);
  const disclaimerText = 'These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, CW);
  disclaimerLines.forEach((line: string) => { doc.text(line, ML, y); y += 5.5; });
  y += 5;

  // ── BENEFITS OF BCS PARTNERSHIP ───────────────────────────────────────────
  drawSectionHeading(doc, 'BENEFITS OF BCS PARTNERSHIP', y);
  y += 2 + 4;

  const benefits = [
    'Scalable compliance processes installed and maintained',
    'Expert support available when compliance issues arise',
    'Confidence to pursue and retain 6-figure clients',
    'Reduced client churn through compliance excellence',
    'Team freed to focus on growth and client service',
    'Proactive compliance strategy vs. reactive firefighting',
  ];

  benefits.forEach((b) => {
    const bh = drawAccentBullet(doc, y, b);
    y += bh + 1;
  });

  y += 4;

  // ── LTV Methodology note ──────────────────────────────────────────────────
  const ltvText = `Lifetime Value Methodology: LTV calculations based on industry retention rates from ${LTV_CITATIONS.PRIMARY.source} (${LTV_CITATIONS.PRIMARY.year}): Industry average ${LTV_CITATIONS.PRIMARY.stats.industryAverage} retention, top performers ${LTV_CITATIONS.PRIMARY.stats.topPerformers}. At ${(RETENTION_RATES.INDUSTRY_AVERAGE * 100).toFixed(0)}% retention, clients have a 4.06x lifetime value multiplier over 6 years. At ${(RETENTION_RATES.TOP_PERFORMER * 100).toFixed(0)}% retention (achievable with BCS partnership), the multiplier increases to 5.04x \u2014 a 24% improvement in client lifetime value.`;
  const retentionNote = 'Improving compliance capabilities is one of the most effective ways to improve retention rates. Strong compliance programs improve client perception of your value and capability, and defend against competing brokers who attempt to use compliance as a wedge against your accounts.';

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  const ltvLines = doc.splitTextToSize(ltvText, CW - 10);
  const retLines = doc.splitTextToSize(retentionNote, CW - 10);
  const ltvBoxH = (ltvLines.length + retLines.length) * 5 + 12;
  drawCard(doc, ML, y, CW, ltvBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);

  setColor(doc, GRAY_MID);
  let ly = y + 6;
  ltvLines.forEach((line: string) => { doc.text(line, ML + 5, ly); ly += 5; });
  ly += 3;
  setColor(doc, TEAL);
  retLines.forEach((line: string) => { doc.text(line, ML + 5, ly); ly += 5; });

  y += ltvBoxH + 8;

  // ── CTA card ──────────────────────────────────────────────────────────────
  // Approved: tall card, large bold title (~16pt), body text ~11pt, URL bold teal ~11pt
  const ctaTitle = 'Ready to transform your compliance burden into a competitive advantage?';
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(16);
  const ctaLines = doc.splitTextToSize(ctaTitle, CW - 20);
  const ctaH = ctaLines.length * 8 + 36;
  drawCard(doc, ML, y, CW, ctaH, NAVY, undefined, 2.1);

  setColor(doc, WHITE);
  let cy = y + 10;
  ctaLines.forEach((line: string) => { doc.text(line, PW / 2, cy, { align: 'center' }); cy += 8; });

  cy += 6;
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(11);
  setColor(doc, WHITE);
  doc.text('Schedule your consultation:', PW / 2, cy, { align: 'center' });

  cy += 8;
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0xA8, 0xF0, 0xED);
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW / 2, cy, { align: 'center' });

  y += ctaH + 10;

  // ── Contact block ─────────────────────────────────────────────────────────
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y, ML + CW, y);
  y += 5;

  const colW = CW / 3;
  const col1 = ML + colW / 2;
  const col2 = ML + colW + colW / 2;
  const col3 = ML + colW * 2 + colW / 2;

  doc.setFont('Outfit', 'bold');
  doc.setFontSize(8.5);
  setColor(doc, NAVY);
  doc.text('WEBSITE', col1, y, { align: 'center' });
  doc.text('EMAIL', col2, y, { align: 'center' });
  doc.text('SCHEDULE', col3, y, { align: 'center' });

  y += 5.5;
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  doc.text('benefitscompliancesolutions.com', col1, y, { align: 'center' });
  doc.text('info@benefitscompliancesolutions.com', col2, y, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions', col3, y, { align: 'center' });

  y += 8;

  // ── Confidentiality notice — 9pt (readable per approved design) ───────────
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_MID);
  const confText = 'This report is confidential and prepared exclusively for the named recipient. All calculations are estimates based on industry benchmarks and the data provided. \u00a9 2026 Benefits Compliance Solutions. All rights reserved.';
  const confLines = doc.splitTextToSize(confText, CW);
  confLines.forEach((line: string) => { doc.text(line, PW / 2, y, { align: 'center' }); y += 5; });

  drawFooter(doc, 3);

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
