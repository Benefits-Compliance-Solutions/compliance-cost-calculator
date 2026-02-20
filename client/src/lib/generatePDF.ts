import jsPDF from 'jspdf';


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

export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF();
  
  // BCS Brand Colors
  const navyBlue = [43, 43, 104]; // #2B2B68
  const teal = [116, 178, 175]; // #74B2AF
  const lightTeal = [240, 255, 250];
  const red = [220, 53, 69];
  const lightRed = [255, 240, 240];
  const gray = [100, 100, 100];
  const lightGray = [245, 245, 245];
  
  const pageWidth = 210; // A4 width in mm
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // ========== PAGE 1: EXECUTIVE SUMMARY ==========
  let yPos = 20;
  
  // Header with logo and title
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add BCS logo
  const logoUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/iSbOJXBAEeJCKLBx.png';
  try {
    doc.addImage(logoUrl, 'PNG', margin, 12, 25, 25);
  } catch (e) {
    console.log('Logo load skipped');
  }
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLIANCE COST ANALYSIS', pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Benefits Compliance Solutions', pageWidth / 2, 32, { align: 'center' });
  
  // Lead data or agency name if provided
  if (inputs.leadData) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prepared for: ${inputs.leadData.name}`, pageWidth / 2, 38, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inputs.leadData.company} | ${inputs.leadData.email} | ${inputs.leadData.phone}`, pageWidth / 2, 43, { align: 'center' });
  } else if (inputs.agencyName) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prepared for: ${inputs.agencyName}`, pageWidth / 2, 40, { align: 'center' });
  }
  
  yPos = 55;
  
  // Date
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Report Generated: ${dateStr}`, margin, yPos);
  
  yPos += 12;
  
  // Executive Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('EXECUTIVE SUMMARY', margin, yPos);
  
  yPos += 10;
  
  // Operational Costs Card
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Agency\'s Operational Costs', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Labor, lost deals, and client churn', pageWidth / 2, yPos + 14, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, pageWidth / 2, yPos + 23, { align: 'center' });
  
  yPos += 35;
  
  // Cost Breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('Cost Breakdown', margin, yPos);
  
  yPos += 8;
  
  const costItems = [
    { label: 'Staff Time on Compliance Issues', value: costs.staffTimeCost, percentage: (costs.staffTimeCost / costs.totalOperationalCost) * 100 },
    { label: 'Client Churn', value: costs.clientChurnCost, percentage: (costs.clientChurnCost / costs.totalOperationalCost) * 100 },
    { label: 'Lost Large Client Opportunities', value: costs.opportunityCost, percentage: (costs.opportunityCost / costs.totalOperationalCost) * 100 },
    { label: 'Lost Productivity', value: costs.productivityCost, percentage: (costs.productivityCost / costs.totalOperationalCost) * 100 },
  ];
  
  costItems.forEach((item) => {
    // Item row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(item.label, margin + 2, yPos + 4);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.value.toLocaleString()}`, margin + contentWidth - 20, yPos + 4, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.percentage.toFixed(1)}%`, margin + contentWidth - 2, yPos + 4, { align: 'right' });
    
    // Progress bar
    const barWidth = contentWidth - 4;
    const barHeight = 3;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin + 2, yPos + 6, barWidth, barHeight, 1, 1, 'F');
    
    const fillWidth = (barWidth * item.percentage) / 100;
    doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.roundedRect(margin + 2, yPos + 6, fillWidth, barHeight, 1, 1, 'F');
    
    yPos += 12;
  });
  
  yPos += 5;
  
  // Liability Exposure Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(red[0], red[1], red[2]);
  doc.text('Liability Exposure', margin, yPos);
  
  yPos += 2;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('Potential penalties for entire book of business', margin, yPos + 4);
  
  yPos += 8;
  
  // Red box for liability
  doc.setFillColor(lightRed[0], lightRed[1], lightRed[2]);
  doc.setDrawColor(red[0], red[1], red[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'FD');
  
  doc.setTextColor(red[0], red[1], red[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalLiabilityExposure.toLocaleString()}`, pageWidth / 2, yPos + 9, { align: 'center' });
  
  yPos += 18;
  
  // Risk assessment note
  doc.setFillColor(255, 250, 250);
  doc.setDrawColor(red[0], red[1], red[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'FD');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const riskText = 'Risk Assessment: Based on your book of business, this represents potential financial exposure from compliance violations across all client employers. Industry data shows average penalties of $70K-$150K for smaller employers and $350K+ for larger employers.';
  const riskLines = doc.splitTextToSize(riskText, contentWidth - 8);
  let riskY = yPos + 5;
  riskLines.forEach((line: string) => {
    doc.text(line, margin + 4, riskY);
    riskY += 4;
  });
  
  yPos += 25;
  
  // Key Insights
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('KEY INSIGHTS', margin, yPos);
  
  yPos += 7;
  
  const monthlyHours = (costs.staffTimeCost / (inputs.averageHourlyRate * 12)).toFixed(0);
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;
  
  const insights = [
    `• Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `• Lost opportunities and client churn cost $${revenueImpact.toLocaleString()} annually`,
    `• Compliance limitations prevent pursuit of larger, more profitable clients`,
    `• Current approach creates ongoing drain on resources and growth potential`
  ];
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  
  insights.forEach((insight) => {
    const lines = doc.splitTextToSize(insight, contentWidth - 4);
    lines.forEach((line: string) => {
      doc.text(line, margin + 2, yPos);
      yPos += 5;
    });
  });
  
  // Footer for Page 1
  const footerY = 275; // Position near bottom of page
  try {
    doc.addImage('https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/sKRTXuhESaBvPVmV.jpg', 'JPEG', pageWidth / 2 - 20, footerY, 40, 13);
  } catch (e) {
    console.log('Footer logo load skipped');
  }
  
  // ========== PAGE 2: ROI ANALYSIS ==========
  doc.addPage();
  yPos = 20;
  
  // Header
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ROI ANALYSIS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('The Value of Partnership', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 45;
  
  // Calculate ROI
  const reductionPercentage = 70;
  const estimatedSavings = costs.totalOperationalCost * (reductionPercentage / 100);
  const estimatedBCSCost = 75000;
  const costWithBCS = costs.totalOperationalCost - estimatedSavings;
  
  // Before/After Comparison
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('WITHOUT BCS PARTNERSHIP', margin, yPos);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('WITH BCS PARTNERSHIP', pageWidth / 2 + 15, yPos);
  
  yPos += 8;
  
  const boxWidth = (contentWidth - 10) / 2;
  const boxHeight = 35;
  
  // WITHOUT box (red)
  doc.setFillColor(lightRed[0], lightRed[1], lightRed[2]);
  doc.setDrawColor(red[0], red[1], red[2]);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'FD');
  
  doc.setTextColor(red[0], red[1], red[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual Operational Costs', margin + boxWidth / 2, yPos + 10, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, margin + boxWidth / 2, yPos + 22, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Draining your agency', margin + boxWidth / 2, yPos + 30, { align: 'center' });
  
  // WITH box (teal)
  doc.setFillColor(lightTeal[0], lightTeal[1], lightTeal[2]);
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth / 2 + 5, yPos, boxWidth, boxHeight, 3, 3, 'FD');
  
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Reduced Annual Costs', pageWidth / 2 + 5 + boxWidth / 2, yPos + 10, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costWithBCS.toLocaleString()}`, pageWidth / 2 + 5 + boxWidth / 2, yPos + 22, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${reductionPercentage}% Reduction`, pageWidth / 2 + 5 + boxWidth / 2, yPos + 30, { align: 'center' });
  
  yPos += boxHeight + 15;
  
  // Investment Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('INVESTMENT SUMMARY', margin, yPos);
  
  yPos += 10;
  
  const summaryBoxWidth = (contentWidth - 14) / 3;
  const summaryBoxHeight = 30;
  let xPos = margin;
  
  // Box 1: WITHOUT BCS (RED)
  doc.setFillColor(lightRed[0], lightRed[1], lightRed[2]);
  doc.setDrawColor(red[0], red[1], red[2]);
  doc.setLineWidth(1.2);
  doc.roundedRect(xPos, yPos, summaryBoxWidth, summaryBoxHeight, 2, 2, 'FD');
  
  doc.setTextColor(red[0], red[1], red[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS', xPos + summaryBoxWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, xPos + summaryBoxWidth / 2, yPos + 18, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual operational costs', xPos + summaryBoxWidth / 2, yPos + 24, { align: 'center' });
  
  xPos += summaryBoxWidth + 7;
  
  // Box 2: Operational Cost Savings
  doc.setFillColor(245, 245, 255);
  doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setLineWidth(1);
  doc.roundedRect(xPos, yPos, summaryBoxWidth, summaryBoxHeight, 2, 2, 'FD');
  
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Operational Cost Savings', xPos + summaryBoxWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const operationalSavingsAmount = Math.round(costs.totalOperationalCost * 0.7);
  doc.text(`$${operationalSavingsAmount.toLocaleString()}`, xPos + summaryBoxWidth / 2, yPos + 18, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('What you save annually', xPos + summaryBoxWidth / 2, yPos + 24, { align: 'center' });
  
  xPos += summaryBoxWidth + 7;
  
  // Box 3: Potential Annual New Business Revenue
  doc.setFillColor(lightTeal[0], lightTeal[1], lightTeal[2]);
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.setLineWidth(1);
  doc.roundedRect(xPos, yPos, summaryBoxWidth, summaryBoxHeight, 2, 2, 'FD');
  
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Potential Annual New', xPos + summaryBoxWidth / 2, yPos + 7, { align: 'center' });
  doc.text('Business Revenue', xPos + summaryBoxWidth / 2, yPos + 11, { align: 'center' });
  
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.revenueGrowth.toLocaleString()}`, xPos + summaryBoxWidth / 2, yPos + 20, { align: 'center' });
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('From winning new clients', xPos + summaryBoxWidth / 2, yPos + 25, { align: 'center' });
  
  yPos += summaryBoxHeight + 12;
  
  // Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const noteText = 'These estimates are based on typical results from BCS partnerships. Actual savings may vary based on your specific situation.';
  const noteLines = doc.splitTextToSize(noteText, contentWidth);
  noteLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  });
  
  yPos += 8;
  
  // Benefits Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('BENEFITS OF BCS PARTNERSHIP', margin, yPos);
  
  yPos += 8;
  
  const benefits = [
    'Scalable compliance processes installed and maintained',
    'Expert support available when compliance issues arise',
    'Confidence to pursue and retain 6-figure clients',
    'Reduced client churn through compliance excellence',
    'Team freed to focus on growth and client service',
    'Proactive compliance strategy vs. reactive firefighting'
  ];
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  
  benefits.forEach((benefit) => {
    // Bullet point
    doc.setFillColor(teal[0], teal[1], teal[2]);
    doc.circle(margin + 2, yPos - 1.5, 1.5, 'F');
    
    const lines = doc.splitTextToSize(benefit, contentWidth - 8);
    lines.forEach((line: string) => {
      doc.text(line, margin + 6, yPos);
      yPos += 5;
    });
  });
  
  yPos += 5;
  
  // Footer CTA
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to transform your compliance burden into a competitive advantage?', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Schedule your consultation: benefitscompliancesolutions.com', pageWidth / 2, yPos + 15, { align: 'center' });
  
  // Footer for Page 2
  try {
    doc.addImage('https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/sKRTXuhESaBvPVmV.jpg', 'JPEG', pageWidth / 2 - 20, 275, 40, 13);
  } catch (e) {
    console.log('Footer logo load skipped');
  }
  
  // Save the PDF
  const fileName = `BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
