// Admin dashboard controller. Every value shown here comes from an authenticated
// backend response; no statistics or records are generated in the browser.
(function () {
    'use strict';

    var API_BASE = window.PINNACLE_API_BASE || 'https://pinnacle-backend-5i7n.onrender.com';
    var SECTION_TITLES = {
        overview: ['Dashboard', 'Live records from the academy database'],
        students: ['Students', 'Registered students, profiles and fee position'],
        faculty: ['Faculty', 'Faculty records and published exams'],
        exams: ['Exams', 'Published papers and submission state'],
        performance: ['Exam Results', 'Attempts, scores and rankings'],
        syllabus: ['Syllabus', 'Subjects from published exam questions'],
        timetables: ['Timetables', 'Database-backed schedules and announcements'],
        fees: ['Fees', 'Fee structures, dues and payment history'],
        programs: ['Programs', 'Program statistics from student records'],
        guidelines: ['Guidelines', 'Guidance records stored in the database'],
        messages: ['Contact Messages', 'Messages submitted by students and visitors'],
        reports: ['Reports', 'Consolidated insights from live academy records'],
        'gate-jee': ['GATE & JEE Stats', 'Separate program analytics'],
        settings: ['Settings', 'Admin credential management']
    };

    // Friendly hash aliases keep older bookmarks working after the menu rename.
    var SECTION_ALIASES = {
        'exam-results': 'performance',
        'exam-management': 'exams',
        'fee-management': 'fees',
        'contact-messages': 'messages',
        'timetables-guidelines': 'timetables'
    };

    var state = { section: 'overview', loaded: {}, cache: {}, sessionExpiresAt: 0 };
    var $ = function (selector) { return document.querySelector(selector); };

    function esc(value) {
        return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function money(value) {
        var number = Number(value) || 0;
        return '₹' + number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function dateText(value) {
        if (!value) return '—';
        return String(value).replace('T', ' ').slice(0, 19);
    }

    function num(value) { return Number(value) || 0; }

    function params(form) {
        var result = {};
        if (!form) return result;
        form.querySelectorAll('[data-param]').forEach(function (input) {
            if (input.value && String(input.value).trim()) result[input.getAttribute('data-param')] = input.value.trim();
        });
        return result;
    }

    function query(values) {
        return new URLSearchParams(values).toString();
    }

    function api(path, options) {
        options = options || {};
        var headers = { 'Accept': 'application/json' };
        if (options.body) headers['Content-Type'] = 'application/json';
        return fetch(API_BASE + path, {
            method: options.method || 'GET',
            credentials: 'include',
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        }).then(function (response) {
            if (response.status === 401) {
                window.location.replace('admin-login.html');
                throw new Error('Admin session expired');
            }
            return response.json().catch(function () { return {}; }).then(function (data) {
                return { status: response.status, data: data };
            });
        });
    }

    function statCard(icon, value, label, foot, trend) {
        return '<article class="admin-stat-card">' +
            '<div class="admin-stat-card__top"><span class="admin-stat-card__icon">' + esc(icon) + '</span>' +
            (trend ? '<span class="admin-stat-card__trend">' + esc(trend) + '</span>' : '') + '</div>' +
            '<strong class="admin-stat-card__value">' + esc(value) + '</strong>' +
            '<span class="admin-stat-card__label">' + esc(label) + '</span>' +
            (foot ? '<span class="admin-stat-card__foot">' + esc(foot) + '</span>' : '') +
            '</article>';
    }

    function emptyState(title, message, icon) {
        return '<div class="admin-empty"><div class="admin-empty__icon">' + esc(icon || '📭') + '</div>' +
            '<strong>' + esc(title) + '</strong><p>' + esc(message) + '</p></div>';
    }

    function table(headers, rows) {
        if (!rows.length) return emptyState('No records found', 'No records match the current view or filters.', '📭');
        return '<table class="admin-table"><thead><tr>' + headers.map(function (h) {
            return '<th>' + esc(h) + '</th>';
        }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }

    function badge(label, kind) {
        return '<span class="admin-badge admin-badge--' + esc(kind || '') + '">' + esc(label) + '</span>';
    }

    function toast(message, isError) {
        var box = $('#adminToast');
        if (!box) return;
        box.textContent = message;
        box.className = 'admin-toast' + (isError ? ' admin-toast--error' : '');
        window.clearTimeout(toast.timer);
        toast.timer = window.setTimeout(function () { box.textContent = ''; box.className = ''; }, 4000);
    }

    function openModal(title, html) {
        $('#adminModalTitle').textContent = title;
        $('#adminModalBody').innerHTML = html;
        $('#adminModal').classList.add('is-open');
    }

    function closeModal() { $('#adminModal').classList.remove('is-open'); }

    function detailGrid(items) {
        return '<div class="admin-detail-grid">' + items.map(function (item) {
            return '<div class="admin-detail-item"><small>' + esc(item[0]) + '</small><strong>' + esc(item[1]) + '</strong></div>';
        }).join('') + '</div>';
    }

    function csvExport(key, filename) {
        var rows = state.cache[key];
        if (!rows || !rows.length) { toast('There are no loaded records to export.', true); return; }
        var columns = Object.keys(rows[0]).filter(function (column) {
            return typeof rows[0][column] !== 'object';
        });
        var lines = [columns.join(',')].concat(rows.map(function (row) {
            return columns.map(function (column) {
                return '"' + String(row[column] === null || row[column] === undefined ? '' : row[column]).replace(/"/g, '""') + '"';
            }).join(',');
        }));
        var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename + '.csv';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    // ---------- section loaders ----------
    function loadOverview() {
        return api('/api/admin/overview').then(function (result) {
            if (!result.data.success) throw new Error('overview');
            var counts = result.data.counts || {};
            var fees = result.data.fees || {};
            var sync = $('#ovSynced');
            if (sync) {
                sync.textContent = 'Live snapshot · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            }
            $('#ovStats').innerHTML = [
                statCard('🎓', num(counts.students), 'Students registered', num(counts.studentsWithAttempts) + ' with exam attempts'),
                statCard('👨‍🏫', num(counts.faculty), 'Faculty members', 'Active in database'),
                statCard('📝', num(counts.exams), 'Exams published', 'By faculty'),
                statCard('🏆', num(counts.attempts), 'Exam attempts', num(counts.studentsWithAttempts) + ' participating students'),
                statCard('💳', num(counts.payments), 'Payments recorded', money(fees.collected) + ' collected'),
                statCard('✉️', num(counts.messages), 'Contact messages', 'From the contact form'),
                statCard('📈', money(fees.feesPaid), 'Fees paid', 'Across all students'),
                statCard('⏳', money(fees.remaining), 'Fees outstanding', 'Remaining balance')
            ].join('');

            var domains = (result.data.byDomain || []).map(function (row) {
                return { label: row.domain, value: num(row.total) };
            });
            var maxDomain = Math.max.apply(null, [1].concat(domains.map(function (row) { return row.value; })));
            $('#ovDomainBars').innerHTML = domains.length ? '<div class="admin-bars">' + domains.map(function (row) {
                return '<div class="admin-bar-row"><span title="' + esc(row.label) + '">' + esc(row.label) + '</span>' +
                    '<span class="admin-bar-track"><span class="admin-bar-fill" style="width:' + Math.round(row.value / maxDomain * 100) + '%"></span></span>' +
                    '<strong>' + row.value + '</strong></div>';
            }).join('') + '</div>' : emptyState('No students yet', 'Student registrations will appear here.', '🎓');

            var types = (result.data.byTestType || []).map(function (row) {
                return { label: row.test_type, value: num(row.total) };
            });
            var totalTests = types.reduce(function (sum, row) { return sum + row.value; }, 0);
            var cumulative = 0;
            var stops = types.map(function (row) {
                var start = cumulative;
                cumulative += totalTests ? row.value / totalTests * 100 : 0;
                return { row: row, start: start, end: cumulative };
            });
            $('#ovTypeDonut').innerHTML = totalTests ?
                '<div class="admin-donut-wrap"><div class="admin-donut" style="' +
                '--donut-a:' + (stops[0] ? stops[0].end : 0) + '%;--donut-b:' + (stops[1] ? stops[1].end : 0) +
                '%;--donut-c:' + (stops[2] ? stops[2].end : 0) + '%">' +
                '<div class="admin-donut__label"><strong>' + totalTests + '</strong><span>exams</span></div></div>' +
                '<div class="admin-legend">' + stops.map(function (item, index) {
                    var color = ['#2563EB', '#00A8E8', '#7C3AED'][index % 3];
                    return '<div><i style="background:' + color + '"></i><span>' + esc(item.row.label) + '</span><span>' + item.row.value + '</span></div>';
                }).join('') + '</div></div>' : emptyState('No exams published', 'Published exam papers will appear here.', '📝');

            var recentStudents = result.data.recentStudents || [];
            $('#ovRecentStudents').innerHTML = table(['Student', 'Program', 'Enrolled'], recentStudents.map(function (row) {
                return '<tr><td><strong>' + esc(row.name) + '</strong><small>' + esc(row.student_id) + '</small></td>' +
                    '<td>' + esc(row.domain) + '</td><td>' + esc(dateText(row.enrollment_date || row.created_at)) + '</td></tr>';
            }));

            $('#ovRecentExams').innerHTML = '<div class="admin-card__head"><h3>Latest exams</h3></div>' + table(['Exam', 'Type', 'Published'], (result.data.recentExams || []).map(function (row) {
                return '<tr><td><strong>' + esc(row.title) + '</strong><small>' + esc(row.test_id) + '</small></td>' +
                    '<td>' + esc(row.test_type) + '</td><td>' + esc(dateText(row.published_at)) + '</td></tr>';
            }));
            $('#ovRecentMessages').innerHTML = '<div class="admin-card__head"><h3>Latest messages</h3></div>' + table(['Name', 'Email', 'Received'], (result.data.recentMessages || []).map(function (row) {
                return '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.email) + '</td><td>' + esc(dateText(row.created_at)) + '</td></tr>';
            }));
        });
    }

    function loadStudents() {
        var form = $('#studentsFilters');
        return api('/api/admin/students' + (query(params(form)) ? '?' + query(params(form)) : '')).then(function (result) {
            var records = result.data.records || [];
            state.cache.students = records;
            $('#studentsCount').textContent = records.length
                ? 'Showing ' + records.length + ' of ' + num(result.data.total) + ' registered students.'
                : 'No students match the current filters.';
            $('#studentsTable').innerHTML = table(
                ['Student ID', 'Name', 'Program', 'Enrolled', 'Fees (total / paid / due)', 'Payments', 'Attempts', ''],
                records.map(function (row) {
                    var status = num(row.remaining_fees) <= 0 ? badge('Paid', 'success')
                        : num(row.fees_paid) <= 0 ? badge('Unpaid', 'danger') : badge('Partial', 'warning');
                    return '<tr><td><strong>' + esc(row.student_id) + '</strong></td><td>' + esc(row.name) + '</td>' +
                        '<td>' + esc(row.domain) + '</td><td>' + esc(dateText(row.enrollment_date)) + '</td>' +
                        '<td class="admin-table__num">' + money(row.total_fees) + '<small>Paid ' + money(row.fees_paid) + ' · Due ' + money(row.remaining_fees) + '</small></td>' +
                        '<td>' + num(row.payment_count) + '</td><td>' + num(row.attempt_count) + '</td>' +
                        '<td>' + status + ' <button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-detail="student:' + esc(row.student_id) + '">View</button></td></tr>';
                })
            );
        });
    }

    function loadFaculty() {
        var form = $('#facultyFilters');
        return api('/api/admin/faculty' + (query(params(form)) ? '?' + query(params(form)) : '')).then(function (result) {
            var records = result.data.records || [];
            state.cache.faculty = records;
            $('#facultyCount').textContent = records.length ? 'Showing ' + records.length + ' of ' + num(result.data.total) + ' faculty members.' : 'No faculty members match the current filters.';
            $('#facultyTable').innerHTML = table(
                ['Faculty ID', 'Name', 'Domain', 'Contact', 'Qualifications', 'Published exams', ''],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.faculty_id) + '</strong></td><td>' + esc(row.name) + '</td>' +
                        '<td>' + esc(row.domain) + '</td><td>' + esc(row.mail) + '<small>' + esc(row.mobile) + '</small></td>' +
                        '<td>' + esc(String(row.qualifications || '—').slice(0, 70)) + '</td>' +
                        '<td>' + num(row.published_tests) + '</td>' +
                        '<td><button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-detail="faculty:' + esc(row.faculty_id) + '">View</button></td></tr>';
                })
            );
        });
    }

    function loadExams() {
        var form = $('#examsFilters');
        var suffix = query(params(form)) ? '?' + query(params(form)) : '';
        return Promise.all([
            api('/api/admin/exams'),
            api('/api/admin/exams' + suffix)
        ]).then(function (results) {
            var all = results[0].data.records || [];
            var records = results[1].data.records || [];
            state.cache.exams = records;
            var completed = all.filter(function (row) { return num(row.attempt_count) > 0; }).length;
            $('#examStats').innerHTML = [
                statCard('📝', all.length, 'Exams published', 'Across all exam types'),
                statCard('✅', completed, 'Completed', 'Exams with recorded submissions'),
                statCard('⏳', all.length - completed, 'Pending', 'Exams with no submissions yet')
            ].join('');
            $('#examsNoteText').textContent = results[1].data.note || '';
            $('#examsCount').textContent = records.length ? 'Showing ' + records.length + ' published exam papers.' : 'No exams match the current filters.';
            $('#examsTable').innerHTML = table(
                ['Test ID', 'Title', 'Type', 'Faculty', 'Questions / subjects', 'Submissions', 'State', 'Published', ''],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.test_id) + '</strong></td><td>' + esc(row.title) + '</td>' +
                        '<td>' + esc(row.test_type) + '</td><td>' + esc(row.faculty_name) + '<small>' + esc(row.faculty_id) + '</small></td>' +
                        '<td>' + num(row.question_count) + ' questions<small>' + esc((row.subjects || []).join(', ') || '—') + '</small></td>' +
                        '<td>' + num(row.attempt_count) + '</td>' +
                        '<td>' + (row.state === 'completed' ? badge('Completed', 'success') : badge('Pending', 'warning')) + '</td>' +
                        '<td>' + esc(dateText(row.published_at)) + '</td>' +
                        '<td><button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-detail="exam:' + esc(row.test_id) + '">View</button></td></tr>';
                })
            );
        });
    }

    function loadPerformance() {
        var form = $('#performanceFilters');
        return api('/api/admin/performance' + (query(params(form)) ? '?' + query(params(form)) : '')).then(function (result) {
            var records = result.data.records || [];
            var metrics = result.data.metrics || {};
            state.cache.performance = records;
            $('#perfStats').innerHTML = [
                statCard('🏆', num(metrics.attempts), 'Total attempts', num(metrics.students) + ' distinct students'),
                statCard('📊', Number(metrics.average_score || 0).toFixed(2), 'Average score', 'Across all submissions'),
                statCard('⬆️', num(metrics.highest_score), 'Highest score', 'Best submitted score'),
                statCard('⬇️', num(metrics.lowest_score), 'Lowest score', 'Lowest submitted score')
            ].join('');
            $('#performanceCount').textContent = records.length ? 'Showing ' + records.length + ' result records. ' + (result.data.note || '') : 'No result records match the current filters.';
            $('#performanceTable').innerHTML = table(
                ['Rank', 'Student', 'Program', 'Exam', 'Score', 'Submitted'],
                records.map(function (row) {
                    return '<tr><td>' + badge('#' + num(row.rank), 'violet') + '</td>' +
                        '<td><strong>' + esc(row.student_name) + '</strong><small>' + esc(row.student_id) + '</small></td>' +
                        '<td>' + esc(row.student_domain || '—') + '</td>' +
                        '<td>' + esc(row.exam_title || row.test_id) + '<small>' + esc(row.test_type || row.test_id) + '</small></td>' +
                        '<td class="admin-table__num"><strong>' + esc(row.score) + '</strong> / ' + esc(row.total_marks || '—') + '</td>' +
                        '<td>' + esc(dateText(row.submitted_at)) + '</td></tr>';
                })
            );
        });
    }

    function loadSyllabus() {
        return api('/api/admin/syllabus').then(function (result) {
            var records = result.data.records || [];
            var q = ($('#syQ') || {}).value ? $('#syQ').value.trim().toLowerCase() : '';
            var type = ($('#syType') || {}).value ? $('#syType').value.trim().toLowerCase() : '';
            records = records.filter(function (row) {
                return (!q || String(row.subject).toLowerCase().indexOf(q) !== -1 || String(row.exam_title).toLowerCase().indexOf(q) !== -1) &&
                    (!type || String(row.test_type).toLowerCase().indexOf(type) !== -1);
            });
            state.cache.syllabus = records;
            $('#syllabusNoteText').textContent = result.data.note || '';
            $('#syllabusCount').textContent = records.length ? 'Showing ' + records.length + ' subject / exam pairs recorded in published papers.' : 'No syllabus information is available in the database for these filters.';
            $('#syllabusTable').innerHTML = table(
                ['Subject', 'Exam', 'Type', 'Questions', 'Published'],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.subject) + '</strong></td><td>' + esc(row.exam_title) + '<small>' + esc(row.test_id) + '</small></td>' +
                        '<td>' + esc(row.test_type) + '</td><td>' + num(row.question_count) + '</td><td>' + esc(dateText(row.published_at)) + '</td></tr>';
                })
            );
        });
    }

    function loadFees() {
        var feeForm = $('#feesFilters');
        var payForm = $('#paymentsFilters');
        var feeSuffix = query(params(feeForm)) ? '?' + query(params(feeForm)) : '';
        var paySuffix = query(params(payForm)) ? '?' + query(params(payForm)) : '';
        return Promise.all([
            api('/api/admin/fees' + feeSuffix),
            api('/api/admin/fees/payments' + paySuffix)
        ]).then(function (results) {
            var records = results[0].data.records || [];
            var payments = results[1].data.records || [];
            var summary = results[0].data.summary || {};
            state.cache.fees = records;
            state.cache.payments = payments;
            $('#feeStats').innerHTML = [
                statCard('💰', money(summary.totalFees || summary.total_fees || 0), 'Total fee structure', 'Sum of student records'),
                statCard('✅', money(summary.feesPaid || summary.fees_paid || 0), 'Fees paid', 'Recorded against students'),
                statCard('⏳', money(summary.remaining || summary.remaining_fees || 0), 'Fees outstanding', 'Remaining balances'),
                statCard('🧾', payments.length, 'Transactions shown', 'From payment history')
            ].join('');
            $('#feesCount').textContent = records.length ? 'Showing ' + records.length + ' of ' + num(results[0].data.total) + ' student fee records.' : 'No student fee records match the current filters.';
            $('#feesTable').innerHTML = table(
                ['Student', 'Program', 'Total fees', 'Paid', 'Remaining', 'Payments', 'Status', 'Actions'],
                records.map(function (row) {
                    var status = num(row.remaining_fees) <= 0 ? badge('Paid', 'success')
                        : num(row.fees_paid) <= 0 ? badge('Unpaid', 'danger') : badge('Partial', 'warning');
                    return '<tr><td><strong>' + esc(row.name) + '</strong><small>' + esc(row.student_id) + '</small></td>' +
                        '<td>' + esc(row.domain) + '</td><td class="admin-table__num">' + money(row.total_fees) + '</td>' +
                        '<td class="admin-table__num">' + money(row.fees_paid) + '</td>' +
                        '<td class="admin-table__num">' + money(row.remaining_fees) + '</td>' +
                        '<td>' + num(row.payment_count) + '</td><td>' + status + '</td>' +
                        '<td><div class="admin-table__actions">' +
                        '<button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-fee-action="edit-fee" data-student="' + esc(row.student_id) + '">Edit fees</button>' +
                        '<button class="admin-btn admin-btn--sm" type="button" data-fee-action="add-payment" data-student="' + esc(row.student_id) + '">Add payment</button>' +
                        '</div></td></tr>';
                })
            );
            $('#paymentsCount').textContent = payments.length ? 'Showing ' + payments.length + ' payment records.' : 'No payment records match the current filters.';
            $('#paymentsTable').innerHTML = table(
                ['Student', 'Order ID', 'Payment ID', 'Amount', 'Type', 'Status', 'Paid at', 'Actions'],
                payments.map(function (row) {
                    return '<tr><td><strong>' + esc(row.student_name || row.student_id) + '</strong><small>' + esc(row.student_id) + '</small></td>' +
                        '<td>' + esc(row.razorpay_order_id || '—') + '</td><td>' + esc(row.razorpay_payment_id || '—') + '</td>' +
                        '<td class="admin-table__num">' + money(row.amount_paid) + '</td><td>' + esc(row.payment_type || '—') + '</td>' +
                        '<td>' + badge(row.payment_status || '—', String(row.payment_status).toUpperCase() === 'SUCCESS' ? 'success' : 'warning') + '</td>' +
                        '<td>' + esc(dateText(row.paid_at)) + '</td>' +
                        '<td><div class="admin-table__actions"><button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-fee-action="edit-payment" data-payment="' + esc(row.id) + '">Edit</button></div></td></tr>';
                })
            );
        });
    }

    // ---------- fee management ----------
    function feeStatusLabel(row) {
        if (num(row.remaining_fees) <= 0) return 'Paid';
        return num(row.fees_paid) <= 0 ? 'Unpaid' : 'Partial';
    }

    function localDateTime(value) {
        if (value) return String(value).replace(' ', 'T').slice(0, 16);
        var now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        return now.toISOString().slice(0, 16);
    }

    function openFeeDialog(title, html, onSubmit) {
        openModal(title, html);
        var form = $('#adminModalBody').querySelector('.admin-fee-form');
        if (!form) return;
        var cancel = form.querySelector('[data-modal-cancel]');
        if (cancel) cancel.addEventListener('click', closeModal);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var body = {};
            Array.prototype.forEach.call(form.elements, function (input) {
                if (input.name) body[input.name] = input.value;
            });
            var button = form.querySelector('button[type="submit"]');
            button.disabled = true;
            onSubmit(body, button);
        });
    }

    function finishFeeWrite(result, button, fallbackMessage) {
        button.disabled = false;
        if (result.status >= 400 || !result.data.success) {
            toast(result.data.message || (fallbackMessage + ' failed.'), true);
            return;
        }
        closeModal();
        toast(result.data.message || fallbackMessage);
        LOADERS.fees().catch(function () { toast('Fee records could not be refreshed.', true); });
    }

    function editFee(studentId) {
        var row = (state.cache.fees || []).find(function (item) { return String(item.student_id) === String(studentId); });
        if (!row) { toast('That fee record is no longer in the current view.', true); return; }
        openFeeDialog('Edit fees — ' + row.name,
            detailGrid([
                ['Student ID', row.student_id], ['Program', row.domain],
                ['Paid', money(row.fees_paid)], ['Outstanding', money(row.remaining_fees)],
                ['Status', feeStatusLabel(row)]
            ]) +
            '<form class="admin-fee-form">' +
                '<input type="hidden" name="studentId" value="' + esc(row.student_id) + '">' +
                '<label class="admin-field"><span>Total fee structure</span><span class="admin-field__input"><input name="totalFees" type="number" min="0" step="0.01" value="' + esc(row.total_fees) + '" required></span></label>' +
                '<p class="admin-fee-form__hint">Paid amounts and payment history are unchanged. The outstanding balance is recalculated automatically.</p>' +
                '<div class="admin-fee-form__actions"><button class="admin-btn admin-btn--ghost" type="button" data-modal-cancel>Cancel</button><button class="admin-btn" type="submit">Save fee structure</button></div>' +
            '</form>',
            function (body, button) {
                api('/api/admin/fees/' + encodeURIComponent(body.studentId), {
                    method: 'PATCH', body: { totalFees: body.totalFees }
                }).then(function (result) {
                    finishFeeWrite(result, button, 'Fee structure updated');
                }).catch(function () {
                    button.disabled = false;
                    toast('Could not reach the server.', true);
                });
            });
    }

    function addPayment(studentId) {
        var row = (state.cache.fees || []).find(function (item) { return String(item.student_id) === String(studentId); });
        if (!row) { toast('That student is no longer in the current view.', true); return; }
        if (num(row.remaining_fees) <= 0) { toast('This student has no outstanding fees.', true); return; }
        openFeeDialog('Record payment — ' + row.name,
            detailGrid([
                ['Student ID', row.student_id], ['Program', row.domain],
                ['Total fees', money(row.total_fees)], ['Paid', money(row.fees_paid)],
                ['Outstanding', money(row.remaining_fees)]
            ]) +
            '<form class="admin-fee-form">' +
                '<input type="hidden" name="studentId" value="' + esc(row.student_id) + '">' +
                '<div class="admin-fee-form__grid">' +
                    '<label class="admin-field"><span>Amount</span><span class="admin-field__input"><input name="amount" type="number" min="0.01" max="' + esc(row.remaining_fees) + '" step="0.01" placeholder="0.00" required></span></label>' +
                    '<label class="admin-field"><span>Method</span><span class="admin-field__input"><select name="paymentType"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="UPI">UPI</option><option value="OTHER">Other</option></select></span></label>' +
                    '<label class="admin-field"><span>Paid at</span><span class="admin-field__input"><input name="paidAt" type="datetime-local" value="' + esc(localDateTime()) + '" required></span></label>' +
                    '<label class="admin-field"><span>Reference (optional)</span><span class="admin-field__input"><input name="reference" maxlength="80" placeholder="Receipt or voucher number" autocomplete="off"></span></label>' +
                '</div>' +
                '<p class="admin-fee-form__hint">A unique ADMIN reference is generated when none is supplied. Full or partial amounts are both accepted.</p>' +
                '<div class="admin-fee-form__actions"><button class="admin-btn admin-btn--ghost" type="button" data-modal-cancel>Cancel</button><button class="admin-btn" type="submit">Record payment</button></div>' +
            '</form>',
            function (body, button) {
                api('/api/admin/fees/' + encodeURIComponent(body.studentId) + '/payments', {
                    method: 'POST',
                    body: { amount: body.amount, paymentType: body.paymentType, paidAt: body.paidAt, reference: body.reference }
                }).then(function (result) {
                    finishFeeWrite(result, button, 'Payment recorded');
                }).catch(function () {
                    button.disabled = false;
                    toast('Could not reach the server.', true);
                });
            });
    }

    function editPayment(paymentId) {
        var row = (state.cache.payments || []).find(function (item) { return String(item.id) === String(paymentId); });
        if (!row) { toast('That payment record is no longer in the current view.', true); return; }
        var currentStatus = String(row.payment_status || 'SUCCESS').toUpperCase();
        var statuses = ['SUCCESS', 'FAILED', 'REFUNDED'];
        if (statuses.indexOf(currentStatus) < 0) statuses.unshift(currentStatus);
        openFeeDialog('Edit payment record',
            detailGrid([
                ['Student', row.student_name || row.student_id], ['Student ID', row.student_id],
                ['Payment ID', row.razorpay_payment_id || '—'], ['Order ID', row.razorpay_order_id || '—'],
                ['Recorded amount', money(row.amount_paid)], ['Status', currentStatus]
            ]) +
            '<form class="admin-fee-form">' +
                '<input type="hidden" name="paymentId" value="' + esc(row.id) + '">' +
                '<div class="admin-fee-form__grid">' +
                    '<label class="admin-field"><span>Amount</span><span class="admin-field__input"><input name="amount" type="number" min="0.01" step="0.01" value="' + esc(row.amount_paid) + '" required></span></label>' +
                    '<label class="admin-field"><span>Method</span><span class="admin-field__input"><input name="paymentType" maxlength="50" value="' + esc(row.payment_type || '') + '" required></span></label>' +
                    '<label class="admin-field"><span>Status</span><span class="admin-field__input"><select name="paymentStatus">' + statuses.map(function (status) {
                        return '<option value="' + esc(status) + '"' + (status === currentStatus ? ' selected' : '') + '>' + esc(status) + '</option>';
                    }).join('') + '</select></span></label>' +
                    '<label class="admin-field"><span>Paid at</span><span class="admin-field__input"><input name="paidAt" type="datetime-local" value="' + esc(localDateTime(row.paid_at)) + '" required></span></label>' +
                '</div>' +
                '<p class="admin-fee-form__hint">Marking a payment FAILED or REFUNDED removes its amount from the student\'s paid total.</p>' +
                '<div class="admin-fee-form__actions"><button class="admin-btn admin-btn--ghost" type="button" data-modal-cancel>Cancel</button><button class="admin-btn" type="submit">Save payment</button></div>' +
            '</form>',
            function (body, button) {
                api('/api/admin/fees/payments/' + encodeURIComponent(body.paymentId), {
                    method: 'PATCH',
                    body: { amount: body.amount, paymentType: body.paymentType, paymentStatus: body.paymentStatus, paidAt: body.paidAt }
                }).then(function (result) {
                    finishFeeWrite(result, button, 'Payment record updated');
                }).catch(function () {
                    button.disabled = false;
                    toast('Could not reach the server.', true);
                });
            });
    }

    function academicCard(title, icon, records, note) {
        var body = records.length
            ? table(['Title', 'Details'], records.map(function (row) {
                return '<tr><td>' + esc(row.title || '—') + '</td><td>' + esc(row.details || row.description || '—') + '</td></tr>';
            }))
            : emptyState('No ' + title.toLowerCase() + ' in the database', note || 'No sample data is shown when records are unavailable.', icon);
        return '<div class="admin-card"><div class="admin-card__head"><h3>' + esc(title) + '</h3></div>' + body + '</div>';
    }

    function loadAcademicContent() {
        return api('/api/admin/academic-content').then(function (result) {
            var note = result.data.note || '';
            if (state.section === 'guidelines') {
                $('#guidelinesContent').innerHTML = academicCard('Guidelines', '📋', result.data.guidelines || [], note);
                return;
            }
            var groups = [
                ['Timetables', '🗓️', result.data.timetables || []],
                ['Announcements', '📢', result.data.announcements || []]
            ];
            $('#academicContent').innerHTML = groups.map(function (group) {
                return academicCard(group[0], group[1], group[2], note);
            }).join('');
        });
    }

    function loadPrograms() {
        return api('/api/admin/programs').then(function (result) {
            var records = result.data.records || [];
            state.cache.programs = records;
            $('#programsNoteText').textContent = result.data.note || '';
            $('#programsTable').innerHTML = table(
                ['Program (student domain)', 'Students', 'Total fees', 'Fees paid', 'Remaining'],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.program) + '</strong></td><td>' + num(row.student_count) + '</td>' +
                        '<td class="admin-table__num">' + money(row.total_fees) + '</td>' +
                        '<td class="admin-table__num">' + money(row.fees_paid) + '</td>' +
                        '<td class="admin-table__num">' + money(row.remaining_fees) + '</td></tr>';
                })
            );
        });
    }

    function loadMessages() {
        var form = $('#messagesFilters');
        return api('/api/admin/messages' + (query(params(form)) ? '?' + query(params(form)) : '')).then(function (result) {
            var records = result.data.records || [];
            state.cache.messages = records;
            var unread = records.filter(function (row) { return !num(row.is_read); }).length;
            var starred = records.filter(function (row) { return num(row.starred); }).length;
            $('#messageStats').innerHTML = [
                statCard('✉️', num(result.data.total), 'Messages shown', 'Matching current filters'),
                statCard('📬', unread, 'Unread', 'In the current view'),
                statCard('⭐', starred, 'Starred', 'In the current view')
            ].join('');
            $('#messagesCount').textContent = records.length ? 'Showing ' + records.length + ' messages.' : 'No messages match the current filters.';
            $('#messagesTable').innerHTML = table(
                ['Name', 'Contact', 'Message', 'Received', 'Flags', ''],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.name) + '</strong><small>' + esc(row.location) + '</small></td>' +
                        '<td>' + esc(row.email) + '<small>' + esc(row.mobile) + '</small></td>' +
                        '<td class="admin-message-cell">' + esc(row.message) + '</td>' +
                        '<td>' + esc(dateText(row.created_at)) + '</td>' +
                        '<td>' + (num(row.is_read) ? badge('Read', 'success') : badge('Unread', 'info')) + ' ' +
                        (num(row.starred) ? badge('★ Starred', 'warning') : '') + '</td>' +
                        '<td><div class="admin-table__actions">' +
                        '<button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-detail="message:' + row.id + '">View</button>' +
                        '<button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-message-action="read:' + row.id + ':' + (num(row.is_read) ? 0 : 1) + '">' + (num(row.is_read) ? 'Unread' : 'Mark read') + '</button>' +
                        '<button class="admin-btn admin-btn--sm admin-btn--ghost" type="button" data-message-action="star:' + row.id + ':' + (num(row.starred) ? 0 : 1) + '">' + (num(row.starred) ? 'Unstar' : 'Star') + '</button>' +
                        '<button class="admin-btn admin-btn--sm admin-btn--danger" type="button" data-message-action="delete:' + row.id + '">Delete</button>' +
                        '</div></td></tr>';
                })
            );
        });
    }

    function loadGateJee() {
        return api('/api/admin/gate-jee').then(function (result) {
            var categories = result.data.categories || [];
            var records = result.data.records || [];
            state.cache['gate-jee'] = records;
            $('#gateJeeNoteText').textContent = result.data.note || '';
            $('#gateJeeStats').innerHTML = categories.length ? categories.map(function (row) {
                return statCard(row.category === 'GATE' ? '⚙️' : row.category === 'JEE' ? '📘' : '🎯',
                    num(row.student_count), row.category + ' students',
                    num(row.attempts) + ' exam attempts · Avg ' + Number(row.average_score).toFixed(1), 'Program');
            }).join('') : emptyState('No program records', 'Student records will be grouped here.', '🏅');
            $('#gateJeeTable').innerHTML = table(
                ['Student ID', 'Name', 'Program', 'Enrolled', 'Total fees', 'Paid', 'Remaining'],
                records.map(function (row) {
                    return '<tr><td><strong>' + esc(row.student_id) + '</strong></td><td>' + esc(row.name) + '</td>' +
                        '<td>' + esc(row.domain) + '</td><td>' + esc(dateText(row.enrollment_date)) + '</td>' +
                        '<td class="admin-table__num">' + money(row.total_fees) + '</td>' +
                        '<td class="admin-table__num">' + money(row.fees_paid) + '</td>' +
                        '<td class="admin-table__num">' + money(row.remaining_fees) + '</td></tr>';
                })
            );
        });
    }

    function loadReports() {
        return Promise.all([
            api('/api/admin/overview'),
            api('/api/admin/performance?limit=500'),
            api('/api/admin/programs'),
            api('/api/admin/fees'),
            api('/api/admin/messages')
        ]).then(function (results) {
            var overview = results[0].data || {};
            var performance = results[1].data || {};
            var programs = results[2].data || {};
            var fees = results[3].data || {};
            var messages = results[4].data || {};
            var counts = overview.counts || {};
            var feeSummary = fees.summary || {};
            var resultsList = performance.records || [];
            var messageList = messages.records || [];
            var programList = programs.records || [];
            var unread = messageList.filter(function (row) { return !num(row.is_read); }).length;
            var starred = messageList.filter(function (row) { return num(row.starred); }).length;
            var attemptRate = num(counts.students) ? Math.round(num(counts.studentsWithAttempts) / num(counts.students) * 100) : 0;
            var realization = num(feeSummary.totalFees || feeSummary.total_fees)
                ? Math.round(num(feeSummary.feesPaid || feeSummary.fees_paid) / num(feeSummary.totalFees || feeSummary.total_fees) * 100)
                : 0;

            $('#reportsStats').innerHTML = [
                statCard('🎓', num(counts.students), 'Students enrolled', programList.length + ' program groups'),
                statCard('📊', attemptRate + '%', 'Attempt coverage', num(counts.studentsWithAttempts) + ' of ' + num(counts.students) + ' students'),
                statCard('💰', realization + '%', 'Fee realization', money(feeSummary.feesPaid || feeSummary.fees_paid) + ' collected'),
                statCard('✉️', num(messages.total === undefined ? messageList.length : messages.total), 'Contact messages', unread + ' unread · ' + starred + ' starred')
            ].join('');

            state.cache.reports = programList.map(function (row) {
                return {
                    program: row.program,
                    students: row.student_count,
                    total_fees: row.total_fees,
                    fees_paid: row.fees_paid,
                    remaining_fees: row.remaining_fees
                };
            });
            $('#reportsPrograms').innerHTML = table(
                ['Program', 'Students', 'Total fees', 'Paid', 'Remaining'],
                programList.map(function (row) {
                    return '<tr><td><strong>' + esc(row.program) + '</strong></td><td>' + num(row.student_count) + '</td>' +
                        '<td class="admin-table__num">' + money(row.total_fees) + '</td>' +
                        '<td class="admin-table__num">' + money(row.fees_paid) + '</td>' +
                        '<td class="admin-table__num">' + money(row.remaining_fees) + '</td></tr>';
                })
            );

            var bands = [
                { label: '80 – 100', test: function (score) { return score >= 80; } },
                { label: '60 – 79', test: function (score) { return score >= 60 && score < 80; } },
                { label: '40 – 59', test: function (score) { return score >= 40 && score < 60; } },
                { label: 'Below 40', test: function (score) { return score < 40; } }
            ].map(function (band) {
                band.value = resultsList.filter(function (row) { return band.test(num(row.score)); }).length;
                return band;
            });
            var maxBand = Math.max.apply(null, [1].concat(bands.map(function (band) { return band.value; })));
            $('#reportsScores').innerHTML = resultsList.length ? '<div class="admin-bars">' + bands.map(function (band) {
                return '<div class="admin-bar-row"><span>' + esc(band.label) + '</span>' +
                    '<span class="admin-bar-track"><span class="admin-bar-fill" style="width:' + Math.round(band.value / maxBand * 100) + '%"></span></span>' +
                    '<strong>' + band.value + '</strong></div>';
            }).join('') + '</div>' : emptyState('No submitted results', 'Score bands will appear when students submit exams.', '📊');

            var top = resultsList.slice().sort(function (a, b) { return num(b.score) - num(a.score); }).slice(0, 5);
            $('#reportsTop').innerHTML = table(['Student', 'Exam', 'Score'], top.map(function (row) {
                return '<tr><td><strong>' + esc(row.student_name || row.student_id) + '</strong><small>' + esc(row.student_id) + '</small></td>' +
                    '<td>' + esc(row.exam_title || row.test_id) + '</td>' +
                    '<td class="admin-table__num"><strong>' + esc(row.score) + '</strong> / ' + esc(row.total_marks || '—') + '</td></tr>';
            }));

            $('#reportsMessages').innerHTML = '<div class="admin-detail-grid">' +
                '<div class="admin-detail-item"><small>Total in view</small><strong>' + messageList.length + '</strong></div>' +
                '<div class="admin-detail-item"><small>Unread</small><strong>' + unread + '</strong></div>' +
                '<div class="admin-detail-item"><small>Starred</small><strong>' + starred + '</strong></div>' +
                '</div>' + (messages.note ? '<p class="admin-report-note">' + esc(messages.note) + '</p>' : '');
        });
    }

    var LOADERS = {
        overview: loadOverview,
        students: loadStudents,
        faculty: loadFaculty,
        exams: loadExams,
        performance: loadPerformance,
        syllabus: loadSyllabus,
        fees: loadFees,
        timetables: loadAcademicContent,
        programs: loadPrograms,
        guidelines: loadAcademicContent,
        messages: loadMessages,
        reports: loadReports,
        'gate-jee': loadGateJee
    };

    function showSection(name, updateHash) {
        name = SECTION_ALIASES[name] || name;
        if (!SECTION_TITLES[name]) name = 'overview';
        state.section = name;
        Object.keys(SECTION_TITLES).forEach(function (key) {
            var section = document.getElementById('section-' + key);
            if (section) section.hidden = key !== name;
        });
        document.querySelectorAll('.admin-nav-item').forEach(function (item) {
            var active = item.getAttribute('data-section') === name;
            item.classList.toggle('is-active', active);
            if (active) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });
        $('#adminPageTitle').textContent = SECTION_TITLES[name][0];
        $('#adminPageSubtitle').textContent = SECTION_TITLES[name][1];
        if (updateHash) history.replaceState(null, '', '#' + name);
        if (LOADERS[name]) {
            LOADERS[name]().catch(function (error) {
                console.error('Admin section load failed:', name, error);
                toast('Could not load this section. Please retry.', true);
            });
        }
        closeSidebar();
    }

    function closeSidebar() {
        $('#adminSidebar').classList.remove('is-open');
        $('#adminBackdrop').classList.remove('is-open');
    }

    // ---------- detail views ----------
    function showStudentDetail(id) {
        api('/api/admin/students/' + encodeURIComponent(id)).then(function (result) {
            if (!result.data.success) { toast(result.data.message || 'Student not found', true); return; }
            var student = result.data.student || {};
            var payments = result.data.payments || [];
            var results = result.data.results || [];
            var html = detailGrid([
                ['Student ID', student.student_id], ['Name', student.name], ['Program', student.domain],
                ['Date of birth', dateText(student.dob).slice(0, 10)], ['Enrolled', dateText(student.enrollment_date)],
                ['Total fees', money(student.total_fees)], ['Fees paid', money(student.fees_paid)], ['Remaining', money(student.remaining_fees)]
            ]) + '<h4 style="margin:1rem 0 .5rem;font-size:.9rem">Payments</h4>' +
                table(['Amount', 'Type', 'Status', 'Paid at'], payments.map(function (row) {
                    return '<tr><td>' + money(row.amount_paid) + '</td><td>' + esc(row.payment_type) + '</td><td>' + esc(row.payment_status) + '</td><td>' + esc(dateText(row.paid_at)) + '</td></tr>';
                })) + '<h4 style="margin:1rem 0 .5rem;font-size:.9rem">Exam results</h4>' +
                table(['Exam', 'Score', 'Submitted'], results.map(function (row) {
                    return '<tr><td>' + esc(row.title || row.test_id) + '</td><td>' + esc(row.score) + ' / ' + esc(row.total_marks || '—') + '</td><td>' + esc(dateText(row.submitted_at)) + '</td></tr>';
                }));
            openModal('Student profile — ' + student.name, html);
        });
    }

    function showFacultyDetail(id) {
        api('/api/admin/faculty/' + encodeURIComponent(id)).then(function (result) {
            if (!result.data.success) { toast(result.data.message || 'Faculty not found', true); return; }
            var faculty = result.data.faculty || {};
            var exams = result.data.exams || [];
            var html = detailGrid([
                ['Faculty ID', faculty.faculty_id], ['Name', faculty.name], ['Domain', faculty.domain],
                ['Mobile', faculty.mobile], ['Email', faculty.mail], ['Address', faculty.address],
                ['Date of birth', faculty.dob], ['Enrolled', faculty.enrollment_date],
                ['Qualifications', faculty.qualifications], ['Achievements', faculty.achievements], ['Awards', faculty.awards]
            ]) + '<h4 style="margin:1rem 0 .5rem;font-size:.9rem">Published exams (' + exams.length + ')</h4>' +
                table(['Test ID', 'Title', 'Type', 'Published'], exams.map(function (row) {
                    return '<tr><td>' + esc(row.test_id) + '</td><td>' + esc(row.title) + '</td><td>' + esc(row.test_type) + '</td><td>' + esc(dateText(row.published_at)) + '</td></tr>';
                }));
            openModal('Faculty profile — ' + faculty.name, html);
        });
    }

    function showExamDetail(id) {
        api('/api/admin/exams/' + encodeURIComponent(id)).then(function (result) {
            if (!result.data.success) { toast(result.data.message || 'Exam not found', true); return; }
            var exam = result.data.exam || {};
            var stats = result.data.stats || {};
            var questions = exam.questions || [];
            var html = detailGrid([
                ['Test ID', exam.test_id], ['Title', exam.title], ['Type', exam.test_type],
                ['Faculty', exam.faculty_name], ['Faculty ID', exam.faculty_id],
                ['Published', exam.published_at], ['Attempts', stats.attempts],
                ['Average score', stats.average], ['Highest', stats.highest], ['Lowest', stats.lowest]
            ]) + '<h4 style="margin:1rem 0 .5rem;font-size:.9rem">Question paper (' + questions.length + ' questions)</h4>' +
                '<div class="admin-question-list">' + (questions.length ? questions.map(function (question, index) {
                    return '<div class="admin-question"><small>Q' + (index + 1) + ' · ' + esc(question.subject || '—') + ' · ' + esc(question.type || '—') + '</small>' + esc(question.question) + '</div>';
                }).join('') : emptyState('No questions stored', 'This exam has no question data in the database.', '📝')) + '</div>' +
                '<h4 style="margin:1rem 0 .5rem;font-size:.9rem">Submissions</h4>' +
                table(['Student', 'Score', 'Submitted'], (result.data.results || []).map(function (row) {
                    return '<tr><td>' + esc(row.student_name) + '<small>' + esc(row.student_id) + '</small></td><td>' + esc(row.score) + ' / ' + esc(row.total_marks || '—') + '</td><td>' + esc(dateText(row.submitted_at)) + '</td></tr>';
                }));
            openModal('Exam details — ' + exam.title, html);
        });
    }

    function showMessageDetail(id) {
        var record = (state.cache.messages || []).find(function (row) { return String(row.id) === String(id); });
        if (!record) { toast('Message is no longer in the current view.', true); return; }
        openModal('Message from ' + record.name, detailGrid([
            ['Name', record.name], ['Email', record.email], ['Mobile', record.mobile],
            ['Location', record.location], ['Date of birth', record.dob], ['Received', record.created_at]
        ]) + '<div class="admin-question admin-message-body" style="margin-top:1rem">' + esc(record.message) + '</div>');
    }

    // ---------- events ----------
    function bindEvents() {
        document.querySelectorAll('.admin-nav-item').forEach(function (item) {
            item.addEventListener('click', function () { showSection(item.getAttribute('data-section'), true); });
        });

        $('#adminMenuToggle').addEventListener('click', function () {
            $('#adminSidebar').classList.toggle('is-open');
            $('#adminBackdrop').classList.toggle('is-open');
        });
        $('#adminBackdrop').addEventListener('click', closeSidebar);

        var collapseButton = $('#adminSidebarCollapse');
        collapseButton.addEventListener('click', function () {
            var sidebar = $('#adminSidebar');
            var collapsed = sidebar.classList.toggle('is-collapsed');
            collapseButton.setAttribute('aria-expanded', String(!collapsed));
            collapseButton.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
            collapseButton.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
            try { window.localStorage.setItem('pinnacle-admin-sidebar-collapsed', collapsed ? '1' : '0'); } catch (_) { /* storage may be unavailable */ }
        });

        document.querySelectorAll('[data-goto]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSection(button.getAttribute('data-goto'), true);
                var topbar = document.querySelector('.admin-topbar');
                if (topbar) topbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        $('#adminModalClose').addEventListener('click', closeModal);
        $('#adminModal').addEventListener('click', function (event) {
            if (event.target === $('#adminModal')) closeModal();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeModal();
                closeSidebar();
            }
        });

        document.querySelectorAll('.admin-filters').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var section = form.getAttribute('id').replace('Filters', '');
                if (section === 'payments') section = 'fees';
                if (LOADERS[section]) LOADERS[section]().catch(function () { toast('Could not apply filters.', true); });
            });
            form.addEventListener('reset', function () {
                window.setTimeout(function () {
                    var section = form.getAttribute('id').replace('Filters', '');
                    if (section === 'payments') section = 'fees';
                    if (LOADERS[section]) LOADERS[section]().catch(function () {});
                }, 0);
            });
        });

        document.addEventListener('click', function (event) {
            var feeAction = event.target.closest('[data-fee-action]');
            if (feeAction) {
                var actionName = feeAction.getAttribute('data-fee-action');
                if (actionName === 'edit-fee') editFee(feeAction.getAttribute('data-student'));
                else if (actionName === 'add-payment') addPayment(feeAction.getAttribute('data-student'));
                else if (actionName === 'edit-payment') editPayment(feeAction.getAttribute('data-payment'));
                return;
            }
            var detail = event.target.closest('[data-detail]');
            if (detail) {
                var parts = detail.getAttribute('data-detail').split(':');
                if (parts[0] === 'student') showStudentDetail(parts[1]);
                else if (parts[0] === 'faculty') showFacultyDetail(parts[1]);
                else if (parts[0] === 'exam') showExamDetail(parts[1]);
                else if (parts[0] === 'message') showMessageDetail(parts[1]);
                return;
            }
            var action = event.target.closest('[data-message-action]');
            if (action) {
                var bits = action.getAttribute('data-message-action').split(':');
                if (bits[0] === 'delete') {
                    if (!window.confirm('Delete this contact message permanently?')) return;
                    api('/api/admin/messages/' + bits[1], { method: 'DELETE' }).then(function (result) {
                        toast(result.data.message || 'Message deleted', !result.data.success);
                        loadMessages();
                    }).catch(function () {
                        toast('Unable to delete message. Please try again.', true);
                    });
                } else {
                    // The backend PATCH writes both flags, so send both current
                    // values. Otherwise starring a message silently marks it
                    // unread and marking it read silently unstars it.
                    var row = action.closest('tr');
                    var readBtn = row && row.querySelector('[data-message-action^="read:"]');
                    var starBtn = row && row.querySelector('[data-message-action^="star:"]');
                    var readBits = readBtn && readBtn.getAttribute('data-message-action').split(':');
                    var starBits = starBtn && starBtn.getAttribute('data-message-action').split(':');
                    // Each button stores the value it is about to SET, so the
                    // current flag is the opposite of that stored value.
                    var currentRead = readBits ? readBits[2] === '0' : false;
                    var currentStarred = starBits ? starBits[2] === '0' : false;
                    var payload = bits[0] === 'read'
                        ? { isRead: bits[2] === '1', starred: currentStarred }
                        : { isRead: currentRead, starred: bits[2] === '1' };
                    api('/api/admin/messages/' + bits[1], {
                        method: 'PATCH',
                        body: payload
                    }).then(function (result) {
                        toast(result.data.message || 'Message updated', !result.data.success);
                        loadMessages();
                    }).catch(function () {
                        toast('Unable to update message. Please try again.', true);
                    });
                }
                return;
            }
            var exportButton = event.target.closest('[data-export]');
            if (exportButton) {
                var key = exportButton.getAttribute('data-export');
                csvExport(key, 'pinnacle-admin-' + key.replace(/[^a-z0-9-]/gi, '-'));
            }
        });

        $('#adminLogoutBtn').addEventListener('click', function () {
            api('/api/admin/logout', { method: 'POST' }).then(function () {
                window.location.replace('admin-login.html');
            }).catch(function () { window.location.replace('admin-login.html'); });
        });

        // Credential view enhancements — presentation only. The reveal toggles
        // and strength meter never alter the values that the submit handler reads.
        document.querySelectorAll('#section-settings [data-reveal]').forEach(function (button) {
            button.addEventListener('click', function () {
                var input = document.getElementById(button.getAttribute('data-reveal'));
                if (!input) return;
                var showing = input.type === 'password';
                input.type = showing ? 'text' : 'password';
                button.textContent = showing ? 'Hide' : 'Show';
                button.setAttribute('aria-pressed', String(showing));
                var label = button.getAttribute('aria-label') || '';
                button.setAttribute('aria-label', label.replace(/^(Show|Hide) /, showing ? 'Hide ' : 'Show '));
            });
        });

        var newPasswordInput = $('#newPassword');
        var strengthMeter = $('#credentialStrength');
        var strengthHint = $('#credentialStrengthHint');
        function updateCredentialStrength() {
            if (!newPasswordInput || !strengthMeter) return;
            var value = newPasswordInput.value || '';
            var score = 0;
            if (value.length >= 12) score++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
            if (/\d/.test(value)) score++;
            if (/[^A-Za-z0-9]/.test(value)) score++;
            if (!value) score = 0;
            strengthMeter.setAttribute('data-strength', String(score));
            if (!strengthHint) return;
            var hints = [
                'Use 12+ characters with a number and a symbol.',
                'Too short — aim for at least 12 characters.',
                'Better — add mixed case, a number and a symbol.',
                'Strong — add a symbol for maximum strength.',
                'Excellent — this password meets every check.'
            ];
            strengthHint.textContent = hints[score];
        }
        if (newPasswordInput) newPasswordInput.addEventListener('input', updateCredentialStrength);
        updateCredentialStrength();

        var credentialForm = $('#credentialForm');
        credentialForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var errorBox = $('#credentialError');
            errorBox.hidden = true;
            var body = {
                currentPassword: $('#currentPassword').value,
                currentPin: $('#currentPin').value.trim(),
                newPassword: $('#newPassword').value,
                newPin: $('#newPin').value.trim()
            };
            var button = credentialForm.querySelector('button[type="submit"]');
            button.disabled = true;
            api('/api/admin/credentials', { method: 'PUT', body: body }).then(function (result) {
                button.disabled = false;
                if (result.status !== 200 || !result.data.success) {
                    errorBox.textContent = result.data.message || 'Could not update credentials.';
                    errorBox.hidden = false;
                    return;
                }
                credentialForm.reset();
                toast(result.data.message);
            }).catch(function () { button.disabled = false; });
        });
    }

    // ---------- bootstrap ----------
    api('/api/admin/session').then(function (result) {
        if (result.status !== 200 || !result.data.success) {
            window.location.replace('admin-login.html');
            return;
        }
        state.sessionExpiresAt = num(result.data.admin.expiresAt);
        bindEvents();
        try {
            if (window.localStorage.getItem('pinnacle-admin-sidebar-collapsed') === '1') {
                $('#adminSidebar').classList.add('is-collapsed');
                var collapseButton = $('#adminSidebarCollapse');
                collapseButton.setAttribute('aria-expanded', 'false');
                collapseButton.setAttribute('aria-label', 'Expand sidebar');
                collapseButton.title = 'Expand sidebar';
            }
        } catch (_) { /* storage may be unavailable */ }
        var hash = window.location.hash.replace('#', '');
        showSection(hash || 'overview', false);
        function updateSessionInfo() {
            var remaining = Math.max(0, Math.round((state.sessionExpiresAt - Date.now()) / 60000));
            var pill = document.getElementById('adminSessionPill');
            if (pill) pill.innerHTML = '<i aria-hidden="true"></i> Admin · ' + remaining + 'm left';
            var settingsStatus = document.getElementById('settingsSessionStatus');
            if (settingsStatus) settingsStatus.textContent = 'Signed in · this admin session expires in ' + remaining + ' minutes.';
            if (remaining <= 0) window.location.replace('admin-login.html');
        }
        updateSessionInfo();
        window.setInterval(updateSessionInfo, 30000);
    }).catch(function () { /* api() already redirects on 401 */ });
})();
