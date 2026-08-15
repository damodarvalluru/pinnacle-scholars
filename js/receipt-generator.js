/* Generates a local PDF after the backend has cryptographically verified payment. */
window.downloadPaymentReceipt = function (details) {
  if (!window.jspdf || !window.jspdf.jsPDF) { console.warn('Receipt library unavailable.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const stamp = new Date();
  const amount = Number(details.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  pdf.setFillColor(13, 41, 82); pdf.rect(0, 0, 210, 44, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.setFont('helvetica', 'bold');
  pdf.text('PINNACLE SCHOLARS ACADEMY', 105, 18, { align: 'center' });
  pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.text('Noida | Official Fee Payment Receipt', 105, 28, { align: 'center' });
  pdf.setTextColor(20, 35, 55); pdf.setFontSize(16); pdf.setFont('helvetica', 'bold'); pdf.text('Payment Receipt', 18, 61);
  const rows = [
    ['Student Name', details.name || 'Student'], ['Student ID', details.studentId || 'N/A'],
    ['Academic Domain', details.domain || 'N/A'], ['Transaction ID', details.paymentId || 'N/A'],
    ['Order ID', details.orderId || 'N/A'], ['Payment Type', details.paymentType || 'Fee Payment'],
    ['Amount Paid', `INR ${amount}`], ['Date & Time', stamp.toLocaleString('en-IN')], ['Payment Status', 'SUCCESS / VERIFIED']
  ];
  let y = 73;
  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) { pdf.setFillColor(242, 247, 252); pdf.rect(18, y - 6, 174, 10, 'F'); }
    pdf.setTextColor(71, 85, 105); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.text(label, 23, y);
    pdf.setTextColor(15, 40, 75); pdf.setFont('helvetica', 'normal'); pdf.text(String(value), 85, y, { maxWidth: 100 }); y += 11;
  });
  pdf.setDrawColor(30, 102, 160); pdf.line(18, y + 8, 192, y + 8);
  pdf.setTextColor(71, 85, 105); pdf.setFontSize(9); pdf.text('This system-generated receipt confirms a successful Razorpay verification.', 105, y + 18, { align: 'center' });
  pdf.save(`Pinnacle-Receipt-${details.paymentId || Date.now()}.pdf`);
};
