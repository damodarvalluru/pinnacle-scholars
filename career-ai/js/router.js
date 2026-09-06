// js/router.js - SPA Single Page View Router Engine

const ROUTES = {
    "#home": "view-home",
    "#dashboard": "view-dashboard",
    "#jobs": "view-jobs",
    "#assessment": "view-assessment",
    "#resume-builder": "view-resume-builder",
    "#resume-samples": "view-resume-samples",
    "#internships": "view-internships",
    "#courses": "view-courses",
    "#interview": "view-interview",
    "#notifications": "view-notifications",
    "#profile": "view-profile"
};

function initRouter() {
    window.addEventListener("hashchange", handleRouting);
    handleRouting(); // Initial page load route handle
}

function handleRouting() {
    let hash = window.location.hash || "#home";
    const targetViewId = ROUTES[hash] || "view-home";

    // Hide all view containers
    document.querySelectorAll(".view-container").forEach(view => {
        view.style.display = "none";
    });

    // Show active view container
    const activeView = document.getElementById(targetViewId);
    if (activeView) {
        activeView.style.display = "block";
    }

    // Update Navigation Active State
    document.querySelectorAll(".nav-link").forEach(link => {
        const linkHash = link.getAttribute("href");
        if (linkHash === hash) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Scroll to top of view
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateTo(hash) {
    window.location.hash = hash;
}
