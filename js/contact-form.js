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

    // Restrict the Date of Birth field to today and earlier — a date of
    // birth can never be in the future. Setting `max` dynamically (rather
    // than hardcoding it in the HTML) keeps it correct on every visit.
    if (dobInput) {
        dobInput.max = new Date().toISOString().split("T")[0];
    }

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

        // Future-date guard — mirrors the same check enforced on the
        // backend (js/enrollment.js uses this exact pattern already).
        const selectedDob = new Date(dob);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDob > today) {
            showContactStatus("Date of Birth cannot be a future date.", "error");
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
                // The DB write always succeeds first on the backend, so the
                // enquiry itself is never lost even if a notification channel
                // is down — keep the visitor-facing message reassuring.
                showContactStatus(
                    "✅ Thank you! Your message has been sent successfully.",
                    "success"
                );

                // Still log the real per-channel result to the console so
                // whoever is testing the form (you) can see instantly if
                // email/WhatsApp delivery failed, without needing to check
                // server logs. For a full live self-check any time, visit:
                // https://pinnacle-backend-5i7n.onrender.com/api/contact/diagnostics
                if (!data.emailSent || !data.whatsappSent) {
                    console.warn("Contact form: one or more notification channels failed.", {
                        emailSent: data.emailSent,
                        emailError: data.emailError,
                        whatsappSent: data.whatsappSent,
                        whatsappError: data.whatsappError,
                        diagnostics: `${CONTACT_API_BASE}/api/contact/diagnostics`
                    });
                }

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
