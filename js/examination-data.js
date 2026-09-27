/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - EXAMINATION SYSTEM DATA
   --------------------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for the Phase 1 header dropdowns and the
   Examinations page (Timetables / Notifications / Guidelines / Schemas).

   Nothing in this file is rendered directly; js/examinations-page.js and
   js/nav-dropdown.js read from window.PINNACLE_EXAMS.

   TO ROLL OVER TO THE NEXT ACADEMIC YEAR
   ---------------------------------------
   1. Edit `academicYear` (label + start/end month keys).
   2. Replace the entries in `months[]` with the new dates. Keep each month's
      four events in the order defined by `schedulePattern.slots`:
        slot 1 + 2 -> JEE (JEE Main, then JEE Advanced)
        slot 3 + 4 -> GATE (Session 1, then Session 2)
      A test date must never fall on a `holidays` key or inside an
      `officialExams[].window` entry.
   3. Update `holidays` and `officialExams` for the new year.
   4. Update `grandTest` and `reConductSaturdays`.
   5. Review `schemas.official.*` against the latest NTA / GATE Committee
      bulletin and `guidelines` against the current academy policy.

   NOTHING ELSE needs to change - every view, table and the downloadable
   timetable are generated from the structures below.
   ========================================================================== */

window.PINNACLE_EXAMS = (function () {
    'use strict';

    /* ----------------------------------------------------------------------
       ACADEMIC YEAR
       ---------------------------------------------------------------------- */
    const academicYear = {
        label: '2026 – 2027',
        shortLabel: 'AY 2026-27',
        // August 2026 -> April 2027
        start: { year: 2026, month: 8 },
        end: { year: 2027, month: 4 },
        note:
            'Institute monthly tests run on the first four available days of each ' +
            'month, skipping public holidays and major official examination ' +
            'periods. A monthly test is shifted to the next free day whenever a ' +
            'holiday or an official examination day blocks it.'
    };

    /* ----------------------------------------------------------------------
       MONTHLY PATTERN (kept separate so the pattern can change without
       touching the individual month entries)
       ---------------------------------------------------------------------- */
    const schedulePattern = {
        summary: 'First 2 days of the month → JEE + JEE Advanced · Next 2 days → GATE',
        slots: [
            { program: 'jee', label: 'JEE Main Monthly Test', short: 'JEE Main', icon: '📘' },
            { program: 'jee', label: 'JEE Advanced Monthly Test', short: 'JEE Advanced', icon: '🚀' },
            { program: 'gate', label: 'GATE Monthly Test — Session 1', short: 'GATE S1', icon: '⚙️' },
            { program: 'gate', label: 'GATE Monthly Test — Session 2', short: 'GATE S2', icon: '⚙️' }
        ],
        reConductRule:
            'Every second Saturday will be reserved for re-conducting JEE/GATE ' +
            'examinations for eligible students who missed the scheduled examination.'
    };

    /* ----------------------------------------------------------------------
       HOLIDAYS OBSERVED (Government of India gazetted + key restricted
       holidays falling inside the academic year). Tests are never scheduled
       on these dates.
       ---------------------------------------------------------------------- */
    const holidays = {
        '2026-08-15': 'Independence Day',
        '2026-08-26': 'Id-e-Milad',
        '2026-08-28': 'Raksha Bandhan',
        '2026-09-04': 'Janmashtami',
        '2026-10-02': 'Gandhi Jayanti',
        '2026-10-18': 'Dussehra (Saptami)',
        '2026-10-19': 'Dussehra (Mahashtami)',
        '2026-10-20': 'Dussehra (Vijaya Dashmi)',
        '2026-10-26': 'Maharshi Valmiki Jayanti',
        '2026-11-08': 'Diwali (Deepavali)',
        '2026-11-24': 'Guru Nanak Jayanti',
        '2026-12-25': 'Christmas Day',
        '2027-01-01': "New Year's Day",
        '2027-01-14': 'Makar Sankranti',
        '2027-01-15': 'Pongal',
        '2027-01-26': 'Republic Day',
        '2027-02-11': 'Basant Panchami',
        '2027-03-02': 'Swami Dayananda Saraswati Jayanti',
        '2027-03-06': 'Maha Shivratri',
        '2027-03-10': 'Id-ul-Fitr',
        '2027-03-23': 'Holi',
        '2027-03-26': 'Good Friday',
        '2027-04-15': 'Ram Navami',
        '2027-04-19': 'Mahavir Jayanti'
    };

    /* ----------------------------------------------------------------------
       MAJOR OFFICIAL EXAMINATION PERIODS — no institute monthly test is
       scheduled inside these windows.
       ---------------------------------------------------------------------- */
    const officialExams = [
        {
            id: 'jee-main-2027-s1',
            program: 'jee',
            authority: 'National Testing Agency (NTA)',
            title: 'JEE (Main) 2027 — Session 1',
            dates: '22, 23, 24, 28, 29, 30 January 2027 (31 January 2027 buffer day)',
            window: { from: '2027-01-22', to: '2027-01-31' },
            provisional: false,
            source: 'NTA Examination Calendar 2026-27 (released 16 September 2026)',
            link: 'https://jeemain.nta.nic.in/'
        },
        {
            id: 'gate-2027',
            program: 'gate',
            authority: 'IIT Madras (Organizing Institute)',
            title: 'GATE 2027',
            dates: '6, 7, 13, 14, 20, 21 February 2027',
            window: { from: '2027-02-06', to: '2027-02-21' },
            provisional: false,
            source: 'GATE 2027 Information Brochure, IIT Madras',
            link: 'https://gate2027.iitm.ac.in/'
        },
        {
            id: 'jee-main-2027-s2',
            program: 'jee',
            authority: 'National Testing Agency (NTA)',
            title: 'JEE (Main) 2027 — Session 2',
            dates: 'April 2027 (exact date to be notified by NTA)',
            window: { from: '2027-04-01', to: '2027-04-10' },
            provisional: true,
            source: 'NTA Examination Calendar 2026-27 (month announced, date pending)',
            link: 'https://jeemain.nta.nic.in/'
        }
    ];

    /* ----------------------------------------------------------------------
       SHIFT REASONS
       ----------------------------------------------------------------------
       Every test that does not land on its nominal day carries a `shifted`
       record so the timetable can explain the move instead of silently
       showing a different date. Two reasons repeat, so they are named once.
       ---------------------------------------------------------------------- */
    const CASCADE = 'rolled forward — the preceding test took the earlier day';
    const JEE_S2 = 'JEE (Main) 2027 Session 2 official examination window';

    /* ----------------------------------------------------------------------
       MONTHLY TEST SCHEDULE
       `shifted` records *why* a test moved off its nominal slot so the UI can
       explain it instead of silently showing a different date.
       ---------------------------------------------------------------------- */
    const months = [
        {
            key: '2026-08', label: 'August', year: 2026, month: 8,
            events: [
                { slot: 0, date: '2026-08-01', day: 'Saturday', dayNum: 1 },
                { slot: 1, date: '2026-08-02', day: 'Sunday', dayNum: 2 },
                { slot: 2, date: '2026-08-03', day: 'Monday', dayNum: 3 },
                { slot: 3, date: '2026-08-04', day: 'Tuesday', dayNum: 4 }
            ]
        },
        {
            key: '2026-09', label: 'September', year: 2026, month: 9,
            events: [
                { slot: 0, date: '2026-09-01', day: 'Tuesday', dayNum: 1 },
                { slot: 1, date: '2026-09-02', day: 'Wednesday', dayNum: 2 },
                { slot: 2, date: '2026-09-03', day: 'Thursday', dayNum: 3 },
                {
                    slot: 3, date: '2026-09-05', day: 'Saturday', dayNum: 5,
                    shifted: { from: 4, reason: 'Janmashtami holiday' }
                }
            ]
        },
        {
            key: '2026-10', label: 'October', year: 2026, month: 10,
            events: [
                { slot: 0, date: '2026-10-01', day: 'Thursday', dayNum: 1 },
                {
                    slot: 1, date: '2026-10-03', day: 'Saturday', dayNum: 3,
                    shifted: { from: 2, reason: 'Gandhi Jayanti holiday' }
                },
                {
                    slot: 2, date: '2026-10-04', day: 'Sunday', dayNum: 4,
                    shifted: { from: 3, reason: CASCADE }
                },
                {
                    slot: 3, date: '2026-10-05', day: 'Monday', dayNum: 5,
                    shifted: { from: 4, reason: CASCADE }
                }
            ]
        },
        {
            key: '2026-11', label: 'November', year: 2026, month: 11,
            events: [
                { slot: 0, date: '2026-11-01', day: 'Sunday', dayNum: 1 },
                { slot: 1, date: '2026-11-02', day: 'Monday', dayNum: 2 },
                { slot: 2, date: '2026-11-03', day: 'Tuesday', dayNum: 3 },
                { slot: 3, date: '2026-11-04', day: 'Wednesday', dayNum: 4 }
            ]
        },
        {
            key: '2026-12', label: 'December', year: 2026, month: 12,
            events: [
                { slot: 0, date: '2026-12-01', day: 'Tuesday', dayNum: 1 },
                { slot: 1, date: '2026-12-02', day: 'Wednesday', dayNum: 2 },
                { slot: 2, date: '2026-12-03', day: 'Thursday', dayNum: 3 },
                { slot: 3, date: '2026-12-04', day: 'Friday', dayNum: 4 }
            ]
        },
        {
            key: '2027-01', label: 'January', year: 2027, month: 1,
            events: [
                {
                    slot: 0, date: '2027-01-02', day: 'Saturday', dayNum: 2,
                    shifted: { from: 1, reason: "New Year's Day holiday" }
                },
                {
                    slot: 1, date: '2027-01-03', day: 'Sunday', dayNum: 3,
                    shifted: { from: 2, reason: CASCADE }
                },
                {
                    slot: 2, date: '2027-01-04', day: 'Monday', dayNum: 4,
                    shifted: { from: 3, reason: CASCADE }
                },
                {
                    slot: 3, date: '2027-01-05', day: 'Tuesday', dayNum: 5,
                    shifted: { from: 4, reason: CASCADE }
                }
            ]
        },
        {
            key: '2027-02', label: 'February', year: 2027, month: 2,
            events: [
                { slot: 0, date: '2027-02-01', day: 'Monday', dayNum: 1 },
                { slot: 1, date: '2027-02-02', day: 'Tuesday', dayNum: 2 },
                { slot: 2, date: '2027-02-03', day: 'Wednesday', dayNum: 3 },
                { slot: 3, date: '2027-02-04', day: 'Thursday', dayNum: 4 }
            ]
        },
        {
            key: '2027-03', label: 'March', year: 2027, month: 3,
            events: [
                { slot: 0, date: '2027-03-01', day: 'Monday', dayNum: 1 },
                {
                    slot: 1, date: '2027-03-03', day: 'Wednesday', dayNum: 3,
                    shifted: { from: 2, reason: 'Swami Dayananda Saraswati Jayanti holiday' }
                },
                {
                    slot: 2, date: '2027-03-04', day: 'Thursday', dayNum: 4,
                    shifted: { from: 3, reason: CASCADE }
                },
                {
                    slot: 3, date: '2027-03-05', day: 'Friday', dayNum: 5,
                    shifted: { from: 4, reason: CASCADE }
                }
            ]
        },
        {
            key: '2027-04', label: 'April', year: 2027, month: 4,
            events: [
                {
                    slot: 0, date: '2027-04-11', day: 'Sunday', dayNum: 11,
                    shifted: { from: 1, reason: JEE_S2 }
                },
                {
                    slot: 1, date: '2027-04-12', day: 'Monday', dayNum: 12,
                    shifted: { from: 2, reason: JEE_S2 }
                },
                {
                    slot: 2, date: '2027-04-13', day: 'Tuesday', dayNum: 13,
                    shifted: { from: 3, reason: JEE_S2 }
                },
                {
                    slot: 3, date: '2027-04-14', day: 'Wednesday', dayNum: 14,
                    shifted: { from: 4, reason: JEE_S2 }
                }
            ]
        }
    ];

    /* ----------------------------------------------------------------------
       DECEMBER GRAND TEST — overall syllabus, both JEE and GATE
       ---------------------------------------------------------------------- */
    const grandTest = {
        title: 'Grand Test — Complete Syllabus',
        scope: 'JEE (Main + Advanced) and GATE combined',
        date: '2026-12-31',
        day: 'Thursday',
        dayNum: 31,
        window: 'Last week of December 2026',
        note:
            'One Grand Test covering the complete syllabus for both JEE and GATE. ' +
            'Attendance is compulsory and the score carries the highest weightage in ' +
            'your overall monthly performance.'
    };

    /* ----------------------------------------------------------------------
       RE-CONDUCT SATURDAYS — second Saturday of every month. Where the second
       Saturday falls inside an official examination window the slot rolls
       forward to the next free Saturday.
       ---------------------------------------------------------------------- */
    const reConductSaturdays = [
        { monthKey: '2026-08', label: 'August 2026', date: '2026-08-08', day: 'Saturday' },
        { monthKey: '2026-09', label: 'September 2026', date: '2026-09-12', day: 'Saturday' },
        { monthKey: '2026-10', label: 'October 2026', date: '2026-10-10', day: 'Saturday' },
        { monthKey: '2026-11', label: 'November 2026', date: '2026-11-14', day: 'Saturday' },
        { monthKey: '2026-12', label: 'December 2026', date: '2026-12-12', day: 'Saturday' },
        { monthKey: '2027-01', label: 'January 2027', date: '2027-01-09', day: 'Saturday' },
        {
            monthKey: '2027-02', label: 'February 2027', date: '2027-02-27', day: 'Saturday',
            shifted: { from: '2027-02-13', reason: 'GATE 2027 official examination window' }
        },
        { monthKey: '2027-03', label: 'March 2027', date: '2027-03-13', day: 'Saturday' },
        {
            monthKey: '2027-04', label: 'April 2027', date: '2027-04-17', day: 'Saturday',
            shifted: { from: '2027-04-10', reason: 'JEE Main 2027 Session 2 official examination window' }
        }
    ];

    /* ----------------------------------------------------------------------
       SCHEMAS — marking schemes.
       Each program carries TWO clearly separated schemes:
         • institute : the academy's own monthly / grand test pattern
         • official  : the published NTA / GATE Committee scheme
       Never merge the two.
       ---------------------------------------------------------------------- */
    const schemas = {
        jee: {
            label: 'JEE',
            fullName: 'Joint Entrance Examination (Main & Advanced)',
            institute: {
                title: 'Institute Monthly Test — JEE Scheme',
                badge: 'Academy Pattern',
                authority: 'Pinnacle Scholars Academy',
                summary:
                    'The pattern used for every institute JEE monthly test and for the ' +
                    'December Grand Test. It is modelled on JEE (Main) but is NOT the ' +
                    'official NTA paper.',
                meta: [
                    { label: 'Total Questions', value: '75' },
                    { label: 'Total Marks', value: '300' },
                    { label: 'Duration', value: '180 minutes' },
                    { label: 'Mode', value: 'Online · Computer Based Test' }
                ],
                sections: [
                    { name: 'Physics', sectionA: 20, sectionB: 5, questions: 25, marks: 100 },
                    { name: 'Chemistry', sectionA: 20, sectionB: 5, questions: 25, marks: 100 },
                    { name: 'Mathematics', sectionA: 20, sectionB: 5, questions: 25, marks: 100 }
                ],
                marking: [
                    { type: 'Section A — Multiple Choice (MCQ)', correct: '+4', incorrect: '−1', unattempted: '0' },
                    { type: 'Section B — Numerical Value', correct: '+4', incorrect: '0 (no negative marking)', unattempted: '0' }
                ],
                specialRules: [
                    'Questions are presented continuously in the order Physics → Chemistry → Mathematics, but a student may attempt them in any order.',
                    'All 75 questions carry equal weight of 4 marks.',
                    'Negative marking is applied only to incorrect Multiple Choice responses. Incorrect numerical responses carry no penalty.',
                    'Student ID and Date of Birth are mandatory to unlock the paper.',
                    'One attempt only — a submitted paper cannot be retaken for the same test.'
                ]
            },
            official: {
                title: 'Official Scheme — JEE (Main) 2027',
                badge: 'NTA Official',
                authority: 'National Testing Agency (NTA)',
                source: 'NTA Examination Calendar 2026-27 · JEE (Main) Information Bulletin',
                link: 'https://jeemain.nta.nic.in/',
                summary:
                    'Published by the National Testing Agency for JEE (Main) 2027, held in ' +
                    'two sessions — Session 1 in January 2027 and Session 2 in April 2027. ' +
                    'NTA may revise this scheme; the official bulletin always prevails.',
                meta: [
                    { label: 'Paper 1 (B.E./B.Tech)', value: '75 questions · 300 marks' },
                    { label: 'Paper 2A (B.Arch)', value: '77 questions · 400 marks' },
                    { label: 'Paper 2B (B.Planning)', value: '100 questions · 400 marks' },
                    { label: 'Duration', value: '180 minutes' },
                    { label: 'Mode', value: 'Online · Computer Based Test' },
                    { label: 'Languages', value: '13 (English, Hindi and 11 regional languages)' }
                ],
                sections: [
                    { name: 'Mathematics', sectionA: 20, sectionB: 5, questions: 25, marks: 100 },
                    { name: 'Physics', sectionA: 20, sectionB: 5, questions: 25, marks: 100 },
                    { name: 'Chemistry', sectionA: 20, sectionB: 5, questions: 25, marks: 100 }
                ],
                marking: [
                    { type: 'Section A — Multiple Choice (MCQ)', correct: '+4', incorrect: '−1', unattempted: '0' },
                    { type: 'Section B — Numerical Value', correct: '+4', incorrect: '−1', unattempted: '0' }
                ],
                specialRules: [
                    'Every question is compulsory — there are no optional questions in either section.',
                    'Section B carries 5 compulsory numerical value questions per subject; the answer is entered on a virtual numeric keypad and rounded off to the nearest integer.',
                    'Negative marking applies in Section A as well as Section B. This is the revised JEE (Main) pattern first introduced for the 2026 session.',
                    'In Paper 2A (B.Arch) the Drawing Test is evaluated out of 100 marks and carries no negative marking.',
                    'Paper 2B (B.Planning) adds 25 Planning-based questions of 4 marks each.'
                ]
            }
        },

        gate: {
            label: 'GATE',
            fullName: 'Graduate Aptitude Test in Engineering',
            institute: {
                title: 'Institute Monthly Test — GATE Scheme',
                badge: 'Academy Pattern',
                authority: 'Pinnacle Scholars Academy',
                summary:
                    'The pattern used for every institute GATE monthly test and for the ' +
                    'December Grand Test. It follows the GATE section split but is NOT ' +
                    'the official GATE paper.',
                meta: [
                    { label: 'Total Questions', value: '65' },
                    { label: 'Total Marks', value: '100' },
                    { label: 'Duration', value: '180 minutes' },
                    { label: 'Mode', value: 'Online · Computer Based Test' }
                ],
                sections: [
                    { name: 'General Aptitude', sectionA: 10, sectionB: 0, questions: 10, marks: 15 },
                    { name: 'Core Subject', sectionA: 55, sectionB: 0, questions: 55, marks: 85 }
                ],
                marking: [
                    { type: '1-mark question (correct)', correct: '+1', incorrect: '—', unattempted: '0' },
                    { type: '2-mark question (correct)', correct: '+2', incorrect: '—', unattempted: '0' },
                    { type: 'Multiple Choice (MCQ) — incorrect', correct: '—', incorrect: 'Negative marking applicable', unattempted: '0' },
                    { type: 'Numerical question — incorrect', correct: '—', incorrect: '0 (no negative marking)', unattempted: '0' }
                ],
                specialRules: [
                    'The paper is split into General Aptitude (10 questions) and the Core Subject (55 questions).',
                    '1-mark and 2-mark questions are both present, mirroring the official GATE paper.',
                    'Negative marking applies to incorrect Multiple Choice responses; incorrect numerical responses carry no penalty.',
                    'The test engine awards +4 for a correct response and deducts 1 for an incorrect non-numerical response, as configured for the academy test portal.',
                    'Student ID and Date of Birth are mandatory to unlock the paper.',
                    'One attempt only — a submitted paper cannot be retaken for the same test.'
                ]
            },
            official: {
                title: 'Official Scheme — GATE 2027',
                badge: 'IIT Madras Official',
                authority: 'IIT Madras (Organizing Institute) · NCB-GATE, Ministry of Education',
                source: 'GATE 2027 Information Brochure, IIT Madras (revised 27 August 2026)',
                link: 'https://gate2027.iitm.ac.in/',
                summary:
                    'GATE 2027 is conducted for 30 test papers as a Computer Based Test in ' +
                    'English. Syllabus is revised for 2027 and a new Robotics & Automation ' +
                    '(RA) paper has been introduced. The GATE Committee may revise this ' +
                    'scheme; the official brochure always prevails.',
                meta: [
                    { label: 'Total Papers', value: '30' },
                    { label: 'Questions per Paper', value: '65 (10 General Aptitude + 55 Subject)' },
                    { label: 'Total Marks', value: '100' },
                    { label: 'Duration', value: '180 minutes (240 minutes for PwD candidates)' },
                    { label: 'Mode', value: 'Online · Computer Based Test' },
                    { label: 'Medium', value: 'English' },
                    { label: 'Score Validity', value: '3 years from declaration of result' }
                ],
                sections: [
                    { name: 'General Aptitude (all papers)', sectionA: 10, sectionB: 0, questions: 10, marks: 15, note: '5 questions × 1 mark + 5 questions × 2 marks' },
                    {
                        name: 'Engineering Mathematics (XE / AE, AG, BM, BT, CE, CH, CS, EC, EE, ES, IN, ME, MN, MT, NM, PE, PI)',
                        sectionA: 0, sectionB: 0, questions: 0, marks: 13,
                        note: 'Subject questions then carry 72 marks'
                    },
                    {
                        name: 'Subject (papers without Engineering Mathematics — AR, CY, DA, EY, GE, GG, MA, PH, RA, ST, XH, XL)',
                        sectionA: 0, sectionB: 0, questions: 55, marks: 85,
                        note: '25 questions × 1 mark + 30 questions × 2 marks'
                    }
                ],
                marking: [
                    { type: 'MCQ — 1 mark, correct', correct: '+1', incorrect: '−1/3', unattempted: '0' },
                    { type: 'MCQ — 2 marks, correct', correct: '+2', incorrect: '−2/3', unattempted: '0' },
                    { type: 'MSQ — Multiple Select, correct', correct: 'Full marks', incorrect: '0 (no negative marking)', unattempted: '0' },
                    { type: 'NAT — Numerical Answer Type, correct', correct: 'Full marks', incorrect: '0 (no negative marking)', unattempted: '0' }
                ],
                specialRules: [
                    'Every question carries either 1 mark or 2 marks.',
                    'Negative marking applies only to MCQ — one third of the marks for a 1-mark MCQ and two thirds for a 2-mark MCQ.',
                    'There is no negative marking for MSQ or NAT questions, and no partial marking in MSQ — the answer is either entirely right or entirely wrong.',
                    'NAT answers are real numbers entered on a virtual numeric keypad, ideally to a maximum of three decimal places.',
                    'A candidate may opt for a maximum of two test papers.',
                    'GATE 2027 introduces a new Robotics & Automation (RA) paper, and the Textile Engineering & Fibre Science paper moves into the XE sectional paper as XE9.',
                    'GATE 2027 results are scheduled for 19 March 2027.'
                ]
            }
        }
    };

    /* ----------------------------------------------------------------------
       GUIDELINES — academy examination policy.
       `penaltyPolicy` holds the academy's internal financial consequences.
       These are institutional values: review and edit them to match the
       academy's current published policy before publishing.
       ---------------------------------------------------------------------- */
    const guidelines = {
        intro:
            'These rules govern every monthly test, grand test and re-conduct ' +
            'examination sat at Pinnacle Scholars Academy. They are additional to — ' +
            'and do not replace — the terms of the official NTA and GATE ' +
            'examinations for which the academy is not responsible.',

        sections: [
            {
                id: 'exam-rules',
                icon: '📋',
                title: 'Examination Rules',
                tone: 'default',
                items: [
                    'Only students officially enrolled in the JEE or GATE programme, and whose enrolment has completed the 60-day eligibility period, may appear for a monthly test.',
                    'A test must be attempted from the official academy examination portal using the student\'s own registered Student ID and Date of Birth.',
                    'The paper, its duration, its section order and its marking scheme are fixed by the portal at the time the paper is opened and may not be negotiated.',
                    'Faculty may not supply question papers, answer keys or advance copies of a test to any student.',
                    'Every student must read the on-screen instructions in full before clicking "Verify Eligibility & Start Test".'
                ]
            },
            {
                id: 'conduct',
                icon: '🎓',
                title: 'Student Conduct Requirements',
                tone: 'default',
                items: [
                    'Minimum 92% attendance is required across the academic year, as published in the institute norms.',
                    'Students must appear for every monthly test of their enrolled programme unless a genuine medical reason is documented and communicated in advance.',
                    'Students must conduct themselves in an orderly manner in the examination hall and must not disturb other candidates.',
                    'Electronic devices, bags, notes and personal belongings must be kept outside the examination area as directed by the invigilator.',
                    'A student must be seated in the allotted system before the examination begins. A late candidate may be denied entry.'
                ]
            },
            {
                id: 'timing',
                icon: '⏱️',
                title: 'Examination Timing Rules',
                tone: 'default',
                items: [
                    'Every paper is allotted 180 minutes (3 hours) from the moment the test is started.',
                    'The on-screen countdown is the sole authority on remaining time. It cannot be paused, extended or reset.',
                    'When the countdown reaches zero the paper is submitted automatically and the answers recorded up to that instant are evaluated.',
                    'The portal session is time-boxed separately. Leaving the paper idle may sign the student out before the paper is submitted.',
                    'Re-logging in during a live paper resumes the same attempt; it does not restart the paper.'
                ]
            },
            {
                id: 'identity',
                icon: '🪪',
                title: 'Login & Identity Requirements',
                tone: 'default',
                items: [
                    'Student ID and Date of Birth are the sole credentials used to unlock an examination. Both must match the academy record exactly.',
                    'Credentials must never be shared, lent or written down for another student to use.',
                    'A student may sign in only from the device allotted to them. Signing in from an unrecognised device is treated as an impersonation attempt.',
                    'The name shown on the portal must match the enrolled student. Any mismatch voids the attempt.',
                    'The academy may verify identity at any time, including after the result is declared.'
                ]
            },
            {
                id: 'prohibited',
                icon: '🚫',
                title: 'Prohibited Activities',
                tone: 'warning',
                items: [
                    'Copying, photographing, scanning or recording the question paper, the screen or any part of the portal.',
                    'Using a second device — phone, tablet, laptop or smartwatch — during the examination.',
                    'Communication of any kind with another person during the examination, including gestures, notes or verbal signals.',
                    'Browsing, messaging, screen recording, or using any application not required for the paper.',
                    'Attempting to open browser developer tools, inspect elements, view source or modify portal code.',
                    'Writing, drawing or marking anything on the examination screen or on any paper other than the answer interface.',
                    'Impersonating another candidate, or allowing your paper to be attempted by someone else.'
                ]
            },
            {
                id: 'malpractice',
                icon: '⚠️',
                title: 'Malpractice & Cheating Rules',
                tone: 'danger',
                items: [
                    'The portal actively blocks restricted keyboard and browser shortcuts during a live paper. Repeated deliberate attempts to bypass these controls are themselves treated as an integrity breach, independent of whether the attempt succeeded.',
                    'Any unauthorised material found in the examination area — notes, a second device, a printed paper or a wearable — is confiscated and reported.',
                    'A candidate who is under evaluation is asked to remain seated after the paper ends until the evaluation is complete.',
                    'A candidate who leaves the examination area while a paper is live without permission has that attempt terminated immediately.',
                    'Impersonation of a candidate, or use of another candidate\'s credentials, is treated as a serious offence and is reported to the guardians and to the examination authority.'
                ]
            },
            {
                id: 'submission',
                icon: '📤',
                title: 'Submission & Examination Exit Rules',
                tone: 'default',
                items: [
                    'Use the "Submit Test" button to end the examination early. Once submitted, the paper is closed and cannot be reopened.',
                    'A paper is submitted automatically when the countdown reaches zero.',
                    'Answers are saved automatically as you move between questions, so a lost connection does not erase the paper — but you must re-authenticate to resume it.',
                    'Before submitting, review the question navigator to confirm that every question you intend to answer is marked.',
                    'Do not close the browser tab, refresh the page or navigate away while a paper is live.',
                    'After the paper is submitted, the scorecard is published to the Result Portal. Each test permits exactly one attempt.',
                    'Query or re-evaluation requests must be raised within 7 days of the result being published, through the faculty concerned.'
                ]
            }
        ],

        /* Academy-internal consequences. Edit these to match current policy. */
        penaltyPolicy: {
            note:
                'The consequences below are the academy\'s internal examination policy. ' +
                'Amounts and durations are maintained centrally — edit this block to match ' +
                'the academy\'s current published schedule of penalties.',
            columns: ['Level', 'Offence', 'Consequence', 'Applicable Fine'],
            rows: [
                {
                    level: 'Level 1', tone: 'warning', icon: '⚠️',
                    offence: 'Late arrival beyond the permitted grace period, or non-production of a Student ID at the portal.',
                    consequence: 'Entry is at the invigilator\'s discretion. The student sits for a reduced duration with no extension.',
                    fine: 'No fine'
                },
                {
                    level: 'Level 2', tone: 'warning', icon: '⚠️',
                    offence: 'Unauthorised material found — notes, printed paper or a second device — without any evidence of use.',
                    consequence: 'Material is confiscated. A warning is recorded on the student file for the academic year.',
                    fine: '₹500 re-conduct fee'
                },
                {
                    level: 'Level 3', tone: 'danger', icon: '⛔',
                    offence: 'Use of a second device or communication with another person during a live paper.',
                    consequence: 'The current paper is invalidated. The re-conduct slot on the designated second Saturday is forfeited. A formal undertaking is required before further tests are unlocked.',
                    fine: '₹1,000 re-conduct fee + paper invalidated'
                },
                {
                    level: 'Level 4', tone: 'danger', icon: '⛔',
                    offence: 'Copying, recording or distributing the question paper, or deliberate circumvention of the portal integrity controls.',
                    consequence: 'All pending and past monthly test results for the current academic year are cancelled. Portal test access is suspended pending an academic review. Guardians are informed in writing.',
                    fine: '₹2,500 + full result cancellation + suspension'
                },
                {
                    level: 'Level 5', tone: 'critical', icon: '🚫',
                    offence: 'Impersonation of a candidate, use of another candidate\'s credentials, or falsification of an official record or scorecard.',
                    consequence: 'Permanent removal from the examination system, full academic-year fee forfeiture, and referral of the matter to the relevant examination authority. The academy will cooperate fully with any official investigation.',
                    fine: 'Non-refundable · case referred to authorities'
                }
            ]
        },

        validity: [
            { label: 'Re-conduct slot', value: 'Second Saturday of every month — reserved exclusively for eligible students who missed the scheduled examination.' },
            { label: 'Missed-paper rule', value: 'A paper is re-attemptable only on the re-conduct slot and only with a documented reason submitted in advance to the faculty concerned.' },
            { label: 'Attempt limit', value: 'One attempt per published test, per student. The portal permanently blocks a second attempt.' },
            { label: 'Result queries', value: 'Must be raised within 7 days of publication through the faculty concerned.' }
        ]
    };

    /* ----------------------------------------------------------------------
       NOTIFICATIONS — copy and emphasis rules for the Notifications section.
       ---------------------------------------------------------------------- */
    const notifications = {
        reConductNotice: {
            text: 'Every second Saturday will be reserved for re-conducting JEE/GATE examinations for eligible students who missed the scheduled examination.',
            icon: '🔁',
            tone: 'danger'
        },
        grandTestNotice: {
            title: 'December Grand Test',
            icon: '🏆'
        },
        programMeta: {
            jee: { label: 'JEE Notifications', icon: '📘', accent: 'jee' },
            gate: { label: 'GATE Notifications', icon: '⚙️', accent: 'gate' }
        }
    };

    /* ----------------------------------------------------------------------
       HELPERS — used by the renderers. Kept here so every view derives dates
       the same way.
       ---------------------------------------------------------------------- */
    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const DAY_NAMES = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    /** Expand 'YYYY-MM-DD' into parts without any timezone drift. */
    function parseISO(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    /** '2026-09-01' -> '1 September 2026' */
    function formatLong(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
    }

    /** '2026-09-01' -> '01 Sep 2026' */
    function formatShort(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return `${String(d).padStart(2, '0')} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
    }

    /** '2026-09-01' -> 'Tuesday' (day-of-week, derived from the date) */
    function dayOf(iso) {
        return DAY_NAMES[parseISO(iso).getDay()];
    }

    function dayShortOf(iso) {
        return DAY_SHORT[parseISO(iso).getDay()];
    }

    /** True when the ISO date falls inside any official examination window. */
    function inOfficialWindow(iso) {
        return officialExams.find((e) => iso >= e.window.from && iso <= e.window.to) || null;
    }

    /** The four schedule slots resolved against the data. */
    function slotMeta(index) {
        return schedulePattern.slots[index];
    }

    /** All events of a given program inside a month entry. */
    function eventsForProgram(monthEntry, program) {
        return monthEntry.events
            .map((e) => ({ ...e, meta: slotMeta(e.slot) }))
            .filter((e) => e.meta.program === program);
    }

    /**
     * Resolve the academic-year month that contains `date`, plus the one that
     * follows it. Used by the Notifications section so "this month" and "next
     * month" are always correct without editing the data.
     */
    function currentAndNextMonth(date) {
        const now = date || new Date();
        let current = months.findIndex(
            (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1
        );
        if (current === -1) {
            // Outside the academic year (May-July): show the last month of the
            // year and the first month of the year as the rolling pair.
            current = 0;
        }
        const nextIndex = current + 1;
        return {
            current: months[current],
            next: nextIndex < months.length ? months[nextIndex] : null
        };
    }

    return {
        academicYear,
        schedulePattern,
        holidays,
        officialExams,
        months,
        grandTest,
        reConductSaturdays,
        schemas,
        guidelines,
        notifications,
        // helpers
        MONTH_NAMES,
        DAY_NAMES,
        DAY_SHORT,
        parseISO,
        formatLong,
        formatShort,
        dayOf,
        dayShortOf,
        inOfficialWindow,
        slotMeta,
        eventsForProgram,
        currentAndNextMonth
    };
}());
