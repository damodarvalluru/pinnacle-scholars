async function checkResult(){

    const studentId =
        document.getElementById("roll-input").value.trim();

    const dob =
        document.getElementById("dob-input").value;

    if(!studentId || !dob){

        showResultPopup(
            "Missing Details",
            "Please enter Student ID and Date of Birth."
        );

        return;
    }

    try{

        // VERIFY STUDENT

        const studentResponse =
            await fetch(
                `https://pinnacle-backend-5i7n.onrender.com/api/students/${studentId}`
            );

        const studentData =
            await studentResponse.json();

        if(
            !studentData.success ||
            !studentData.student
        ){

            showResultPopup(
                "Student Not Found",
                "Invalid Student ID."
            );

            return;
        }
       // FETCH RESULT
        const resultResponse =
await fetch(
`https://pinnacle-backend-5i7n.onrender.com/api/tests/result/${studentId}?dob=${encodeURIComponent(dob)}`
);
        const resultData =
            await resultResponse.json();

        if(
            !resultData.success ||
            !resultData.results ||
            resultData.results.length === 0
        ){

            showResultPopup(
                "Result Not Found",
                "No result found."
            );

            return;
        }

        const matchedResult =
            resultData.results[0];

        const totalMarks =
            matchedResult.total_marks;

        const percentage =
            (
                matchedResult.score /
                totalMarks
            ) * 100;

        let performanceMessage = "";

        if(percentage >= 90){

            performanceMessage =
                "Outstanding Performance";

        }else if(percentage >= 75){

            performanceMessage =
                "Excellent Performance";

        }else if(percentage >= 60){

            performanceMessage =
                "Good Performance";

        }else if(percentage >= 40){

            performanceMessage =
                "Average Performance";

        }else{

            performanceMessage =
                "Needs Improvement";
        }

        // Cache the last looked-up result so the new "Download Result"
        // certificate button (below) can render it without a second
        // network round-trip. Purely additive — nothing above changed.
        window.__lastResultRecord = {
            matchedResult, totalMarks, percentage, performanceMessage
        };

        showResultPopup(
            "Result Found",
            `
            <div style="text-align:left;line-height:2;">

                <h2 style="
                    color:#f59e0b;
                    text-align:center;
                ">
                    Pinnacle Scholars Academy
                </h2>

                <p>
                    <strong>Student ID :</strong>
                    ${matchedResult.student_id}
                </p>

                <p>
                    <strong>Name :</strong>
                    ${matchedResult.student_name}
                </p>

                <p>
                    <strong>Test ID :</strong>
                    ${matchedResult.test_id}
                </p>

                <p>
                    <strong>Score :</strong>
                    ${matchedResult.score}/${totalMarks}
                </p>

                <p>
                    <strong>Percentage :</strong>
                    ${percentage.toFixed(2)}%
                </p>

                <p>
                    <strong>Performance :</strong>
                    ${performanceMessage}
                </p>

                <p>
                    <strong>Submitted On :</strong>
                    ${matchedResult.submitted_at}
                </p>

            </div>
            `,
            true
        );

    }catch(err){

        console.error(err);

        showResultPopup(
            "Server Error",
            "Unable to fetch result."
        );
    }
}
/* PROFESSIONAL RESULT POPUP */

function showResultPopup(title, message, showDownload){

    // REMOVE EXISTING POPUP

    const existing =
        document.getElementById("resultPopupOverlay");

    if(existing) existing.remove();

    // CREATE OVERLAY

    const overlay = document.createElement("div");

    overlay.id = "resultPopupOverlay";

    overlay.innerHTML = `

    <div id="resultPopupBox">

        <div class="popup-glow"></div>

        <h1>${title}</h1>

        <div class="popup-content">

            ${message}

        </div>

        ${ showDownload ? `
        <button class="download-result-btn" onclick="downloadResultCertificate()">
            📄 Download Result
        </button>
        ` : `` }

        <button onclick="closeResultPopup()">

            Close

        </button>

    </div>
    `;

    document.body.appendChild(overlay);

    if(title === "Result Found"){
        document.getElementById('resultPopupBox').classList.add('celebrate');
    }

}

/* ==========================================================
   PROFESSIONAL DOWNLOADABLE RESULT CERTIFICATE
   Opens a print-ready, certificate-style layout (Burgundy &
   Platinum theme, matching this portal) in a new tab so the
   student can save it as a PDF via the browser's print dialog.
   Uses the cached lookup from checkResult() — no extra API call.
   ========================================================== */
function downloadResultCertificate(){

    const record = window.__lastResultRecord;

    if(!record){
        showResultPopup("No Result Loaded", "Please search for a result first.");
        return;
    }

    const { matchedResult, totalMarks, percentage, performanceMessage } = record;

    const issuedOn = new Date().toLocaleDateString('en-IN', {
        year:'numeric', month:'long', day:'numeric'
    });

    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
        <head>
            <title>Pinnacle Scholars Academy — Result Certificate</title>
            <style>
                @page{ size:A4; margin:14mm; }
                *{ box-sizing:border-box; }
                body{
                    font-family:'Segoe UI', Arial, sans-serif;
                    color:#1e1425;
                    padding:0;
                    margin:0;
                    background:#ffffff;
                }
                .certificate{
                    position:relative;
                    border:2px solid #9f2247;
                    border-radius:10px;
                    padding:40px 46px;
                    overflow:hidden;
                }
                .certificate::before{
                    content:"";
                    position:absolute;
                    inset:8px;
                    border:1px solid #cda86a;
                    border-radius:6px;
                    pointer-events:none;
                }
                .watermark{
                    position:absolute;
                    top:50%; left:50%;
                    transform:translate(-50%,-50%) rotate(-28deg);
                    font-size:70px;
                    font-weight:900;
                    color:rgba(159,34,71,0.05);
                    white-space:nowrap;
                    letter-spacing:6px;
                    z-index:0;
                }
                .cert-header{
                    text-align:center;
                    border-bottom:2px solid #9f2247;
                    padding-bottom:14px;
                    margin-bottom:22px;
                    position:relative;
                    z-index:1;
                }
                .cert-header h1{
                    margin:0;
                    color:#9f2247;
                    font-size:26px;
                    letter-spacing:1px;
                    text-transform:uppercase;
                }
                .cert-header p{
                    margin:6px 0 0;
                    color:#6b7280;
                    font-size:13px;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    font-weight:600;
                }
                .cert-title{
                    text-align:center;
                    font-size:15px;
                    font-weight:700;
                    letter-spacing:1px;
                    color:#374151;
                    text-transform:uppercase;
                    margin-bottom:26px;
                    position:relative; z-index:1;
                }
                table.result-table{
                    width:100%;
                    border-collapse:collapse;
                    position:relative;
                    z-index:1;
                    margin-bottom:26px;
                }
                table.result-table td{
                    padding:12px 14px;
                    border-bottom:1px solid #e5e0e6;
                    font-size:14px;
                }
                table.result-table td.label{
                    color:#6b7280;
                    font-weight:600;
                    text-transform:uppercase;
                    letter-spacing:0.5px;
                    font-size:11px;
                    width:38%;
                }
                table.result-table td.value{
                    color:#111827;
                    font-weight:700;
                }
                .score-banner{
                    text-align:center;
                    background:linear-gradient(135deg,#c23b5f,#9f2247);
                    color:#ffffff;
                    border-radius:10px;
                    padding:18px;
                    margin-bottom:26px;
                    position:relative; z-index:1;
                }
                .score-banner .score-main{
                    font-size:30px;
                    font-weight:900;
                }
                .score-banner .score-sub{
                    font-size:13px;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                    opacity:0.9;
                    margin-top:4px;
                }
                .cert-footer{
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-end;
                    margin-top:36px;
                    position:relative; z-index:1;
                }
                .cert-footer .issued{
                    font-size:12px;
                    color:#6b7280;
                }
                .cert-footer .signature{
                    text-align:center;
                    font-size:12px;
                    color:#374151;
                }
                .cert-footer .signature .line{
                    width:170px;
                    border-top:1px solid #9f2247;
                    margin-bottom:6px;
                }
                @media print{
                    .no-print{ display:none; }
                }
                .no-print{
                    text-align:center;
                    margin:18px 0;
                }
                .no-print button{
                    background:linear-gradient(135deg,#c23b5f,#9f2247);
                    color:#fff;
                    border:none;
                    padding:12px 26px;
                    border-radius:8px;
                    font-weight:700;
                    cursor:pointer;
                    font-size:14px;
                }
            </style>
        </head>
        <body>

            <div class="no-print">
                <button onclick="window.print()">🖨️ Print / Save as PDF</button>
            </div>

            <div class="certificate">
                <div class="watermark">PINNACLE</div>

                <div class="cert-header">
                    <h1>Pinnacle Scholars Academy</h1>
                    <p>Official Academic Result Certificate</p>
                </div>

                <div class="cert-title">Statement of Marks — ${matchedResult.test_id}</div>

                <table class="result-table">
                    <tr>
                        <td class="label">Student ID</td>
                        <td class="value">${matchedResult.student_id}</td>
                    </tr>
                    <tr>
                        <td class="label">Student Name</td>
                        <td class="value">${matchedResult.student_name}</td>
                    </tr>
                    <tr>
                        <td class="label">Test / Exam ID</td>
                        <td class="value">${matchedResult.test_id}</td>
                    </tr>
                    <tr>
                        <td class="label">Marks Obtained</td>
                        <td class="value">${matchedResult.score} / ${totalMarks}</td>
                    </tr>
                    <tr>
                        <td class="label">Submitted On</td>
                        <td class="value">${matchedResult.submitted_at}</td>
                    </tr>
                </table>

                <div class="score-banner">
                    <div class="score-main">${percentage.toFixed(2)}%</div>
                    <div class="score-sub">${performanceMessage}</div>
                </div>

                <div class="cert-footer">
                    <div class="issued">Issued on ${issuedOn}<br>This is a computer-generated document.</div>
                    <div class="signature">
                        <div class="line"></div>
                        Registrar, Pinnacle Scholars Academy
                    </div>
                </div>
            </div>

        </body>
        </html>
    `);

    printWindow.document.close();
}

/* CLOSE POPUP */

function closeResultPopup(){

    const popup =
        document.getElementById("resultPopupOverlay");

    if(popup){

        popup.remove();
    }
}