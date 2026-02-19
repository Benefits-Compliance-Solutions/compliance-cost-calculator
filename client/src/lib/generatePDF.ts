import { jsPDF } from 'jspdf';
import { 
  getAgencySizeBenchmark, 
  compareToBenchmark, 
  calculateCostPerEmployee,
  compareCostBreakdown 
} from './benchmarkData';

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
  doc.setFontSize(12);
  doc.text('Total Annual Compliance Cost', 105, yPos + 8, { align: 'center' });
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costs.totalCost.toLocaleString()}`, 105, yPos + 19, { align: 'center' });
  
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
  
  yPos += 10;
  
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
  
  // New page for Benchmark Analysis
  doc.addPage();
  yPos = 20;
  
  // Benchmark Header
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INDUSTRY BENCHMARK ANALYSIS', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('How You Compare to Similar Agencies', 105, 25, { align: 'center' });
  
  yPos = 50;
  
  // Get benchmark data
  const benchmark = getAgencySizeBenchmark(inputs.numberOfEmployees);
  const costPerEmployee = calculateCostPerEmployee(costs.totalCost, inputs.numberOfEmployees);
  const overallComparison = compareToBenchmark(costPerEmployee, benchmark.totalCostPerEmployee);
  const categoryComparisons = compareCostBreakdown(costs, inputs.numberOfEmployees);
  
  // Agency Size Category
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${benchmark.sizeCategory} (${benchmark.employeeRange})`, 20, yPos);
  
  yPos += 10;
  
  // Cost per Employee Comparison
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, yPos, 80, 30, 3, 3, 'F');
  
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Cost per Employee', 60, yPos + 8, { align: 'center' });
  
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${costPerEmployee.toLocaleString()}`, 60, yPos + 20, { align: 'center' });
  
  // Industry Average
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(110, yPos, 80, 30, 3, 3, 'F');
  
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Industry Average', 150, yPos + 8, { align: 'center' });
  
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${benchmark.totalCostPerEmployee.average.toLocaleString()}`, 150, yPos + 20, { align: 'center' });
  
  yPos += 40;
  
  // Comparison Status
  const comparisonColor = overallComparison.urgency === 'high' ? [220, 100, 100] : 
                         overallComparison.urgency === 'medium' ? navyBlue : teal;
  
  doc.setFillColor(comparisonColor[0], comparisonColor[1], comparisonColor[2]);
  doc.setDrawColor(comparisonColor[0], comparisonColor[1], comparisonColor[2]);
  doc.roundedRect(20, yPos, 170, 20, 3, 3, 'D');
  
  doc.setTextColor(comparisonColor[0], comparisonColor[1], comparisonColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(overallComparison.message, 105, yPos + 8, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${Math.abs(overallComparison.percentageDifference).toFixed(1)}% ${overallComparison.percentageDifference > 0 ? 'above' : 'below'} industry average`,
    105,
    yPos + 15,
    { align: 'center' }
  );
  
  yPos += 30;
  
  // Category Breakdown
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('COST CATEGORY COMPARISON', 20, yPos);
  
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  
  categoryComparisons.forEach((cat) => {
    // Category name and status
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.text(cat.category, 25, yPos);
    
    // Status badge
    const statusText = cat.status === 'optimal' ? 'Below Avg' : 
                      cat.status === 'high' ? 'Above Avg' : 'Typical';
    const statusColor = cat.status === 'optimal' ? teal : 
                       cat.status === 'high' ? [220, 100, 100] : gray;
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(statusText, 185, yPos, { align: 'right' });
    
    yPos += 5;
    
    // Percentages
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(
      `Your spend: ${cat.actualPercent.toFixed(1)}% | Industry: ${cat.benchmarkRange.low}-${cat.benchmarkRange.high}%`,
      25,
      yPos
    );
    
    yPos += 8;
    doc.setFontSize(9);
  });
  
  yPos += 5;
  
  // Key Insights
  if (overallComparison.urgency === 'high') {
    doc.setFillColor(255, 240, 240);
    doc.setDrawColor(220, 100, 100);
    doc.roundedRect(20, yPos, 170, 35, 3, 3, 'FD');
    
    doc.setTextColor(180, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Action Recommended', 25, yPos + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    const excessCost = (costPerEmployee - benchmark.totalCostPerEmployee.average) * inputs.numberOfEmployees;
    const alertText = `Your compliance costs are ${Math.abs(overallComparison.percentageDifference).toFixed(0)}% above industry average, representing approximately $${excessCost.toLocaleString()} in excess annual costs. This is a major opportunity for improvement through compliance partnership.`;
    const alertLines = doc.splitTextToSize(alertText, 160);
    let alertY = yPos + 16;
    alertLines.forEach((line: string) => {
      doc.text(line, 25, alertY);
      alertY += 5;
    });
    
    yPos += 40;
  }
  
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
  
  // Calculate ROI
  const reductionPercentage = 70;
  const estimatedSavings = costs.totalCost * (reductionPercentage / 100);
  const estimatedBCSCost = 75000; // $75K annual investment
  const netSavings = estimatedSavings - estimatedBCSCost;
  const roi = estimatedBCSCost > 0 ? ((netSavings / estimatedBCSCost) * 100) : 0;
  
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
  doc.text(`$${costs.totalCost.toLocaleString()}`, 60, yPos + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Annual Compliance Costs', 60, yPos + 25, { align: 'center' });
  
  // With BCS
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text('WITH BCS PARTNERSHIP', 110, yPos - 8);
  
  const costWithBCS = costs.totalCost - estimatedSavings;
  
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
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTMENT SUMMARY', 20, yPos);
  
  yPos += 10;
  
  const summaryItems = [
    { label: 'Estimated Annual Savings', value: estimatedSavings, color: teal },
    { label: 'Estimated Partnership Investment', value: estimatedBCSCost, color: navyBlue },
    { label: 'Net Annual Savings', value: netSavings, color: teal },
  ];
  
  summaryItems.forEach((item) => {
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.setDrawColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(20, yPos, 170, 15, 2, 2, 'D');
    
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, 25, yPos + 9);
    
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.value.toLocaleString()}`, 185, yPos + 9, { align: 'right' });
    
    yPos += 20;
  });
  
  // ROI Highlight
  doc.setFillColor(teal[0], teal[1], teal[2]);
  doc.roundedRect(20, yPos, 170, 20, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('First Year Return on Investment (ROI)', 105, yPos + 8, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${roi.toFixed(0)}%`, 105, yPos + 16, { align: 'center' });
  
  yPos += 30;
  
  // Revenue Growth Section
  if (costs.revenueGrowth > 0) {
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUE GROWTH OPPORTUNITY', 20, yPos);
    
    yPos += 8;
    
    // Annual Revenue
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(teal[0], teal[1], teal[2]);
    doc.roundedRect(20, yPos, 82, 25, 3, 3, 'FD');
    
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Annual New Client Revenue', 61, yPos + 8, { align: 'center' });
    
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${costs.revenueGrowth.toLocaleString()}`, 61, yPos + 18, { align: 'center' });
    
    // Lifetime Value
    doc.setFillColor(teal[0], teal[1], teal[2]);
    doc.setDrawColor(teal[0], teal[1], teal[2]);
    doc.roundedRect(108, yPos, 82, 25, 3, 3, 'FD');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('6-Year Lifetime Value', 149, yPos + 8, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${costs.lifetimeValueGrowth.toLocaleString()}`, 149, yPos + 18, { align: 'center' });
    
    yPos += 30;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    const growthText = `With stronger compliance capabilities, your agency can confidently pursue and win more clients. Based on industry standard 6-year client retention, this represents $${costs.lifetimeValueGrowth.toLocaleString()} in lifetime value—significant revenue upside beyond cost savings.`;
    const growthLines = doc.splitTextToSize(growthText, 170);
    growthLines.forEach((line: string) => {
      doc.text(line, 20, yPos);
      yPos += 4;
    });
    
    yPos += 10;
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
