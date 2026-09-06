// js/notifications.js - Notifications Center & Application Alerts Manager

const INITIAL_NOTIFICATIONS = [
    {
        id: "notif-1",
        category: "Job Deadline",
        title: "Application Deadline Warning",
        message: "National Cyber Security Analyst deadline approaching in 2 days!",
        timestamp: "10 mins ago",
        type: "warning",
        read: false
    },
    {
        id: "notif-2",
        category: "AI Match",
        title: "New 94% Job Match Found",
        message: "AI & Machine Learning Engineer role posted at NexusTech AI Labs.",
        timestamp: "1 hour ago",
        type: "success",
        read: false
    },
    {
        id: "notif-3",
        category: "Skill Tip",
        title: "Skill Gap Recommendation",
        message: "Learning AWS Cloud Essentials could boost your job match score by +22%.",
        timestamp: "3 hours ago",
        type: "info",
        read: false
    }
];

let notificationsList = [...INITIAL_NOTIFICATIONS];

function initNotifications() {
    generateDeadlineNotifications();
    renderNotificationsList();
}

/* ==========================================================================
   DEADLINE-BASED NOTIFICATIONS
   Scans live job & internship datasets for deadlines within the next 10 days
   and injects alerts, avoiding duplicates on repeated calls (e.g. refresh).
   ========================================================================== */
function generateDeadlineNotifications() {
    const now = new Date();
    const windowMs = 10 * 24 * 60 * 60 * 1000;

    const collectUpcoming = (list, labelKey, categoryLabel) => {
        if (!Array.isArray(list)) return [];
        return list
            .filter(item => item.deadline)
            .map(item => ({ item, dueDate: new Date(item.deadline) }))
            .filter(({ dueDate }) => !isNaN(dueDate) && dueDate >= now && (dueDate - now) <= windowMs)
            .map(({ item, dueDate }) => {
                const daysLeft = Math.max(1, Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000)));
                return {
                    id: `deadline-${item.id}`,
                    category: categoryLabel,
                    title: `${daysLeft <= 3 ? "Urgent: " : ""}Deadline in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
                    message: `${item[labelKey]} — ${item.organization || item.platform} closes on ${item.deadline}.`,
                    timestamp: "Auto-detected",
                    type: daysLeft <= 3 ? "warning" : "info",
                    read: false
                };
            });
    };

    const jobDeadlines = typeof JOBS_DATA !== "undefined" ? collectUpcoming(JOBS_DATA, "title", "Job Deadline") : [];
    const internshipDeadlines = typeof INTERNSHIPS_DATA !== "undefined" ? collectUpcoming(INTERNSHIPS_DATA, "title", "Internship Deadline") : [];

    [...jobDeadlines, ...internshipDeadlines].forEach(notif => {
        if (!notificationsList.some(n => n.id === notif.id)) {
            notificationsList.unshift(notif);
        }
    });
}

function renderNotificationsList() {
    const container = document.getElementById("notifications-list-container");
    const badge = document.getElementById("notif-badge-count");
    if (!container) return;

    const unreadCount = notificationsList.filter(n => !n.read).length;
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? "inline-flex" : "none";
    }

    if (notificationsList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem;" class="text-muted">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                <h4>You're all caught up!</h4>
                <p style="font-size:0.88rem;">No new notifications at this time.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    notificationsList.forEach(item => {
        const div = document.createElement("div");
        div.className = `notification-item ${item.read ? 'read' : 'unread'}`;
        div.style.cssText = `
            background: ${item.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 217, 255, 0.08)'};
            border: 1px solid ${item.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
            border-radius: var(--radius-md);
            padding: 1.2rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
        `;

        div.innerHTML = `
            <div>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                    <span class="badge ${item.type === 'warning' ? 'badge-indigo' : 'badge-cyan'}">${item.category}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${item.timestamp}</span>
                </div>
                <h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; margin-bottom:0.2rem;">${item.title}</h4>
                <p style="font-size:0.9rem; color:var(--text-muted);">${item.message}</p>
            </div>
            ${!item.read ? `<button class="btn btn-secondary btn-sm" onclick="markNotificationRead('${item.id}')">Mark Read</button>` : ''}
        `;
        container.appendChild(div);
    });
}

function markNotificationRead(id) {
    const notif = notificationsList.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        renderNotificationsList();
    }
}

function markAllNotificationsRead() {
    notificationsList.forEach(n => n.read = true);
    renderNotificationsList();
}

function clearAllNotifications() {
    notificationsList = [];
    renderNotificationsList();
}
