// Celestial Academy Intro Animation
// Character-by-character dropping effect with voice and background music

document.addEventListener('DOMContentLoaded', function() {
    const welcomeIntro = document.getElementById('welcomeIntro');
    const animatedTitle = document.getElementById('animatedTitle');
    
    if (!welcomeIntro || !animatedTitle) return;
    
    // Academy name for animation
    const academyName = "CELESTIAL ACADEMY";
    
    // Create character spans
    animatedTitle.innerHTML = '';
    academyName.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'intro-letter';
        span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
        span.style.animationDelay = `${index * 0.15}s`;
        animatedTitle.appendChild(span);
    });
    
    // Add letter drop animation class
    welcomeIntro.classList.add('premium-letter-intro');
    
    // Calculate animation completion time
    const animationTime = academyName.length * 150 + 1000;
    
    // Play voice and music after animation completes
    setTimeout(() => {
        playWelcomeVoice();
        playBackgroundMusic();
    }, animationTime);
    
    // Hide intro after voice starts playing
    setTimeout(() => {
        welcomeIntro.classList.add('hide');
        document.body.classList.remove('entry-active');
    }, animationTime + 2000); // Hide 2 seconds after voice starts
});

// Voice synthesis for welcome message
function playWelcomeVoice() {
    if ('speechSynthesis' in window) {
        const welcomeMessage = `
            Dear ladies and gentlemen.
            Welcome to Noida's Pinnacle Scholars Academy.
            Where excellence meets innovation,
            dreams become achievements,
            and future leaders are created.
            Empowering students with knowledge,
            discipline, and confidence.
            We are delighted to welcome you.
        `;
        
        const utterance = new SpeechSynthesisUtterance(welcomeMessage);
        utterance.rate = 0.85;
        utterance.pitch = 1.15;
        utterance.volume = 0.7;
        
        // Load voices first
        speechSynthesis.getVoices().then(voices => {
            // Try to find a female voice
            const femaleVoice = voices.find(voice => 
                voice.name.includes('female') || 
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Victoria') ||
                voice.name.includes('Google US English') ||
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Fiona')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            speechSynthesis.speak(utterance);
        }).catch(() => {
            // Fallback if voices promise fails
            speechSynthesis.speak(utterance);
        });
    }
}

// Background music functionality
function playBackgroundMusic() {
    // Create audio element for background music
    const bgMusic = new Audio('audio/elegant-background-music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    // Try to play, handle errors gracefully
    bgMusic.play().catch(e => {
        console.log('Background music:', e.message);
        // Create a simple oscillator-based ambient music as fallback
        createAmbientMusic();
        return;
    });
    
    // Store audio element globally so it can be controlled
    window.backgroundMusic = bgMusic;
    
    // Add music control button
    addMusicControl();
}

// Fallback ambient music using Web Audio API
function createAmbientMusic() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Store for control
        window.ambientMusic = {
            oscillator: oscillator,
            gainNode: gainNode,
            context: audioContext,
            isPlaying: true
        };
        
        // Add music control button
        addMusicControl();
        
    } catch (e) {
        console.log('Could not create ambient music:', e.message);
    }
}

// Add music control button to the page
function addMusicControl() {
    // Check if button already exists
    if (document.querySelector('.music-control-btn')) return;
    
    const musicControl = document.createElement('button');
    musicControl.innerHTML = '🔊';
    musicControl.className = 'music-control-btn';
    musicControl.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 28px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: linear-gradient(135deg, #7c3aed, #3b82f6);
        color: white;
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
    `;
    
    musicControl.addEventListener('click', function() {
        if (window.backgroundMusic) {
            if (window.backgroundMusic.paused) {
                window.backgroundMusic.play();
                this.innerHTML = '🔊';
            } else {
                window.backgroundMusic.pause();
                this.innerHTML = '🔇';
            }
        } else if (window.ambientMusic) {
            if (window.ambientMusic.isPlaying) {
                window.ambientMusic.gainNode.gain.setValueAtTime(0, window.ambientMusic.context.currentTime);
                window.ambientMusic.oscillator.stop();
                window.ambientMusic.isPlaying = false;
                this.innerHTML = '🔇';
            } else {
                // Restart ambient music
                createAmbientMusic();
                this.innerHTML = '🔊';
            }
        }
    });
    
    musicControl.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.1)';
    });
    
    musicControl.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    document.body.appendChild(musicControl);
}

// Ensure body has entry-active class for blur effect
document.body.classList.add('entry-active');