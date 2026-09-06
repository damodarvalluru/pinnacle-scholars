// courses.js - Realistic dataset of 15+ free courses with authentic platforms and links

const COURSES_DATA = [
    {
        id: "course-1",
        title: "Scientific Computing with Python Certification",
        platform: "freeCodeCamp",
        skill: "Python",
        difficulty: "Beginner",
        duration: "300 Hours",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        category: ["Python", "Data Analysis", "Software Development"]
    },
    {
        id: "course-2",
        title: "Machine Learning Specialization Foundations",
        platform: "Coursera / Stanford (Free Audit)",
        skill: "Machine Learning",
        difficulty: "Intermediate",
        duration: "6 Weeks",
        freeIndicator: "Free Audit Available",
        isPaid: false,
        url: "https://www.coursera.org/learn/machine-learning",
        category: ["Machine Learning", "Artificial Intelligence", "Data Science"]
    },
    {
        id: "course-3",
        title: "AWS Cloud Practitioner Essentials",
        platform: "AWS Skill Builder",
        skill: "AWS",
        difficulty: "Beginner",
        duration: "6 Hours",
        freeIndicator: "Official Free Course",
        isPaid: false,
        url: "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
        category: ["AWS", "Cloud Computing", "DevOps"]
    },
    {
        id: "course-4",
        title: "CS50's Introduction to Computer Science",
        platform: "Harvard University / edX",
        skill: "C",
        difficulty: "Beginner to Intermediate",
        duration: "12 Weeks",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://pll.harvard.edu/course/cs50-introduction-computer-science",
        category: ["C", "C++", "Python", "SQL", "HTML", "CSS", "JavaScript"]
    },
    {
        id: "course-5",
        title: "Responsive Web Design Certification",
        platform: "freeCodeCamp",
        skill: "HTML & CSS",
        difficulty: "Beginner",
        duration: "300 Hours",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        category: ["HTML", "CSS", "Web Development", "UI/UX Design"]
    },
    {
        id: "course-6",
        title: "JavaScript Algorithms & Data Structures",
        platform: "freeCodeCamp",
        skill: "JavaScript",
        difficulty: "Intermediate",
        duration: "300 Hours",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
        category: ["JavaScript", "Web Development", "Software Development"]
    },
    {
        id: "course-7",
        title: "Google Cybersecurity Professional Certificate",
        platform: "Google / Coursera (Free Trial)",
        skill: "Cybersecurity",
        difficulty: "Beginner",
        duration: "3 Months",
        freeIndicator: "Free Access",
        isPaid: false,
        url: "https://www.coursera.org/professional-certificates/google-cybersecurity",
        category: ["Cybersecurity", "Networking", "SQL", "Python"]
    },
    {
        id: "course-8",
        title: "Microsoft Azure Fundamentals (AZ-900)",
        platform: "Microsoft Learn",
        skill: "Azure",
        difficulty: "Beginner",
        duration: "10 Hours",
        freeIndicator: "Official Free Course",
        isPaid: false,
        url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        category: ["Azure", "Cloud Computing"]
    },
    {
        id: "course-9",
        title: "Docker & Kubernetes for Beginners",
        platform: "Kubernetes.io / CNCF Labs",
        skill: "Docker & Kubernetes",
        difficulty: "Intermediate",
        duration: "15 Hours",
        freeIndicator: "Free Hands-on Labs",
        isPaid: false,
        url: "https://kubernetes.io/docs/tutorials/",
        category: ["Docker", "Kubernetes", "DevOps", "Cloud Computing"]
    },
    {
        id: "course-10",
        title: "SQL for Data Science & Data Analysis",
        platform: "Khan Academy",
        skill: "SQL",
        difficulty: "Beginner",
        duration: "8 Hours",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://www.khanacademy.org/computing/computer-programming/sql",
        category: ["SQL", "Data Analysis", "Database Management"]
    },
    {
        id: "course-11",
        title: "Full Stack Open - Modern Web Development",
        platform: "University of Helsinki",
        skill: "React & Node.js",
        difficulty: "Intermediate",
        duration: "8 Weeks",
        freeIndicator: "100% Free",
        isPaid: false,
        url: "https://fullstackopen.com/en/",
        category: ["React", "Node.js", "JavaScript", "Web Development"]
    },
    {
        id: "course-12",
        title: "Git and GitHub for Beginners - Crash Course",
        platform: "freeCodeCamp YouTube",
        skill: "Git/GitHub",
        difficulty: "Beginner",
        duration: "2 Hours",
        freeIndicator: "100% Free Video",
        isPaid: false,
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        category: ["Git/GitHub", "Software Development"]
    },
    {
        id: "course-13",
        title: "Google AI for Anyone",
        platform: "Google / edX",
        skill: "Machine Learning",
        difficulty: "Beginner",
        duration: "4 Weeks",
        freeIndicator: "Free Audit",
        isPaid: false,
        url: "https://www.edx.org/learn/artificial-intelligence/google-google-ai-for-anyone",
        category: ["Artificial Intelligence", "Machine Learning"]
    },
    {
        id: "course-14",
        title: "Introduction to Networking (CCNA Prep)",
        platform: "Cisco Networking Academy",
        skill: "Networking",
        difficulty: "Beginner",
        duration: "70 Hours",
        freeIndicator: "Official Free Course",
        isPaid: false,
        url: "https://www.netacad.com/courses/networking/networking-basics",
        category: ["Networking", "Cybersecurity"]
    },
    {
        id: "course-15",
        title: "Effective Communication & Professional Leadership",
        platform: "MIT OpenCourseWare",
        skill: "Leadership & Communication",
        difficulty: "All Levels",
        duration: "Self-Paced",
        freeIndicator: "100% Free Open Course",
        isPaid: false,
        url: "https://ocw.mit.edu/courses/15-279-management-communication-for-undergraduates-fall-2012/",
        category: ["Communication", "Leadership", "Problem Solving"]
    },
    {
        id: "course-16",
        title: "Google Data Analytics Professional Certificate",
        platform: "Google / Coursera",
        skill: "Data Analysis",
        difficulty: "Beginner",
        duration: "6 Months",
        freeIndicator: "Paid — ~$49/mo (Financial Aid Available)",
        isPaid: true,
        price: "$49/mo",
        url: "https://www.coursera.org/professional-certificates/google-data-analytics",
        category: ["Data Analysis", "SQL", "Data Science"]
    },
    {
        id: "course-17",
        title: "The Complete 2026 Web Development Bootcamp",
        platform: "Udemy",
        skill: "Full Stack Web Development",
        difficulty: "Beginner to Advanced",
        duration: "60+ Hours",
        freeIndicator: "Paid — One-time purchase",
        isPaid: true,
        price: "$12.99 – $89.99",
        url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
        category: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Web Development"]
    },
    {
        id: "course-18",
        title: "Grokking the System Design Interview",
        platform: "Educative.io",
        skill: "System Design",
        difficulty: "Advanced",
        duration: "20 Hours",
        freeIndicator: "Paid — Subscription",
        isPaid: true,
        price: "$59/mo",
        url: "https://www.educative.io/courses/grokking-the-system-design-interview",
        category: ["Software Development", "Cloud Computing", "Database Management"]
    },
    {
        id: "course-19",
        title: "AWS Certified Solutions Architect – Associate",
        platform: "A Cloud Guru / Pluralsight",
        skill: "AWS",
        difficulty: "Intermediate",
        duration: "35 Hours",
        freeIndicator: "Paid — Subscription",
        isPaid: true,
        price: "$39/mo",
        url: "https://www.pluralsight.com/cloud-guru",
        category: ["AWS", "Cloud Computing", "DevOps"]
    },
    {
        id: "course-20",
        title: "Machine Learning A-Z: AI, Python & R",
        platform: "Udemy",
        skill: "Machine Learning",
        difficulty: "Intermediate",
        duration: "44 Hours",
        freeIndicator: "Paid — One-time purchase",
        isPaid: true,
        price: "$14.99 – $84.99",
        url: "https://www.udemy.com/course/machinelearning/",
        category: ["Machine Learning", "Artificial Intelligence", "Python"]
    }
];

/* ==========================================================================
   COURSES SECTION — RENDERING, FREE/PAID TABS & PROFILE-BASED FILTERING
   Data ships as a curated, regularly-updatable dataset. fetchCoursesFromSource()
   is the swap-in boundary for a real courses API/backend later.
   ========================================================================== */
let coursesActiveTab = "All";
let coursesLastSynced = new Date();

async function fetchCoursesFromSource() {
    return new Promise(resolve => {
        setTimeout(() => resolve([...COURSES_DATA]), 600);
    });
}

function scoreCourseMatch(course) {
    if (typeof careerProfile === "undefined") return 0;
    const hits = course.category.filter(c => careerProfile.skills.some(v => v.toLowerCase() === c.toLowerCase()) || careerProfile.interests.some(v => v.toLowerCase() === c.toLowerCase())).length;
    return Math.min(96, 50 + hits * 12);
}

function initCoursesSection() {
    renderCoursesGrid(COURSES_DATA);
    updateCoursesSyncLabel();
}

function setCoursesTab(tab) {
    coursesActiveTab = tab;
    document.querySelectorAll(".courses-tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    filterCoursesList();
}

function getFilteredCourses() {
    const query = document.getElementById("course-search-input") ? document.getElementById("course-search-input").value.toLowerCase() : "";
    return COURSES_DATA.filter(c => {
        const matchesQuery = c.title.toLowerCase().includes(query) || c.skill.toLowerCase().includes(query) || c.platform.toLowerCase().includes(query);
        const matchesTab = coursesActiveTab === "All" || (coursesActiveTab === "Free" && !c.isPaid) || (coursesActiveTab === "Paid" && c.isPaid);
        return matchesQuery && matchesTab;
    }).sort((a, b) => scoreCourseMatch(b) - scoreCourseMatch(a));
}

function filterCoursesList() {
    renderCoursesGrid(getFilteredCourses());
}

function renderCoursesGrid(list) {
    const container = document.getElementById("courses-grid");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem;" class="text-muted">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">📚</div>
                <h4>No matching courses found</h4>
                <p style="font-size:0.9rem;">Try a different search term or switch tabs.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    list.forEach(course => {
        const score = scoreCourseMatch(course);
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.8rem; margin-bottom:0.6rem;">
                    <span class="badge ${course.isPaid ? 'badge-danger' : 'badge-success'}">${course.isPaid ? (course.price || 'Paid') : course.freeIndicator}</span>
                    <span class="badge badge-cyan">${score}% Fit</span>
                </div>
                <h3 style="font-family:var(--font-heading); font-size:1.1rem; font-weight:700; margin-bottom:0.2rem;">${course.title}</h3>
                <div style="color:var(--text-muted); font-size:0.82rem; margin-bottom:0.6rem;">${course.platform}</div>

                <div style="display:flex; flex-wrap:wrap; gap:0.7rem; font-size:0.78rem; color:var(--text-muted); margin-bottom:0.7rem;">
                    <span>🎯 ${course.difficulty}</span>
                    <span>⏱ ${course.duration}</span>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-bottom:1rem;">
                    ${course.category.slice(0, 4).map(c => `<span class="badge badge-indigo" style="font-size:0.68rem;">${c}</span>`).join('')}
                </div>
            </div>

            <a href="${course.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width:100%; text-align:center;">View Course ↗</a>
        `;
        container.appendChild(card);
    });
}

function updateCoursesSyncLabel() {
    const label = document.getElementById("courses-sync-label");
    if (label) label.textContent = `Last synced: ${coursesLastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

async function refreshCoursesData() {
    const btn = document.getElementById("courses-refresh-btn");
    const label = document.getElementById("courses-sync-label");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Syncing..."; }
    if (label) label.textContent = "Fetching latest courses...";

    try {
        const freshList = await fetchCoursesFromSource();
        coursesLastSynced = new Date();
        renderCoursesGrid(freshList);
    } catch (err) {
        if (label) label.textContent = "Sync failed — showing last known catalog.";
        renderCoursesGrid(COURSES_DATA);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "↻ Refresh Courses"; }
        updateCoursesSyncLabel();
    }
}
