// Pinnacle Scholars Academy - Career AI Visual System & Letter Drop Intro
document.addEventListener('DOMContentLoaded', function() {
    initPinnacleLetterDropIntro();
});

function initPinnacleLetterDropIntro() {
    const welcomeIntro = document.getElementById('welcomeIntro');
    const pinnacleDropTitle = document.getElementById('pinnacleDropTitle');
    
    if (!welcomeIntro || !pinnacleDropTitle) return;

    // Guaranteed safety timeout to ensure website always appears cleanly
    const autoDismissTimer = setTimeout(() => {
        dismissWelcomeIntro();
    }, 4500);
    
    // Check if intro was already shown in this tab session
    if (sessionStorage.getItem('pinnacleIntroPlayed') === 'true') {
        welcomeIntro.style.display = 'none';
        welcomeIntro.classList.add('is-complete', 'hide');
        document.body.classList.remove('entry-active');
        document.body.style.overflow = 'auto';
        clearTimeout(autoDismissTimer);
        return;
    }
    
    document.body.classList.add('entry-active');
    
    // The 3 words of Pinnacle Scholars Academy to drop letter by letter
    const words = ["PINNACLE", "SCHOLARS", "ACADEMY"];
    pinnacleDropTitle.innerHTML = '';
    
    let letterDelay = 0.15;
    
    words.forEach((wordText, wordIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'intro-word' + (wordIdx === 2 ? ' intro-word-accent' : '');
        
        wordText.split('').forEach((char) => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'intro-letter-span';
            letterSpan.textContent = char;
            letterSpan.style.animationDelay = `${letterDelay.toFixed(2)}s`;
            wordSpan.appendChild(letterSpan);
            letterDelay += 0.07;
        });
        
        pinnacleDropTitle.appendChild(wordSpan);
        
        if (wordIdx < words.length - 1) {
            const spaceEm = document.createElement('em');
            spaceEm.className = 'intro-word-space';
            pinnacleDropTitle.appendChild(spaceEm);
            letterDelay += 0.12;
        }
    });

    // Complete intro at 3.6 seconds (matching Career AI duration)
    setTimeout(() => {
        dismissWelcomeIntro();
        clearTimeout(autoDismissTimer);
    }, 3600);

    function dismissWelcomeIntro() {
        if (!welcomeIntro) return;
        welcomeIntro.classList.add('is-complete', 'hide');
        document.body.classList.remove('entry-active');
        document.body.style.overflow = 'auto';
        sessionStorage.setItem('pinnacleIntroPlayed', 'true');
        
        setTimeout(() => {
            welcomeIntro.style.display = 'none';
        }, 700);
    }
}