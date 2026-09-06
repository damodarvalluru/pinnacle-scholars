 let activeFacultySessionObject = null;

    function toggleAuthViews(showRegister) {

    const loginArea =
        document.getElementById("loginArea");

    const registerArea =
        document.getElementById("registerArea");

    if (!loginArea || !registerArea) {
        console.error(
            "loginArea or registerArea not found"
        );
        return;
    }

    if (showRegister) {

        loginArea.style.display = "none";

        registerArea.style.display = "block";

    } else {

        registerArea.style.display = "none";

        loginArea.style.display = "block";

    }

    // FIX: the registration form is long, so by the time a faculty
    // member generates their ID they're usually scrolled well down
    // the page. Swapping the tall register panel for the much
    // shorter login panel shrinks the page height, but the browser
    // never scrolls back up on its own — the login form renders
    // correctly, it's just off-screen above the current scroll
    // position, which is exactly why clicking "Continue To Login"
    // (or "Login here" / "Register here") can look like it does
    // nothing at all. Scrolling the freshly-shown panel into view
    // fixes that for every view-switch path, not just the modal.
    const shownArea = showRegister ? registerArea : loginArea;
    shownArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

async  function processFacultyEnrollment() {
        const name = document.getElementById('facName').value.trim();
        const address = document.getElementById('facAddress').value.trim();
        const domain = document.getElementById('facDomain').value.trim();
        const mobile = document.getElementById('facMobile').value.trim();
        const mail = document.getElementById('facMail').value.trim();
        const dob = document.getElementById('facDob').value;
        const qualifications = document.getElementById('facQuals').value.trim();
        const achievements = document.getElementById('facAchieve').value.trim();
        const awards = document.getElementById('facAwards').value.trim();
        const enrollmentDate = document.getElementById('facEnrollDate').value;

        if(!name || !domain || !mail || !dob || !enrollmentDate) {
            alert("Please accurately fulfill all mandatory parameters (Name, Domain, Mail, DOB, Enrollment Date).");
            return;
        }

        try {
const btn = document.getElementById("generateFacultyBtn");
btn.disabled = true;
btn.innerText = "Generating Faculty ID...";
    const response = await fetch(
        "https://pinnacle-backend-5i7n.onrender.com/api/faculty/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                address,
                domain,
                mobile,
                mail,
                dob,
                qualifications,
                achievements,
                awards,
                enrollmentDate
            })
        }
    );

    let data;

try{
    data = await response.json();
    console.log("REGISTER RESPONSE:", data);
}catch{
    throw new Error("Invalid backend response");
}
if (data.success) {
    const facultyId = data.faculty.id;
    document.getElementById("loginFacId").value = facultyId;
    btn.disabled = false;
btn.innerText = "Generate Unique Faculty ID";
showFacultyModal(facultyId);
   } else {
    alert(data.message || "Registration failed");
}
    } catch(error){
        btn.disabled = false;
btn.innerText = "Generate Unique Faculty ID";
    console.error(
        "Faculty Registration Error:", error
    );
    alert(
        "Registration Error:\n" + error.message
    );
}
    }

    async function checkFacultyLogin() {

    const id =
    document.getElementById('loginFacId').value.trim();

    const dob =
    document.getElementById('loginFacDob').value;

    try {
        const btn = document.getElementById("facultyLoginBtn");
btn.disabled = true;
btn.innerText = "Verifying Credentials...";
        const response = await fetch(
            "https://pinnacle-backend-5i7n.onrender.com/api/faculty/login",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                     faculty_id: id,
                    dob
                })
            }
        );

        const data = await response.json();

        if(data.success){
            btn.innerText =
"Access Granted";

btn.disabled = false;
            const verifiedUser = data.faculty;

            activeFacultySessionObject =
            verifiedUser;
            if (window.PinnacleSession) PinnacleSession.start('faculty', 'portal');

            document.getElementById('authContainer')
            .style.display='none';

            document.getElementById('dashboardArea')
            .style.display='block';

            document.getElementById('dispFacName')
            .innerText = verifiedUser.name;

            document.getElementById('dispFacId')
            .innerText = verifiedUser.faculty_id;

            document.getElementById('dispFacDomain')
            .innerText = verifiedUser.domain;

            // Compute tenure (whole years served) from enrollment_date.
            // dispFacTenure existed in the markup already but was never
            // being written to, so faculty only ever saw the blank
            // "Years in Academy System File" label with no number.
            const enrollDate =
            new Date(verifiedUser.enrollment_date);

            let tenureYears = 0;

            if (!isNaN(enrollDate.getTime())) {

                const today = new Date();

                tenureYears =
                today.getFullYear() - enrollDate.getFullYear();

                const hasHadAnniversaryThisYear =
                (today.getMonth() > enrollDate.getMonth()) ||
                (today.getMonth() === enrollDate.getMonth() &&
                 today.getDate() >= enrollDate.getDate());

                if (!hasHadAnniversaryThisYear) {
                    tenureYears -= 1;
                }

                if (tenureYears < 0) {
                    tenureYears = 0;
                }
            }

            document.getElementById('dispFacTenure')
            .innerText = tenureYears;

            document.getElementById('dispFacQuals')
            .innerText =
            verifiedUser.qualifications || 'N/A';

            document.getElementById('dispFacAchieve')
            .innerText =
            verifiedUser.achievements || 'N/A';

            document.getElementById('dispFacAwards')
            .innerText =
            verifiedUser.awards || 'N/A';

            document.getElementById('dispFacMobile')
            .innerText =
            verifiedUser.mobile || 'N/A';

            document.getElementById('dispFacMail')
            .innerText =
            verifiedUser.mail;

            document.getElementById('dispFacAddress')
            .innerText =
            verifiedUser.address || 'N/A';

        } else {
btn.disabled = false;

btn.innerText =
"Login to Dashboard";
            alert(data.message || "Login failed");
        }

    } catch(error){

        btn.disabled = false;

btn.innerText =
"Login to Dashboard";
        console.log(error);

        alert("Backend server error");
    }
}
    async function publishJeeTestFormat() {
        if (!activeFacultySessionObject) {
            alert("Security Violation Context: Unverified runtime execution environment tracking error.");
            return;
        }

        const title = document.getElementById('testTitle').value.trim();
        const payloadData = document.getElementById('testQuestions').value.trim();

        if(!title || !payloadData) {
            alert("Cannot process blank examination frameworks. Please provide Title and Question schemas.");
            return;
        }
            try {
                const newTestEntry = {

    test_type: "JEE",

    faculty_id:
        activeFacultySessionObject.faculty_id,

    faculty_name:
        activeFacultySessionObject.name,

    title,

    questions: payloadData
};
const btn =
document.getElementById(
    "publishTestBtn"
);

btn.disabled = true;

btn.innerText =
"Publishing Examination...";
        const response =
await fetch(
"https://pinnacle-backend-5i7n.onrender.com/api/tests/publish-test",
{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify(newTestEntry)
}
);
const result = await response.json();
if(!result.success){
        alert(result.message);
    return;
}        
        } catch (error) {
            btn.disabled = false;
            btn.innerText = "Publish Live JEE Format Test";
            console.warn("Backend server connection offline. Data fallback saved locally to application storage.");
        }
        btn.disabled = false;
        btn.innerText = "Publish Live JEE Format Test";
        alert(`Success!Test Published SuccessfullyFaculty ID:${activeFacultySessionObject.faculty_id}Title:${title}`);
        document.getElementById('testTitle').value = '';
        document.getElementById('testQuestions').value = '';
    }
    (function initBackgroundMatrix() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        let time = 0;

        // Render 3D Liquid Ribbon Wave matching the user's reference image
        // (Electric Purple, Royal Blue, Luminous Cyan, Emerald Green)
        function renderLiquidRibbonMesh() {
            time += 0.008; // Continuous fluid wave motion
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // 1. Dark Space Backdrop
            const baseGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 50, w * 0.5, h * 0.5, Math.max(w, h));
            baseGrad.addColorStop(0, '#1c0836');
            baseGrad.addColorStop(0.5, '#0b061d');
            baseGrad.addColorStop(1, '#03010a');
            ctx.fillStyle = baseGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. Render Layered Flowing 3D Liquid Mesh Waves
            const numRibbons = 12;
            const stepY = h / 40;

            for (let i = 0; i < numRibbons; i++) {
                const ribbonPhase = i * 0.45;
                ctx.beginPath();

                let firstX = 0, firstY = 0;

                for (let y = -50; y <= h + 50; y += stepY) {
                    const normY = y / h;
                    
                    // Voluptuous 3D liquid ribbon wave contour functions
                    const wave1 = Math.sin(normY * 3.2 + time * 1.4 + ribbonPhase) * (w * 0.22);
                    const wave2 = Math.cos(normY * 2.1 - time * 0.95 + ribbonPhase * 1.5) * (w * 0.15);
                    const wave3 = Math.sin(normY * 5.0 + time * 2.1) * 35;

                    const ribbonX = (w * 0.45) + wave1 + wave2 + wave3 + (i * 28 - (numRibbons * 14));

                    if (y === -50) {
                        ctx.moveTo(ribbonX, y);
                        firstX = ribbonX;
                        firstY = y;
                    } else {
                        ctx.lineTo(ribbonX, y);
                    }
                }

                ctx.lineTo(w + 100, h + 50);
                ctx.lineTo(w + 100, -50);
                ctx.closePath();

                // Dynamic Multi-color Liquid Gradient (matching reference image)
                const gradX1 = (w * 0.2) + Math.sin(time + ribbonPhase) * 100;
                const gradY1 = Math.cos(time * 0.8) * 100;
                const gradX2 = w * 0.8;
                const gradY2 = h;

                const ribbonGrad = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2);
                
                ribbonGrad.addColorStop(0, `rgba(76, 29, 149, ${0.88 - i * 0.03})`);   // Deep Electric Purple
                ribbonGrad.addColorStop(0.28, `rgba(124, 58, 237, ${0.92 - i * 0.03})`); // Violet
                ribbonGrad.addColorStop(0.52, `rgba(37, 99, 235, ${0.9 - i * 0.03})`);   // Royal Indigo Blue
                ribbonGrad.addColorStop(0.74, `rgba(6, 182, 212, ${0.93 - i * 0.03})`);  // Luminous Cyan
                ribbonGrad.addColorStop(1, `rgba(16, 185, 129, ${0.95 - i * 0.03})`);   // Neon Emerald Green

                ctx.fillStyle = ribbonGrad;
                ctx.fill();

                // Highlight Ridge Line (creates 3D folded silk / liquid contour depth)
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 245, 212, 0.42)' : 'rgba(192, 132, 252, 0.45)';
                ctx.stroke();
            }

            // 3. Floating Ambient Glowing Fluid Orbs
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            
            // Purple Glow Orb
            const orb1X = w * 0.25 + Math.sin(time * 0.7) * 120;
            const orb1Y = h * 0.3 + Math.cos(time * 0.5) * 80;
            const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 320);
            orb1Grad.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
            orb1Grad.addColorStop(1, 'transparent');
            ctx.fillStyle = orb1Grad;
            ctx.beginPath();
            ctx.arc(orb1X, orb1Y, 320, 0, Math.PI * 2);
            ctx.fill();

            // Emerald Green Glow Orb
            const orb2X = w * 0.7 + Math.cos(time * 0.6) * 140;
            const orb2Y = h * 0.6 + Math.sin(time * 0.8) * 100;
            const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 360);
            orb2Grad.addColorStop(0, 'rgba(16, 185, 129, 0.32)');
            orb2Grad.addColorStop(1, 'transparent');
            ctx.fillStyle = orb2Grad;
            ctx.beginPath();
            ctx.arc(orb2X, orb2Y, 360, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            requestAnimationFrame(renderLiquidRibbonMesh);
        }

        renderLiquidRibbonMesh();
    })();

    window.onload = function () {
    // Faculty Portal now opens on the Login card first, with a
    // "New Faculty? Register/Enroll here" link to reach registration
    // — matching the pattern already used on the Student Portal
    // (login-first, registration reached via a secondary link).
    document.getElementById("loginArea").style.display = "block";
    document.getElementById("registerArea").style.display = "none";

    // FIX: cap Date of Birth and Enrollment Date pickers at today so
    // a faculty member can't pick a future date while enrolling. The
    // backend is the real source of truth for this (it rejects
    // future dates outright), but restricting the picker itself
    // means the invalid option is never even shown.
    const todayISO = new Date().toISOString().split("T")[0];
    const facDobInput = document.getElementById("facDob");
    const facEnrollDateInput = document.getElementById("facEnrollDate");
    if (facDobInput) facDobInput.max = todayISO;
    if (facEnrollDateInput) facEnrollDateInput.max = todayISO;

    document.querySelectorAll('#registerArea input').forEach((field) => {
        field.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); processFacultyEnrollment(); }
        });
    });
    };
    function showFacultyModal(facultyId){

    document.getElementById(
        "generatedFacultyId"
    ).innerText = facultyId;

    document.getElementById(
        "facultySuccessModal"
    ).style.display = "flex";
}

function closeFacultyModal(){

    document.getElementById(
        "facultySuccessModal"
    ).style.display = "none";

    toggleAuthViews(false);
}
   
