// ============================================
// GEMTRA GAMES - Professional Gaming Platform
// ============================================

// ============================================
// PROXY CONFIGURATION
// ============================================
const PROXY_CONFIG = {
    enabled: true,
    workerUrl: 'https://gemtra-proxy.modmojheh.workers.dev',
    debug: false,
    logLevel: 'warn'
};

// ============================================
// DETAILED LOGGING SYSTEM
// ============================================
const ProxyLogger = {
    styles: {
        info: 'color: #00d4ff; font-weight: bold;',
        success: 'color: #00ff64; font-weight: bold;',
        warn: 'color: #ffa500; font-weight: bold;',
        error: 'color: #ff4444; font-weight: bold;',
        debug: 'color: #888; font-style: italic;',
        verbose: 'color: #666; font-size: 10px;',
        header: 'color: #ff00ff; font-weight: bold; font-size: 14px; background: #1a1a2e; padding: 4px 8px; border-radius: 4px;'
    },
    
    levels: { verbose: 0, debug: 1, info: 2, warn: 3, error: 4 },
    
    currentLevel() {
        return this.levels[PROXY_CONFIG.logLevel] || 0;
    },
    
    shouldLog(level) {
        return PROXY_CONFIG.debug && this.levels[level] >= this.currentLevel();
    },
    
    formatTime() {
        const now = new Date();
        return `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    },
    
    header(msg) {
        console.log(`%c🎮 [GEMTRA PROXY] ${msg}`, this.styles.header);
    },
    
    info(msg, ...data) {
        if (!this.shouldLog('info')) return;
        console.log(`%c[${this.formatTime()}] ℹ️ ${msg}`, this.styles.info, ...data);
    },
    
    success(msg, ...data) {
        if (!this.shouldLog('info')) return;
        console.log(`%c[${this.formatTime()}] ✅ ${msg}`, this.styles.success, ...data);
    },
    
    warn(msg, ...data) {
        if (!this.shouldLog('warn')) return;
        console.warn(`%c[${this.formatTime()}] ⚠️ ${msg}`, this.styles.warn, ...data);
    },
    
    error(msg, ...data) {
        if (!this.shouldLog('error')) return;
        console.error(`%c[${this.formatTime()}] ❌ ${msg}`, this.styles.error, ...data);
    },
    
    debug(msg, ...data) {
        if (!this.shouldLog('debug')) return;
        console.log(`%c[${this.formatTime()}] 🔧 ${msg}`, this.styles.debug, ...data);
    },
    
    verbose(msg, ...data) {
        if (!this.shouldLog('verbose')) return;
        console.log(`%c[${this.formatTime()}] 📝 ${msg}`, this.styles.verbose, ...data);
    },
    
    table(label, data) {
        if (!this.shouldLog('debug')) return;
        console.log(`%c[${this.formatTime()}] 📊 ${label}:`, this.styles.debug);
        console.table(data);
    },
    
    group(label) {
        if (!this.shouldLog('debug')) return;
        console.group(`%c[${this.formatTime()}] 📂 ${label}`, this.styles.info);
    },
    
    groupEnd() {
        if (!this.shouldLog('debug')) return;
        console.groupEnd();
    },
    
    network(method, url, status, duration) {
        if (!this.shouldLog('verbose')) return;
        const statusColor = status >= 200 && status < 300 ? '#00ff64' : status >= 400 ? '#ff4444' : '#ffa500';
        console.log(
            `%c[${this.formatTime()}] 🌐 ${method} %c${url} %c${status} %c(${duration}ms)`,
            this.styles.verbose,
            'color: #00d4ff;',
            `color: ${statusColor}; font-weight: bold;`,
            'color: #888;'
        );
    },
    
    iframe(event, details) {
        if (!this.shouldLog('debug')) return;
        console.log(`%c[${this.formatTime()}] 🖼️ IFRAME ${event}:`, this.styles.debug, details);
    }
};

// ============================================
// PROXY URL BUILDER
// ============================================
function buildProxyUrl(originalUrl) {
    if (!PROXY_CONFIG.enabled) return originalUrl;
    if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;
    if (originalUrl.includes(PROXY_CONFIG.workerUrl)) return originalUrl;
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:') || originalUrl.startsWith('about:')) return originalUrl;
    
    return `${PROXY_CONFIG.workerUrl}/play/${originalUrl}`;
}

// Build proxied image URL to hide image domains from school filters
function buildProxyImageUrl(originalUrl) {
    if (!PROXY_CONFIG.enabled) return originalUrl;
    if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) return originalUrl;
    
    // Route images through proxy's raw endpoint (passthrough, no rewriting)
    return `${PROXY_CONFIG.workerUrl}/raw/${originalUrl}`;
}

// ============================================
// PROXY HEALTH CHECK
// ============================================
async function checkProxyHealth() {
    ProxyLogger.header('Checking Proxy Health');
    const startTime = performance.now();
    
    try {
        ProxyLogger.debug('Sending health check request to:', PROXY_CONFIG.workerUrl);
        
        const response = await fetch(PROXY_CONFIG.workerUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        const duration = Math.round(performance.now() - startTime);
        ProxyLogger.network('GET', PROXY_CONFIG.workerUrl, response.status, duration);
        
        if (response.ok) {
            ProxyLogger.success(`Proxy is healthy! Response time: ${duration}ms`);
            ProxyLogger.table('Response Headers', Object.fromEntries(response.headers.entries()));
            return { healthy: true, latency: duration, status: response.status };
        } else {
            ProxyLogger.error(`Proxy returned error status: ${response.status}`);
            return { healthy: false, latency: duration, status: response.status };
        }
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        ProxyLogger.error('Proxy health check failed:', error.message);
        ProxyLogger.verbose('Error details:', error);
        return { healthy: false, latency: duration, error: error.message };
    }
}

// Run health check on load
if (PROXY_CONFIG.enabled) {
    checkProxyHealth().then(result => {
        if (!result.healthy) {
            console.warn('Proxy unavailable, games will try direct connections');
            // Add a small indicator
            const badge = document.querySelector('.hero-badge span:last-child');
            if (badge) {
                badge.textContent = '60+ Free Games Available';
            }
        }
    });
}

// ============================================
// GAMES DATABASE - VERIFIED WORKING GAMES ONLY
// ============================================
const GAMES = {
    'gd-main': {
        name: 'Geometry Dash',
        url: 'https://lolygames.github.io/gd-lit/',
        description: 'The original rhythm-based platformer. Jump, fly and flip your way through dangerous passages.',
        touchscreen: true,
        image: 'https://geodash.org/images/geodash-game-image.webp',
        category: 'rhythm',
        featured: true,
        plays: 125000
    },
    'block-blast': {
        name: 'Block Blast',
        url: 'https://block-blast-puzzle.github.io/file',
        description: 'Drag, match, and clear blocks to score points!',
        touchscreen: true,
        image: 'https://block-blast-puzzle.github.io/images/icon_game.png',
        category: 'puzzle',
        featured: true,
        plays: 345000
    },
    'infinite-craft': {
        name: 'Infinite Craft',
        url: 'https://infinite-craft.modmojheh.workers.dev/infinite-craft/',
        newTab: false,
        description: 'Combine elements to create anything!',
        touchscreen: true,
        image: 'infinite-craft.svg',
        category: 'puzzle',
        featured: true,
        plays: 890000
    },
    'a-small-world-cup': {
        name: 'A Small World Cup',
        url: './a-small-world-cup/index.html',
        description: 'Fun physics-based soccer game! Use ragdoll physics to score goals in this addictive World Cup game.',
        touchscreen: true,
        image: './a-small-world-cup/icon-256.png',
        category: 'sports',
        featured: true,
        plays: 95000
    },
    'push-your-luck': {
        name: 'Push Your Luck',
        url: './games/push-your-luck/index.html',
        description: 'Spin the wheel and push your luck! How far will you go before you lose it all?',
        touchscreen: true,
        image: './games/push-your-luck/assets/favicon.ico',
        category: 'casual',
        featured: true,
        plays: 0
    },
    'tiny-fishing': {
        name: 'Tiny Fishing',
        url: './games/tiny-fishing/index.html',
        description: 'Cast your line and catch as many fish as you can! Upgrade your gear to catch bigger and rarer fish.',
        touchscreen: true,
        image: './games/tiny-fishing/html5game/pcLogoLoading.png',
        category: 'casual',
        featured: true,
        plays: 0
    },
    'moto-x3m': {
        name: 'Moto X3M',
        url: './games/moto-x3m/index.html',
        description: 'Race your motorcycle through challenging obstacle courses! Perform stunts, beat the clock, and earn stars across 25 thrilling levels.',
        touchscreen: true,
        image: './games/moto-x3m/assets/images/x1/menu_texture.png',
        category: 'sports',
        featured: true,
        plays: 0
    },
    'mr-president': {
        name: 'Mr. President!',
        url: './games/mr-president/index.html',
        description: 'Play as a bodyguard protecting the president! Jump in the way of bullets, dodge dangers, and save the day across 10 action-packed 3D levels.',
        touchscreen: true,
        image: './games/mr-president/thumbnail.webp',
        category: 'casual',
        featured: true,
        plays: 0
    }
};

// ============================================
// CATEGORY DEFINITIONS
// ============================================
const CATEGORIES = {
    all: { name: 'All Games', icon: '🎮', color: '#6366f1' },
    featured: { name: 'Featured', icon: '⭐', color: '#f59e0b' },
    favorites: { name: 'Favorites', icon: '❤️', color: '#ef4444' },
    rhythm: { name: 'Rhythm', icon: '🎵', color: '#8b5cf6' },
    puzzle: { name: 'Puzzle', icon: '🧩', color: '#6366f1' },
    sports: { name: 'Sports', icon: '⚽', color: '#10b981' },
    casual: { name: 'Casual', icon: '🎈', color: '#a855f7' }
};

// ============================================
// STATE MANAGEMENT
// ============================================
let currentFilter = 'all';
let currentSort = 'popular';
let searchQuery = '';
let favorites = [];
let recentlyPlayed = [];
try {
    favorites = JSON.parse(localStorage.getItem('gemtraFavorites')) || [];
    if (!Array.isArray(favorites)) favorites = [];
} catch (e) { favorites = []; }
try {
    recentlyPlayed = JSON.parse(localStorage.getItem('gemtraRecent')) || [];
    if (!Array.isArray(recentlyPlayed)) recentlyPlayed = [];
} catch (e) { recentlyPlayed = []; }
let currentGame = null;
let viewMode = localStorage.getItem('gemtraViewMode') || 'grid';
let firebaseInitialized = false;
let realtimePlayCounts = {}; // Store real-time play counts from Firebase
let ticketNotificationListener = null; // Listener for ticket updates
let lastTicketCheckTime = parseInt(localStorage.getItem('gemtraLastTicketCheck')) || 0;
let previousUnreadCount = 0; // Track previous count to detect new notifications

// ============================================
// FIREBASE REAL-TIME FUNCTIONALITY
// ============================================
function initializeFirebase() {
    if (window.firebaseReady && !firebaseInitialized) {
        try {
            setupFirebaseListeners();
            firebaseInitialized = true;
            console.log('🔥 Firebase initialized!');
        } catch (error) {
            console.warn('Firebase initialization failed:', error);
            firebaseInitialized = false;
        }
    }
}

function setupFirebaseListeners() {
    if (!window.firebaseDB || !window.firebaseRef || !window.firebaseOnValue) {
        console.warn('Firebase dependencies not available');
        return;
    }

    try {
        // Listen for real-time play count updates
        const playsRef = window.firebaseRef(window.firebaseDB, 'games/plays');
        window.firebaseOnValue(playsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    realtimePlayCounts = snapshot.val();
                    updateAllPlayCountDisplays();
                }
            } catch (e) {
                console.warn('Error processing play counts:', e);
            }
        }, (error) => {
            console.warn('Play counts listener error:', error);
        });

        // Listen for total site stats
        const statsRef = window.firebaseRef(window.firebaseDB, 'stats');
        window.firebaseOnValue(statsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    const stats = snapshot.val();
                    updateSiteStats(stats);
                }
            } catch (e) {
                console.warn('Error processing stats:', e);
            }
        }, (error) => {
            console.warn('Stats listener error:', error);
        });

        // Setup presence tracking for online users
        setupPresence();
    } catch (error) {
        console.warn('Error setting up Firebase listeners:', error);
    }
}

function updateAllPlayCountDisplays() {
    // Update play counts on all visible game cards
    Object.entries(realtimePlayCounts).forEach(([gameKey, plays]) => {
        const card = document.querySelector(`.game-card[data-game="${gameKey}"]`);
        if (card) {
            const playsEl = card.querySelector('.card-plays');
            if (playsEl) {
                const svg = playsEl.querySelector('svg');
                playsEl.innerHTML = '';
                if (svg) playsEl.appendChild(svg);
                playsEl.appendChild(document.createTextNode(' ' + formatNumber(plays)));
            }
        }
    });
}

function updateSiteStats(stats) {
    if (stats.totalPlays !== undefined) {
        const totalPlaysEl = document.getElementById('statTotalPlays');
        if (totalPlaysEl) {
            totalPlaysEl.textContent = formatNumber(stats.totalPlays);
        }
    }
    if (stats.onlineCount !== undefined) {
        const onlineEl = document.getElementById('statOnline');
        if (onlineEl) {
            onlineEl.textContent = stats.onlineCount;
        }
    }
}

// Track user presence (online status)
async function setupPresence() {
    if (!window.firebaseDB || !window.firebaseRef || !window.firebaseSet || !window.firebaseOnValue) {
        console.warn('Firebase presence dependencies not available');
        return;
    }

    let presenceInterval = null;

    try {
        // Generate unique session ID
        const sessionId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        const presenceRef = window.firebaseRef(window.firebaseDB, `presence/${sessionId}`);
        const onlineCountRef = window.firebaseRef(window.firebaseDB, 'stats/onlineCount');

        // Set user as online
        await window.firebaseSet(presenceRef, {
            online: true,
            timestamp: Date.now(),
            page: window.location.pathname
        }).catch(e => console.warn('Initial presence set failed:', e));

        // Listen for online count changes
        window.firebaseOnValue(onlineCountRef, (snapshot) => {
            try {
                const count = snapshot.val() || 0;
                const onlineEl = document.getElementById('statOnline');
                if (onlineEl) {
                    onlineEl.textContent = count;
                }
            } catch (e) {
                console.warn('Online count update failed:', e);
            }
        }, (error) => {
            console.warn('Online count listener error:', error);
        });

        // Update online count when user connects
        const presenceListRef = window.firebaseRef(window.firebaseDB, 'presence');
        window.firebaseOnValue(presenceListRef, (snapshot) => {
            try {
                const presenceData = snapshot.val() || {};
                const now = Date.now();
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                
                // Count users active in last 5 minutes
                let onlineCount = 0;
                Object.values(presenceData).forEach(user => {
                    if (user && user.timestamp && user.timestamp > fiveMinutesAgo) {
                        onlineCount++;
                    }
                });
                
                // Update the online count in stats
                window.firebaseSet(onlineCountRef, onlineCount).catch(e => {
                    // Silently fail - this is not critical
                });
            } catch (e) {
                console.warn('Presence count update failed:', e);
            }
        }, (error) => {
            console.warn('Presence list listener error:', error);
        });

        // Update presence every 2 minutes to keep alive
        presenceInterval = setInterval(async () => {
            try {
                await window.firebaseSet(presenceRef, {
                    online: true,
                    timestamp: Date.now(),
                    page: window.location.pathname
                });
            } catch (e) {
                // Silently fail - not critical
            }
        }, 2 * 60 * 1000);

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            if (presenceInterval) {
                clearInterval(presenceInterval);
            }
        });

        console.log('👤 Presence tracking active');
    } catch (error) {
        console.warn('Presence setup error:', error);
        // Clean up interval if setup failed
        if (presenceInterval) {
            clearInterval(presenceInterval);
        }
    }
}

async function incrementPlayCount(gameKey) {
    if (!window.firebaseDB || !window.firebaseRef || !window.firebaseRunTransaction) {
        console.warn('Firebase not available for play count');
        return;
    }

    try {
        // Increment play count for this game
        const gamePlayRef = window.firebaseRef(window.firebaseDB, `games/plays/${gameKey}`);
        await window.firebaseRunTransaction(gamePlayRef, (currentPlays) => {
            return (currentPlays || 0) + 1;
        });

        // Increment total site plays
        const totalPlaysRef = window.firebaseRef(window.firebaseDB, 'stats/totalPlays');
        await window.firebaseRunTransaction(totalPlaysRef, (currentTotal) => {
            return (currentTotal || 0) + 1;
        });

        // Log analytics event (non-blocking)
        if (window.firebaseLogEvent && window.firebaseAnalytics) {
            try {
                window.firebaseLogEvent(window.firebaseAnalytics, 'game_play', {
                    game_key: gameKey,
                    game_name: GAMES[gameKey]?.name || gameKey
                });
            } catch (analyticsError) {
                // Analytics errors are non-critical
            }
        }

        console.log(`🎮 Play counted for: ${gameKey}`);
    } catch (error) {
        console.warn('Firebase play count error:', error);
        // Continue silently - play count is not critical for user experience
    }
}

// Get play count (Firebase or fallback to local)
function getPlayCount(gameKey) {
    if (realtimePlayCounts[gameKey]) {
        return realtimePlayCounts[gameKey];
    }
    return GAMES[gameKey]?.plays || 0;
}

// ============================================
// DOM ELEMENTS (initialized after DOM ready)
// ============================================
let elements = {};

// ============================================
// INITIALIZATION
// ============================================
// Track page load start time for minimum loading duration
window.pageLoadStartTime = Date.now();

document.addEventListener('DOMContentLoaded', () => {
    // Keep scroll locked at top during initialization
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Initialize DOM elements now that DOM is ready
    const loadingEl = document.getElementById('loadingScreen');
    
    elements = {
        loadingScreen: loadingEl,
        gamesGrid: document.getElementById('gamesGrid'),
        searchInput: document.getElementById('searchInput'),
        searchClear: document.getElementById('searchClear'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        sortBtn: document.getElementById('sortBtn'),
        sortMenu: document.getElementById('sortMenu'),
        viewBtns: document.querySelectorAll('.view-btn'),
        gameModal: document.getElementById('gameModal'),
        gameIframe: document.getElementById('gameIframe'),
        modalTitle: document.getElementById('modalGameTitle'),
        modalClose: document.getElementById('modalClose'),
        modalFullscreen: document.getElementById('modalFullscreen'),
        modalFavorite: document.getElementById('modalFavorite'),
        modalRestart: document.getElementById('modalRestart'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        themeToggle: document.getElementById('themeToggle'),
        navToggle: document.getElementById('navToggle'),
        navMenu: document.getElementById('navMenu'),
        backToTop: document.getElementById('backToTop'),
        toastContainer: document.getElementById('toastContainer'),
        gameCountDisplay: document.getElementById('gameCount'),
        featuredGrid: document.getElementById('featuredGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
        heroPlayBtn: document.getElementById('heroPlayBtn')
    };
    
    initializeApp();
});

function initializeApp() {
    // Initialize Firebase if ready, or wait for it
    if (window.firebaseReady) {
        initializeFirebase();
    } else {
        window.addEventListener('firebaseReady', initializeFirebase);
    }

    // Initialize all features
    renderGames();
    renderFeaturedGames();
    initializeSearch();
    initializeFilters();
    initializeSort();
    initializeViewToggle();
    initializeModal();
    initializeTheme();
    initializeMobileMenu();
    initializeBackToTop();
    initializeSmoothScroll();
    initializeHeroPlay();
    updateFavoritesCount();
    updateGameCount();

    // Set initial view mode
    if (elements.gamesGrid) {
        elements.gamesGrid.className = `games-grid ${viewMode}-view`;
    }

    // Track when initialization started
    const initStartTime = window.pageLoadStartTime || Date.now();
    const minLoadingTime = 800; // Quick loading screen
    const elapsed = Date.now() - initStartTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);

    // Hide loading screen after minimum time and ensure page is at top
    setTimeout(() => {
        // Scroll to very top before showing content
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                hideLoadingScreen();
            });
        });
    }, remainingTime);

    console.log('🎮 Gemtra Games initialized successfully!');
}

// ============================================
// HIDE LOADING SCREEN - ENHANCED
// ============================================
function hideLoadingScreen() {
    const loader = document.getElementById('loadingScreen');
    const html = document.documentElement;
    
    if (loader) {
        // Force scroll to absolute top before showing content
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Add hidden class to trigger fade out
        loader.classList.add('hidden');
        
        // Remove loading class from html to enable scroll and show content
        setTimeout(() => {
            html.classList.remove('loading');
            // Ensure scroll is at top after loading
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
        
        // Remove loader from DOM after animation
        setTimeout(() => {
            loader.style.display = 'none';
        }, 600);
    } else {
        // If no loader, just enable content
        html.classList.remove('loading');
    }
}

// ============================================
// GAME RENDERING
// ============================================
function renderGames() {
    if (!elements.gamesGrid) return;

    const filteredGames = getFilteredGames();
    const sortedGames = getSortedGames(filteredGames);

    elements.gamesGrid.innerHTML = '';

    if (sortedGames.length === 0) {
        const searchTerm = searchQuery || '';
        elements.gamesGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No games found${searchTerm ? ` for "${searchTerm}"` : ''}</h3>
                <p>We don't have what you're looking for yet - but you can request it!</p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px;">
                    <button class="btn btn-primary" onclick="openRequestModal('game-request')">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Request This Game
                    </button>
                    <button class="btn btn-secondary" onclick="clearAllFilters()">Clear Filters</button>
                </div>
            </div>
        `;
        updateGameCountDisplay(0);
        updateSectionTitle();
        return;
    }

    sortedGames.forEach(([key, game], index) => {
        const card = createGameCard(key, game, index);
        elements.gamesGrid.appendChild(card);
    });

    // Update game count and section title
    updateGameCountDisplay(sortedGames.length);
    updateSectionTitle();
}

function createGameCard(key, game, index) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game', key);
    card.setAttribute('data-category', game.category);
    card.style.animationDelay = `${index * 0.05}s`;

    const isFavorite = favorites.includes(key);
    const categoryInfo = CATEGORIES[game.category] || CATEGORIES.casual;
    const playCount = getPlayCount(key);
    
    // Use proxied image URL to bypass school filters
    const imageUrl = buildProxyImageUrl(game.image);

    card.innerHTML = `
        <div class="card-image-wrapper">
            <img class="card-image" src="${imageUrl}" alt="${game.name}" loading="lazy" onerror="handleImageError(this, '${game.name}')">
            <div class="card-overlay">
                <button class="play-btn" aria-label="Play ${game.name}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-game="${key}" aria-label="Add to favorites">
                <svg viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
            ${game.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
        </div>
        <div class="card-content">
            <span class="card-category" style="--category-color: ${categoryInfo.color}">
                ${categoryInfo.icon} ${categoryInfo.name}
            </span>
            <h3 class="card-title">${game.name}</h3>
            <p class="card-description">${game.description}</p>
            <div class="card-meta">
                <span class="card-plays">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    ${formatNumber(playCount)}
                </span>
                <span class="card-touch ${game.touchscreen ? 'supported' : ''}">
                    ${game.touchscreen ? '📱 Touch' : '🖥️ Desktop'}
                </span>
            </div>
        </div>
    `;

    // Add click handlers
    const playBtn = card.querySelector('.play-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const cardImage = card.querySelector('.card-image-wrapper');

    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openGame(key);
    });

    cardImage.addEventListener('click', () => {
        openGame(key);
    });

    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(key);
    });

    return card;
}

function handleImageError(img, gameName) {
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'card-image card-image-placeholder';
    placeholder.innerHTML = `<span class="placeholder-letter">${gameName.charAt(0).toUpperCase()}</span>`;
    img.parentNode.insertBefore(placeholder, img);
}

// ============================================
// FILTERING & SORTING
// ============================================
function getFilteredGames() {
    let games = Object.entries(GAMES);

    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        games = games.filter(([key, game]) => 
            game.name.toLowerCase().includes(query) ||
            game.description.toLowerCase().includes(query) ||
            game.category.toLowerCase().includes(query)
        );
    }

    // Apply category filter
    if (currentFilter === 'favorites') {
        games = games.filter(([key]) => favorites.includes(key));
    } else if (currentFilter === 'featured') {
        games = games.filter(([key, game]) => game.featured);
    } else if (currentFilter !== 'all') {
        games = games.filter(([key, game]) => game.category === currentFilter);
    }

    return games;
}

function getSortedGames(games) {
    switch (currentSort) {
        case 'popular':
            // Use Firebase real-time play counts if available, fallback to local
            return games.sort((a, b) => getPlayCount(b[0]) - getPlayCount(a[0]));
        case 'newest':
            return games.reverse();
        case 'alphabetical':
            return games.sort((a, b) => a[1].name.localeCompare(b[1].name));
        case 'random':
            return games.sort(() => Math.random() - 0.5);
        default:
            return games;
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initializeSearch() {
    const mainSearchInput = document.getElementById('mainSearchInput');
    const mainSearchClear = document.getElementById('mainSearchClear');

    // Hide clear buttons initially
    if (elements.searchClear) {
        elements.searchClear.style.display = 'none';
    }
    if (mainSearchClear) {
        mainSearchClear.style.display = 'none';
    }

    // Function to handle search
    const handleSearch = (value) => {
        searchQuery = value.trim();
        // Sync both search inputs
        if (elements.searchInput) elements.searchInput.value = value;
        if (mainSearchInput) mainSearchInput.value = value;
        // Update clear buttons
        if (elements.searchClear) elements.searchClear.style.display = searchQuery ? 'flex' : 'none';
        if (mainSearchClear) mainSearchClear.style.display = searchQuery ? 'flex' : 'none';
        renderGames();
    };

    // Nav search input
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce((e) => {
            handleSearch(e.target.value);
        }, 300));
    }

    // Main search input
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', debounce((e) => {
            handleSearch(e.target.value);
        }, 300));
    }

    // Clear buttons
    if (elements.searchClear) {
        elements.searchClear.addEventListener('click', () => {
            handleSearch('');
        });
    }

    if (mainSearchClear) {
        mainSearchClear.addEventListener('click', () => {
            handleSearch('');
        });
    }
}

// ============================================
// FILTER BUTTONS
// ============================================
function initializeFilters() {
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderGames();
        });
    });

    // Category cards in the categories section
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const category = card.dataset.category;
            if (category) {
                currentFilter = category;
                // Update filter buttons
                elements.filterButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
                renderGames();
                // Scroll to games section
                document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// SORT FUNCTIONALITY
// ============================================
function initializeSort() {
    if (!elements.sortBtn || !elements.sortMenu) return;

    elements.sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.sortMenu.classList.toggle('show');
    });

    elements.sortMenu.querySelectorAll('[data-sort]').forEach(item => {
        item.addEventListener('click', () => {
            currentSort = item.dataset.sort;
            elements.sortBtn.querySelector('span').textContent = item.textContent;
            elements.sortMenu.classList.remove('show');
            renderGames();
        });
    });

    document.addEventListener('click', () => {
        elements.sortMenu.classList.remove('show');
    });
}

// ============================================
// VIEW TOGGLE
// ============================================
function initializeViewToggle() {
    elements.viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            viewMode = btn.dataset.view;
            localStorage.setItem('gemtraViewMode', viewMode);
            
            if (elements.gamesGrid) {
                elements.gamesGrid.className = `games-grid ${viewMode}-view`;
            }
        });
    });
}

// ============================================
// GAME MODAL
// ============================================
function initializeModal() {
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeGame);
    }

    if (elements.modalBackdrop) {
        elements.modalBackdrop.addEventListener('click', closeGame);
    }

    if (elements.modalFullscreen) {
        elements.modalFullscreen.addEventListener('click', toggleFullscreen);
    }

    if (elements.modalFavorite) {
        elements.modalFavorite.addEventListener('click', () => {
            if (currentGame) {
                toggleFavorite(currentGame);
                updateModalFavoriteButton();
            }
        });
    }

    if (elements.modalRestart) {
        elements.modalRestart.addEventListener('click', restartGame);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.gameModal?.classList.contains('active')) {
            closeGame();
        }
        // Fullscreen on F key
        if (e.key === 'f' && elements.gameModal?.classList.contains('active')) {
            toggleFullscreen();
        }
        // Restart on R key
        if (e.key === 'r' && elements.gameModal?.classList.contains('active')) {
            restartGame();
        }
    });
}

function openGame(gameKey) {
    const game = GAMES[gameKey];
    if (!game) return;

    currentGame = gameKey;

    // Add to recently played
    addToRecentlyPlayed(gameKey);

    // Increment play count in Firebase
    incrementPlayCount(gameKey);

    // Navigate to dedicated play page
    const params = new URLSearchParams({
        game: gameKey,
        url: game.url,
        name: game.name,
        touch: game.touchscreen ? 'true' : 'false'
    });
    window.location.href = `play.html?${params.toString()}`;
}

// Show error overlay when game fails to load
function showGameError(game, gameKey, message) {
    const frameContainer = document.querySelector('.game-frame-container');
    if (!frameContainer) return;
    
    // Remove loading overlay
    const loadingOverlay = frameContainer.querySelector('.game-loading-overlay');
    if (loadingOverlay) loadingOverlay.remove();
    
    // Remove old error overlay
    const oldError = frameContainer.querySelector('.game-error-overlay');
    if (oldError) oldError.remove();
    
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'game-error-overlay';
    errorOverlay.innerHTML = `
        <div class="game-error-icon">⚠️</div>
        <div class="game-error-title">Couldn't Load Game</div>
        <div class="game-error-msg">${escapeHtml(message)}</div>
        <div class="game-error-actions">
            <button class="btn btn-primary" onclick="retryGame('${gameKey}')">🔄 Retry with Proxy</button>
            <button class="btn btn-secondary" onclick="retryGameDirect('${gameKey}')">⚡ Try Direct Link</button>
            <button class="btn btn-secondary" onclick="window.open('${escapeHtml(game.url)}', '_blank')">🔗 Open in New Tab</button>
        </div>
    `;
    frameContainer.appendChild(errorOverlay);
}

// Retry loading game through proxy
function retryGame(gameKey) {
    const game = GAMES[gameKey];
    if (!game || !elements.gameIframe) return;
    
    // Remove error overlay
    const errorOverlay = document.querySelector('.game-error-overlay');
    if (errorOverlay) errorOverlay.remove();
    
    // Show loading overlay again
    const frameContainer = document.querySelector('.game-frame-container');
    if (frameContainer) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'game-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="game-loading-spinner"></div>
            <div class="game-loading-text">Retrying ${escapeHtml(game.name)}...</div>
        `;
        frameContainer.appendChild(loadingOverlay);
    }
    
    elements.gameIframe.src = buildProxyUrl(game.url);
    
    setTimeout(() => {
        const overlay = document.querySelector('.game-loading-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    }, 8000);
}

// Retry loading game with direct URL (no proxy)
function retryGameDirect(gameKey) {
    const game = GAMES[gameKey];
    if (!game || !elements.gameIframe) return;
    
    const errorOverlay = document.querySelector('.game-error-overlay');
    if (errorOverlay) errorOverlay.remove();
    
    const frameContainer = document.querySelector('.game-frame-container');
    if (frameContainer) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'game-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="game-loading-spinner"></div>
            <div class="game-loading-text">Trying direct connection...</div>
        `;
        frameContainer.appendChild(loadingOverlay);
    }
    
    elements.gameIframe.src = game.url;
    
    setTimeout(() => {
        const overlay = document.querySelector('.game-loading-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    }, 8000);
}

window.retryGame = retryGame;
window.retryGameDirect = retryGameDirect;

function closeGame() {
    // Remove loading/error overlays
    document.querySelectorAll('.game-loading-overlay, .game-error-overlay').forEach(el => el.remove());
    
    // Clear the iframe to prevent beforeunload warnings
    if (elements.gameIframe) {
        const iframe = elements.gameIframe;
        const parent = iframe.parentNode;
        
        // Create a new clean iframe to replace the old one
        const newIframe = document.createElement('iframe');
        newIframe.id = 'gameIframe';
        newIframe.src = 'about:blank';
        newIframe.allow = 'autoplay; fullscreen; accelerometer; gyroscope; gamepad; microphone; camera';
        
        // Replace old iframe with new one (bypasses beforeunload)
        parent.replaceChild(newIframe, iframe);
        elements.gameIframe = newIframe;
    }

    if (elements.gameModal) {
        elements.gameModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    currentGame = null;

    // Exit fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function toggleFullscreen() {
    const modalContainer = document.querySelector('.modal-container');
    if (!modalContainer) return;

    if (!document.fullscreenElement) {
        modalContainer.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
            showToast('Fullscreen not available', 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

function restartGame() {
    if (elements.gameIframe && currentGame) {
        elements.gameIframe.src = elements.gameIframe.src;
        showToast('Game restarted', 'info');
    }
}

function updateModalFavoriteButton() {
    if (!elements.modalFavorite || !currentGame) return;

    const isFavorite = favorites.includes(currentGame);
    const svg = elements.modalFavorite.querySelector('svg');
    
    if (svg) {
        svg.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
    }
    
    elements.modalFavorite.classList.toggle('active', isFavorite);
}

// ============================================
// FAVORITES SYSTEM
// ============================================
function toggleFavorite(gameKey) {
    const index = favorites.indexOf(gameKey);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(gameKey);
        showToast('Added to favorites!', 'success');
    }

    localStorage.setItem('gemtraFavorites', JSON.stringify(favorites));
    
    // Update UI
    const card = document.querySelector(`.game-card[data-game="${gameKey}"]`);
    if (card) {
        const btn = card.querySelector('.favorite-btn');
        const svg = btn?.querySelector('svg');
        if (btn) btn.classList.toggle('active', favorites.includes(gameKey));
        if (svg) svg.setAttribute('fill', favorites.includes(gameKey) ? 'currentColor' : 'none');
    }

    // Update favorites count in nav
    updateFavoritesCount();

    // Re-render if on favorites filter
    if (currentFilter === 'favorites') {
        renderGames();
    }
}

// ============================================
// RECENTLY PLAYED
// ============================================
function addToRecentlyPlayed(gameKey) {
    recentlyPlayed = recentlyPlayed.filter(key => key !== gameKey);
    recentlyPlayed.unshift(gameKey);
    recentlyPlayed = recentlyPlayed.slice(0, 10);
    localStorage.setItem('gemtraRecent', JSON.stringify(recentlyPlayed));
}

// ============================================
// THEME TOGGLE
// ============================================
function initializeTheme() {
    const savedTheme = localStorage.getItem('gemtraTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('gemtraTheme', newTheme);

            // Update icon
            const icon = elements.themeToggle.querySelector('svg');
            if (icon) {
                if (newTheme === 'light') {
                    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
                } else {
                    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
                }
            }

            showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
        });
    }
}

// ============================================
// MOBILE MENU
// ============================================
function initializeMobileMenu() {
    if (!elements.navToggle || !elements.navMenu) return;

    elements.navToggle.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
        elements.navToggle.classList.toggle('active');
    });

    // Close menu when clicking a link
    elements.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu.classList.remove('active');
            elements.navToggle.classList.remove('active');
        });
    });
}

// ============================================
// BACK TO TOP
// ============================================
function initializeBackToTop() {
    if (!elements.backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    });

    elements.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// ============================================
// HERO PLAY BUTTON
// ============================================
function initializeHeroPlay() {
    if (elements.heroPlayBtn) {
        elements.heroPlayBtn.addEventListener('click', () => {
            openGame('gd-main');
        });
    }
    
    // Proxy the hero image to bypass school filters
    const heroImage = document.getElementById('heroImage');
    if (heroImage && PROXY_CONFIG.enabled) {
        const originalSrc = heroImage.src;
        if (originalSrc && originalSrc.startsWith('http')) {
            heroImage.src = buildProxyImageUrl(originalSrc);
        }
    }
}

// ============================================
// UPDATE GAME COUNT
// ============================================
function updateGameCount() {
    const count = Object.keys(GAMES).length;
    updateGameCountDisplay(count);
}

function updateGameCountDisplay(count) {
    if (elements.gameCountDisplay) {
        elements.gameCountDisplay.textContent = `(${count})`;
    }
}

// ============================================
// UPDATE SECTION TITLE
// ============================================
function updateSectionTitle() {
    const sectionTitle = document.querySelector('.games-section .section-title');
    if (!sectionTitle) return;
    
    const categoryInfo = CATEGORIES[currentFilter] || CATEGORIES.all;
    const icon = sectionTitle.querySelector('.title-icon');
    
    // Update the icon
    if (icon) {
        icon.textContent = categoryInfo.icon;
    }
    
    // Find and update the text node between icon and count
    const childNodes = Array.from(sectionTitle.childNodes);
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text && text !== '') {
                node.textContent = ` ${categoryInfo.name} `;
                break;
            }
        }
    }
}

// ============================================
// UPDATE FAVORITES COUNT
// ============================================
function updateFavoritesCount() {
    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = favorites.length;
    }
}

// ============================================
// RENDER FEATURED GAMES
// ============================================
function renderFeaturedGames() {
    if (!elements.featuredGrid) return;

    const featuredGames = Object.entries(GAMES).filter(([key, game]) => game.featured);
    
    elements.featuredGrid.innerHTML = '';
    
    featuredGames.slice(0, 6).forEach(([key, game]) => {
        const card = createGameCard(key, game, 0);
        elements.featuredGrid.appendChild(card);
    });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info', title = null) {
    // Get container, or create one if it doesn't exist
    let container = elements.toastContainer || document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        elements.toastContainer = container;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const titles = {
        success: 'Success',
        error: 'Error',
        info: 'Info',
        warning: 'Warning'
    };

    toast.innerHTML = `
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        <div class="toast-header">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-title">${title || titles[type] || titles.info}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after delay
    const removeTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 4000);
    
    // Store timeout reference for cleanup
    toast._removeTimeout = removeTimeout;
    
    return toast;
}

// Show confirmation toast with actions (inline instead of alert)
function showConfirmToast(message, title, onConfirm, onCancel = null) {
    // Get container, or create one if it doesn't exist
    let container = elements.toastContainer || document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        elements.toastContainer = container;
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-warning';
    
    toast.innerHTML = `
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        <div class="toast-header">
            <span class="toast-icon">⚠</span>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(title)}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
        </div>
        <div class="toast-actions">
            <button class="toast-btn toast-btn-secondary" data-action="cancel">Cancel</button>
            <button class="toast-btn toast-btn-primary" data-action="confirm">Delete</button>
        </div>
    `;

    container.appendChild(toast);

    // Button handlers
    const confirmBtn = toast.querySelector('[data-action="confirm"]');
    const cancelBtn = toast.querySelector('[data-action="cancel"]');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            toast.remove();
            if (typeof onConfirm === 'function') onConfirm();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            toast.remove();
            if (typeof onCancel === 'function') onCancel();
        });
    }

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Don't auto-remove confirmation toasts - user must click
    return toast;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
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

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ============================================
// AUTH & USER MENU
// ============================================
function initializeAuth() {
    const userBtn = document.getElementById('userBtn');
    const userMenu = document.getElementById('userMenu');

    // User button click
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.currentUser) {
                toggleUserMenu();
            } else {
                openAuthModal();
            }
        });
    }

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenu') && !e.target.closest('#userBtn')) {
            closeUserMenu();
        }
    });

    // Listen for auth state changes
    window.addEventListener('authStateChanged', (e) => {
        updateAuthUI(e.detail);
        // Setup ticket notifications when user logs in
        setupTicketNotifications(e.detail);
    });
}

// ============================================
// TICKET NOTIFICATION SYSTEM
// ============================================
function setupTicketNotifications(user) {
    // Clean up previous listener
    if (ticketNotificationListener) {
        try {
            ticketNotificationListener();
        } catch (e) {
            console.warn('Error cleaning up ticket listener:', e);
        }
        ticketNotificationListener = null;
    }
    
    if (!user || !window.firebaseDB) {
        updateNotificationBadge(0);
        return;
    }
    
    try {
        const ticketsRef = window.firebaseRef(window.firebaseDB, 'tickets');
        ticketNotificationListener = window.firebaseOnValue(ticketsRef, (snapshot) => {
            try {
                if (!snapshot.exists()) {
                    updateNotificationBadge(0);
                    return;
                }
                
                const allTickets = [];
                snapshot.forEach((child) => {
                    try {
                        const ticket = { id: child.key, ...child.val() };
                        if (ticket.userId === user.uid) {
                            allTickets.push(ticket);
                        }
                    } catch (e) {
                        // Skip malformed ticket
                    }
                });
                
                // Calculate total unread updates
                const lastChecked = parseInt(localStorage.getItem('gemtraLastTicketCheck')) || 0;
                let totalUnread = 0;
                let newNotification = null;
                
                allTickets.forEach(ticket => {
                    // Count unread messages from admin
                    const unreadFromAdmin = ticket.unreadUser || 0;
                    totalUnread += unreadFromAdmin;
                    
                    // Check if there's a new notification (status update or message)
                    const statusTime = ticket.statusUpdatedAt || 0;
                    const lastActivity = ticket.lastActivity || 0;
                    
                    if (statusTime > lastChecked || lastActivity > lastChecked) {
                        if (unreadFromAdmin > 0) {
                            newNotification = ticket;
                        }
                    }
                });
                
                // Show toast for NEW notifications (when count increases)
                if (totalUnread > previousUnreadCount && newNotification) {
                    const statusText = getStatusText(newNotification.status);
                    const toastMsg = newNotification.status === 'rejected' && newNotification.rejectionReason
                        ? `"${newNotification.title}" - ${statusText}`
                        : `Update on "${newNotification.title}"`;
                    showToast(toastMsg, 'info');
                }
                
                previousUnreadCount = totalUnread;
                updateNotificationBadge(totalUnread);
            } catch (e) {
                console.warn('Error processing tickets:', e);
                updateNotificationBadge(0);
            }
        }, (error) => {
            console.warn('Ticket notification listener error:', error);
            updateNotificationBadge(0);
        });
    } catch (error) {
        console.warn('Error setting up ticket notifications:', error);
        updateNotificationBadge(0);
    }
}

function getStatusText(status) {
    const statusLabels = {
        'pending': 'Pending Review',
        'in-progress': 'In Progress',
        'completed': 'Completed! 🎉',
        'rejected': 'Rejected',
        'closed': 'Closed'
    };
    return statusLabels[status] || status;
}

function updateNotificationBadge(count) {
    // Update badge on user button
    let badge = document.getElementById('notificationBadge');
    if (!badge) {
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            badge = document.createElement('span');
            badge.id = 'notificationBadge';
            badge.className = 'notification-badge';
            userBtn.appendChild(badge);
        }
    }
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Also update My Requests badge
    const myRequestsBadge = document.getElementById('myRequestsBadge');
    if (myRequestsBadge) {
        if (count > 0) {
            myRequestsBadge.textContent = count;
            myRequestsBadge.style.display = 'inline';
        } else {
            myRequestsBadge.style.display = 'none';
        }
    }
    
    // Update support panel badge
    const supportBadge = document.getElementById('supportMyRequestsCount');
    if (supportBadge) {
        if (count > 0) {
            supportBadge.textContent = count;
            supportBadge.style.display = 'inline';
        } else {
            supportBadge.style.display = 'none';
        }
    }
}

function markTicketsAsRead() {
    localStorage.setItem('gemtraLastTicketCheck', Date.now().toString());
    previousUnreadCount = 0;
}

function updateAuthUI(user) {
    const userBtn = document.getElementById('userBtn');
    const userName = document.getElementById('userMenuName');
    const userEmail = document.getElementById('userMenuEmail');
    const userAvatar = document.getElementById('userMenuAvatar');
    const adminBadge = document.getElementById('adminBadge');
    const adminLink = document.getElementById('adminLink');
    const signOutBtn = document.getElementById('signOutBtn');

    if (user) {
        userBtn?.classList.add('logged-in');
        
        const displayName = user.displayName || user.email?.split('@')[0] || 'Guest';
        const email = user.email || (user.isAnonymous ? 'Anonymous User' : '');
        
        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = email;
        if (userAvatar) userAvatar.textContent = displayName[0].toUpperCase();

        // Check if admin
        const isAdmin = window.ADMINS && window.ADMINS[user.uid];
        if (adminBadge) adminBadge.style.display = isAdmin ? 'flex' : 'none';
        if (adminLink) adminLink.style.display = isAdmin ? 'flex' : 'none';
        if (signOutBtn) signOutBtn.style.display = 'flex';

        // Update user count in Firebase
        if (window.firebaseReady) {
            const userRef = window.firebaseRef(window.firebaseDB, `users/${user.uid}`);
            window.firebaseUpdate(userRef, {
                lastActive: Date.now(),
                displayName: displayName,
                email: email
            }).catch(() => {});
        }
    } else {
        userBtn?.classList.remove('logged-in');
        if (userName) userName.textContent = 'Guest';
        if (userEmail) userEmail.textContent = 'Not signed in';
        if (userAvatar) userAvatar.textContent = 'G';
        if (adminBadge) adminBadge.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'none';
        
        // Clear notifications when logged out
        updateNotificationBadge(0);
    }
}

function openAuthModal() {
    document.getElementById('authModal')?.classList.add('open');
}

function closeAuthModal() {
    document.getElementById('authModal')?.classList.remove('open');
}

function toggleUserMenu() {
    document.getElementById('userMenu')?.classList.toggle('open');
}

function closeUserMenu() {
    document.getElementById('userMenu')?.classList.remove('open');
}

// ============================================
// REQUEST MODAL
// ============================================
function openRequestModal(type = 'game-request') {
    const modal = document.getElementById('requestModal');
    const title = document.getElementById('requestModalTitle');
    const desc = document.getElementById('requestModalDesc');
    const typeInput = document.getElementById('requestType');
    const urlGroup = document.getElementById('gameUrlGroup');

    const configs = {
        'game-request': {
            title: '🎮 Request a Game',
            desc: "Let us know what game you'd like us to add!",
            showUrl: true
        },
        'bug-report': {
            title: '🐛 Report a Bug',
            desc: 'Found something broken? Let us know!',
            showUrl: false
        },
        'suggestion': {
            title: '💡 Make a Suggestion',
            desc: 'Have an idea to improve Gemtra? Share it!',
            showUrl: false
        },
        'feedback': {
            title: '💬 Send Feedback',
            desc: 'Tell us what you think about Gemtra!',
            showUrl: false
        }
    };

    const config = configs[type] || configs['game-request'];
    
    if (title) title.textContent = config.title;
    if (desc) desc.textContent = config.desc;
    if (typeInput) typeInput.value = type;
    if (urlGroup) urlGroup.style.display = config.showUrl ? 'block' : 'none';

    // Pre-fill with search query if requesting from no-results
    const searchInput = document.getElementById('mainSearchInput') || document.getElementById('searchInput');
    if (type === 'game-request' && searchInput?.value) {
        const requestTitle = document.getElementById('requestTitle');
        if (requestTitle) requestTitle.value = searchInput.value;
    }

    closeUserMenu();
    modal?.classList.add('open');
}

function closeRequestModal() {
    document.getElementById('requestModal')?.classList.remove('open');
    document.getElementById('requestForm')?.reset();
}

async function submitRequest(e) {
    e.preventDefault();

    // Check online status
    if (!navigator.onLine) {
        showToast('You appear to be offline. Please check your connection.', 'error');
        return;
    }

    if (!window.firebaseReady || !window.firebaseDB) {
        showToast('Unable to connect to server. Please try again later.', 'error');
        return;
    }

    const type = document.getElementById('requestType')?.value || 'game-request';
    const titleInput = document.getElementById('requestTitle');
    const descInput = document.getElementById('requestDescription');
    const urlInput = document.getElementById('requestGameUrl');
    
    const title = titleInput?.value.trim();
    const description = descInput?.value.trim();
    const gameUrl = urlInput?.value.trim();

    if (!title || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Basic validation
    if (title.length < 3) {
        showToast('Title must be at least 3 characters', 'error');
        return;
    }
    
    if (description.length < 10) {
        showToast('Description must be at least 10 characters', 'error');
        return;
    }

    const user = window.currentUser;
    const ticket = {
        type,
        title: title.substring(0, 200), // Limit title length
        description: description.substring(0, 2000), // Limit description length
        gameUrl: gameUrl ? gameUrl.substring(0, 500) : null,
        userId: user?.uid || 'anonymous',
        userName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        userEmail: user?.email || null,
        status: 'pending',
        createdAt: Date.now(),
        timestamp: Date.now()
    };

    // Disable submit button during submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    try {
        const ticketsRef = window.firebaseRef(window.firebaseDB, 'tickets');
        await window.firebasePush(ticketsRef, ticket);
        
        closeRequestModal();
        showToast('Request submitted successfully! We\'ll review it soon.', 'success', 'Submitted!');
        
        // Clear the form
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (urlInput) urlInput.value = '';
        
    } catch (error) {
        console.error('Error submitting request:', error);
        
        const errorMsg = error.code === 'PERMISSION_DENIED'
            ? 'Permission denied. Please sign in and try again.'
            : 'Failed to submit request. Please try again.';
        
        showToast(errorMsg, 'error');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                Submit Request
            `;
        }
    }
}

// ============================================
// AI ASSISTANT
// ============================================
// Cloudflare Worker proxy for AI requests
const AI_API_URL = 'https://gemtra-ai.modmojheh.workers.dev';

let aiConversation = [
    {
        role: 'system',
        content: `You are Gemtra AI, a helpful gaming assistant for Gemtra Games website. You help users find games, answer questions about the site, and provide game recommendations.

Available games: Geometry Dash (rhythm), Block Blast (puzzle), Infinite Craft (puzzle), A Small World Cup (sports), Push Your Luck (casual), Tiny Fishing (casual), Moto X3M (sports), Mr. President! (casual).

Categories: rhythm, puzzle, sports, casual.

Be friendly, concise, and helpful. If users ask for games, suggest specific ones from our catalog. Keep responses under 150 words.`
    }
];

function toggleAIChat() {
    const chat = document.getElementById('aiChat');
    chat?.classList.toggle('open');
}

// Support Panel Functions
function openSupportPanel() {
    const panel = document.getElementById('supportPanel');
    const backdrop = document.getElementById('supportBackdrop');
    panel?.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Update sign in button visibility based on auth state
    const signInBtn = document.getElementById('supportSignInBtn');
    if (signInBtn && window.currentUser) {
        signInBtn.style.display = 'none';
    }
}

function closeSupportPanel() {
    const panel = document.getElementById('supportPanel');
    const backdrop = document.getElementById('supportBackdrop');
    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================
// MY REQUESTS PANEL
// ============================================

let currentRequestId = null;
let requestChatListener = null;

function openMyRequests() {
    const user = window.currentUser;
    if (!user) {
        showToast('Please sign in to view your requests', 'warning');
        openAuthModal();
        return;
    }
    
    // Close user menu
    document.getElementById('userMenu')?.classList.remove('open');
    
    const panel = document.getElementById('myRequestsPanel');
    const backdrop = document.getElementById('myRequestsBackdrop');
    panel?.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    loadMyRequests();
}

function closeMyRequests() {
    const panel = document.getElementById('myRequestsPanel');
    const backdrop = document.getElementById('myRequestsBackdrop');
    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
}

async function loadMyRequests() {
    const user = window.currentUser;
    if (!user || !window.firebaseDB) {
        console.warn('Cannot load requests: user or Firebase not available');
        return;
    }
    
    const listEl = document.getElementById('myRequestsList');
    const emptyEl = document.getElementById('myRequestsEmpty');
    
    if (!listEl || !emptyEl) {
        console.warn('Request list elements not found');
        return;
    }
    
    try {
        const ticketsRef = window.firebaseRef(window.firebaseDB, 'tickets');
        const snapshot = await window.firebaseGet(ticketsRef);
        
        if (!snapshot.exists()) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }
        
        const allTickets = snapshot.val() || {};
        const userTickets = [];
        
        // Filter tickets by user with null safety
        Object.entries(allTickets).forEach(([id, ticket]) => {
            if (ticket && ticket.userId === user.uid) {
                userTickets.push({ id, ...ticket });
            }
        });
        
        // Sort by date (newest first)
        userTickets.sort((a, b) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0));
        
        if (userTickets.length === 0) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }
        
        emptyEl.style.display = 'none';
        listEl.innerHTML = userTickets.map(ticket => {
            try {
                return renderRequestCard(ticket);
            } catch (e) {
                console.warn('Error rendering ticket card:', e);
                return '';
            }
        }).join('');
        
        // Update badge
        updateMyRequestsBadge(userTickets);
        
    } catch (error) {
        console.error('Error loading requests:', error);
        showToast('Failed to load requests. Please try again.', 'error');
        listEl.innerHTML = `
            <div class="request-error">
                <p>Unable to load requests</p>
                <button class="btn btn-secondary" onclick="loadMyRequests()">Try Again</button>
            </div>
        `;
    }
}

function renderRequestCard(ticket) {
    const typeLabels = {
        'game-request': 'Game Request',
        'bug-report': 'Bug Report',
        'suggestion': 'Suggestion',
        'feedback': 'Feedback'
    };
    
    const statusLabels = {
        'pending': 'Pending Review',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'rejected': 'Rejected',
        'closed': 'Closed'
    };
    
    const dateVal = ticket.createdAt || ticket.timestamp;
    const date = dateVal ? new Date(dateVal).toLocaleDateString() : 'Unknown';
    const status = ticket.status || 'pending';
    const unreadCount = ticket.unreadUser || 0;
    const hasUpdate = unreadCount > 0;
    const canDeleteSafely = status === 'completed' || status === 'rejected' || status === 'closed';
    
    // Show rejection reason preview if rejected
    const rejectionPreview = status === 'rejected' && ticket.rejectionReason 
        ? `<p class="request-card-rejection">Reason: ${escapeHtml(ticket.rejectionReason)}</p>` 
        : '';
    
    return `
        <div class="request-card ${hasUpdate ? 'has-update' : ''}" data-ticket-id="${ticket.id}" data-status="${status}">
            ${hasUpdate ? '<div class="update-indicator"></div>' : ''}
            <button class="request-delete-btn" onclick="event.stopPropagation(); deleteRequest('${ticket.id}', '${status}')" title="Delete request">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
            <div class="request-card-content" onclick="openRequestChat('${ticket.id}')">
                <div class="request-card-header">
                    <h5 class="request-card-title">${escapeHtml(ticket.title || 'Untitled')}</h5>
                    <span class="request-card-type ${ticket.type}">${typeLabels[ticket.type] || ticket.type}</span>
                </div>
                <p class="request-card-desc">${escapeHtml(ticket.description || '')}</p>
                ${rejectionPreview}
                <div class="request-card-footer">
                    <span class="request-card-status ${status}">
                        <span class="status-dot"></span>
                        ${statusLabels[status] || status}
                    </span>
                    <span class="request-card-date">${date}</span>
                    ${unreadCount > 0 ? `<span class="request-card-unread">${unreadCount} new</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Delete a request with confirmation for active requests
function deleteRequest(ticketId, status) {
    const canDeleteSafely = status === 'completed' || status === 'rejected' || status === 'closed';
    
    if (!canDeleteSafely) {
        // Show warning for active requests using inline confirm dialog
        showConfirmDialog(
            'This request is still being processed. Are you sure you want to delete it?',
            'Delete Active Request?',
            () => performDeleteRequest(ticketId)
        );
    } else {
        // Direct delete for completed/rejected
        performDeleteRequest(ticketId);
    }
}

// Inline confirmation dialog (no alerts)
function showConfirmDialog(message, title, onConfirm) {
    // Remove any existing dialog
    const existing = document.querySelector('.confirm-dialog-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <h4>${title}</h4>
            <p>${message}</p>
            <div class="confirm-dialog-actions">
                <button class="confirm-dialog-btn cancel">Cancel</button>
                <button class="confirm-dialog-btn delete">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Button handlers
    overlay.querySelector('.cancel').addEventListener('click', () => {
        overlay.remove();
    });
    
    overlay.querySelector('.delete').addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
    
    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

async function performDeleteRequest(ticketId) {
    if (!ticketId) {
        showToast('Invalid request ID', 'error');
        return;
    }
    
    if (!navigator.onLine) {
        showToast('You appear to be offline. Please check your connection.', 'error');
        return;
    }
    
    if (!window.firebaseDB || !window.firebaseRemove) {
        showToast('Unable to connect to server', 'error');
        return;
    }
    
    try {
        const ticketRef = window.firebaseRef(window.firebaseDB, `tickets/${ticketId}`);
        await window.firebaseRemove(ticketRef);
        
        showToast('Request deleted successfully', 'success', 'Deleted');
        
        // Refresh the list
        loadMyRequests();
        
    } catch (error) {
        console.error('Error deleting request:', error);
        
        const errorMsg = error.code === 'PERMISSION_DENIED'
            ? 'Permission denied. You can only delete your own requests.'
            : 'Failed to delete request. Please try again.';
        
        showToast(errorMsg, 'error');
    }
}

function updateMyRequestsBadge(tickets) {
    const badge = document.getElementById('myRequestsBadge');
    if (!badge) return;
    
    const unreadTotal = tickets.reduce((sum, t) => sum + (t.unreadUser || 0), 0);
    if (unreadTotal > 0) {
        badge.textContent = unreadTotal;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// REQUEST CHAT PANEL
// ============================================

function openRequestChat(ticketId) {
    currentRequestId = ticketId;
    
    closeMyRequests();
    
    const panel = document.getElementById('requestChatPanel');
    const backdrop = document.getElementById('requestChatBackdrop');
    panel?.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    loadRequestChat(ticketId);
}

function closeRequestChat() {
    const panel = document.getElementById('requestChatPanel');
    const backdrop = document.getElementById('requestChatBackdrop');
    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
    
    // Remove listener
    if (requestChatListener) {
        requestChatListener();
        requestChatListener = null;
    }
    
    currentRequestId = null;
}

async function loadRequestChat(ticketId) {
    if (!window.firebaseDB) {
        showToast('Unable to connect to server', 'error');
        closeRequestChat();
        return;
    }
    
    const titleEl = document.getElementById('requestChatTitle');
    const statusEl = document.getElementById('requestChatStatus');
    const detailsEl = document.getElementById('requestChatDetails');
    const messagesEl = document.getElementById('requestChatMessages');
    
    try {
        // Load ticket details
        const ticketRef = window.firebaseRef(window.firebaseDB, `tickets/${ticketId}`);
        const snapshot = await window.firebaseGet(ticketRef);
        
        if (!snapshot.exists()) {
            showToast('Request not found', 'error');
            closeRequestChat();
            return;
        }
        
        const ticket = snapshot.val();
        if (!ticket) {
            showToast('Invalid request data', 'error');
            closeRequestChat();
            return;
        }
        
        const status = ticket.status || 'pending';
        
        if (titleEl) titleEl.textContent = ticket.title || 'Untitled';
        if (statusEl) {
            const statusLabels = {
                'pending': 'Pending Review',
                'in-progress': 'In Progress',
                'completed': 'Completed',
                'rejected': 'Rejected',
                'closed': 'Closed'
            };
            statusEl.textContent = statusLabels[status] || status;
            statusEl.className = `request-chat-status ${status}`;
        }
        
        // Render details with rejection reason if applicable
        if (detailsEl) {
            const typeLabels = {
                'game-request': 'Game Request',
                'bug-report': 'Bug Report',
                'suggestion': 'Suggestion',
                'feedback': 'Feedback'
            };
            
            let rejectionHtml = '';
            if (status === 'rejected' && ticket.rejectionReason) {
                rejectionHtml = `
                    <div class="rejection-notice">
                        <div class="rejection-header">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                            <span>Rejection Reason</span>
                        </div>
                        <p>${escapeHtml(ticket.rejectionReason)}</p>
                    </div>
                `;
            }
            
            let completedHtml = '';
            if (status === 'completed') {
                completedHtml = `
                    <div class="completed-notice">
                        <div class="completed-header">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Request Completed!</span>
                        </div>
                        <p>Your request has been fulfilled. Thank you for your feedback!</p>
                    </div>
                `;
            }
            
            detailsEl.innerHTML = `
                ${rejectionHtml}
                ${completedHtml}
                <div class="request-details-card">
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${typeLabels[ticket.type] || ticket.type || 'Unknown'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${escapeHtml(ticket.description || 'No description')}</span>
                    </div>
                    ${ticket.gameUrl ? `
                    <div class="detail-row">
                        <span class="detail-label">URL:</span>
                        <span class="detail-value"><a href="${escapeHtml(ticket.gameUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ticket.gameUrl)}</a></span>
                    </div>` : ''}
                </div>
            `;
        }
        
        // Mark as read for user
        if (ticket.unreadUser > 0) {
            try {
                await window.firebaseUpdate(ticketRef, { unreadUser: 0 });
                // Update the last check time so notification badge updates
                markTicketsAsRead();
            } catch (e) {
                console.warn('Failed to mark as read:', e);
            }
        }
        
        // Clean up any existing chat listener
        if (requestChatListener) {
            try {
                requestChatListener();
            } catch (e) {
                // Ignore cleanup errors
            }
            requestChatListener = null;
        }
        
        // Listen for chat messages
        const chatRef = window.firebaseRef(window.firebaseDB, `tickets/${ticketId}/chat`);
        requestChatListener = window.firebaseOnValue(chatRef, (snap) => {
            if (!messagesEl) return;
            
            try {
                if (!snap.exists()) {
                    messagesEl.innerHTML = `
                        <div class="no-messages">
                            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    `;
                    return;
                }
                
                const messages = [];
                snap.forEach((child) => {
                    try {
                        messages.push({ id: child.key, ...child.val() });
                    } catch (e) {
                        // Skip malformed message
                    }
                });
                
                // Sort by timestamp
                messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                
                messagesEl.innerHTML = messages.map(msg => {
                    try {
                        return renderChatMessage(msg);
                    } catch (e) {
                        return '';
                    }
                }).join('');
                messagesEl.scrollTop = messagesEl.scrollHeight;
            } catch (e) {
                console.warn('Error processing chat messages:', e);
            }
        }, (error) => {
            console.warn('Chat listener error:', error);
            if (messagesEl) {
                messagesEl.innerHTML = `
                    <div class="no-messages">
                        <p>Unable to load messages</p>
                    </div>
                `;
            }
        });
        
    } catch (error) {
        console.error('Error loading request chat:', error);
        showToast('Failed to load request', 'error');
        closeRequestChat();
    }
}

function renderChatMessage(msg) {
    const isAdmin = msg.isAdmin;
    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
    const messageText = msg.message || msg.text || '';
    
    if (isAdmin) {
        return `
            <div class="chat-message admin">
                <span class="admin-badge">
                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Admin
                </span>
                <div class="message-bubble">${escapeHtml(messageText)}</div>
                <span class="message-time">${time}</span>
            </div>
        `;
    }
    
    return `
        <div class="chat-message user">
            <div class="message-bubble">${escapeHtml(messageText)}</div>
            <span class="message-time">${time}</span>
        </div>
    `;
}

async function sendRequestMessage() {
    const input = document.getElementById('requestChatInput');
    const message = input?.value.trim();
    
    if (!message) {
        return;
    }
    
    if (!currentRequestId) {
        showToast('No request selected', 'error');
        return;
    }
    
    if (!window.currentUser) {
        showToast('Please sign in to send messages', 'warning');
        return;
    }
    
    if (!window.firebaseDB) {
        showToast('Unable to connect to server', 'error');
        return;
    }
    
    // Clear input immediately for better UX
    input.value = '';
    
    try {
        const chatRef = window.firebaseRef(window.firebaseDB, `tickets/${currentRequestId}/chat`);
        await window.firebasePush(chatRef, {
            message: message,
            userId: window.currentUser.uid,
            userName: window.currentUser.displayName || 'User',
            isAdmin: false,
            timestamp: Date.now()
        });
        
        // Mark unread for admin
        const ticketRef = window.firebaseRef(window.firebaseDB, `tickets/${currentRequestId}`);
        await window.firebaseUpdate(ticketRef, { 
            unreadAdmin: window.firebaseIncrement(1),
            lastActivity: Date.now()
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message. Please try again.', 'error');
        // Restore the message so user doesn't lose it
        if (input) {
            input.value = message;
        }
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function sendAIMessage(preset = null) {
    const input = document.getElementById('aiInput');
    const message = preset || input?.value.trim();
    
    if (!message) return;
    
    // Clear input
    if (input && !preset) input.value = '';

    // Add user message to UI
    addAIMessage(message, 'user');

    // Add to conversation
    aiConversation.push({ role: 'user', content: message });

    // Show typing indicator
    const typing = addTypingIndicator();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: aiConversation,
                max_tokens: 500,
                temperature: 0.7
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (typing.parentElement) typing.remove();

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Try asking something else!";

        // Add to conversation
        aiConversation.push({ role: 'assistant', content: aiResponse });
        
        // Keep conversation at reasonable size (system message + last 20 exchanges)
        const maxMessages = 41; // 1 system + 20 user + 20 assistant
        if (aiConversation.length > maxMessages) {
            aiConversation = [aiConversation[0], ...aiConversation.slice(-20)];
        }

        // Add to UI
        addAIMessage(aiResponse, 'bot');

        // Handle game-related queries - check if we should filter games
        handleAIGameSuggestion(message, aiResponse);

    } catch (error) {
        if (typing.parentElement) typing.remove();
        
        console.error('AI Error:', error);
        
        // Remove the failed user message from conversation
        if (aiConversation.length > 0 && aiConversation[aiConversation.length - 1].content === message) {
            aiConversation.pop();
        }
        
        const errorMsg = error.name === 'AbortError' 
            ? "Request timed out. Please try again."
            : "Oops! I'm having trouble connecting. Please try again in a moment.";
        
        addAIMessage(errorMsg, 'bot');
    }
}

function addAIMessage(text, type) {
    const container = document.getElementById('aiMessages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = `ai-message ${type}`;
    
    msg.innerHTML = `
        <div class="ai-avatar">${type === 'user' ? '👤' : '🤖'}</div>
        <div class="ai-bubble">${escapeHtml(text)}</div>
    `;

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
    const container = document.getElementById('aiMessages');
    const typing = document.createElement('div');
    typing.className = 'ai-message bot';
    typing.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="ai-bubble">
            <div class="ai-typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return typing;
}

function handleAIGameSuggestion(userMessage, aiResponse) {
    // Check if user is looking for games by category
    const categoryKeywords = {
        'horror': 'horror',
        'scary': 'horror',
        'fnaf': 'horror',
        'rhythm': 'rhythm',
        'geometry': 'rhythm',
        'action': 'action',
        'shooter': 'action',
        'racing': 'racing',
        'car': 'racing',
        'arcade': 'arcade',
        'multiplayer': 'multiplayer',
        'puzzle': 'puzzle',
        'fighting': 'fighting',
        'adventure': 'adventure'
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, category] of Object.entries(categoryKeywords)) {
        if (lowerMessage.includes(keyword)) {
            // Filter games to that category
            setTimeout(() => {
                currentFilter = category;
                const filterBtns = document.querySelectorAll('.filter-btn');
                filterBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
                renderGames();
                document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
            }, 1500);
            break;
        }
    }
}

// escapeHTML is aliased to escapeHtml for consistency (see definition above)

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Focus search on / or Ctrl+K
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== elements.searchInput) {
        e.preventDefault();
        const mainSearch = document.getElementById('mainSearchInput');
        if (mainSearch) {
            mainSearch.focus();
            mainSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            elements.searchInput?.focus();
        }
    }

    // Close modal on Escape
    if (e.key === 'Escape') {
        if (elements.gameModal?.classList.contains('active')) {
            closeGame();
        }
        elements.sortMenu?.classList.remove('show');
        closeAuthModal();
        closeRequestModal();
        document.getElementById('aiChat')?.classList.remove('open');
        closeUserMenu();
    }
});

// Initialize auth on load
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});
// Clear all filters function
function clearAllFilters() {
    searchQuery = '';
    currentFilter = 'all';
    const mainSearchInput = document.getElementById('mainSearchInput');
    const navSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) mainSearchInput.value = '';
    if (navSearchInput) navSearchInput.value = '';
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'all');
    });
    
    renderGames();
}

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================
window.handleImageError = handleImageError;
window.openGame = openGame;
window.closeGame = closeGame;
window.toggleFavorite = toggleFavorite;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.openRequestModal = openRequestModal;
window.closeRequestModal = closeRequestModal;
window.submitRequest = submitRequest;
window.toggleAIChat = toggleAIChat;
window.sendAIMessage = sendAIMessage;
window.closeUserMenu = closeUserMenu;
window.showToast = showToast;
window.showConfirmToast = showConfirmToast;
window.showConfirmDialog = showConfirmDialog;
window.clearAllFilters = clearAllFilters;
window.openSupportPanel = openSupportPanel;
window.closeSupportPanel = closeSupportPanel;
window.openMyRequests = openMyRequests;
window.closeMyRequests = closeMyRequests;
window.openRequestChat = openRequestChat;
window.closeRequestChat = closeRequestChat;
window.sendRequestMessage = sendRequestMessage;
window.markTicketsAsRead = markTicketsAsRead;
window.deleteRequest = deleteRequest;

// ============================================
// SHARE MODAL FUNCTIONS
// ============================================

function openShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function copyShareLink(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // For mobile
        
        try {
            navigator.clipboard.writeText(input.value).then(() => {
                showToast('Link copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                showToast('Link copied to clipboard!', 'success');
            });
        } catch (err) {
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        }
    }
}

function nativeShare() {
    if (navigator.share) {
        navigator.share({
            title: 'Gemtra Games - Free Unblocked Games',
            text: 'Check out Gemtra Games - Play 100+ free games online!',
            url: 'https://tinyurl.com/gemtra'
        }).then(() => {
            showToast('Thanks for sharing!', 'success');
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                showToast('Sharing cancelled', 'info');
            }
        });
    } else {
        // Fallback: copy to clipboard
        copyShareLink('shortLinkInput');
    }
}

// Expose share functions globally
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.copyShareLink = copyShareLink;
window.nativeShare = nativeShare;

// ============================================
// CONTACT MODAL FUNCTIONS
// ============================================

function openContactModal(type = 'support') {
    const modal = document.getElementById('contactModal');
    const title = document.getElementById('contactModalTitle');
    const subtitle = document.getElementById('contactModalSubtitle');
    const body = document.getElementById('contactModalBody');
    
    if (!modal || !body) return;
    
    let content = '';
    
    if (type === 'dmca') {
        title.textContent = '⚖️ DMCA / Copyright Notice';
        subtitle.textContent = 'How to submit a DMCA takedown request';
        content = `
            <div class="contact-section">
                <h3>📋 Before You Submit</h3>
                <p>Gemtra Games is a <strong>game aggregator</strong> - we do not host game files directly. We embed games from third-party sources. If your content is being displayed without authorization, we will promptly remove it upon valid request.</p>
            </div>
            
            <div class="contact-section">
                <h3>📧 How to Submit a DMCA Notice</h3>
                <p>Send an email to our support address with the following information:</p>
                <ul style="margin: 0.5rem 0 1rem 1.5rem; color: var(--text-secondary);">
                    <li>Your name and contact information</li>
                    <li>Identification of the copyrighted work</li>
                    <li>URL of the infringing content on our site</li>
                    <li>Statement of good faith belief</li>
                    <li>Statement of accuracy under penalty of perjury</li>
                    <li>Your physical or electronic signature</li>
                </ul>
                <div class="contact-email-display">
                    <input type="text" value="gemtrahelpcenter@gmail.com" readonly id="dmcaEmailInput">
                    <button onclick="copyContactEmail('dmcaEmailInput')">Copy</button>
                </div>
            </div>
            
            <div class="contact-section">
                <h3>📝 Email Subject Line</h3>
                <p>Use this subject: <strong>"DMCA Takedown Notice - [Game Name]"</strong></p>
            </div>
            
            <div class="contact-warning">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                <p>False DMCA claims may result in legal liability. Only submit if you are the copyright owner or authorized to act on their behalf.</p>
            </div>
        `;
    } else {
        // General support
        title.textContent = '📧 Contact Us';
        subtitle.textContent = 'Choose how you\'d like to reach us';
        content = `
            <div class="contact-section">
                <h3>💬 Recommended: Support Center</h3>
                <p>For the fastest response, use our built-in Support Center. You can chat with admins and track your requests.</p>
                <button class="contact-btn-action" onclick="closeContactModal(); setTimeout(() => openSupportPanel(), 300);">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                    Open Support Center
                </button>
            </div>
            
            <div class="contact-section">
                <h3>📧 Email Contact</h3>
                <p>For formal inquiries, partnerships, or detailed issues, you can email us directly:</p>
                
                <div class="contact-option">
                    <div class="contact-option-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    </div>
                    <div class="contact-option-content">
                        <h4>General Support</h4>
                        <p>Questions, feedback, and general inquiries</p>
                    </div>
                </div>
                
                <div class="contact-email-display">
                    <input type="text" value="gemtrahelpcenter@gmail.com" readonly id="supportEmailInput">
                    <button onclick="copyContactEmail('supportEmailInput')">Copy</button>
                </div>
            </div>
            
            <div class="contact-section">
                <h3>⏱️ Response Time</h3>
                <p>We typically respond within <strong>24-48 hours</strong>. For urgent issues, the Support Center usually gets faster responses.</p>
            </div>
        `;
    }
    
    body.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function copyContactEmail(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(input.value).then(() => {
                showToast('Email copied to clipboard!', 'success');
            }).catch(() => {
                document.execCommand('copy');
                showToast('Email copied to clipboard!', 'success');
            });
        } catch (err) {
            document.execCommand('copy');
            showToast('Email copied to clipboard!', 'success');
        }
    }
}

// Expose contact functions globally
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.copyContactEmail = copyContactEmail;
