/**
 * LEADERS Summit 2025 - Alumni Networking
 * Main Application Controller
 * 
 * This file handles the core application initialization, 
 * coordination between modules, and main application state.
 */

class AlumniNetworkingApp {
    constructor() {
        this.alumniData = [];
        this.filteredData = [];
        this.currentView = 'cards';
        this.isLoading = false;
        this.searchMode = false;
        this.clusteringEnabled = false;
        
        // Initialize modules when they're available
        this.cardsManager = null;
        this.filtersManager = null;
        this.searchManager = null;
        this.animationsManager = null;
        
        // DOM elements
        this.elements = {};
        
        // Event listeners storage
        this.eventListeners = new Map();
        
        // Performance monitoring
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            searchTime: 0,
            animationFrames: 0
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Starting Alumni Networking App initialization...');
        
        try {
            console.log('📺 Step 1: Showing loading screen...');
            this.showLoadingScreen();
            
            console.log('🔍 Step 2: Initializing DOM elements...');
            await this.initializeDOM();
            
            console.log('📊 Step 3: Loading alumni data...');
            await this.loadAlumniData();
            
            console.log('🔧 Step 4: Initializing modules...');
            await this.initializeModules();
            
            console.log('👂 Step 5: Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('📈 Step 6: Performance monitoring...');
            this.setupPerformanceMonitoring();
            
            console.log('♿ Step 7: Accessibility setup...');
            this.setupAccessibility();
            
            console.log('🎯 Step 8: Updating stats...');
            this.updateStats();
            
            console.log('🎉 Step 9: Hiding loading screen...');
            this.hideLoadingScreen();
            
            // Show initial welcome notification
            setTimeout(() => {
                this.showNotification('success', 'Welcome!', 'Alumni network loaded successfully');
            }, 600);
            
            console.log('✅ Alumni Networking App initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            console.error('Error details:', error.stack);
            this.hideLoadingScreen();
            this.showError('Failed to initialize application. Please refresh and try again.');
        }
    }

    /**
     * Initialize DOM element references
     */
    async initializeDOM() {
        const elementIds = [
            'loading-screen', 'loading-bar', 'cards-container', 'modal-overlay', 
            'modal-body', 'modal-close', 'ai-search', 'voice-search', 
            'search-suggestions', 'search-results-info', 'notification-container',
            'error-state', 'empty-state', 'retry-btn', 'clear-filters-btn',
            'offline-indicator', 'total-alumni', 'attending-count', 'online-count',
            'industry-filter', 'location-filter', 'year-filter', 'experience-filter',
            'randomize-positions'
        ];

        for (const id of elementIds) {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id]) {
                console.warn(`Element with id '${id}' not found`);
            }
        }

        // Get filter buttons
        this.elements.filterButtons = document.querySelectorAll('.filter-btn');
        this.elements.viewButtons = document.querySelectorAll('.view-btn');
    }

    /**
     * Load alumni data from JSON file
     */
    async loadAlumniData() {
        try {
            const response = await fetch('data/alumni.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.alumniData = await response.json();
            this.filteredData = [...this.alumniData];
            
            // Update loading progress
            this.updateLoadingProgress(70);
            
        } catch (error) {
            console.error('Failed to load alumni data:', error);
            // Use fallback data for demonstration
            this.alumniData = this.createFallbackData();
            this.filteredData = [...this.alumniData];
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        // Initialize modules with fallback handling
        try {
            // Try to initialize modules with a small delay to ensure scripts are loaded
            setTimeout(() => {
                this.tryInitializeModules();
            }, 100);
        } catch (error) {
            console.warn('Module initialization failed, using basic functionality:', error);
            this.initializeBasicFunctionality();
        }
        
        // Update loading progress
        this.updateLoadingProgress(90);
    }

    /**
     * Try to initialize modules with error handling
     */
    tryInitializeModules() {
        try {
            if (typeof AlumniCardsManager !== 'undefined') {
                this.cardsManager = new AlumniCardsManager(this);
                console.log('✅ Cards Manager initialized');
            } else {
                console.warn('⚠️ AlumniCardsManager not available, using fallback');
                this.initializeBasicCards();
            }

            if (typeof FiltersManager !== 'undefined') {
                this.filtersManager = new FiltersManager(this);
                console.log('✅ Filters Manager initialized');
            } else {
                console.warn('⚠️ FiltersManager not available, using fallback');
                this.initializeBasicFilters();
            }

            if (typeof SearchManager !== 'undefined') {
                this.searchManager = new SearchManager(this);
                console.log('✅ Search Manager initialized');
            } else {
                console.warn('⚠️ SearchManager not available, using fallback');
                this.initializeBasicSearch();
            }

            if (typeof AnimationsManager !== 'undefined') {
                this.animationsManager = new AnimationsManager(this);
                console.log('✅ Animations Manager initialized');
            } else {
                console.warn('⚠️ AnimationsManager not available, using fallback');
                this.initializeBasicAnimations();
            }
        } catch (error) {
            console.error('Error initializing modules:', error);
            this.initializeBasicFunctionality();
        }
    }

    /**
     * Initialize basic functionality as fallback
     */
    initializeBasicFunctionality() {
        console.log('🔄 Initializing basic functionality...');
        this.initializeBasicCards();
        this.initializeBasicFilters();
        this.initializeBasicSearch();
        this.initializeBasicAnimations();
    }

    initializeBasicCards() {
        // Basic card rendering
        const container = this.elements.cardsContainer;
        if (container && this.filteredData.length > 0) {
            this.renderBasicCards();
        }
    }

    renderBasicCards() {
        const container = this.elements.cardsContainer;
        container.innerHTML = '';
        
        this.filteredData.forEach((alumni, index) => {
            const card = this.createBasicCard(alumni, index);
            container.appendChild(card);
        });
    }

    createBasicCard(alumni, index) {
        const card = document.createElement('div');
        card.className = 'alumni-card';
        card.style.position = 'absolute';
        card.style.left = `${50 + (index * 300)}px`;
        card.style.top = `${100 + (index % 2) * 200}px`;
        
        const personal = alumni.personal || {};
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};
        const summit = alumni.summit_2025 || {};
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-header">
                        <div class="profile-photo">${personal.photo || '👤'}</div>
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
                        <div class="card-footer">
                            <div class="card-status">
                                <div class="availability-status">
                                    <span class="status-dot ${networking.availability || 'offline'}"></span>
                                    <span>${networking.availability || 'Unknown'}</span>
                                </div>
                                ${summit.attending ? '<span class="summit-badge">Summit 2025</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
        
        return card;
    }

    initializeBasicFilters() {
        // Basic filter functionality
        this.elements.filterButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyBasicFilter(e.target.dataset.filter);
            });
        });
    }

    applyBasicFilter(filter) {
        // Simple filtering logic
        this.filterData({ [filter]: true });
    }

    initializeBasicSearch() {
        // Basic search functionality
        if (this.elements.aiSearch) {
            this.elements.aiSearch.addEventListener('input', (e) => {
                this.performBasicSearch(e.target.value);
            });
        }
    }

    performBasicSearch(query) {
        if (!query.trim()) {
            this.filteredData = [...this.alumniData];
        } else {
            this.filteredData = this.alumniData.filter(alumni => {
                const searchText = `${alumni.personal?.name} ${alumni.professional?.current_role} ${alumni.professional?.company}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        }
        this.renderBasicCards();
    }

    initializeBasicAnimations() {
        // Basic animation setup
        console.log('Basic animations initialized');
    }

    /**
     * Setup main event listeners
     */
    setupEventListeners() {
        // Window events
        this.addEventListener(window, 'resize', this.debounce(this.handleResize.bind(this), 250));
        this.addEventListener(window, 'orientationchange', () => {
            setTimeout(() => this.handleResize(), 300);
        });
        
        // Online/offline status
        this.addEventListener(window, 'online', this.handleOnlineStatus.bind(this));
        this.addEventListener(window, 'offline', this.handleOfflineStatus.bind(this));
        
        // Modal events
        if (this.elements.modalClose) {
            this.addEventListener(this.elements.modalClose, 'click', this.closeModal.bind(this));
        }
        
        if (this.elements.modalOverlay) {
            this.addEventListener(this.elements.modalOverlay, 'click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        // Retry button
        if (this.elements.retryBtn) {
            this.addEventListener(this.elements.retryBtn, 'click', () => {
                location.reload();
            });
        }
        
        // Clear filters button
        if (this.elements.clearFiltersBtn) {
            this.addEventListener(this.elements.clearFiltersBtn, 'click', () => {
                if (this.filtersManager) {
                    this.filtersManager.clearAllFilters();
                }
            });
        }
        
        // Randomize positions button
        if (this.elements.randomizePositions) {
            this.addEventListener(this.elements.randomizePositions, 'click', this.randomizeCardPositions.bind(this));
        }
        
        // Keyboard navigation
        this.addEventListener(document, 'keydown', this.handleKeyboard.bind(this));
        
        // Gesture support for mobile
        this.setupGestureSupport();
    }

    /**
     * Setup gesture support for mobile devices
     */
    setupGestureSupport() {
        let lastShake = 0;
        
        if (window.DeviceMotionEvent) {
            this.addEventListener(window, 'devicemotion', (e) => {
                const acceleration = e.accelerationIncludingGravity;
                const threshold = 15;
                const now = Date.now();
                
                if (now - lastShake > 1000) {
                    const shake = Math.abs(acceleration.x) + Math.abs(acceleration.y) + Math.abs(acceleration.z);
                    if (shake > threshold) {
                        lastShake = now;
                        this.randomizeCardPositions();
                        this.showNotification('info', 'Shuffled!', 'Card positions randomized');
                    }
                }
            });
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // ARIA live region updates
        this.elements.searchResultsInfo?.setAttribute('aria-live', 'polite');
        this.elements.notificationContainer?.setAttribute('aria-live', 'assertive');
        
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only';
        skipLink.textContent = 'Skip to main content';
        skipLink.addEventListener('focus', () => skipLink.classList.remove('sr-only'));
        skipLink.addEventListener('blur', () => skipLink.classList.add('sr-only'));
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Focus management
        this.setupFocusManagement();
    }

    /**
     * Setup focus management for accessibility
     */
    setupFocusManagement() {
        let focusedElementBeforeModal = null;
        
        // Store focus when modal opens
        this.addEventListener(this.elements.modalOverlay, 'show', () => {
            focusedElementBeforeModal = document.activeElement;
        });
        
        // Restore focus when modal closes
        this.addEventListener(this.elements.modalOverlay, 'hide', () => {
            if (focusedElementBeforeModal) {
                focusedElementBeforeModal.focus();
                focusedElementBeforeModal = null;
            }
        });
        
        // Trap focus in modal
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Tab' && this.elements.modalOverlay?.classList.contains('visible')) {
                this.trapFocus(e, this.elements.modalOverlay);
            }
        });
    }

    /**
     * Trap focus within a container
     */
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor FPS
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = (currentTime) => {
            frames++;
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.animationFrames = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // Log performance issues
                if (this.performanceMetrics.animationFrames < 30) {
                    console.warn('Low FPS detected:', this.performanceMetrics.animationFrames);
                }
            }
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
        
        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                }
            }, 30000);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(e) {
        const key = e.key.toLowerCase();
        
        // Global shortcuts
        switch (key) {
            case 'escape':
                if (this.elements.modalOverlay?.classList.contains('visible')) {
                    this.closeModal();
                } else if (this.searchMode) {
                    this.clearSearch();
                }
                break;
                
            case '/':
                if (!e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    this.elements.aiSearch?.focus();
                }
                break;
                
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.randomizeCardPositions();
                }
                break;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.cardsManager) {
            this.cardsManager.handleResize();
        }
        
        if (this.animationsManager) {
            this.animationsManager.updateViewport();
        }
        
        // Update layout
        this.updateLayout();
    }

    /**
     * Handle online status
     */
    handleOnlineStatus() {
        this.elements.offlineIndicator?.style.setProperty('display', 'none');
        this.showNotification('success', 'Back Online', 'Connection restored');
        
        // Retry any failed operations
        if (this.searchManager) {
            this.searchManager.retryFailedRequests();
        }
    }

    /**
     * Handle offline status
     */
    handleOfflineStatus() {
        this.elements.offlineIndicator?.style.setProperty('display', 'block');
        this.showNotification('warning', 'Offline', 'Some features may be limited');
    }

    /**
     * Update layout based on current state
     */
    updateLayout() {
        const container = this.elements.cardsContainer;
        if (!container) return;
        
        const viewportWidth = window.innerWidth;
        
        // Switch to grid layout on smaller screens
        if (viewportWidth < 992) {
            container.classList.add('responsive-grid');
            this.currentView = 'grid';
        } else {
            container.classList.remove('responsive-grid');
            if (this.currentView === 'grid') {
                this.currentView = 'cards';
            }
        }
        
        // Update view state
        this.updateViewButtons();
    }

    /**
     * Update view buttons active state
     */
    updateViewButtons() {
        this.elements.viewButtons?.forEach(btn => {
            const view = btn.dataset.view;
            if (view === this.currentView) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = this.elements.loadingScreen;
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            this.updateLoadingProgress(0);
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        console.log('🔄 Attempting to hide loading screen...');
        
        // Try multiple ways to find the loading screen
        let loadingScreen = this.elements?.loadingScreen || 
                           this.elements?.['loading-screen'] || 
                           document.getElementById('loading-screen') ||
                           document.querySelector('.loading-screen');
        
        console.log('📺 Loading screen element:', loadingScreen);
        
        if (loadingScreen) {
            console.log('✅ Found loading screen, hiding it...');
            this.updateLoadingProgress(100);
            
            // Add multiple methods to ensure it's hidden
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.display = 'none';
                console.log('✅ Loading screen hidden successfully');
            }, 500);
        } else {
            console.warn('⚠️ Loading screen element not found, trying alternate methods...');
            
            // Fallback: hide any element with loading-related classes
            const fallbackElements = document.querySelectorAll('.loading-screen, #loading-screen, [data-loading]');
            fallbackElements.forEach(el => {
                el.style.display = 'none';
                console.log('✅ Hidden fallback loading element:', el);
            });
        }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(percentage) {
        const loadingBar = this.elements.loadingBar;
        if (loadingBar) {
            loadingBar.style.width = `${percentage}%`;
        }
    }

    /**
     * Show modal with content
     */
    showModal(title, content) {
        const modal = this.elements.modalOverlay;
        const modalBody = this.elements.modalBody;
        
        if (modal && modalBody) {
            modalBody.innerHTML = content;
            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first focusable element
            setTimeout(() => {
                const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);
            
            // Dispatch custom event
            modal.dispatchEvent(new CustomEvent('show'));
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = this.elements.modalOverlay;
        if (modal) {
            modal.classList.remove('visible');
            modal.setAttribute('aria-hidden', 'true');
            
            // Dispatch custom event
            modal.dispatchEvent(new CustomEvent('hide'));
        }
    }

    /**
     * Show notification
     */
    showNotification(type, title, message, duration = 5000) {
        const container = this.elements.notificationContainer;
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12 4L4 12m8-8l-8 8"/>
                </svg>
            </button>
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);
        
        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
        
        return notification;
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
            error: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
            warning: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
            info: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show error state
     */
    showError(message) {
        const errorState = this.elements.errorState;
        const errorMessage = document.getElementById('error-message');
        
        if (errorState && errorMessage) {
            errorMessage.textContent = message;
            errorState.style.display = 'flex';
        }
        
        this.hideLoadingScreen();
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const emptyState = this.elements.emptyState;
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
    }

    /**
     * Hide empty state
     */
    hideEmptyState() {
        const emptyState = this.elements.emptyState;
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    /**
     * Update stats in header
     */
    updateStats() {
        const totalAlumni = this.elements.totalAlumni;
        const attendingCount = this.elements.attendingCount;
        const onlineCount = this.elements.onlineCount;
        
        if (totalAlumni) {
            totalAlumni.textContent = this.alumniData.length;
        }
        
        if (attendingCount) {
            const attending = this.alumniData.filter(alumni => alumni.summit_2025?.attending).length;
            attendingCount.textContent = attending;
        }
        
        if (onlineCount) {
            const online = this.alumniData.filter(alumni => alumni.networking?.availability === 'available').length;
            onlineCount.textContent = online;
        }
    }

    /**
     * Randomize card positions
     */
    randomizeCardPositions() {
        if (this.cardsManager) {
            this.cardsManager.randomizePositions();
        }
        
        if (this.animationsManager) {
            this.animationsManager.triggerShakeAnimation();
        }
    }

    /**
     * Clear search
     */
    clearSearch() {
        if (this.searchManager) {
            this.searchManager.clearSearch();
        }
        this.searchMode = false;
    }

    /**
     * Filter data
     */
    filterData(filters) {
        this.filteredData = this.alumniData.filter(alumni => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value || value === 'all') return true;
                
                switch (key) {
                    case 'industry':
                        return alumni.professional?.industry === value;
                    case 'location':
                        return this.matchLocation(alumni.personal?.location, value);
                    case 'year':
                        return this.matchYear(alumni.personal?.graduation_year, value);
                    case 'experience':
                        return alumni.professional?.experience_level === value;
                    case 'attending':
                        return alumni.summit_2025?.attending === true;
                    case 'available':
                        return alumni.networking?.availability === 'available';
                    case 'mentors':
                        return alumni.networking?.offering?.includes('advice') || 
                               alumni.networking?.offering?.includes('mentorship');
                    case 'entrepreneurs':
                        return alumni.professional?.current_role?.toLowerCase().includes('founder') ||
                               alumni.professional?.current_role?.toLowerCase().includes('ceo') ||
                               alumni.professional?.current_role?.toLowerCase().includes('entrepreneur');
                    default:
                        return true;
                }
            });
        });
        
        // Update display
        if (this.cardsManager) {
            this.cardsManager.renderCards(this.filteredData);
        }
        
        // Show/hide empty state
        if (this.filteredData.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
        }
    }

    /**
     * Match location filter
     */
    matchLocation(location, filter) {
        if (!location) return false;
        
        const country = location.country?.toLowerCase();
        switch (filter) {
            case 'north-america':
                return ['usa', 'canada', 'mexico'].includes(country);
            case 'europe':
                return ['uk', 'germany', 'france', 'spain', 'italy', 'netherlands', 'switzerland'].includes(country);
            case 'asia':
                return ['japan', 'china', 'singapore', 'india', 'south korea'].includes(country);
            case 'other':
                return !['usa', 'canada', 'mexico', 'uk', 'germany', 'france', 'spain', 'italy', 'netherlands', 'switzerland', 'japan', 'china', 'singapore', 'india', 'south korea'].includes(country);
            default:
                return true;
        }
    }

    /**
     * Match year filter
     */
    matchYear(year, filter) {
        if (!year) return false;
        
        switch (filter) {
            case '2020-2024':
                return year >= 2020 && year <= 2024;
            case '2015-2019':
                return year >= 2015 && year <= 2019;
            case '2010-2014':
                return year >= 2010 && year <= 2014;
            case 'before-2010':
                return year < 2010;
            default:
                return true;
        }
    }

    /**
     * Create fallback data for demonstration
     */
    createFallbackData() {
        return [
            {
                id: "demo_001",
                personal: {
                    name: "Sarah Chen",
                    photo: "👩‍💼",
                    graduation_year: 2022,
                    degree: "MBA",
                    location: {
                        city: "San Francisco",
                        country: "USA",
                        coordinates: { lat: 37.7749, lng: -122.4194 }
                    }
                },
                professional: {
                    current_role: "Product Manager",
                    company: "TechCorp Inc.",
                    industry: "technology",
                    experience_level: "mid",
                    expertise_tags: ["product", "strategy", "AI"]
                },
                networking: {
                    goals: ["mentorship", "partnerships"],
                    offering: ["advice", "connections"],
                    availability: "available"
                },
                summit_2025: {
                    attending: true,
                    arrival_date: "2025-06-15"
                }
            }
        ];
    }

    /**
     * Add event listener with cleanup tracking
     */
    addEventListener(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // Store for cleanup
        const key = `${element.constructor.name}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ element, event, handler });
    }

    /**
     * Debounce utility function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(listeners => {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        
        // Cleanup modules
        if (this.cardsManager) this.cardsManager.destroy();
        if (this.filtersManager) this.filtersManager.destroy();
        if (this.searchManager) this.searchManager.destroy();
        if (this.animationsManager) this.animationsManager.destroy();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.alumniApp = new AlumniNetworkingApp();
    });
} else {
    window.alumniApp = new AlumniNetworkingApp();
}

// Expose app instance globally for debugging
window.alumniApp = window.alumniApp || null;