// server/server.js — Live data aggregation API with caching, deduplication & fallbacks
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || "900000", 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

const cache = new Map();

function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > CACHE_TTL) { cache.delete(key); return null; }
    return entry.data;
}
function setCache(key, data) { cache.set(key, { time: Date.now(), data }); }

function dedupe(items, keyFn) {
    const seen = new Set();
    return items.filter(item => {
        const k = keyFn(item).toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

function loadJson(relativePath) {
    try {
        const raw = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
        const match = raw.match(/(?:const|let|var)\s+\w+\s*=\s*(\[[\s\S]*?\]);/);
        if (match) return JSON.parse(match[1]);
    } catch (_) {}
    return [];
}

async function fetchRemotiveJobs() {
    const res = await fetch("https://remotive.com/api/remote-jobs", {
        headers: { "User-Agent": "CareerAI/1.0" },
        timeout: 12000
    });
    if (!res.ok) throw new Error(`Remotive ${res.status}`);
    const data = await res.json();
    return (data.jobs || []).map(j => ({
        id: `remotive-${j.id}`,
        title: j.title,
        organization: j.company_name,
        sector: "Private",
        location: j.candidate_required_location || "Remote",
        workType: (j.job_type || "").toLowerCase().includes("remote") ? "Remote" : "Hybrid",
        jobCategory: j.job_type || "Full-time",
        experience: inferExperience(j.title, j.description),
        salary: j.salary || "Salary not disclosed",
        postedDate: j.publication_date ? j.publication_date.split("T")[0] : null,
        deadline: null,
        requiredSkills: (j.tags || []).slice(0, 8),
        interests: mapTagsToInterests(j.tags || []),
        description: stripHtml(j.description || "").slice(0, 500),
        applyUrl: j.url,
        source: "remotive",
        nextSkillsToLearn: (j.tags || []).slice(0, 4)
    }));
}

async function fetchArbeitnowJobs() {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        headers: { "User-Agent": "CareerAI/1.0" },
        timeout: 12000
    });
    if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(j => ({
        id: `arbeitnow-${j.slug}`,
        title: j.title,
        organization: j.company_name,
        sector: "Private",
        location: j.location || "Remote",
        workType: j.remote ? "Remote" : "On-site",
        jobCategory: j.job_types?.[0] || "Full-time",
        experience: inferExperience(j.title, j.description),
        salary: "Salary not disclosed",
        postedDate: j.created_at ? new Date(j.created_at * 1000).toISOString().split("T")[0] : null,
        deadline: null,
        requiredSkills: (j.tags || []).slice(0, 8),
        interests: mapTagsToInterests(j.tags || []),
        description: stripHtml(j.description || "").slice(0, 500),
        applyUrl: j.url,
        source: "arbeitnow",
        nextSkillsToLearn: (j.tags || []).slice(0, 4)
    }));
}

async function fetchAdzunaJobs(query = "software") {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return [];
    const country = process.env.ADZUNA_COUNTRY || "us";
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${encodeURIComponent(query)}`;
    const res = await fetch(url, { timeout: 12000 });
    if (!res.ok) throw new Error(`Adzuna ${res.status}`);
    const data = await res.json();
    return (data.results || []).map(j => ({
        id: `adzuna-${j.id}`,
        title: j.title,
        organization: j.company?.display_name || "Unknown",
        sector: "Private",
        location: j.location?.display_name || "Unknown",
        workType: "On-site",
        jobCategory: j.contract_type || "Full-time",
        experience: inferExperience(j.title, j.description),
        salary: j.salary_min ? `$${j.salary_min} - $${j.salary_max}` : "Salary not disclosed",
        postedDate: j.created ? j.created.split("T")[0] : null,
        deadline: null,
        requiredSkills: extractSkillsFromText(`${j.title} ${j.description}`),
        interests: [],
        description: stripHtml(j.description || "").slice(0, 500),
        applyUrl: j.redirect_url,
        source: "adzuna",
        nextSkillsToLearn: []
    }));
}

async function fetchLiveCourses(skills = []) {
    const queries = skills.length ? skills.slice(0, 3) : ["python", "javascript", "machine learning"];
    const results = [];
    for (const q of queries) {
        try {
            const url = `https://api.classcentral.com/universities/all/courses?q=${encodeURIComponent(q)}&limit=5`;
            const res = await fetch(url, { headers: { "User-Agent": "CareerAI/1.0" }, timeout: 8000 });
            if (!res.ok) continue;
            const data = await res.json();
            (data.courses || data.results || []).forEach(c => {
                results.push({
                    id: `classcentral-${c.id || c.slug || Math.random()}`,
                    title: c.name || c.title,
                    platform: c.institution || c.provider || "Class Central",
                    skill: q,
                    difficulty: c.level || "All Levels",
                    duration: c.duration || "Self-Paced",
                    freeIndicator: c.is_free || c.free ? "Free" : "Paid",
                    rating: c.rating || c.average_rating || null,
                    url: c.url || c.link || `https://www.classcentral.com/search?q=${encodeURIComponent(q)}`,
                    category: [q],
                    source: "classcentral"
                });
            });
        } catch (_) {}
    }
    return results;
}

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function inferExperience(title = "", desc = "") {
    const text = `${title} ${desc}`.toLowerCase();
    if (/senior|lead|principal|staff|architect|expert|10\+/.test(text)) return "Advanced";
    if (/intern|fresher|graduate|entry|junior|0-1|beginner/.test(text)) return "Beginner";
    if (/mid|intermediate|2-5|3\+/.test(text)) return "Intermediate";
    return "Intermediate";
}

function mapTagsToInterests(tags) {
    const map = {
        python: "Data Science", javascript: "Web Development", react: "Web Development",
        aws: "Cloud Computing", devops: "DevOps", security: "Cybersecurity",
        design: "UI/UX Design", marketing: "Digital Marketing", ai: "Artificial Intelligence",
        ml: "Machine Learning", mobile: "Mobile Development"
    };
    return tags.map(t => map[t.toLowerCase()] || "Software Development").slice(0, 4);
}

function extractSkillsFromText(text) {
    const known = ["Python", "JavaScript", "React", "SQL", "AWS", "Java", "C++", "Docker", "Kubernetes", "Machine Learning", "Node.js", "HTML", "CSS", "Git"];
    const lower = text.toLowerCase();
    return known.filter(s => lower.includes(s.toLowerCase())).slice(0, 6);
}

function scoreByProfile(item, profile) {
    let score = 0;
    const skills = profile.skills || [];
    const interests = profile.interests || [];
    const level = profile.skillLevel || "Intermediate";
    const itemSkills = item.requiredSkills || item.skills || item.category || [];
    skills.forEach(s => { if (itemSkills.some(is => is.toLowerCase().includes(s.toLowerCase()))) score += 5; });
    interests.forEach(i => { if ((item.interests || []).some(ii => ii.toLowerCase().includes(i.toLowerCase()))) score += 4; });
    const exp = item.experience || item.difficulty || item.level;
    if (exp && exp.toLowerCase().includes(level.toLowerCase())) score += 8;
    return score;
}

function sortByProfile(items, profile) {
    return [...items].sort((a, b) => scoreByProfile(b, profile) - scoreByProfile(a, profile));
}

function toInternship(job) {
    return {
        id: job.id,
        title: job.title,
        organization: job.organization,
        sector: job.sector,
        skills: job.requiredSkills || [],
        location: job.location,
        type: job.workType,
        duration: job.jobCategory || "Flexible",
        stipend: job.salary || "Stipend not disclosed",
        eligibility: "See official listing for eligibility requirements",
        deadline: job.deadline || "Rolling applications",
        url: job.applyUrl,
        description: job.description,
        source: job.source || "live"
    };
}

// ─── Routes ───────────────────────────────────────────────────────────────

app.get("/api/health", (_, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.get("/api/jobs", async (req, res) => {
    const profile = {
        skills: (req.query.skills || "").split(",").filter(Boolean),
        interests: (req.query.interests || "").split(",").filter(Boolean),
        skillLevel: req.query.level || "Intermediate"
    };
    const cacheKey = `jobs-${JSON.stringify(profile)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const fallback = loadJson("js/jobs.js");
    let live = [], errors = [], source = "fallback";

    const fetchers = [
        fetchRemotiveJobs().catch(e => { errors.push(e.message); return []; }),
        fetchArbeitnowJobs().catch(e => { errors.push(e.message); return []; }),
        fetchAdzunaJobs("software engineer").catch(e => { errors.push(e.message); return []; })
    ];
    const batches = await Promise.all(fetchers);
    live = dedupe(batches.flat(), j => `${j.title}-${j.organization}`);

    let jobs = live.length ? dedupe([...live, ...fallback], j => `${j.title}-${j.organization}`) : fallback;
    jobs = sortByProfile(jobs, profile);

    const payload = {
        jobs,
        count: jobs.length,
        source: live.length ? "live+curated" : "curated-fallback",
        liveCount: live.length,
        errors: errors.length ? errors : undefined,
        cached: false
    };
    setCache(cacheKey, { ...payload, cached: true });
    res.json(payload);
});

app.get("/api/internships", async (req, res) => {
    const profile = {
        skills: (req.query.skills || "").split(",").filter(Boolean),
        interests: (req.query.interests || "").split(",").filter(Boolean),
        skillLevel: req.query.level || "Intermediate"
    };
    const cacheKey = `internships-${JSON.stringify(profile)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const fallback = loadJson("js/internships.js");
    let live = [], errors = [];

    try {
        const [remotive, arbeitnow] = await Promise.all([
            fetchRemotiveJobs().catch(e => { errors.push(e.message); return []; }),
            fetchArbeitnowJobs().catch(e => { errors.push(e.message); return []; })
        ]);
        const all = [...remotive, ...arbeitnow];
        live = all.filter(j => /intern|internship|graduate|fellow|trainee|apprentice/i.test(`${j.title} ${j.description}`));
    } catch (e) { errors.push(e.message); }

    let internships = live.length
        ? dedupe([...live.map(toInternship), ...fallback], i => `${i.title}-${i.organization}`)
        : fallback;

    internships = sortByProfile(internships.map(i => ({
        ...i,
        requiredSkills: i.skills,
        experience: profile.skillLevel
    })), profile).map(i => {
        const { requiredSkills, experience, ...rest } = i;
        return rest;
    });

    const payload = {
        internships,
        count: internships.length,
        source: live.length ? "live+curated" : "curated-fallback",
        liveCount: live.length,
        errors: errors.length ? errors : undefined,
        refreshedAt: new Date().toISOString()
    };
    setCache(cacheKey, payload);
    res.json(payload);
});

app.get("/api/courses", async (req, res) => {
    const profile = {
        skills: (req.query.skills || "").split(",").filter(Boolean),
        interests: (req.query.interests || "").split(",").filter(Boolean),
        skillLevel: req.query.level || "Intermediate"
    };
    const cacheKey = `courses-${JSON.stringify(profile)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const fallback = loadJson("js/courses.js");
    let live = [], errors = [];

    try {
        live = await fetchLiveCourses(profile.skills.length ? profile.skills : profile.interests);
    } catch (e) { errors.push(e.message); }

    let courses = live.length
        ? dedupe([...live, ...fallback], c => `${c.title}-${c.platform}`)
        : fallback;

    courses = sortByProfile(courses.map(c => ({
        ...c,
        requiredSkills: c.category || [c.skill],
        experience: c.difficulty
    })), profile).map(c => {
        const { requiredSkills, experience, ...rest } = c;
        return rest;
    });

    const payload = {
        courses,
        count: courses.length,
        source: live.length ? "live+curated" : "curated-fallback",
        liveCount: live.length,
        errors: errors.length ? errors : undefined,
        refreshedAt: new Date().toISOString()
    };
    setCache(cacheKey, payload);
    res.json(payload);
});

app.get("/api/deadlines", async (req, res) => {
    const jobs = loadJson("js/jobs.js");
    const internships = loadJson("js/internships.js");
    const deadlines = [];

    jobs.filter(j => j.deadline).forEach(j => {
        deadlines.push({
            id: `deadline-job-${j.id}`,
            category: "Job Deadline",
            title: `${j.title} — Application Closing`,
            message: `Apply before ${j.deadline} at ${j.organization}.`,
            deadline: j.deadline,
            type: "warning",
            link: j.applyUrl
        });
    });

    internships.forEach(i => {
        if (i.deadline && i.deadline !== "Rolling applications") {
            deadlines.push({
                id: `deadline-intern-${i.id}`,
                category: "Internship Deadline",
                title: `${i.title} — Internship Deadline`,
                message: `Application deadline: ${i.deadline} at ${i.organization}.`,
                deadline: i.deadline,
                type: "warning",
                link: i.url
            });
        }
    });

    res.json({ deadlines, count: deadlines.length });
});

app.listen(PORT, () => {
    console.log(`CareerAI API running at http://localhost:${PORT}`);
    console.log(`Static files served from project root`);
});
