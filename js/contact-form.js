/* ==========================================================
   CONTACT FORM — FRONTEND LOGIC
   Validates the form, posts it to the backend contact route,
   and shows an inline success/error status message. Uses the
   same backend base URL already used by the rest of the site
   (js/result-portal.js, js/enrollment.js, etc.).
   ========================================================== */

const CONTACT_API_BASE = "https://pinnacle-backend-5i7n.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    if (!form) return; // Contact section not present on this page

    const statusBox = document.getElementById("contactStatus");
    const submitBtn = document.getElementById("contactSubmitBtn");
    const dobInput = document.getElementById("contactDob");
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
    dobInput.max = localToday;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const mobile = document.getElementById("contactMobile").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const location = document.getElementById("contactLocation").value.trim();
        const dob = document.getElementById("contactDob").value;
        const message = document.getElementById("contactMessage").value.trim();

        if (!name || !mobile || !email || !location || !dob || !message) {
            showContactStatus("Please fill in every field before submitting.", "error");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showContactStatus("Please enter a valid email address.", "error");
            return;
        }

        const mobilePattern = /^[0-9+\-\s]{7,15}$/;
        if (!mobilePattern.test(mobile)) {
            showContactStatus("Please enter a valid mobile number.", "error");
            return;
        }

        if (dob > localToday) {
            showContactStatus("Date of birth cannot be in the future.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            const response = await fetch(`${CONTACT_API_BASE}/api/contact/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, mobile, email, location, dob, message })
            });

            const data = await response.json();

            if (data.success) {
                showContactStatus(
                    "✅ Thank you! Your message has been sent successfully.",
                    "success"
                );
                form.reset();
            } else {
                showContactStatus(
                    data.message || "Something went wrong. Please try again.",
                    "error"
                );
            }
        } catch (err) {
            console.error(err);
            showContactStatus(
                "Unable to reach the server right now. Please try again shortly.",
                "error"
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        }
    });

    function showContactStatus(msg, type) {
        statusBox.textContent = msg;
        statusBox.className = `contact-status show ${type}`;
    }
});
