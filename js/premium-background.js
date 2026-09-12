/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - PREMIUM STUDENT PORTAL BACKGROUND
   Neon Tunnel Light Trail Animation Controller
   Outer Edges → Curved Neon Trails → Central Vanishing Point
   Continuous Forward-Flow Effect
   ========================================================================== */

class PremiumNeonTunnelBackground {
    constructor() {
        this.container = null;
        this.tunnelContainer = null;
        this.trails = [];
        this.animationFrame = null;
        this.lastTime = 0;
        this.isInitialized = false;
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    }

    init() {
        if (this.isInitialized) return;

        // Create main background container
        this.container = document.createElement('div');
        this.container.className = 'premium-portal-background';
        document.body.appendChild(this.container);

        // Create static base background
        this.createBaseBackground();

        // Create central vanishing point
        this.createVanishingPoint();

        // Create tunnel container for 3D effect
        this.createTunnelContainer();

        // Create dark readability zone
        this.createReadabilityZone();

        // Create neon light trails
        this.createNeonTrails(40);

        // Add light streaks
        this.createLightStreaks(15);

        this.isInitialized = true;
        this.startAnimation();
    }

    createBaseBackground() {
        const base = document.createElement('div');
        base.className = 'premium-background-base';
        this.container.appendChild(base);
    }

    createVanishingPoint() {
        const vanishingPoint = document.createElement('div');
        vanishingPoint.className = 'premium-vanishing-point';
        this.container.appendChild(vanishingPoint);
    }

    createTunnelContainer() {
        this.tunnelContainer = document.createElement('div');
        this.tunnelContainer.className = 'premium-tunnel-container';
        this.container.appendChild(this.tunnelContainer);
    }

    createReadabilityZone() {
        const zone = document.createElement('div');
        zone.className = 'premium-readability-zone';
        this.container.appendChild(zone);
    }

    createNeonTrails(count) {
        const colors = ['blue', 'cyan', 'green', 'magenta'];
        const colorWeights = [0.4, 0.3, 0.15, 0.15]; // Blue/cyan dominant

        for (let i = 0; i < count; i++) {
            const trail = document.createElement('div');
            
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

            trail.className = `premium-neon-trail ${colors[colorIndex]}`;
            
            // Initialize trail properties
            const trailData = {
                element: trail,
                angle: Math.random() * Math.PI * 2,
                distance: 400 + Math.random() * 350, // Start from outer edges
                speed: 0.8 + Math.random() * 2.0, // Different speeds for layers
                width: 2 + Math.random() * 4,
                opacity: 0.4 + Math.random() * 0.6,
                layer: Math.floor(Math.random() * 3) // 3 layers for depth
            };

            // Apply initial styles
            trail.style.width = `${trailData.width}px`;
            trail.style.height = `${trailData.width}px`;
            trail.style.opacity = trailData.opacity;

            // Add shine effect
            const shine = document.createElement('div');
            shine.className = 'premium-shine-effect';
            shine.style.animationDelay = `${Math.random() * 3}s`;
            shine.style.animationDuration = `${2 + Math.random() * 2}s`;
            trail.appendChild(shine);

            // Add bright pulse effect occasionally
            if (Math.random() > 0.6) {
                const pulse = document.createElement('div');
                pulse.className = 'premium-bright-pulse';
                pulse.style.animationDelay = `${Math.random() * 2}s`;
                pulse.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
                trail.appendChild(pulse);
            }

            this.tunnelContainer.appendChild(trail);
            this.trails.push(trailData);
        }
    }

    createLightStreaks(count) {
        for (let i = 0; i < count; i++) {
            const streak = document.createElement('div');
            streak.className = 'premium-light-streak';
            
            // Random position
            streak.style.left = `${Math.random() * 100}%`;
            streak.style.top = `${Math.random() * 100}%`;
            streak.style.animationDelay = `${Math.random() * 5}s`;
            streak.style.animationDuration = `${3 + Math.random() * 4}s`;
            
            this.container.appendChild(streak);
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const deltaTime = timestamp - this.lastTime;

            // Update neon trails
            this.updateNeonTrails(deltaTime);

            this.lastTime = timestamp;
            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    updateNeonTrails(deltaTime) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.trails.forEach(trailData => {
            // Move trail toward center
            trailData.distance -= trailData.speed * (deltaTime / 16);

            // Reset trail when it reaches center
            if (trailData.distance < 20) {
                trailData.distance = 500 + Math.random() * 300;
                trailData.angle = Math.random() * Math.PI * 2;
            }

            // Calculate position based on distance and angle
            const x = centerX + Math.cos(trailData.angle) * trailData.distance;
            const y = centerY + Math.sin(trailData.angle) * trailData.distance;

            // Calculate scale based on distance (closer = larger)
            const scale = Math.max(0.5, 1 - trailData.distance / 800);

            // Apply transforms
            trailData.element.style.left = `${x}px`;
            trailData.element.style.top = `${y}px`;
            trailData.element.style.transform = `translate(-50%, -50%) scale(${scale})`;

            // Update opacity based on distance
            const distanceFactor = Math.max(0, 1 - trailData.distance / 600);
            trailData.element.style.opacity = trailData.opacity * distanceFactor;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.trails = [];
        this.isInitialized = false;
    }
}

// Initialize when DOM is ready
let premiumBackground = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on student portal page
    if (window.location.pathname.includes('student-portal')) {
        premiumBackground = new PremiumNeonTunnelBackground();
        premiumBackground.init();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (premiumBackground) {
        premiumBackground.destroy();
    }
});