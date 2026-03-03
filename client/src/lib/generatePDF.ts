import jsPDF from 'jspdf';
import { RETENTION_RATES, LTV_CITATIONS } from './ltvCalculations';
import { BCS_WHITE_LOGO_BASE64 } from './logoBase64';

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

// ─── Brand constants ──────────────────────────────────────────────────────────
const NAVY        = [43, 43, 104]   as const;  // #2B2B68
const TEAL        = [116, 178, 175] as const;  // #74B2AF
const WHITE       = [255, 255, 255] as const;
const GRAY        = [80, 80, 90]    as const;
const LGRAY       = [245, 245, 248] as const;
const MGRAY       = [150, 150, 160] as const;
const LIAB_BG     = [235, 235, 248] as const;  // lavender card bg
const TEAL_LIGHT  = [235, 248, 247] as const;  // teal card bg
const NAVY_LIGHT  = [240, 240, 252] as const;  // navy light card bg

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

function setNavy(doc: jsPDF)  { doc.setTextColor(NAVY[0],  NAVY[1],  NAVY[2]);  }
function setTeal(doc: jsPDF)  { doc.setTextColor(TEAL[0],  TEAL[1],  TEAL[2]);  }
function setGray(doc: jsPDF)  { doc.setTextColor(GRAY[0],  GRAY[1],  GRAY[2]);  }
function setMGray(doc: jsPDF) { doc.setTextColor(MGRAY[0], MGRAY[1], MGRAY[2]); }
function setWhite(doc: jsPDF) { doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]); }

function fillRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  fill: readonly [number, number, number],
  stroke?: readonly [number, number, number],
  lw = 0.5,
  r = 3
) {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  if (stroke) {
    doc.setDrawColor(stroke[0], stroke[1], stroke[2]);
    doc.setLineWidth(lw);
    doc.roundedRect(x, y, w, h, r, r, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, r, r, 'F');
  }
}

// ─── Page header ─────────────────────────────────────────────────────────────
// Layout: navy bar (height 46mm) | logo LEFT | title block RIGHT
// "Prepared for" and date go INSIDE the header, below the title
function drawPageHeader(
  doc: jsPDF,
  pageWidth: number,
  title: string,
  subtitle: string,
  preparedFor: string,
  dateStr: string
) {
  const headerH = 46;

  // Navy background
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, headerH, 'F');

  // Teal accent line below header
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(0, headerH, pageWidth, 2, 'F');

  // BCS white logo — left side (width 52mm, height ~20mm, vertically centred)
  try {
    doc.addImage(BCS_WHITE_LOGO_BASE64, 'PNG', 12, 13, 52, 20);
  } catch (_) { /* skip if fails */ }

  // Title block — right side
  setWhite(doc);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - 12, 16, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth - 12, 23, { align: 'right' });

  // "Prepared for" and date inside header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared for: ${preparedFor}`, pageWidth - 12, 32, { align: 'right' });
  doc.text(`Report Generated: ${dateStr}`, pageWidth - 12, 38, { align: 'right' });
}

// ─── Page footer ─────────────────────────────────────────────────────────────
function drawPageFooter(doc: jsPDF, pageWidth: number, pageNum: number) {
  const fy = 284;
  doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(14, fy - 2, pageWidth - 14, fy - 2);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  doc.text('Benefits Compliance Solutions', 14, fy + 3);
  doc.text(`Page ${pageNum}`, pageWidth / 2, fy + 3, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', pageWidth - 14, fy + 3, { align: 'right' });
}

// ─── Section heading (title-case label + teal rule) ───────────────────────────
function drawSectionHeading(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  width: number,
  allCaps = false
) {
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text(allCaps ? label.toUpperCase() : label, x, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(x, y + 2, x + width, y + 2);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210;
  const ML = 14;
  const CW = PW - ML * 2;

  const agencyLabel = inputs.agencyName || inputs.leadData?.company || 'Your Agency';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COMPLIANCE COST ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  drawPageHeader(doc, PW, 'COMPLIANCE COST ANALYSIS', 'Confidential Report', agencyLabel, dateStr);

  let y = 56; // below header (46) + teal bar (2) + 8 padding

  // ── EXECUTIVE SUMMARY section heading ────────────────────────────────────
  drawSectionHeading(doc, 'EXECUTIVE SUMMARY', ML, y, CW, true);
  y += 10;

  // ── Hero card ──────────────────────────────────────────────────────────────
  // Layout (top→bottom): title | big $ | subtitle
  const heroH = 46;
  fillRect(doc, ML, y, CW, heroH, NAVY);

  setWhite(doc);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Your Agency's Total Compliance Cost", PW / 2, y + 10, { align: 'center' });

  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(costs.totalOperationalCost), PW / 2, y + 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Annual operational impact \u2014 labor, lost deals, and client churn', PW / 2, y + 39, { align: 'center' });

  y += heroH + 10;

  // ── Cost Breakdown section heading ────────────────────────────────────────
  drawSectionHeading(doc, 'Cost Breakdown', ML, y, CW, false);
  y += 8;

  // Column headers
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  doc.text('Category', ML + 1, y);
  doc.text('Proportion', ML + 90, y);
  doc.text('Annual Cost', PW - ML, y, { align: 'right' });

  // Thin rule below column headers
  doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y + 2, PW - ML, y + 2);
  y += 6;

  // Cost rows
  const costItems = [
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

  const barColX  = ML + 88;  // start of bar column
  const barColW  = 60;       // bar width
  const costColX = PW - ML;  // right-align cost

  costItems.forEach((item, idx) => {
    // Thin separator above each row (except first)
    if (idx > 0) {
      doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
      doc.setLineWidth(0.2);
      doc.line(ML, y - 1, PW - ML, y - 1);
    }

    // Label — bold navy
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setNavy(doc);
    doc.text(item.label, ML + 1, y + 4);

    // Sub-label — gray
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    doc.text(item.sub, ML + 1, y + 9);

    // Bar track (gray)
    const barH = 3.5;
    const barY  = y + 2;
    doc.setFillColor(LGRAY[0], LGRAY[1], LGRAY[2]);
    doc.roundedRect(barColX, barY, barColW, barH, 1, 1, 'F');

    // Bar fill (navy)
    const fillW = Math.max(2, (barColW * item.pct) / 100);
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.roundedRect(barColX, barY, fillW, barH, 1, 1, 'F');

    // Cost value — bold navy, right-aligned
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setNavy(doc);
    doc.text(fmt(item.value), costColX, y + 4, { align: 'right' });

    // Percentage — gray, below cost
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    doc.text(`${item.pct.toFixed(1)}%`, costColX, y + 9, { align: 'right' });

    y += 16;
  });

  // Bottom rule
  doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - ML, y);
  y += 8;

  // ── KEY INSIGHTS ──────────────────────────────────────────────────────────
  drawSectionHeading(doc, 'KEY INSIGHTS', ML, y, CW, true);
  y += 10;

  const monthlyHours = Math.round(costs.staffTimeCost / (inputs.averageHourlyRate * 12));
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;

  const insights = [
    `Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `Lost opportunities and client churn cost ${fmt(revenueImpact)} annually`,
    'Compliance limitations prevent pursuit of larger, more profitable clients',
    'Current approach creates ongoing drain on resources and growth potential',
  ];

  insights.forEach((insight) => {
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.rect(ML, y - 3.5, 3, 6, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    const lines = doc.splitTextToSize(insight, CW - 7);
    lines.forEach((line: string) => { doc.text(line, ML + 6, y); y += 5.5; });
    y += 2;
  });

  drawPageFooter(doc, PW, 1);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ROI ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(doc, PW, 'ROI ANALYSIS', 'The Value of Partnership', agencyLabel, dateStr);

  y = 56;

  // ── Liability Exposure ────────────────────────────────────────────────────
  drawSectionHeading(doc, 'Liability Exposure', ML, y, CW, false);
  y += 10;

  // Liability card — lavender bg, navy border
  const liabH = 40;
  fillRect(doc, ML, y, CW, liabH, LIAB_BG, NAVY, 0.8, 3);

  setNavy(doc);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Potential penalties for your entire book of business', PW / 2, y + 9, { align: 'center' });

  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(costs.totalLiabilityExposure), PW / 2, y + 24, { align: 'center' });

  const totalClients = inputs.totalClients || 0;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Based on ${totalClients} employer clients at average penalty exposure`,
    PW / 2, y + 34, { align: 'center' }
  );

  y += liabH + 6;

  // Risk note box
  const riskText = `Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry average risk for non-compliance within smaller employers is $70K\u2013$150K, and $350K+ for larger employers.`;
  const riskLines = doc.splitTextToSize(riskText, CW - 8);
  const riskBoxH = riskLines.length * 4.5 + 8;
  fillRect(doc, ML, y, CW, riskBoxH, LGRAY, undefined, 0, 2);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  let ry = y + 6;
  riskLines.forEach((line: string) => { doc.text(line, ML + 4, ry); ry += 4.5; });
  y += riskBoxH + 10;

  // ── Partnership Comparison ────────────────────────────────────────────────
  drawSectionHeading(doc, 'Partnership Comparison', ML, y, CW, false);
  y += 10;

  const reductionPct = 70;
  const costWithBCS = Math.round(costs.totalOperationalCost * (1 - reductionPct / 100));
  const halfW = (CW - 6) / 2;
  const compH = 44;

  // WITHOUT BCS card
  fillRect(doc, ML, y, halfW, compH, LGRAY, NAVY, 0.8, 3);
  setNavy(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS \u2014 Annual Operational Costs', ML + halfW / 2, y + 9, { align: 'center' });
  doc.setFontSize(24);
  doc.text(fmt(costs.totalOperationalCost), ML + halfW / 2, y + 24, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('Draining your agency', ML + halfW / 2, y + 34, { align: 'center' });

  // WITH BCS card
  const cx2 = ML + halfW + 6;
  fillRect(doc, cx2, y, halfW, compH, TEAL_LIGHT, TEAL, 0.8, 3);
  setTeal(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITH BCS \u2014 Reduced Annual Costs', cx2 + halfW / 2, y + 9, { align: 'center' });
  doc.setFontSize(24);
  doc.text(fmt(costWithBCS), cx2 + halfW / 2, y + 24, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text(`${reductionPct}% Reduction`, cx2 + halfW / 2, y + 34, { align: 'center' });

  y += compH + 10;

  // ── INVESTMENT SUMMARY ────────────────────────────────────────────────────
  drawSectionHeading(doc, 'INVESTMENT SUMMARY', ML, y, CW, true);
  y += 10;

  const thirdW = (CW - 10) / 3;
  const invH = 38;
  const operationalSavings = Math.round(costs.totalOperationalCost * 0.7);

  // Card 1 — Without BCS
  fillRect(doc, ML, y, thirdW, invH, LGRAY, NAVY, 0.8, 2);
  setNavy(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS', ML + thirdW / 2, y + 9, { align: 'center' });
  doc.setFontSize(20);
  doc.text(fmt(costs.totalOperationalCost), ML + thirdW / 2, y + 22, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('Annual operational costs', ML + thirdW / 2, y + 31, { align: 'center' });

  // Card 2 — Operational Cost Savings
  const cx3b = ML + thirdW + 5;
  fillRect(doc, cx3b, y, thirdW, invH, NAVY_LIGHT, NAVY, 0.5, 2);
  setTeal(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Operational Cost Savings', cx3b + thirdW / 2, y + 9, { align: 'center' });
  doc.setFontSize(20);
  doc.text(fmt(operationalSavings), cx3b + thirdW / 2, y + 22, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('What you save annually', cx3b + thirdW / 2, y + 31, { align: 'center' });

  // Card 3 — Potential New Revenue
  const cx3c = cx3b + thirdW + 5;
  fillRect(doc, cx3c, y, thirdW, invH, TEAL_LIGHT, TEAL, 0.8, 2);
  setTeal(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Potential New Revenue', cx3c + thirdW / 2, y + 9, { align: 'center' });
  doc.setFontSize(20);
  doc.text(fmt(costs.revenueGrowth), cx3c + thirdW / 2, y + 22, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('From winning new clients', cx3c + thirdW / 2, y + 31, { align: 'center' });

  drawPageFooter(doc, PW, 2);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — BENEFITS & CTA
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(doc, PW, 'ROI ANALYSIS', 'The Value of Partnership', agencyLabel, dateStr);

  y = 56;

  // Disclaimer at top of page 3 (before Benefits section)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  const disclaimerText = 'These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, CW);
  disclaimerLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });
  y += 6;

  // ── BENEFITS OF BCS PARTNERSHIP ───────────────────────────────────────────
  drawSectionHeading(doc, 'BENEFITS OF BCS PARTNERSHIP', ML, y, CW, true);
  y += 10;

  const benefits = [
    'Scalable compliance processes installed and maintained',
    'Expert support available when compliance issues arise',
    'Confidence to pursue and retain 6-figure clients',
    'Reduced client churn through compliance excellence',
    'Team freed to focus on growth and client service',
    'Proactive compliance strategy vs. reactive firefighting',
  ];

  benefits.forEach((benefit) => {
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.rect(ML, y - 3.5, 3, 6, 'F');
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    const lines = doc.splitTextToSize(benefit, CW - 7);
    lines.forEach((line: string) => { doc.text(line, ML + 6, y); y += 5.5; });
    y += 2;
  });

  y += 4;

  // ── LTV Methodology box (auto-sized) ─────────────────────────────────────
  const ltvBg: [number, number, number] = [245, 245, 248];
  doc.setFontSize(9);
  const ltvBodyText = `LTV calculations based on industry retention rates from ${LTV_CITATIONS.PRIMARY.source} (${LTV_CITATIONS.PRIMARY.year}): Industry average ${LTV_CITATIONS.PRIMARY.stats.industryAverage} retention, top performers ${LTV_CITATIONS.PRIMARY.stats.topPerformers}. At ${(RETENTION_RATES.INDUSTRY_AVERAGE * 100).toFixed(0)}% retention, clients have a 4.06x lifetime value multiplier over 6 years. At ${(RETENTION_RATES.TOP_PERFORMER * 100).toFixed(0)}% retention (achievable with BCS partnership), the multiplier increases to 5.04x \u2014 a 24% improvement in client lifetime value.`;
  const ltvLines = doc.splitTextToSize(ltvBodyText, CW - 8);

  const retentionNote = 'Improving compliance capabilities is one of the most effective ways to improve retention rates. Strong compliance programs improve client perception of your value and capability, and defend against competing brokers who attempt to use compliance as a wedge against your accounts.';
  const retLines = doc.splitTextToSize(retentionNote, CW - 8);

  // Height: top padding (6) + label row (5) + gap (2) + ltvLines + gap (4) + retLines + bottom padding (6)
  const ltvBoxH = 6 + 5 + 2 + (ltvLines.length * 4.2) + 4 + (retLines.length * 4.2) + 6;
  fillRect(doc, ML, y, CW, ltvBoxH, ltvBg, undefined, 0, 2);

  // "Lifetime Value Methodology:" inline bold prefix
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  let lx = y + 6;
  doc.text('Lifetime Value Methodology:', ML + 4, lx);
  lx += 5;

  doc.setFont('helvetica', 'normal');
  setGray(doc);
  ltvLines.forEach((line: string) => { doc.text(line, ML + 4, lx); lx += 4.2; });

  lx += 4;
  doc.setFont('helvetica', 'italic');
  setTeal(doc);
  retLines.forEach((line: string) => { doc.text(line, ML + 4, lx); lx += 4.2; });

  y += ltvBoxH + 8;

  // ── CTA card ──────────────────────────────────────────────────────────────
  const ctaTitle = 'Ready to transform your compliance burden into a competitive advantage?';
  const ctaLines = doc.splitTextToSize(ctaTitle, CW - 16);
  const ctaH = 14 + (ctaLines.length * 7) + 20;
  fillRect(doc, ML, y, CW, ctaH, NAVY, undefined, 0, 4);

  setWhite(doc);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  let cy = y + 12;
  ctaLines.forEach((line: string) => { doc.text(line, PW / 2, cy, { align: 'center' }); cy += 7; });

  cy += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Schedule your consultation:', PW / 2, cy, { align: 'center' });

  cy += 7;
  setTeal(doc);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW / 2, cy, { align: 'center' });

  y += ctaH + 8;

  // ── Contact block ─────────────────────────────────────────────────────────
  doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + CW, y);
  y += 7;

  const col1 = ML + CW * 0.16;
  const col2 = ML + CW * 0.50;
  const col3 = ML + CW * 0.84;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('WEBSITE', col1, y, { align: 'center' });
  doc.text('EMAIL', col2, y, { align: 'center' });
  doc.text('SCHEDULE', col3, y, { align: 'center' });

  y += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  doc.text('benefitscompliancesolutions.com', col1, y, { align: 'center' });
  doc.text('info@benefitscompliancesolutions.com', col2, y, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions/', col3, y, { align: 'center' });
  y += 4;
  doc.text('bcs-strategy-session', col3, y, { align: 'center' });

  y += 8;

  // Confidentiality notice
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  const confText = 'This report is confidential and prepared exclusively for the named recipient. All calculations are estimates based on industry benchmarks and the data provided. \u00a9 2026 Benefits Compliance Solutions. All rights reserved.';
  const confLines = doc.splitTextToSize(confText, CW);
  confLines.forEach((line: string) => { doc.text(line, PW / 2, y, { align: 'center' }); y += 4.5; });

  drawPageFooter(doc, PW, 3);

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
