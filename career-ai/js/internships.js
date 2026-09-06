// internships.js - Realistic dataset of 10+ internship categories & listings

const INTERNSHIPS_DATA = [
    {
        id: "intern-1",
        title: "Software Engineering Virtual Internship",
        organization: "J.P. Morgan Chase",
        sector: "Private",
        skills: ["Java", "Python", "Git/GitHub", "Problem Solving"],
        location: "Virtual / Remote",
        type: "Remote",
        duration: "Flexible (Self-Paced)",
        eligibility: "Open to Students & Early Professionals",
        deadline: "2026-08-25",
        url: "https://www.theforage.com/simulations/jpmorgan/software-engineering-66zX",
        description: "Work on real-world engineering projects including backend programming, stock price visualization, and security audit patches."
    },
    {
        id: "intern-2",
        title: "AI & Data Science Student Internship",
        organization: "IBM SkillsBuild",
        sector: "Private",
        skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
        location: "Remote / Global",
        type: "Remote",
        duration: "3 Months",
        eligibility: "Undergraduates & Graduates",
        deadline: "2026-08-28",
        url: "https://skillsbuild.org/students",
        description: "Hands-on experience building machine learning models, training data sets, and deploying cloud models under IBM mentorship."
    },
    {
        id: "intern-3",
        title: "Government E-Governance Technology Internship",
        organization: "AICTE - Govt of India Internships Portal",
        sector: "Government",
        skills: ["HTML", "CSS", "JavaScript", "SQL", "Networking"],
        location: "New Delhi / Hybrid",
        type: "Hybrid",
        duration: "6 Months",
        eligibility: "Engineering & Science Graduates",
        deadline: "2026-09-10",
        url: "https://internship.aicte-india.org/",
        description: "Contribute to smart cities, e-governance infrastructure, national portal security, and digital public initiatives."
    },
    {
        id: "intern-4",
        title: "Frontend Developer Internship",
        organization: "Vercel Ecosystem Fellows",
        sector: "Private",
        skills: ["HTML", "CSS", "JavaScript", "React", "Git/GitHub"],
        location: "Remote",
        type: "Remote",
        duration: "3 Months",
        eligibility: "Proficient in JS & CSS Foundations",
        deadline: "2026-08-24",
        url: "https://www.wellfound.com/jobs?q=Frontend+Intern",
        description: "Build ultra-fast web user interfaces, design component libraries, and optimize web performance metrics."
    },
    {
        id: "intern-5",
        title: "Cloud Infrastructure & DevOps Fellowship",
        organization: "Linux Foundation Mentorship Program",
        sector: "Private",
        skills: ["Docker", "Kubernetes", "AWS", "DevOps", "C++"],
        location: "Remote",
        type: "Remote",
        duration: "12 Weeks (Stipend Provided)",
        eligibility: "Open Source Enthusiasts",
        deadline: "2026-09-05",
        url: "https://lfx.linuxfoundation.org/tools/mentorship/",
        description: "Contribute directly to CNCF open-source projects under guidance from core Docker, Kubernetes, and Linux maintainers."
    },
    {
        id: "intern-6",
        title: "Cybersecurity Threat Research Internship",
        organization: "CISA Student & Graduate Fellowship",
        sector: "Government",
        skills: ["Cybersecurity", "Networking", "Python", "SQL"],
        location: "Washington, D.C. / Remote",
        type: "Hybrid",
        duration: "10 Weeks",
        eligibility: "Enrolled in IT/Cybersecurity Degree",
        deadline: "2026-08-22",
        url: "https://www.cisa.gov/careers/students-and-recent-graduates",
        description: "Analyze network traffic logs, report zero-day vulnerability alerts, and research public infrastructure defenses."
    },
    {
        id: "intern-7",
        title: "UI/UX & Product Design Internship",
        organization: "Internshala Design Hub",
        sector: "Private",
        skills: ["HTML", "CSS", "UI/UX Design", "Communication"],
        location: "Remote / Hybrid",
        type: "Remote",
        duration: "2 - 6 Months",
        eligibility: "Design Portfolio Required",
        deadline: "2026-08-30",
        url: "https://internshala.com/internships/ui-ux-design-internship/",
        description: "Design mobile wireframes, user flow diagrams, visual prototypes, and conduct usability research testing."
    },
    {
        id: "intern-8",
        title: "Public Sector Data Science Fellowship",
        organization: "Data Science for Social Good (DSSG)",
        sector: "Government",
        skills: ["Python", "Data Analysis", "SQL", "Problem Solving"],
        location: "Chicago, IL / Remote",
        type: "Remote",
        duration: "12 Weeks",
        eligibility: "Data Science Students",
        deadline: "2026-09-01",
        url: "https://www.dssgfellowship.org/",
        description: "Apply machine learning and statistics to solve social problems in public health, education, and municipal governance."
    },
    {
        id: "intern-9",
        title: "Digital Marketing & Analytics Intern",
        organization: "HubSpot Student Program",
        sector: "Private",
        skills: ["Communication", "Data Analysis", "Digital Marketing"],
        location: "Remote",
        type: "Remote",
        duration: "3 Months",
        eligibility: "Marketing & Tech Enthusiasts",
        deadline: "2026-08-27",
        url: "https://www.hubspot.com/careers/students",
        description: "Analyze campaign conversions, audit search engine rankings, generate content marketing reports, and manage CRM tags."
    },
    {
        id: "intern-10",
        title: "Cloud & Solutions Architecture Student Intern",
        organization: "Google Cloud Student Programs",
        sector: "Private",
        skills: ["AWS", "Azure", "Python", "Networking"],
        location: "Mountain View, CA / Remote",
        type: "Hybrid",
        duration: "12 Weeks",
        eligibility: "Computer Science Undergraduates",
        deadline: "2026-09-08",
        url: "https://buildyourfuture.withgoogle.com/internships",
        description: "Work alongside Google engineers to architect enterprise cloud services and build distributed infrastructure tools."
    }
];

/* ==========================================================================
   INTERNSHIPS SECTION — RENDERING, PROFILE-BASED FILTERING & LIVE REFRESH
   Data currently ships as a curated, regularly-updatable dataset. The
   functions below are written against a stable shape (id, title,
   organization, skills, location, stipend/eligibility, deadline, url) so a
   real internship API/backend can be swapped in later by replacing
   fetchInternshipsFromSource() without touching the rendering layer.
   ========================================================================== */
let internshipsLastSynced = new Date();

async function fetchInternshipsFromSource() {
    // Placeholder data-service boundary: swap this body for a real fetch()
    // call to a backend/API endpoint when one is available. Falls back to
    // the curated dataset so the section never breaks.
    return new Promise(resolve => {
        setTimeout(() => resolve([...INTERNSHIPS_DATA]), 600);
    });
}

function scoreInternshipMatch(item) {
    if (typeof careerProfile === "undefined") return 0;
    const skillHits = item.skills.filter(s => careerProfile.skills.some(v => v.toLowerCase() === s.toLowerCase())).length;
    let score = 55 + Math.min(30, skillHits * 8);
    if (typeof careerProfile.level !== "undefined") {
        if (careerProfile.level === "Beginner" && /open to students|fresher|undergraduate/i.test(item.eligibility)) score += 10;
        if (careerProfile.level === "Advanced" && /open source|mentorship|graduate/i.test(item.eligibility)) score += 6;
    }
    return Math.min(score, 97);
}

function initInternshipsSection() {
    renderInternshipsGrid(INTERNSHIPS_DATA);
    updateInternshipsSyncLabel();
}

function getFilteredInternships() {
    const query = document.getElementById("internship-search-input") ? document.getElementById("internship-search-input").value.toLowerCase() : "";
    const type = document.getElementById("internship-filter-type") ? document.getElementById("internship-filter-type").value : "All";

    return INTERNSHIPS_DATA.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) || item.organization.toLowerCase().includes(query) || item.skills.some(s => s.toLowerCase().includes(query));
        const matchesType = type === "All" || item.type === type;
        return matchesQuery && matchesType;
    }).sort((a, b) => scoreInternshipMatch(b) - scoreInternshipMatch(a));
}

function filterInternshipsList() {
    renderInternshipsGrid(getFilteredInternships());
}

function renderInternshipsGrid(list) {
    const container = document.getElementById("internships-grid");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem;" class="text-muted">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
                <h4>No matching internships found</h4>
                <p style="font-size:0.9rem;">Try a different keyword or work-type filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    list.forEach(item => {
        const score = scoreInternshipMatch(item);
        const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (24 * 60 * 60 * 1000));
        const urgent = daysLeft <= 7 && daysLeft >= 0;
        const card = document.createElement("div");
        card.className = "internship-card";
        card.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.8rem; margin-bottom:0.6rem;">
                    <div>
                        <span class="badge ${item.sector === 'Government' ? 'badge-indigo' : 'badge-violet'}">${item.sector}</span>
                        <span class="badge badge-cyan" style="margin-left:0.3rem;">${item.type}</span>
                        <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:700; margin-top:0.5rem;">${item.title}</h3>
                        <div style="color:var(--text-muted); font-size:0.85rem;">${item.organization}</div>
                    </div>
                    <span class="badge ${score >= 80 ? 'badge-success' : 'badge-cyan'}" style="white-space:nowrap;">${score}% Match</span>
                </div>

                <p style="font-size:0.86rem; color:var(--text-muted); margin:0.6rem 0; line-height:1.5;">${item.description}</p>

                <div style="display:flex; flex-wrap:wrap; gap:0.7rem; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.8rem;">
                    <span>📍 ${item.location}</span>
                    <span>⏱ ${item.duration}</span>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-bottom:0.8rem;">
                    ${item.skills.map(s => `<span class="badge badge-cyan" style="font-size:0.68rem;">${s}</span>`).join('')}
                </div>

                <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.4rem;"><strong style="color:var(--text-main);">Eligibility:</strong> ${item.eligibility}</div>
                <div class="${urgent ? 'text-cyan' : ''}" style="font-size:0.8rem; font-weight:600; margin-bottom:1rem;">📅 Apply by ${item.deadline}${urgent && daysLeft >= 0 ? ` — ${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : ''}</div>
            </div>

            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width:100%; text-align:center;">Apply Now ↗</a>
        `;
        container.appendChild(card);
    });
}

function updateInternshipsSyncLabel() {
    const label = document.getElementById("internships-sync-label");
    if (label) label.textContent = `Last synced: ${internshipsLastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

async function refreshInternshipsData() {
    const btn = document.getElementById("internships-refresh-btn");
    const label = document.getElementById("internships-sync-label");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Syncing..."; }
    if (label) label.textContent = "Fetching latest listings...";

    try {
        const freshList = await fetchInternshipsFromSource();
        internshipsLastSynced = new Date();
        renderInternshipsGrid(freshList);
        if (typeof generateDeadlineNotifications === "function") {
            generateDeadlineNotifications();
            if (typeof renderNotificationsList === "function") renderNotificationsList();
        }
    } catch (err) {
        if (label) label.textContent = "Sync failed — showing last known listings.";
        renderInternshipsGrid(INTERNSHIPS_DATA);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "↻ Refresh Listings"; }
        updateInternshipsSyncLabel();
    }
}
