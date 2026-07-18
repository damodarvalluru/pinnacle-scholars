/* ==========================================================
   FORGOT ID — SHARED FRONTEND LOGIC
   Included on every page that prompts the user for an ID before
   logging in or looking something up: Student Portal, Fees
   Payment Portal, Result Portal (student ID recovery via Date
   of Birth) and Faculty Portal (faculty ID recovery via
   registered mobile number).

   Talks to the two backend recovery endpoints:
     POST /api/students/forgot-id   { dob }
     POST /api/faculty/forgot-id    { mobile }

   Both endpoints return a "note" field with the exact reminder
   text ("Please remember your ID.") which is always appended to
   the alert shown to the user.
   ========================================================== */

const FORGOT_ID_API_BASE = "https://pinnacle-backend-5i7n.onrender.com";

/* ----------------------------------------------------------
   STUDENT — recover Student ID using Date of Birth
   Shown fields: Name, Student ID, Date of Birth, Course
   ---------------------------------------------------------- */
async function forgotStudentId() {
    const dob = prompt(
        "Forgot your Student ID?\n\nEnter your Date of Birth (YYYY-MM-DD) to retrieve it:"
    );
    if (dob === null) return; // user cancelled

    const trimmedDob = dob.trim();

    if (!trimmedDob) {
        alert("Please enter your Date of Birth.");
        return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDob)) {
        alert("Please enter your Date of Birth in YYYY-MM-DD format (e.g., 2006-05-21).");
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDob = new Date(trimmedDob);
    if (isNaN(parsedDob.getTime())) {
        alert("That does not look like a valid date. Please try again.");
        return;
    }
    if (parsedDob > today) {
        alert("Date of Birth cannot be a future date.");
        return;
    }

    try {
        const response = await fetch(`${FORGOT_ID_API_BASE}/api/students/forgot-id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dob: trimmedDob })
        });

        const data = await response.json();

        if (!data.success || !data.students || data.students.length === 0) {
            alert(data.message || "No student record found for that Date of Birth.");
            return;
        }

        const heading = data.students.length > 1
            ? "Multiple Student Records Found"
            : "Student Record Found";

        const blocks = data.students.map(s =>
            `Name: ${s.name}\n` +
            `Student ID: ${s.student_id}\n` +
            `Date of Birth: ${s.dob}\n` +
            `Course: ${s.domain}`
        ).join("\n\n------------------------------\n\n");

        alert(
            `${heading}\n\n${blocks}\n\n` +
            `Note: ${data.note || "Please remember your ID."}`
        );

    } catch (err) {
        console.error("Forgot Student ID Error:", err);
        alert("Unable to reach the server right now. Please try again shortly.");
    }
}

/* ----------------------------------------------------------
   FACULTY — recover Faculty ID using registered Mobile Number
   Shown fields: Faculty ID, Date of Birth, Mobile Number, Email
   ---------------------------------------------------------- */
async function forgotFacultyId() {
    const mobile = prompt(
        "Forgot your Faculty ID?\n\nEnter your registered Mobile Number to retrieve it:"
    );
    if (mobile === null) return; // user cancelled

    const trimmedMobile = mobile.trim();

    if (!trimmedMobile) {
        alert("Please enter your mobile number.");
        return;
    }

    if (!/^[0-9]{10}$/.test(trimmedMobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    try {
        const response = await fetch(`${FORGOT_ID_API_BASE}/api/faculty/forgot-id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: trimmedMobile })
        });

        const data = await response.json();

        if (!data.success || !data.faculty || data.faculty.length === 0) {
            alert(data.message || "No faculty record found for that mobile number.");
            return;
        }

        const heading = data.faculty.length > 1
            ? "Multiple Faculty Records Found"
            : "Faculty Record Found";

        const blocks = data.faculty.map(f =>
            `Faculty ID: ${f.faculty_id}\n` +
            `Date of Birth: ${f.dob}\n` +
            `Mobile Number: ${f.mobile}\n` +
            `Email: ${f.mail}`
        ).join("\n\n------------------------------\n\n");

        alert(
            `${heading}\n\n${blocks}\n\n` +
            `Note: ${data.note || "Please remember your ID."}`
        );

    } catch (err) {
        console.error("Forgot Faculty ID Error:", err);
        alert("Unable to reach the server right now. Please try again shortly.");
    }
}
