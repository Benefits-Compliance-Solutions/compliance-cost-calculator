import { jsPDF } from 'jspdf';


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

interface CompanyInputs {
  numberOfEmployees: number;
  averageHourlyRate: number;
  hoursPerComplianceIssue: number;
  complianceIssuesPerMonth: number;
  totalClients?: number;
  newClientsWonPerYear?: number;
  averageNewClientValue?: number;
}

export function generateCompliancePDF(costs: CostData, inputs: CompanyInputs) {
  const doc = new jsPDF();
  
  // BCS Brand Colors
  const navyBlue = [43, 43, 104]; // #2B2B68
  const teal = [116, 178, 175]; // #74B2AF
  const gray = [100, 100, 100];
  
  let yPos = 20;
  
  // Header with BCS branding
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Add BCS logo (small, in header)
  const logoUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663305235730/nuKbXpgdTmBwocxJ.png';
  try {
    doc.addImage(logoUrl, 'PNG', 15, 8, 20, 20);
  } catch (e) {
    console.log('Logo load failed, continuing without logo');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLIANCE COST ANALYSIS', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Benefits Compliance Solutions', 105, 25, { align: 'center' });
  
  yPos = 45;
  
  // Date
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(10);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, yPos);
  
  yPos += 15;
  
  // Executive Summary Section
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 20, yPos);
  
  yPos += 10;
  
  // Total Cost Highlight Box
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.roundedRect(20, yPos, 170, 25, 3, 3, 'FD');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Total Annual Compliance Cost', 105, yPos + 7, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Operational + Employer Liability Exposure)', 105, yPos + 13, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalCost.toLocaleString()}`, 105, yPos + 22, { align: 'center' });
  
  yPos += 35;
  
  // Operational Costs Section
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('OPERATIONAL COSTS', 20, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('Labor, lost deals, and client churn', 20, yPos + 5);
  
  yPos += 12;
  
  // Operational costs total
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.roundedRect(20, yPos, 170, 15, 2, 2, 'FD');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, 105, yPos + 10, { align: 'center' });
  
  yPos += 20;
  
  const operationalItems = [
    { label: 'Staff Time on Compliance Issues', value: costs.staffTimeCost },
    { label: 'Client Churn', value: costs.clientChurnCost },
    { label: 'Lost Large Client Opportunities', value: costs.opportunityCost },
    { label: 'Lost Productivity', value: costs.productivityCost },
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  operationalItems.forEach((item) => {
    const percentage = costs.totalOperationalCost > 0 ? (item.value / costs.totalOperationalCost) * 100 : 0;
    
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(item.label, 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text(`$${item.value.toLocaleString()}`, 190, yPos, { align: 'right' });
    
    yPos += 4;
    
    const barWidth = 165;
    const fillWidth = (barWidth * percentage) / 100;
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(25, yPos, barWidth, 3, 1, 1, 'FD');
    
    doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    if (fillWidth > 0) {
      doc.roundedRect(25, yPos, fillWidth, 3, 1, 1, 'F');
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`${percentage.toFixed(1)}%`, 192, yPos + 2);
    
    yPos += 6;
    doc.setFontSize(9);
  });
  
  yPos += 10;
  
  // Liability Exposure Section
  doc.setTextColor(180, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LIABILITY EXPOSURE', 20, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('Potential penalties for entire book of business', 20, yPos + 5);
  
  yPos += 12;
  
  // Liability total
  doc.setFillColor(220, 100, 100);
  doc.setDrawColor(220, 100, 100);
  doc.roundedRect(20, yPos, 170, 15, 2, 2, 'FD');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalLiabilityExposure.toLocaleString()}`, 105, yPos + 10, { align: 'center' });
  
  yPos += 20;
  
  // Liability explanation
  doc.setFillColor(255, 240, 240);
  doc.setDrawColor(220, 100, 100);
  doc.roundedRect(20, yPos, 170, 25, 2, 2, 'FD');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const liabilityText = 'This represents potential financial exposure from compliance violations across all client employers. Industry data shows average penalties of $70K-$150K for smaller employers and $350K+ for larger employers.';
  const liabilityLines = doc.splitTextToSize(liabilityText, 160);
  let liabilityY = yPos + 6;
  liabilityLines.forEach((line: string) => {
    doc.text(line, 25, liabilityY);
    liabilityY += 4;
  });
  
  yPos += 30;
  
  // Key Insights Section
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY INSIGHTS', 20, yPos);
  
  yPos += 8;
  
  const monthlyHours = (costs.staffTimeCost / (inputs.averageHourlyRate * 12)).toFixed(0);
  const revenueImpact = costs.clientChurnCost + costs.opportunityCost;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  
  const insights = [
    `• Your team spends approximately ${monthlyHours} hours per month dealing with compliance emergencies`,
    `• Lost opportunities and client churn cost $${revenueImpact.toLocaleString()} annually`,
    `• Compliance limitations prevent pursuit of larger, more profitable clients`,
    `• Current approach creates ongoing drain on resources and growth potential`
  ];
  
  insights.forEach((insight) => {
    const lines = doc.splitTextToSize(insight, 165);
    lines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 5;
    });
  });


  
  // New page for ROI Analysis
  doc.addPage();
  yPos = 20;
  
  // ROI Header
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ROI ANALYSIS', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('The Value of Partnership', 105, 25, { align: 'center' });
  
  yPos = 50;
  
  // Calculate ROI based on operational costs
  const reductionPercentage = 70;
  const estimatedSavings = costs.totalOperationalCost * (reductionPercentage / 100);
  const estimatedBCSCost = 75000; // $75K annual investment
  const netSavings = estimatedSavings - estimatedBCSCost;
  const totalValue = estimatedSavings + costs.lifetimeValueGrowth;
  
  // Before/After Comparison
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('WITHOUT BCS PARTNERSHIP', 20, yPos);
  
  yPos += 8;
  
  doc.setFillColor(255, 240, 240);
  doc.setDrawColor(220, 100, 100);
  doc.roundedRect(20, yPos, 80, 40, 3, 3, 'FD');
  
  doc.setTextColor(180, 50, 50);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, 60, yPos + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual Operational Costs', 60, yPos + 25, { align: 'center' });
  
  // With BCS
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('WITH BCS PARTNERSHIP', 110, yPos - 8);
  
  const costWithBCS = costs.totalOperationalCost - estimatedSavings;
  
  doc.setFillColor(240, 255, 250);
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.roundedRect(110, yPos, 80, 40, 3, 3, 'FD');
  
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costWithBCS.toLocaleString()}`, 150, yPos + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Reduced Annual Costs', 150, yPos + 25, { align: 'center' });
  
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${reductionPercentage}% Reduction`, 150, yPos + 33, { align: 'center' });
  
  yPos += 50;
  
  // Investment Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('INVESTMENT SUMMARY', 20, yPos);
  
  yPos += 10;
  
  const boxWidth = 55;
  const boxHeight = 32;
  const gap = 7;
  let xPos = 20;
  
  // Partnership Investment
  doc.setFillColor(240, 240, 250);
  doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(9);
  doc.text('Partnership Investment', xPos + boxWidth/2, yPos + 9, { align: 'center' });
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${estimatedBCSCost.toLocaleString()}`, xPos + boxWidth/2, yPos + 20, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual', xPos + boxWidth/2, yPos + 26, { align: 'center' });
  
  xPos += boxWidth + gap;
  
  // WITHOUT BCS Partnership (RED BOX)
  const redColor = [220, 100, 100];
  doc.setFillColor(255, 240, 240);
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setLineWidth(0.5);
  doc.setTextColor(redColor[0], redColor[1], redColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHOUT BCS', xPos + boxWidth/2, yPos + 7, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`$${costs.totalOperationalCost.toLocaleString()}`, xPos + boxWidth/2, yPos + 18, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual costs draining', xPos + boxWidth/2, yPos + 24, { align: 'center' });
  doc.text('your agency', xPos + boxWidth/2, yPos + 28, { align: 'center' });
  
  xPos += boxWidth + gap;
  
  // Potential Revenue Gains
  const potentialGains = estimatedSavings + costs.revenueGrowth;
  doc.setFillColor(245, 255, 250);
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setLineWidth(0.5);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Potential Revenue Gains', xPos + boxWidth/2, yPos + 9, { align: 'center' });
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${potentialGains.toLocaleString()}`, xPos + boxWidth/2, yPos + 20, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual savings +', xPos + boxWidth/2, yPos + 25, { align: 'center' });
  doc.text('new business revenue', xPos + boxWidth/2, yPos + 29, { align: 'center' });
  
  yPos += boxHeight + 15;
  
  // Note about value
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const valueText = `Net Annual Savings represents the cost reduction after the partnership investment. This does not include additional revenue from new business opportunities enabled by stronger compliance capabilities.`;
  const valueLines = doc.splitTextToSize(valueText, 170);
  valueLines.forEach((line: string) => {
    doc.text(line, 20, yPos);
    yPos += 4;
  });
  
  yPos += 5;
  
  // Check if we need a new page for Benefits section
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  // Benefits Section
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BENEFITS OF BCS PARTNERSHIP', 20, yPos);
  
  yPos += 8;
  
  const benefits = [
    'Scalable compliance processes installed and maintained',
    'Expert support available when compliance issues arise',
    'Confidence to pursue and retain 6-figure clients',
    'Reduced client churn through compliance excellence',
    'Team freed to focus on growth and client service',
    'Proactive compliance strategy vs. reactive firefighting'
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  
  benefits.forEach((benefit) => {
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.circle(23, yPos - 1.5, 1.5, 'F');
    
    doc.setTextColor(gray[0], gray[1], gray[2]);
    const lines = doc.splitTextToSize(benefit, 160);
    lines.forEach((line: string, index: number) => {
      doc.text(line, 28, yPos + (index * 5));
    });
    yPos += lines.length * 5 + 2;
  });
  
  // Footer
  yPos = 280;
  doc.setDrawColor(teal[0], teal[1], teal[2]);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 5;
  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'italic');
  doc.text('These estimates are based on typical results from BCS partnerships.', 105, yPos, { align: 'center' });
  doc.text('Actual savings may vary based on your specific situation.', 105, yPos + 4, { align: 'center' });
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('Ready to transform your compliance burden into a competitive advantage?', 105, yPos, { align: 'center' });
  doc.text('Contact Benefits Compliance Solutions today.', 105, yPos + 4, { align: 'center' });
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`BCS-Compliance-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`);
}
