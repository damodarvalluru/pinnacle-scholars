/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - FACULTY PORTAL NEON BACKGROUND
   Vertical Neon Light Lines - Upward Flow Animation Controller
   Bottom → Upward Flow → Along Curved Neon Lines → Bright Traveling Shine
   ========================================================================== */

class FacultyNeonBackground {
    constructor() {
        this.container = null;
        this.neonContainer = null;
        this.lines = [];
        this.animationFrame = null;
        this.lastTime = 0;
        this.isInitialized = false;
        this.centerX = window.innerWidth / 2;
    }

    init() {
        if (this.isInitialized) return;

        // Create main background container
        this.container = document.createElement('div');
        this.container.className = 'faculty-neon-background';
        document.body.appendChild(this.container);

        // Create base background
        this.createBaseBackground();

        // Create neon container
        this.createNeonContainer();

        // Create central convergence glow
        this.createConvergenceGlow();

        // Create dark readability zone
        this.createReadabilityZone();

        // Create vertical neon lines
        this.createNeonLines(50);

        // Add light streaks
        this.createLightStreaks(20);

        this.isInitialized = true;
        this.startAnimation();
    }

    createBaseBackground() {
        const base = document.createElement('div');
        base.className = 'faculty-background-base';
        this.container.appendChild(base);
    }

    createNeonContainer() {
        this.neonContainer = document.createElement('div');
        this.neonContainer.className = 'faculty-neon-container';
        this.container.appendChild(this.neonContainer);
    }

    createConvergenceGlow() {
        const glow = document.createElement('div');
        glow.className = 'faculty-convergence-glow';
        this.container.appendChild(glow);
    }

    createReadabilityZone() {
        const zone = document.createElement('div');
        zone.className = 'faculty-readability-zone';
        this.container.appendChild(zone);
    }

    createNeonLines(count) {
        const colors = ['blue', 'cyan', 'purple', 'pink', 'red'];
        const colorWeights = [0.25, 0.25, 0.2, 0.15, 0.15]; // Balanced distribution

        for (let i = 0; i < count; i++) {
            const line = document.createElement('div');
            
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

            line.className = `faculty-neon-line ${colors[colorIndex]}`;
            
            // Calculate position (more lines toward center for convergence effect)
            const centerX = window.innerWidth / 2;
            const spread = window.innerWidth * 0.8;
            const position = (Math.random() - 0.5) * spread + centerX;
            
            // Initialize line properties
            const lineData = {
                element: line,
                x: position,
                bottom: -Math.random() * 200, // Start below viewport
                height: 100 + Math.random() * 300, // Variable height
                speed: 1.0 + Math.random() * 2.5, // Different speeds for depth
                width: 1.5 + Math.random() * 2.5,
                opacity: 0.3 + Math.random() * 0.7,
                convergenceOffset: (position - centerX) / centerX, // Convergence toward center
                layer: Math.floor(Math.random() * 3) // 3 layers for depth
            };

            // Apply initial styles
            line.style.left = `${lineData.x}px`;
            line.style.width = `${lineData.width}px`;
            line.style.height = `${lineData.height}px`;
            line.style.opacity = lineData.opacity;

            // Add upward shine effect
            const shine = document.createElement('div');
            shine.className = 'faculty-upward-shine';
            shine.style.animationDelay = `${Math.random() * 4}s`;
            shine.style.animationDuration = `${3 + Math.random() * 3}s`;
            line.appendChild(shine);

            // Add bright pulse effect occasionally
            if (Math.random() > 0.5) {
                const pulse = document.createElement('div');
                pulse.className = 'faculty-bright-pulse';
                pulse.style.animationDelay = `${Math.random() * 3}s`;
                pulse.style.animationDuration = `${2 + Math.random() * 2}s`;
                line.appendChild(pulse);
            }

            // Add neon flicker effect occasionally
            if (Math.random() > 0.7) {
                line.classList.add('faculty-neon-flicker');
            }

            // Add glow pulse effect occasionally
            if (Math.random() > 0.6) {
                line.classList.add('faculty-glow-pulse');
            }

            this.neonContainer.appendChild(line);
            this.lines.push(lineData);
        }
    }

    createLightStreaks(count) {
        for (let i = 0; i < count; i++) {
            const streak = document.createElement('div');
            streak.className = 'faculty-light-streak';
            
            // Random position
            streak.style.left = `${Math.random() * 100}%`;
            streak.style.animationDelay = `${Math.random() * 6}s`;
            streak.style.animationDuration = `${4 + Math.random() * 4}s`;
            
            this.container.appendChild(streak);
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const deltaTime = timestamp - this.lastTime;

            // Update neon lines
            this.updateNeonLines(deltaTime);

            this.lastTime = timestamp;
            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    updateNeonLines(deltaTime) {
        const centerX = window.innerWidth / 2;
        const viewportHeight = window.innerHeight;

        this.lines.forEach(lineData => {
            // Move line upward
            lineData.bottom += lineData.speed * (deltaTime / 16);

            // Reset line when it goes off top
            if (lineData.bottom > viewportHeight + 100) {
                lineData.bottom = -100 - Math.random() * 200;
                lineData.x = (Math.random() - 0.5) * (window.innerWidth * 0.8) + centerX;
                lineData.height = 100 + Math.random() * 300;
            }

            // Calculate convergence effect (lines curve toward center as they go up)
            const convergenceFactor = lineData.bottom / viewportHeight;
            const curvedX = lineData.x + (lineData.convergenceOffset * convergenceFactor * 100);

            // Apply transforms
            lineData.element.style.left = `${curvedX}px`;
            lineData.element.style.bottom = `${lineData.bottom}px`;

            // Calculate scale based on position (higher = smaller for perspective)
            const scale = Math.max(0.5, 1 - convergenceFactor * 0.5);
            lineData.element.style.transform = `scale(${scale})`;

            // Update opacity based on position
            const heightFactor = Math.max(0, 1 - lineData.bottom / (viewportHeight + 200));
            lineData.element.style.opacity = lineData.opacity * heightFactor;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.lines = [];
        this.isInitialized = false;
    }
}

// Initialize when DOM is ready
let facultyBackground = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on faculty portal page
    if (window.location.pathname.includes('faculty-portal')) {
        facultyBackground = new FacultyNeonBackground();
        facultyBackground.init();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (facultyBackground) {
        facultyBackground.destroy();
    }
});