import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculationResult, BillDetails } from '../types';

export function generatePDF(result: CalculationResult, bill: BillDetails) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 116, 240); // primary color
  doc.text('Smart Bill Splitter Report', 14, 20);
  
  // Date & Restaurant Name
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 14, 26);
  if (bill.restaurantName) {
    doc.text(`Restaurant: ${bill.restaurantName}`, 14, 32);
  }
  
  let currentY = bill.restaurantName ? 38 : 34;
  
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Bill Summary', 14, currentY);
  currentY += 4;
  
  const summaryHeaders = [['Metric', 'Amount (Rs.)']];
  const summaryBody = [
    ['Subtotal', bill.subtotal.toFixed(2)],
    ['Total GST (Difference)', result.totalGST.toFixed(2)],
    ['Grand Total', bill.grandTotal.toFixed(2)],
    ['Total Coupons Used', result.totalCouponsUsed.toFixed(2)],
    ['Actual Restaurant Payment', result.actualRestaurantPayment.toFixed(2)],
    ['Total Collected from People', result.totalCollected.toFixed(2)],
    ['Calculation Status', result.isBalanced ? 'Balanced' : 'Unbalanced']
  ];
  
  autoTable(doc, {
    startY: currentY,
    head: summaryHeaders,
    body: summaryBody,
    theme: 'grid',
    headStyles: { fillColor: [40, 116, 240] },
    margin: { left: 14, right: 14 }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Item-wise GST Breakdown
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Item-wise GST Breakdown', 14, currentY);
  currentY += 4;
  
  const gstHeaders = [['Item Name', 'Base Price (Rs.)', 'GST Share (Rs.)', 'Final Cost (Rs.)']];
  const gstBody = result.itemGSTBreakdown.map(item => [
    item.itemName,
    item.basePrice.toFixed(2),
    item.gst.toFixed(2),
    item.finalCost.toFixed(2)
  ]);
  
  // Add Total row to GST
  const totalBase = result.itemGSTBreakdown.reduce((sum, item) => sum + item.basePrice, 0);
  const totalGST = result.totalGST;
  const totalFinal = result.itemGSTBreakdown.reduce((sum, item) => sum + item.finalCost, 0);
  gstBody.push([
    'Total',
    totalBase.toFixed(2),
    totalGST.toFixed(2),
    totalFinal.toFixed(2)
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: gstHeaders,
    body: gstBody,
    theme: 'striped',
    headStyles: { fillColor: [40, 116, 240] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Person-wise Consumption
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Person-wise Consumption', 14, currentY);
  currentY += 4;
  
  const consumptionHeaders = [['Person', 'Food Items Shared', 'Food Cost (Rs.)']];
  const consumptionBody = result.personConsumption.map(pc => [
    pc.personName,
    pc.items.map(i => `${i.itemName} (Rs. ${i.share.toFixed(2)})`).join(', ') || 'None',
    pc.totalCost.toFixed(2)
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: consumptionHeaders,
    body: consumptionBody,
    theme: 'striped',
    headStyles: { fillColor: [40, 116, 240] },
    margin: { left: 14, right: 14 }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page for settlement to avoid split layout
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }
  
  // Final Settlement
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Final Settlement', 14, currentY);
  currentY += 4;
  
  const settlementHeaders = [['Person', 'Raw Cost (Rs.)', 'Coupon Deduction (Rs.)', 'Extra Deduction (Rs.)', 'Final Payable (Rs.)']];
  const settlementBody = result.settlement.map(s => [
    s.personName,
    s.rawCost.toFixed(2),
    s.couponDeduction > 0 ? `-${s.couponDeduction.toFixed(2)}` : '0.00',
    s.extraDeduction > 0 ? `-${s.extraDeduction.toFixed(2)}` : '0.00',
    s.finalPayable.toFixed(2)
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: settlementHeaders,
    body: settlementBody,
    theme: 'grid',
    headStyles: { fillColor: [46, 176, 134] }, // green header for settlement
    margin: { left: 14, right: 14 }
  });
  
  // Save PDF
  const filename = `bill-split-${bill.restaurantName ? bill.restaurantName.replace(/\s+/g, '-').toLowerCase() : 'summary'}.pdf`;
  doc.save(filename);
}
