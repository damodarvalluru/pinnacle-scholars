/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - SYLLABUS VIEWER BEHAVIOUR
   --------------------------------------------------------------------------
   Shared by syllabus-jee.html and syllabus-gate.html. Provides:
     1. Unit accordions (open / close / open-all)
     2. Live topic search with match highlighting
     3. Download options
          · "Download PDF"  — a real file written straight to the device
          · "Print / Save"  — the browser print dialog (Save as PDF)
     4. Smooth in-page navigation between the subject blocks

   The download works on an off-screen copy of the page (see .syl-pdf-sheet in
   css/syllabus.css) so nothing on screen is resized, hidden or flickered while
   the file is being produced, and nothing is ever saved automatically — the
   file is created only when the student presses a download button.

   Progressive enhancement: the full syllabus text is in the HTML, so the page
   stays readable even if this file fails to load.
   ========================================================================== */

(function () {
    'use strict';

    const root = document.querySelector('[data-syllabus]');
    if (!root) return;

    const examKey = root.getAttribute('data-syllabus');            // "jee" | "gate"
    const fileName = root.getAttribute('data-file') ||
        ('Pinnacle-' + examKey.toUpperCase() + '-Syllabus.pdf');
    const examLabel = root.getAttribute('data-label') || examKey.toUpperCase();

    const wrap = document.querySelector('.syl-wrap');
    const progress = document.getElementById('sylProgress');
    const status = document.getElementById('sylStatus');

    const PRINTABLE_HIDDEN = [
        '.syl-actionbar', '.syl-nav', '.syl-toolbar', '.syl-progress',
        '.syl-back', '.syl-legend', '.syl-empty', '.syl-source__actions'
    ].join(',');

    /* ------------------------------------------------------------------ units */

    function units() {
        return Array.prototype.slice.call(document.querySelectorAll('.syl-unit'));
    }

    function openUnit(unit, open) {
        unit.classList.toggle('is-open', open);
        const head = unit.querySelector('.syl-unit__head');
        if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function onUnitHeadClick(event) {
        const unit = event.currentTarget.closest('.syl-unit');
        if (!unit) return;
        openUnit(unit, !unit.classList.contains('is-open'));
    }

    function onUnitKeydown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        // The button already handles Enter/Space natively; nothing to add.
    }

    function setAll(open) {
        units().forEach((unit) => {
            if (unit.hidden) return;
            openUnit(unit, open);
        });
    }

    /* ----------------------------------------------------------------- search */

    function normalise(text) {
        return (text || '').toLowerCase();
    }

    /**
     * Rebuilds the topic lists from the original markup with the query wrapped
     * in <mark>. innerHTML is used with a single interpolated match that is
     * escaped first, so no page text can inject markup.
     */
    function highlight(list, query) {
        if (!list) return;

        if (!query) {
            list.innerHTML = list.getAttribute('data-original') || '';
            return;
        }

        const original = list.getAttribute('data-original');
        if (original === null) {
            list.setAttribute('data-original', list.innerHTML);
        }

        const pattern = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        list.innerHTML = (list.getAttribute('data-original') || '')
            .replace(pattern, '<mark class="syl-hit">$1</mark>');
    }

    function runSearch(rawQuery) {
        const query = normalise(rawQuery.trim());
        let visibleUnits = 0;
        let visibleSubjects = 0;

        document.querySelectorAll('.syl-subject').forEach((subject) => {
            let subjectHits = 0;

            subject.querySelectorAll('.syl-unit').forEach((unit) => {
                const list = unit.querySelector('.syl-unit__body ul');
                const nameNode = unit.querySelector('.syl-unit__name');

                if (nameNode && nameNode.getAttribute('data-original') === null) {
                    nameNode.setAttribute('data-original', nameNode.innerHTML);
                }

                if (!query) {
                    unit.hidden = false;
                    openUnit(unit, unit.classList.contains('is-open'));
                    if (list) highlight(list, '');
                    if (nameNode) nameNode.innerHTML = nameNode.getAttribute('data-original');
                    subjectHits++;
                    return;
                }

                const nameText = normalise(nameNode ? nameNode.textContent : '');
                const topicText = normalise(list ? list.textContent : '');

                const matched = nameText.indexOf(query) !== -1 || topicText.indexOf(query) !== -1;

                unit.hidden = !matched;
                if (list) highlight(list, query);
                if (nameNode) highlight(nameNode, query);
                if (matched) {
                    openUnit(unit, true);
                    subjectHits++;
                }
            });

            subject.hidden = subjectHits === 0;
            if (subjectHits) visibleSubjects++;
            visibleUnits += subjectHits;
        });

        const empty = document.getElementById('sylEmpty');
        if (empty) empty.style.display = visibleUnits ? 'none' : 'block';

        if (status) {
            status.textContent = query
                ? visibleUnits + (visibleUnits === 1 ? ' unit matches “' + rawQuery.trim() + '”' : ' unit matches for “' + rawQuery.trim() + '”')
                : units().length + ' units · ' + document.querySelectorAll('.syl-subject').length + ' sections';
        }
    }

    /* ------------------------------------------------------------- navigation */

    function onNavClick(event) {
        const link = event.currentTarget;
        const hash = link.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const bar = document.querySelector('.syl-actionbar');
        if (bar) {
            const offset = bar.getBoundingClientRect().height + 12;
            const top = window.pageYOffset + target.getBoundingClientRect().top - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }

    /* -------------------------------------------------------------- download */

    function setBusy(busy, label) {
        document.querySelectorAll('[data-syl-download]').forEach((button) => {
            button.disabled = busy;
        });
        if (progress) {
            progress.classList.toggle('is-active', busy);
            const text = progress.querySelector('.syl-progress__text');
            if (text) text.textContent = label || 'Preparing your file…';
        }
    }

    /**
     * Builds the print-clean copy used for the PDF. The live page is never
     * touched, so the student keeps reading while the file is produced.
     */
    function buildSheet() {
        if (!wrap) return null;

        const sheet = document.createElement('div');
        sheet.className = 'syl-pdf-sheet';
        sheet.setAttribute('aria-hidden', 'true');

        const copy = wrap.cloneNode(true);
        copy.classList.remove('syl-wrap');
        copy.style.padding = '0';

        PRINTABLE_HIDDEN.split(',').forEach((selector) => {
            copy.querySelectorAll(selector).forEach((node) => node.remove());
        });

        // Nothing interactive or highlighted survives into the file.
        copy.querySelectorAll('.syl-unit').forEach((unit) => unit.classList.add('is-open'));
        copy.querySelectorAll('mark.syl-hit').forEach((mark) => {
            mark.replaceWith(document.createTextNode(mark.textContent));
        });
        copy.querySelectorAll('[data-syl-download]').forEach((node) => node.remove());

        // The unit title is content, not chrome: swap the <button> for a plain
        // <div> that keeps the number, name and weightage, and drop only the
        // interactive caret.
        copy.querySelectorAll('.syl-unit__head').forEach((head) => {
            const plain = document.createElement('div');
            plain.className = 'syl-unit__head syl-unit__head--static';
            plain.removeAttribute('aria-expanded');
            plain.removeAttribute('aria-controls');

            head.querySelectorAll('.syl-unit__caret').forEach((caret) => caret.remove());
            while (head.firstChild) plain.appendChild(head.firstChild);

            head.replaceWith(plain);
        });

        const note = document.createElement('p');
        note.className = 'syl-pdf-note';
        note.textContent = 'Compiled for Pinnacle Scholars Academy, Noida · Official syllabus release: ' +
            (root.getAttribute('data-source-label') || 'NTA / GATE organising institute') +
            ' · The published bulletin always prevails.';
        copy.appendChild(note);

        sheet.appendChild(copy);
        document.body.appendChild(sheet);
        return sheet;
    }

    function downloadPdf() {
        const sheet = buildSheet();
        if (!sheet) return;

        if (typeof window.html2pdf !== 'function') {
            sheet.remove();
            openPrintWindow();
            return;
        }

        setBusy(true, 'Building ' + examLabel + ' PDF…');

        const finish = () => {
            sheet.remove();
            setBusy(false);
        };

        try {
            window.html2pdf()
                .set({
                    margin: [8, 8, 10, 8],
                    filename: fileName,
                    image: { type: 'jpeg', quality: 0.97 },
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(sheet)
                .save()
                .then(finish)
                .catch((error) => {
                    console.error('[syllabus] PDF generation failed:', error);
                    finish();
                    openPrintWindow();
                });
        } catch (error) {
            console.error('[syllabus] PDF generation failed:', error);
            finish();
            openPrintWindow();
        }
    }

    /**
     * Fallback path: hands the student the browser print dialog, where
     * "Save as PDF" writes the syllabus to the device. Used when the PDF
     * library is unavailable (offline) or fails.
     */
    function openPrintWindow() {
        const sheet = buildSheet();
        if (!sheet) return;

        const win = window.open('', '_blank');
        if (!win) {
            sheet.remove();
            return;
        }

        const styles = Array.prototype.slice
            .call(document.querySelectorAll('link[rel="stylesheet"]'))
            .map((link) => '<link rel="stylesheet" href="' + link.href + '">')
            .join('');

        win.document.write(
            '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
            '<title>' + examLabel + ' Syllabus — Pinnacle Scholars Academy</title>' +
            styles +
            '<style>body{background:#fff;margin:0;padding:14px;}' +
            // The same print rules the PDF sheet uses, with the off-screen
            // parking removed so the content flows normally here.
            '.syl-pdf-sheet{position:static !important;top:auto !important;' +
            'left:auto !important;width:auto !important;z-index:auto !important;' +
            'pointer-events:auto !important;}' +
            '@page{size:A4;margin:10mm;}</style>' +
            '</head><body></body></html>'
        );
        win.document.close();

        const holder = win.document.createElement('div');
        holder.className = 'syl-pdf-sheet';
        holder.appendChild(sheet.firstChild);
        win.document.body.appendChild(holder);
        sheet.remove();

        win.focus();
        setTimeout(() => {
            win.print();
        }, 450);
    }

    /* ------------------------------------------------------------------ init */

    function init() {
        document.querySelectorAll('.syl-unit__head').forEach((head) => {
            head.setAttribute('aria-expanded', 'false');
            head.addEventListener('click', onUnitHeadClick);
            head.addEventListener('keydown', onUnitKeydown);
        });

        // Open the first unit of every section so the page never looks empty.
        document.querySelectorAll('.syl-subject').forEach((subject) => {
            const first = subject.querySelector('.syl-unit');
            if (first) openUnit(first, true);
        });

        document.querySelectorAll('.syl-nav a').forEach((link) => {
            link.addEventListener('click', onNavClick);
        });

        const expand = document.getElementById('sylExpandAll');
        if (expand) {
            expand.addEventListener('click', () => {
                const collapse = expand.getAttribute('data-mode') === 'open';
                setAll(!collapse);
                expand.setAttribute('data-mode', collapse ? 'closed' : 'open');
                expand.textContent = collapse ? '⤢ Expand all' : '⤡ Collapse all';
            });
        }

        const search = document.getElementById('sylSearch');
        if (search) {
            let timer = null;
            search.addEventListener('input', () => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => runSearch(search.value), 140);
            });
            search.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    search.value = '';
                    runSearch('');
                }
            });
        }

        document.querySelectorAll('[data-syl-download="pdf"]').forEach((button) => {
            button.addEventListener('click', downloadPdf);
        });

        document.querySelectorAll('[data-syl-download="print"]').forEach((button) => {
            button.addEventListener('click', openPrintWindow);
        });

        runSearch('');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
