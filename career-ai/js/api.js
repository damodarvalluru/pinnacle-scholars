// js/api.js — Frontend API client with loading states, errors & fallbacks

const API_BASE = (() => {
    if (window.CAREER_AI_API) return window.CAREER_AI_API;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return `${window.location.protocol}//${host}:3001`;
    return "";
})();

const apiCache = new Map();
const API_CACHE_TTL = 5 * 60 * 1000;

function getProfileQueryParams() {
    const profile = typeof careerProfile !== "undefined" ? careerProfile : { skills: [], interests: [], skillLevel: "Intermediate" };
    const params = new URLSearchParams();
    if (profile.skills?.length) params.set("skills", profile.skills.join(","));
    if (profile.interests?.length) params.set("interests", profile.interests.join(","));
    if (profile.skillLevel) params.set("level", profile.skillLevel);
    return params.toString();
}

async function apiFetch(endpoint, { useCache = true, timeout = 15000 } = {}) {
    const cacheKey = endpoint;
    if (useCache && apiCache.has(cacheKey)) {
        const entry = apiCache.get(cacheKey);
        if (Date.now() - entry.time < API_CACHE_TTL) return entry.data;
    }

    if (!API_BASE) {
        return { fallback: true, error: "API server not configured — using local data" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (useCache) apiCache.set(cacheKey, { time: Date.now(), data });
        return data;
    } catch (err) {
        clearTimeout(timer);
        return { fallback: true, error: err.name === "AbortError" ? "Request timed out" : err.message };
    }
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

async function fetchLiveJobs() {
    return apiFetch(`/api/jobs?${getProfileQueryParams()}`);
}

async function fetchLiveInternships() {
    return apiFetch(`/api/internships?${getProfileQueryParams()}`);
}

async function fetchLiveCourses() {
    return apiFetch(`/api/courses?${getProfileQueryParams()}`);
}

async function fetchDeadlines() {
    return apiFetch("/api/deadlines", { useCache: false });
}

function invalidateApiCache() { apiCache.clear(); }
