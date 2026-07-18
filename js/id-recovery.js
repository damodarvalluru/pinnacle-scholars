const ID_RECOVERY_API_BASE = "https://pinnacle-backend-5i7n.onrender.com";

async function recoverStudentId() {
    const dob = window.prompt("Enter your registered Date of Birth (YYYY-MM-DD):");
    if (dob === null) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        alert("Please enter your date of birth in YYYY-MM-DD format.");
        return;
    }

    try {
        const response = await fetch(`${ID_RECOVERY_API_BASE}/api/students/recover-id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dob })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "ID recovery failed.");

        const student = data.student;
        alert(`Student ID recovered\n\nName: ${student.name}\nID: ${student.student_id}\nDate of Birth: ${formatRecoveryDate(student.dob)}\nCourse: ${student.domain}\n\nNote: Please remember your ID.`);
    } catch (error) {
        alert(error.message || "Unable to recover the student ID right now.");
    }
}

async function recoverFacultyId() {
    const mobile = window.prompt("Enter your registered 10-digit mobile number:");
    if (mobile === null) return;
    const normalizedMobile = mobile.replace(/\s+/g, "");
    if (!/^\d{10}$/.test(normalizedMobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    try {
        const response = await fetch(`${ID_RECOVERY_API_BASE}/api/faculty/recover-id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: normalizedMobile })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "ID recovery failed.");

        const faculty = data.faculty;
        alert(`Faculty ID recovered\n\nID: ${faculty.faculty_id}\nDate of Birth: ${formatRecoveryDate(faculty.dob)}\nMobile Number: ${faculty.mobile}\nEmail: ${faculty.mail}\n\nNote: Please remember your ID.`);
    } catch (error) {
        alert(error.message || "Unable to recover the faculty ID right now.");
    }
}

function formatRecoveryDate(value) {
    return String(value || "").slice(0, 10);
}
