import jsPDF from 'jspdf';
import { RETENTION_RATES, LTV_CITATIONS } from './ltvCalculations';

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
const NAVY   = [43, 43, 104] as const;   // #2B2B68
const TEAL   = [116, 178, 175] as const; // #74B2AF
const WHITE  = [255, 255, 255] as const;
const GRAY   = [80, 80, 90] as const;
const LGRAY  = [245, 245, 248] as const;
const MGRAY  = [150, 150, 160] as const;

// White logo (white mark + wordmark on transparent bg)
const WHITE_LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/rsWrvsKypQxmZoQt.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return '$' + n.toLocaleString(); }

function setNavy(doc: jsPDF) { doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]); }
function setTeal(doc: jsPDF) { doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]); }
function setGray(doc: jsPDF) { doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]); }
function setMGray(doc: jsPDF) { doc.setTextColor(MGRAY[0], MGRAY[1], MGRAY[2]); }
function setWhite(doc: jsPDF) { doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]); }

// Draw a filled rounded rect with optional stroke
function fillRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  fill: readonly [number,number,number],
  stroke?: readonly [number,number,number],
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

// Draw the branded page header (logo left, title right)
function drawPageHeader(
  doc: jsPDF,
  pageWidth: number,
  title: string,
  subtitle: string
) {
  // Navy background bar
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Teal accent line below header
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(0, 38, pageWidth, 2, 'F');

  // White logo — left side
  try {
    doc.addImage(WHITE_LOGO_URL, 'PNG', 14, 7, 48, 24);
  } catch (_) { /* skip if load fails */ }

  // Title block — right side
  setWhite(doc);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth - 14, 27, { align: 'right' });
}

// Draw the page footer (name | page N | calendly)
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

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210;
  const ML = 14;
  const CW = PW - ML * 2;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COMPLIANCE COST ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  drawPageHeader(doc, PW, 'COMPLIANCE COST ANALYSIS', 'Confidential Report');

  let y = 46;

  // "Prepared for" row
  const agencyLabel = inputs.agencyName || (inputs.leadData?.company) || 'Your Agency';
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text(`Prepared for: ${agencyLabel}`, ML, y + 4);
  doc.text(`Report Generated: ${dateStr}`, PW - ML, y + 4, { align: 'right' });

  y += 12;

  // ── Hero card ──────────────────────────────────────────────────────────────
  fillRect(doc, ML, y, CW, 34, NAVY);

  setWhite(doc);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text("Your Agency's Total Compliance Cost", PW / 2, y + 8, { align: 'center' });

  doc.setFontSize(9);
  doc.text('Annual operational impact — labor, lost deals, and client churn', PW / 2, y + 14, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(costs.totalOperationalCost), PW / 2, y + 27, { align: 'center' });

  y += 40;

  // ── Cost Breakdown heading ─────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('COST BREAKDOWN', ML, y);

  // Thin teal rule
  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

  // ── Bar rows ───────────────────────────────────────────────────────────────
  const costItems = [
    {
      label: 'Client Churn (Lost Revenue)',
      value: costs.clientChurnCost,
      pct: (costs.clientChurnCost / costs.totalOperationalCost) * 100,
      ltv: costs.clientChurnLTVTotal,
    },
    {
      label: 'Missed Large Client Opportunities',
      value: costs.opportunityCost,
      pct: (costs.opportunityCost / costs.totalOperationalCost) * 100,
      ltv: costs.lifetimeValueGrowth,
    },
    {
      label: 'Staff Time on Compliance Issues',
      value: costs.staffTimeCost,
      pct: (costs.staffTimeCost / costs.totalOperationalCost) * 100,
      ltv: undefined,
    },
    {
      label: 'Lost Productivity',
      value: costs.productivityCost,
      pct: (costs.productivityCost / costs.totalOperationalCost) * 100,
      ltv: undefined,
    },
  ];

  costItems.forEach((item) => {
    // Label row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    doc.text(item.label, ML + 1, y + 4);

    doc.setFont('helvetica', 'bold');
    setNavy(doc);
    doc.text(fmt(item.value), ML + CW - 22, y + 4, { align: 'right' });

    setMGray(doc);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.pct.toFixed(1)}%`, ML + CW, y + 4, { align: 'right' });

    // Bar track
    const barW = CW - 2;
    const barH = 3;
    doc.setFillColor(LGRAY[0], LGRAY[1], LGRAY[2]);
    doc.roundedRect(ML + 1, y + 6, barW, barH, 1, 1, 'F');

    // Bar fill — navy
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.roundedRect(ML + 1, y + 6, (barW * item.pct) / 100, barH, 1, 1, 'F');

    y += 13;

    // LTV sub-label
    if (item.ltv) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      setTeal(doc);
      doc.text(`6-Year Lifetime Value Impact: ${fmt(item.ltv)}`, ML + 3, y);
      y += 6;
    }
  });

  y += 4;

  // ── Key Insights ───────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('KEY INSIGHTS', ML, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

  const monthlyHours = Math.round(costs.staffTimeCost / (inputs.averageHourlyRate * 12));
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;

  const insights = [
    `Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `Lost opportunities and client churn cost ${fmt(revenueImpact)} annually`,
    'Compliance limitations prevent pursuit of larger, more profitable clients',
    'Current approach creates ongoing drain on resources and growth potential',
  ];

  insights.forEach((insight) => {
    // Teal accent bar
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.rect(ML, y - 3, 2.5, 5, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    const lines = doc.splitTextToSize(insight, CW - 6);
    lines.forEach((line: string) => {
      doc.text(line, ML + 5, y);
      y += 5;
    });
    y += 1;
  });

  drawPageFooter(doc, PW, 1);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ROI ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(doc, PW, 'ROI ANALYSIS', 'The Value of Partnership');

  y = 46;

  // ── Liability Exposure ────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('LIABILITY EXPOSURE', ML, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

  // Liability card — navy light background
  const liabBg: [number,number,number] = [235, 235, 248];
  fillRect(doc, ML, y, CW, 28, liabBg, NAVY, 0.8, 3);

  setNavy(doc);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Estimated Liability Exposure', PW / 2, y + 7, { align: 'center' });

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(costs.totalLiabilityExposure), PW / 2, y + 20, { align: 'center' });

  y += 33;

  // Risk note
  fillRect(doc, ML, y, CW, 18, LGRAY, undefined, 0, 2);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  const riskText = `Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry average risk for non-compliance within smaller employers is $70K–$150K, and $350K+ for larger employers.`;
  const riskLines = doc.splitTextToSize(riskText, CW - 6);
  let ry = y + 5;
  riskLines.forEach((line: string) => { doc.text(line, ML + 3, ry); ry += 4; });

  y += 23;

  // ── Partnership Comparison ────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('PARTNERSHIP COMPARISON', ML, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

  const reductionPct = 70;
  const costWithBCS = Math.round(costs.totalOperationalCost * (1 - reductionPct / 100));
  const halfW = (CW - 6) / 2;
  const compH = 36;

  // WITHOUT BCS card
  fillRect(doc, ML, y, halfW, compH, LGRAY, NAVY, 0.8, 3);
  setNavy(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS', ML + halfW / 2, y + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.text(fmt(costs.totalOperationalCost), ML + halfW / 2, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('Annual operational costs', ML + halfW / 2, y + 28, { align: 'center' });
  doc.text('Draining your agency', ML + halfW / 2, y + 33, { align: 'center' });

  // WITH BCS card
  const cx2 = ML + halfW + 6;
  const tealLight: [number,number,number] = [235, 248, 247];
  fillRect(doc, cx2, y, halfW, compH, tealLight, TEAL, 0.8, 3);
  setTeal(doc);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITH BCS', cx2 + halfW / 2, y + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.text(fmt(costWithBCS), cx2 + halfW / 2, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('Reduced annual costs', cx2 + halfW / 2, y + 28, { align: 'center' });
  setTeal(doc);
  doc.setFont('helvetica', 'bold');
  doc.text(`${reductionPct}% Reduction`, cx2 + halfW / 2, y + 33, { align: 'center' });

  y += compH + 10;

  // ── Investment Summary ────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('INVESTMENT SUMMARY', ML, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

  const thirdW = (CW - 10) / 3;
  const invH = 30;
  const operationalSavings = Math.round(costs.totalOperationalCost * 0.7);

  // Card 1 — Without BCS
  fillRect(doc, ML, y, thirdW, invH, LGRAY, NAVY, 0.8, 2);
  setNavy(doc);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS', ML + thirdW / 2, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(fmt(costs.totalOperationalCost), ML + thirdW / 2, y + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('Annual operational costs', ML + thirdW / 2, y + 25, { align: 'center' });

  // Card 2 — Savings
  const cx3b = ML + thirdW + 5;
  const navyLight: [number,number,number] = [240, 240, 252];
  fillRect(doc, cx3b, y, thirdW, invH, navyLight, NAVY, 0.5, 2);
  setNavy(doc);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OPERATIONAL SAVINGS', cx3b + thirdW / 2, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(fmt(operationalSavings), cx3b + thirdW / 2, y + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('What you save annually', cx3b + thirdW / 2, y + 25, { align: 'center' });

  // Card 3 — New Revenue
  const cx3c = cx3b + thirdW + 5;
  fillRect(doc, cx3c, y, thirdW, invH, tealLight, TEAL, 0.8, 2);
  setTeal(doc);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NEW REVENUE', cx3c + thirdW / 2, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(fmt(costs.revenueGrowth), cx3c + thirdW / 2, y + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setGray(doc);
  doc.text('From winning new clients', cx3c + thirdW / 2, y + 25, { align: 'center' });

  y += invH + 5;

  // Footnote
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  setMGray(doc);
  const noteText = 'These estimates are based on typical results from BCS partnerships. Actual benefits may vary based on your specific situation.';
  const noteLines = doc.splitTextToSize(noteText, CW);
  noteLines.forEach((line: string) => { doc.text(line, PW / 2, y, { align: 'center' }); y += 4; });

  drawPageFooter(doc, PW, 2);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — BENEFITS & CTA
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(doc, PW, 'ROI ANALYSIS', 'The Value of Partnership');

  y = 46;

  // ── Benefits of BCS Partnership ───────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('BENEFITS OF BCS PARTNERSHIP', ML, y);

  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(ML, y + 2, ML + CW, y + 2);

  y += 8;

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
    doc.rect(ML, y - 3.5, 2.5, 5.5, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setGray(doc);
    const lines = doc.splitTextToSize(benefit, CW - 6);
    lines.forEach((line: string) => { doc.text(line, ML + 5, y); y += 5; });
    y += 2;
  });

  y += 4;

  // ── LTV Methodology box ───────────────────────────────────────────────────
  // Pre-calculate content height so the box auto-sizes
  const ltvBg: [number,number,number] = [245, 245, 248];
  doc.setFontSize(8.5);
  const ltvText = `LTV calculations based on industry retention rates from ${LTV_CITATIONS.PRIMARY.source} (${LTV_CITATIONS.PRIMARY.year}): Industry average ${LTV_CITATIONS.PRIMARY.stats.industryAverage} retention, top performers ${LTV_CITATIONS.PRIMARY.stats.topPerformers}. At ${(RETENTION_RATES.INDUSTRY_AVERAGE * 100).toFixed(0)}% retention, clients have a 4.06x lifetime value multiplier over 6 years. At ${(RETENTION_RATES.TOP_PERFORMER * 100).toFixed(0)}% retention (achievable with BCS partnership), the multiplier increases to 5.04x — a 24% improvement in client lifetime value.`;
  const ltvLines = doc.splitTextToSize(ltvText, CW - 6);
  const retentionNote = 'Improving compliance capabilities is one of the most effective ways to improve retention rates. Strong compliance programs improve client perception of your value and capability, and defend against competing brokers who attempt to use compliance as a wedge against your accounts.';
  const retLines = doc.splitTextToSize(retentionNote, CW - 6);
  // Height: title row (6+5) + ltvLines + gap (3) + retLines + padding (6)
  const ltvBoxH = 11 + (ltvLines.length * 3.8) + 3 + (retLines.length * 3.8) + 6;
  fillRect(doc, ML, y, CW, ltvBoxH, ltvBg, undefined, 0, 2);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('Lifetime Value Methodology:', ML + 3, y + 6);

  doc.setFont('helvetica', 'normal');
  setGray(doc);
  let ly = y + 11;
  ltvLines.forEach((line: string) => { doc.text(line, ML + 3, ly); ly += 3.8; });

  // Retention copy — compliance as retention driver
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  setTeal(doc);
  let rn = ly + 3;
  retLines.forEach((line: string) => { doc.text(line, ML + 3, rn); rn += 3.8; });

  y = rn + 6;

  // ── CTA card ──────────────────────────────────────────────────────────────
  fillRect(doc, ML, y, CW, 32, NAVY, undefined, 0, 4);

  setWhite(doc);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const ctaTitle = 'Ready to transform your compliance burden into a competitive advantage?';
  const ctaLines = doc.splitTextToSize(ctaTitle, CW - 10);
  let cy = y + 8;
  ctaLines.forEach((line: string) => { doc.text(line, PW / 2, cy, { align: 'center' }); cy += 6; });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Schedule your consultation:', PW / 2, cy + 2, { align: 'center' });

  setTeal(doc);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('calendly.com/benefitscompliancesolutions/bcs-strategy-session', PW / 2, cy + 9, { align: 'center' });

  y += 38;

  // ── Closing contact block ─────────────────────────────────────────────────
  doc.setDrawColor(MGRAY[0], MGRAY[1], MGRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + CW, y);

  y += 6;

  const col1 = ML + CW * 0.14;
  const col2 = ML + CW * 0.50;
  const col3 = ML + CW * 0.80;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setNavy(doc);
  doc.text('WEBSITE', col1, y, { align: 'center' });
  doc.text('EMAIL', col2, y, { align: 'center' });
  doc.text('SCHEDULE', col3, y, { align: 'center' });

  y += 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  doc.text('benefitscompliancesolutions.com', col1, y, { align: 'center' });
  doc.text('info@benefitscompliancesolutions.com', col2, y, { align: 'center' });
  doc.text('calendly.com/benefitscompliancesolutions/', col3, y, { align: 'center' });
  y += 4;
  doc.text('bcs-strategy-session', col3, y, { align: 'center' });

  y += 8;

  // Confidentiality notice
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setMGray(doc);
  const confText = 'This report is confidential and prepared exclusively for the named recipient. All calculations are estimates based on industry benchmarks and the data provided. © 2026 Benefits Compliance Solutions. All rights reserved.';
  const confLines = doc.splitTextToSize(confText, CW);
  confLines.forEach((line: string) => { doc.text(line, PW / 2, y, { align: 'center' }); y += 4; });

  drawPageFooter(doc, PW, 3);

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
