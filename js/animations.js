/**
 * LEADERS Summit 2025 - Alumni Networking
 * Animations Management Module
 * 
 * Handles all animation effects, transitions, and visual feedback
 */

class AnimationsManager {
    constructor(app) {
        this.app = app;
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isProcessingQueue = false;
        this.performanceMode = 'auto'; // 'high', 'medium', 'low', 'auto'
        this.viewport = { width: 0, height: 0 };
        this.connectionLines = [];
        this.particleSystems = new Map();
        
        // Animation settings
        this.settings = {
            enableParticles: true,
            enableConnections: true,
            enableMorphing: true,
            enableParallax: true,
            maxAnimations: 50,
            reducedMotion: false
        };
        
        this.init();
    }

    /**
     * Initialize animations manager
     */
    init() {
        this.detectPerformanceCapabilities();
        this.setupAnimationObserver();
        this.checkReducedMotionPreference();
        this.initializeBackgroundElements();
        this.startAnimationLoop();
        this.updateViewport();
    }

    /**
     * Detect performance capabilities
     */
    detectPerformanceCapabilities() {
        // Check device capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;
        
        // Check memory
        const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
        
        // Check CPU cores
        const cores = navigator.hardwareConcurrency || 4;
        
        // Determine performance mode
        if (memory >= 8 && cores >= 8 && hasWebGL) {
            this.performanceMode = 'high';
        } else if (memory >= 4 && cores >= 4) {
            this.performanceMode = 'medium';
        } else {
            this.performanceMode = 'low';
        }
        
        // Mobile detection
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.performanceMode = 'low';
        }
        
        console.log(`Performance mode: ${this.performanceMode}`);
        this.adjustSettingsForPerformance();
    }

    /**
     * Adjust settings based on performance
     */
    adjustSettingsForPerformance() {
        switch (this.performanceMode) {
            case 'low':
                this.settings.enableParticles = false;
                this.settings.enableConnections = false;
                this.settings.enableMorphing = false;
                this.settings.enableParallax = false;
                this.settings.maxAnimations = 10;
                break;
            case 'medium':
                this.settings.enableParticles = true;
                this.settings.enableConnections = false;
                this.settings.enableMorphing = false;
                this.settings.enableParallax = true;
                this.settings.maxAnimations = 25;
                break;
            case 'high':
                // All settings remain true
                break;
        }
    }

    /**
     * Setup animation performance observer
     */
    setupAnimationObserver() {
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measurePerformance = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Adjust performance if FPS drops
                if (fps < 30 && this.performanceMode !== 'low') {
                    this.degradePerformance();
                } else if (fps > 55 && this.performanceMode !== 'high') {
                    this.upgradePerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measurePerformance);
        };
        
        requestAnimationFrame(measurePerformance);
    }

    /**
     * Degrade performance settings
     */
    degradePerformance() {
        console.log('Degrading animation performance due to low FPS');
        
        switch (this.performanceMode) {
            case 'high':
                this.performanceMode = 'medium';
                this.settings.enableConnections = false;
                this.settings.enableMorphing = false;
                break;
            case 'medium':
                this.performanceMode = 'low';
                this.settings.enableParticles = false;
                this.settings.enableParallax = false;
                break;
        }
        
        this.adjustAnimationsForPerformance();
    }

    /**
     * Upgrade performance settings
     */
    upgradePerformance() {
        // Only upgrade if we've previously degraded
        if (this.performanceMode === 'low') {
            this.performanceMode = 'medium';
            this.settings.enableParticles = true;
            this.settings.enableParallax = true;
        } else if (this.performanceMode === 'medium') {
            this.performanceMode = 'high';
            this.settings.enableConnections = true;
            this.settings.enableMorphing = true;
        }
        
        this.adjustAnimationsForPerformance();
    }

    /**
     * Adjust running animations for performance
     */
    adjustAnimationsForPerformance() {
        // Remove or simplify existing animations
        if (!this.settings.enableParticles) {
            this.removeParticleEffects();
        }
        
        if (!this.settings.enableConnections) {
            this.removeConnectionLines();
        }
        
        if (!this.settings.enableMorphing) {
            this.removeMorphingShapes();
        }
    }

    /**
     * Check for reduced motion preference
     */
    checkReducedMotionPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.settings.reducedMotion = mediaQuery.matches;
            
            mediaQuery.addEventListener('change', (e) => {
                this.settings.reducedMotion = e.matches;
                this.adjustForReducedMotion();
            });
        }
        
        if (this.settings.reducedMotion) {
            this.adjustForReducedMotion();
        }
    }

    /**
     * Adjust animations for reduced motion
     */
    adjustForReducedMotion() {
        if (this.settings.reducedMotion) {
            // Disable most animations
            Object.keys(this.settings).forEach(key => {
                if (key.startsWith('enable')) {
                    this.settings[key] = false;
                }
            });
            
            // Add reduced motion class to body
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
            this.adjustSettingsForPerformance();
        }
    }

    /**
     * Initialize background animation elements
     */
    initializeBackgroundElements() {
        if (!this.settings.enableParticles) return;
        
        this.createFloatingParticles();
        
        if (this.settings.enableMorphing) {
            this.createMorphingShapes();
        }
    }

    /**
     * Create floating particle effects
     */
    createFloatingParticles() {
        const container = document.querySelector('.background-elements');
        if (!container) return;
        
        const particleCount = this.performanceMode === 'high' ? 12 : 6;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `bg-particle bg-particle-layer-${(i % 3) + 1}`;
            
            // Random position
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.left = `${Math.random() * 100}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 6}s`;
            
            // Random size
            const size = 2 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            container.appendChild(particle);
            
            // Store reference
            this.particleSystems.set(`particle_${i}`, particle);
        }
    }

    /**
     * Create morphing background shapes
     */
    createMorphingShapes() {
        const container = document.querySelector('.background-elements');
        if (!container) return;
        
        const shapeCount = 3;
        
        for (let i = 0; i < shapeCount; i++) {
            const shape = document.createElement('div');
            shape.className = 'morphing-shape';
            
            // Random position and size
            shape.style.top = `${10 + Math.random() * 80}%`;
            shape.style.left = `${10 + Math.random() * 80}%`;
            shape.style.width = `${80 + Math.random() * 120}px`;
            shape.style.height = `${80 + Math.random() * 100}px`;
            
            container.appendChild(shape);
        }
    }

    /**
     * Start main animation loop
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            this.processAnimationQueue();
            this.updateParallaxEffects();
            this.updateConnectionLines();
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Process animation queue
     */
    processAnimationQueue() {
        if (this.isProcessingQueue || this.animationQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        const animation = this.animationQueue.shift();
        if (animation) {
            this.executeAnimation(animation);
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Execute animation
     */
    executeAnimation(animation) {
        const { id, type, element, options } = animation;
        
        // Check if we're at max animations
        if (this.activeAnimations.size >= this.settings.maxAnimations) {
            return;
        }
        
        switch (type) {
            case 'cardEntrance':
                this.animateCardEntrance(element, options);
                break;
            case 'cardExit':
                this.animateCardExit(element, options);
                break;
            case 'cardHover':
                this.animateCardHover(element, options);
                break;
            case 'cardCluster':
                this.animateCardClustering(element, options);
                break;
            case 'connectionPulse':
                this.animateConnectionPulse(element, options);
                break;
            case 'searchPulse':
                this.animateSearchPulse(element, options);
                break;
            case 'notificationSlide':
                this.animateNotificationSlide(element, options);
                break;
        }
        
        // Store active animation
        this.activeAnimations.set(id, { type, element, options, timestamp: Date.now() });
    }

    /**
     * Animate card entrance
     */
    animateCardEntrance(element, options = {}) {
        if (this.settings.reducedMotion) {
            element.style.opacity = '1';
            return;
        }
        
        const { delay = 0, direction = 'up' } = options;
        
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = this.getEntranceTransform(direction);
        
        setTimeout(() => {
            element.classList.add('stagger-animation');
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translate3d(0, 0, 0) scale(1)';
            
            // Cleanup
            setTimeout(() => {
                element.classList.remove('stagger-animation');
                element.style.transition = '';
            }, 800);
        }, delay);
    }

    /**
     * Get entrance transform based on direction
     */
    getEntranceTransform(direction) {
        const transforms = {
            'up': 'translate3d(0, 30px, 0) scale(0.9)',
            'down': 'translate3d(0, -30px, 0) scale(0.9)',
            'left': 'translate3d(-30px, 0, 0) scale(0.9)',
            'right': 'translate3d(30px, 0, 0) scale(0.9)',
            'scale': 'translate3d(0, 0, 0) scale(0.8)'
        };
        return transforms[direction] || transforms['up'];
    }

    /**
     * Animate card exit
     */
    animateCardExit(element, options = {}) {
        if (this.settings.reducedMotion) {
            element.style.display = 'none';
            return;
        }
        
        const { direction = 'down', callback } = options;
        
        element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '0';
        element.style.transform = this.getExitTransform(direction);
        
        setTimeout(() => {
            if (callback) callback();
        }, 500);
    }

    /**
     * Get exit transform based on direction
     */
    getExitTransform(direction) {
        const transforms = {
            'up': 'translate3d(0, -30px, 0) scale(0.9)',
            'down': 'translate3d(0, 30px, 0) scale(0.9)',
            'left': 'translate3d(-30px, 0, 0) scale(0.9)',
            'right': 'translate3d(30px, 0, 0) scale(0.9)',
            'scale': 'translate3d(0, 0, 0) scale(0.8)'
        };
        return transforms[direction] || transforms['down'];
    }

    /**
     * Animate card hover effect
     */
    animateCardHover(element, options = {}) {
        if (this.settings.reducedMotion) return;
        
        const { isHovering = true } = options;
        
        if (isHovering) {
            element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.transform = 'translateY(-8px) rotateX(5deg) rotateY(2deg)';
            element.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            
            // Add glow effect
            if (this.performanceMode === 'high') {
                element.classList.add('hover-glow');
            }
        } else {
            element.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
            element.style.boxShadow = '';
            element.classList.remove('hover-glow');
        }
    }

    /**
     * Animate card clustering
     */
    animateCardClustering(element, options = {}) {
        if (this.settings.reducedMotion) {
            // Set final position immediately
            element.style.transform = `translate3d(${options.x}px, ${options.y}px, 0)`;
            return;
        }
        
        const { x, y, delay = 0, groupIndex = 0 } = options;
        
        setTimeout(() => {
            element.classList.add('card-clustering');
            element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            
            // Add magnetic effect for the same group
            if (this.settings.enableConnections && this.performanceMode === 'high') {
                element.classList.add('magnetic');
                
                setTimeout(() => {
                    element.classList.remove('magnetic');
                }, 2000);
            }
        }, delay);
    }

    /**
     * Animate connection pulse
     */
    animateConnectionPulse(element, options = {}) {
        if (!this.settings.enableConnections || this.settings.reducedMotion) return;
        
        element.classList.add('connection-success');
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'connection-ripple';
        element.appendChild(ripple);
        
        setTimeout(() => {
            element.classList.remove('connection-success');
            ripple.remove();
        }, 1000);
    }

    /**
     * Animate search pulse
     */
    animateSearchPulse(element, options = {}) {
        if (this.settings.reducedMotion) return;
        
        element.classList.add('search-pulse');
        
        setTimeout(() => {
            element.classList.remove('search-pulse');
        }, 1500);
    }

    /**
     * Animate notification slide
     */
    animateNotificationSlide(element, options = {}) {
        const { direction = 'in' } = options;
        
        if (this.settings.reducedMotion) {
            element.style.opacity = direction === 'in' ? '1' : '0';
            return;
        }
        
        if (direction === 'in') {
            element.classList.add('notification-enter');
        } else {
            element.classList.add('notification-exit');
        }
    }

    /**
     * Update parallax effects
     */
    updateParallaxEffects() {
        if (!this.settings.enableParallax || this.settings.reducedMotion) return;
        
        const scrollY = window.scrollY;
        const particles = document.querySelectorAll('.bg-particle');
        
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index % 3) * 0.2;
            const yPos = -(scrollY * speed);
            particle.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    /**
     * Update connection lines
     */
    updateConnectionLines() {
        if (!this.settings.enableConnections || this.settings.reducedMotion) return;
        
        const svg = document.getElementById('connection-lines');
        if (!svg) return;
        
        // Clear existing lines
        svg.innerHTML = '';
        
        // Draw connections between clustered cards
        const cards = document.querySelectorAll('.alumni-card.magnetic');
        const connections = this.calculateConnections(cards);
        
        connections.forEach(connection => {
            this.drawConnectionLine(svg, connection);
        });
    }

    /**
     * Calculate connections between cards
     */
    calculateConnections(cards) {
        const connections = [];
        const cardsArray = Array.from(cards);
        
        for (let i = 0; i < cardsArray.length; i++) {
            for (let j = i + 1; j < cardsArray.length; j++) {
                const card1 = cardsArray[i];
                const card2 = cardsArray[j];
                
                const distance = this.calculateDistance(card1, card2);
                
                // Only connect if cards are close enough
                if (distance < 200) {
                    connections.push({
                        card1,
                        card2,
                        distance,
                        opacity: Math.max(0.1, 1 - (distance / 200))
                    });
                }
            }
        }
        
        return connections;
    }

    /**
     * Calculate distance between two cards
     */
    calculateDistance(card1, card2) {
        const rect1 = card1.getBoundingClientRect();
        const rect2 = card2.getBoundingClientRect();
        
        const centerX1 = rect1.left + rect1.width / 2;
        const centerY1 = rect1.top + rect1.height / 2;
        const centerX2 = rect2.left + rect2.width / 2;
        const centerY2 = rect2.top + rect2.height / 2;
        
        return Math.sqrt(
            Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
        );
    }

    /**
     * Draw connection line
     */
    drawConnectionLine(svg, connection) {
        const { card1, card2, opacity } = connection;
        
        const rect1 = card1.getBoundingClientRect();
        const rect2 = card2.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - svgRect.left;
        const y1 = rect1.top + rect1.height / 2 - svgRect.top;
        const x2 = rect2.left + rect2.width / 2 - svgRect.left;
        const y2 = rect2.top + rect2.height / 2 - svgRect.top;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'connection-line');
        line.style.opacity = opacity;
        
        svg.appendChild(line);
    }

    /**
     * Queue animation
     */
    queueAnimation(animation) {
        if (this.animationQueue.length < 100) { // Prevent queue overflow
            this.animationQueue.push({
                id: `anim_${Date.now()}_${Math.random()}`,
                ...animation
            });
        }
    }

    /**
     * Trigger shake animation (for gesture)
     */
    triggerShakeAnimation() {
        const cards = document.querySelectorAll('.alumni-card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('shake-gesture');
                
                setTimeout(() => {
                    card.classList.remove('shake-gesture');
                }, 500);
            }, index * 50);
        });
    }

    /**
     * Update view animations
     */
    updateViewAnimations(view) {
        const container = this.app.elements.cardsContainer;
        if (!container) return;
        
        switch (view) {
            case 'clustering':
                this.enableClusteringAnimations();
                break;
            case 'cards':
                this.enableCardAnimations();
                break;
            case 'list':
                this.enableListAnimations();
                break;
        }
    }

    /**
     * Enable clustering animations
     */
    enableClusteringAnimations() {
        const cards = document.querySelectorAll('.alumni-card');
        
        cards.forEach((card, index) => {
            this.queueAnimation({
                type: 'cardCluster',
                element: card,
                options: {
                    delay: index * 100,
                    groupIndex: index % 4
                }
            });
        });
    }

    /**
     * Enable card animations
     */
    enableCardAnimations() {
        const cards = document.querySelectorAll('.alumni-card');
        
        cards.forEach((card, index) => {
            card.classList.remove('card-clustering');
            
            this.queueAnimation({
                type: 'cardEntrance',
                element: card,
                options: {
                    delay: index * 50,
                    direction: 'scale'
                }
            });
        });
    }

    /**
     * Enable list animations
     */
    enableListAnimations() {
        const items = document.querySelectorAll('.list-item');
        
        items.forEach((item, index) => {
            this.queueAnimation({
                type: 'cardEntrance',
                element: item,
                options: {
                    delay: index * 100,
                    direction: 'left'
                }
            });
        });
    }

    /**
     * Update viewport dimensions
     */
    updateViewport() {
        this.viewport.width = window.innerWidth;
        this.viewport.height = window.innerHeight;
    }

    /**
     * Remove particle effects
     */
    removeParticleEffects() {
        this.particleSystems.forEach(particle => {
            particle.remove();
        });
        this.particleSystems.clear();
    }

    /**
     * Remove connection lines
     */
    removeConnectionLines() {
        const svg = document.getElementById('connection-lines');
        if (svg) {
            svg.innerHTML = '';
        }
    }

    /**
     * Remove morphing shapes
     */
    removeMorphingShapes() {
        const shapes = document.querySelectorAll('.morphing-shape');
        shapes.forEach(shape => shape.remove());
    }

    /**
     * Create particle explosion effect
     */
    createParticleExplosion(x, y, color = '#F39C12') {
        if (!this.settings.enableParticles || this.settings.reducedMotion) return;
        
        const container = document.body;
        const particleCount = this.performanceMode === 'high' ? 20 : 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${x}px;
                top: ${y}px;
            `;
            
            container.appendChild(particle);
            
            // Animate particle
            const angle = (i / particleCount) * 2 * Math.PI;
            const velocity = 50 + Math.random() * 100;
            const finalX = x + Math.cos(angle) * velocity;
            const finalY = y + Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${finalX - x}px, ${finalY - y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    /**
     * Animate text typewriter effect
     */
    animateTypewriter(element, text, options = {}) {
        const { speed = 50, cursor = true } = options;
        
        if (this.settings.reducedMotion) {
            element.textContent = text;
            return;
        }
        
        element.textContent = '';
        if (cursor) {
            element.classList.add('typewriter-cursor');
        }
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent = text.slice(0, i + 1);
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
                if (cursor) {
                    setTimeout(() => {
                        element.classList.remove('typewriter-cursor');
                    }, 1000);
                }
            }
        }, speed);
    }

    /**
     * Create floating text effect
     */
    createFloatingText(text, x, y, options = {}) {
        const { color = '#F39C12', duration = 2000, fontSize = '14px' } = options;
        
        if (this.settings.reducedMotion) return;
        
        const element = document.createElement('div');
        element.textContent = text;
        element.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: ${fontSize};
            font-weight: 600;
            pointer-events: none;
            z-index: 9999;
            text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(element);
        
        element.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: 'translateY(-50px) scale(0.8)', opacity: 0 }
        ], {
            duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => {
            element.remove();
        };
    }

    /**
     * Get animation performance metrics
     */
    getPerformanceMetrics() {
        return {
            performanceMode: this.performanceMode,
            activeAnimations: this.activeAnimations.size,
            queuedAnimations: this.animationQueue.length,
            settings: { ...this.settings },
            particleSystems: this.particleSystems.size
        };
    }

    /**
     * Cleanup expired animations
     */
    cleanupExpiredAnimations() {
        const now = Date.now();
        const maxAge = 10000; // 10 seconds
        
        this.activeAnimations.forEach((animation, id) => {
            if (now - animation.timestamp > maxAge) {
                this.activeAnimations.delete(id);
            }
        });
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Clear animation queue
        this.animationQueue = [];
        
        // Remove active animations
        this.activeAnimations.clear();
        
        // Remove particle effects
        this.removeParticleEffects();
        
        // Remove connection lines
        this.removeConnectionLines();
        
        // Remove morphing shapes
        this.removeMorphingShapes();
        
        // Remove any temporary elements
        const tempElements = document.querySelectorAll('.explosion-particle, .connection-ripple');
        tempElements.forEach(el => el.remove());
    }
}