// js/app.js - Main Application Entry Point & Orchestrator

document.addEventListener("DOMContentLoaded", () => {
    initCareerIntro();
    initHeroParticles();
    initBrandLetterDrop();
    initRouter();
    initNotifications();
    initResumeBuilder();
    renderResumeSamples();
    initCodingPlayground();
    generateAdaptiveQuestions("Intermediate", "B.Tech");
    renderHomeFeaturedJobs();
    renderExploreJobs();
    initCareerProfile();
    initMobileNavigation();
    initExitIntent();
    if (typeof initInternshipsSection === "function") initInternshipsSection();
    if (typeof initCoursesSection === "function") initCoursesSection();
    if (typeof initAIInterview === "function") initAIInterview();
    renderCareerDashboard();
    initSectionReveal();
});

function initMobileNavigation() {
    const button = document.getElementById("hamburger-btn"), menu = document.getElementById("nav-menu");
    if (!button || !menu) return;
    button.addEventListener("click", () => menu.classList.toggle("mobile-open"));
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => menu.classList.remove("mobile-open")));
}

/* Full-screen opening experience: once per tab session, then release the app. */
function initCareerIntro() {
    const intro = document.getElementById("career-intro");
    if (!intro) return;
    const complete = () => { intro.classList.add("is-complete"); setTimeout(() => intro.remove(), 700); };
    if (sessionStorage.getItem("careerAI_intro_seen")) { intro.remove(); return; }
    sessionStorage.setItem("careerAI_intro_seen", "true");
    setTimeout(complete, 3600);
}

const PROFILE_DEFAULTS = {
    interests: ["Artificial Intelligence", "Data Science", "Web Development", "Cybersecurity", "Cloud Computing", "UI/UX Design", "Software Development", "Digital Marketing"],
    skills: ["Python", "JavaScript", "SQL", "React", "AWS", "Machine Learning", "Cybersecurity", "HTML", "CSS", "Git/GitHub"]
};
let careerProfile = { name: "", interests: [], skills: [], level: "Intermediate" };

function initCareerProfile() {
    const stored = localStorage.getItem("careerAI_profile");
    if (stored) { try { careerProfile = { ...careerProfile, ...JSON.parse(stored) }; } catch (_) {} }
    const name = document.getElementById("candidate-name");
    if (name) { name.value = careerProfile.name; name.addEventListener("input", () => { careerProfile.name = name.value.trim(); saveCareerProfile(); updateProfileSummary(); }); }
    const levelSelect = document.getElementById("profile-level-select");
    if (levelSelect) { levelSelect.value = careerProfile.level; levelSelect.addEventListener("change", () => { setProfileLevel(levelSelect.value); }); }
    renderProfileChips(); updateProfileSummary();
    ["custom-interest", "custom-skill"].forEach(id => document.getElementById(id)?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addCustomProfileItem(id.includes("interest") ? "interest" : "skill"); } }));
}

function setProfileLevel(level) {
    careerProfile.level = level;
    saveCareerProfile();
    applyProfileRecommendations();
}

function renderProfileChips() {
    [["interest", "interests"], ["skill", "skills"]].forEach(([type, key]) => {
        const host = document.getElementById(`${type}-chips`); if (!host) return;
        const options = [...new Set([...PROFILE_DEFAULTS[key], ...careerProfile[key]])];
        host.innerHTML = options.map(item => `<button type="button" class="chip ${careerProfile[key].includes(item) ? "selected" : ""}" aria-pressed="${careerProfile[key].includes(item)}" onclick="toggleProfileItem('${type}', decodeURIComponent('${encodeURIComponent(item)}'))">${item}</button>`).join("");
    });
}

function toggleProfileItem(type, item) {
    const key = `${type}s`, list = careerProfile[key];
    careerProfile[key] = list.includes(item) ? list.filter(v => v !== item) : [...list, item];
    saveCareerProfile(); renderProfileChips(); updateProfileSummary();
}

function addCustomProfileItem(type) {
    const input = document.getElementById(`custom-${type}`), value = input?.value.trim(); if (!value) return;
    const key = `${type}s`; if (!careerProfile[key].some(v => v.toLowerCase() === value.toLowerCase())) careerProfile[key].push(value);
    input.value = ""; saveCareerProfile(); renderProfileChips(); updateProfileSummary();
}

function saveCareerProfile() { localStorage.setItem("careerAI_profile", JSON.stringify(careerProfile)); }
function updateProfileSummary() { const el = document.getElementById("profile-summary"); if (el) el.textContent = `${careerProfile.name ? careerProfile.name + " · " : ""}${careerProfile.interests.length} interests · ${careerProfile.skills.length} skills selected`; }
function applyProfileRecommendations() {
    renderHomeFeaturedJobs(); renderExploreJobs(); updateProfileSummary();
    document.getElementById("profile-summary")?.classList.add("profile-updated");
    setTimeout(() => document.getElementById("profile-summary")?.classList.remove("profile-updated"), 700);
    if (typeof renderInternshipsGrid === "function" && typeof getFilteredInternships === "function") renderInternshipsGrid(getFilteredInternships());
    if (typeof renderCoursesGrid === "function" && typeof getFilteredCourses === "function") renderCoursesGrid(getFilteredCourses());
    renderCareerDashboard();
}

/* ==========================================================================
   BRAND LETTER DROP ANIMATION (RUNS ONLY ONCE PER SESSION)
   ========================================================================== */
function initBrandLetterDrop() {
    const hasAnimated = sessionStorage.getItem("careerAI_letter_animated");
    const letters = document.querySelectorAll(".brand-letter");

    if (!hasAnimated) {
        letters.forEach((letter, index) => {
            setTimeout(() => {
                letter.classList.add("drop");
            }, index * 80);
        });
        sessionStorage.setItem("careerAI_letter_animated", "true");
    } else {
        letters.forEach(letter => {
            letter.style.transform = "translateY(0)";
            letter.style.opacity = "1";
        });
    }
}

/* ==========================================================================
   HERO CANVAS PARTICLES
   ========================================================================== */
function initHeroParticles() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    });

    const particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.2
    }));

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > width) p.dx *= -1;
            if (p.y < 0 || p.y > height) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#06B6D4";
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   FEATURED JOBS ON HOME PAGE & EXPLORE JOBS
   ========================================================================== */
function renderHomeFeaturedJobs() {
    const container = document.getElementById("home-featured-jobs-container");
    if (!container) return;

    container.innerHTML = "";
    getProfileRankedJobs().slice(0, 6).forEach(job => {
        const card = createJobCardElement(job);
        container.appendChild(card);
    });
}

function renderExploreJobs(filteredList = JOBS_DATA) {
    const container = document.getElementById("explore-jobs-grid");
    if (!container) return;

    container.innerHTML = "";
    if (filteredList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem;" class="text-muted">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
                <h4>No matching jobs found</h4>
                <p style="font-size:0.9rem;">Try reducing your search filters or changing the target sector.</p>
            </div>
        `;
        return;
    }

    const displayList = filteredList === JOBS_DATA ? getProfileRankedJobs() : filteredList;
    displayList.forEach(job => {
        const card = createJobCardElement(job);
        container.appendChild(card);
    });
}

function createJobCardElement(job) {
    const card = document.createElement("div");
    card.className = "job-card";

    // Match score calculation
    const matchScore = calculateJobMatchScore(job);
    const dashoffset = 188 - (188 * matchScore) / 100;

    card.innerHTML = `
        <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">
                <div>
                    <span class="badge ${job.sector === 'Government' ? 'badge-indigo' : 'badge-cyan'}">${job.sector} Sector</span>
                    <h3 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:700; margin-top:0.4rem;">${job.title}</h3>
                    <div style="color:var(--text-muted); font-size:0.88rem;">${job.organization}</div>
                </div>
                <div class="match-circle">
                    <svg viewBox="0 0 70 70">
                        <circle class="bg-circle" cx="35" cy="35" r="30"></circle>
                        <circle class="progress-circle" cx="35" cy="35" r="30" style="stroke-dasharray: 188; stroke-dashoffset: ${dashoffset};"></circle>
                    </svg>
                    <div class="match-text">${matchScore}%</div>
                </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:0.8rem; font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">
                <span>📍 ${job.location}</span>
                <span>💼 ${job.workType}</span>
                <span>💰 ${job.salary}</span>
            </div>

            <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:1.2rem; line-height:1.5;">${job.description}</p>

            <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:0.8rem; margin-bottom:1.2rem;">
                <div style="font-size:0.75rem; color:var(--primary); font-weight:700; margin-bottom:0.3rem;">REQUIRED SKILLS</div>
                <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                    ${job.requiredSkills.map(s => `<span class="badge badge-cyan" style="font-size:0.7rem;">${s}</span>`).join('')}
                </div>
            </div>
        </div>

        <div style="display:flex; gap:0.8rem;">
            <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openJobModal('${job.id}')">View Details</button>
            <a href="${job.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex:1;">Apply Now ↗</a>
        </div>
    `;
    return card;
}

function calculateJobMatchScore(job) {
    let score = 62;
    const profileInterestHits = job.interests.filter(i => careerProfile.interests.some(v => v.toLowerCase() === i.toLowerCase())).length;
    const profileSkillHits = job.requiredSkills.filter(s => careerProfile.skills.some(v => v.toLowerCase() === s.toLowerCase())).length;
    score += Math.min(18, profileInterestHits * 7) + Math.min(20, profileSkillHits * 5);
    if (job.sector === "Private") score += 10;
    if (job.experience === "Intermediate") score += 7;
    if (careerProfile.level && job.experience === careerProfile.level) score += 6;
    return Math.min(score, 96);
}

function getProfileRankedJobs() { return [...JOBS_DATA].sort((a, b) => calculateJobMatchScore(b) - calculateJobMatchScore(a)); }

function filterJobsList() {
    const query = document.getElementById("job-search-input") ? document.getElementById("job-search-input").value.toLowerCase() : "";
    const sector = document.getElementById("job-filter-sector") ? document.getElementById("job-filter-sector").value : "All";
    const workType = document.getElementById("job-filter-worktype") ? document.getElementById("job-filter-worktype").value : "All";
    const level = document.getElementById("job-filter-level") ? document.getElementById("job-filter-level").value : "All";

    const filtered = JOBS_DATA.filter(job => {
        const matchesQuery = job.title.toLowerCase().includes(query) || job.organization.toLowerCase().includes(query) || job.requiredSkills.some(s => s.toLowerCase().includes(query));
        const matchesSector = sector === "All" || job.sector === sector;
        const matchesWorkType = workType === "All" || job.workType === workType;
        const matchesLevel = level === "All" || job.experience === level;

        return matchesQuery && matchesSector && matchesWorkType && matchesLevel;
    });

    renderExploreJobs(filtered);
}

function openJobModal(jobId) {
    const job = JOBS_DATA.find(j => j.id === jobId);
    if (!job) return;

    const modalBody = document.getElementById("modal-body-content");
    modalBody.innerHTML = `
        <span class="badge badge-cyan">${job.sector} Sector</span>
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin:0.6rem 0 0.2rem;" class="text-gradient">${job.title}</h2>
        <div class="text-muted" style="margin-bottom:1.2rem;">${job.organization} — ${job.location} (${job.workType})</div>
        
        <div style="background:rgba(255,255,255,0.03); padding:1rem; border-radius:10px; margin-bottom:1.2rem; display:flex; gap:1.5rem; flex-wrap:wrap;">
            <div><span style="font-size:0.75rem; color:var(--text-muted);">SALARY</span><br><strong>${job.salary}</strong></div>
            <div><span style="font-size:0.75rem; color:var(--text-muted);">EXPERIENCE</span><br><strong>${job.experience}</strong></div>
            <div><span style="font-size:0.75rem; color:var(--text-muted);">APPLICATION DEADLINE</span><br><strong class="text-cyan">${job.deadline}</strong></div>
        </div>

        <p style="line-height:1.7; margin-bottom:1.5rem;">${job.description}</p>
        
        <h4 style="font-family:var(--font-heading); margin-bottom:0.5rem;">Required Core Skills</h4>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem;">
            ${job.requiredSkills.map(s => `<span class="chip selected">${s}</span>`).join('')}
        </div>

        <div style="display:flex; gap:1rem;">
            <a href="${job.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;">Proceed to Official Application ↗</a>
            <button class="btn btn-secondary" onclick="closeJobModal()">Close</button>
        </div>
    `;
    document.getElementById("job-modal").classList.add("open");
}

function closeJobModal() {
    document.getElementById("job-modal").classList.remove("open");
}

/* ==========================================================================
   EXIT INTENT DIALOG
   ========================================================================== */
function initExitIntent() {
    document.addEventListener("mouseleave", e => {
        if (e.clientY < 10 && !sessionStorage.getItem("careerAI_exit_shown")) {
            const exitModal = document.getElementById("exit-modal");
            if (exitModal) exitModal.classList.add("open");
            sessionStorage.setItem("careerAI_exit_shown", "true");
        }
    });
}

function closeExitModal() {
    const exitModal = document.getElementById("exit-modal");
    if (exitModal) exitModal.classList.remove("open");
}

function resetProfile() {
    localStorage.clear();
    sessionStorage.clear();
    alert("Profile and local session state cleared successfully.");
    window.location.reload();
}

/* ==========================================================================
   CANDIDATE DASHBOARD (View 2) — powered by the already-loaded Chart.js CDN
   ========================================================================== */
let dashboardChartInstance = null;

function renderCareerDashboard() {
    const container = document.getElementById("dashboard-results-container");
    if (!container) return;

    const rankedJobs = getProfileRankedJobs();
    const topJobs = rankedJobs.slice(0, 5);
    const avgMatch = Math.round(rankedJobs.reduce((sum, j) => sum + calculateJobMatchScore(j), 0) / rankedJobs.length);
    const upcomingDeadlines = typeof notificationsList !== "undefined" ? notificationsList.filter(n => n.category.includes("Deadline")).length : 0;

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1.2rem; margin-bottom:2rem;">
            <div class="toolkit-card dashboard-stat-card">
                <div style="font-size:0.78rem; color:var(--text-muted);">Candidate</div>
                <div class="text-gradient" style="font-family:var(--font-heading); font-weight:800; font-size:1.3rem;">${careerProfile.name || "Guest Candidate"}</div>
            </div>
            <div class="toolkit-card dashboard-stat-card">
                <div style="font-size:0.78rem; color:var(--text-muted);">Avg. Job Match Score</div>
                <div style="font-family:var(--font-heading); font-weight:800; font-size:1.3rem; color:var(--primary);">${isNaN(avgMatch) ? 0 : avgMatch}%</div>
            </div>
            <div class="toolkit-card dashboard-stat-card">
                <div style="font-size:0.78rem; color:var(--text-muted);">Skills Selected</div>
                <div style="font-family:var(--font-heading); font-weight:800; font-size:1.3rem; color:var(--success);">${careerProfile.skills.length}</div>
            </div>
            <div class="toolkit-card dashboard-stat-card">
                <div style="font-size:0.78rem; color:var(--text-muted);">Upcoming Deadlines</div>
                <div style="font-family:var(--font-heading); font-weight:800; font-size:1.3rem; color:var(--warning);">${upcomingDeadlines}</div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap:2rem;" class="dashboard-grid">
            <div class="toolkit-card">
                <span class="badge badge-cyan">Top 5 Matches</span>
                <h3 style="font-family:var(--font-heading); margin:0.8rem 0 1rem;">Your Best-Fit Roles</h3>
                <canvas id="dashboard-match-chart" height="220"></canvas>
            </div>
            <div class="toolkit-card">
                <span class="badge badge-indigo">Career Signal</span>
                <h3 style="font-family:var(--font-heading); margin:0.8rem 0 1rem;">Profile Snapshot</h3>
                <div style="font-size:0.88rem; color:var(--text-muted); line-height:2;">
                    <div><strong style="color:var(--text-main);">Level:</strong> ${careerProfile.level || "Not set"}</div>
                    <div><strong style="color:var(--text-main);">Interests:</strong> ${careerProfile.interests.slice(0, 5).join(", ") || "None selected"}</div>
                    <div><strong style="color:var(--text-main);">Top Skills:</strong> ${careerProfile.skills.slice(0, 5).join(", ") || "None selected"}</div>
                </div>
                <a href="#jobs" class="btn btn-primary btn-sm" style="width:100%; margin-top:1.2rem; text-align:center;">Browse Matched Jobs →</a>
            </div>
        </div>
    `;

    const canvas = document.getElementById("dashboard-match-chart");
    if (canvas && typeof Chart !== "undefined") {
        if (dashboardChartInstance) dashboardChartInstance.destroy();
        dashboardChartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: topJobs.map(j => j.title.length > 18 ? j.title.slice(0, 18) + "…" : j.title),
                datasets: [{
                    label: "Match %",
                    data: topJobs.map(j => calculateJobMatchScore(j)),
                    backgroundColor: "rgba(6, 182, 212, 0.55)",
                    borderColor: "#06b6d4",
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" } },
                    x: { ticks: { color: "#94a3b8" }, grid: { display: false } }
                }
            }
        });
    }
}

/* ==========================================================================
   SECTION REVEAL ON SCROLL
   ========================================================================== */
function initSectionReveal() {
    const targets = document.querySelectorAll(".section, .toolkit-card, .job-card, .select-card, .internship-card, .course-card");
    if (!("IntersectionObserver" in window) || targets.length === 0) return;

    targets.forEach(el => el.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    targets.forEach(el => observer.observe(el));
}
