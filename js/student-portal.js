 let activeSessionUserObject = null;

    async function checkLogin() {
    const id = document.getElementById('loginId').value.trim();
    const dob = document.getElementById('loginDob').value;
    const loginBtn = document.getElementById("studentLoginBtn");
    loginBtn.disabled = true;
    loginBtn.innerText = "Authenticating...";
    if (!id || !dob) {
        alert("Please enter ID and DOB");
        loginBtn.disabled = false;
        loginBtn.innerText = "Login to Dashboard";
        return;
    }
    try {
        if(!/^PS-[A-Z]\/?[A-Z]?-\d{4}-\d+$/.test(id)){
            alert("Invalid Enrollment ID format.");
            loginBtn.disabled = false;
            loginBtn.innerText = "Login to Dashboard";
        return;
}
        const response = await fetch(
            'https://pinnacle-backend-5i7n.onrender.com/api/students/login',
            { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: id, dob }) }
        );
        const data = await response.json();
        if (!data.success || !data.student) {
            alert("Student not found");
            loginBtn.disabled = false;
            loginBtn.innerText = "Login to Dashboard";
            return;
        }
        const user = data.student;console.log(user);
        activeSessionUserObject = user;
        if (window.PinnacleSession) PinnacleSession.start('student', 'portal');
        localStorage.setItem("active_student_id",user.student_id);
        localStorage.setItem("active_student_name",user.name);
        const totalFees = Number(user.total_fees || 0);
        const feesPaid = Number(user.fees_paid || 0);
        const remainingFees = Number(user.remaining_fees || 0);
        document.getElementById('loginArea').style.display = "none";
        document.getElementById('dashboardArea').style.display = "block";
        document.getElementById('dispName').innerText = user.name || "N/A";
        document.getElementById('dispId').innerText = user.student_id || "N/A";
        document.getElementById('dispDomain').innerText = user.domain || "N/A";
        document.getElementById('dispTotal').innerText = totalFees.toFixed(2);
        document.getElementById('dispPaid').innerText = feesPaid.toFixed(2);
        document.getElementById('dispBalance').innerText = remainingFees.toFixed(2);
        document.getElementById('remainingFees').innerText = "₹" + remainingFees;
        activeSessionUserObject.calculatedBalance = remainingFees;
        if (remainingFees <= 0) {
            document.getElementById('dispStatus').innerText = "FULLY SETTLED & VERIFIED";
            document.getElementById('dispStatus').style.color = "#38a169";
            document.getElementById('portalPaymentButton').style.display = "none";
        }
        loadPortalHistories(user);
    }
    catch(error) {
        loginBtn.disabled = false;
        loginBtn.innerText = "Login to Dashboard";
        console.log(error);
        alert(
            "Unable to connect to server"
        );
    }
}

    // Converts the stored DOB into the plain YYYY-MM-DD form the backend
    // compares against the DATE column. The login response provides dob_date
    // (already the DB's calendar date), so that is preferred. The fallback
    // reads the local getters because the API serialises a raw DATE as a JS
    // Date at local midnight — a UTC conversion would shift it back a day.
    function portalDobForQuery(user) {
        if (!user) return '';
        if (typeof user.dob_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(user.dob_date)) {
            return user.dob_date;
        }
        const dob = user.dob;
        if (!dob) return '';
        if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
        const d = new Date(dob);
        if (isNaN(d.getTime())) return String(dob);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function escapePortalHtml(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function portalFormatDateTime(value) {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    async function loadPortalHistories(user) {
        const dob = portalDobForQuery(user);
        const studentId = user.student_id;
        await Promise.all([
            loadPortalPaymentHistory(studentId, dob, user),
            loadPortalResultHistory(studentId, dob)
        ]);
    }

    async function loadPortalPaymentHistory(studentId, dob, user) {
        const hint = document.getElementById('portalPaymentHistoryHint');
        const list = document.getElementById('portalPaymentHistoryList');
        if (!hint || !list) return;
        try {
            const res = await fetch(
                'https://pinnacle-backend-5i7n.onrender.com/api/payments/history/' +
                encodeURIComponent(studentId) + '?dob=' + encodeURIComponent(dob)
            );
            const data = await res.json();
            if (!data.success) {
                hint.textContent = data.message || 'Unable to load payment history.';
                return;
            }
            const payments = data.payments || [];
            if (payments.length === 0) {
                hint.textContent = 'No payments recorded yet.';
                return;
            }
            hint.textContent = payments.length + ' payment' + (payments.length > 1 ? 's' : '') + ' recorded.';
            list.innerHTML = payments.map(p => `
                <div class="portal-history-item">
                    <div class="portal-history-info">
                        <span class="portal-history-amount">₹${Number(p.amount_paid || 0).toFixed(2)}</span>
                        <span class="portal-history-meta">${escapePortalHtml(p.payment_type || 'Payment')} · ${escapePortalHtml(p.payment_status || '')}</span>
                        <span class="portal-history-meta">${escapePortalHtml(portalFormatDateTime(p.paid_at))}</span>
                        <span class="portal-history-txn">Txn: ${escapePortalHtml(p.razorpay_payment_id || 'N/A')}</span>
                    </div>
                    <button type="button" class="portal-history-btn"
                        data-payment-id="${escapePortalHtml(p.razorpay_payment_id || '')}"
                        data-amount="${escapePortalHtml(p.amount_paid || 0)}"
                        data-type="${escapePortalHtml(p.payment_type || 'Fee Payment')}"
                        data-order-id="${escapePortalHtml(p.razorpay_order_id || '')}"
                        onclick="portalDownloadReceipt(this)">Download Receipt</button>
                </div>`).join('');
        } catch (err) {
            console.error(err);
            hint.textContent = 'Unable to load payment history.';
        }
    }

    // Re-generates a receipt for a previously verified payment. Uses the same
    // receipt-generator.js helper as the fee portal, so the document matches.
    function portalDownloadReceipt(btn) {
        if (!activeSessionUserObject || !window.downloadPaymentReceipt) return;
        downloadPaymentReceipt({
            name: activeSessionUserObject.name,
            studentId: activeSessionUserObject.student_id,
            domain: activeSessionUserObject.domain,
            paymentId: btn.dataset.paymentId,
            orderId: btn.dataset.orderId,
            amount: Number(btn.dataset.amount || 0),
            paymentType: btn.dataset.type || 'Fee Payment'
        });
    }

    async function loadPortalResultHistory(studentId, dob) {
        const hint = document.getElementById('portalResultHistoryHint');
        const list = document.getElementById('portalResultHistoryList');
        if (!hint || !list) return;
        try {
            const res = await fetch(
                'https://pinnacle-backend-5i7n.onrender.com/api/tests/result/' +
                encodeURIComponent(studentId) + '?dob=' + encodeURIComponent(dob)
            );
            const data = await res.json();
            if (!data.success) {
                hint.textContent = data.message || 'Unable to load result history.';
                return;
            }
            const results = data.results || [];
            if (results.length === 0) {
                hint.textContent = 'No test results recorded yet.';
                return;
            }
            hint.textContent = results.length + ' result' + (results.length > 1 ? 's' : '') + ' recorded.';
            list.innerHTML = results.map(r => `
                <div class="portal-history-item portal-history-item--result">
                    <div class="portal-history-info">
                        <span class="portal-history-amount">${escapePortalHtml(r.score)} / ${escapePortalHtml(r.total_marks)}</span>
                        <span class="portal-history-meta">Test ID: ${escapePortalHtml(r.test_id)}</span>
                        <span class="portal-history-meta">${escapePortalHtml(portalFormatDateTime(r.submitted_at))}</span>
                    </div>
                    <button type="button" class="portal-history-btn"
                        data-test-id="${escapePortalHtml(r.test_id)}"
                        onclick="togglePortalReview(this, '${escapePortalHtml(studentId)}', '${escapePortalHtml(dob)}')">Review Answers</button>
                    <div class="portal-review-panel" hidden></div>
                </div>`).join('');
        } catch (err) {
            console.error(err);
            hint.textContent = 'Unable to load result history.';
        }
    }

    async function togglePortalReview(btn, studentId, dob) {
        const item = btn.closest('.portal-history-item');
        const panel = item ? item.querySelector('.portal-review-panel') : null;
        if (!panel) return;
        if (!panel.hidden) {
            panel.hidden = true;
            btn.textContent = 'Review Answers';
            return;
        }
        const testId = btn.dataset.testId;
        btn.disabled = true;
        btn.textContent = 'Loading…';
        panel.hidden = false;
        panel.innerHTML = '<p class="portal-history-hint">Loading review…</p>';
        try {
            const res = await fetch(
                'https://pinnacle-backend-5i7n.onrender.com/api/tests/review/' +
                encodeURIComponent(studentId) + '/' + encodeURIComponent(testId) +
                '?dob=' + encodeURIComponent(dob)
            );
            const data = await res.json();
            if (!data.success) {
                panel.innerHTML = '<p class="portal-history-hint">' +
                    escapePortalHtml(data.message || 'Unable to load review.') + '</p>';
                btn.disabled = false;
                btn.textContent = 'Hide Review';
                return;
            }
            if (!data.answersStored) {
                panel.innerHTML = '<p class="portal-history-hint">Answer details were not stored for this attempt, so a detailed review is unavailable.</p>';
                btn.disabled = false;
                btn.textContent = 'Hide Review';
                return;
            }
            const review = data.review || [];
            panel.innerHTML = review.map(q => {
                const cls = q.givenAnswer === null ? 'is-skipped' : (q.isCorrect ? 'is-correct' : 'is-wrong');
                const given = q.givenAnswer === null ? 'Not answered' : q.givenAnswer;
                return `
                    <div class="portal-review-question ${cls}">
                        <p class="portal-review-q"><strong>Q${q.index + 1}.</strong> ${escapePortalHtml(q.question)}</p>
                        <p class="portal-review-a">Your answer: <span>${escapePortalHtml(given)}</span></p>
                        <p class="portal-review-a">Correct answer: <span>${escapePortalHtml(q.correctAnswer)}</span></p>
                    </div>`;
            }).join('');
            btn.disabled = false;
            btn.textContent = 'Hide Review';
        } catch (err) {
            console.error(err);
            panel.innerHTML = '<p class="portal-history-hint">Unable to load review.</p>';
            btn.disabled = false;
            btn.textContent = 'Hide Review';
        }
    }
    function executeStudentPortalPayment() {
        const payBtn = document.getElementById("portalPaymentButton");
        payBtn.disabled = true;
        payBtn.innerText = "Creating Payment Order...";
        if (!activeSessionUserObject) {
            alert("Session assessment sync breakdown. Please log in again.");
            return;
        }

        const outstandingLiabilityAmount = activeSessionUserObject.calculatedBalance;

        if (outstandingLiabilityAmount <= 0) {
            alert("Account has zero pending liabilities.");
            return;
        }

        const calculatedPaiseUnits = Math.round(outstandingLiabilityAmount * 100);

        fetch('https://pinnacle-backend-5i7n.onrender.com/api/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: calculatedPaiseUnits,
                currency: 'INR',
                receipt: 'rcpt_portal_' + activeSessionUserObject.student_id + '_' + Date.now()
            })
        })
        .then(res => {
            if(!res.ok) throw new Error("Internal authentication pipeline rejection.");
            return res.json();
        })
        .then(orderPayload => {
            const checkoutConfigurations = {
                "key": "rzp_live_Su10APgukCxwdi", 
                "amount": orderPayload.amount,
                "currency": orderPayload.currency,
                "name": "Pinnacle Scholars Academy",
                "description": "Student Dashboard Balance Tuition Settlement",
                "order_id": orderPayload.order_id,
                "handler": function (paymentVerificationData) {
                    fetch('https://pinnacle-backend-5i7n.onrender.com/api/payments/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: paymentVerificationData.razorpay_order_id,
                            razorpay_payment_id: paymentVerificationData.razorpay_payment_id,
                            razorpay_signature: paymentVerificationData.razorpay_signature,
                            student_id: activeSessionUserObject.student_id,
                            payment_type: "STUDENT_PORTAL_PAYMENT",
                            paid_amount: outstandingLiabilityAmount
                        })
                    })
                    .then(verifyResponse => verifyResponse.json())
                    .then(verificationOutput => {
                        if (verificationOutput.success || verificationOutput.status === "verified") {
                            if (window.downloadPaymentReceipt) downloadPaymentReceipt({
                                name: activeSessionUserObject.name, studentId: activeSessionUserObject.student_id,
                                domain: activeSessionUserObject.domain, paymentId: paymentVerificationData.razorpay_payment_id,
                                orderId: paymentVerificationData.razorpay_order_id, amount: outstandingLiabilityAmount,
                                paymentType: 'Student Portal Fee Payment'
                            });
                            alert("Payment processed and verified successfully! ID: " + paymentVerificationData.razorpay_payment_id);
                           alert(
    "Payment verified and database updated successfully."
);
                            location.reload();
                        } else {
                            alert("Verification confirmation rejected by server security checklist.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("Cryptographic computation validation connection transmission link error.");
                    });
                },
                "prefill": {
                    "name": activeSessionUserObject.name,
                    "email": "student." + activeSessionUserObject.student_id.toLowerCase() + "@pinnacle.edu.in",
                    "contact": activeSessionUserObject.mobile || ""
                },
                "theme": { "color": "#1a365d" },
                "modal": {
                    "ondismiss": function() {
                           payBtn.disabled = false;
                           payBtn.innerText = "Pay Online Now";
                        alert("Transaction interface cancelled by student.");
                    }
                }
            };

            const portalRazorpayModalInstance = new Razorpay(checkoutConfigurations);
            portalRazorpayModalInstance.open();
        })
        .catch(err => {
            console.error(err);
            alert("Failed to build Order reference payload mappings. Check server status logs.");
        });
    }

    // This file is loaded in <head> before #portalGeometryCanvas exists, so the
    // background is started once the DOM is parsed instead of at parse time.
    function startPortalGeometryBackground() {
        const canvas = document.getElementById('portalGeometryCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let shapesArray = [];
        const shapeTypes = ['sphere', 'cube', 'torusRing'];
        // Fewer, lighter shapes on small screens for smoother mobile performance
        const totalShapesCount = window.innerWidth <= 768 ? 9 : 18; // Clean, premium distribution without visual overcrowding

        function dynamicCanvasResize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        dynamicCanvasResize();
        window.addEventListener('resize', dynamicCanvasResize);

        // Abstract Geometry Object Constructor Blueprint
        class Floating3DGeometry {
            constructor() {
                this.resetProperties(true);
            }

            resetProperties(isInitialSetup = false) {
                this.x = Math.random() * canvas.width;
                // Distribute vertically on initial launch, else spawn from below screen space boundary
                this.y = isInitialSetup ? (Math.random() * canvas.height) : (canvas.height + 100);
                this.size = Math.random() * 45 + 20; // Varied sizing scale
                this.speedY = -(Math.random() * 0.5 + 0.2); // Smooth upward drift velocity
                this.speedX = (Math.random() * 0.4) - 0.2; // Slight horizontal oscillation
                this.shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
                
                // Rotational physics for pseudo-3D engine illusion
                this.rotationAngle = Math.random() * Math.PI * 2;
                this.rotationVelocity = (Math.random() * 0.01) - 0.005;
                
                // Translucent premium neon lighting accents
                this.gradientColorPrimary = Math.random() > 0.5 ? 'rgba(251, 113, 133, 0.22)' : 'rgba(34, 211, 238, 0.18)';
                this.gradientColorSecondary = 'rgba(15, 23, 42, 0.4)';
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotationAngle += this.rotationVelocity;

                // Recycle shape to bottom tracking pool once completely off-screen top border
                if (this.y + this.size < -50 || this.x + this.size < -50 || this.x - this.size > canvas.width + 50) {
                    this.resetProperties(false);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotationAngle);

                // Initialize sleek glassmorphic pseudo-3D shading engine
                let coreGradientMesh = ctx.createRadialGradient(
                    -this.size * 0.2, -this.size * 0.2, this.size * 0.1,
                    0, 0, this.size
                );
                coreGradientMesh.addColorStop(0, this.gradientColorPrimary);
                coreGradientMesh.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
                coreGradientMesh.addColorStop(1, this.gradientColorSecondary);

                ctx.fillStyle = coreGradientMesh;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1.5;

                // Render vector-specific geometric profiles
                switch(this.shapeType) {
                    case 'sphere':
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        
                        // Internal glassy reflection accent crescent arc
                        ctx.beginPath();
                        ctx.arc(-this.size * 0.1, -this.size * 0.1, this.size * 0.7, Math.PI * 1.2, Math.PI * 1.8);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                        ctx.stroke();
                        break;

                    case 'cube':
                        ctx.beginPath();
                        ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
                        ctx.fill();
                        ctx.stroke();

                        // Isometric crosswire projections to mimic transparent glass 3D depth dimensions
                        ctx.beginPath();
                        ctx.moveTo(-this.size, -this.size);
                        ctx.lineTo(this.size, this.size);
                        ctx.moveTo(this.size, -this.size);
                        ctx.lineTo(-this.size, this.size);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                        ctx.stroke();
                        break;

                    case 'torusRing':
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                        ctx.arc(0, 0, this.size * 0.45, 0, Math.PI * 2, true); // Clean doughnut cutout stroke mask
                        ctx.fill();
                        ctx.stroke();
                        break;
                }

                ctx.restore();
            }
        }

        function buildRenderEnvironment() {
            shapesArray = [];
            for (let i = 0; i < totalShapesCount; i++) {
                shapesArray.push(new Floating3DGeometry());
            }
        }

        function coreEngineLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < shapesArray.length; i++) {
                shapesArray[i].update();
                shapesArray[i].draw();
            }
            
            requestAnimationFrame(coreEngineLoop);
        }

        buildRenderEnvironment();
        coreEngineLoop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPortalGeometryBackground);
    } else {
        startPortalGeometryBackground();
    }

    // Removes the decorative briefcase-arrival overlay from paint once its
    // fade-out animation finishes. Purely cosmetic cleanup - it does not touch
    // login/dashboard logic, and the overlay never blocks clicks either way
    // since it is pointer-events:none for its entire lifetime.
    (function cleanupBriefcaseIntro() {
        const intro = document.getElementById('briefcaseIntro');
        if (!intro) return;
        intro.addEventListener('animationend', (e) => {
            if (e.target === intro) intro.classList.add('briefcase-intro--done');
        });
    })();

    // Student Portal flip-card: rotates the single card between the login face
    // and the enrollment face. The enrollment face is NOT a second form - it
    // embeds enrollment.html in an iframe, so the real registration fields,
    // their ids, their validation and their backend call all stay in
    // enrollment.html exactly as they were. Nothing here duplicates a field.
    // checkLogin() and the dashboard logic above are untouched.
    function toggleStudentAuthViews(showRegister) {

        const flip = document.getElementById('studentAuthFlip');

        if (!flip) {
            // Fallback: no wrapper, so behave like the original plain link.
            window.location.href = 'enrollment.html';
            return;
        }

        flip.classList.toggle('is-flipped', !!showRegister);

        if (typeof window.syncFlipHeight === 'function') {
            window.syncFlipHeight(flip);
        }

        // The two faces are very different heights, so return to the top of
        // the card after rotating - otherwise the shorter login face can end
        // up scrolled off screen.
        const stage = document.getElementById('studentAuthFlipStage');
        if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

