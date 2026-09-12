async function checkResult() {
    const studentId = document.getElementById("roll-input").value.trim();
    const dob = document.getElementById("dob-input").value;
    if (!studentId || !dob) return showResultPopup("Missing details", "Please enter Student ID and Date of Birth.");
    try {
        const studentResponse = await fetch(`https://pinnacle-backend-5i7n.onrender.com/api/students/${studentId}`);
        const studentData = await studentResponse.json();
        if (!studentData.success || !studentData.student) return showResultPopup("Student not found", "Invalid Student ID.");
        const resultResponse = await fetch(`https://pinnacle-backend-5i7n.onrender.com/api/tests/result/${studentId}?dob=${encodeURIComponent(dob)}`);
        const resultData = await resultResponse.json();
        if (!resultData.success || !resultData.results || !resultData.results.length) return showResultPopup("Result not found", "No result found.");
        if (window.PinnacleSession) PinnacleSession.start("student", "result");
        const matchedResult = resultData.results[0];
        const totalMarks = matchedResult.total_marks;
        const percentage = (matchedResult.score / totalMarks) * 100;
        const performanceMessage = percentage >= 90 ? "Outstanding Performance" : percentage >= 75 ? "Excellent Performance" : percentage >= 60 ? "Good Performance" : percentage >= 40 ? "Average Performance" : "Needs Improvement";
        window.__lastResultRecord = { matchedResult, totalMarks, percentage, performanceMessage };
        showResultCard();
    } catch (err) {
        console.error(err);
        showResultPopup("Server error", "Unable to fetch result.");
    }
}

function resultCardMarkup(record) {
    const { matchedResult, totalMarks, percentage, performanceMessage } = record;
    return `<article class="a4-result-card" id="printableResultCard">
        <div class="result-watermark">PINNACLE</div>
        <header class="result-card-header"><div class="academy-mark">✦</div><div><span>PINNACLE SCHOLARS ACADEMY</span><small>Official academic result card</small></div><div class="verified-mark">✓ Verified</div></header>
        <section class="result-card-title"><p>Statement of Marks</p><h1>${matchedResult.test_id}</h1></section>
        <section class="student-result-details"><div><span>Student ID</span><strong>${matchedResult.student_id}</strong></div><div><span>Student Name</span><strong>${matchedResult.student_name}</strong></div><div><span>Assessment</span><strong>${matchedResult.test_id}</strong></div><div><span>Submitted on</span><strong>${matchedResult.submitted_at}</strong></div></section>
        <section class="result-score-panel"><div><span>Marks obtained</span><strong>${matchedResult.score} <small>/ ${totalMarks}</small></strong></div><div><span>Percentage</span><strong>${percentage.toFixed(2)}%</strong></div><div><span>Performance</span><strong>${performanceMessage}</strong></div></section>
        <footer class="result-card-footer"><span>Computer-generated result card</span><div><i></i><strong>Academic Registrar</strong><small>Pinnacle Scholars Academy</small></div></footer>
    </article>`;
}

function showResultCard() {
    const existing = document.getElementById("resultPopupOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "resultPopupOverlay";
    overlay.className = "result-card-overlay";
    overlay.innerHTML = `<div class="result-viewer"><div class="result-viewer-toolbar"><span>Result ready</span><div><button type="button" onclick="printResultCertificate()">🖨 Print</button><button type="button" onclick="downloadResultCertificate()">⇩ Download</button><button type="button" class="close-result-btn" onclick="closeResultPopup()">Close ×</button></div></div>${resultCardMarkup(window.__lastResultRecord)}</div>`;
    document.body.appendChild(overlay);
}

function showResultPopup(title, message) {
    const existing = document.getElementById("resultPopupOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "resultPopupOverlay";
    overlay.className = "result-card-overlay";
    overlay.innerHTML = `<div class="result-message-card"><div class="academy-mark">!</div><h1>${title}</h1><p>${message}</p><button type="button" class="close-result-btn" onclick="closeResultPopup()">Close</button></div>`;
    document.body.appendChild(overlay);
}

function openResultDocument(autoPrint) {
    const record = window.__lastResultRecord;
    if (!record) return showResultPopup("No result loaded", "Please search for a result first.");
    const page = window.open("", "_blank");
    if (!page) return;
    page.document.write(`<!doctype html><html><head><title>Pinnacle Scholars Academy — Result</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#fff;font-family:Arial,sans-serif;color:#102a43}.a4-result-card{position:relative;width:210mm;min-height:297mm;padding:18mm;overflow:hidden;border:3mm solid #0b3d91;background:linear-gradient(145deg,#fff 0%,#f5faff 100%)}.result-watermark{position:absolute;top:43%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-size:40mm;font-weight:900;letter-spacing:4mm;color:#0b3d9109}.result-card-header,.result-card-footer{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between}.academy-mark{display:grid;place-items:center;width:15mm;height:15mm;border-radius:50%;background:#0b3d91;color:#fff;font-size:8mm;font-weight:bold}.result-card-header>div:nth-child(2){flex:1;margin-left:5mm}.result-card-header span{display:block;font-weight:900;font-size:6mm;letter-spacing:.5mm;color:#0b3d91}.result-card-header small,.result-card-footer small{display:block;color:#64748b;font-size:3mm;letter-spacing:.4mm;text-transform:uppercase;margin-top:1mm}.verified-mark{color:#15803d;font-size:3mm;font-weight:bold}.result-card-title{text-align:center;position:relative;z-index:1;margin:25mm 0 15mm}.result-card-title p{margin:0;color:#64748b;text-transform:uppercase;letter-spacing:1mm;font-size:3mm}.result-card-title h1{font-size:7mm;color:#102a43;margin:3mm 0}.student-result-details{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;border:1px solid #cbd5e1;border-radius:3mm;overflow:hidden}.student-result-details div{padding:5mm;border-bottom:1px solid #e2e8f0}.student-result-details div:nth-child(odd){border-right:1px solid #e2e8f0}.student-result-details span,.result-score-panel span{display:block;text-transform:uppercase;letter-spacing:.5mm;color:#64748b;font-size:2.6mm;font-weight:bold}.student-result-details strong{font-size:4mm;color:#102a43;margin-top:1mm;display:block}.result-score-panel{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);margin-top:12mm;border-radius:3mm;overflow:hidden;background:#0b3d91;color:#fff}.result-score-panel div{padding:8mm 5mm;text-align:center;border-right:1px solid #ffffff44}.result-score-panel div:last-child{border:0}.result-score-panel span{color:#bfdbfe}.result-score-panel strong{display:block;font-size:6mm;margin-top:2mm}.result-score-panel strong small{font-size:3mm}.result-card-footer{position:absolute;left:18mm;right:18mm;bottom:18mm;border-top:1px solid #cbd5e1;padding-top:6mm;color:#64748b;font-size:3mm}.result-card-footer div{text-align:center;color:#102a43}.result-card-footer i{display:block;width:42mm;border-top:1px solid #0b3d91;margin:0 auto 2mm}@media print{body{background:#fff}}</style></head><body>${resultCardMarkup(record)}</body></html>`);
    page.document.close();
    if (autoPrint) setTimeout(() => page.print(), 250);
}
function printResultCertificate() { openResultDocument(true); }
function downloadResultCertificate() { openResultDocument(true); }
function closeResultPopup() { document.getElementById("resultPopupOverlay")?.remove(); }
