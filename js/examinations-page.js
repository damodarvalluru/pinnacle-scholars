/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - EXAMINATIONS PAGE RENDERER
   --------------------------------------------------------------------------
   Builds the Timetables, Notifications, Guidelines and Schemas sections of
   examinations.html entirely from window.PINNACLE_EXAMS, so the page can
   never drift from the data file.

   Every value is written with textContent (never innerHTML), so editing the
   data file cannot inject markup into the page.

   Requires: js/examination-data.js
   ========================================================================== */

(function () {
    'use strict';

    const data = window.PINNACLE_EXAMS;

    if (!data) {
        console.error('[examinations] examination-data.js did not load.');
        return;
    }

    /* ======================================================================
       VIEW ISOLATION
       ----------------------------------------------------------------------
       Every Examinations dropdown entry opens this page with ?view=<section>.
       Only that section is built and shown, so a window opened for, say,
       "Timetables" never carries the guidelines or the marking schemes. With
       no ?view the page keeps its original all-sections behaviour.
       ====================================================================== */

    const VIEWS = {
        timetables: {
            id: 'timetables',
            kicker: '🗓️ Timetables',
            title: 'Monthly Test Timetable',
            intro: 'Every monthly test date for the academic year, the December Grand Test and every re-conduct Saturday.'
        },
        notifications: {
            id: 'notifications',
            kicker: '📢 Notifications',
            title: 'Examination Notifications',
            intro: 'This month and next month confirmed dates, the Grand Test notice and the published national examination windows.'
        },
        guidelines: {
            id: 'guidelines',
            kicker: '📋 Guidelines',
            title: 'Examination Guidelines',
            intro: 'Rules governing every monthly test, grand test and re-conduct examination, with the full penalty schedule.'
        },
        schemas: {
            id: 'schemas',
            kicker: '🧮 Schemas',
            title: 'JEE & GATE Marking Schemes',
            intro: 'The institute pattern and the officially published pattern, listed separately for each programme.'
        }
    };

    const SECTIONS = ['timetables', 'notifications', 'guidelines', 'schemas'];

    function requestedView() {
        const requested = new URLSearchParams(window.location.search).get('view');
        return requested && VIEWS[requested] ? requested : null;
    }

    /**
     * Collapses the page to a single section: the hero copy is rewritten for
     * that section, the other three are removed from the DOM entirely and the
     * in-page subnav is dropped (there is nothing left to jump between).
     */
    function applyView(view) {
        const config = VIEWS[view];

        const kicker = byId('examsHeroKicker');
        if (kicker) kicker.textContent = config.kicker;

        const title = byId('examsHeroTitle');
        if (title) title.textContent = config.title;

        const intro = byId('examsHeroPattern');
        if (intro) intro.textContent = config.intro;

        document.title = config.title + ' | Pinnacle Scholars Academy';

        SECTIONS.forEach((id) => {
            if (id === config.id) return;
            const section = document.getElementById(id);
            if (section) section.remove();
        });

        const subnav = document.querySelector('.exams-subnav');
        if (subnav) subnav.remove();

        return config.id;
    }

    /* ---------------------------------------------------------------- utils */

    function h(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function clear(node) {
        if (!node) return node;
        while (node.firstChild) node.removeChild(node.firstChild);
        return node;
    }

    function dash(value) {
        return value === 0 || value === '0' ? '—' : value;
    }

    /* ======================================================================
       HERO
       ====================================================================== */

    function renderHero() {
        const totalTests = data.months.reduce((sum, month) => sum + month.events.length, 0);
        const view = requestedView();

        const stats = view === 'guidelines'
            ? [
                { value: data.guidelines.sections.length, label: 'Rule groups' },
                { value: data.guidelines.penaltyPolicy.rows.length, label: 'Penalty levels' },
                { value: data.guidelines.validity.length, label: 'Validity periods' }
            ]
            : view === 'schemas'
                ? [
                    { value: '2', label: 'Programmes' },
                    { value: '2', label: 'Schemas each' },
                    { value: '4', label: 'Marking tables' }
                ]
                : [
                    { value: data.months.length, label: 'Months covered' },
                    { value: totalTests, label: 'Monthly tests' },
                    { value: '1', label: 'Grand Test' },
                    { value: data.reConductSaturdays.length, label: 'Re-conduct Saturdays' }
                ];

        const host = byId('examsHeroStats');
        if (!host) return;
        clear(host);

        stats.forEach((stat) => {
            const card = h('div', 'exams-stat');
            card.appendChild(h('strong', null, stat.value));
            card.appendChild(h('span', null, stat.label));
            host.appendChild(card);
        });

        const year = byId('examsHeroYear');
        if (year) year.textContent = 'Academic Year ' + data.academicYear.label;

        const pattern = byId('examsHeroPattern');
        if (pattern && !view) pattern.textContent = data.schedulePattern.summary;
    }

    /* ======================================================================
       TIMETABLE
       ====================================================================== */

    let activeProgram = 'all';

    function eventRow(event) {
        const meta = data.slotMeta(event.slot);
        const programClass = meta.program === 'jee' ? 'tt-event--jee' : 'tt-event--gate';

        const row = h('div', 'tt-event ' + programClass);

        const chip = h('div', 'tt-date');
        chip.appendChild(h('span', 'tt-date__day', data.dayShortOf(event.date)));
        chip.appendChild(h('span', 'tt-date__num', event.dayNum));
        row.appendChild(chip);

        const info = h('div', 'tt-event__info');
        info.appendChild(h('span', 'tt-event__label', meta.label));
        info.appendChild(h('span', 'tt-event__meta', data.formatLong(event.date)));

        if (event.shifted) {
            info.appendChild(
                h('span', 'tt-event__shift', 'Shifted from ' + event.shifted.from + ' · ' + event.shifted.reason)
            );
        }

        row.appendChild(info);

        const startLink = h('a', 'tt-event-start-btn', 'Start Test ▶');
        startLink.href = 'index.html?exam=' + meta.program;
        startLink.title = 'Start ' + meta.program.toUpperCase() + ' Test';
        row.appendChild(startLink);

        return row;
    }

    function specialRow(options) {
        const row = h('div', 'tt-event ' + options.modifier);

        const chip = h('div', 'tt-date');
        chip.appendChild(h('span', 'tt-date__day', data.dayShortOf(options.date)));
        chip.appendChild(h('span', 'tt-date__num', options.dayNum));
        row.appendChild(chip);

        const info = h('div', 'tt-event__info');
        info.appendChild(h('span', 'tt-event__label', options.label));
        info.appendChild(h('span', 'tt-event__meta', options.meta));
        if (options.shiftNote) {
            info.appendChild(h('span', 'tt-event__shift', options.shiftNote));
        }
        row.appendChild(info);

        return row;
    }

    function officialBlock(exam) {
        const block = h('div', 'tt-official');
        block.appendChild(h('strong', null, 'Official · ' + exam.title));
        block.appendChild(h('span', null, exam.dates));
        block.appendChild(h('span', null, 'No institute monthly test is scheduled in this window.'));

        if (exam.provisional) {
            const flag = h('span', 'nt-flag', 'Provisional');
            block.lastChild.appendChild(document.createTextNode(' '));
            block.lastChild.appendChild(flag);
        }

        return block;
    }

    function monthCard(month) {
        const card = h('article', 'tt-month');

        const testCount = month.events.filter((event) =>
            activeProgram === 'all' || data.slotMeta(event.slot).program === activeProgram
        ).length;

        const head = h('header', 'tt-month__head' + (activeProgram === 'gate' ? ' tt-month__head--gate' : ''));
        const title = h('div');
        title.appendChild(h('div', 'tt-month__name', month.label));
        title.appendChild(h('div', 'tt-month__year', String(month.year)));
        head.appendChild(title);
        head.appendChild(h('span', 'tt-month__count', testCount + (testCount === 1 ? ' test' : ' tests')));
        card.appendChild(head);

        const body = h('div', 'tt-month__body');

        const visible = activeProgram === 'all'
            ? month.events
            : month.events.filter((event) => data.slotMeta(event.slot).program === activeProgram);

        visible.forEach((event) => body.appendChild(eventRow(event)));

        if (activeProgram !== 'gate') {
            const grandInMonth = data.grandTest.date.indexOf(month.key) === 0;
            if (grandInMonth) {
                body.appendChild(
                    specialRow({
                        modifier: 'tt-event--grand',
                        date: data.grandTest.date,
                        dayNum: data.grandTest.dayNum,
                        label: data.grandTest.title,
                        meta: data.grandTest.scope + ' · attendance compulsory'
                    })
                );
            }
        }

        if (activeProgram !== 'gate') {
            const reConduct = data.reConductSaturdays.find((entry) => entry.monthKey === month.key);
            if (reConduct) {
                body.appendChild(
                    specialRow({
                        modifier: 'tt-event--reconduct',
                        date: reConduct.date,
                        dayNum: Number(reConduct.date.slice(-2)),
                        label: 'Re-conduct Saturday',
                        meta: 'Second Saturday · JEE / GATE papers missed this month',
                        shiftNote: reConduct.shifted
                            ? 'Moved from ' + data.formatShort(reConduct.shifted.from) + ' · ' + reConduct.shifted.reason
                            : null
                    })
                );
            }
        }

        if (!visible.length && !body.childElementCount) {
            body.appendChild(h('div', 'nt-empty',
                'No ' + (activeProgram === 'all' ? '' : activeProgram.toUpperCase() + ' ') + 'test scheduled this month.'));
        }

        // Official examination windows that forced a shift, repeated on the
        // same card so the reason is never separated from the affected date.
        month.events.forEach((event) => {
            if (!event.shifted || event.shifted.reason.indexOf('official') === -1) return;
            const exam = data.inOfficialWindow(event.date);
            if (exam) body.appendChild(officialBlock(exam));
        });

        card.appendChild(body);

        const holidayCount = Object.keys(data.holidays).filter((iso) => iso.indexOf(month.key) === 0).length;
        const foot = h('footer', 'tt-month__foot');
        foot.appendChild(h('span', null, holidayCount
            ? holidayCount + (holidayCount === 1 ? ' holiday observed' : ' holidays observed')
            : 'No holidays observed'));
        card.appendChild(foot);

        return card;
    }

    function renderTimetable() {
        const host = clear(byId('ttMonths'));
        if (!host) return;

        data.months.forEach((month) => host.appendChild(monthCard(month)));

        const summary = byId('ttProgramSummary');
        if (summary) {
            summary.textContent = activeProgram === 'all'
                ? 'Showing every monthly test, the December Grand Test and all re-conduct Saturdays.'
                : 'Showing ' + activeProgram.toUpperCase() + ' monthly tests only.';
        }

        const jeeBtn = byId('ttStartJeeBtn');
        const gateBtn = byId('ttStartGateBtn');
        if (jeeBtn && gateBtn) {
            if (activeProgram === 'jee') {
                jeeBtn.style.display = 'inline-flex';
                gateBtn.style.display = 'none';
            } else if (activeProgram === 'gate') {
                jeeBtn.style.display = 'none';
                gateBtn.style.display = 'inline-flex';
            } else {
                jeeBtn.style.display = 'inline-flex';
                gateBtn.style.display = 'inline-flex';
            }
        }
    }

    function initProgramSwitch() {
        const buttons = document.querySelectorAll('#ttPrograms [data-program]');
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                activeProgram = button.getAttribute('data-program');
                buttons.forEach((other) => {
                    other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
                });
                renderTimetable();
            });
        });
    }

    /* ======================================================================
       NOTIFICATIONS
       ====================================================================== */

    function currentMonthKey() {
        const now = new Date();
        const key = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const found = data.months.find((month) => month.key === key);
        return found ? found.key : data.months[0].key;
    }

    function monthBlock(month, program, isCurrent) {
        const block = h('div', 'nt-block' + (isCurrent ? ' nt-block--current' : ''));

        const label = h('div', 'nt-block__label');
        label.appendChild(h('span', null, isCurrent ? 'This month' : 'Next month'));
        block.appendChild(label);

        const cards = h('div', 'nt-cards');
        const events = month.events.filter(
            (event) => data.slotMeta(event.slot).program === program
        );

        if (!events.length) {
            cards.appendChild(h('div', 'nt-empty', 'No ' + program.toUpperCase() + ' test scheduled.'));
        }

        events.forEach((event) => {
            const meta = data.slotMeta(event.slot);
            const card = h('div', 'nt-card nt-card--' + program);

            const chip = h('div', 'nt-card__date');
            chip.appendChild(h('b', null, data.dayShortOf(event.date)));
            chip.appendChild(h('span', null, event.dayNum));
            card.appendChild(chip);

            const info = h('div', 'nt-card__info');
            info.appendChild(h('span', 'nt-card__label', meta.short));
            info.appendChild(h('span', 'nt-card__date-text', data.formatLong(event.date)));
            card.appendChild(info);

            card.appendChild(h('span', 'nt-pill nt-pill--mute', meta.icon));
            cards.appendChild(card);
        });

        block.appendChild(cards);
        return block;
    }

    function reConductBlock(month, program, isCurrent) {
        const entry = data.reConductSaturdays.find((item) => item.monthKey === month.key);
        const block = h('div', 'nt-block');

        const label = h('div', 'nt-block__label');
        label.appendChild(h('span', null, isCurrent ? 'Re-conduct Saturday' : 'Re-conduct Saturday (next month)'));
        block.appendChild(label);

        const cards = h('div', 'nt-cards');
        if (!entry) {
            cards.appendChild(h('div', 'nt-empty', 'No re-conduct Saturday recorded for this month.'));
        } else {
            const card = h('div', 'nt-card');
            const chip = h('div', 'nt-card__date');
            chip.appendChild(h('b', null, 'SAT'));
            chip.appendChild(h('span', null, Number(entry.date.slice(-2))));
            card.appendChild(chip);

            const info = h('div', 'nt-card__info');
            info.appendChild(h('span', 'nt-card__label', 'Re-conduct · ' + program.toUpperCase()));
            info.appendChild(h('span', 'nt-card__date-text', data.formatLong(entry.date)));
            if (entry.shifted) {
                info.appendChild(h('span', 'nt-card__date-text',
                    'Moved from ' + data.formatShort(entry.shifted.from) + ' · ' + entry.shifted.reason));
            }
            card.appendChild(info);

            card.appendChild(h('span', 'nt-pill nt-pill--green', '🔁'));
            cards.appendChild(card);
        }

        block.appendChild(cards);
        return block;
    }

    function programPanel(program) {
        const meta = data.notifications.programMeta[program];
        const key = currentMonthKey();
        const index = data.months.findIndex((month) => month.key === key);
        const current = data.months[index];
        const next = data.months[index + 1] || null;

        const panel = h('article', 'nt-panel');

        const head = h('header', 'nt-panel__head' + (program === 'gate' ? ' nt-panel__head--gate' : ''));
        const icon = h('div', 'nt-panel__icon', meta.icon);
        const title = h('div');
        title.appendChild(h('h3', null, meta.label));
        title.appendChild(h('small', null,
            current.label + ' ' + current.year + (next ? ' · ' + next.label + ' ' + next.year : '')));
        head.appendChild(icon);
        head.appendChild(title);
        panel.appendChild(head);

        const body = h('div', 'nt-panel__body');
        body.appendChild(monthBlock(current, program, true));
        if (next) body.appendChild(monthBlock(next, program, false));
        body.appendChild(reConductBlock(current, program, true));
        panel.appendChild(body);

        return panel;
    }

    function officialPanel() {
        const panel = h('article', 'nt-panel');

        const head = h('header', 'nt-panel__head');
        const icon = h('div', 'nt-panel__icon', '🏛️');
        const title = h('div');
        title.appendChild(h('h3', null, 'Official Examination Windows'));
        title.appendChild(h('small', null, 'NTA and GATE Committee published dates'));
        head.appendChild(icon);
        head.appendChild(title);
        panel.appendChild(head);

        const body = h('div', 'nt-panel__body');
        const list = h('div', 'nt-official-list');

        data.officialExams.forEach((exam) => {
            const card = h('div', 'nt-official');
            card.appendChild(h('strong', null, exam.title));
            card.appendChild(h('span', null, exam.dates));

            const source = h('small', null, exam.authority + ' · ' + exam.source);
            card.appendChild(source);

            if (exam.provisional) {
                const flag = h('span', 'nt-flag', 'Provisional — date to be notified');
                card.appendChild(flag);
            }

            const link = document.createElement('a');
            link.href = exam.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Official source ↗';
            link.style.cssText = 'color:var(--primary-bright);font-weight:700;margin-top:.2rem;';
            card.appendChild(link);

            list.appendChild(card);
        });

        body.appendChild(list);
        panel.appendChild(body);

        return panel;
    }

    function grandTestPanel() {
        const panel = h('article', 'nt-panel');

        const head = h('header', 'nt-panel__head');
        const icon = h('div', 'nt-panel__icon', data.notifications.grandTestNotice.icon);
        const title = h('div');
        title.appendChild(h('h3', null, data.notifications.grandTestNotice.title));
        title.appendChild(h('small', null, 'Highest weightage in your monthly performance'));
        head.appendChild(icon);
        head.appendChild(title);
        panel.appendChild(head);

        const body = h('div', 'nt-panel__body');
        const card = h('div', 'nt-card nt-card--grand');

        const chip = h('div', 'nt-card__date');
        chip.appendChild(h('b', null, data.grandTest.day.slice(0, 3).toUpperCase()));
        chip.appendChild(h('span', null, data.grandTest.dayNum));
        card.appendChild(chip);

        const info = h('div', 'nt-card__info');
        info.appendChild(h('span', 'nt-card__label', data.grandTest.title));
        info.appendChild(h('span', 'nt-card__date-text', data.formatLong(data.grandTest.date)));
        card.appendChild(info);

        card.appendChild(h('span', 'nt-pill nt-pill--amber', 'Compulsory'));
        body.appendChild(card);
        body.appendChild(h('div', 'nt-empty', data.grandTest.note));

        panel.appendChild(body);
        return panel;
    }

    function renderNotifications() {
        const alert = clear(byId('ntAlert'));
        if (alert) {
            const notice = data.notifications.reConductNotice;
            alert.appendChild(h('div', 'nt-alert__icon', notice.icon));
            const bodyEl = h('div', 'nt-alert__body');
            bodyEl.appendChild(h('p', null, notice.text));
            bodyEl.appendChild(h('small', null,
                'Students who miss a scheduled monthly test may re-attempt it only on the ' +
                're-conduct Saturday, with a documented reason submitted in advance.'));
            alert.appendChild(bodyEl);
        }

        const grid = clear(byId('ntGrid'));
        if (!grid) return;
        grid.appendChild(programPanel('jee'));
        grid.appendChild(programPanel('gate'));
        grid.appendChild(grandTestPanel());
        grid.appendChild(officialPanel());
    }

    /* ======================================================================
       GUIDELINES
       ====================================================================== */

    function guidelineCard(section) {
        const toneClass = section.tone === 'danger' ? ' gl-card--danger'
            : section.tone === 'warning' ? ' gl-card--warning' : '';

        const card = h('article', 'gl-card' + toneClass);

        const head = h('header', 'gl-card__head');
        head.appendChild(h('div', 'gl-card__icon', section.icon));
        head.appendChild(h('h3', null, section.title));
        card.appendChild(head);

        const body = h('div', 'gl-card__body');
        const list = h('ul', 'gl-list');
        section.items.forEach((item) => list.appendChild(h('li', null, item)));
        body.appendChild(list);
        card.appendChild(body);

        return card;
    }

    function buildTable(captionText, columns, rows, rowBuilder) {
        const scroll = h('div', 'gl-table-scroll');
        const table = h('table', 'exams-table');
        table.appendChild(h('caption', null, captionText));

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        columns.forEach((column) => {
            const th = h('th', null, column);
            th.setAttribute('scope', 'col');
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        rows.forEach((row) => {
            const tr = document.createElement('tr');
            rowBuilder(tr, row);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        scroll.appendChild(table);
        return scroll;
    }

    function renderPenaltyTable() {
        const host = clear(byId('glPenaltyTable'));
        if (!host) return;

        const policy = data.guidelines.penaltyPolicy;

        host.appendChild(
            buildTable('Examination Penalty Schedule', policy.columns, policy.rows, (tr, row) => {
                const levelCell = h('td', 'cell-level');
                levelCell.appendChild(h('span', 'level-chip level-chip--' + row.tone,
                    row.icon + ' ' + row.level));
                tr.appendChild(levelCell);

                tr.appendChild(h('td', null, row.offence));
                tr.appendChild(h('td', null, row.consequence));
                tr.appendChild(h('td', 'cell-fine', row.fine));
            })
        );

        const note = h('p', 'exams-note');
        note.appendChild(h('strong', null, 'Note: '));
        note.appendChild(document.createTextNode(policy.note));
        host.appendChild(note);
    }

    function renderValidity() {
        const host = clear(byId('glValidity'));
        if (!host) return;
        data.guidelines.validity.forEach((item) => {
            const box = h('div', 'exams-validity__item');
            box.appendChild(h('strong', null, item.label));
            box.appendChild(h('p', null, item.value));
            host.appendChild(box);
        });
    }

    function renderGuidelines() {
        const intro = byId('glIntro');
        if (intro) intro.textContent = data.guidelines.intro;

        const grid = clear(byId('glGrid'));
        if (grid) data.guidelines.sections.forEach((section) => grid.appendChild(guidelineCard(section)));

        renderPenaltyTable();
        renderValidity();
    }

    /* ======================================================================
       SCHEMAS
       ====================================================================== */

    function schemaBlock(program, kind) {
        const schema = data.schemas[program][kind];

        const block = h('article', 'sc-block');
        const head = h('header', 'sc-block__head' + (program === 'gate' ? ' sc-block__head--gate' : ''));
        const title = h('div');
        title.appendChild(h('h3', null, schema.title));
        title.appendChild(h('small', null, schema.authority));
        head.appendChild(title);
        head.appendChild(h('span', 'exams-badge exams-badge--' + (kind === 'official' ? 'official' : 'institute'),
            schema.badge));
        block.appendChild(head);

        const body = h('div', 'sc-block__body');
        body.appendChild(h('p', 'sc-block__summary', schema.summary));

        if (schema.meta && schema.meta.length) {
            const meta = h('div', 'sc-meta');
            schema.meta.forEach((entry) => {
                const box = h('div', 'sc-meta__item');
                box.appendChild(h('span', null, entry.label));
                box.appendChild(h('strong', null, entry.value));
                meta.appendChild(box);
            });
            body.appendChild(meta);
        }

        if (schema.sections && schema.sections.length) {
            body.appendChild(h('div', 'sc-subhead', 'Section breakdown'));
            body.appendChild(buildTable(
                schema.title + ' — sections',
                ['Section', 'Questions', 'Marks', 'Composition'],
                schema.sections,
                (tr, section) => {
                    const nameCell = h('td');
                    nameCell.appendChild(h('strong', null, section.name));
                    tr.appendChild(nameCell);
                    tr.appendChild(h('td', 'cell-level', dash(section.questions)));
                    tr.appendChild(h('td', 'cell-level', dash(section.marks)));

                    let composition = '';
                    if (section.sectionA > 0) composition += section.sectionA + ' MCQ';
                    if (section.sectionB > 0) composition += (composition ? ' + ' : '') + section.sectionB + ' Numerical';
                    if (section.note) composition += (composition ? ' — ' : '') + section.note;
                    tr.appendChild(h('td', null, composition || '—'));
                }
            ));
        }

        if (schema.marking && schema.marking.length) {
            body.appendChild(h('div', 'sc-subhead', 'Marking scheme'));
            body.appendChild(buildTable(
                schema.title + ' — marking scheme',
                ['Question type', 'Correct', 'Incorrect', 'Unattempted'],
                schema.marking,
                (tr, mark) => {
                    tr.appendChild(h('td', null, mark.type));
                    tr.appendChild(h('td', 'cell-fine', mark.correct));
                    tr.appendChild(h('td', 'cell-fine', mark.incorrect));
                    tr.appendChild(h('td', null, mark.unattempted));
                }
            ));
        }

        if (schema.specialRules && schema.specialRules.length) {
            body.appendChild(h('div', 'sc-subhead', 'Rules'));
            const list = h('ul', 'sc-rules');
            schema.specialRules.forEach((rule) => list.appendChild(h('li', null, rule)));
            body.appendChild(list);
        }

        if (schema.link) {
            const source = h('div', 'sc-source');
            source.appendChild(h('span', null, 'Source: ' + schema.source + ' — '));
            const link = document.createElement('a');
            link.href = schema.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = schema.link;
            source.appendChild(link);
            body.appendChild(source);
        }

        block.appendChild(body);
        return block;
    }

    function renderSchemas() {
        const host = clear(byId('scGrid'));
        if (!host) return;
        ['jee', 'gate'].forEach((program) => {
            host.appendChild(schemaBlock(program, 'institute'));
            host.appendChild(schemaBlock(program, 'official'));
        });
    }

    /* ======================================================================
       SECTION NAV — active state tracking
       ====================================================================== */

    function initSectionNav() {
        const links = Array.prototype.slice.call(document.querySelectorAll('.exams-subnav a[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;

        const sections = links
            .map((link) => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        const setActive = (id) => {
            links.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible.length) setActive(visible[0].target.id);
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

        sections.forEach((section) => observer.observe(section));
        if (sections.length) setActive(sections[0].id);

        links.forEach((link) => {
            link.addEventListener('click', () => setActive(link.getAttribute('href').slice(1)));
        });
    }

    /* ======================================================================
       PRINT
       ====================================================================== */

    function initPrint() {
        document.querySelectorAll('[data-print-timetable]').forEach((button) => {
            button.addEventListener('click', () => window.print());
        });
    }

    /* ======================================================================
       THEME TOGGLE
       ----------------------------------------------------------------------
       examinations.html deliberately does not load js/scripts.js (its
       DOMContentLoaded handler dereferences home-page elements that do not
       exist here), so the one script.js behaviour this page needs is
       reproduced locally. Kept identical in effect to scripts.js:toggleTheme.
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

    /* ------------------------------------------------------------------ boot */

    function init() {
        // The view is applied first so the three unrelated sections are gone
        // before their renderers run, and so the hero copy is written once.
        const view = requestedView();
        if (view) applyView(view);

        renderHero();

        if (!view || view === 'timetables') {
            renderTimetable();
            initProgramSwitch();
        }
        if (!view || view === 'notifications') renderNotifications();
        if (!view || view === 'guidelines') renderGuidelines();
        if (!view || view === 'schemas') renderSchemas();

        initSectionNav();
        initPrint();
        initThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
