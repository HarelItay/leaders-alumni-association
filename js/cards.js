/**
 * LEADERS Summit 2025 - Alumni Networking
 * Cards Management Module
 * 
 * Handles rendering, positioning, and interaction of alumni cards
 */

class AlumniCardsManager {
    constructor(app) {
        this.app = app;
        this.container = app.elements.cardsContainer;
        this.cards = new Map(); // Store card elements by alumni ID
        this.cardPositions = new Map(); // Store card positions
        this.clustering = false;
        this.viewport = { width: 0, height: 0 };
        this.cardDimensions = { width: 280, height: 360 };
        this.animationFrameId = null;
        this.intersectionObserver = null;
        
        this.init();
    }

    /**
     * Initialize the cards manager
     */
    init() {
        this.updateViewport();
        this.setupIntersectionObserver();
        this.setupCardInteractions();
        this.renderCards(this.app.filteredData);
    }

    /**
     * Setup intersection observer for performance optimization
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        const card = entry.target;
                        if (entry.isIntersecting) {
                            card.classList.add('in-viewport');
                            this.loadCardImage(card);
                        } else {
                            card.classList.remove('in-viewport');
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: '50px',
                    threshold: 0.1
                }
            );
        }
    }

    /**
     * Setup card interaction handlers
     */
    setupCardInteractions() {
        if (!this.container) return;

        // Delegate click events
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.alumni-card');
            if (card) {
                this.handleCardClick(card, e);
            }
        });

        // Delegate hover events for better performance
        this.container.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.alumni-card');
            if (card) {
                this.handleCardHover(card, true);
            }
        }, true);

        this.container.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.alumni-card');
            if (card) {
                this.handleCardHover(card, false);
            }
        }, true);

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            const card = e.target.closest('.alumni-card');
            if (card && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.handleCardClick(card, e);
            }
        });
    }

    /**
     * Render all cards
     */
    renderCards(data) {
        if (!this.container) return;

        // Clear existing cards
        this.clearCards();

        // Create cards with staggered animation
        data.forEach((alumni, index) => {
            setTimeout(() => {
                this.createCard(alumni, index);
            }, index * 50); // Stagger by 50ms
        });

        // Update layout after all cards are created
        setTimeout(() => {
            this.updateLayout();
        }, data.length * 50 + 100);
    }

    /**
     * Create a single alumni card
     */
    createCard(alumni, index) {
        const card = document.createElement('div');
        card.className = 'alumni-card gpu-accelerated will-change-transform';
        card.setAttribute('data-alumni-id', alumni.id);
        card.setAttribute('data-industry', alumni.professional?.industry || 'other');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${alumni.personal?.name}`);

        // Set initial position
        const position = this.calculateInitialPosition(index, alumni);
        this.setCardPosition(card, position);
        this.cardPositions.set(alumni.id, position);

        // Create card content
        card.innerHTML = this.generateCardHTML(alumni);

        // Add entrance animation class
        const entranceClass = `card-entrance-${(index % 5) + 1}`;
        card.classList.add(entranceClass);

        // Add to container
        this.container.appendChild(card);

        // Store reference
        this.cards.set(alumni.id, { element: card, data: alumni });

        // Setup intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(card);
        }

        // Load image if visible
        this.loadCardImage(card);

        return card;
    }

    /**
     * Generate HTML content for a card
     */
    generateCardHTML(alumni) {
        const personal = alumni.personal || {};
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};
        const summit = alumni.summit_2025 || {};

        return `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-header">
                        <div class="profile-photo" data-photo="${personal.photo || '👤'}">
                            ${personal.photo || '👤'}
                        </div>
                    </div>
                    <div class="card-body">
                        <h3 class="alumni-name">${personal.name || 'Anonymous'}</h3>
                        <p class="graduation-year">Class of ${personal.graduation_year || 'Unknown'}</p>
                        <p class="current-role">${professional.current_role || 'Professional'}</p>
                        <p class="company-name">${professional.company || 'Company'}</p>
                        <div class="location">
                            <span class="location-icon">📍</span>
                            <span>${personal.location?.city || 'Location'}, ${personal.location?.country || ''}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="expertise-tags">
                            ${this.generateExpertiseTags(professional.expertise_tags || [])}
                        </div>
                        <div class="card-status">
                            <div class="availability-status">
                                <span class="status-dot ${networking.availability || 'offline'}"></span>
                                <span>${this.getAvailabilityText(networking.availability)}</span>
                            </div>
                            ${summit.attending ? '<span class="summit-badge">Summit 2025</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    ${this.generateCardBackHTML(alumni)}
                </div>
            </div>
        `;
    }

    /**
     * Generate expertise tags HTML
     */
    generateExpertiseTags(tags) {
        return tags.slice(0, 3).map(tag => 
            `<span class="expertise-tag">${tag}</span>`
        ).join('');
    }

    /**
     * Get availability status text
     */
    getAvailabilityText(availability) {
        switch (availability) {
            case 'available': return 'Available';
            case 'busy': return 'Busy';
            case 'offline': return 'Offline';
            default: return 'Unknown';
        }
    }

    /**
     * Generate card back HTML (detailed view)
     */
    generateCardBackHTML(alumni) {
        const personal = alumni.personal || {};
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};
        const summit = alumni.summit_2025 || {};

        return `
            <div class="card-back-content">
                <h4>${personal.name}</h4>
                <div class="detailed-info">
                    <div class="info-section">
                        <h5>Professional</h5>
                        <p><strong>Role:</strong> ${professional.current_role || 'Not specified'}</p>
                        <p><strong>Company:</strong> ${professional.company || 'Not specified'}</p>
                        <p><strong>Industry:</strong> ${this.formatIndustry(professional.industry)}</p>
                        <p><strong>Experience:</strong> ${this.formatExperience(professional.experience_level)}</p>
                    </div>
                    <div class="info-section">
                        <h5>Networking</h5>
                        <p><strong>Goals:</strong> ${this.formatArray(networking.goals)}</p>
                        <p><strong>Offering:</strong> ${this.formatArray(networking.offering)}</p>
                        <p><strong>Available:</strong> ${this.getAvailabilityText(networking.availability)}</p>
                    </div>
                    ${summit.attending ? `
                    <div class="info-section">
                        <h5>Summit 2025</h5>
                        <p><strong>Attending:</strong> Yes</p>
                        <p><strong>Arrival:</strong> ${summit.arrival_date || 'TBD'}</p>
                        <p><strong>Sessions:</strong> ${this.formatArray(summit.sessions_attending)}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-connect" data-action="connect">Connect</button>
                    <button class="btn-message" data-action="message">Message</button>
                    <button class="btn-qr" data-action="qr">QR Code</button>
                </div>
            </div>
        `;
    }

    /**
     * Format industry name
     */
    formatIndustry(industry) {
        if (!industry) return 'Not specified';
        return industry.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Format experience level
     */
    formatExperience(level) {
        const levels = {
            'junior': 'Junior (0-2 years)',
            'mid': 'Mid-Level (2-5 years)',
            'senior': 'Senior (5+ years)'
        };
        return levels[level] || 'Not specified';
    }

    /**
     * Format array for display
     */
    formatArray(arr) {
        if (!arr || !Array.isArray(arr) || arr.length === 0) {
            return 'None specified';
        }
        return arr.join(', ');
    }

    /**
     * Calculate initial position for a card
     */
    calculateInitialPosition(index, alumni) {
        if (window.innerWidth < 992) {
            // Use static positioning on smaller screens
            return { x: 0, y: 0, static: true };
        }

        const cols = Math.floor(this.viewport.width / (this.cardDimensions.width + 20));
        const rows = Math.floor(this.viewport.height / (this.cardDimensions.height + 20));
        
        // Grid-based positioning with some randomness
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = col * (this.cardDimensions.width + 20) + Math.random() * 40 - 20;
        const y = row * (this.cardDimensions.height + 20) + Math.random() * 40 - 20;
        
        return {
            x: Math.max(0, Math.min(x, this.viewport.width - this.cardDimensions.width)),
            y: Math.max(0, Math.min(y, this.viewport.height - this.cardDimensions.height)),
            static: false
        };
    }

    /**
     * Set card position
     */
    setCardPosition(card, position) {
        if (position.static) {
            card.style.position = 'static';
            card.style.transform = 'none';
        } else {
            card.style.position = 'absolute';
            card.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
            card.style.setProperty('--target-x', `${position.x}px`);
            card.style.setProperty('--target-y', `${position.y}px`);
        }
    }

    /**
     * Handle card click
     */
    handleCardClick(card, event) {
        const action = event.target.dataset.action;
        const alumniId = card.dataset.alumniId;
        const cardData = this.cards.get(alumniId);

        if (action) {
            this.handleCardAction(action, cardData?.data);
        } else if (event.target.closest('.card-front')) {
            this.flipCard(card);
        } else if (event.target.closest('.card-back')) {
            // Handle back side interactions
            this.showDetailModal(cardData?.data);
        }

        // Add click feedback
        this.addClickFeedback(card, event);
    }

    /**
     * Handle card actions
     */
    handleCardAction(action, alumni) {
        switch (action) {
            case 'connect':
                this.handleConnect(alumni);
                break;
            case 'message':
                this.handleMessage(alumni);
                break;
            case 'qr':
                this.showQRCode(alumni);
                break;
        }
    }

    /**
     * Handle connect action
     */
    handleConnect(alumni) {
        // Simulate connection
        this.app.showNotification('success', 'Connected!', 
            `Connection request sent to ${alumni.personal?.name}`);
        
        // Add connection animation
        const card = this.cards.get(alumni.id)?.element;
        if (card) {
            card.classList.add('connection-success');
            setTimeout(() => {
                card.classList.remove('connection-success');
            }, 1000);
        }
    }

    /**
     * Handle message action
     */
    handleMessage(alumni) {
        // Show messaging interface
        this.showMessageModal(alumni);
    }

    /**
     * Show QR code
     */
    showQRCode(alumni) {
        const qrContent = `
            <div class="qr-code-modal">
                <h3>Connect with ${alumni.personal?.name}</h3>
                <div class="qr-code">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <rect width="200" height="200" fill="white"/>
                        ${this.generateQRPattern(alumni.id)}
                    </svg>
                </div>
                <p>Scan with your camera to exchange contact information</p>
            </div>
        `;
        this.app.showModal('QR Code', qrContent);
    }

    /**
     * Generate QR pattern (simplified)
     */
    generateQRPattern(id) {
        // Simple pattern generation for demonstration
        let pattern = '';
        const hash = this.simpleHash(id);
        
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if ((hash + i * j) % 3 === 0) {
                    pattern += `<rect x="${i * 10}" y="${j * 10}" width="10" height="10" fill="black"/>`;
                }
            }
        }
        return pattern;
    }

    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Show message modal
     */
    showMessageModal(alumni) {
        const content = `
            <div class="message-modal">
                <h3>Message ${alumni.personal?.name}</h3>
                <form class="message-form">
                    <div class="form-group">
                        <label for="message-subject">Subject</label>
                        <input type="text" id="message-subject" placeholder="Meeting request" required>
                    </div>
                    <div class="form-group">
                        <label for="message-body">Message</label>
                        <textarea id="message-body" rows="6" 
                                placeholder="Hi ${alumni.personal?.name}, I'd love to connect and discuss..." 
                                required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="alumniApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Send Message</button>
                    </div>
                </form>
            </div>
        `;
        this.app.showModal('Send Message', content);
    }

    /**
     * Show detailed modal
     */
    showDetailModal(alumni) {
        const content = `
            <div class="detail-modal">
                <div class="detail-header">
                    <div class="detail-photo">${alumni.personal?.photo || '👤'}</div>
                    <div class="detail-info">
                        <h2>${alumni.personal?.name}</h2>
                        <p class="detail-role">${alumni.professional?.current_role} at ${alumni.professional?.company}</p>
                        <p class="detail-location">📍 ${alumni.personal?.location?.city}, ${alumni.personal?.location?.country}</p>
                    </div>
                </div>
                <div class="detail-body">
                    ${this.generateDetailedInfo(alumni)}
                </div>
                <div class="detail-actions">
                    <button class="btn-connect" onclick="alumniApp.cardsManager.handleConnect(${JSON.stringify(alumni).replace(/"/g, '&quot;')})">
                        Connect
                    </button>
                    <button class="btn-message" onclick="alumniApp.cardsManager.handleMessage(${JSON.stringify(alumni).replace(/"/g, '&quot;')})">
                        Message
                    </button>
                    <button class="btn-qr" onclick="alumniApp.cardsManager.showQRCode(${JSON.stringify(alumni).replace(/"/g, '&quot;')})">
                        QR Code
                    </button>
                </div>
            </div>
        `;
        this.app.showModal('Alumni Details', content);
    }

    /**
     * Generate detailed information
     */
    generateDetailedInfo(alumni) {
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};
        const summit = alumni.summit_2025 || {};

        return `
            <div class="detail-sections">
                <div class="detail-section">
                    <h4>Professional Background</h4>
                    <ul>
                        <li><strong>Current Role:</strong> ${professional.current_role || 'Not specified'}</li>
                        <li><strong>Company:</strong> ${professional.company || 'Not specified'}</li>
                        <li><strong>Industry:</strong> ${this.formatIndustry(professional.industry)}</li>
                        <li><strong>Experience Level:</strong> ${this.formatExperience(professional.experience_level)}</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4>Areas of Expertise</h4>
                    <div class="expertise-list">
                        ${(professional.expertise_tags || []).map(tag => 
                            `<span class="expertise-badge">${tag}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Networking Goals</h4>
                    <ul>
                        <li><strong>Looking for:</strong> ${this.formatArray(networking.goals)}</li>
                        <li><strong>Can offer:</strong> ${this.formatArray(networking.offering)}</li>
                        <li><strong>Availability:</strong> ${this.getAvailabilityText(networking.availability)}</li>
                    </ul>
                </div>

                ${summit.attending ? `
                <div class="detail-section">
                    <h4>Summit 2025 Participation</h4>
                    <ul>
                        <li><strong>Arrival Date:</strong> ${summit.arrival_date || 'TBD'}</li>
                        <li><strong>Sessions:</strong> ${this.formatArray(summit.sessions_attending)}</li>
                        <li><strong>Accommodation:</strong> ${summit.accommodation || 'Not specified'}</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Flip card animation
     */
    flipCard(card) {
        card.classList.add('flip-animation');
        card.classList.toggle('flipped');
        
        setTimeout(() => {
            card.classList.remove('flip-animation');
        }, 800);
    }

    /**
     * Add click feedback effect
     */
    addClickFeedback(card, event) {
        const ripple = document.createElement('div');
        ripple.className = 'tap-feedback';
        
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Handle card hover
     */
    handleCardHover(card, isHovering) {
        if (isHovering) {
            card.classList.add('hover-effect');
            this.showCardPreview(card);
        } else {
            card.classList.remove('hover-effect');
            this.hideCardPreview();
        }
    }

    /**
     * Show card preview (tooltip-like)
     */
    showCardPreview(card) {
        // Implementation for preview tooltip
        // This could show additional info on hover
    }

    /**
     * Hide card preview
     */
    hideCardPreview() {
        // Implementation for hiding preview
    }

    /**
     * Load card image lazily
     */
    loadCardImage(card) {
        const photo = card.querySelector('.profile-photo');
        if (photo && !photo.dataset.loaded) {
            // Here you would load actual images
            // For now, we're using emoji placeholders
            photo.dataset.loaded = 'true';
        }
    }

    /**
     * Update viewport dimensions
     */
    updateViewport() {
        if (this.container) {
            const rect = this.container.getBoundingClientRect();
            this.viewport = {
                width: rect.width || window.innerWidth,
                height: rect.height || window.innerHeight
            };
        }
    }

    /**
     * Update layout
     */
    updateLayout() {
        this.updateViewport();
        
        if (window.innerWidth < 992) {
            // Use CSS Grid on smaller screens
            this.container?.classList.add('responsive-grid');
        } else {
            this.container?.classList.remove('responsive-grid');
            // Repositioning for larger screens would happen here
            this.repositionCards();
        }
    }

    /**
     * Reposition cards (for clustering or layout changes)
     */
    repositionCards() {
        if (this.clustering) {
            this.applyClusteringLayout();
        } else {
            this.applyGridLayout();
        }
    }

    /**
     * Apply clustering layout
     */
    applyClusteringLayout() {
        // Group cards by criteria and position them accordingly
        const groups = this.groupCardsByCriteria();
        
        Object.entries(groups).forEach(([key, cards], groupIndex) => {
            const groupCenter = this.getGroupCenter(groupIndex);
            
            cards.forEach((card, cardIndex) => {
                const position = this.getClusterPosition(groupCenter, cardIndex, cards.length);
                this.animateToPosition(card.element, position);
            });
        });
    }

    /**
     * Group cards by clustering criteria
     */
    groupCardsByCriteria() {
        const groups = {};
        
        this.cards.forEach(({ element, data }) => {
            const industry = data.professional?.industry || 'other';
            if (!groups[industry]) {
                groups[industry] = [];
            }
            groups[industry].push({ element, data });
        });
        
        return groups;
    }

    /**
     * Get center position for a group
     */
    getGroupCenter(groupIndex) {
        const totalGroups = 4; // Adjust based on your needs
        const angle = (groupIndex / totalGroups) * 2 * Math.PI;
        const radius = Math.min(this.viewport.width, this.viewport.height) * 0.3;
        
        return {
            x: this.viewport.width / 2 + Math.cos(angle) * radius,
            y: this.viewport.height / 2 + Math.sin(angle) * radius
        };
    }

    /**
     * Get position within a cluster
     */
    getClusterPosition(center, index, total) {
        const radius = 50 + (total * 5);
        const angle = (index / total) * 2 * Math.PI;
        
        return {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
        };
    }

    /**
     * Apply grid layout
     */
    applyGridLayout() {
        let index = 0;
        this.cards.forEach(({ element, data }) => {
            const position = this.calculateInitialPosition(index, data);
            this.animateToPosition(element, position);
            index++;
        });
    }

    /**
     * Animate card to position
     */
    animateToPosition(card, position) {
        card.classList.add('card-flying', 'repositioning');
        this.setCardPosition(card, position);
        
        setTimeout(() => {
            card.classList.remove('repositioning');
        }, 1500);
    }

    /**
     * Randomize card positions
     */
    randomizePositions() {
        this.cards.forEach(({ element }) => {
            const randomPosition = {
                x: Math.random() * (this.viewport.width - this.cardDimensions.width),
                y: Math.random() * (this.viewport.height - this.cardDimensions.height),
                static: false
            };
            
            element.classList.add('shake-gesture');
            setTimeout(() => {
                this.animateToPosition(element, randomPosition);
                element.classList.remove('shake-gesture');
            }, 500);
        });
    }

    /**
     * Enable clustering mode
     */
    enableClustering() {
        this.clustering = true;
        this.container?.classList.add('clustering-view');
        this.applyClusteringLayout();
    }

    /**
     * Disable clustering mode
     */
    disableClustering() {
        this.clustering = false;
        this.container?.classList.remove('clustering-view');
        this.applyGridLayout();
    }

    /**
     * Handle resize
     */
    handleResize() {
        this.updateViewport();
        
        // Debounce repositioning
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            this.repositionCards();
        });
    }

    /**
     * Clear all cards
     */
    clearCards() {
        if (this.intersectionObserver) {
            this.cards.forEach(({ element }) => {
                this.intersectionObserver.unobserve(element);
            });
        }
        
        this.cards.clear();
        this.cardPositions.clear();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.clearCards();
    }
}