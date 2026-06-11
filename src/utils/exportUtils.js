import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { formatCurrency, formatDate } from './helpers';
import { getCategoryById } from '../data/demoData';

export function exportToCSV(transactions, filename = 'smart_kharcha_report') {
  const rows = transactions.map(t => {
    const cat = getCategoryById(t.category);
    return {
      Date: t.date,
      Time: t.time,
      Description: t.description,
      Type: t.type,
      Amount: t.amount,
      Category: cat?.name || 'Other',
      'Payment Via': t.paymentApp,
      Source: t.source,
      Tags: t.tags || '',
      'UPI Ref': t.upiRef || '',
      Notes: t.notes || '',
    };
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(transactions, budget, lendBorrow, user) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(108, 99, 255);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Kharcha Tracker', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 20);
  doc.text(`User: ${user?.name || 'Demo User'}`, 140, 12);

  // Summary
  const monthTxns   = transactions.filter(t => t.date.startsWith(new Date().toISOString().slice(0,7)));
  const monthSpend  = monthTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const monthIncome = monthTxns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const savings     = monthIncome - monthSpend;

  doc.setTextColor(33, 33, 33);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Summary', 14, 38);

  doc.autoTable({
    startY: 42,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Income',   formatCurrency(monthIncome)],
      ['Total Expense',  formatCurrency(monthSpend)],
      ['Net Savings',    formatCurrency(savings)],
      ['Monthly Budget', formatCurrency(budget?.totalBudget || 0)],
      ['Budget Used',    `${((monthSpend / (budget?.totalBudget || 1)) * 100).toFixed(1)}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [108, 99, 255], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // Transactions table
  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('This Month\'s Transactions', 14, finalY);

  doc.autoTable({
    startY: finalY + 4,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount', 'Via']],
    body: monthTxns.map(t => {
      const cat = getCategoryById(t.category);
      return [
        t.date,
        t.description?.slice(0, 30) || '-',
        cat?.name || 'Other',
        t.type,
        (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount),
        t.paymentApp || '-',
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [108, 99, 255], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 4: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // Lend/Borrow section
  if (lendBorrow?.length > 0) {
    const lbY = doc.lastAutoTable.finalY + 8;
    if (lbY < 250) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Lending & Borrowing', 14, lbY);
      doc.autoTable({
        startY: lbY + 4,
        head: [['Person', 'Type', 'Amount', 'Balance', 'Status', 'Due Date']],
        body: lendBorrow.map(l => [
          l.personName,
          l.type === 'lent' ? 'Lent' : 'Borrowed',
          formatCurrency(l.amount),
          formatCurrency(l.balanceRemaining),
          l.status,
          l.dueDate || '-',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [251, 191, 36], textColor: 33 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Smart Kharcha Tracker — Personal Finance for India', 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
  }

  doc.save(`smart_kharcha_report_${new Date().toISOString().slice(0,10)}.pdf`);
}
