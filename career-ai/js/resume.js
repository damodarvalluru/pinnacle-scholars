// js/resume.js - Resume Builder & ATS Sample Templates Engine

// Sample Resumes Dataset
const SAMPLE_RESUMES = [
    {
        id: "sample-btech",
        title: "B.Tech Computer Science Graduate",
        category: "Fresher / B.Tech",
        description: "Optimized for fresh engineering graduates targeting software development and entry-level IT roles.",
        atsScore: "98% ATS Compatible",
        sections: ["Contact Info", "Education (GPA)", "Core Technical Skills", "Academic Projects", "Certifications"]
    },
    {
        id: "sample-dev",
        title: "Full Stack Software Developer",
        category: "Software Engineering",
        description: "Highlighting web applications, API microservices, cloud deployments, and production GitHub repositories.",
        atsScore: "95% ATS Compatible",
        sections: ["Professional Summary", "Technical Stack", "Work Experience", "Open Source Projects", "Education"]
    },
    {
        id: "sample-data",
        title: "Data Analyst & Business Intelligence",
        category: "Data Science",
        description: "Focused on SQL queries, Python data pipelines, statistical reporting dashboards, and business insights.",
        atsScore: "96% ATS Compatible",
        sections: ["Summary", "Data Analytics Skills", "BI Dashboard Projects", "Work History", "Education"]
    },
    {
        id: "sample-cloud",
        title: "Cloud & DevOps Specialist",
        category: "Cloud / DevOps",
        description: "Tailored for containerized infrastructure, AWS/Azure architectures, Kubernetes orchestration, and CI/CD pipelines.",
        atsScore: "97% ATS Compatible",
        sections: ["Cloud Certifications", "DevOps Tools", "Infrastructure Projects", "Career Experience"]
    }
];

// Initialize Resume Builder Live Preview Sync
function initResumeBuilder() {
    const fields = ["rb-name", "rb-title", "rb-email", "rb-phone", "rb-skills", "rb-education", "rb-projects", "rb-experience"];
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", updateResumePreview);
        }
    });
    updateResumePreview();
}

function updateResumePreview() {
    const prevName = document.getElementById("prev-name");
    const prevTitle = document.getElementById("prev-title");
    const prevContact = document.getElementById("prev-contact");
    const prevSkills = document.getElementById("prev-skills");
    const prevEdu = document.getElementById("prev-edu");
    const prevProj = document.getElementById("prev-proj");
    const prevExp = document.getElementById("prev-exp");

    if (!prevName) return;

    const val = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : "");

    prevName.textContent = val("rb-name") || "Alex Morgan";
    prevTitle.textContent = val("rb-title") || "Software Engineer / AI Enthusiast";
    prevContact.textContent = `${val("rb-email") || "alex.morgan@email.com"} • ${val("rb-phone") || "+1 (555) 019-2834"} • GitHub / LinkedIn`;

    const skills = val("rb-skills") || "Python, JavaScript, React, SQL, Git, AWS";
    prevSkills.innerHTML = skills.split(",").map(s => `<span class="badge badge-cyan" style="margin:0.2rem;">${s.trim()}</span>`).join('');

    prevEdu.textContent = val("rb-education") || "B.Tech in Computer Science & Engineering — GPA 3.8 / 4.0";
    prevProj.textContent = val("rb-projects") || "CareerAI Platform — Built responsive career guidance tool using JS and Chart.js";
    prevExp.textContent = val("rb-experience") || "Software Engineering Intern — NexusTech AI Labs (Worked on ML pipelines)";
}

function downloadBuiltResume() {
    const name = document.getElementById("rb-name") ? document.getElementById("rb-name").value.trim() : "Candidate";
    const content = `
===================================================================
${document.getElementById("prev-name").textContent}
${document.getElementById("prev-title").textContent}
${document.getElementById("prev-contact").textContent}
===================================================================

[ TECHNICAL SKILLS ]
${document.getElementById("rb-skills").value || "Python, JavaScript, SQL, React, Git"}

[ EDUCATION ]
${document.getElementById("rb-education").value || "B.Tech in Computer Science & Engineering"}

[ PROJECTS ]
${document.getElementById("rb-projects").value || "CareerAI Guidance Platform"}

[ WORK EXPERIENCE ]
${document.getElementById("rb-experience").value || "Software Engineering Intern"}

===================================================================
Generated via CareerAI Resume Builder — 100% ATS-Friendly Standard Format
    `;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name.replace(/\s+/g, "_")}_Resume_CareerAI.txt`;
    link.click();
}

function renderResumeSamples() {
    const container = document.getElementById("resume-samples-container");
    if (!container) return;

    container.innerHTML = "";
    SAMPLE_RESUMES.forEach(sample => {
        const card = document.createElement("div");
        card.className = "toolkit-card";
        card.innerHTML = `
            <div>
                <span class="badge badge-success">${sample.atsScore}</span>
                <h3 style="font-family:var(--font-heading); font-size:1.3rem; margin:0.8rem 0 0.3rem;" class="text-gradient">${sample.title}</h3>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${sample.category}</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1.2rem;">${sample.description}</p>
                
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-bottom:1.5rem;">
                    <div style="font-size:0.75rem; color:var(--primary); font-weight:700; margin-bottom:0.4rem;">KEY SECTIONS</div>
                    <div style="font-size:0.82rem; color:var(--text-muted);">${sample.sections.join(" • ")}</div>
                </div>
            </div>
            
            <button class="btn btn-secondary btn-sm" onclick="downloadSampleResumeTemplate('${sample.title}')">Download Sample Template (.TXT) ⬇</button>
        `;
        container.appendChild(card);
    });
}

function downloadSampleResumeTemplate(title) {
    const sampleText = `
${title.toUpperCase()} — SAMPLE RESUME TEMPLATE
-------------------------------------------------------------------
[CONTACT INFORMATION]
John Doe | email@example.com | +1 (555) 123-4567 | github.com/johndoe

[PROFESSIONAL SUMMARY]
Results-driven engineering candidate with strong foundations in software design, problem solving, and modern tech stacks.

[CORE COMPETENCIES]
Programming: Python, JavaScript, C++, SQL
Tools: Git/GitHub, Docker, Linux, VS Code

[EDUCATION]
Bachelor of Technology (B.Tech) in Computer Science & Engineering
State Technical University | Graduation: May 2026

[ACADEMIC & PERSONAL PROJECTS]
- Scalable Web Platform: Developed full-stack web app serving 1,000+ active users.
- Machine Learning Model: Trained classification model achieving 92% precision.

-------------------------------------------------------------------
Validated for ATS Keyword Scanning Engines
    `;
    const blob = new Blob([sampleText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Sample.txt`;
    link.click();
}
