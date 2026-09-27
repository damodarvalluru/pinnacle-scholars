/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - HEADER DROPDOWN BEHAVIOUR
   --------------------------------------------------------------------------
   Progressive enhancement only. The markup in index.html works as plain links
   without this file; this adds open/close behaviour that works for mouse,
   touch and keyboard, and fills two menu subtitles with live schedule data.

   Depends on: js/examination-data.js  (window.PINNACLE_EXAMS, optional)
   Styles:     css/examinations.css
   ========================================================================== */

(function () {
    'use strict';

    const OPEN_CLASS = 'is-open';
    const CLOSE_DELAY = 150;
    const MOBILE_QUERY = '(max-width: 768px)';

    const dropdowns = [];
    let closeTimer = null;

    /* ---------------------------------------------------------------- utils */

    function canHover() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    function isMobile() {
        return window.matchMedia(MOBILE_QUERY).matches;
    }

    function triggerOf(drop) {
        return drop.querySelector(':scope > .nav-dropdown-trigger');
    }

    function menuOf(drop) {
        return drop.querySelector(':scope > .nav-dropdown-menu');
    }

    function itemsOf(drop) {
        const menu = menuOf(drop);
        return menu ? Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]')) : [];
    }

    function todayISO() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');
    }

    /* --------------------------------------------------------- open / close */

    function open(drop) {
        if (!drop) return;
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }
        if (drop.classList.contains(OPEN_CLASS)) return;

        closeAll(drop);
        drop.classList.add(OPEN_CLASS);
        const trigger = triggerOf(drop);
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function close(drop) {
        if (!drop || !drop.classList.contains(OPEN_CLASS)) return;
        drop.classList.remove(OPEN_CLASS);
        const trigger = triggerOf(drop);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function closeAll(except) {
        dropdowns.forEach((drop) => {
            if (drop !== except) close(drop);
        });
    }

    function toggle(drop) {
        if (drop.classList.contains(OPEN_CLASS)) close(drop);
        else open(drop);
    }

    function closeSoon(drop) {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            close(drop);
            closeTimer = null;
        }, CLOSE_DELAY);
    }

    function focusItem(drop, index) {
        const items = itemsOf(drop);
        if (!items.length) return;
        const target = (index + items.length) % items.length;
        items[target].focus();
    }

    /**
     * The header is position:fixed, so both the mobile dropdown panel and the
     * examinations page content need its live height. Measured here rather than
     * read from the home-page offset variable so this file stays independent of
     * js/scripts.js.
     */
    function syncHeaderMetrics() {
        const header = document.querySelector('body > header');
        if (!header) return;
        const rect = header.getBoundingClientRect();
        const root = document.documentElement.style;

        root.setProperty('--pinnacle-header-height', Math.round(rect.height) + 'px');
        root.setProperty('--pinnacle-dropdown-top', Math.round(rect.bottom + 8) + 'px');
    }

    /* ------------------------------------------------------------- handlers */

    function onTriggerClick(event) {
        event.preventDefault();
        const drop = event.currentTarget.closest('.nav-dropdown');
        // Hover already opened it on a pointer device, so a click should keep
        // it open rather than immediately closing what the user just opened.
        if (canHover() && !isMobile()) open(drop);
        else toggle(drop);
    }

    function onTriggerKeydown(event) {
        const drop = event.currentTarget.closest('.nav-dropdown');

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            open(drop);
            focusItem(drop, event.key === 'ArrowDown' ? 0 : -1);
        } else if (event.key === 'Escape') {
            close(drop);
        }
    }

    function onMenuKeydown(event) {
        const drop = event.currentTarget.closest('.nav-dropdown');
        const items = itemsOf(drop);
        const index = items.indexOf(document.activeElement);
        const trigger = triggerOf(drop);

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                focusItem(drop, index + 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (index <= 0) trigger.focus();
                else focusItem(drop, index - 1);
                break;
            case 'Home':
                event.preventDefault();
                focusItem(drop, 0);
                break;
            case 'End':
                event.preventDefault();
                focusItem(drop, -1);
                break;
            case 'Escape':
                event.preventDefault();
                close(drop);
                if (trigger) trigger.focus();
                break;
            case 'Tab':
                // Let focus move on naturally, but stop advertising the panel
                // as open once focus has left it.
                close(drop);
                break;
            default:
                break;
        }
    }

    function onMenuClick(event) {
        if (!event.target.closest('[role="menuitem"]')) return;
        close(event.currentTarget.closest('.nav-dropdown'));
    }

    function onPointerEnter() {
        if (!canHover()) return;
        open(this);
    }

    function onPointerLeave() {
        if (!canHover()) return;
        closeSoon(this);
    }

    function onFocusIn(event) {
        const drop = event.target.closest ? event.target.closest('.nav-dropdown') : null;
        if (drop) open(drop);
    }

    function onFocusOut(event) {
        const drop = event.target.closest ? event.target.closest('.nav-dropdown') : null;
        if (!drop) return;
        if (event.relatedTarget && drop.contains(event.relatedTarget)) return;
        // A hovered panel stays open: the pointer, not focus, is driving it.
        if (drop.matches(':hover')) return;
        close(drop);
    }

    function onDocumentClick(event) {
        if (event.target.closest && event.target.closest('.nav-dropdown')) return;
        closeAll();
    }

    function onDocumentKeydown(event) {
        if (event.key !== 'Escape') return;
        dropdowns.forEach((drop) => close(drop));
    }

    function onResize() {
        syncHeaderMetrics();
        closeAll();
    }

    /* ------------------------------------------------- live data enhancement */

    /**
     * Fills the two menu subtitles that are most useful before a student even
     * opens the page: the next monthly/grand test and the next re-conduct
     * Saturday. Silently does nothing if the data file is unavailable.
     */
    function enhanceMenuItems() {
        const data = window.PINNACLE_EXAMS;
        if (!data) return;

        const today = todayISO();

        const upcoming = [];
        data.months.forEach((month) => {
            month.events.forEach((event) => {
                upcoming.push({
                    date: event.date,
                    label: data.slotMeta(event.slot).short
                });
            });
        });
        upcoming.push({ date: data.grandTest.date, label: 'Grand Test' });
        upcoming.sort((a, b) => a.date.localeCompare(b.date));

        const nextTest = upcoming.find((entry) => entry.date >= today);

        const nextReConduct = data.reConductSaturdays
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .find((entry) => entry.date >= today);

        document.querySelectorAll('.nav-dropdown-item[data-enhance]').forEach((item) => {
            const slot = item.querySelector('small');
            if (!slot) return;
            const kind = item.getAttribute('data-enhance');

            if (kind === 'next-test' && nextTest) {
                slot.textContent = nextTest.label + ' · ' + data.formatShort(nextTest.date);
            } else if (kind === 'reconduct' && nextReConduct) {
                slot.textContent = 'Next: ' + data.formatShort(nextReConduct.date);
            }
        });
    }

    /* ------------------------------------------------------------------ init */

    function init() {
        const nodes = document.querySelectorAll('.nav-dropdown');
        if (!nodes.length) return;

        nodes.forEach((drop) => {
            const trigger = triggerOf(drop);
            const menu = menuOf(drop);
            if (!trigger || !menu) return;

            // Guarantee the ARIA wiring even if the markup forgot it.
            if (!menu.id) {
                menu.id = 'navDropdown' + Math.random().toString(36).slice(2, 8);
            }
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-controls', menu.id);

            dropdowns.push(drop);

            trigger.addEventListener('click', onTriggerClick);
            trigger.addEventListener('keydown', onTriggerKeydown);
            menu.addEventListener('keydown', onMenuKeydown);
            menu.addEventListener('click', onMenuClick);
            drop.addEventListener('pointerenter', onPointerEnter);
            drop.addEventListener('pointerleave', onPointerLeave);
            drop.addEventListener('focusin', onFocusIn);
            drop.addEventListener('focusout', onFocusOut);
        });

        if (!dropdowns.length) return;

        document.addEventListener('click', onDocumentClick);
        document.addEventListener('keydown', onDocumentKeydown);
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        syncHeaderMetrics();
        enhanceMenuItems();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
