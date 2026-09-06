// js/interview.js - AI Interview Practice Engine

const INTERVIEW_LEVEL_QUESTIONS = {
    Beginner: [
        "Walk me through a project you built during your degree. What was your specific contribution?",
        "How do you approach debugging a piece of code that isn't producing the expected output?",
        "What does version control (like Git) let a team do that they couldn't do otherwise?",
        "Describe the difference between a function and a variable in your own words."
    ],
    Intermediate: [
        "Describe a time you had to optimize slow code or a slow query. What did you change and why?",
        "How would you design the database schema for a simple job-application tracking system?",
        "Tell me about a disagreement you had with a teammate over a technical decision. How was it resolved?",
        "What trade-offs would you consider when choosing between a SQL and a NoSQL database for a new project?"
    ],
    Advanced: [
        "How would you design a system that needs to handle 10,000 concurrent users with sub-200ms response times?",
        "Describe a production incident you were involved in (or would handle) — how would you triage and resolve it?",
        "How do you decide when to introduce a message queue or event-driven architecture into a system?",
        "Walk me through how you'd approach mentoring a junior engineer who keeps shipping bugs under deadline pressure."
    ]
};

const INTERVIEW_SKILL_QUESTION_TEMPLATES = [
    skill => `Explain a core concept in ${skill} that you think junior developers often misunderstand.`,
    skill => `Tell me about a project where you applied ${skill} to solve a real problem. What was the outcome?`,
    skill => `How would you explain ${skill} to a non-technical stakeholder in under two minutes?`
];

const INTERVIEW_INTEREST_QUESTION_TEMPLATES = [
    interest => `What draws you to ${interest} as a career direction, and where do you see it heading in the next few years?`,
    interest => `What's a recent development in ${interest} that you found genuinely interesting, and why?`
];

const INTERVIEW_CLOSING_QUESTIONS = [
    "Where do you see yourself professionally in three years, and what's your plan to get there?",
    "Why should we choose you over another candidate with similar technical skills?"
];

let interviewState = {
    phase: "setup", // setup -> active -> done
    level: "Intermediate",
    skills: [],
    interests: [],
    questions: [],
    currentIndex: 0,
    answers: {}
};

function initAIInterview() {
    renderInterviewSetup();
}

function renderInterviewSetup() {
    const container = document.getElementById("interview-container");
    if (!container) return;

    const defaultSkills = careerProfile && careerProfile.skills && careerProfile.skills.length ? careerProfile.skills : PROFILE_DEFAULTS.skills.slice(0, 6);
    const defaultInterests = careerProfile && careerProfile.interests && careerProfile.interests.length ? careerProfile.interests : PROFILE_DEFAULTS.interests.slice(0, 4);

    container.innerHTML = `
        <div class="toolkit-card interview-card">
            <span class="badge badge-indigo">Before We Start</span>
            <h3 style="font-family:var(--font-heading); margin:0.8rem 0 0.4rem;">Configure Your Mock Interview</h3>
            <p class="text-muted" style="font-size:0.9rem; margin-bottom:1.5rem;">Tell the AI Interviewer your level, skills, and interests — it will generate at least 7 tailored questions.</p>

            <div class="form-group">
                <label class="form-label">Your Skill Level</label>
                <select id="interview-level-select" class="select-text">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate" selected>Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>

            <div class="form-group">
                <span class="form-label">Skills to Focus On</span>
                <div class="chip-list" id="interview-skill-chips">
                    ${[...new Set([...PROFILE_DEFAULTS.skills])].map(s => `<button type="button" class="chip ${defaultSkills.includes(s) ? "selected" : ""}" data-skill="${s}" onclick="toggleInterviewChip(this,'skill')">${s}</button>`).join('')}
                </div>
            </div>

            <div class="form-group">
                <span class="form-label">Interests (optional)</span>
                <div class="chip-list" id="interview-interest-chips">
                    ${[...new Set([...PROFILE_DEFAULTS.interests])].map(i => `<button type="button" class="chip ${defaultInterests.includes(i) ? "selected" : ""}" data-interest="${i}" onclick="toggleInterviewChip(this,'interest')">${i}</button>`).join('')}
                </div>
            </div>

            <button class="btn btn-primary" style="width:100%; margin-top:0.5rem;" onclick="startAIInterview()">Start AI Interview →</button>
        </div>
    `;
}

function toggleInterviewChip(el, type) {
    el.classList.toggle("selected");
}

function startAIInterview() {
    const level = document.getElementById("interview-level-select").value;
    const skills = [...document.querySelectorAll("#interview-skill-chips .chip.selected")].map(el => el.dataset.skill);
    const interests = [...document.querySelectorAll("#interview-interest-chips .chip.selected")].map(el => el.dataset.interest);

    interviewState.level = level;
    interviewState.skills = skills;
    interviewState.interests = interests;
    interviewState.questions = buildInterviewQuestions(level, skills, interests);
    interviewState.currentIndex = 0;
    interviewState.answers = {};
    interviewState.phase = "active";

    renderInterviewQuestion();
}

function buildInterviewQuestions(level, skills, interests) {
    const questions = [];
    const levelBank = INTERVIEW_LEVEL_QUESTIONS[level] || INTERVIEW_LEVEL_QUESTIONS.Intermediate;
    questions.push(...levelBank.slice(0, 3).map(q => ({ text: q, tag: "Behavioral" })));

    skills.slice(0, 3).forEach((skill, i) => {
        const template = INTERVIEW_SKILL_QUESTION_TEMPLATES[i % INTERVIEW_SKILL_QUESTION_TEMPLATES.length];
        questions.push({ text: template(skill), tag: "Technical: " + skill });
    });

    interests.slice(0, 2).forEach((interest, i) => {
        const template = INTERVIEW_INTEREST_QUESTION_TEMPLATES[i % INTERVIEW_INTEREST_QUESTION_TEMPLATES.length];
        questions.push({ text: template(interest), tag: "Interest: " + interest });
    });

    questions.push(...INTERVIEW_CLOSING_QUESTIONS.map(q => ({ text: q, tag: "Closing" })));

    // Ensure a minimum of 7 questions regardless of how few skills/interests were chosen
    let fallbackIndex = 3;
    while (questions.length < 7 && fallbackIndex < levelBank.length) {
        questions.push({ text: levelBank[fallbackIndex], tag: "Behavioral" });
        fallbackIndex++;
    }

    return questions;
}

function renderInterviewQuestion() {
    const container = document.getElementById("interview-container");
    if (!container) return;

    if (interviewState.phase === "done") {
        renderInterviewCompletion(container);
        return;
    }

    const total = interviewState.questions.length;
    const q = interviewState.questions[interviewState.currentIndex];
    const progress = Math.round(((interviewState.currentIndex) / total) * 100);
    const savedAnswer = interviewState.answers[interviewState.currentIndex] || "";

    container.innerHTML = `
        <div class="toolkit-card interview-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <span class="badge badge-indigo">${q.tag}</span>
                <span style="font-size:0.8rem; color:var(--text-muted);">Question ${interviewState.currentIndex + 1} of ${total}</span>
            </div>
            <div style="height:6px; overflow:hidden; border-radius:99px; background:rgba(148,163,184,.15); margin:-0.35rem 0 1.15rem;"><div style="height:100%; width:${progress}%; border-radius:inherit; background:linear-gradient(90deg,var(--primary),var(--violet)); transition:width .45s ease;"></div></div>

            <h4 style="font-family:var(--font-heading); font-weight:700; font-size:1.2rem; margin-bottom:1.2rem; line-height:1.5;">${q.text}</h4>

            <textarea id="interview-answer-textarea" class="code-textarea" style="min-height:140px; margin-bottom:1.2rem;" placeholder="Type your answer as you would say it out loud...">${savedAnswer}</textarea>

            <div style="display:flex; gap:0.8rem;">
                ${interviewState.currentIndex > 0 ? `<button class="btn btn-secondary btn-sm" style="flex:1;" onclick="navigateInterviewQuestion(-1)">← Previous</button>` : ""}
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="navigateInterviewQuestion(1)">${interviewState.currentIndex === total - 1 ? "Finish Interview ✓" : "Next Question →"}</button>
            </div>
        </div>
    `;
}

function navigateInterviewQuestion(direction) {
    const textarea = document.getElementById("interview-answer-textarea");
    if (textarea) interviewState.answers[interviewState.currentIndex] = textarea.value;

    if (direction > 0 && interviewState.currentIndex === interviewState.questions.length - 1) {
        interviewState.phase = "done";
        renderInterviewQuestion();
        return;
    }

    interviewState.currentIndex += direction;
    if (interviewState.currentIndex < 0) interviewState.currentIndex = 0;
    renderInterviewQuestion();
}

function renderInterviewCompletion(container) {
    const total = interviewState.questions.length;
    const answered = Object.values(interviewState.answers).filter(a => a && a.trim().length > 0).length;
    const avgLen = answered ? Math.round(Object.values(interviewState.answers).reduce((sum, a) => sum + a.trim().length, 0) / answered) : 0;
    const depthLabel = avgLen > 220 ? "Thorough & Detailed" : avgLen > 90 ? "Solid Coverage" : "Consider Adding More Detail";

    container.innerHTML = `
        <div class="toolkit-card interview-card" style="text-align:center;">
            <span class="badge badge-success">Interview Complete</span>
            <h3 class="text-gradient" style="font-family:var(--font-heading); font-size:1.8rem; margin:0.8rem 0 0.4rem;">Great Effort, ${careerProfile && careerProfile.name ? careerProfile.name : "Candidate"}!</h3>
            <p class="text-muted" style="margin-bottom:1.2rem; font-size:0.95rem;">You answered ${answered} of ${total} questions at the <strong>${interviewState.level}</strong> level.</p>

            <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem;">
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.75rem; color:var(--text-muted);">Questions Answered</div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--primary);">${answered} / ${total}</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.75rem; color:var(--text-muted);">Answer Depth</div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--success);">${depthLabel}</div>
                </div>
            </div>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:1.5rem;">Tip: Use the STAR method (Situation, Task, Action, Result) to structure behavioral answers, and lead technical answers with the trade-off you chose and why.</p>
            <button class="btn btn-secondary btn-sm" onclick="renderInterviewSetup()">Configure New Interview ↺</button>
        </div>
    `;
}
