/* ==========================================================================
   Pinnacle Scholars Academy — loading feedback bridge
   Visual-only adapter for crownz-loaders.css. It observes user actions and
   network activity; it never changes requests, responses, validation,
   authentication or navigation.
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

    var INLINE_LOADER = {
        verification: 'ld-gradient-ring',
        login: 'ld-gradient-ring',
        registration: 'ld-bouncing-dots',
        id: 'ld-gradient-ring',
        result: 'ld-spinner-arc',
        fees: 'ld-spinner-arc',
        details: 'ld-bouncing-dots',
        download: 'ld-spinner-arc',
        page: 'ld-spinner-arc'
    };

    var SKIP_HINTS = /^(theme|mobile-menu|global-scroll|admin-menu|admin-sidebar-collapse|admin-logout|syl-expand|admin-modal-close|contact-send-another)/i;
    var active = null;
    var networkCount = 0;
    var sequence = 0;
    var hideTimer = null;
    var settleTimer = null;
    var watchdogTimer = null;
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

    function inlineMarkup(kind) {
        var name = INLINE_LOADER[kind] || INLINE_LOADER.details;
        return '<span class="lf-inline lf-inline--' + name + '" aria-hidden="true">' + loaderMarkup(name === 'ld-bouncing-dots' ? 'registration' : name === 'ld-gradient-ring' ? 'login' : name === 'ld-spinner-arc' ? 'result' : 'details') + '</span>';
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
                if (bar && bar.parentNode) bar.classList.add('is-done');
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

    function removeInline(target) {
        if (!target || !target.isConnected) return;
        var nodes = target.querySelectorAll ? target.querySelectorAll('.lf-inline') : [];
        Array.prototype.forEach.call(nodes, function (node) {
            if (node.parentNode) node.parentNode.removeChild(node);
        });
        target.removeAttribute('aria-busy');
    }

    function addInline(target, kind) {
        if (!target || !target.isConnected || typeof target.insertAdjacentHTML !== 'function') return;
        // The existing label is left untouched; the loader is simply prepended.
        target.insertAdjacentHTML('afterbegin', inlineMarkup(kind));
        target.setAttribute('aria-busy', 'true');
    }

    function clearTimers() {
        global.clearTimeout(hideTimer);
        global.clearTimeout(settleTimer);
        global.clearTimeout(watchdogTimer);
        hideTimer = settleTimer = watchdogTimer = null;
    }

    function start(kind, label, target) {
        var token = ++sequence;
        clearTimers();
        if (active) removeInline(active.target);
        if (!LOADERS[kind]) kind = 'details';
        active = { token: token, kind: kind, label: label, target: target || null };
        showToast(kind, label);
        addInline(target, kind);
        watchdogTimer = global.setTimeout(function () {
            if (active && active.token === token) stop(token, true);
        }, LOADERS[kind].timeout);
        return token;
    }

    function stop(token, immediate) {
        if (!active || (token && token !== active.token)) return false;
        var current = active;
        clearTimers();
        removeInline(current.target);
        active = null;
        var toast = region && region.querySelector('.lf-toast');
        if (!toast) return true;
        if (immediate) {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        } else {
            toast.classList.add('is-leaving');
            hideTimer = global.setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 220);
        }
        return true;
    }

    function settle(delay) {
        if (!active) return;
        global.clearTimeout(settleTimer);
        settleTimer = global.setTimeout(function () {
            if (active) stop(active.token, false);
        }, typeof delay === 'number' ? delay : 220);
    }

    function inferKind(node) {
        if (!node || typeof node.getAttribute !== 'function') return null;
        var explicit = node.getAttribute('data-loader');
        if (explicit && LOADERS[explicit]) return explicit;

        var id = node.id || '';
        var text = (node.textContent || node.value || '').toLowerCase();
        var href = node.getAttribute('href') || '';
        var label = node.getAttribute('aria-label') || node.getAttribute('title') || '';
        var haystack = [id, text, href, label].join(' ');

        if (SKIP_HINTS.test(id)) return null;
        if (node.getAttribute('type') === 'reset' || node.hasAttribute('data-section')) {
            if (node.hasAttribute('data-section')) return 'details';
            return null;
        }
        if (node.hasAttribute('data-export') || node.hasAttribute('data-syl-download')) return 'download';

        // Explicit element IDs keep the feedback honest for the academy flows.
        if (/adminloginsubmit|adminsubmit/.test(id)) return 'verification';
        if (/studentloginbtn|facultyloginbtn/.test(id)) return 'login';
        if (/enrollbtn/.test(id)) return 'registration';
        if (/generatefacultybtn|generate.*id|forgot/.test(id)) return 'id';
        if (/fetchbtn|paybtn|paymentbutton/.test(id)) return 'fees';
        if (/contactsubmitbtn/.test(id)) return 'verification';

        if (/forgot id|forgot student|forgot faculty/.test(haystack)) return 'id';
        if (/download|export|pdf|print|brochure/.test(haystack)) return 'download';
        if (/verif/.test(haystack)) return 'verification';
        if (/result/.test(haystack)) return 'result';
        if (/fee|payment|pay /.test(haystack)) return 'fees';
        if (/generate|enroll|register/.test(haystack)) return 'registration';
        if (/login|sign in/.test(haystack)) return 'login';
        if (/detail|review|apply|search/.test(haystack)) return 'details';

        var path = (global.location && global.location.pathname || '').toLowerCase();
        if (node.matches('button[type="submit"]')) {
            if (path.indexOf('result') !== -1) return 'result';
            if (path.indexOf('admin-login') !== -1) return 'verification';
            if (path.indexOf('enrollment') !== -1) return 'registration';
            if (path.indexOf('contact') !== -1) return 'verification';
            if (path.indexOf('fee') !== -1) return 'fees';
            return 'details';
        }
        return null;
    }

    function onInteraction(event) {
        var node = event.target && event.target.closest ? event.target.closest('[data-loader],button,a') : null;
        if (!node || node.disabled || node.getAttribute('aria-disabled') === 'true') return;
        var kind = inferKind(node);
        if (!kind) return;
        var token = start(kind, null, node);
        // A handler that cancels the action (empty form, blocked navigation)
        // should not leave a loader behind.
        global.setTimeout(function () {
            if (event.defaultPrevented && networkCount === 0 && active && active.token === token) stop(token, true);
        }, 0);
    }

    document.addEventListener('click', onInteraction, true);
    document.addEventListener('submit', function (event) {
        var node = event.submitter || (event.target && event.target.querySelector ? event.target.querySelector('button[type="submit"],input[type="submit"]') : null);
        var kind = inferKind(node) || (event.target && inferKind(event.target)) || 'verification';
        var token = start(kind, null, node || event.target);
        global.setTimeout(function () {
            if (event.defaultPrevented && networkCount === 0 && active && active.token === token) stop(token, true);
        }, 0);
    }, true);

    // Observe requests without changing them.
    if (typeof global.fetch === 'function') {
        var nativeFetch = global.fetch.bind(global);
        global.fetch = function () {
            networkCount += 1;
            return nativeFetch.apply(global, arguments).then(function (response) {
                networkCount = Math.max(0, networkCount - 1);
                if (networkCount === 0) settle();
                return response;
            }, function (error) {
                networkCount = Math.max(0, networkCount - 1);
                if (networkCount === 0) settle();
                throw error;
            });
        };
    }

    if (global.XMLHttpRequest && global.XMLHttpRequest.prototype && global.XMLHttpRequest.prototype.send) {
        var nativeSend = global.XMLHttpRequest.prototype.send;
        global.XMLHttpRequest.prototype.send = function () {
            networkCount += 1;
            this.addEventListener('loadend', function () {
                networkCount = Math.max(0, networkCount - 1);
                if (networkCount === 0) settle();
            }, { once: true });
            return nativeSend.apply(this, arguments);
        };
    }

    function injectSkeletons() {
        var hosts = document.querySelectorAll('.admin-loading');
        Array.prototype.forEach.call(hosts, function (host) {
            if (host.querySelector('.ld-skeleton')) return;
            host.classList.add('lf-skeleton-host');
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
        settle: settle,
        complete: function () { settle(120); },
        loaderMarkup: loaderMarkup,
        injectSkeletons: injectSkeletons
    };
    global.LoadingFeedback = global.PinnacleLoadingFeedback;
})(window, document);
