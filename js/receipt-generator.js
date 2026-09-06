/* Generates a local PDF after the backend has cryptographically verified payment. */
window.downloadPaymentReceipt = function (details) {
  if (!window.jspdf || !window.jspdf.jsPDF) { console.warn('Receipt library unavailable.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const stamp = new Date();
  const amount = Number(details.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  pdf.setFillColor(22, 78, 150); pdf.rect(0, 0, 70, 44, 'F');
  pdf.setFillColor(109, 40, 217); pdf.rect(70, 0, 70, 44, 'F');
  pdf.setFillColor(8, 145, 178); pdf.rect(140, 0, 70, 44, 'F');
  /* Institutional crest: custom academic shield + open-book mark. */
  pdf.setFillColor(255, 255, 255); pdf.circle(27, 22, 13, 'F');
  pdf.setFillColor(20, 52, 100); pdf.roundedRect(19, 16, 8, 9, 1, 1, 'F'); pdf.roundedRect(27, 16, 8, 9, 1, 1, 'F');
  pdf.setDrawColor(20, 52, 100); pdf.setLineWidth(.8); pdf.line(27, 16, 27, 27); pdf.line(19, 27, 27, 30); pdf.line(35, 27, 27, 30);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(22); pdf.setFont('helvetica', 'bold');
  pdf.text('PINNACLE SCHOLARS ACADEMY', 105, 18, { align: 'center' });
  pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.text('Noida | Official Fee Payment Receipt', 105, 28, { align: 'center' });
  pdf.setTextColor(20, 35, 55); pdf.setFontSize(16); pdf.setFont('helvetica', 'bold'); pdf.text('Payment Receipt', 18, 61);
  const rows = [
    ['Student Name', details.name || 'Student'], ['Student ID', details.studentId || 'N/A'],
    ['Academic Domain', details.domain || 'N/A'], ['Receipt Reference', details.reference || `PSA-${details.paymentId || Date.now()}`],
    ['Transaction ID', details.paymentId || 'N/A'], ['Order ID', details.orderId || 'N/A'],
    ['Previous Amount Paid', `INR ${Number(details.previousPaid || 0).toLocaleString('en-IN')}`], ['Current Payment', `INR ${amount}`],
    ['Total Amount Paid', `INR ${Number(details.totalPaid || details.amount || 0).toLocaleString('en-IN')}`], ['Remaining Fees', `INR ${Number(details.remainingFees || 0).toLocaleString('en-IN')}`],
    ['Payment Type', details.paymentType || 'Fee Payment'], ['Date & Time', details.dateTime || stamp.toLocaleString('en-IN')], ['Payment Status', 'SUCCESS / VERIFIED']
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

window.showPaymentReceiptDownload = function (details) {
  sessionStorage.setItem('pinnacle_last_receipt', JSON.stringify(details));
  let area = document.getElementById('receiptDownloadArea');
  if (!area) return;
  area.style.display = 'block';

  const amount = Number(details.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalPaid = Number(details.totalPaid || details.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const remainingFees = Number(details.remainingFees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const previousPaid = Number(details.previousPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  area.innerHTML = `
    <div class="receipt-preview-card">
      <div class="receipt-header">
        <div class="receipt-institute-name">Pinnacle Scholars Academy</div>
        <div class="receipt-title">Official Fee Payment Receipt</div>
        <div class="receipt-reference">Ref: ${details.reference || `PSA-${details.paymentId || Date.now()}`}</div>
      </div>

      <div class="receipt-status">PAID / SUCCESS</div>

      <div class="receipt-details">
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Student Name</span>
          <span class="receipt-detail-value">${details.name || 'Student'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Student ID</span>
          <span class="receipt-detail-value">${details.studentId || 'N/A'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Academic Domain</span>
          <span class="receipt-detail-value">${details.domain || 'N/A'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Transaction ID</span>
          <span class="receipt-detail-value highlight">${details.paymentId || 'N/A'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Order ID</span>
          <span class="receipt-detail-value">${details.orderId || 'N/A'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Payment Type</span>
          <span class="receipt-detail-value">${details.paymentType || 'Fee Payment'}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Previous Amount Paid</span>
          <span class="receipt-detail-value">₹${previousPaid}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Current Payment</span>
          <span class="receipt-detail-value highlight">₹${amount}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Total Amount Paid</span>
          <span class="receipt-detail-value">₹${totalPaid}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Remaining Fees</span>
          <span class="receipt-detail-value">₹${remainingFees}</span>
        </div>
        <div class="receipt-detail-row">
          <span class="receipt-detail-label">Date & Time</span>
          <span class="receipt-detail-value">${details.dateTime || new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="receipt-amount-section">
        <div class="receipt-amount-label">Total Paid Amount</div>
        <div class="receipt-amount-value"><span class="receipt-amount-currency">₹</span>${totalPaid}</div>
      </div>

      <div class="receipt-footer">
        <div class="receipt-footer-text">This system-generated receipt confirms a successful Razorpay verification.</div>
        <div class="receipt-footer-copyright">&copy; 2026 Pinnacle Scholars Academy, Noida. All Rights Reserved.</div>
      </div>
    </div>
    <button type="button" class="receipt-download-btn">Download Fees Receipt (PDF)</button>
  `;

  const downloadBtn = area.querySelector('.receipt-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => window.downloadPaymentReceipt(details));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  try { const data = JSON.parse(sessionStorage.getItem('pinnacle_last_receipt')); if (data) window.showPaymentReceiptDownload(data); } catch { /* no prior receipt */ }
});
