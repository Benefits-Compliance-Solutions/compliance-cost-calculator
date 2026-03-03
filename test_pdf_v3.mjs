/**
 * Test script: replicates the new generatePDF.ts using jsPDF in Node.js
 * Produces test_output_v3.pdf for visual inspection
 */
import { jsPDF } from 'jspdf';
import { readFileSync } from 'fs';

// ─── Load assets ──────────────────────────────────────────────────────────────
const logoB64 = 'data:image/png;base64,' + readFileSync('/home/ubuntu/upload/Untitled25.png').toString('base64');
const outfitRegB64 = readFileSync('/home/ubuntu/pdf_assets/fonts/Outfit-Regular.ttf').toString('base64');
const outfitBoldB64 = readFileSync('/home/ubuntu/pdf_assets/fonts/Outfit-Bold.ttf').toString('base64');
const outfitSemiBoldB64 = readFileSync('/home/ubuntu/pdf_assets/fonts/Outfit-SemiBold.ttf').toString('base64');

// ─── Test data (matches prototype DATA dict) ──────────────────────────────────
const costs = {
  staffTimeCost: 21600,
  clientChurnCost: 100000,
  opportunityCost: 150000,
  productivityCost: 70200,
  totalOperationalCost: 341800,
  totalLiabilityExposure: 36400000,
  penaltyRisk: 36400000,
  revenueGrowth: 150000,
  lifetimeValueGrowth: 756450,
  totalCost: 341800,
  clientChurnLTVTotal: 405439,
};
const inputs = {
  agencyName: 'Tyler Borders',
  numberOfEmployees: 10,
  averageHourlyRate: 50,
  hoursPerComplianceIssue: 2,
  complianceIssuesPerMonth: 12,
  totalClients: 200,
  newClientsWonPerYear: 3,
  averageNewClientValue: 50000,
};

// ─── Brand palette ────────────────────────────────────────────────────────────
const NAVY       = [0x3D, 0x3A, 0x8E];
const TEAL       = [0x4A, 0xAD, 0xA8];
const NAVY_LIGHT = [0xEE, 0xED, 0xF8];
const TEAL_LIGHT = [0xE8, 0xF6, 0xF5];
const GRAY_DARK  = [0x3D, 0x3D, 0x3D];
const GRAY_MID   = [0x6B, 0x72, 0x80];
const GRAY_LIGHT = [0xF3, 0xF4, 0xF6];
const RULE_COLOR = [0xD1, 0xD5, 0xDB];
const WHITE      = [0xFF, 0xFF, 0xFF];
const HEADER_MUTED = [0xC7, 0xC5, 0xE8];
const HEADER_DIM   = [0xA8, 0xA5, 0xD8];

const PW = 215.9, PH = 279.4, ML = 14;
const CW = PW - ML * 2;

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
function setColor(doc, rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function setFill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setStroke(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

function drawSectionRule(doc, y) {
  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y, ML + CW, y);
}

function drawSectionHeading(doc, label, y) {
  doc.setFont('Outfit', 'bold');
  doc.setFontSize(13);
  setColor(doc, NAVY);
  doc.text(label, ML, y);
  drawSectionRule(doc, y + 1.5);
  return y + 1.5;
}

function drawCard(doc, x, y, w, h, bg, border, radius = 1.4) {
  setFill(doc, bg);
  if (border) {
    setStroke(doc, border);
    doc.setLineWidth(0.53);
    doc.roundedRect(x, y, w, h, radius, radius, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, radius, radius, 'F');
  }
}

function drawHeader1(doc, agencyName, dateStr) {
  const hH = 31;
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');
  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  const logoH = 18.3;
  const logoW = logoH * (1588 / 560);
  try { doc.addImage(logoB64, 'PNG', ML, (hH - logoH) / 2, logoW, logoH); } catch(_) {}

  doc.setFont('Outfit', 'bold');
  doc.setFontSize(18);
  setColor(doc, WHITE);
  doc.text('COMPLIANCE COST ANALYSIS', PW - ML, 11, { align: 'right' });

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(`Prepared for: ${agencyName}`, PW - ML, 19, { align: 'right' });

  doc.setFontSize(8.5);
  setColor(doc, HEADER_DIM);
  doc.text(`Report Generated: ${dateStr}`, PW - ML, 25.5, { align: 'right' });
}

function drawHeader2(doc, title, subtitle) {
  const hH = 25.4;
  setFill(doc, NAVY);
  doc.rect(0, 0, PW, hH, 'F');
  setFill(doc, TEAL);
  doc.rect(0, hH, PW, 1.5, 'F');

  const logoH = 14.1;
  const logoW = logoH * (1588 / 560);
  try { doc.addImage(logoB64, 'PNG', ML, (hH - logoH) / 2, logoW, logoH); } catch(_) {}

  doc.setFont('Outfit', 'bold');
  doc.setFontSize(16);
  setColor(doc, WHITE);
  doc.text(title, PW - ML, 11, { align: 'right' });

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, HEADER_MUTED);
  doc.text(subtitle, PW - ML, 19, { align: 'right' });
}

function drawFooter(doc, pageNum) {
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

function drawBarRow(doc, y, label, subLabel, value, pct, maxVal) {
  const col1W = 70.6;
  const col2X = ML + col1W + 2.8;
  const col2W = 77.6;
  const col3X = col2X + col2W + 2.8;
  const rowH = 12.7;

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(9);
  setColor(doc, GRAY_DARK);
  doc.text(label, ML, y + 7.8);

  doc.setFontSize(7.5);
  setColor(doc, GRAY_MID);
  doc.text(subLabel, ML, y + 11.8);

  const barH = 2.5;
  const barY = y + 6.3;
  const barMaxW = col2W - 5.6;
  doc.setFillColor(0xE5, 0xE7, 0xEB);
  doc.roundedRect(col2X, barY, barMaxW, barH, 1, 1, 'F');

  const fillW = Math.max(2.8, barMaxW * (value / maxVal));
  setFill(doc, NAVY);
  doc.roundedRect(col2X, barY, fillW, barH, 1, 1, 'F');

  doc.setFont('Outfit', 'bold');
  doc.setFontSize(9);
  setColor(doc, GRAY_DARK);
  doc.text(fmt(value), col3X + 39.5, y + 7.8, { align: 'right' });

  doc.setFont('Outfit', 'normal');
  doc.setFontSize(8);
  setColor(doc, GRAY_MID);
  doc.text(`${pct.toFixed(1)}%`, col3X + 39.5, y + 11.8, { align: 'right' });

  setStroke(doc, RULE_COLOR);
  doc.setLineWidth(0.18);
  doc.line(ML, y + rowH, ML + CW, y + rowH);

  return rowH;
}

function drawAccentBullet(doc, y, text) {
  doc.setFont('Outfit', 'normal');
  doc.setFontSize(10);
  setColor(doc, GRAY_DARK);
  const lines = doc.splitTextToSize(text, CW - 5.5);
  const lineH = 5.5;
  const textBlockH = lines.length * lineH;
  const rowH = Math.max(11, textBlockH + 6);
  const barH = 6;
  setFill(doc, TEAL);
  doc.rect(ML, y + (rowH - barH) / 2, 1.1, barH, 'F');
  const textTopY = y + (rowH - textBlockH) / 2;
  let ly = textTopY + lineH * 0.78;
  lines.forEach(line => { doc.text(line, ML + 3.8, ly); ly += lineH; });
  return rowH;
}

// ─── Build PDF ────────────────────────────────────────────────────────────────
const doc = new jsPDF({ unit: 'mm', format: [PW, PH] });

doc.addFileToVFS('Outfit-Regular.ttf', outfitRegB64);
doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');
doc.addFileToVFS('Outfit-Bold.ttf', outfitBoldB64);
doc.addFont('Outfit-Bold.ttf', 'Outfit', 'bold');
doc.addFileToVFS('Outfit-SemiBold.ttf', outfitSemiBoldB64);
doc.addFont('Outfit-SemiBold.ttf', 'OutfitSemiBold', 'normal');

const agencyLabel = inputs.agencyName;
const dateStr = 'March 3, 2026';
const reductionPct = 70;
const costWithBCS = Math.round(costs.totalOperationalCost * 0.3);
const operationalSavings = Math.round(costs.totalOperationalCost * 0.7);
const monthlyHours = Math.round(costs.staffTimeCost / (inputs.averageHourlyRate * 12));
const revenueImpact = costs.clientChurnCost + costs.opportunityCost;
const maxCostVal = Math.max(costs.clientChurnCost, costs.opportunityCost, costs.staffTimeCost, costs.productivityCost);

// ── PAGE 1 ──────────────────────────────────────────────────────────────────
drawHeader1(doc, agencyLabel, dateStr);
let y = 43.8;

// EXECUTIVE SUMMARY
y += 4;
drawSectionHeading(doc, 'EXECUTIVE SUMMARY', y);
y += 2 + 5;

// Hero card — ALL TEXT WHITE AND BOLD (high contrast per approved design)
const heroH = 46;
drawCard(doc, ML, y, CW, heroH, NAVY, null, 2.1);

// Title — Bold 13pt WHITE
doc.setFont('Outfit', 'bold');
doc.setFontSize(13);
setColor(doc, WHITE);
doc.text("Your Agency's Total Compliance Cost", PW / 2, y + 11, { align: 'center' });

// Big number — Bold 36pt WHITE
doc.setFont('Outfit', 'bold');
doc.setFontSize(36);
setColor(doc, WHITE);
doc.text(fmt(costs.totalOperationalCost), PW / 2, y + 28, { align: 'center' });

// Subtitle — Bold 11pt WHITE
doc.setFont('Outfit', 'bold');
doc.setFontSize(11);
setColor(doc, WHITE);
doc.text('Annual operational impact — labor, lost deals, and client churn', PW / 2, y + 40, { align: 'center' });

y += heroH + 8;

// Cost Breakdown
y += 4;
drawSectionHeading(doc, 'Cost Breakdown', y);
y += 2 + 4;

doc.setFont('Outfit', 'normal');
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
  { label: 'Client Churn (Lost Revenue)',        sub: `6-Year Lifetime Value: ${fmt(costs.clientChurnLTVTotal)}`, value: costs.clientChurnCost,  pct: costs.clientChurnCost / costs.totalOperationalCost * 100 },
  { label: 'Missed Large Client Opportunities',  sub: `6-Year Lifetime Value: ${fmt(costs.lifetimeValueGrowth)}`, value: costs.opportunityCost,  pct: costs.opportunityCost / costs.totalOperationalCost * 100 },
  { label: 'Staff Time on Compliance Issues',    sub: 'Based on hours \u00d7 hourly rate',                        value: costs.staffTimeCost,    pct: costs.staffTimeCost / costs.totalOperationalCost * 100 },
  { label: 'Lost Productivity',                  sub: 'Staff distracted by compliance concerns',                  value: costs.productivityCost, pct: costs.productivityCost / costs.totalOperationalCost * 100 },
];
costRows.forEach(row => {
  const rh = drawBarRow(doc, y, row.label, row.sub, row.value, row.pct, maxCostVal);
  y += rh + 3;
});
y += 3;

// KEY INSIGHTS
y += 4;
drawSectionHeading(doc, 'KEY INSIGHTS', y);
y += 2 + 3;

const insights = [
  `Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
  `Lost opportunities and client churn cost ${fmt(revenueImpact)} annually`,
  'Compliance limitations prevent pursuit of larger, more profitable clients',
  'Current approach creates ongoing drain on resources and growth potential',
];
insights.forEach(ins => {
  const bh = drawAccentBullet(doc, y, ins);
  y += bh + 1.5;
});

drawFooter(doc, 1);

// ── PAGE 2 ──────────────────────────────────────────────────────────────────
doc.addPage();
drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');
y = 29.7;

// Liability Exposure
y += 5.6;
drawSectionHeading(doc, 'Liability Exposure', y);
y += 1.5 + 2.1;

const liabH = 28;
const liabInnerW = CW - 11.3;
const liabX = ML + (CW - liabInnerW) / 2;
drawCard(doc, liabX, y, liabInnerW, liabH, NAVY_LIGHT, NAVY, 2.1);

doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
setColor(doc, GRAY_MID);
doc.text('Potential penalties for your entire book of business', PW / 2, y + 6, { align: 'center' });

doc.setFont('Outfit', 'bold');
doc.setFontSize(32);
setColor(doc, NAVY);
doc.text(fmt(costs.totalLiabilityExposure), PW / 2, y + 19, { align: 'center' });

doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
setColor(doc, GRAY_MID);
doc.text(`Based on ${inputs.totalClients} employer clients at average penalty exposure`, PW / 2, y + 26, { align: 'center' });

y += liabH + 1.4;

// Risk note
const riskText = `Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry average risk for non-compliance within smaller employers is $70K\u2013$150K, and $350K+ for larger employers.`;
doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
const riskLines = doc.splitTextToSize(riskText, CW - 8.5);
const riskBoxH = riskLines.length * 4.2 + 5.6;
drawCard(doc, ML, y, CW, riskBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);
setColor(doc, GRAY_MID);
let ry = y + 4.2;
riskLines.forEach(line => { doc.text(line, ML + 4.2, ry); ry += 4.2; });
y += riskBoxH + 2.8;

// Partnership Comparison
y += 5.6;
drawSectionHeading(doc, 'Partnership Comparison', y);
y += 1.5 + 1.4;

const compCardW = 56.4, compCardH = 28, compGap = 5.6;
const compTotalW = compCardW * 2 + compGap;
const compX1 = ML + (CW - compTotalW) / 2;
const compX2 = compX1 + compCardW + compGap;

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

y += compCardH + 2.1;

// INVESTMENT SUMMARY
y += 5.6;
drawSectionHeading(doc, 'INVESTMENT SUMMARY', y);
y += 1.5 + 2.1;

const invCardW = (CW - 8.5) / 3, invCardH = 36, invGap = 4.2;
const invX1 = ML, invX2 = invX1 + invCardW + invGap, invX3 = invX2 + invCardW + invGap;

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

y += invCardH + 4.2;

// Disclaimer
doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
setColor(doc, GRAY_MID);
const disclaimerText = 'These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.';
const disclaimerLines = doc.splitTextToSize(disclaimerText, CW);
disclaimerLines.forEach(line => { doc.text(line, ML, y); y += 4.2; });
y += 2.1;

drawFooter(doc, 2);

// PAGE BREAK before Benefits (page 3)
doc.addPage();
drawHeader2(doc, 'ROI ANALYSIS', 'The Value of Partnership');
// Page 3 header is 25.4mm tall + 1.5mm teal rule = 26.9mm. Add 10mm top margin.
y = 37;
// BENEFITS OF BCS PARTNERSHIP;
drawSectionHeading(doc, 'BENEFITS OF BCS PARTNERSHIP', y);
y += 1.5 + 1.4;

const benefits = [
  'Scalable compliance processes installed and maintained',
  'Expert support available when compliance issues arise',
  'Confidence to pursue and retain 6-figure clients',
  'Reduced client churn through compliance excellence',
  'Team freed to focus on growth and client service',
  'Proactive compliance strategy vs. reactive firefighting',
];
benefits.forEach(b => {
  const bh = drawAccentBullet(doc, y, b);
  y += bh + 0.7;
});
y += 2.1;

// LTV Methodology note
const ltvText = `Lifetime Value Methodology: LTV calculations based on industry retention rates from Agency Performance Partners (2025): Industry average 84% retention, top performers 93\u201395%. At 84% retention, clients have a 4.06x lifetime value multiplier over 6 years. At 93% retention (achievable with BCS partnership), the multiplier increases to 5.04x \u2014 a 24% improvement in client lifetime value.`;
const retentionNote = `Improving compliance capabilities is one of the most effective ways to improve retention rates. Strong compliance programs improve client perception of your value and capability, and defend against competing brokers who attempt to use compliance as a wedge against your accounts.`;

doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
const ltvLines = doc.splitTextToSize(ltvText, CW - 8.5);
const retLines = doc.splitTextToSize(retentionNote, CW - 8.5);
const ltvBoxH = (ltvLines.length + retLines.length) * 4.2 + 7;
drawCard(doc, ML, y, CW, ltvBoxH, GRAY_LIGHT, RULE_COLOR, 1.4);

setColor(doc, GRAY_MID);
let ly = y + 4.2;
ltvLines.forEach(line => { doc.text(line, ML + 4.2, ly); ly += 4.2; });
ly += 1.4;
setColor(doc, TEAL);
retLines.forEach(line => { doc.text(line, ML + 4.2, ly); ly += 4.2; });

y += ltvBoxH + 7;

// CTA card
const ctaTitle = 'Ready to transform your compliance burden into a competitive advantage?';
doc.setFont('Outfit', 'bold');
doc.setFontSize(13);
const ctaLines = doc.splitTextToSize(ctaTitle, CW - 14.1);
const ctaH = ctaLines.length * 6.3 + 19.7;
drawCard(doc, ML, y, CW, ctaH, NAVY, null, 2.1);

setColor(doc, WHITE);
let cy = y + 5.6;
ctaLines.forEach(line => { doc.text(line, PW / 2, cy, { align: 'center' }); cy += 6.3; });
cy += 2.1;
doc.setFont('Outfit', 'normal');
doc.setFontSize(9);
doc.text('Schedule your consultation:', PW / 2, cy, { align: 'center' });
cy += 4.9;
doc.setFont('OutfitSemiBold', 'normal');
doc.setFontSize(9);
doc.setTextColor(0xA8, 0xF0, 0xED);
doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW / 2, cy, { align: 'center' });

y += ctaH + 8.5;

// Closing contact block
setStroke(doc, RULE_COLOR);
doc.setLineWidth(0.18);
doc.line(ML, y, ML + CW, y);
y += 3.5;

const colW = CW / 3;
const col1 = ML + colW / 2, col2 = ML + colW + colW / 2, col3 = ML + colW * 2 + colW / 2;

doc.setFont('Outfit', 'bold');
doc.setFontSize(7);
setColor(doc, NAVY);
doc.text('WEBSITE', col1, y, { align: 'center' });
doc.text('EMAIL', col2, y, { align: 'center' });
doc.text('SCHEDULE', col3, y, { align: 'center' });

y += 4.2;
doc.setFont('Outfit', 'normal');
doc.setFontSize(8);
setColor(doc, GRAY_MID);
doc.text('benefitscompliancesolutions.com', col1, y, { align: 'center' });
doc.text('info@benefitscompliancesolutions.com', col2, y, { align: 'center' });
doc.text('calendly.com/benefitscompliancesolutions', col3, y, { align: 'center' });

y += 8.5;
doc.setFont('Outfit', 'normal');
doc.setFontSize(6.5);
setColor(doc, GRAY_MID);
const confText = 'This report is confidential and prepared exclusively for the named recipient. All calculations are estimates based on industry benchmarks and the data provided. \u00a9 2026 Benefits Compliance Solutions. All rights reserved.';
const confLines = doc.splitTextToSize(confText, CW);
confLines.forEach(line => { doc.text(line, PW / 2, y, { align: 'center' }); y += 3.5; });

drawFooter(doc, 3);

// ── Save ──────────────────────────────────────────────────────────────────────
const buf = Buffer.from(doc.output('arraybuffer'));
import { writeFileSync } from 'fs';
writeFileSync('/home/ubuntu/test_output_v3.pdf', buf);
console.log('PDF written to /home/ubuntu/test_output_v3.pdf');
