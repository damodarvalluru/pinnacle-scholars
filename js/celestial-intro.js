// Pinnacle Scholars Academy - Single Letter Drop Intro Animation for 3 Words
document.addEventListener('DOMContentLoaded', function() {
    initPinnacleLetterDropIntro();
});

function initPinnacleLetterDropIntro() {
    const welcomeIntro = document.getElementById('welcomeIntro');
    const pinnacleDropTitle = document.getElementById('pinnacleDropTitle');
    const pinnacleDropTagline = document.getElementById('pinnacleDropTagline');
    
    if (!welcomeIntro || !pinnacleDropTitle) return;

    // Guaranteed safety timeout to ensure website always appears even if interrupted
    const autoDismissTimer = setTimeout(() => {
        dismissWelcomeIntro();
    }, 4500);
    
    // Check if intro was already shown in this tab session
    if (sessionStorage.getItem('pinnacleIntroPlayed') === 'true') {
        welcomeIntro.style.display = 'none';
        welcomeIntro.classList.add('hide');
        document.body.classList.remove('entry-active');
        document.body.style.overflow = 'auto';
        clearTimeout(autoDismissTimer);
        return;
    }
    
    document.body.classList.add('entry-active');
    
    // The 3 words to drop letter by letter
    const words = ["PINNACLE", "SCHOLARS", "ACADEMY"];
    pinnacleDropTitle.innerHTML = '';
    
    let globalLetterIndex = 0;
    
    words.forEach((wordText, wordIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'intro-word';
        
        wordText.split('').forEach((char) => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'intro-letter';
            letterSpan.textContent = char;
            // Staggered drop delay per single letter
            letterSpan.style.animationDelay = `${globalLetterIndex * 0.065}s`;
            wordSpan.appendChild(letterSpan);
            globalLetterIndex++;
        });
        
        pinnacleDropTitle.appendChild(wordSpan);
    });
    
    const totalLettersCount = globalLetterIndex;
    const animationCompletionTime = (totalLettersCount * 65) + 550; // ~2.1 seconds
    
    // Stage 2: After all single letters drop and land at constant center place, illuminate the 3 words
    setTimeout(() => {
        pinnacleDropTitle.classList.add('title-revealed');
        if (pinnacleDropTagline) {
            pinnacleDropTagline.classList.add('visible');
        }
    }, animationCompletionTime);
    
    // Stage 3: Smoothly hide intro overlay and reveal the entire website cleanly
    setTimeout(() => {
        dismissWelcomeIntro();
        clearTimeout(autoDismissTimer);
    }, animationCompletionTime + 1800);

    function dismissWelcomeIntro() {
        if (!welcomeIntro) return;
        welcomeIntro.classList.add('hide');
        document.body.classList.remove('entry-active');
        document.body.style.overflow = 'auto';
        sessionStorage.setItem('pinnacleIntroPlayed', 'true');
        
        setTimeout(() => {
            welcomeIntro.style.display = 'none';
        }, 800);
    }
}