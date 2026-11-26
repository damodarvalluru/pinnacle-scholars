// js/api.js — Frontend API client with loading states, errors & fallbacks

// CareerAI can be reached in three ways, in order of preference:
//   1. An explicitly deployed API, injected as window.CAREER_AI_API before this file.
//   2. The local dev API on port 3001 when the page is opened from a static dev server.
//   3. Same-origin /api routes when this page is served by career-ai/server/server.js
//      (the recommended single-origin deployment).
// Every candidate is tried in turn and the first working one is remembered, so
// the UI keeps working even if one endpoint is temporarily unavailable.
const API_BASE_CANDIDATES = (() => {
    const bases = [];
    if (window.CAREER_AI_API) bases.push(String(window.CAREER_AI_API).replace(/\/$/, ""));
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
        bases.push(`${window.location.protocol}//${host}:3001`);
    }
    // "" means same origin: /api/jobs, /api/courses, etc.
    bases.push("");
    return [...new Set(bases)];
})();
let activeApiBaseIndex = 0;

const apiCache = new Map();
const API_CACHE_TTL = 5 * 60 * 1000;

function getProfileQueryParams() {
    const profile = typeof careerProfile !== "undefined" ? careerProfile : { skills: [], interests: [], level: "Intermediate" };
    const params = new URLSearchParams();
    if (profile.skills?.length) params.set("skills", profile.skills.join(","));
    if (profile.interests?.length) params.set("interests", profile.interests.join(","));
    // careerProfile stores the selected level as `level`; older copies used
    // `skillLevel`. Support both so the profile selector really reaches the API.
    const level = profile.skillLevel || profile.level;
    if (level) params.set("level", level);
    return params.toString();
}

async function apiFetch(endpoint, { useCache = true, timeout = 15000 } = {}) {
    const cacheKey = endpoint;
    if (useCache && apiCache.has(cacheKey)) {
        const entry = apiCache.get(cacheKey);
        if (Date.now() - entry.time < API_CACHE_TTL) return entry.data;
    }

    let lastError = null;
    const attemptCount = API_BASE_CANDIDATES.length;

    for (let attempt = 0; attempt < attemptCount; attempt++) {
        const index = (activeApiBaseIndex + attempt) % attemptCount;
        const base = API_BASE_CANDIDATES[index];
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(`${base}${endpoint}`, {
                signal: controller.signal,
                // An explicit refresh must not be answered from the browser cache.
                cache: useCache ? "default" : "no-store"
            });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            activeApiBaseIndex = index;
            if (useCache) apiCache.set(cacheKey, { time: Date.now(), data });
            return data;
        } catch (err) {
            clearTimeout(timer);
            lastError = err;
        }
    }

    return {
        fallback: true,
        error: lastError && lastError.name === "AbortError"
            ? "Request timed out"
            : (lastError ? lastError.message : "API server not configured — using local data")
    };
}

function renderLoadingState(container, message = "Fetching live data…") {
    if (!container) return;
    container.innerHTML = `
        <div class="api-state api-loading">
            <div class="loader-orbit"><span></span><span></span><span></span></div>
            <p>${message}</p>
        </div>`;
}

function renderErrorState(container, message, onRetry) {
    if (!container) return;
    container.innerHTML = `
        <div class="api-state api-error">
            <div class="api-state-icon">⚠</div>
            <h4>Unable to load live data</h4>
            <p>${message}</p>
            ${onRetry ? `<button class="btn btn-secondary btn-sm" onclick="${onRetry}">Retry ↺</button>` : ""}
        </div>`;
}

function renderEmptyState(container, message = "No results found for your profile.") {
    if (!container) return;
    container.innerHTML = `
        <div class="api-state api-empty">
            <div class="api-state-icon">🔍</div>
            <h4>No matches yet</h4>
            <p>${message}</p>
        </div>`;
}

function renderSourceBadge(source, liveCount) {
    if (!source) return "";
    const label = source.includes("live") ? `Live · ${liveCount || 0} fetched` : "Curated fallback";
    return `<span class="badge badge-success source-badge">${label}</span>`;
}

async function fetchLiveJobs(options) {
    const bust = !!options && options.useCache === false;
    return apiFetch(`/api/jobs?${getProfileQueryParams()}${bust ? "&refresh=1" : ""}`, options);
}

async function fetchLiveInternships(options) {
    const bust = !!options && options.useCache === false;
    return apiFetch(`/api/internships?${getProfileQueryParams()}${bust ? "&refresh=1" : ""}`, options);
}

async function fetchLiveCourses(options) {
    const bust = !!options && options.useCache === false;
    return apiFetch(`/api/courses?${getProfileQueryParams()}${bust ? "&refresh=1" : ""}`, options);
}

async function fetchDeadlines() {
    return apiFetch("/api/deadlines", { useCache: false });
}

function invalidateApiCache() { apiCache.clear(); }

/** Formats a sync timestamp for the feed status labels. */
function feedClock(date) {
    return date instanceof Date && !isNaN(date) ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
}
