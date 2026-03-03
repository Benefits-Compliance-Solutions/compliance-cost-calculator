/**
 * BCS Compliance Cost Report — PDF Generator
 *
 * This is a faithful TypeScript/jsPDF port of the approved Python/ReportLab prototype
 * (generate_bcs_report.py). All brand values, font sizes, spacing, and layout decisions
 * are taken directly from that script.
 *
 * Key design decisions (from prototype):
 * - Outfit font family (Regular, SemiBold, Bold) — matches web app
 * - BCS navy: #3D3A8E  |  BCS teal: #4AADA8
 * - Page 1 header height: 88pt (~31mm)  |  Pages 2-3 header height: 72pt (~25mm)
 * - Page 1 header shows "Prepared for" + date; pages 2-3 do NOT
 * - Section rules are thin gray (#D1D5DB), NOT teal
 * - Hero card: NAVY bg, Outfit-Bold 26pt white number
 * - Accent bullets: 3×16pt teal rect, NOT wide bars
 * - No "Confidential Report" subtitle in header
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

// ─── Brand palette (exact values from prototype) ──────────────────────────────
// NAVY       = #3D3A8E
// TEAL       = #4AADA8
// NAVY_LIGHT = #EEEDF8
// TEAL_LIGHT = #E8F6F5
// GRAY_DARK  = #3D3D3D
// GRAY_MID   = #6B7280
// GRAY_LIGHT = #F3F4F6
// RULE_COLOR = #D1D5DB
// WHITE      = #FFFFFF

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const NAVY       = hexToRgb('#3D3A8E');
const TEAL       = hexToRgb('#4AADA8');
const NAVY_LIGHT = hexToRgb('#EEEDF8');
const TEAL_LIGHT = hexToRgb('#E8F6F5');
const GRAY_DARK  = hexToRgb('#3D3D3D');
const GRAY_MID   = hexToRgb('#6B7280');
const GRAY_LIGHT = hexToRgb('#F3F4F6');
const RULE_COLOR = hexToRgb('#D1D5DB');
const WHITE      = hexToRgb('#FFFFFF');
const HEADER_MUTED = hexToRgb('#C7C5E8');  // "Prepared for" text in header
const HEADER_DIM   = hexToRgb('#A8A5D8');  // date text in header

// ─── Page geometry (from prototype, converted pt→mm: 1pt = 0.3528mm) ─────────
// letter = 612×792pt = 215.9×279.4mm
// MARGIN_H = 40pt = 14.1mm  → use 14mm
// Header p1 = 88pt = 31mm
// Header p2 = 72pt = 25.4mm → use 25mm
// Teal accent bar = 4pt = 1.4mm → use 1.5mm
// Footer y = 20pt = 7mm from bottom

const PW = 215.9;  // letter width in mm
const PH = 279.4;  // letter height in mm
const ML = 14;     // left/right margin mm
const CW = PW - ML * 2;  // content width = 187.9mm

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

// Thin gray section rule (matches SectionRule flowable in prototype)
function drawSectionRule(doc: jsPDF, y: number) {
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);  // 0.5pt
  doc.line(ML, y, ML + CW, y);
}

// Section heading: Outfit-Bold 13pt navy, then thin gray rule
function drawSectionHeading(doc: jsPDF, label: string, y: number): number {
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(13);
  setColor(doc, NAVY);
  doc.text(label, ML, y);
  drawSectionRule(doc, y + 1.5);
  return y + 1.5;  // returns y of rule
}

// ─── Register Outfit fonts ────────────────────────────────────────────────────
function registerFonts(doc: jsPDF) {
  // jsPDF addFileToVFS + addFont pattern for custom TTF fonts
  doc.addFileToVFS('Outfit-Regular.ttf', Outfit_Regular_BASE64);
  doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');

  doc.addFileToVFS('Outfit-Bold.ttf', Outfit_Bold_BASE64);
  doc.addFont('Outfit-Bold.ttf', 'Outfit', 'bold');

  doc.addFileToVFS('Outfit-SemiBold.ttf', Outfit_SemiBold_BASE64);
  doc.addFont('Outfit-SemiBold.ttf', 'OutfitSemiBold', 'normal');
}

// ─── Page 1 header (88pt = 31mm tall) ────────────────────────────────────────
// Logo left, title + prepared-for + date right
function drawHeader1(doc: jsPDF, agencyName: string, dateStr: string) {
  const hH = 31;  // 88pt in mm

  // Navy background
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');

  // Teal accent bar below header
  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  // BCS logo — left side (52pt tall = 18.3mm, aspect ~3:1 so ~55mm wide)
  const logoH = 18.3;
  const logoW = logoH * (1588 / 560);  // actual aspect ratio of the PNG
  const logoX = ML;
  const logoY = (hH - logoH) / 2;
  try {
    doc.addImage(BCS_WHITE_LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH);
  } catch (_) { /* skip */ }

  // Report title — Outfit-Bold 18pt white
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(18);
  setColor(doc, WHITE);
  doc.text('COMPLIANCE COST ANALYSIS', PW - ML, 11, { align: 'right' });

  // "Prepared for" — Outfit 9pt muted lavender
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(`Prepared for: ${agencyName}`, PW - ML, 19, { align: 'right' });

  // Date — Outfit 8.5pt dimmer lavender
  doc.setFontSize(8.5);
  setColor(doc, HEADER_DIM);
  doc.text(`Report Generated: ${dateStr}`, PW - ML, 25.5, { align: 'right' });
}

// ─── Pages 2-3 header (72pt = 25.4mm tall) ───────────────────────────────────
// Logo left, section title + subtitle right — NO prepared-for/date
function drawHeader2(doc: jsPDF, title: string, subtitle: string) {
  const hH = 25.4;  // 72pt in mm

  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');

  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  // Logo — 40pt tall = 14.1mm
  const logoH = 14.1;
  const logoW = logoH * (1588 / 560);
  const logoX = ML;
  const logoY = (hH - logoH) / 2;
  try {
    doc.addImage(BCS_WHITE_LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH);
  } catch (_) { /* skip */ }

  // Section title — Outfit-Bold 16pt white
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(16);
  setColor(doc, WHITE);
  doc.text(title, PW - ML, 11, { align: 'right' });

  // Subtitle — Outfit 9pt muted lavender
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(subtitle, PW - ML, 19, { align: 'right' });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number) {
  const fy = PH - 7;  // 20pt from bottom

  // Top rule
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

// ─── Bar row (matches BarRow flowable in prototype) ───────────────────────────
// col widths: 200pt=70.6mm | 220pt=77.6mm | 112pt=39.5mm  (total 532pt=187.7mm)
function drawBarRow(
  doc: jsPDF,
  y: number,
  label: string,
  subLabel: string,
  value: number,
  pct: number,
  maxVal: number
) {
  const col1W = 70.6;  // label column
  const col2X = ML + col1W + 2.8;  // bar column start (8pt gap)
  const col2W = 77.6;  // bar column
  const col3X = col2X + col2W + 2.8;  // value column

  // Row height = 36pt = 12.7mm
  const rowH = 12.7;

  // Label — Outfit 9pt gray-dark
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_DARK);
  doc.text(label, ML, y + 7.8);

  // Sub-label — Outfit 7.5pt gray-mid
  doc.setFontSize(7.5);
  setColor(doc, GRAY_MID);
  doc.text(subLabel, ML, y + 11.8);

  // Bar background — #E5E7EB, 7pt=2.5mm tall
  const barH = 2.5;
  const barY = y + 6.3;
  const barMaxW = col2W - 5.6;
  doc.setFillColor(0xE5, 0xE7, 0xEB);
  doc.roundedRect(col2X, barY, barMaxW, barH, 1, 1, 'F');

  // Bar fill — NAVY
  const fillW = Math.max(2.8, barMaxW * (value / maxVal));
  setFill(doc, NAVY);
  doc.roundedRect(col2X, barY, fillW, barH, 1, 1, 'F');

  // Value — Outfit-Bold 9pt gray-dark
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(9);
  setColor(doc, GRAY_DARK);
  doc.text(fmt(value), col3X + 39.5, y + 7.8, { align: 'right' });

  // Pct — Outfit 8pt gray-mid
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text(`${pct.toFixed(1)}%`, col3X + 39.5, y + 11.8, { align: 'right' });

  // Bottom divider (0.5pt = 0.18mm)
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y + rowH, ML + CW, y + rowH);

  return rowH;
}

// ─── Accent bullet (matches AccentBullet flowable in prototype) ───────────────
// 3pt wide × 16pt tall teal rect, text at x+10pt
function drawAccentBullet(doc: jsPDF, y: number, text: string): number {
  // 3pt=1.06mm wide, 16pt=5.6mm tall
  setFill(doc, TEAL);
  doc.rect(ML, y + 0.7, 1.06, 5.6, 'F');

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_DARK);
  const lines = doc.splitTextToSize(text, CW - 5);
  let ly = y + 4.9;
  lines.forEach((line: string) => {
    doc.text(line, ML + 3.5, ly);
    ly += 4.9;
  });

  // Row height = 22pt = 7.76mm
  return Math.max(7.76, lines.length * 4.9 + 1);
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
    doc.setLineWidth(0.53);  // 1.5pt
    doc.roundedRect(x, y, w, h, radius, radius, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, radius, radius, 'F');
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF({ unit: 'mm', format: [PW, PH] });

  // Register Outfit fonts
  registerFonts(doc);

  const agencyLabel = inputs.agencyName || inputs.leadData?.company || 'Your Agency';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Derived values
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

  // Content starts after header (31mm) + teal bar (1.5mm) + 2.8mm breathing room
  let y = 35.3;

  // ── EXECUTIVE SUMMARY ────────────────────────────────────────────────────
  // s_h2: space_before=16pt=5.6mm, space_after=4pt=1.4mm
  y += 5.6;
  drawSectionHeading(doc, 'EXECUTIVE SUMMARY', y);
  y += 1.5 + 4.2;  // rule + 12pt spacer

  // ── Hero card ─────────────────────────────────────────────────────────────
  // Inner table: 3 rows, CONTENT_W - 32pt padding = CW - 11.3mm
  const heroInnerW = CW - 11.3;
  const heroH = 32;  // approximate: 3 rows × ~10mm each with padding
  const heroX = ML + (CW - heroInnerW) / 2;

  drawCard(doc, heroX, y, heroInnerW, heroH, NAVY, undefined, 2.1);

  // Row 1: "Your Agency's Total Compliance Cost" — s_center_muted (8pt gray-mid, centered)
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text("Your Agency's Total Compliance Cost", PW / 2, y + 7, { align: 'center' });

  // Row 2: big number — Outfit-Bold 26pt white
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(26);
  setColor(doc, WHITE);
  doc.text(fmt(costs.totalOperationalCost), PW / 2, y + 20, { align: 'center' });

  // Row 3: subtitle — s_center_muted 8pt gray-mid
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Annual operational impact \u2014 labor, lost deals, and client churn', PW / 2, y + 29, { align: 'center' });

  y += heroH + 7;  // 20pt spacer

  // ── Cost Breakdown ────────────────────────────────────────────────────────
  y += 5.6;  // s_h2 space_before
  drawSectionHeading(doc, 'Cost Breakdown', y);
  y += 1.5 + 3.5;  // rule + 10pt spacer

  // Column headers — s_label: Outfit-SemiBold 7.5pt gray-mid
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(7.5);
  setColor(doc, GRAY_MID);
  doc.text('Category', ML, y);
  doc.text('Proportion', ML + 70.6 + 2.8 + 10, y);
  doc.text('Annual Cost', ML + CW, y, { align: 'right' });

  // Header bottom rule
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y + 2.1, ML + CW, y + 2.1);
  y += 2.1 + 1.4;  // rule + 4pt spacer

  // Bar rows
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
    y += rh + 2.8;  // 8pt spacer
  });

  y += 2.8;  // extra 8pt after rows

  // ── KEY INSIGHTS ──────────────────────────────────────────────────────────
  y += 5.6;
  drawSectionHeading(doc, 'KEY INSIGHTS', y);
  y += 1.5 + 2.8;  // rule + 8pt spacer

  const insights = [
    `Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `Lost opportunities and client churn cost ${fmt(revenueImpact)} annually`,
    'Compliance limitations prevent pursuit of larger, more profitable clients',
    'Current approach creates ongoing drain on resources and growth potential',
  ];

  insights.forEach((ins) => {
    const bh = drawAccentBullet(doc, y, ins);
    y += bh + 1.06;  // 3pt spacer
  });

  drawFooter(doc, 1);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ROI ANALYSIS (Liability + Partnership Comparison + Investment Summary)
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');

  // Content starts after header (25.4mm) + teal bar (1.5mm) + 1.4mm
  y = 29.7;

  // ── Liability Exposure ────────────────────────────────────────────────────
  y += 5.6;
  drawSectionHeading(doc, 'Liability Exposure', y);
  y += 1.5 + 2.1;  // rule + 6pt spacer

  // Liability card — NAVY_LIGHT bg, NAVY border, rounded 6pt=2.1mm
  const liabH = 28;
  const liabInnerW = CW - 11.3;
  const liabX = ML + (CW - liabInnerW) / 2;
  drawCard(doc, liabX, y, liabInnerW, liabH, NAVY_LIGHT, NAVY, 2.1);

  // Row 1: muted label
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Potential penalties for your entire book of business', PW / 2, y + 6, { align: 'center' });

  // Row 2: big number — s_big_num: Outfit-Bold 32pt NAVY
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(32);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalLiabilityExposure), PW / 2, y + 19, { align: 'center' });

  // Row 3: sub-label
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text(
    `Based on ${totalClients} employer clients at average penalty exposure`,
    PW / 2, y + 26, { align: 'center' }
  );

  y += liabH + 1.4;  // 4pt spacer

  // Risk note box — GRAY_LIGHT bg, RULE_COLOR border
  const riskText = `Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry average risk for non-compliance within smaller employers is $70K\u2013$150K, and $350K+ for larger employers.`;
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  const riskLines = doc.splitTextToSize(riskText, CW - 8.5);
  const riskBoxH = riskLines.length * 4.2 + 5.6;
  drawCard(doc, ML, y, CW, riskBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);
  setColor(doc, GRAY_MID);
  let ry = y + 4.2;
  riskLines.forEach((line: string) => { doc.text(line, ML + 4.2, ry); ry += 4.2; });
  y += riskBoxH + 2.8;  // 8pt spacer

  // ── Partnership Comparison ────────────────────────────────────────────────
  y += 5.6;
  drawSectionHeading(doc, 'Partnership Comparison', y);
  y += 1.5 + 1.4;  // rule + 4pt spacer

  // Two cards side by side, each 160pt=56.4mm wide, 16pt=5.6mm gap
  const compCardW = 56.4;
  const compCardH = 28;
  const compGap = 5.6;
  const compTotalW = compCardW * 2 + compGap;
  const compX1 = ML + (CW - compTotalW) / 2;
  const compX2 = compX1 + compCardW + compGap;

  // Comparison card 1 — WITHOUT BCS
  drawCard(doc, compX1, y, compCardW, compCardH, NAVY_LIGHT, NAVY, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(7);
  setColor(doc, GRAY_MID);
  doc.text('WITHOUT BCS \u2014 Annual Operational Costs', compX1 + compCardW / 2, y + 6, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(24);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalOperationalCost), compX1 + compCardW / 2, y + 18, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Draining your agency', compX1 + compCardW / 2, y + 25, { align: 'center' });

  // Comparison card 2 — WITH BCS
  drawCard(doc, compX2, y, compCardW, compCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(7);
  setColor(doc, GRAY_MID);
  doc.text('WITH BCS \u2014 Reduced Annual Costs', compX2 + compCardW / 2, y + 6, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(24);
  setColor(doc, TEAL);
  doc.text(fmt(costWithBCS), compX2 + compCardW / 2, y + 18, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text(`${reductionPct}% Reduction`, compX2 + compCardW / 2, y + 25, { align: 'center' });

  y += compCardH + 2.1;  // 6pt spacer

  // ── INVESTMENT SUMMARY ────────────────────────────────────────────────────
  y += 5.6;
  drawSectionHeading(doc, 'INVESTMENT SUMMARY', y);
  y += 1.5 + 2.1;  // rule + 6pt spacer

  // Three equal cards: (CW - 24pt) / 3 = (CW - 8.5mm) / 3 each, 12pt=4.2mm gaps
  const invCardW = (CW - 8.5) / 3;
  const invCardH = 36;
  const invGap = 4.2;
  const invX1 = ML;
  const invX2 = invX1 + invCardW + invGap;
  const invX3 = invX2 + invCardW + invGap;

  // Card 1 — WITHOUT BCS
  drawCard(doc, invX1, y, invCardW, invCardH, NAVY_LIGHT, NAVY, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('WITHOUT BCS', invX1 + invCardW / 2, y + 6, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, NAVY);
  doc.text(fmt(costs.totalOperationalCost), invX1 + invCardW / 2, y + 22, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Annual operational costs', invX1 + invCardW / 2, y + 31, { align: 'center' });

  // Card 2 — Operational Cost Savings
  drawCard(doc, invX2, y, invCardW, invCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Operational Cost Savings', invX2 + invCardW / 2, y + 6, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, TEAL);
  doc.text(fmt(operationalSavings), invX2 + invCardW / 2, y + 22, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('What you save annually', invX2 + invCardW / 2, y + 31, { align: 'center' });

  // Card 3 — Potential New Revenue
  drawCard(doc, invX3, y, invCardW, invCardH, TEAL_LIGHT, TEAL, 1.4);
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('Potential New Revenue', invX3 + invCardW / 2, y + 6, { align: 'center' });
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(22);
  setColor(doc, TEAL);
  doc.text(fmt(costs.revenueGrowth), invX3 + invCardW / 2, y + 22, { align: 'center' });
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('From winning new clients', invX3 + invCardW / 2, y + 31, { align: 'center' });

  y += invCardH + 4.2;  // increased spacer to prevent overlap

  // Disclaimer — italic 8pt gray-mid (updated copy)
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  const disclaimerText = 'These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, CW);
  disclaimerLines.forEach((line: string) => { doc.text(line, ML, y); y += 4.2; });
  y += 2.1;  // 6pt spacer

  // ── PAGE BREAK before Benefits (matches prototype page 2→3 break) ─────────
  doc.addPage();
  drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');
  y = 29.7;

  // ── BENEFITS OF BCS PARTNERSHIP ───────────────────────────────────────────
  y += 5.6;
  drawSectionHeading(doc, 'BENEFITS OF BCS PARTNERSHIP', y);
  y += 1.5 + 1.4;  // rule + 4pt spacer

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
    y += bh + 0.7;  // 2pt spacer
  });

  y += 2.1;  // 6pt spacer

  // ── LTV Methodology note ──────────────────────────────────────────────────
  const ltvText = `Lifetime Value Methodology: LTV calculations based on industry retention rates from ${LTV_CITATIONS.PRIMARY.source} (${LTV_CITATIONS.PRIMARY.year}): Industry average ${LTV_CITATIONS.PRIMARY.stats.industryAverage} retention, top performers ${LTV_CITATIONS.PRIMARY.stats.topPerformers}. At ${(RETENTION_RATES.INDUSTRY_AVERAGE * 100).toFixed(0)}% retention, clients have a 4.06x lifetime value multiplier over 6 years. At ${(RETENTION_RATES.TOP_PERFORMER * 100).toFixed(0)}% retention (achievable with BCS partnership), the multiplier increases to 5.04x \u2014 a 24% improvement in client lifetime value.`;
  const retentionNote = 'Improving compliance capabilities is one of the most effective ways to improve retention rates. Strong compliance programs improve client perception of your value and capability, and defend against competing brokers who attempt to use compliance as a wedge against your accounts.';

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  const ltvLines = doc.splitTextToSize(ltvText, CW - 8.5);
  const retLines = doc.splitTextToSize(retentionNote, CW - 8.5);
  const ltvBoxH = (ltvLines.length + retLines.length) * 4.2 + 7;
  drawCard(doc, ML, y, CW, ltvBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);

  setColor(doc, GRAY_MID);
  let ly = y + 4.2;
  ltvLines.forEach((line: string) => { doc.text(line, ML + 4.2, ly); ly += 4.2; });
  ly += 1.4;
  // Retention note in italic teal
  setColor(doc, TEAL);
  retLines.forEach((line: string) => { doc.text(line, ML + 4.2, ly); ly += 4.2; });

  y += ltvBoxH + 7;  // 20pt spacer

  // ── CTA card ──────────────────────────────────────────────────────────────
  const ctaTitle = 'Ready to transform your compliance burden into a competitive advantage?';
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(13);
  const ctaLines = doc.splitTextToSize(ctaTitle, CW - 14.1);
  const ctaH = ctaLines.length * 6.3 + 19.7;
  drawCard(doc, ML, y, CW, ctaH, NAVY, undefined, 2.1);

  setColor(doc, WHITE);
  let cy = y + 5.6;
  ctaLines.forEach((line: string) => { doc.text(line, PW / 2, cy, { align: 'center' }); cy += 6.3; });

  cy += 2.1;
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  doc.text('Schedule your consultation:', PW / 2, cy, { align: 'center' });

  cy += 4.9;
  doc.setFont('OutfitSemiBold', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0xA8, 0xF0, 0xED);  // #A8F0ED
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW / 2, cy, { align: 'center' });

  y += ctaH + 8.5;  // 24pt spacer

  // ── Closing contact block ─────────────────────────────────────────────────
  // Top rule
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y, ML + CW, y);
  y += 3.5;

  const colW = CW / 3;
  const col1 = ML + colW / 2;
  const col2 = ML + colW + colW / 2;
  const col3 = ML + colW * 2 + colW / 2;

  // Labels — Outfit-Bold 7pt navy
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(7);
  setColor(doc, NAVY);
  doc.text('WEBSITE', col1, y, { align: 'center' });
  doc.text('EMAIL', col2, y, { align: 'center' });
  doc.text('SCHEDULE', col3, y, { align: 'center' });

  y += 4.2;
  // Values — Outfit 8pt gray-mid
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text('benefitscompliancesolutions.com', col1, y, { align: 'center' });
  doc.text('info@benefitscompliancesolutions.com', col2, y, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions', col3, y, { align: 'center' });

  y += 8.5;

  // Confidentiality notice — Outfit 6.5pt gray-mid centered
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(6.5);
  setColor(doc, GRAY_MID);
  const confText = 'This report is confidential and prepared exclusively for the named recipient. All calculations are estimates based on industry benchmarks and the data provided. \u00a9 2026 Benefits Compliance Solutions. All rights reserved.';
  const confLines = doc.splitTextToSize(confText, CW);
  confLines.forEach((line: string) => { doc.text(line, PW / 2, y, { align: 'center' }); y += 3.5; });

  drawFooter(doc, 3);

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
