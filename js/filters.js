/**
 * LEADERS Summit 2025 - Alumni Networking
 * Filters Management Module
 * 
 * Handles all filtering functionality including quick filters,
 * advanced filters, and view controls
 */

class FiltersManager {
    constructor(app) {
        this.app = app;
        this.activeFilters = {
            quick: 'all',
            industry: '',
            location: '',
            year: '',
            experience: '',
            search: ''
        };
        
        this.filterHistory = [];
        this.maxHistoryLength = 10;
        
        this.init();
    }

    /**
     * Initialize the filters manager
     */
    init() {
        this.setupQuickFilters();
        this.setupAdvancedFilters();
        this.setupViewControls();
        this.loadSavedFilters();
    }

    /**
     * Setup quick filter buttons
     */
    setupQuickFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.filter;
                this.setQuickFilter(filter, button);
            });
        });
    }

    /**
     * Setup advanced filter selects
     */
    setupAdvancedFilters() {
        const filterSelects = [
            'industry-filter',
            'location-filter', 
            'year-filter',
            'experience-filter'
        ];

        filterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', (e) => {
                    const filterType = selectId.replace('-filter', '');
                    this.setAdvancedFilter(filterType, e.target.value);
                });
            }
        });
    }

    /**
     * Setup view control buttons
     */
    setupViewControls() {
        const viewButtons = document.querySelectorAll('.view-btn');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const view = button.dataset.view;
                this.setView(view, button);
            });
        });
    }

    /**
     * Set quick filter
     */
    setQuickFilter(filter, button) {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        button.classList.add('active', 'animating');
        button.setAttribute('aria-pressed', 'true');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            button.classList.remove('animating');
        }, 600);

        // Update filter state
        this.activeFilters.quick = filter;
        
        // Add to history
        this.addToHistory('quick', filter);
        
        // Apply filters
        this.applyFilters();
        
        // Show notification
        this.showFilterNotification(filter);
        
        // Save to localStorage
        this.saveFilters();
    }

    /**
     * Set advanced filter
     */
    setAdvancedFilter(type, value) {
        this.activeFilters[type] = value;
        
        // Add to history
        this.addToHistory(type, value);
        
        // Apply filters
        this.applyFilters();
        
        // Update UI feedback
        this.updateFilterFeedback();
        
        // Save to localStorage
        this.saveFilters();
    }

    /**
     * Set view mode
     */
    setView(view, button) {
        // Update active state
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        
        // Update app view state
        this.app.currentView = view;
        
        // Apply view changes
        this.applyViewChanges(view);
        
        // Save preference
        localStorage.setItem('preferredView', view);
    }

    /**
     * Apply view changes
     */
    applyViewChanges(view) {
        const container = this.app.elements.cardsContainer;
        if (!container) return;

        // Remove all view classes
        container.classList.remove('cards-view', 'clustering-view', 'list-view');
        
        switch (view) {
            case 'cards':
                container.classList.add('cards-view');
                if (this.app.cardsManager) {
                    this.app.cardsManager.disableClustering();
                }
                break;
                
            case 'clustering':
                container.classList.add('clustering-view');
                if (this.app.cardsManager) {
                    this.app.cardsManager.enableClustering();
                }
                break;
                
            case 'list':
                container.classList.add('list-view');
                this.renderListView();
                break;
        }
        
        // Update animations
        if (this.app.animationsManager) {
            this.app.animationsManager.updateViewAnimations(view);
        }
    }

    /**
     * Render list view
     */
    renderListView() {
        const container = this.app.elements.cardsContainer;
        if (!container) return;

        container.innerHTML = '';
        
        const listContainer = document.createElement('div');
        listContainer.className = 'list-container';
        
        this.app.filteredData.forEach(alumni => {
            const listItem = this.createListItem(alumni);
            listContainer.appendChild(listItem);
        });
        
        container.appendChild(listContainer);
    }

    /**
     * Create list item
     */
    createListItem(alumni) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.setAttribute('data-alumni-id', alumni.id);
        
        const personal = alumni.personal || {};
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};
        
        item.innerHTML = `
            <div class="list-item-avatar">
                ${personal.photo || '👤'}
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h3 class="list-item-name">${personal.name || 'Anonymous'}</h3>
                    <span class="list-item-year">Class of ${personal.graduation_year || 'Unknown'}</span>
                </div>
                <div class="list-item-role">
                    ${professional.current_role || 'Professional'} at ${professional.company || 'Company'}
                </div>
                <div class="list-item-location">
                    📍 ${personal.location?.city || 'Location'}, ${personal.location?.country || ''}
                </div>
                <div class="list-item-tags">
                    ${(professional.expertise_tags || []).slice(0, 3).map(tag => 
                        `<span class="list-tag">${tag}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="list-item-status">
                <div class="status-indicator ${networking.availability || 'offline'}"></div>
                <div class="list-item-actions">
                    <button class="list-btn" data-action="connect">Connect</button>
                    <button class="list-btn" data-action="message">Message</button>
                </div>
            </div>
        `;
        
        // Add click handler
        item.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.showAlumniDetail(alumni);
            }
        });
        
        return item;
    }

    /**
     * Show alumni detail from list
     */
    showAlumniDetail(alumni) {
        if (this.app.cardsManager) {
            this.app.cardsManager.showDetailModal(alumni);
        }
    }

    /**
     * Apply all active filters
     */
    applyFilters() {
        // Show loading state
        this.showFilterLoading();
        
        // Apply filters with slight delay for UX
        setTimeout(() => {
            this.app.filterData(this.activeFilters);
            this.hideFilterLoading();
            this.updateFilterStats();
        }, 150);
    }

    /**
     * Show filter loading state
     */
    showFilterLoading() {
        const container = this.app.elements.cardsContainer;
        if (container) {
            container.classList.add('filter-results-updating');
        }
    }

    /**
     * Hide filter loading state
     */
    hideFilterLoading() {
        const container = this.app.elements.cardsContainer;
        if (container) {
            container.classList.remove('filter-results-updating');
        }
    }

    /**
     * Update filter feedback UI
     */
    updateFilterFeedback() {
        const activeCount = this.getActiveFilterCount();
        
        // Update clear filters button visibility
        const clearBtn = this.app.elements.clearFiltersBtn;
        if (clearBtn) {
            if (activeCount > 0) {
                clearBtn.style.display = 'block';
                clearBtn.textContent = `Clear Filters (${activeCount})`;
            } else {
                clearBtn.style.display = 'none';
            }
        }
        
        // Update filter indicators
        this.updateFilterIndicators();
    }

    /**
     * Get active filter count
     */
    getActiveFilterCount() {
        let count = 0;
        
        if (this.activeFilters.quick !== 'all') count++;
        if (this.activeFilters.industry) count++;
        if (this.activeFilters.location) count++;
        if (this.activeFilters.year) count++;
        if (this.activeFilters.experience) count++;
        if (this.activeFilters.search) count++;
        
        return count;
    }

    /**
     * Update filter indicators
     */
    updateFilterIndicators() {
        // Add visual indicators to show which filters are active
        const filterControls = document.querySelector('.filter-controls');
        if (!filterControls) return;
        
        const activeCount = this.getActiveFilterCount();
        
        if (activeCount > 0) {
            filterControls.classList.add('filters-active');
        } else {
            filterControls.classList.remove('filters-active');
        }
    }

    /**
     * Update filter statistics
     */
    updateFilterStats() {
        const resultCount = this.app.filteredData.length;
        const totalCount = this.app.alumniData.length;
        
        // Update search results info
        const resultsInfo = this.app.elements.searchResultsInfo;
        if (resultsInfo && this.getActiveFilterCount() > 0) {
            resultsInfo.textContent = `Showing ${resultCount} of ${totalCount} alumni`;
            resultsInfo.classList.add('visible');
            
            setTimeout(() => {
                resultsInfo.classList.remove('visible');
            }, 3000);
        }
        
        // Update stats in header
        this.app.updateStats();
    }

    /**
     * Show filter notification
     */
    showFilterNotification(filter) {
        const messages = {
            'all': 'Showing all alumni',
            'attending': 'Showing Summit 2025 attendees',
            'available': 'Showing available alumni',
            'mentors': 'Showing mentors',
            'entrepreneurs': 'Showing entrepreneurs'
        };
        
        const message = messages[filter] || `Filter applied: ${filter}`;
        
        // Don't show notification for 'all' filter
        if (filter !== 'all') {
            this.app.showNotification('info', 'Filter Applied', message, 2000);
        }
    }

    /**
     * Add to filter history
     */
    addToHistory(type, value) {
        const entry = {
            type,
            value,
            timestamp: Date.now(),
            resultCount: this.app.filteredData.length
        };
        
        this.filterHistory.unshift(entry);
        
        // Limit history size
        if (this.filterHistory.length > this.maxHistoryLength) {
            this.filterHistory = this.filterHistory.slice(0, this.maxHistoryLength);
        }
    }

    /**
     * Get filter suggestions based on current context
     */
    getFilterSuggestions() {
        const suggestions = [];
        const currentData = this.app.filteredData;
        
        // Industry suggestions
        const industries = [...new Set(currentData.map(a => a.professional?.industry).filter(Boolean))];
        industries.forEach(industry => {
            suggestions.push({
                type: 'industry',
                value: industry,
                label: this.formatIndustryName(industry),
                count: currentData.filter(a => a.professional?.industry === industry).length
            });
        });
        
        // Location suggestions
        const locations = [...new Set(currentData.map(a => a.personal?.location?.country).filter(Boolean))];
        locations.forEach(location => {
            suggestions.push({
                type: 'location',
                value: location,
                label: location,
                count: currentData.filter(a => a.personal?.location?.country === location).length
            });
        });
        
        return suggestions.sort((a, b) => b.count - a.count);
    }

    /**
     * Format industry name for display
     */
    formatIndustryName(industry) {
        return industry.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        // Reset all filter states
        this.activeFilters = {
            quick: 'all',
            industry: '',
            location: '',
            year: '',
            experience: '',
            search: ''
        };
        
        // Reset UI
        this.resetFilterUI();
        
        // Apply filters (will show all data)
        this.applyFilters();
        
        // Show notification
        this.app.showNotification('info', 'Filters Cleared', 'Showing all alumni');
        
        // Save state
        this.saveFilters();
    }

    /**
     * Reset filter UI to default state
     */
    resetFilterUI() {
        // Reset quick filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const allButton = document.querySelector('[data-filter="all"]');
        if (allButton) {
            allButton.classList.add('active');
            allButton.setAttribute('aria-pressed', 'true');
        }
        
        // Reset advanced filter selects
        const selects = document.querySelectorAll('.filter-select');
        selects.forEach(select => {
            select.value = '';
        });
        
        // Clear search if it exists
        if (this.app.searchManager) {
            this.app.searchManager.clearSearch();
        }
        
        // Update feedback
        this.updateFilterFeedback();
    }

    /**
     * Save current filters to localStorage
     */
    saveFilters() {
        try {
            localStorage.setItem('alumniFilters', JSON.stringify(this.activeFilters));
        } catch (error) {
            console.warn('Failed to save filters to localStorage:', error);
        }
    }

    /**
     * Load saved filters from localStorage
     */
    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('alumniFilters');
            if (saved) {
                const filters = JSON.parse(saved);
                
                // Apply saved filters cautiously
                Object.keys(this.activeFilters).forEach(key => {
                    if (filters[key] !== undefined) {
                        this.activeFilters[key] = filters[key];
                    }
                });
                
                // Update UI to match loaded filters
                this.applyLoadedFiltersToUI();
                
                // Apply filters if any are active
                if (this.getActiveFilterCount() > 0) {
                    this.applyFilters();
                }
            }
        } catch (error) {
            console.warn('Failed to load saved filters:', error);
        }
        
        // Load preferred view
        try {
            const preferredView = localStorage.getItem('preferredView');
            if (preferredView && ['cards', 'clustering', 'list'].includes(preferredView)) {
                const viewButton = document.querySelector(`[data-view="${preferredView}"]`);
                if (viewButton) {
                    this.setView(preferredView, viewButton);
                }
            }
        } catch (error) {
            console.warn('Failed to load preferred view:', error);
        }
    }

    /**
     * Apply loaded filters to UI
     */
    applyLoadedFiltersToUI() {
        // Update quick filter button
        if (this.activeFilters.quick !== 'all') {
            const button = document.querySelector(`[data-filter="${this.activeFilters.quick}"]`);
            if (button) {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            }
        }
        
        // Update advanced filter selects
        ['industry', 'location', 'year', 'experience'].forEach(type => {
            const select = document.getElementById(`${type}-filter`);
            if (select && this.activeFilters[type]) {
                select.value = this.activeFilters[type];
            }
        });
        
        // Update UI feedback
        this.updateFilterFeedback();
    }

    /**
     * Export current filter state
     */
    exportFilters() {
        return {
            filters: { ...this.activeFilters },
            history: [...this.filterHistory],
            resultCount: this.app.filteredData.length,
            timestamp: Date.now()
        };
    }

    /**
     * Import filter state
     */
    importFilters(state) {
        if (state.filters) {
            this.activeFilters = { ...state.filters };
            this.applyLoadedFiltersToUI();
            this.applyFilters();
        }
        
        if (state.history) {
            this.filterHistory = [...state.history];
        }
    }

    /**
     * Get filter analytics
     */
    getFilterAnalytics() {
        const analytics = {
            totalApplications: this.filterHistory.length,
            mostUsedFilters: {},
            averageResultCount: 0,
            filterEffectiveness: {}
        };
        
        // Count filter usage
        this.filterHistory.forEach(entry => {
            const key = `${entry.type}:${entry.value}`;
            analytics.mostUsedFilters[key] = (analytics.mostUsedFilters[key] || 0) + 1;
        });
        
        // Calculate average result count
        if (this.filterHistory.length > 0) {
            const totalResults = this.filterHistory.reduce((sum, entry) => sum + entry.resultCount, 0);
            analytics.averageResultCount = Math.round(totalResults / this.filterHistory.length);
        }
        
        return analytics;
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Save current state before destroying
        this.saveFilters();
        
        // Clear history
        this.filterHistory = [];
        
        // Reset filters
        this.activeFilters = {
            quick: 'all',
            industry: '',
            location: '',
            year: '',
            experience: '',
            search: ''
        };
    }
}