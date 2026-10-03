/* ==========================================================
   CONTACT FORM — FRONTEND LOGIC
   Validates the form, posts it to the backend contact route,
   and handles the 3D flip-card animation on successful submission.
   ========================================================== */

const CONTACT_API_BASE = "https://pinnacle-backend-5i7n.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const card = document.getElementById("contactCard") || document.querySelector(".contact-card");
    const statusBox = document.getElementById("contactStatus");
    const submitBtn = document.getElementById("contactSubmitBtn");
    const dobInput = document.getElementById("contactDob");
    const sendAnotherBtn = document.getElementById("contactSendAnotherBtn");

    // Restrict Date of Birth to today and earlier
    if (dobInput) {
        dobInput.max = new Date().toISOString().split("T")[0];
    }

    // Reset and flip back to front when user wants to send another message
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener("click", function () {
            if (card) {
                card.classList.remove("flipped");
            }
            form.reset();
            if (statusBox) {
                statusBox.textContent = "";
                statusBox.className = "contact-status";
            }
        });
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
                // Success: flip the card to the back to display success message
                if (card) {
                    card.classList.add("flipped");
                }
                if (statusBox) {
                    statusBox.textContent = "";
                    statusBox.className = "contact-status";
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
        if (!statusBox) return;
        statusBox.textContent = msg;
        statusBox.className = `contact-status show ${type}`;
    }
});
