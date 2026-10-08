/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - PROGRAMMES PAGE
   --------------------------------------------------------------------------
   Renders programs.html for one of two programmes, chosen with the
   ?program=intermediate|gate query parameter. There is a single page on
   purpose: the two programmes share the header, the timings, the fee
   machinery and the monthly-test calendar, so only the parts that actually
   differ (streams, fees, eligibility window, syllabus link) are described in
   PROGRAMS below.

   Nothing here is required for the page to be readable - every section has
   static headings and the navigation is plain links. This file fills in the
   programme-specific copy and the upcoming test dates.

   Depends on: js/examination-data.js  (window.PINNACLE_EXAMS, for the calendar)
   Styles:     css/programs.css
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       PROGRAMME DATA

       `age` mirrors the ranges enforced server-side by
       pinnacle-backend/routes/dobEligibility.js. If one of these is changed
       here it MUST be changed there too - the registration API is the
       authority, and dob-unit.js / dob-routes.js cover those ranges.
       `domain` values are the exact strings the enrolment form submits and
       that the API stores, so they are rendered verbatim.
       ====================================================================== */

    const PROGRAMS = {
        intermediate: {
            key: 'intermediate',
            icon: '📘',
            label: 'Intermediate (JEE & NEET)',
            shortLabel: 'Intermediate',
            accent: 'jee',
            examProgram: 'jee',
            kicker: 'Classes XI & XII',
            title: 'Intermediate Programme — JEE Main / Advanced & NEET (BiPC)',
            subtitle:
                'A two-year intermediate course built around the two entrance ' +
                'examinations that decide your engineering (MPC) or medical ' +
                '(BiPC) seat, with monthly tests on the academy calendar.',
            duration: '2 years · Class XI + XII',
            age: { min: 13, max: 25 },
            ageNote:
                'Applicants must be between 13 and 25 years old on the date of ' +
                'enrolment. The registration API checks the submitted date of ' +
                'birth and rejects anything outside this range before a student ' +
                'ID is issued.',
            streams: [
                {
                    domain: 'MPC-JEE',
                    name: 'MPC — Maths, Physics, Chemistry',
                    blurb:
                        'Engineering track for JEE Main and JEE Advanced. Feeds ' +
                        'into the JEE monthly tests and the December Grand Test.'
                },
                {
                    domain: 'BIPC-NEET',
                    name: 'BiPC — Biology, Physics, Chemistry',
                    blurb:
                        'Medical track for NEET. Shares the Physics and Chemistry ' +
                        'faculty with the MPC batch and the same weekly schedule.'
                }
            ],
            timings: [
                { label: 'Morning Batch', value: '8:00 AM – 1:00 PM' },
                { label: 'Evening Batch', value: '4:00 PM – 8:00 PM' },
                { label: 'Batch Duration', value: '2 academic years' },
                { label: 'Tests Per Month', value: 'Monthly mock series' }
            ],
            timingsNote:
                'Both batches cover the same syllabus; pick the one that leaves ' +
                'you room for school or college work.',
            syllabus: [
                {
                    href: 'syllabus-jee.html',
                    icon: '📘',
                    title: 'JEE Main Syllabus 2026',
                    sub: 'Physics · Chemistry · Mathematics, chapter-wise'
                },
                {
                    href: 'examinations.html?view=schemas',
                    icon: '🧮',
                    title: 'Marking Schemes',
                    sub: 'Institute pattern and the official NTA scheme'
                }
            ],
            applyCopy:
                'Pick your stream and date of birth on the enrolment form. Your ' +
                'stream decides your domain code, your fees and your monthly test ' +
                'series.'
        },

        gate: {
            key: 'gate',
            icon: '⚙️',
            label: 'GATE (M.Tech)',
            shortLabel: 'GATE',
            accent: 'gate',
            examProgram: 'gate',
            kicker: 'M.Tech Admission',
            title: 'GATE Programme — M.Tech Entrance Preparation',
            subtitle:
                'Focused preparation for the GATE examination across aptitude, ' +
                'engineering mathematics and a chosen core subject, mapped to the ' +
                'specialisations the academy teaches.',
            duration: 'As per GATE score validity',
            age: { min: 17, max: 35 },
            ageNote:
                'Applicants must be between 17 and 35 years old on the date of ' +
                'enrolment. The registration API checks the submitted date of ' +
                'birth and rejects anything outside this range before a student ' +
                'ID is issued.',
            streams: [
                {
                    domain: 'MTECH-CS',
                    name: 'Computer Science Engineering',
                    blurb:
                        'Core papers in algorithms, operating systems, computer ' +
                        'networks and computer architecture.'
                },
                {
                    domain: 'MTECH-STR',
                    name: 'Structural Engineering',
                    blurb:
                        'Structural analysis, design of concrete and steel ' +
                        'structures, and geotechnical engineering.'
                },
                {
                    domain: 'MTECH-VLSI',
                    name: 'VLSI Design Systems',
                    blurb:
                        'Digital and analogue VLSI design, semiconductor devices ' +
                        'and embedded system design.'
                }
            ],
            timings: [
                { label: 'Morning Batch', value: '8:00 AM – 1:00 PM' },
                { label: 'Evening Batch', value: '4:00 PM – 8:00 PM' },
                { label: 'Core + Maths', value: '2 subjects per session' },
                { label: 'Tests Per Month', value: 'GATE S1 + S2 sessions' }
            ],
            timingsNote:
                'The two GATE monthly sessions run on consecutive days each month, ' +
                'so both batches follow the published timetable.',
            syllabus: [
                {
                    href: 'syllabus-gate.html',
                    icon: '⚙️',
                    title: 'GATE Syllabus 2026',
                    sub: 'General Aptitude · Engg. Maths · Core, chapter-wise'
                },
                {
                    href: 'examinations.html?view=schemas',
                    icon: '🧮',
                    title: 'Marking Schemes',
                    sub: 'Institute pattern and the official GATE scheme'
                }
            ],
            applyCopy:
                'Choose your specialisation and date of birth on the enrolment ' +
                'form. All three specialisations carry the same programme fee.'
        }
    };

    /* ----------------------------------------------------------------------
       PROGRAMME FEES

       These must match pinnacle-backend/routes/studentRoutes.js, which assigns
       total_fees per domain when a student registers. The amounts are defined
       once here so the Intermediate and GATE tables cannot disagree.
       ---------------------------------------------------------------------- */
    const FEE_BY_DOMAIN = {
        'MPC-JEE': 55000,
        'BIPC-NEET': 65000,
        'MTECH-CS': 80000,
        'MTECH-STR': 80000,
        'MTECH-VLSI': 80000
    };

    const DEFAULT_PROGRAM = 'intermediate';
    const UPCOMING_LIMIT = 4;

    /* ---------------------------------------------------------------- utils */

    function todayISO() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');
    }

    /** A tiny element factory, matching the style used by js/examinations-page.js. */
    function h(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    /** Every programme fee is a whole rupee amount, displayed in Indian grouping. */
    function rupees(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    }

    function el(id) {
        return document.getElementById(id);
    }

    function clear(node) {
        while (node && node.firstChild) node.removeChild(node.firstChild);
    }

    /* ----------------------------------------------------------- programme */

    /**
     * Reads ?program=. An unknown or missing value falls back to the default
     * rather than leaving the page blank, and the switch buttons are real
     * links so the selection is shareable and works without this file.
     */
    function requestedProgram() {
        let key = DEFAULT_PROGRAM;
        try {
            const raw = new URLSearchParams(window.location.search).get('program');
            if (raw) key = raw.trim().toLowerCase();
        } catch (error) {
            key = DEFAULT_PROGRAM;
        }
        return Object.prototype.hasOwnProperty.call(PROGRAMS, key) ? key : DEFAULT_PROGRAM;
    }

    /* -------------------------------------------------------------- render */

    function renderHero(program) {
        el('progKicker').textContent = program.icon + ' ' + program.kicker;
        el('progTitle').textContent = program.title;
        el('progSubtitle').textContent = program.subtitle;
        document.title = program.label + ' | Fees, Eligibility, Timings & Syllabus | Pinnacle Scholars Academy';

        const switches = document.querySelectorAll('[data-program-link]');
        Array.prototype.forEach.call(switches, (button) => {
            const active = button.getAttribute('data-program-link') === program.key;
            // aria-current is the single source of truth for the active state so
            // the stylesheet and the URL can never disagree.
            if (active) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });

        const stats = el('progHeroStats');
        clear(stats);
        [
            { label: 'Programme', value: program.shortLabel },
            { label: 'Duration', value: program.duration },
            {
                label: 'Age Eligibility',
                value: program.age.min + '–' + program.age.max + ' years'
            },
            { label: 'Streams', value: program.streams.length + ' available' }
        ].forEach((stat) => {
            const card = h('div', 'prog-stat');
            card.appendChild(h('span', 'prog-stat__label', stat.label));
            card.appendChild(h('span', 'prog-stat__value', stat.value));
            stats.appendChild(card);
        });
    }

    function renderOverview(program) {
        el('overviewTitle').textContent = program.label + ' — Overview';
        el('overviewLead').textContent = program.subtitle;

        const note = el('overviewNote');
        clear(note);
        const strong = h('strong', null, 'How to join: ');
        note.appendChild(strong);
        note.appendChild(
            document.createTextNode(
                'the enrolment form collects your name, date of birth, contact ' +
                'details and the stream above. Age eligibility is enforced by the ' +
                'registration API, so an out-of-range date of birth is refused ' +
                'before anything is written to the database.'
            )
        );
    }

    function renderStreams(program) {
        const grid = el('streamGrid');
        clear(grid);

        program.streams.forEach((stream) => {
            const card = h('article', 'prog-card');
            card.appendChild(h('h3', null, stream.name));
            card.appendChild(h('p', null, stream.blurb));
            card.appendChild(h('code', 'prog-card__code', stream.domain));
            grid.appendChild(card);
        });
    }

    function renderEligibility(program) {
        const grid = el('eligibilityGrid');
        clear(grid);

        const ageCard = h('article', 'prog-card');
        ageCard.appendChild(h('h3', null, '🎂 Age Eligibility'));
        ageCard.appendChild(
            h(
                'p',
                null,
                'Applicants must be ' +
                    program.age.min +
                    ' to ' +
                    program.age.max +
                    ' years old on the date of enrolment. Both limits are inclusive.'
            )
        );
        grid.appendChild(ageCard);

        const dobCard = h('article', 'prog-card');
        dobCard.appendChild(h('h3', null, '📅 Date of Birth'));
        dobCard.appendChild(
            h(
                'p',
                null,
                'Date of birth is mandatory and must be a real calendar date in ' +
                    'YYYY-MM-DD format. A future date, an impossible date such as ' +
                    '31 February, or a date outside the age window is rejected with ' +
                    'a 400 response and no student record is created.'
            )
        );
        grid.appendChild(dobCard);

        const streamCard = h('article', 'prog-card');
        streamCard.appendChild(h('h3', null, '📚 Stream Selection'));
        streamCard.appendChild(
            h(
                'p',
                null,
                'Select one of the ' +
                    program.streams.length +
                    ' ' +
                    program.shortLabel +
                    ' streams on the enrolment form. The stream sets your domain ' +
                    'code, your programme fee and your monthly test series.'
            )
        );
        grid.appendChild(streamCard);

        el('eligibilityNote').textContent = program.ageNote;
    }

    function renderFees(program) {
        const host = el('feeTable');
        clear(host);

        const table = h('table');
        const caption = h(
            'caption',
            null,
            'Programme fees for the ' + program.label + ' stream. Amounts match the ' +
                'fees written to your student record at registration.'
        );
        table.appendChild(caption);

        const thead = h('thead');
        const headRow = h('tr');
        ['Domain code', 'Stream', 'Programme fee'].forEach((label) => {
            const th = h('th', null, label);
            th.setAttribute('scope', 'col');
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = h('tbody');
        program.streams.forEach((stream) => {
            const row = h('tr');

            const codeCell = h('td');
            const code = h('code', 'prog-card__code', stream.domain);
            codeCell.appendChild(code);
            row.appendChild(codeCell);

            row.appendChild(h('td', null, stream.name));

            const feeCell = h('td');
            feeCell.appendChild(h('span', 'prog-fees__amount', rupees(FEE_BY_DOMAIN[stream.domain])));
            row.appendChild(feeCell);

            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        host.appendChild(table);

        const payBtn = document.querySelector('.prog-cta-row .prog-btn--primary');
        if (payBtn) payBtn.textContent = '💳 Pay Fees Online';
    }

    function renderTimings(program) {
        el('timingsLead').textContent =
            'Both batches run every working day for ' +
            program.shortLabel +
            '. Choose the slot that suits your current commitments.';

        const grid = el('timingGrid');
        clear(grid);

        program.timings.forEach((slot) => {
            const card = h('article', 'prog-card');
            card.appendChild(h('h3', null, slot.label));
            card.appendChild(h('p', null, slot.value));
            grid.appendChild(card);
        });
    }

    /**
     * The next few monthly tests for this programme, read straight from
     * window.PINNACLE_EXAMS so the dates here can never drift from the
     * timetable on examinations.html.
     *
     * The December Grand Test is a combined JEE + GATE paper, so it applies to
     * both programmes. It is appended after the monthly list rather than
     * competing for a slot: attendance is compulsory and it carries the
     * highest weightage, so it must not be pushed off the bottom of the page
     * by earlier monthly tests.
     */
    function renderTests(program) {
        const data = window.PINNACLE_EXAMS;
        const list = el('testList');
        clear(list);

        el('testsLead').textContent = data
            ? 'From the published ' +
              data.academicYear.label +
              ' calendar. Holidays and national examination windows shift a ' +
              'monthly test to the next free day.'
            : 'The examination calendar could not be loaded, so no dates are shown here.';

        if (!data) {
            list.appendChild(
                h(
                    'p',
                    'prog-empty',
                    'Timetable data is unavailable. Open the full timetable for ' +
                        'confirmed dates.'
                )
            );
            return;
        }

        const today = todayISO();
        const monthly = [];

        data.months.forEach((month) => {
            data.eventsForProgram(month, program.examProgram).forEach((event) => {
                monthly.push({
                    date: event.date,
                    icon: event.meta.icon,
                    label: event.meta.label,
                    grand: false
                });
            });
        });

        monthly.sort((a, b) => a.date.localeCompare(b.date));

        const upcoming = monthly
            .filter((entry) => entry.date >= today)
            .slice(0, UPCOMING_LIMIT);

        const grand = {
            date: data.grandTest.date,
            icon: '🏆',
            label: data.grandTest.title,
            grand: true
        };
        const grandIsUpcoming = grand.date >= today && !upcoming.some((e) => e.date === grand.date);

        const rows = grandIsUpcoming ? upcoming.concat([grand]) : upcoming;

        rows.forEach((entry) => {
            const row = h('div', entry.grand ? 'prog-test prog-test--grand' : 'prog-test');

            const when = h('span', 'prog-test__when');
            when.textContent = data.formatLong(entry.date) + ' · ' + data.dayOf(entry.date);
            row.appendChild(when);

            row.appendChild(h('span', 'prog-test__name', entry.icon + ' ' + entry.label));
            row.appendChild(h('span', 'prog-test__tag', entry.grand ? 'Grand Test' : 'Monthly'));

            list.appendChild(row);
        });

        if (!rows.length) {
            list.appendChild(
                h(
                    'p',
                    'prog-empty',
                    'No scheduled ' +
                        program.shortLabel +
                        ' tests remain in the current academic year. See the full ' +
                        'timetable for the next cycle.'
                )
            );
        }
    }

    function renderSyllabus(program) {
        const host = el('syllabusLinks');
        clear(host);

        program.syllabus.forEach((entry) => {
            const link = h('a', 'prog-syl-link');
            link.href = entry.href;

            const icon = h('span', 'prog-syl-link__icon', entry.icon);
            icon.setAttribute('aria-hidden', 'true');
            link.appendChild(icon);

            const text = h('span');
            text.appendChild(h('strong', null, entry.title));
            text.appendChild(h('small', null, entry.sub));
            link.appendChild(text);

            host.appendChild(link);
        });
    }

    function renderApply(program) {
        el('applyCopy').textContent = program.applyCopy;
        const btn = el('applyBtn');
        btn.href = 'enrollment.html';
        btn.textContent = '📝 Start ' + program.shortLabel + ' Enrolment';
        btn.classList.toggle('prog-btn--gate', program.key === 'gate');
    }

    /* ======================================================================
       THEME TOGGLE + MOBILE MENU
       ----------------------------------------------------------------------
       programs.html deliberately does not load js/scripts.js (its
       DOMContentLoaded handler dereferences home-page elements that do not
       exist here), so the two behaviours this page needs from it are
       reproduced locally - exactly as js/examinations-page.js does. The
       dropdown panels themselves are still driven by js/nav-dropdown.js.
       ====================================================================== */

    function initThemeToggle() {
        const button = document.querySelector('[data-theme-toggle]');
        if (!button) return;

        const sync = () => {
            const dark = document.documentElement.getAttribute('data-theme') === 'dark';
            button.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
            button.setAttribute('aria-pressed', dark ? 'true' : 'false');
        };

        button.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
            sync();
        });

        sync();
    }

    function initMobileMenu() {
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('mobileNavMenu');
        if (!toggleBtn || !navMenu) return;

        const setOpen = (open) => {
            toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            navMenu.classList.toggle('mobile-menu-open', open);
        };

        toggleBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            setOpen(toggleBtn.getAttribute('aria-expanded') !== 'true');
        });

        // Close on navigation, but not on a dropdown trigger - the trigger
        // toggles its own submenu and the sheet has to stay open for it.
        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('click', (event) => {
            if (navMenu.contains(event.target) || toggleBtn.contains(event.target)) return;
            setOpen(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setOpen(false);
        });
    }

    /* ------------------------------------------------------------------ boot */

    function init() {
        const program = PROGRAMS[requestedProgram()];

        renderHero(program);
        renderOverview(program);
        renderStreams(program);
        renderEligibility(program);
        renderFees(program);
        renderTimings(program);
        renderTests(program);
        renderSyllabus(program);
        renderApply(program);

        initThemeToggle();
        initMobileMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());