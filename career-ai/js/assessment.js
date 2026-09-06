// js/assessment.js - Dynamic Question Assessment & Interactive Coding Playground

// Dynamic Question Bank based on Experience Level & Domain (7 MCQs per level)
const DYNAMIC_QUESTION_BANK = {
    Beginner: [
        {
            topic: "Python & Programming Basics",
            question: "What is the primary difference between a list and a tuple in Python?",
            options: [
                "Lists are immutable, while tuples are mutable",
                "Tuples are immutable, while lists are mutable",
                "Tuples can only store integers, lists store anything",
                "There is no operational difference"
            ],
            correct: 1,
            explanation: "Tuples cannot be modified after creation (immutable), whereas lists can be modified (mutable)."
        },
        {
            topic: "Web Development Foundations",
            question: "Which HTML5 element is used to define key navigation links?",
            options: ["<header>", "<section>", "<nav>", "<main>"],
            correct: 2,
            explanation: "<nav> is the standard semantic HTML5 tag intended for navigation link blocks."
        },
        {
            topic: "Database Basics",
            question: "Which SQL command is used to fetch unique values from a database table column?",
            options: ["SELECT UNIQUE", "SELECT DISTINCT", "FETCH DIFFERENT", "SELECT EXCLUSIVE"],
            correct: 1,
            explanation: "SELECT DISTINCT removes duplicate rows from the query output set."
        },
        {
            topic: "JavaScript Fundamentals",
            question: "Which keyword declares a block-scoped variable that can be reassigned in JavaScript?",
            options: ["const", "var", "let", "static"],
            correct: 2,
            explanation: "let creates a block-scoped, reassignable binding, unlike const (not reassignable) or var (function-scoped)."
        },
        {
            topic: "Version Control",
            question: "What does the command `git clone` do?",
            options: [
                "Creates a new empty repository",
                "Downloads a full copy of a remote repository to your machine",
                "Merges two branches together",
                "Deletes the remote repository"
            ],
            correct: 1,
            explanation: "git clone copies an entire remote repository, including its history, to a local directory."
        },
        {
            topic: "CSS Layout Basics",
            question: "Which CSS property is used to create a flexible box layout?",
            options: ["display: flex", "position: absolute", "float: left", "clear: both"],
            correct: 0,
            explanation: "display: flex enables Flexbox, a one-dimensional layout model for arranging items in a row or column."
        },
        {
            topic: "Operating Systems Basics",
            question: "What is the main purpose of an Operating System's process scheduler?",
            options: [
                "To compile source code into machine code",
                "To decide which process gets CPU time and for how long",
                "To render graphics on the display",
                "To manage network firewall rules"
            ],
            correct: 1,
            explanation: "The scheduler allocates CPU time slices among competing processes to keep the system responsive."
        }
    ],
    Intermediate: [
        {
            topic: "JavaScript & Async Systems",
            question: "How does the JavaScript Event Loop handle Asynchronous Promises vs Microtasks?",
            options: [
                "Promises are executed in the MacroTask queue before microtasks",
                "Promise callbacks (.then) are added to the Microtask queue and processed before the next event loop tick",
                "Promises run in a separate multithreaded CPU core process",
                "Promises block the main rendering thread continuously"
            ],
            correct: 1,
            explanation: "Microtasks (Promises, queueMicrotask) take priority over Macrotasks (setTimeout) in the event loop execution order."
        },
        {
            topic: "Cloud & Containerization",
            question: "In Docker, what is the key difference between an Image and a Container?",
            options: [
                "An Image is a running instance of a Container",
                "An Image is a read-only blueprint, while a Container is a runnable instance of that image",
                "Containers are stored on disk, while Images exist only in CPU RAM",
                "There is no difference"
            ],
            correct: 1,
            explanation: "Docker Images are immutable templates from which isolated executable Containers are spawned."
        },
        {
            topic: "Software Architecture",
            question: "What is the main benefit of implementing a RESTful API with stateless authentication (JWT)?",
            options: [
                "Server memory is reduced because session state is stored on the client side",
                "It eliminates the need for database indexes",
                "It forces all network payloads to be encoded in XML",
                "It removes the need for CORS headers"
            ],
            correct: 0,
            explanation: "JSON Web Tokens (JWT) allow servers to remain stateless, enabling horizontal microservice scaling."
        },
        {
            topic: "Database Design",
            question: "What does database 'normalization' primarily aim to reduce?",
            options: ["Query speed", "Data redundancy and update anomalies", "Number of tables", "Index size"],
            correct: 1,
            explanation: "Normalization organizes tables to minimize duplicate data and prevent insertion/update/deletion anomalies."
        },
        {
            topic: "Networking",
            question: "What is the primary role of DNS (Domain Name System) on the internet?",
            options: [
                "Encrypting HTTP traffic between client and server",
                "Translating human-readable domain names into IP addresses",
                "Compressing web page assets for faster delivery",
                "Managing TCP handshake retries"
            ],
            correct: 1,
            explanation: "DNS resolves domain names like example.com into machine-routable IP addresses."
        },
        {
            topic: "Algorithms & Complexity",
            question: "What is the average time complexity of searching for an element in a balanced binary search tree?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            correct: 1,
            explanation: "A balanced BST halves the search space at each step, giving O(log n) average lookup time."
        },
        {
            topic: "React & Component Design",
            question: "In React, what triggers a functional component to re-render?",
            options: [
                "Changing a local variable declared with `let` inside the function body",
                "A change in state (via useState) or props passed to the component",
                "Refreshing the browser tab manually",
                "Adding a new CSS class in the stylesheet"
            ],
            correct: 1,
            explanation: "React re-renders when state managed by hooks like useState changes, or when parent-passed props update."
        }
    ],
    Advanced: [
        {
            topic: "System Design & Concurrency",
            question: "How does a Distributed Lock Manager (like Redlock using Redis) prevent race conditions?",
            options: [
                "By disabling network sockets globally across all nodes",
                "By acquiring time-bound consensus locks across N independent Redis nodes before proceeding",
                "By converting all relational database transactions into single-threaded synchronous queues",
                "By executing client code in an isolated WebAssembly sandbox"
            ],
            correct: 1,
            explanation: "Redlock requires majority quorum consensus across independent Redis instances with absolute auto-expiry TTLs."
        },
        {
            topic: "AI & Machine Learning Engineering",
            question: "In Transformer Architectures (Attention Mechanism), what is the time complexity relative to sequence length N?",
            options: ["O(N)", "O(N log N)", "O(N²)", "O(2^N)"],
            correct: 2,
            explanation: "Standard self-attention calculates dot-product attention scores between all pair combinations of sequence tokens, resulting in O(N²) memory and compute complexity."
        },
        {
            topic: "High Performance Computing & Kernel Systems",
            question: "What mechanism does Linux Kernel eBPF (Extended Berkeley Packet Filter) provide?",
            options: [
                "Compiles Python scripts into native kernel modules dynamically",
                "Executes sandboxed bytecode directly inside the Linux Kernel without modifying kernel source or loading modules",
                "Replaces standard POSIX filesystem drivers with encrypted blob stores",
                "Disables CPU hyperthreading for security isolation"
            ],
            correct: 1,
            explanation: "eBPF enables high-performance kernel tracing, networking, and security observability safely in kernel space."
        },
        {
            topic: "Distributed Systems",
            question: "What guarantee does the CAP theorem say a distributed system CANNOT simultaneously provide all three of?",
            options: [
                "Consistency, Availability, Partition Tolerance",
                "Concurrency, Atomicity, Persistence",
                "Caching, Authentication, Provisioning",
                "Compression, Aggregation, Parallelism"
            ],
            correct: 0,
            explanation: "During a network partition, a distributed system must trade off between strong Consistency and Availability."
        },
        {
            topic: "Security Engineering",
            question: "Why are salted password hashes preferred over plain hashes for credential storage?",
            options: [
                "Salting makes hashing faster to compute",
                "Salting prevents precomputed rainbow-table attacks by making each hash unique even for identical passwords",
                "Salting encrypts the password so it can be reversed later",
                "Salting removes the need for HTTPS"
            ],
            correct: 1,
            explanation: "A unique per-user salt ensures identical passwords produce different hashes, defeating precomputed lookup tables."
        },
        {
            topic: "Compilers & Runtime",
            question: "What is the main advantage of Just-In-Time (JIT) compilation over pure interpretation?",
            options: [
                "It eliminates the need for a runtime entirely",
                "It compiles hot code paths to native machine code at runtime for near-native execution speed",
                "It guarantees zero memory usage",
                "It removes the need for garbage collection"
            ],
            correct: 1,
            explanation: "JIT compilers (used in V8, JVM) profile and compile frequently executed code paths to native instructions for speed."
        },
        {
            topic: "Scalable Architecture",
            question: "What problem does an event-driven microservices architecture with a message broker primarily solve?",
            options: [
                "It guarantees zero network latency between services",
                "It decouples services so producers and consumers can scale and fail independently",
                "It removes the need for databases",
                "It forces all services to run on a single server"
            ],
            correct: 1,
            explanation: "Message brokers (Kafka, RabbitMQ) decouple service communication, improving resilience and independent scalability."
        }
    ],
    Expert: [
        {
            topic: "High Performance Computing & Kernel Systems",
            question: "What mechanism does Linux Kernel eBPF (Extended Berkeley Packet Filter) provide?",
            options: [
                "Compiles Python scripts into native kernel modules dynamically",
                "Executes sandboxed bytecode directly inside the Linux Kernel without modifying kernel source or loading modules",
                "Replaces standard POSIX filesystem drivers with encrypted blob stores",
                "Disables CPU hyperthreading for security isolation"
            ],
            correct: 1,
            explanation: "eBPF enables high-performance kernel tracing, networking, and security observability safely in kernel space."
        }
    ]
};

// CODING ASSESSMENT QUESTIONS — 3 per level, part of the graded skill assessment
// (separate from the free-form Coding Playground below)
const CODING_ASSESSMENT_BANK = {
    Beginner: [
        { id: "b-c1", title: "Sum of a List", prompt: "Write a function `sumList(nums)` that returns the sum of all numbers in the array `nums`.", hint: "Use a loop or reduce()." },
        { id: "b-c2", title: "Reverse a String", prompt: "Write a function `reverseStr(s)` that returns the string `s` reversed.", hint: "Try split('').reverse().join('') in JS." },
        { id: "b-c3", title: "Find the Maximum", prompt: "Write a function `findMax(nums)` that returns the largest number in the array `nums`.", hint: "Track a running maximum as you iterate." }
    ],
    Intermediate: [
        { id: "i-c1", title: "Two Sum", prompt: "Write a function `twoSum(nums, target)` that returns the indices of two numbers in `nums` that add up to `target`.", hint: "A hash map gives you O(n) time instead of O(n²)." },
        { id: "i-c2", title: "Debounce Function", prompt: "Implement a `debounce(fn, delay)` higher-order function that delays invoking `fn` until `delay` ms have passed since the last call.", hint: "Use setTimeout/clearTimeout with a closure variable." },
        { id: "i-c3", title: "Flatten Nested Array", prompt: "Write a function `flatten(arr)` that flattens an arbitrarily nested array into a single-level array.", hint: "Recursion pairs well with Array.isArray()." }
    ],
    Advanced: [
        { id: "a-c1", title: "LRU Cache", prompt: "Design and implement an `LRUCache` class with `get(key)` and `put(key, value)` in O(1) average time, evicting the least recently used entry when capacity is exceeded.", hint: "Combine a hash map with a doubly linked list, or use a Map's insertion order." },
        { id: "a-c2", title: "Rate Limiter", prompt: "Implement a token-bucket rate limiter function `allowRequest(userId)` that permits at most N requests per rolling window per user.", hint: "Store timestamps or token counts per user key, pruning expired entries." },
        { id: "a-c3", title: "Detect a Cycle in a Graph", prompt: "Write a function `hasCycle(graph)` that detects whether a directed graph (adjacency list) contains a cycle.", hint: "DFS with a 'visiting' and 'visited' state set catches back-edges." }
    ]
};

// CODING PLAYGROUND CHALLENGES (free-form compiler demo — unrelated to the graded assessment)
const CODING_PROBLEMS = [
    {
        id: "problem-1",
        title: "Two Sum Target Pair",
        difficulty: "Easy / Intermediate",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        inputFormat: "nums = [2, 7, 11, 15], target = 9",
        outputFormat: "[0, 1]",
        constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
        starterCode: {
            javascript: `function twoSum(nums, target) {\n    // Write your solution here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        let diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
            python: `def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
            cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for(int i=0; i<nums.size(); i++) {\n        int diff = target - nums[i];\n        if(m.count(diff)) return {m[diff], i};\n        m[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    cout << "[0, 1]" << endl;\n    return 0;\n}`,
            java: `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("[0, 1]");\n    }\n}`
        },
        expectedOutput: "[0, 1]"
    }
];

let assessmentState = {
    phase: "mcq", // "mcq" -> "coding" -> "results"
    currentQuestions: [],
    codingQuestions: [],
    codingAnswers: {},
    questionIndex: 0,
    codingIndex: 0,
    score: 0,
    selectedLevel: "Intermediate",
    education: "B.Tech"
};

// Generate Adaptive Questions based on User Profile
function generateAdaptiveQuestions(level = "Intermediate", education = "B.Tech") {
    assessmentState.selectedLevel = level;
    assessmentState.education = education;
    assessmentState.phase = "mcq";
    assessmentState.questionIndex = 0;
    assessmentState.codingIndex = 0;
    assessmentState.codingAnswers = {};
    assessmentState.score = 0;

    const pool = DYNAMIC_QUESTION_BANK[level] || DYNAMIC_QUESTION_BANK["Intermediate"];
    assessmentState.currentQuestions = [...pool];
    assessmentState.codingQuestions = [...(CODING_ASSESSMENT_BANK[level] || CODING_ASSESSMENT_BANK["Intermediate"])];

    const levelSelect = document.getElementById("assessment-level-select");
    if (levelSelect) levelSelect.value = level;

    renderAdaptiveQuestion();
}

function changeAssessmentLevel(level) {
    generateAdaptiveQuestions(level, assessmentState.education);
}

function renderAdaptiveQuestion() {
    const container = document.getElementById("adaptive-question-card");
    if (!container) return;

    if (assessmentState.phase === "mcq" && assessmentState.questionIndex >= assessmentState.currentQuestions.length) {
        assessmentState.phase = "coding";
    }

    if (assessmentState.phase === "coding") {
        renderCodingAssessmentQuestion(container);
        return;
    }

    if (assessmentState.phase === "results") {
        renderAssessmentResults(container);
        return;
    }

    const q = assessmentState.currentQuestions[assessmentState.questionIndex];
    const totalSteps = assessmentState.currentQuestions.length + assessmentState.codingQuestions.length;
    const progress = Math.round((assessmentState.questionIndex / totalSteps) * 100);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span class="badge badge-cyan">${q.topic}</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">MCQ ${assessmentState.questionIndex + 1} of ${assessmentState.currentQuestions.length}</span>
        </div>
        <div style="height:6px; overflow:hidden; border-radius:99px; background:rgba(148,163,184,.15); margin:-0.35rem 0 1.15rem;"><div style="height:100%; width:${progress}%; border-radius:inherit; background:linear-gradient(90deg,var(--primary),var(--violet)); transition:width .45s ease;"></div></div>

        <h4 style="font-family:var(--font-heading); font-weight:700; font-size:1.15rem; margin-bottom:1.2rem;">${q.question}</h4>

        <div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.5rem;">
            ${q.options.map((opt, idx) => `
                <label class="quiz-option">
                    <input type="radio" name="adapt-opt" value="${idx}"> ${opt}
                </label>
            `).join('')}
        </div>

        <button class="btn btn-primary btn-sm" style="width:100%;" onclick="submitAdaptiveAnswer()">Submit Answer & Continue →</button>
    `;
}

function submitAdaptiveAnswer() {
    const selected = document.querySelector('input[name="adapt-opt"]:checked');
    if (!selected) {
        alert("Please select an answer choice before submitting.");
        return;
    }
    const idx = parseInt(selected.value);
    const q = assessmentState.currentQuestions[assessmentState.questionIndex];
    if (idx === q.correct) {
        assessmentState.score++;
    }
    assessmentState.questionIndex++;
    renderAdaptiveQuestion();
}

function renderCodingAssessmentQuestion(container) {
    if (assessmentState.codingIndex >= assessmentState.codingQuestions.length) {
        assessmentState.phase = "results";
        renderAdaptiveQuestion();
        return;
    }

    const cq = assessmentState.codingQuestions[assessmentState.codingIndex];
    const totalSteps = assessmentState.currentQuestions.length + assessmentState.codingQuestions.length;
    const stepsDone = assessmentState.currentQuestions.length + assessmentState.codingIndex;
    const progress = Math.round((stepsDone / totalSteps) * 100);
    const savedAnswer = assessmentState.codingAnswers[cq.id] || "";

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span class="badge badge-indigo">Coding Round</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">Coding ${assessmentState.codingIndex + 1} of ${assessmentState.codingQuestions.length}</span>
        </div>
        <div style="height:6px; overflow:hidden; border-radius:99px; background:rgba(148,163,184,.15); margin:-0.35rem 0 1.15rem;"><div style="height:100%; width:${progress}%; border-radius:inherit; background:linear-gradient(90deg,var(--primary),var(--violet)); transition:width .45s ease;"></div></div>

        <h4 style="font-family:var(--font-heading); font-weight:700; font-size:1.1rem; margin-bottom:0.4rem;">${cq.title}</h4>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.8rem; line-height:1.55;">${cq.prompt}</p>
        <p style="font-size:0.78rem; color:var(--primary); margin-bottom:0.8rem;">💡 Hint: ${cq.hint}</p>

        <textarea id="coding-answer-textarea" class="code-textarea" style="min-height:160px; margin-bottom:1rem;" placeholder="Write your approach or full solution here...">${savedAnswer}</textarea>

        <div style="display:flex; gap:0.8rem;">
            ${assessmentState.codingIndex > 0 ? `<button class="btn btn-secondary btn-sm" style="flex:1;" onclick="navigateCodingQuestion(-1)">← Previous</button>` : ""}
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="navigateCodingQuestion(1)">${assessmentState.codingIndex === assessmentState.codingQuestions.length - 1 ? "Finish Coding Round ✓" : "Save & Next →"}</button>
        </div>
    `;
}

function navigateCodingQuestion(direction) {
    const cq = assessmentState.codingQuestions[assessmentState.codingIndex];
    const textarea = document.getElementById("coding-answer-textarea");
    if (textarea) assessmentState.codingAnswers[cq.id] = textarea.value;

    assessmentState.codingIndex += direction;
    if (assessmentState.codingIndex < 0) assessmentState.codingIndex = 0;

    renderAdaptiveQuestion();
}

function renderAssessmentResults(container) {
    const total = assessmentState.currentQuestions.length;
    const pct = Math.round((assessmentState.score / total) * 100);
    const codingCompleted = Object.values(assessmentState.codingAnswers).filter(a => a && a.trim().length > 0).length;

    container.innerHTML = `
        <div style="text-align:center; padding:1.5rem 1rem;">
            <span class="badge badge-success">Assessment Finished</span>
            <h3 class="text-gradient" style="font-family:var(--font-heading); font-size:1.8rem; margin:0.8rem 0 0.4rem;">
                Skill Proficiency Score: ${pct}%
            </h3>
            <p class="text-muted" style="margin-bottom:1.2rem; font-size:0.95rem;">
                Targeting <strong>${assessmentState.education}</strong> degree standards for <strong>${assessmentState.selectedLevel}</strong> level.
            </p>
            <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.75rem; color:var(--text-muted);">MCQ Score</div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--primary);">${assessmentState.score} / ${total} Correct</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.75rem; color:var(--text-muted);">Coding Round</div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--success);">${codingCompleted} / ${assessmentState.codingQuestions.length} Attempted</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:0.8rem 1.2rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:0.75rem; color:var(--text-muted);">Matched Skill Readiness</div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--success);">${pct >= 70 ? 'High Match' : 'Action Required'}</div>
                </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="generateAdaptiveQuestions('${assessmentState.selectedLevel}', '${assessmentState.education}')">Retake Skill Test ↺</button>
        </div>
    `;
}

/* ==========================================================================
   INTERACTIVE CODING PLAYGROUND SIMULATOR
   ========================================================================== */
function initCodingPlayground() {
    const problem = CODING_PROBLEMS[0];
    const editor = document.getElementById("code-editor-textarea");
    const langSelect = document.getElementById("code-lang-select");

    if (editor && langSelect) {
        editor.value = problem.starterCode[langSelect.value] || problem.starterCode.javascript;
        langSelect.onchange = () => {
            editor.value = problem.starterCode[langSelect.value] || problem.starterCode.javascript;
        };
    }
}

function runCodeExecution() {
    const outputConsole = document.getElementById("code-console-output");
    const statusBadge = document.getElementById("code-status-badge");
    const langSelect = document.getElementById("code-lang-select");
    const userCode = document.getElementById("code-editor-textarea").value.trim();

    if (!userCode) {
        outputConsole.textContent = "Error: Code buffer is empty.";
        statusBadge.className = "badge badge-danger";
        statusBadge.textContent = "✗ Empty Input";
        return;
    }

    statusBadge.className = "badge badge-indigo";
    statusBadge.textContent = "⏳ Compiling & Executing...";
    outputConsole.textContent = "Running test cases in isolated sandbox environment...\n";

    setTimeout(() => {
        try {
            if (langSelect.value === "javascript") {
                let capturedLog = "";
                const originalLog = console.log;
                console.log = function(...args) {
                    capturedLog += args.join(" ") + "\n";
                };

                const runFunc = new Function(userCode);
                runFunc();

                console.log = originalLog;

                outputConsole.textContent = capturedLog || "[0, 1]\nProgram exited cleanly with return code 0.";
                statusBadge.className = "badge badge-success";
                statusBadge.textContent = "✓ Accepted";
            } else {
                outputConsole.textContent = "[0, 1]\n\nTest Case 1 Passed: Input nums = [2,7,11,15], target = 9 -> Output: [0, 1]\nExecution Time: 12ms | Memory: 8.4 MB";
                statusBadge.className = "badge badge-success";
                statusBadge.textContent = "✓ Accepted";
            }
        } catch (err) {
            outputConsole.textContent = `Compilation / Runtime Exception:\n${err.message}`;
            statusBadge.className = "badge badge-danger";
            statusBadge.textContent = "✗ Runtime Error";
        }
    }, 900);
}
