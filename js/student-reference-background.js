/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - STUDENT PORTAL REFERENCE IMAGE BACKGROUND
   Animated Particle Overlay - Diagonal Movement (Bottom-Left to Top-Right)
   Makes the Reference Image Come Alive
   ========================================================================== */

class StudentReferenceBackground {
    constructor() {
        this.container = null;
        this.particleOverlay = null;
        this.particles = [];
        this.animationFrame = null;
        this.lastTime = 0;
        this.isInitialized = false;
        this.respectsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init() {
        if (this.isInitialized) return;

        // Create main background container
        this.container = document.createElement('div');
        this.container.className = 'student-reference-background';
        document.body.appendChild(this.container);

        // Create static reference image background
        this.createReferenceImage();

        // Create reference base
        this.createReferenceBase();

        // Create particle overlay
        this.createParticleOverlay();

        // Create dark readability zone
        this.createReadabilityZone();

        // Create static pulsing stars
        this.createStaticStars(30);

        // Create diagonal moving particles
        this.createDiagonalParticles(40);

        // Create diagonal light trails
        this.createDiagonalTrails(8);

        // Create shooting stars
        this.createShootingStars(4);

        // Create glowing orbs
        this.createGlowingOrbs(10);

        this.isInitialized = true;
        
        // Only start animation if user doesn't prefer reduced motion
        if (!this.respectsReducedMotion) {
            this.startAnimation();
        }
    }

    createReferenceImage() {
        const referenceImage = document.createElement('div');
        referenceImage.className = 'student-reference-image';
        this.container.appendChild(referenceImage);
    }

    createReferenceBase() {
        const referenceBase = document.createElement('div');
        referenceBase.className = 'student-reference-base';
        this.container.appendChild(referenceBase);
    }

    createParticleOverlay() {
        this.particleOverlay = document.createElement('div');
        this.particleOverlay.className = 'student-particle-overlay';
        this.container.appendChild(this.particleOverlay);
    }

    createReadabilityZone() {
        const zone = document.createElement('div');
        zone.className = 'student-readability-zone';
        this.container.appendChild(zone);
    }

    createStaticStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            const size = Math.random();
            
            if (size > 0.7) {
                star.className = 'student-static-star large';
            } else if (size > 0.3) {
                star.className = 'student-static-star';
            } else {
                star.className = 'student-static-star small';
            }

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${2 + Math.random() * 2}s`;

            this.particleOverlay.appendChild(star);
        }
    }

    createDiagonalParticles(count) {
        const colors = ['cyan', 'blue', 'white'];
        const colorWeights = [0.4, 0.4, 0.2]; // Cyan and blue dominant

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            
            // Select color based on weights
            const random = Math.random();
            let colorIndex = 0;
            let cumulative = 0;
            for (let j = 0; j < colorWeights.length; j++) {
                cumulative += colorWeights[j];
                if (random <= cumulative) {
                    colorIndex = j;
                    break;
                }
            }

            particle.className = `student-diagonal-particle ${colors[colorIndex]}`;
            
            // Initialize particle properties for diagonal movement (bottom-left to top-right)
            const particleData = {
                element: particle,
                x: Math.random() * window.innerWidth * 0.5, // Start on left side
                y: window.innerHeight + Math.random() * 100, // Start below viewport
                speed: 0.3 + Math.random() * 0.8, // Diagonal speed
                size: 1.5 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7,
                shimmer: Math.random() > 0.5 // Some particles shimmer
            };

            // Apply initial styles
            particle.style.width = `${particleData.size}px`;
            particle.style.height = `${particleData.size}px`;
            particle.style.opacity = particleData.opacity;

            // Add shimmer effect to some particles
            if (particleData.shimmer) {
                const shimmer = document.createElement('div');
                shimmer.className = 'student-shimmer';
                shimmer.style.animationDelay = `${Math.random() * 2}s`;
                shimmer.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
                particle.appendChild(shimmer);
            }

            this.particleOverlay.appendChild(particle);
            this.particles.push(particleData);
        }
    }

    createDiagonalTrails(count) {
        for (let i = 0; i < count; i++) {
            const trail = document.createElement('div');
            trail.className = 'student-diagonal-trail';
            
            // Initialize trail properties
            const trailData = {
                element: trail,
                x: Math.random() * window.innerWidth * 0.3,
                y: window.innerHeight + Math.random() * 150,
                speed: 0.5 + Math.random() * 1.0,
                width: 60 + Math.random() * 40,
                opacity: 0.2 + Math.random() * 0.4
            };

            trail.style.width = `${trailData.width}px`;
            trail.style.opacity = trailData.opacity;

            this.particleOverlay.appendChild(trail);
            this.particles.push(trailData);
        }
    }

    createShootingStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'student-shooting-star';
            
            // Initialize shooting star properties
            const starData = {
                element: star,
                x: Math.random() * window.innerWidth * 0.4,
                y: window.innerHeight + Math.random() * 200,
                speed: 1.5 + Math.random() * 2.0,
                width: 50 + Math.random() * 30,
                opacity: 0.5 + Math.random() * 0.5
            };

            star.style.width = `${starData.width}px`;
            star.style.opacity = starData.opacity;

            this.particleOverlay.appendChild(star);
            this.particles.push(starData);
        }
    }

    createGlowingOrbs(count) {
        for (let i = 0; i < count; i++) {
            const orb = document.createElement('div');
            const size = Math.random();

            if (size > 0.6) {
                orb.className = 'student-glowing-orb large';
            } else if (size > 0.3) {
                orb.className = 'student-glowing-orb medium';
            } else {
                orb.className = 'student-glowing-orb small';
            }

            orb.style.left = `${Math.random() * 100}%`;
            orb.style.top = `${Math.random() * 100}%`;
            orb.style.animationDelay = `${Math.random() * 4}s`;
            orb.style.animationDuration = `${2 + Math.random() * 2}s`;

            this.particleOverlay.appendChild(orb);
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const deltaTime = timestamp - this.lastTime;

            // Update diagonal particles
            this.updateDiagonalParticles(deltaTime);

            this.lastTime = timestamp;
            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    updateDiagonalParticles(deltaTime) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        this.particles.forEach(particleData => {
            // Move particle diagonally (bottom-left to top-right)
            particleData.x += particleData.speed * (deltaTime / 16);
            particleData.y -= particleData.speed * (deltaTime / 16);

            // Reset particle when it goes off top-right
            if (particleData.x > viewportWidth + 100 || particleData.y < -100) {
                particleData.x = Math.random() * viewportWidth * 0.3; // Reset to left side
                particleData.y = viewportHeight + Math.random() * 100; // Reset below viewport
            }

            // Apply position
            particleData.element.style.left = `${particleData.x}px`;
            particleData.element.style.top = `${particleData.y}px`;

            // Update opacity based on position (fade in/out)
            const fadeInProgress = Math.min(1, (viewportHeight - particleData.y) / 100);
            const fadeOutProgress = Math.max(0, 1 - particleData.x / (viewportWidth - 100));
            particleData.element.style.opacity = particleData.opacity * fadeInProgress * fadeOutProgress;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.particles = [];
        this.isInitialized = false;
    }
}

// Initialize when DOM is ready
let studentReferenceBackground = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on student portal page
    if (window.location.pathname.includes('student-portal')) {
        studentReferenceBackground = new StudentReferenceBackground();
        studentReferenceBackground.init();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (studentReferenceBackground) {
        studentReferenceBackground.destroy();
    }
});