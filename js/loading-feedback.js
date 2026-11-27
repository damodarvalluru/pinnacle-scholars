/* ==========================================================================
   Pinnacle Scholars Academy — loading feedback bridge
   Visual-only adapter for crownz-loaders.css. It observes user actions and
   network activity; it never changes requests, responses, validation,
   authentication or navigation.

   Feedback policy: one small, non-blocking toast per in-flight action.
   Local/navigation controls and controls with their own status text do not
   receive a bridge toast.
   ========================================================================== */
(function (global, document) {
    'use strict';

    if (global.PinnacleLoadingFeedback) return;

    var LOADERS = {
        page:         { loader: 'ld-skeleton',     label: 'Loading page',       stage: 'is-light', timeout: 9000 },
        verification: { loader: 'ld-pulse-rings',  label: 'Verifying details',  stage: 'is-dark',  timeout: 12000 },
        login:        { loader: 'ld-gradient-ring',label: 'Signing you in',     stage: 'is-dark',  timeout: 12000 },
        registration: { loader: 'ld-bouncing-dots',label: 'Registering record', stage: 'is-dark',  timeout: 15000 },
        id:           { loader: 'ld-liquid',       label: 'Generating ID',      stage: 'is-dark',  timeout: 15000 },
        result:       { loader: 'ld-text-shimmer', label: 'Loading result',     stage: 'is-dark',  timeout: 15000 },
        fees:         { loader: 'ld-percent',      label: 'Loading fee data',   stage: 'is-light', timeout: 15000 },
        details:      { loader: 'ld-typing',       label: 'Loading details',    stage: 'is-light', timeout: 12000 },
        download:     { loader: 'ld-bar',          label: 'Preparing download', stage: 'is-light', timeout: 20000 }
    };

    // Local controls whose handlers either navigate, toggle a panel, open a
    // modal, or already provide their own inline status. Giving these a toast
    // was the main source of duplicate/stuck indicators.
    var SKIP_HINTS = /^(theme|mobile-menu|global-scroll|admin-menu|admin-sidebar-collapse|admin-logout|syl-expand|admin-modal-close|contact-send-another)/i;

    var active = null;
    var sequence = 0;
    var timers = { hide: null, settle: null, watchdog: null };
    var region = null;

    function element(tag, className, html) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    function loaderMarkup(kind) {
        var name = (LOADERS[kind] || LOADERS.details).loader;
        switch (name) {
            case 'ld-spinner-arc':
                return '<div class="ld ld-spinner-arc" aria-hidden="true"><svg viewBox="0 0 76 76"><circle class="track" cx="38" cy="38" r="30"></circle><circle class="arc" cx="38" cy="38" r="30"></circle></svg></div>';
            case 'ld-pulse-rings':
                return '<div class="ld ld-pulse-rings" aria-hidden="true"><span class="core"></span><span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span></div>';
            case 'ld-gradient-ring':
                return '<div class="ld ld-gradient-ring" aria-hidden="true"></div>';
            case 'ld-bouncing-dots':
                return '<div class="ld ld-bouncing-dots" aria-hidden="true"><span></span><span></span><span></span></div>';
            case 'ld-liquid':
                return '<div class="ld ld-liquid" aria-hidden="true"><span class="wave"></span><span class="num"></span></div>';
            case 'ld-percent':
                return '<div class="ld ld-percent" aria-hidden="true"><div class="row"><span class="label">Processing</span><span class="pct"></span></div><div class="track"><div class="fill"></div></div></div>';
            case 'ld-typing':
                return '<div class="ld ld-typing" aria-hidden="true"><span></span><span></span><span></span></div>';
            case 'ld-bar':
                return '<div class="ld ld-bar" aria-hidden="true"><p class="label">Preparing your file</p><div class="track"><div class="fill"></div></div></div>';
            case 'ld-text-shimmer':
                return '<p class="ld ld-text-shimmer" aria-hidden="true">Loading</p>';
            case 'ld-skeleton':
            default:
                return '<div class="ld ld-skeleton" aria-hidden="true"><span class="avatar"></span><span class="head"><i class="line w-80"></i><i class="line w-55"></i></span><span class="body"><i class="line w-70"></i><i class="line w-40"></i></span></div>';
        }
    }

    // Buttons get a single, small spinner on the control itself. Using a
    // pseudo-element keeps it visible even when an existing handler replaces
    // the button's text (innerText/textContent) during the request.
    function markButton(target, busy) {
        if (!target || target.nodeType !== 1 || target.tagName !== 'BUTTON') return;
        target.classList.toggle('lf-busy', busy);
        if (busy) target.setAttribute('aria-busy', 'true');
        else target.removeAttribute('aria-busy');
    }

    function ensureRegion() {
        if (region && region.isConnected) return region;
        region = element('div', 'lf-region');
        region.id = 'lfRegion';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        document.body.appendChild(region);
        return region;
    }

    function ensurePageBar() {
        var bar = document.querySelector('.lf-pagebar');
        if (bar || !document.body) return bar;
        bar = element('div', 'lf-pagebar');
        bar.setAttribute('aria-hidden', 'true');
        bar.innerHTML = '<div class="ld ld-bar"><div class="track"><div class="fill"></div></div></div>';
        document.body.appendChild(bar);
        var hideBar = function () {
            global.setTimeout(function () {
                if (!bar || !bar.parentNode) return;
                bar.classList.add('is-done');
                global.setTimeout(function () {
                    if (bar.parentNode) bar.parentNode.removeChild(bar);
                }, 450);
            }, 350);
        };
        if (document.readyState === 'complete') hideBar();
        else global.addEventListener('load', hideBar, { once: true });
        return bar;
    }

    function showToast(kind, label) {
        var host = ensureRegion();
        host.innerHTML = '';
        var config = LOADERS[kind] || LOADERS.details;
        var toast = element('div', 'lf-toast lf-toast--' + kind);
        toast.setAttribute('data-kind', kind);
        var stage = element('div', 'lf-toast__stage ld-stage ' + config.stage);
        stage.innerHTML = loaderMarkup(kind);
        var copy = element('div', 'lf-toast__copy');
        copy.innerHTML = '<strong>' + (label || config.label) + '</strong><span>Working on it…</span>';
        toast.appendChild(stage);
        toast.appendChild(copy);
        host.appendChild(toast);
    }

    function removeToast(immediate) {
        var toast = region && region.querySelector('.lf-toast');
        if (!toast) return;
        if (immediate) {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
            return;
        }
        toast.classList.add('is-leaving');
        timers.hide = global.setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 220);
    }

    function clearTimers() {
        global.clearTimeout(timers.hide);
        global.clearTimeout(timers.settle);
        global.clearTimeout(timers.watchdog);
        timers.hide = timers.settle = timers.watchdog = null;
    }

    function armWatchdog(token, kind) {
        global.clearTimeout(timers.watchdog);
        timers.watchdog = global.setTimeout(function () {
            if (!active || active.token !== token) return;
            // A request that is still in flight gets one extended window;
            // after that the indicator is cleared so it can never stick.
            if (active.pending > 0 && !active.watchdogExtended) {
                active.watchdogExtended = true;
                armWatchdog(token, kind);
                return;
            }
            stop(token, true);
        }, LOADERS[kind].timeout);
    }

    function start(kind, label, target, source) {
        if (!LOADERS[kind]) kind = 'details';

        // A second click on the same busy control must not replace the first
        // indicator or start a second submission.
        if (active && target && active.target === target) {
            return active.token;
        }

        clearTimers();
        removeToast(true);
        if (active && active.button) markButton(active.button, false);
        var token = ++sequence;
        var button = target && target.nodeType === 1 && target.tagName === 'BUTTON' ? target : null;
        active = {
            token: token,
            kind: kind,
            label: label,
            target: target || null,
            button: button,
            source: source || 'manual',
            pending: 0,
            requests: 0,
            watchdogExtended: false
        };
        if (button) markButton(button, true);
        else showToast(kind, label);
        armWatchdog(token, kind);
        return token;
    }

    function stop(token, immediate) {
        if (!active || (token && token !== active.token)) return false;
        clearTimers();
        if (active.button) markButton(active.button, false);
        active = null;
        removeToast(Boolean(immediate));
        return true;
    }

    function settle(delay, token) {
        if (!active || (token && token !== active.token)) return;
        global.clearTimeout(timers.settle);
        timers.settle = global.setTimeout(function () {
            if (!active || (token && token !== active.token) || active.pending > 0) return;
            stop(active.token, false);
        }, typeof delay === 'number' ? delay : 260);
    }

    function requestStarted(token) {
        if (!active || token !== active.token) return null;
        active.pending += 1;
        active.requests += 1;
        global.clearTimeout(timers.settle);
        timers.settle = null;
        return token;
    }

    function requestFinished(token) {
        if (!active || token !== active.token) return;
        active.pending = Math.max(0, active.pending - 1);
        if (active.pending === 0) settle(360, token);
    }

    function inferKind(node) {
        if (!node || typeof node.getAttribute !== 'function') return null;

        if (node.hasAttribute('data-lf-skip')) return null;
        var explicit = node.getAttribute('data-loader');
        if (explicit && LOADERS[explicit]) return explicit;

        var rawId = node.id || '';
        var id = rawId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        var text = (node.textContent || node.value || '').toLowerCase();
        var href = node.getAttribute('href') || '';
        var label = node.getAttribute('aria-label') || node.getAttribute('title') || '';
        var haystack = [id, text, href, label].join(' ');

        if (SKIP_HINTS.test(id)) return null;
        if (/\b(download|print|close|toggle|collapse|expand)\b/.test(haystack)) return null;

        // Navigation, modals, review toggles, CSV export and print actions are
        // local; they either navigate instantly or already show their own state.
        if (node.matches('a[href]') && !explicit) return null;
        if (node.hasAttribute('data-section') ||
            node.hasAttribute('data-export') ||
            node.hasAttribute('data-fee-action') ||
            node.hasAttribute('data-detail') ||
            node.hasAttribute('data-print-timetable') ||
            (node.hasAttribute('data-syl-download') && node.getAttribute('data-syl-download') === 'print') ||
            /review|hide-review|show-review|modal-close/.test(id)) return null;

        // Explicit academy flows.
        if (/admin-login-submit|admin-submit|verify-eligibility-btn/.test(id)) return 'verification';
        if (/student-login-btn|faculty-login-btn/.test(id)) return 'login';
        if (/enroll-btn/.test(id)) return 'registration';
        if (/generate-faculty-btn|generate.*id|forgot/.test(id)) return 'id';
        if (/fetch-btn|pay-btn|payment-button/.test(id)) return 'fees';
        if (/contact-submit-btn/.test(id)) return 'verification';
        if (node.hasAttribute('data-message-action') || node.hasAttribute('data-goto')) return 'details';

        if (/forgot id|forgot student|forgot faculty/.test(haystack)) return 'id';
        if (/verif/.test(haystack)) return 'verification';
        if (/result/.test(haystack)) return 'result';
        if (/fee|payment|pay /.test(haystack)) return 'fees';
        if (/generate|enroll|register/.test(haystack)) return 'registration';
        if (/login|sign in/.test(haystack)) return 'login';
        if (/detail|search/.test(haystack)) return 'details';

        var path = (global.location && global.location.pathname || '').toLowerCase();
        if (node.matches('button[type="submit"]')) {
            if (path.indexOf('result') !== -1) return 'result';
            if (path.indexOf('admin-login') !== -1) return 'verification';
            if (path.indexOf('enrollment') !== -1) return 'registration';
            if (path.indexOf('fee') !== -1) return 'fees';
            return 'details';
        }
        return null;
    }

    function scheduleCancel(event, token) {
        var check = function () {
            if (!active || active.token !== token) return;
            if (active.requests === 0) stop(token, true);
        };
        global.setTimeout(check, 0);
        global.setTimeout(check, 160);
    }

    function onInteraction(event) {
        var node = event.target && event.target.closest ? event.target.closest('[data-loader],button,a') : null;
        if (!node || node.disabled || node.getAttribute('aria-disabled') === 'true') return;

        if (active && active.target === node) {
            // Same action while the first one is still in flight.
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        var kind = inferKind(node);
        if (!kind) return;
        var token = start(kind, null, node, 'click');
        scheduleCancel(event, token);
    }

    document.addEventListener('click', onInteraction, true);
    document.addEventListener('submit', function (event) {
        var node = event.submitter || (event.target && event.target.querySelector ? event.target.querySelector('button[type="submit"],input[type="submit"]') : null);
        if (node && (node.disabled || node.getAttribute('aria-disabled') === 'true')) return;

        // Click capture already started this form action; submit only cleans up
        // the case where the handler cancelled the default action.
        if (active && active.source === 'click' &&
            (node === active.target || (active.target && active.target.contains && active.target.contains(node)))) {
            scheduleCancel(event, active.token);
            return;
        }

        var kind = inferKind(node) || (event.target && inferKind(event.target));
        if (!kind) return;
        var token = start(kind, null, node || event.target, 'submit');
        scheduleCancel(event, token);
    }, true);

    // Observe requests without changing them.
    if (typeof global.fetch === 'function') {
        var nativeFetch = global.fetch.bind(global);
        global.fetch = function () {
            var token = active ? active.token : null;
            if (token) requestStarted(token);
            return nativeFetch.apply(global, arguments).then(function (response) {
                requestFinished(token);
                return response;
            }, function (error) {
                requestFinished(token);
                throw error;
            });
        };
    }

    if (global.XMLHttpRequest && global.XMLHttpRequest.prototype && global.XMLHttpRequest.prototype.send) {
        var nativeSend = global.XMLHttpRequest.prototype.send;
        global.XMLHttpRequest.prototype.send = function () {
            var token = active ? active.token : null;
            if (token) requestStarted(token);
            var done = false;
            var finish = function () {
                if (done) return;
                done = true;
                requestFinished(token);
            };
            this.addEventListener('loadend', finish, { once: true });
            try {
                return nativeSend.apply(this, arguments);
            } catch (error) {
                finish();
                throw error;
            }
        };
    }

    function injectSkeletons() {
        var hosts = document.querySelectorAll('.admin-loading');
        Array.prototype.forEach.call(hosts, function (host) {
            if (host.querySelector('.ld-skeleton')) return;
            host.classList.add('lf-skeleton-host');
            // The existing .admin-loading spinner/shimmer would stack with the
            // supplied skeleton; remove it from the visual host only.
            host.classList.remove('admin-loading');
            host.setAttribute('aria-label', 'Loading');
            host.innerHTML = loaderMarkup('page');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            ensurePageBar();
            injectSkeletons();
        }, { once: true });
    } else {
        ensurePageBar();
        injectSkeletons();
    }

    global.PinnacleLoadingFeedback = {
        start: start,
        stop: stop,
        settle: function (delay) { if (active) settle(delay, active.token); },
        complete: function () { if (active) settle(120, active.token); },
        state: function () {
            return active ? { token: active.token, kind: active.kind, pending: active.pending, requests: active.requests } : null;
        },
        loaderMarkup: loaderMarkup,
        injectSkeletons: injectSkeletons
    };
    global.LoadingFeedback = global.PinnacleLoadingFeedback;
})(window, document);
