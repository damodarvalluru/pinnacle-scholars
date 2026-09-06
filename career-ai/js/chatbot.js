// js/chatbot.js - Standalone AI Career Assistant Chatbot Engine

const CHATBOT_KNOWLEDGE_BASE = [
    {
        keywords: ["job", "match", "recommend", "suitable", "find"],
        response: "To view jobs matched to your profile, complete your Skill & Sector assessment under 'Explore Jobs' or click 'Analyze My Career with AI'. We calculate suitability using your interests (40%), skills (40%), and experience level (20%)."
    },
    {
        keywords: ["resume", "ats", "template", "cv"],
        response: "You can build and preview your ATS-friendly resume directly in our 'Resume Builder' tab, or download verified sample templates for B.Tech, Freshers, Developers, and Data Scientists in 'Resume Samples'!"
    },
    {
        keywords: ["skill", "learn", "course", "upgrade"],
        response: "Check out our 'Skill Assessment' and 'Recommended Free Learning Resources' sections. We provide direct links to 100% free certified courses on freeCodeCamp, AWS Skill Builder, Microsoft Learn, and Harvard CS50."
    },
    {
        keywords: ["interview", "prep", "question", "practice"],
        response: "Use our 'AI Interview Practice' tool under Skill Development! You can practice technical, HR, and behavioral questions tailored to your target job role and receive instant AI evaluation feedback."
    },
    {
        keywords: ["coding", "test", "compiler", "run"],
        response: "Our 'Skill Assessment' tab features an interactive Coding Test Playground where you can write, run, and evaluate C, C++, Java, Python, and JavaScript solutions with real-time test cases!"
    },
    {
        keywords: ["internship", "intern"],
        response: "Head to the 'Internships' tab to browse live-refreshable internship listings matched to your skills, complete with deadlines, stipends, and direct apply links!"
    },
    {
        keywords: ["free course", "paid course", "certification", "certificate"],
        response: "Check the 'Courses' tab for both free and paid courses matched to your profile — toggle between the Free and Paid tabs to compare options from freeCodeCamp, Coursera, Udemy, and more!"
    },
    {
        keywords: ["mock interview", "ai interview", "behavioral"],
        response: "Try our 'AI Interview' tab! Set your skill level, skills, and interests, and it'll generate at least 7 tailored interview questions with a progress tracker and completion summary."
    }
];

function toggleChatbotWindow() {
    const chatWin = document.getElementById("chatbot-window");
    if (chatWin) {
        chatWin.classList.toggle("open");
        const badge = document.getElementById("chatbot-badge");
        if (badge) badge.style.display = "none";
    }
}

function sendChatbotMessage(customText = null) {
    const input = document.getElementById("chatbot-input");
    const messageText = customText || (input ? input.value.trim() : "");
    
    if (!messageText) return;
    if (input) input.value = "";

    const msgContainer = document.getElementById("chatbot-messages");
    if (!msgContainer) return;

    // Append User Message
    const userDiv = document.createElement("div");
    userDiv.className = "chat-msg user-msg";
    userDiv.innerHTML = `
        <div class="msg-bubble">${escapeHtml(messageText)}</div>
        <div class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    msgContainer.appendChild(userDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Show Typing Indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-msg ai-msg typing-msg";
    typingDiv.id = "chat-typing-indicator";
    typingDiv.innerHTML = `<div class="msg-bubble"><em>CareerAI Assistant is thinking...</em></div>`;
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Generate Answer
    setTimeout(() => {
        const typingEl = document.getElementById("chat-typing-indicator");
        if (typingEl) typingEl.remove();

        const responseText = matchChatbotResponse(messageText);

        const aiDiv = document.createElement("div");
        aiDiv.className = "chat-msg ai-msg";
        aiDiv.innerHTML = `
            <div class="msg-bubble">${responseText}</div>
            <div class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        msgContainer.appendChild(aiDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 800);
}

function matchChatbotResponse(text) {
    const lower = text.toLowerCase();
    for (const item of CHATBOT_KNOWLEDGE_BASE) {
        if (item.keywords.some(kw => lower.includes(kw))) {
            return item.response;
        }
    }
    return "I'm here to help with your career! You can ask me about recommended jobs matching your skills, resume optimization tips, free certified courses, or practicing mock AI interviews.";
}

function clearChatbotHistory() {
    const msgContainer = document.getElementById("chatbot-messages");
    if (msgContainer) {
        msgContainer.innerHTML = `
            <div class="chat-msg ai-msg">
                <div class="msg-bubble">Hello! I am your <strong>CareerAI Assistant</strong>. How can I guide your career journey today?</div>
                <div class="msg-time">Just now</div>
            </div>
        `;
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
