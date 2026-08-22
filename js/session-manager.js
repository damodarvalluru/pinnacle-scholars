/* Shared, browser-side portal session UX. Server sessions remain the authority
   when deployed; this protects every existing static portal page consistently. */
(function () {
  const KEY = 'pinnacle_portal_session';
  const WARNING_MS = 2 * 60 * 1000;
  let timer;
  let warningTimer;

  function read() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } }
  function clear() {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem('active_student_id');
    localStorage.removeItem('active_student_name');
    localStorage.removeItem('active_student_dob');
  }
  function renderWarning(session) {
    if (document.getElementById('sessionExpiryWarning')) return;
    const notice = document.createElement('div');
    notice.id = 'sessionExpiryWarning';
    notice.className = 'session-expiry-warning';
    notice.setAttribute('role', 'alert');
    notice.innerHTML = '<strong>Session expires soon.</strong> Save any work and continue your task before you are signed out.';
    document.body.appendChild(notice);
  }
  function renderClock() {
    let clock = document.getElementById('pinnacleSessionClock');
    if (!clock) {
      clock = document.createElement('div');
      clock.id = 'pinnacleSessionClock';
      clock.className = 'pinnacle-session-clock';
      clock.setAttribute('aria-live', 'polite');
      document.body.appendChild(clock);
    }
    const session = read();
    const remaining = session ? Math.max(0, session.expiresAt - Date.now()) : 25 * 60 * 1000;
    const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    clock.innerHTML = `<span>Secure portal session</span><strong>${minutes}:${seconds}</strong>${session ? '' : '<em>Sign in to begin</em>'}`;
    clock.classList.toggle('is-warning', Boolean(session && remaining <= WARNING_MS));
  }
  function expire(message) {
    clear();
    window.alert(message || 'Your secure session has expired. Please sign in again.');
    const target = location.pathname.toLowerCase().includes('faculty') ? 'faculty-portal.html' : 'student-portal.html';
    location.replace(target);
  }
  function schedule() {
    const session = read();
    if (!session) return;
    const left = session.expiresAt - Date.now();
    if (left <= 0) return expire();
    clearTimeout(timer); clearTimeout(warningTimer);
    if (left > WARNING_MS) warningTimer = setTimeout(() => renderWarning(session), left - WARNING_MS);
    else renderWarning(session);
    timer = setTimeout(() => expire(), left);
    renderClock();
  }
  window.PinnacleSession = {
    start(role) {
      const minutes = role === 'faculty' ? 30 : 25;
      sessionStorage.setItem(KEY, JSON.stringify({ role, expiresAt: Date.now() + minutes * 60 * 1000 }));
      schedule();
    },
    active(role) { const s = read(); return Boolean(s && s.role === role && s.expiresAt > Date.now()); },
    logout() { clear(); }
  };
  document.addEventListener('DOMContentLoaded', () => { schedule(); renderClock(); setInterval(renderClock, 1000); });
}());
