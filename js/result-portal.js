async function checkResult() {
    const studentIdInput = document.getElementById("roll-input");
    const dobInput = document.getElementById("dob-input");
    const studentId = studentIdInput ? studentIdInput.value.trim() : "";
    const dob = dobInput ? dobInput.value : "";
    
    if (!studentId || !dob) {
        return showResultPopup("Missing details", "Please enter Student ID and Date of Birth.");
    }

    const submitBtn = document.querySelector("#resultPortalForm button[type='submit']") || document.querySelector("form.card button.btn");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Search Result';

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="verifying-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:btnSpinner 0.8s linear infinite;margin-right:6px;vertical-align:middle;"></span> Verifying...`;
        }

        const studentResponse = await fetch(`https://pinnacle-backend-5i7n.onrender.com/api/students/${studentId}`);
        const studentData = await studentResponse.json();
        if (!studentData.success || !studentData.student) {
            return showResultPopup("Student not found", "Invalid Student ID.");
        }

        const resultResponse = await fetch(`https://pinnacle-backend-5i7n.onrender.com/api/tests/result/${studentId}?dob=${encodeURIComponent(dob)}`);
        const resultData = await resultResponse.json();
        if (!resultData.success || !resultData.results || !resultData.results.length) {
            return showResultPopup("Result not found", "No result found for the provided details.");
        }

        if (window.PinnacleSession) PinnacleSession.start("student", "result");

        const matchedResult = resultData.results[0];
        const studentObj = studentData.student || {};
        const totalMarks = Number(matchedResult.total_marks) || 100;
        const rawScore = Number(matchedResult.score) || 0;
        const percentage = totalMarks > 0 ? (rawScore / totalMarks) * 100 : 0;
        
        let performanceMessage = "Poor";
        if (percentage >= 90) performanceMessage = "Outstanding";
        else if (percentage >= 80) performanceMessage = "Excellent";
        else if (percentage >= 70) performanceMessage = "Very Good";
        else if (percentage >= 60) performanceMessage = "Good";
        else if (percentage >= 40) performanceMessage = "Needs Improvement";

        window.__lastResultRecord = { matchedResult, studentObj, totalMarks, percentage, performanceMessage };
        showResultCard();
    } catch (err) {
        console.error(err);
        showResultPopup("Server error", "Unable to fetch result right now. Please try again later.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

function resultCardMarkup(record) {
    const { matchedResult, studentObj, totalMarks, percentage, performanceMessage } = record;
    const formattedDate = matchedResult.submitted_at ? new Date(matchedResult.submitted_at).toLocaleString() : 'N/A';
    
    return `<article class="a4-result-card" id="printableResultCard">
        <div class="result-watermark">PINNACLE</div>
        <header class="result-card-header">
            <div class="academy-mark" style="display:flex;align-items:center;justify-content:center;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <div>
                <span>PINNACLE SCHOLARS ACADEMY</span>
                <small>Official Academic Result Card</small>
            </div>
            <div class="verified-mark" style="display:flex;align-items:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#15803d" style="margin-right:4px;">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                Verified & Authenticated
            </div>
        </header>

        <section class="result-card-title">
            <p>Official Statement of Marks</p>
            <h1>${matchedResult.test_id}</h1>
        </section>

        <section class="student-result-details">
            <div><span>Student ID</span><strong>${matchedResult.student_id}</strong></div>
            <div><span>Student Name</span><strong>${matchedResult.student_name || studentObj.name || 'N/A'}</strong></div>
            <div><span>Academic Domain</span><strong>${studentObj.domain || 'Scholarship Track'}</strong></div>
            <div><span>Assessment Title</span><strong>${matchedResult.test_id}</strong></div>
            <div><span>Submission Date & Time</span><strong>${formattedDate}</strong></div>
            <div><span>Result Verification Status</span><strong style="color:#15803d;">PASS / RECORDED</strong></div>
        </section>

        <section class="result-score-panel">
            <div><span>Marks Obtained</span><strong>${matchedResult.score} <small>/ ${totalMarks}</small></strong></div>
            <div><span>Percentage</span><strong>${percentage.toFixed(2)}%</strong></div>
            <div><span>Performance Level</span><strong>${performanceMessage}</strong></div>
        </section>

        <footer class="result-card-footer">
            <span>Computer-Generated Official Transcript</span>
            <div class="result-signature">
                <svg class="registrar-sig-svg" width="160" height="46" viewBox="0 0 200 58" style="display:block;margin:0 auto 3px;">
                    <path d="M 12 48 C 15 30, 23 40, 27 19 C 31 6, 41 46, 47 26 C 53 10, 61 42, 67 27 C 73 15, 81 41, 88 26 C 95 12, 105 7, 113 10 C 120 13, 126 20, 131 27 C 136 34, 134 42, 127 38 C 133 15, 143 34, 150 24 C 157 14, 165 34, 172 24 C 178 15, 185 20, 188 17" fill="none" stroke="#0b3d91" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 16 42 C 56 56, 128 56, 170 34 C 177 30, 184 27, 188 24" fill="none" stroke="#0b3d91" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="13" cy="45" r="2.2" fill="#0b3d91"/>
                </svg>
                <i></i>
                <span class="signature-script" style="font-family:'Snell Roundhand','Segoe Script','Brush Script MT',cursive,Georgia,serif;font-style:italic;color:#1e3a8a;">Damodar Valluru</span>
                <strong>Academic Registrar</strong>
                <small>Pinnacle Scholars Academy</small>
            </div>
        </footer>
    </article>`;
}

function showResultCard() {
    const existing = document.getElementById("resultPopupOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "resultPopupOverlay";
    overlay.className = "result-card-overlay";
    overlay.innerHTML = `
        <div class="result-viewer">
            <div class="result-viewer-toolbar">
                <span>Result Card Ready</span>
                <div>
                    <button type="button" onclick="printResultCertificate()">🖨 Print</button>
                    <button type="button" onclick="downloadResultCertificate()">⇩ Download Result</button>
                    <button type="button" class="close-result-btn" onclick="closeResultPopup()">Close ×</button>
                </div>
            </div>
            ${resultCardMarkup(window.__lastResultRecord)}
        </div>`;
    document.body.appendChild(overlay);
}

function showResultPopup(title, message) {
    const existing = document.getElementById("resultPopupOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "resultPopupOverlay";
    overlay.className = "result-card-overlay";
    overlay.innerHTML = `
        <div class="result-message-card">
            <div class="academy-mark" style="display:grid;place-items:center;">!</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <button type="button" class="close-result-btn" onclick="closeResultPopup()">Close</button>
        </div>`;
    document.body.appendChild(overlay);
}

function openResultDocument(autoPrint) {
    const record = window.__lastResultRecord;
    if (!record) return showResultPopup("No result loaded", "Please search for a result first.");
    const page = window.open("", "_blank");
    if (!page) return;
    page.document.write(`<!doctype html><html><head><title>Pinnacle Scholars Academy — Result</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#fff;font-family:Arial,sans-serif;color:#102a43}.a4-result-card{position:relative;width:210mm;min-height:297mm;padding:18mm;overflow:hidden;border:3mm solid #0b3d91;background:linear-gradient(145deg,#fff 0%,#f5faff 100%)}.result-watermark{position:absolute;top:43%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-size:40mm;font-weight:900;letter-spacing:4mm;color:#0b3d9109}.result-card-header,.result-card-footer{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between}.academy-mark{display:grid;place-items:center;width:15mm;height:15mm;border-radius:50%;background:#0b3d91;color:#fff;font-size:8mm;font-weight:bold}.result-card-header>div:nth-child(2){flex:1;margin-left:5mm}.result-card-header span{display:block;font-weight:900;font-size:6mm;letter-spacing:.5mm;color:#0b3d91}.result-card-header small,.result-card-footer small{display:block;color:#64748b;font-size:3mm;letter-spacing:.4mm;text-transform:uppercase;margin-top:1mm}.verified-mark{color:#15803d;font-size:3mm;font-weight:bold}.result-card-title{text-align:center;position:relative;z-index:1;margin:25mm 0 15mm}.result-card-title p{margin:0;color:#64748b;text-transform:uppercase;letter-spacing:1mm;font-size:3mm}.result-card-title h1{font-size:7mm;color:#102a43;margin:3mm 0}.student-result-details{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;border:1px solid #cbd5e1;border-radius:3mm;overflow:hidden}.student-result-details div{padding:5mm;border-bottom:1px solid #e2e8f0}.student-result-details div:nth-child(odd){border-right:1px solid #e2e8f0}.student-result-details span,.result-score-panel span{display:block;text-transform:uppercase;letter-spacing:.5mm;color:#64748b;font-size:2.6mm;font-weight:bold}.student-result-details strong{font-size:4mm;color:#102a43;margin-top:1mm;display:block}.result-score-panel{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);margin-top:12mm;border-radius:3mm;overflow:hidden;background:#0b3d91;color:#fff}.result-score-panel div{padding:8mm 5mm;text-align:center;border-right:1px solid #ffffff44}.result-score-panel div:last-child{border:0}.result-score-panel span{color:#bfdbfe}.result-score-panel strong{display:block;font-size:6mm;margin-top:2mm}.result-score-panel strong small{font-size:3mm}.result-card-footer{position:absolute;left:18mm;right:18mm;bottom:18mm;border-top:1px solid #cbd5e1;padding-top:6mm;color:#64748b;font-size:3mm}.result-card-footer div{text-align:center;color:#102a43}.result-card-footer i{display:block;width:42mm;border-top:1px solid #0b3d91;margin:0 auto 2mm}.signature-script{display:block;font-size:5mm;font-weight:500;color:#1e3a8a;margin-bottom:1mm}@media print{body{background:#fff}}</style></head><body>${resultCardMarkup(record)}</body></html>`);
    page.document.close();
    if (autoPrint) setTimeout(() => page.print(), 250);
}

function printResultCertificate() {
    openResultDocument(true);
}

function downloadResultCertificate() {
    const element = document.getElementById("printableResultCard");
    if (!element) return showResultPopup("Error", "Result card is not currently loaded.");
    
    const record = window.__lastResultRecord || {};
    const studentId = record.matchedResult?.student_id || 'Student';
    const testId = record.matchedResult?.test_id || 'Result';
    const fileName = `Pinnacle_Result_${studentId}_${testId}.pdf`;

    if (typeof window.html2pdf === 'function') {
        const opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().set(opt).from(element).save();
    } else {
        openResultDocument(false);
    }
}

function closeResultPopup() {
    document.getElementById("resultPopupOverlay")?.remove();
}
