/**
 * LEADERS Summit 2025 - Alumni Networking
 * Search Management Module
 * 
 * Handles AI-powered natural language search, voice search,
 * and search suggestions
 */

class SearchManager {
    constructor(app) {
        this.app = app;
        this.searchInput = app.elements.aiSearch;
        this.voiceButton = app.elements.voiceSearch;
        this.suggestionsContainer = app.elements.searchSuggestions;
        this.resultsInfo = app.elements.searchResultsInfo;
        
        // Search state
        this.isSearching = false;
        this.currentQuery = '';
        this.searchHistory = [];
        this.suggestions = [];
        this.selectedSuggestionIndex = -1;
        
        // Voice search state
        this.isListening = false;
        this.recognition = null;
        
        // OpenAI integration (fallback to local search if API key not available)
        this.openAIApiKey = null; // Set this in production with your API key
        this.useAI = false;
        
        // Search cache for performance
        this.searchCache = new Map();
        this.maxCacheSize = 100;
        
        // Debounce search
        this.searchDebounceDelay = 300;
        this.searchTimeout = null;
        
        // Failed requests for retry
        this.failedRequests = [];
        
        this.init();
    }

    /**
     * Initialize the search manager
     */
    init() {
        this.setupSearchInput();
        this.setupVoiceSearch();
        this.loadSearchHistory();
        this.generateBaseSuggestions();
        
        // Check if OpenAI API key is available
        this.checkAIAvailability();
    }

    /**
     * Setup search input functionality
     */
    setupSearchInput() {
        if (!this.searchInput) return;

        // Input event for real-time search
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.handleSearchInput(query);
        });

        // Focus and blur events
        this.searchInput.addEventListener('focus', () => {
            this.showSuggestions();
        });

        this.searchInput.addEventListener('blur', (e) => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => {
                if (!this.suggestionsContainer?.contains(document.activeElement)) {
                    this.hideSuggestions();
                }
            }, 150);
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });

        // Enter key for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(this.currentQuery);
            }
        });
    }

    /**
     * Setup voice search functionality
     */
    setupVoiceSearch() {
        if (!this.voiceButton) return;

        // Check for Web Speech API support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.voiceButton.style.display = 'none';
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        // Voice button click handler
        this.voiceButton.addEventListener('click', () => {
            this.toggleVoiceSearch();
        });

        // Speech recognition events
        this.recognition.addEventListener('start', () => {
            this.handleVoiceStart();
        });

        this.recognition.addEventListener('result', (e) => {
            this.handleVoiceResult(e);
        });

        this.recognition.addEventListener('end', () => {
            this.handleVoiceEnd();
        });

        this.recognition.addEventListener('error', (e) => {
            this.handleVoiceError(e);
        });
    }

    /**
     * Handle search input changes
     */
    handleSearchInput(query) {
        this.currentQuery = query;

        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length === 0) {
            this.clearSearch();
            return;
        }

        // Show loading state
        this.showSearchLoading();

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.updateSuggestions(query);
                
                // Perform search for longer queries
                if (query.length >= 3) {
                    this.performSearch(query, true); // isLiveSearch = true
                }
            }
        }, this.searchDebounceDelay);
    }

    /**
     * Handle search input keyboard navigation
     */
    handleSearchKeydown(e) {
        const suggestions = this.suggestionsContainer?.querySelectorAll('.suggestion-item');
        if (!suggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(
                    this.selectedSuggestionIndex + 1,
                    suggestions.length - 1
                );
                this.updateSuggestionSelection(suggestions);
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(
                    this.selectedSuggestionIndex - 1,
                    -1
                );
                this.updateSuggestionSelection(suggestions);
                break;

            case 'Enter':
                if (this.selectedSuggestionIndex >= 0) {
                    e.preventDefault();
                    const selectedSuggestion = suggestions[this.selectedSuggestionIndex];
                    this.selectSuggestion(selectedSuggestion);
                }
                break;

            case 'Escape':
                this.hideSuggestions();
                this.searchInput.blur();
                break;
        }
    }

    /**
     * Update suggestion selection visual state
     */
    updateSuggestionSelection(suggestions) {
        suggestions.forEach((suggestion, index) => {
            if (index === this.selectedSuggestionIndex) {
                suggestion.classList.add('selected');
            } else {
                suggestion.classList.remove('selected');
            }
        });

        // Update search input if suggestion is selected
        if (this.selectedSuggestionIndex >= 0) {
            const selectedText = suggestions[this.selectedSuggestionIndex].querySelector('.suggestion-text')?.textContent;
            if (selectedText) {
                this.searchInput.value = selectedText;
            }
        }
    }

    /**
     * Perform search operation
     */
    async performSearch(query, isLiveSearch = false) {
        if (!query || query.trim().length === 0) {
            this.clearSearch();
            return;
        }

        const normalizedQuery = query.trim().toLowerCase();
        
        // Check cache first
        if (this.searchCache.has(normalizedQuery)) {
            const cachedResults = this.searchCache.get(normalizedQuery);
            this.displaySearchResults(cachedResults, query, isLiveSearch);
            return;
        }

        this.isSearching = true;
        this.showSearchLoading();

        try {
            let results;
            
            if (this.useAI && this.openAIApiKey) {
                results = await this.performAISearch(query);
            } else {
                results = await this.performLocalSearch(query);
            }

            // Cache results
            this.cacheSearchResults(normalizedQuery, results);
            
            // Display results
            this.displaySearchResults(results, query, isLiveSearch);
            
            // Add to search history
            if (!isLiveSearch) {
                this.addToSearchHistory(query, results.length);
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            this.handleSearchError(error, query);
        } finally {
            this.isSearching = false;
            this.hideSearchLoading();
        }
    }

    /**
     * Perform AI-powered search using OpenAI
     */
    async performAISearch(query) {
        if (!this.openAIApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = this.buildAISearchPrompt(query);
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openAIApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert at analyzing alumni profiles and matching them to search queries. Return only valid JSON with alumni IDs that match the query.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;
            
            return this.parseAISearchResults(aiResponse, query);
            
        } catch (error) {
            console.error('AI search failed:', error);
            this.failedRequests.push({ query, timestamp: Date.now(), error: error.message });
            
            // Fallback to local search
            return await this.performLocalSearch(query);
        }
    }

    /**
     * Build AI search prompt
     */
    buildAISearchPrompt(query) {
        const alumniData = JSON.stringify(this.app.alumniData, null, 2);
        
        return `
Given this alumni database and search query, return the IDs of alumni who best match the query.

Query: "${query}"

Alumni Database:
${alumniData}

Please analyze the query for:
- Industry/profession keywords
- Skills and expertise
- Location preferences
- Networking goals (mentorship, partnerships, etc.)
- Experience level
- Company types
- Graduation years
- Current roles

Return only a JSON array of alumni IDs that match, ordered by relevance:
["id1", "id2", "id3"]
        `;
    }

    /**
     * Parse AI search results
     */
    parseAISearchResults(aiResponse, query) {
        try {
            const ids = JSON.parse(aiResponse);
            if (!Array.isArray(ids)) {
                throw new Error('Invalid AI response format');
            }

            // Filter alumni data by returned IDs
            const results = this.app.alumniData.filter(alumni => 
                ids.includes(alumni.id)
            );

            // Add confidence scores based on position in results
            return results.map((alumni, index) => ({
                ...alumni,
                searchRelevance: Math.max(0.9 - (index * 0.1), 0.1),
                searchQuery: query
            }));

        } catch (error) {
            console.error('Failed to parse AI results:', error);
            // Fallback to local search
            return this.performLocalSearch(query);
        }
    }

    /**
     * Perform local semantic search
     */
    async performLocalSearch(query) {
        const searchTerms = this.extractSearchTerms(query);
        const results = [];

        this.app.alumniData.forEach(alumni => {
            const relevanceScore = this.calculateRelevanceScore(alumni, searchTerms, query);
            
            if (relevanceScore > 0.1) {
                results.push({
                    ...alumni,
                    searchRelevance: relevanceScore,
                    searchQuery: query
                });
            }
        });

        // Sort by relevance score (descending)
        return results.sort((a, b) => b.searchRelevance - a.searchRelevance);
    }

    /**
     * Extract search terms from query
     */
    extractSearchTerms(query) {
        const terms = {
            keywords: [],
            industries: ['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'real-estate', 'nonprofit'],
            roles: ['founder', 'ceo', 'manager', 'director', 'engineer', 'consultant', 'analyst', 'designer'],
            locations: ['san francisco', 'new york', 'london', 'toronto', 'singapore', 'tokyo'],
            goals: ['mentorship', 'partnerships', 'job opportunities', 'advice', 'connections'],
            experience: ['junior', 'mid', 'senior', 'entry level', 'experienced']
        };

        const normalizedQuery = query.toLowerCase();

        // Extract keywords
        terms.keywords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);

        // Find industry matches
        terms.matchedIndustries = terms.industries.filter(industry => 
            normalizedQuery.includes(industry) || normalizedQuery.includes(industry.replace('-', ' '))
        );

        // Find role matches
        terms.matchedRoles = terms.roles.filter(role => 
            normalizedQuery.includes(role)
        );

        // Find location matches
        terms.matchedLocations = terms.locations.filter(location => 
            normalizedQuery.includes(location)
        );

        // Find goal matches
        terms.matchedGoals = terms.goals.filter(goal => 
            normalizedQuery.includes(goal)
        );

        // Find experience matches
        terms.matchedExperience = terms.experience.filter(exp => 
            normalizedQuery.includes(exp)
        );

        return terms;
    }

    /**
     * Calculate relevance score for alumni
     */
    calculateRelevanceScore(alumni, searchTerms, originalQuery) {
        let score = 0;
        const weights = {
            name: 0.3,
            role: 0.25,
            company: 0.2,
            industry: 0.15,
            expertise: 0.2,
            location: 0.1,
            networking: 0.15,
            exact: 0.5
        };

        const personal = alumni.personal || {};
        const professional = alumni.professional || {};
        const networking = alumni.networking || {};

        // Exact matches get highest score
        const fullText = `${personal.name} ${professional.current_role} ${professional.company} ${professional.industry} ${personal.location?.city}`.toLowerCase();
        if (fullText.includes(originalQuery.toLowerCase())) {
            score += weights.exact;
        }

        // Name matching
        if (personal.name) {
            const nameMatch = this.fuzzyMatch(personal.name.toLowerCase(), searchTerms.keywords);
            score += nameMatch * weights.name;
        }

        // Role matching
        if (professional.current_role) {
            const roleMatch = this.fuzzyMatch(professional.current_role.toLowerCase(), searchTerms.keywords);
            score += roleMatch * weights.role;
            
            // Specific role matches
            if (searchTerms.matchedRoles.some(role => professional.current_role.toLowerCase().includes(role))) {
                score += weights.role * 0.5;
            }
        }

        // Company matching
        if (professional.company) {
            const companyMatch = this.fuzzyMatch(professional.company.toLowerCase(), searchTerms.keywords);
            score += companyMatch * weights.company;
        }

        // Industry matching
        if (professional.industry) {
            if (searchTerms.matchedIndustries.includes(professional.industry)) {
                score += weights.industry;
            }
        }

        // Expertise matching
        if (professional.expertise_tags) {
            const expertiseText = professional.expertise_tags.join(' ').toLowerCase();
            const expertiseMatch = this.fuzzyMatch(expertiseText, searchTerms.keywords);
            score += expertiseMatch * weights.expertise;
        }

        // Location matching
        if (personal.location) {
            const locationText = `${personal.location.city} ${personal.location.country}`.toLowerCase();
            if (searchTerms.matchedLocations.some(loc => locationText.includes(loc))) {
                score += weights.location;
            }
        }

        // Networking goals matching
        if (networking.goals || networking.offering) {
            const networkingText = [...(networking.goals || []), ...(networking.offering || [])].join(' ').toLowerCase();
            if (searchTerms.matchedGoals.some(goal => networkingText.includes(goal))) {
                score += weights.networking;
            }
        }

        return Math.min(score, 1.0); // Cap at 1.0
    }

    /**
     * Fuzzy string matching
     */
    fuzzyMatch(text, keywords) {
        if (!text || !keywords.length) return 0;

        let matches = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                matches++;
            } else {
                // Check for partial matches
                const similarity = this.stringSimilarity(text, keyword);
                if (similarity > 0.7) {
                    matches += similarity;
                }
            }
        });

        return Math.min(matches / keywords.length, 1.0);
    }

    /**
     * Calculate string similarity (Levenshtein-based)
     */
    stringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Display search results
     */
    displaySearchResults(results, query, isLiveSearch = false) {
        // Update app filtered data
        this.app.filteredData = results;
        this.app.searchMode = true;

        // Update cards display
        if (this.app.cardsManager) {
            this.app.cardsManager.renderCards(results);
        }

        // Show results info
        this.showResultsInfo(results.length, query, isLiveSearch);

        // Hide suggestions
        this.hideSuggestions();

        // Show empty state if no results
        if (results.length === 0) {
            this.app.showEmptyState();
        } else {
            this.app.hideEmptyState();
        }
    }

    /**
     * Show search results information
     */
    showResultsInfo(count, query, isLiveSearch) {
        if (!this.resultsInfo) return;

        const message = count === 0 
            ? `No results found for "${query}"`
            : `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;

        this.resultsInfo.textContent = message;
        this.resultsInfo.classList.add('visible');

        // Auto-hide for live search
        if (isLiveSearch) {
            setTimeout(() => {
                this.resultsInfo.classList.remove('visible');
            }, 2000);
        }
    }

    /**
     * Cache search results
     */
    cacheSearchResults(query, results) {
        // Limit cache size
        if (this.searchCache.size >= this.maxCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        this.searchCache.set(query, results);
    }

    /**
     * Generate base suggestions
     */
    generateBaseSuggestions() {
        this.suggestions = [
            { text: 'Find mentors in technology', type: 'example', icon: '🎯' },
            { text: 'Show entrepreneurs attending Summit 2025', type: 'example', icon: '🚀' },
            { text: 'Alumni working in fintech', type: 'example', icon: '💰' },
            { text: 'Senior professionals in healthcare', type: 'example', icon: '🏥' },
            { text: 'Available for networking now', type: 'example', icon: '🟢' },
            { text: 'Consultants offering advice', type: 'example', icon: '💡' },
            { text: 'Recent graduates (2020-2024)', type: 'example', icon: '🎓' },
            { text: 'Alumni in San Francisco', type: 'example', icon: '📍' }
        ];
    }

    /**
     * Update suggestions based on input
     */
    updateSuggestions(query) {
        const dynamicSuggestions = this.generateDynamicSuggestions(query);
        const historySuggestions = this.getHistorySuggestions(query);
        
        // Combine and deduplicate suggestions
        const allSuggestions = [
            ...dynamicSuggestions,
            ...historySuggestions,
            ...this.suggestions.filter(s => 
                s.text.toLowerCase().includes(query.toLowerCase())
            )
        ].slice(0, 8); // Limit to 8 suggestions

        this.renderSuggestions(allSuggestions);
    }

    /**
     * Generate dynamic suggestions based on current data
     */
    generateDynamicSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Industry suggestions
        const industries = [...new Set(this.app.alumniData.map(a => a.professional?.industry).filter(Boolean))];
        industries.forEach(industry => {
            if (industry.includes(queryLower) || queryLower.includes(industry)) {
                suggestions.push({
                    text: `Alumni in ${industry.replace('-', ' ')}`,
                    type: 'industry',
                    icon: this.getIndustryIcon(industry)
                });
            }
        });

        // Company suggestions
        const companies = [...new Set(this.app.alumniData.map(a => a.professional?.company).filter(Boolean))];
        companies.forEach(company => {
            if (company.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: `Alumni at ${company}`,
                    type: 'company',
                    icon: '🏢'
                });
            }
        });

        // Name suggestions
        this.app.alumniData.forEach(alumni => {
            if (alumni.personal?.name?.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: alumni.personal.name,
                    type: 'person',
                    icon: alumni.personal.photo || '👤'
                });
            }
        });

        return suggestions.slice(0, 5); // Limit dynamic suggestions
    }

    /**
     * Get industry icon
     */
    getIndustryIcon(industry) {
        const icons = {
            'technology': '💻',
            'finance': '💰',
            'healthcare': '🏥',
            'education': '🎓',
            'consulting': '💡',
            'marketing': '📢',
            'real-estate': '🏠',
            'nonprofit': '❤️'
        };
        return icons[industry] || '🔍';
    }

    /**
     * Get history-based suggestions
     */
    getHistorySuggestions(query) {
        const queryLower = query.toLowerCase();
        return this.searchHistory
            .filter(item => item.query.toLowerCase().includes(queryLower))
            .map(item => ({
                text: item.query,
                type: 'history',
                icon: '🕒'
            }))
            .slice(0, 3);
    }

    /**
     * Render suggestions in the UI
     */
    renderSuggestions(suggestions) {
        if (!this.suggestionsContainer) return;

        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('data-index', index);
            item.innerHTML = `
                <span class="suggestion-icon">${suggestion.icon}</span>
                <span class="suggestion-text">${suggestion.text}</span>
                <span class="suggestion-type">${suggestion.type}</span>
            `;
            
            item.addEventListener('click', () => {
                this.selectSuggestion(item);
            });
            
            this.suggestionsContainer.appendChild(item);
        });

        this.showSuggestions();
    }

    /**
     * Select a suggestion
     */
    selectSuggestion(suggestionElement) {
        const text = suggestionElement.querySelector('.suggestion-text')?.textContent;
        if (text) {
            this.searchInput.value = text;
            this.currentQuery = text;
            this.performSearch(text);
            this.hideSuggestions();
        }
    }

    /**
     * Show suggestions container
     */
    showSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.add('visible');
        }
    }

    /**
     * Hide suggestions container
     */
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.remove('visible');
        }
        this.selectedSuggestionIndex = -1;
    }

    /**
     * Show search loading state
     */
    showSearchLoading() {
        if (this.searchInput) {
            this.searchInput.parentElement?.classList.add('searching');
        }
    }

    /**
     * Hide search loading state
     */
    hideSearchLoading() {
        if (this.searchInput) {
            this.searchInput.parentElement?.classList.remove('searching');
        }
    }

    /**
     * Handle search error
     */
    handleSearchError(error, query) {
        console.error('Search error:', error);
        
        this.app.showNotification('error', 'Search Failed', 
            'Unable to complete search. Please try again.');
        
        // Fallback to showing all data
        this.app.filteredData = this.app.alumniData;
        if (this.app.cardsManager) {
            this.app.cardsManager.renderCards(this.app.alumniData);
        }
    }

    /**
     * Clear search
     */
    clearSearch() {
        this.currentQuery = '';
        this.app.searchMode = false;
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        if (this.resultsInfo) {
            this.resultsInfo.classList.remove('visible');
        }
        
        this.hideSuggestions();
        this.hideSearchLoading();
        
        // Reset to show all data
        this.app.filteredData = this.app.alumniData;
        if (this.app.cardsManager) {
            this.app.cardsManager.renderCards(this.app.alumniData);
        }
        
        this.app.hideEmptyState();
    }

    /**
     * Toggle voice search
     */
    toggleVoiceSearch() {
        if (this.isListening) {
            this.stopVoiceSearch();
        } else {
            this.startVoiceSearch();
        }
    }

    /**
     * Start voice search
     */
    startVoiceSearch() {
        if (!this.recognition) return;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Voice search error:', error);
            this.app.showNotification('error', 'Voice Search Error', 
                'Unable to start voice recognition. Please check your microphone permissions.');
        }
    }

    /**
     * Stop voice search
     */
    stopVoiceSearch() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    /**
     * Handle voice search start
     */
    handleVoiceStart() {
        this.isListening = true;
        this.voiceButton?.classList.add('recording', 'voice-recording-pulse');
        
        this.app.showNotification('info', 'Listening...', 
            'Speak your search query now', 0); // Don't auto-hide
    }

    /**
     * Handle voice search result
     */
    handleVoiceResult(event) {
        const results = event.results;
        const transcript = results[results.length - 1][0].transcript;
        
        if (transcript.trim()) {
            this.searchInput.value = transcript;
            this.currentQuery = transcript;
            this.performSearch(transcript);
            
            this.app.showNotification('success', 'Voice Search', 
                `Searching for: "${transcript}"`);
        }
    }

    /**
     * Handle voice search end
     */
    handleVoiceEnd() {
        this.isListening = false;
        this.voiceButton?.classList.remove('recording', 'voice-recording-pulse');
        
        // Hide listening notification
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (notification.textContent.includes('Listening...')) {
                notification.remove();
            }
        });
    }

    /**
     * Handle voice search error
     */
    handleVoiceError(event) {
        this.isListening = false;
        this.voiceButton?.classList.remove('recording', 'voice-recording-pulse');
        
        let errorMessage = 'Voice recognition failed. Please try again.';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone access denied. Please check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        this.app.showNotification('error', 'Voice Search Error', errorMessage);
    }

    /**
     * Add search to history
     */
    addToSearchHistory(query, resultCount) {
        const entry = {
            query,
            resultCount,
            timestamp: Date.now()
        };
        
        // Remove duplicate
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift(entry);
        
        // Limit history size
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(0, 20);
        }
        
        this.saveSearchHistory();
    }

    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * Check AI availability
     */
    checkAIAvailability() {
        // In production, you would set the API key
        // this.openAIApiKey = 'your-openai-api-key';
        // this.useAI = true;
        
        // For demo purposes, we'll use local search
        this.useAI = false;
        
        if (!this.useAI) {
            console.log('Using local search - configure OpenAI API key for AI-powered search');
        }
    }

    /**
     * Retry failed requests
     */
    retryFailedRequests() {
        if (this.failedRequests.length === 0) return;
        
        this.app.showNotification('info', 'Retrying Search', 
            `Retrying ${this.failedRequests.length} failed searches...`);
        
        const requests = [...this.failedRequests];
        this.failedRequests = [];
        
        requests.forEach(async (request) => {
            try {
                await this.performSearch(request.query);
            } catch (error) {
                console.error('Retry failed:', error);
            }
        });
    }

    /**
     * Get search analytics
     */
    getSearchAnalytics() {
        const analytics = {
            totalSearches: this.searchHistory.length,
            averageResults: 0,
            topQueries: {},
            searchSuccessRate: 0,
            failedRequests: this.failedRequests.length
        };
        
        if (this.searchHistory.length > 0) {
            // Calculate average results
            const totalResults = this.searchHistory.reduce((sum, item) => sum + item.resultCount, 0);
            analytics.averageResults = Math.round(totalResults / this.searchHistory.length);
            
            // Count query frequency
            this.searchHistory.forEach(item => {
                analytics.topQueries[item.query] = (analytics.topQueries[item.query] || 0) + 1;
            });
            
            // Calculate success rate
            const successfulSearches = this.searchHistory.filter(item => item.resultCount > 0).length;
            analytics.searchSuccessRate = Math.round((successfulSearches / this.searchHistory.length) * 100);
        }
        
        return analytics;
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Stop voice recognition
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Save search history
        this.saveSearchHistory();
        
        // Clear cache
        this.searchCache.clear();
        
        // Reset state
        this.currentQuery = '';
        this.isSearching = false;
        this.isListening = false;
    }
}