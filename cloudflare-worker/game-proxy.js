/**
 * Gemtra Games - Full Reverse Proxy Worker
 * 
 * This worker proxies ALL game content (HTML, JS, CSS, images, audio, fetch, XHR, iframes)
 * so the browser ONLY talks to your domain.
 * 
 * WHAT THIS CAN DO:
 * ✅ Proxy HTML pages and rewrite all URLs
 * ✅ Proxy CSS and rewrite url() references
 * ✅ Proxy JavaScript files
 * ✅ Proxy images, audio, video, fonts
 * ✅ Proxy fetch/XHR requests (via injected override)
 * ✅ Proxy iframe content (same rewriting applied)
 * ✅ Handle WebSocket upgrade (limited - see notes)
 * ✅ Bypass school filters that block by domain name
 * 
 * WHAT THIS CANNOT DO (browser security limits):
 * ❌ Proxy WebRTC peer-to-peer connections (goes directly between browsers)
 * ❌ Make SharedArrayBuffer work without proper COOP/COEP (breaks cross-origin)
 * ❌ Proxy Service Workers (must be same-origin to register)
 * ❌ Fix games with hardcoded domain checks in obfuscated JS
 * ❌ Bypass filters that do deep packet inspection
 * ❌ Handle games requiring specific cookies on their domain
 * 
 * DEPLOYMENT:
 * 1. wrangler deploy game-proxy.js
 * 2. Access games via: https://your-worker.workers.dev/play/https://game-site.com/game/
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Your worker's base URL (set after deployment)
    // Leave empty to auto-detect from request
    WORKER_BASE: '',
    
    // DISABLE encoding for easier debugging
    ENCODE_URLS: false,
    
    // XOR key for simple URL encoding (change this!)
    ENCODE_KEY: 'gemtra2026proxy',
    
    // Enable detailed debug logging
    DEBUG: true,
    
    // Cache TTL for static assets (seconds)
    CACHE_TTL: {
        html: 0,        // Don't cache HTML
        css: 3600,      // 1 hour
        js: 3600,       // 1 hour
        image: 86400,   // 1 day
        font: 86400,    // 1 day
        other: 3600     // 1 hour
    },
    
    // Allowed origins for CORS (set to specific domains in production)
    ALLOWED_ORIGINS: ['*'],
    
    // User agent to use when fetching
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ============================================================================
// URL ENCODING/DECODING
// ============================================================================

function encodeTargetUrl(url) {
    if (!CONFIG.ENCODE_URLS) return encodeURIComponent(url);
    
    let encoded = '';
    for (let i = 0; i < url.length; i++) {
        encoded += String.fromCharCode(
            url.charCodeAt(i) ^ CONFIG.ENCODE_KEY.charCodeAt(i % CONFIG.ENCODE_KEY.length)
        );
    }
    return encodeURIComponent(btoa(encoded));
}

function decodeTargetUrl(encoded) {
    if (!CONFIG.ENCODE_URLS) return decodeURIComponent(encoded);
    
    try {
        const decoded = atob(decodeURIComponent(encoded));
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(
                decoded.charCodeAt(i) ^ CONFIG.ENCODE_KEY.charCodeAt(i % CONFIG.ENCODE_KEY.length)
            );
        }
        return result;
    } catch (e) {
        // Fallback: try direct decode
        return decodeURIComponent(encoded);
    }
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

function log(level, message, data = null) {
    if (!CONFIG.DEBUG) return;
    const timestamp = new Date().toISOString();
    const logObj = { timestamp, level, message };
    if (data) logObj.data = data;
    console.log(JSON.stringify(logObj));
}

function logRequest(request, route, targetUrl = null) {
    if (!CONFIG.DEBUG) return;
    log('INFO', `[${route}] ${request.method} ${request.url}`, {
        route,
        method: request.method,
        url: request.url,
        targetUrl,
        headers: Object.fromEntries(request.headers.entries()),
        cf: request.cf // Cloudflare-specific info
    });
}

function logResponse(route, targetUrl, response, duration) {
    if (!CONFIG.DEBUG) return;
    log('INFO', `[${route}] Response: ${response.status}`, {
        route,
        targetUrl,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        duration: `${duration}ms`,
        headers: Object.fromEntries(response.headers.entries())
    });
}

function logError(route, error, context = {}) {
    log('ERROR', `[${route}] ${error.message}`, {
        route,
        error: error.message,
        stack: error.stack,
        ...context
    });
}

// ============================================================================
// MAIN WORKER
// ============================================================================

export default {
    async fetch(request, env, ctx) {
        const requestStart = Date.now();
        const url = new URL(request.url);
        const workerBase = CONFIG.WORKER_BASE || url.origin;
        
        log('DEBUG', '=== NEW REQUEST ===', {
            method: request.method,
            url: request.url,
            pathname: url.pathname,
            search: url.search,
            workerBase
        });
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            log('DEBUG', 'Handling CORS preflight');
            return handleCORS(request);
        }
        
        // Route: /play/[target_url] - Main game proxy entry point
        if (url.pathname.startsWith('/play/')) {
            let targetUrl = decodeURIComponent(url.pathname.slice(6));
            if (url.search) targetUrl += url.search;
            log('INFO', '[ROUTE: /play/] Main game entry point', { targetUrl });
            logRequest(request, '/play/', targetUrl);
            return proxyRequest(request, targetUrl, workerBase, true);
        }
        
        // Route: /p/[encoded_url] - Proxied resource (used by rewritten URLs)
        if (url.pathname.startsWith('/p/')) {
            const encodedUrl = url.pathname.slice(3);
            const targetUrl = decodeTargetUrl(encodedUrl);
            log('INFO', '[ROUTE: /p/] Proxied resource', { encodedUrl, targetUrl });
            logRequest(request, '/p/', targetUrl);
            return proxyRequest(request, targetUrl, workerBase, false);
        }
        
        // Route: /ws/[encoded_url] - WebSocket proxy
        if (url.pathname.startsWith('/ws/')) {
            const encodedUrl = url.pathname.slice(4);
            const targetUrl = decodeTargetUrl(encodedUrl);
            log('INFO', '[ROUTE: /ws/] WebSocket proxy', { targetUrl });
            return proxyWebSocket(request, targetUrl);
        }
        
        // Route: /raw/[url] - Raw proxy without rewriting (for debugging)
        if (url.pathname.startsWith('/raw/')) {
            const targetUrl = decodeURIComponent(url.pathname.slice(5));
            log('INFO', '[ROUTE: /raw/] Raw proxy', { targetUrl });
            return proxyRaw(request, targetUrl);
        }
        
        // Route: /encode - Helper to encode URLs
        if (url.pathname === '/encode') {
            const targetUrl = url.searchParams.get('url');
            if (!targetUrl) {
                return jsonResponse({ error: 'Missing url parameter' }, 400);
            }
            return jsonResponse({
                original: targetUrl,
                encoded: encodeTargetUrl(targetUrl),
                playUrl: `${workerBase}/play/${targetUrl}`,
                proxyUrl: `${workerBase}/p/${encodeTargetUrl(targetUrl)}`
            });
        }
        
        // Root - show usage
        return new Response(getUsageHTML(workerBase), {
            headers: { 
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            }
        });
    }
};

// ============================================================================
// PROXY LOGIC
// ============================================================================

async function proxyRequest(request, targetUrl, workerBase, isEntryPoint) {
    const startTime = Date.now();
    const route = isEntryPoint ? '/play/' : '/p/';
    
    log('DEBUG', `[proxyRequest] Starting`, { targetUrl, isEntryPoint, method: request.method });
    
    // Validate URL
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
        log('ERROR', `[proxyRequest] Invalid URL`, { targetUrl });
        return new Response(JSON.stringify({
            error: 'Invalid target URL',
            received: targetUrl,
            hint: 'URL must start with http:// or https://'
        }, null, 2), { 
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
    
    try {
        const targetUrlObj = new URL(targetUrl);
        log('DEBUG', `[proxyRequest] Parsed URL`, {
            origin: targetUrlObj.origin,
            pathname: targetUrlObj.pathname,
            search: targetUrlObj.search,
            hostname: targetUrlObj.hostname
        });
        
        // Build fetch options
        const fetchOptions = {
            method: request.method,
            headers: buildProxyHeaders(request, targetUrlObj),
            redirect: 'follow'
        };
        
        log('DEBUG', `[proxyRequest] Fetch options`, {
            method: fetchOptions.method,
            headers: Object.fromEntries(fetchOptions.headers.entries())
        });
        
        // Include body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
            fetchOptions.body = await request.arrayBuffer();
            log('DEBUG', `[proxyRequest] Request body size: ${fetchOptions.body.byteLength} bytes`);
        }
        
        // Fetch from target
        log('INFO', `[proxyRequest] Fetching: ${targetUrl}`);
        const fetchStart = Date.now();
        const response = await fetch(targetUrl, fetchOptions);
        const fetchDuration = Date.now() - fetchStart;
        
        log('INFO', `[proxyRequest] Response received`, {
            status: response.status,
            statusText: response.statusText,
            fetchDuration: `${fetchDuration}ms`
        });
        logResponse(route, targetUrl, response, fetchDuration);
        
        // Determine content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const isHTML = contentType.includes('text/html');
        const isCSS = contentType.includes('text/css');
        const isJS = contentType.includes('javascript') || contentType.includes('ecmascript');
        const isJSON = contentType.includes('application/json');
        // JS is text too! Include it in isText check
        const isText = contentType.includes('text/') || isJSON || isJS;
        
        log('DEBUG', `[proxyRequest] Content analysis`, {
            contentType,
            isHTML, isCSS, isJS, isJSON, isText
        });
        
        // Get response body
        let body;
        if (isText) {
            body = await response.text();
            log('DEBUG', `[proxyRequest] Text body size: ${body.length} chars`);
        } else {
            body = await response.arrayBuffer();
            log('DEBUG', `[proxyRequest] Binary body size: ${body.byteLength} bytes`);
        }
        
        // Rewrite content based on type
        if (isHTML) {
            log('INFO', `[proxyRequest] Rewriting HTML content`);
            const originalLength = body.length;
            body = rewriteHTML(body, targetUrlObj, workerBase, isEntryPoint);
            log('DEBUG', `[proxyRequest] HTML rewritten: ${originalLength} -> ${body.length} chars`);
        } else if (isCSS) {
            log('INFO', `[proxyRequest] Rewriting CSS content`);
            body = rewriteCSS(body, targetUrlObj, workerBase);
        } else if (isJS) {
            log('INFO', `[proxyRequest] Rewriting JS content`);
            body = rewriteJS(body, targetUrlObj, workerBase);
        }
        
        // Build response headers
        const responseHeaders = buildResponseHeaders(response, contentType, isText);
        
        const totalDuration = Date.now() - startTime;
        log('SUCCESS', `[proxyRequest] Complete`, {
            targetUrl,
            status: response.status,
            contentType,
            totalDuration: `${totalDuration}ms`
        });
        
        return new Response(body, {
            status: response.status,
            headers: responseHeaders
        });
        
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        logError('proxyRequest', error, { targetUrl, duration: `${totalDuration}ms` });
        
        // Return detailed error for debugging
        return new Response(JSON.stringify({
            error: 'Proxy error',
            message: error.message,
            targetUrl: targetUrl,
            stack: CONFIG.DEBUG ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, null, 2), { 
            status: 502,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

async function proxyRaw(request, targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            headers: { 'User-Agent': CONFIG.USER_AGENT }
        });
        
        return new Response(response.body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(`Fetch error: ${error.message}`, { status: 502 });
    }
}

async function proxyWebSocket(request, targetUrl) {
    // WebSocket proxying in Cloudflare Workers
    // Note: This works but has limitations with some game servers
    
    if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 400 });
    }
    
    try {
        // Convert http(s) to ws(s)
        const wsUrl = targetUrl.replace(/^http/, 'ws');
        
        // Create WebSocket to target
        const targetWs = new WebSocket(wsUrl);
        
        // Create WebSocket pair for client
        const [client, server] = Object.values(new WebSocketPair());
        
        // Forward messages between client and target
        server.accept();
        
        targetWs.addEventListener('message', (event) => {
            try {
                server.send(event.data);
            } catch (e) {
                console.error('WS forward error:', e);
            }
        });
        
        server.addEventListener('message', (event) => {
            try {
                if (targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(event.data);
                }
            } catch (e) {
                console.error('WS send error:', e);
            }
        });
        
        targetWs.addEventListener('close', () => server.close());
        server.addEventListener('close', () => targetWs.close());
        
        return new Response(null, {
            status: 101,
            webSocket: client
        });
        
    } catch (error) {
        return new Response(`WebSocket proxy error: ${error.message}`, { status: 502 });
    }
}

// ============================================================================
// CONTENT REWRITING
// ============================================================================

function rewriteHTML(html, baseUrl, workerBase, injectOverrides) {
    // Helper to make URLs absolute
    const makeAbsolute = (src) => {
        if (!src || src.startsWith('data:') || src.startsWith('blob:') || 
            src.startsWith('javascript:') || src.startsWith('#')) {
            return null;
        }
        try {
            if (src.startsWith('//')) {
                return 'https:' + src;
            }
            if (src.startsWith('/')) {
                return baseUrl.origin + src;
            }
            if (!src.startsWith('http')) {
                return new URL(src, baseUrl.href).href;
            }
            return src;
        } catch (e) {
            return null;
        }
    };
    
    // Helper to create proxy URL
    const proxyUrl = (url) => {
        const absolute = makeAbsolute(url);
        if (!absolute) return url;
        return `${workerBase}/p/${encodeTargetUrl(absolute)}`;
    };
    
    // Rewrite src attributes (scripts, images, audio, video, iframes)
    html = html.replace(
        /(<(?:script|img|audio|video|source|iframe|embed|track)\s[^>]*)(src\s*=\s*["'])([^"']+)(["'])/gi,
        (match, tag, attr, src, quote) => {
            const absolute = makeAbsolute(src);
            if (!absolute) return match;
            return `${tag}${attr}${workerBase}/p/${encodeTargetUrl(absolute)}${quote}`;
        }
    );
    
    // Rewrite href for stylesheets
    html = html.replace(
        /(<link\s[^>]*rel\s*=\s*["']stylesheet["'][^>]*)(href\s*=\s*["'])([^"']+)(["'])/gi,
        (match, tag, attr, href, quote) => {
            const absolute = makeAbsolute(href);
            if (!absolute) return match;
            return `${tag}${attr}${workerBase}/p/${encodeTargetUrl(absolute)}${quote}`;
        }
    );
    
    // Also catch href before rel
    html = html.replace(
        /(<link\s[^>]*)(href\s*=\s*["'])([^"']+)(["'])([^>]*rel\s*=\s*["']stylesheet["'])/gi,
        (match, tag, attr, href, quote, rest) => {
            const absolute = makeAbsolute(href);
            if (!absolute) return match;
            return `${tag}${attr}${workerBase}/p/${encodeTargetUrl(absolute)}${quote}${rest}`;
        }
    );
    
    // Rewrite srcset attributes
    html = html.replace(
        /(srcset\s*=\s*["'])([^"']+)(["'])/gi,
        (match, pre, srcset, post) => {
            const rewritten = srcset.split(',').map(part => {
                const [url, descriptor] = part.trim().split(/\s+/);
                const absolute = makeAbsolute(url);
                if (!absolute) return part;
                return `${workerBase}/p/${encodeTargetUrl(absolute)}${descriptor ? ' ' + descriptor : ''}`;
            }).join(', ');
            return `${pre}${rewritten}${post}`;
        }
    );
    
    // Rewrite poster attributes
    html = html.replace(
        /(poster\s*=\s*["'])([^"']+)(["'])/gi,
        (match, pre, url, post) => {
            const absolute = makeAbsolute(url);
            if (!absolute) return match;
            return `${pre}${workerBase}/p/${encodeTargetUrl(absolute)}${post}`;
        }
    );
    
    // Rewrite form actions
    html = html.replace(
        /(<form\s[^>]*)(action\s*=\s*["'])([^"']+)(["'])/gi,
        (match, tag, attr, action, quote) => {
            const absolute = makeAbsolute(action);
            if (!absolute) return match;
            return `${tag}${attr}${workerBase}/p/${encodeTargetUrl(absolute)}${quote}`;
        }
    );
    
    // Rewrite inline style url()
    html = html.replace(
        /(style\s*=\s*["'][^"']*)(url\s*\(\s*["']?)([^"')]+)(["']?\s*\))/gi,
        (match, pre, urlPre, url, urlPost) => {
            const absolute = makeAbsolute(url);
            if (!absolute) return match;
            return `${pre}${urlPre}${workerBase}/p/${encodeTargetUrl(absolute)}${urlPost}`;
        }
    );
    
    // Rewrite meta refresh redirects
    html = html.replace(
        /(<meta\s[^>]*http-equiv\s*=\s*["']refresh["'][^>]*content\s*=\s*["'])(\d+;\s*url=)([^"']+)(["'])/gi,
        (match, pre, delay, url, post) => {
            const absolute = makeAbsolute(url);
            if (!absolute) return match;
            return `${pre}${delay}${workerBase}/p/${encodeTargetUrl(absolute)}${post}`;
        }
    );
    
    // Add base tag for any remaining relative URLs (fallback)
    // Set <base> to proxy URL so unintercepted relative requests still go through proxy
    // e.g. "Build/data.json" resolves to "/play/https://site.com/game/Build/data.json"
    // The /play/ route handles this correctly by stripping the prefix
    if (!/<base\s/i.test(html)) {
        const originalBase = baseUrl.origin + baseUrl.pathname.replace(/[^/]*$/, '');
        const baseTag = `<base href="${workerBase}/play/${originalBase}">`;
        if (/<head[^>]*>/i.test(html)) {
            html = html.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);
        } else if (/<html[^>]*>/i.test(html)) {
            html = html.replace(/(<html[^>]*>)/i, `$1\n<head>${baseTag}</head>`);
        }
    }
    
    // Existing <base> tags pointing to original domain should be rewritten to proxy
    html = html.replace(
        /(<base\s[^>]*href\s*=\s*["'])(https?:\/\/[^"']+)(["'])/gi,
        (match, pre, href, post) => {
            // Skip if already pointing to our proxy
            if (href.includes(workerBase)) return match;
            return `${pre}${workerBase}/play/${href}${post}`;
        }
    );
    
    // Inject JavaScript overrides for fetch/XHR
    if (injectOverrides) {
        const script = getOverrideScript(workerBase, baseUrl);
        
        // Inject before first script or at end of head
        if (/<script/i.test(html)) {
            html = html.replace(/(<script)/i, `${script}\n$1`);
        } else if (/<\/head>/i.test(html)) {
            html = html.replace(/<\/head>/i, `${script}\n</head>`);
        } else if (/<body/i.test(html)) {
            html = html.replace(/(<body[^>]*>)/i, `$1\n${script}`);
        }
    }
    
    return html;
}

function rewriteCSS(css, baseUrl, workerBase) {
    // Helper to make URLs absolute
    const makeAbsolute = (src) => {
        if (!src || src.startsWith('data:')) return null;
        try {
            if (src.startsWith('//')) return 'https:' + src;
            if (src.startsWith('/')) return baseUrl.origin + src;
            if (!src.startsWith('http')) {
                return new URL(src, baseUrl.href).href;
            }
            return src;
        } catch (e) {
            return null;
        }
    };
    
    // Rewrite url() in CSS
    css = css.replace(
        /url\s*\(\s*["']?([^"')]+)["']?\s*\)/gi,
        (match, url) => {
            const absolute = makeAbsolute(url.trim());
            if (!absolute) return match;
            return `url("${workerBase}/p/${encodeTargetUrl(absolute)}")`;
        }
    );
    
    // Rewrite @import urls
    css = css.replace(
        /@import\s+["']([^"']+)["']/gi,
        (match, url) => {
            const absolute = makeAbsolute(url);
            if (!absolute) return match;
            return `@import "${workerBase}/p/${encodeTargetUrl(absolute)}"`;
        }
    );
    
    // Rewrite @import url()
    css = css.replace(
        /@import\s+url\s*\(\s*["']?([^"')]+)["']?\s*\)/gi,
        (match, url) => {
            const absolute = makeAbsolute(url.trim());
            if (!absolute) return match;
            return `@import url("${workerBase}/p/${encodeTargetUrl(absolute)}")`;
        }
    );
    
    return css;
}

function rewriteJS(js, baseUrl, workerBase) {
    // JavaScript rewriting is LIMITED and RISKY
    // We only do safe transformations here
    
    // Rewrite obvious URL patterns in strings (very conservative)
    // This catches: fetch("https://..."), new Image().src = "..."
    
    // Pattern 1: Full URLs in strings
    js = js.replace(
        /(["'])(https?:\/\/[^"'\s]+)(["'])/g,
        (match, q1, url, q2) => {
            // Skip if it looks like a regex or template
            if (url.includes('${') || url.includes('\\')) return match;
            // Skip data URLs
            if (url.startsWith('data:')) return match;
            // Skip our own proxy URLs
            if (url.includes(workerBase)) return match;
            
            try {
                return `${q1}${workerBase}/p/${encodeTargetUrl(url)}${q2}`;
            } catch (e) {
                return match;
            }
        }
    );
    
    // NOTE: We do NOT try to rewrite:
    // - Protocol-relative URLs (//example.com) - too risky
    // - Relative URLs - impossible without execution context
    // - URLs built from variables - impossible statically
    // - URLs in minified/obfuscated code - too fragile
    //
    // The injected override script handles fetch/XHR at runtime instead.
    
    return js;
}

// ============================================================================
// INJECTED SCRIPT (Runtime URL override)
// ============================================================================

function getOverrideScript(workerBase, baseUrl) {
    // This script is injected into HTML pages to intercept fetch/XHR
    // It runs BEFORE the page's own scripts
    
    // Calculate the base path (directory of the current page)
    const basePath = baseUrl.pathname.endsWith('/') 
        ? baseUrl.pathname 
        : baseUrl.pathname.replace(/[^/]*$/, '');
    const fullBase = baseUrl.origin + basePath;
    
    return `<script>
(function() {
    'use strict';
    
    const PROXY_BASE = "${workerBase}";
    const ORIGINAL_ORIGIN = "${baseUrl.origin}";
    const ORIGINAL_BASE = "${fullBase}";
    const ENCODE_KEY = "${CONFIG.ENCODE_KEY}";
    
    // URL encoding function (must match server)
    function encodeUrl(url) {
        ${CONFIG.ENCODE_URLS ? `
        let encoded = '';
        for (let i = 0; i < url.length; i++) {
            encoded += String.fromCharCode(
                url.charCodeAt(i) ^ ENCODE_KEY.charCodeAt(i % ENCODE_KEY.length)
            );
        }
        return encodeURIComponent(btoa(encoded));
        ` : `
        return encodeURIComponent(url);
        `}
    }
    
    // Check if URL should be proxied
    function shouldProxy(url) {
        if (!url) return false;
        // Handle URL objects
        if (typeof url === 'object' && url.href) url = url.href;
        if (typeof url !== 'string') return false;
        if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return false;
        if (url.startsWith(PROXY_BASE)) return false;
        // Don't proxy chrome-extension or moz-extension URLs
        if (url.startsWith('chrome-extension:') || url.startsWith('moz-extension:')) return false;
        return true;
    }
    
    // Convert any URL to a string  
    function urlToString(url) {
        if (typeof url === 'string') return url;
        if (typeof url === 'object' && url.href) return url.href;
        return String(url);
    }
    
    // Convert URL to proxied URL
    function proxyUrl(url) {
        url = urlToString(url);
        if (!shouldProxy(url)) return url;
        
        try {
            let absolute = url;
            if (url.startsWith('//')) {
                absolute = 'https:' + url;
            } else if (url.startsWith('/')) {
                // Absolute path - resolve from original origin
                absolute = ORIGINAL_ORIGIN + url;
            } else if (!url.startsWith('http')) {
                // Relative path - resolve from original base (includes directory)
                absolute = new URL(url, ORIGINAL_BASE).href;
            }
            
            return PROXY_BASE + '/p/' + encodeUrl(absolute);
        } catch (e) {
            return url;
        }
    }
    
    // Override fetch - handle string, Request, and URL inputs
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        try {
            let url;
            if (input instanceof Request) {
                url = input.url;
            } else {
                url = urlToString(input);
            }
            
            if (shouldProxy(url)) {
                const proxiedUrl = proxyUrl(url);
                if (input instanceof Request) {
                    input = new Request(proxiedUrl, input);
                } else {
                    input = proxiedUrl;
                }
            }
        } catch(e) {}
        
        return originalFetch.call(this, input, init);
    };
    
    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        try {
            url = urlToString(url);
            if (shouldProxy(url)) {
                url = proxyUrl(url);
            }
        } catch(e) {}
        return originalXHROpen.call(this, method, url, ...args);
    };
    
    // Override Image src
    const originalImageDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (originalImageDescriptor) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            set: function(url) {
                if (shouldProxy(url)) {
                    url = proxyUrl(url);
                }
                return originalImageDescriptor.set.call(this, url);
            },
            get: originalImageDescriptor.get
        });
    }
    
    // Override Audio src
    const originalAudioDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (originalAudioDescriptor) {
        Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            set: function(url) {
                if (shouldProxy(url)) {
                    url = proxyUrl(url);
                }
                return originalAudioDescriptor.set.call(this, url);
            },
            get: originalAudioDescriptor.get
        });
    }
    
    // Override createElement to catch dynamically created scripts/links
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, options) {
        const element = originalCreateElement.call(this, tagName, options);
        
        if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link' || 
            tagName.toLowerCase() === 'img' || tagName.toLowerCase() === 'iframe') {
            
            // Intercept src/href setting
            const descriptor = Object.getOwnPropertyDescriptor(element.__proto__, 'src') || 
                              Object.getOwnPropertyDescriptor(element.__proto__.__proto__, 'src');
            
            if (descriptor) {
                const originalSet = descriptor.set;
                Object.defineProperty(element, 'src', {
                    set: function(url) {
                        if (shouldProxy(url)) {
                            url = proxyUrl(url);
                        }
                        return originalSet.call(this, url);
                    },
                    get: descriptor.get,
                    configurable: true
                });
            }
        }
        
        return element;
    };
    
    // Override WebSocket for proxying
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        if (shouldProxy(url)) {
            // Convert ws(s):// to our proxy
            let wsUrl = url;
            if (url.startsWith('wss://')) {
                wsUrl = PROXY_BASE.replace('https://', 'wss://') + '/ws/' + encodeUrl(url.replace('wss://', 'https://'));
            } else if (url.startsWith('ws://')) {
                wsUrl = PROXY_BASE.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws/' + encodeUrl(url.replace('ws://', 'http://'));
            }
            console.debug('[Proxy] WebSocket:', url, '->', wsUrl);
            url = wsUrl;
        }
        return new OriginalWebSocket(url, protocols);
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    
    // Override window.open for popups
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
        if (shouldProxy(url)) {
            url = PROXY_BASE + '/play/' + (url.startsWith('http') ? url : new URL(url, ORIGINAL_BASE).href);
        }
        return originalWindowOpen.call(this, url, target, features);
    };
    
    // Override location assignments (limited effectiveness)
    try {
        const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    } catch (e) {}
})();
</script>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildProxyHeaders(request, targetUrl) {
    const headers = new Headers();
    
    headers.set('User-Agent', CONFIG.USER_AGENT);
    headers.set('Accept', request.headers.get('Accept') || '*/*');
    headers.set('Accept-Language', request.headers.get('Accept-Language') || 'en-US,en;q=0.9');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Referer', targetUrl.origin + '/');
    headers.set('Origin', targetUrl.origin);
    
    // Forward content-type for POST requests
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
        headers.set('Content-Type', contentType);
    }
    
    // Forward cookies if present (game sessions)
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        headers.set('Cookie', cookie);
    }
    
    return headers;
}

function buildResponseHeaders(originalResponse, contentType, isText) {
    const headers = new Headers();
    
    // Content type
    headers.set('Content-Type', contentType);
    
    // CORS - allow everything
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Access-Control-Expose-Headers', '*');
    
    // Caching based on content type
    let cacheTTL = CONFIG.CACHE_TTL.other;
    if (contentType.includes('text/html')) {
        cacheTTL = CONFIG.CACHE_TTL.html;
    } else if (contentType.includes('text/css')) {
        cacheTTL = CONFIG.CACHE_TTL.css;
    } else if (contentType.includes('javascript')) {
        cacheTTL = CONFIG.CACHE_TTL.js;
    } else if (contentType.includes('image/')) {
        cacheTTL = CONFIG.CACHE_TTL.image;
    } else if (contentType.includes('font/') || contentType.includes('woff')) {
        cacheTTL = CONFIG.CACHE_TTL.font;
    }
    
    if (cacheTTL > 0) {
        headers.set('Cache-Control', `public, max-age=${cacheTTL}`);
    } else {
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    // Remove headers that could cause issues
    // (We don't copy CSP, X-Frame-Options, etc. from target)
    
    // For games needing SharedArrayBuffer, these would be required:
    // headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    // headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    // BUT this breaks cross-origin resources, so we don't set them by default.
    
    return headers;
}

function handleCORS(request) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400'
        }
    });
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

function getUsageHTML(workerBase) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Game Proxy</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
               max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        h1 { color: #333; }
        .example { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>🎮 Game Proxy Worker</h1>
    <p>This worker proxies game content through your domain.</p>
    
    <h2>Usage</h2>
    <pre>/play/[game_url]     - Play a game through the proxy
/p/[encoded_url]     - Proxy a resource (used internally)
/raw/[url]           - Raw proxy without rewriting
/encode?url=[url]    - Get encoded URL</pre>
    
    <h2>Example</h2>
    <div class="example">
        <p>To play a game at <code>https://example.com/game/</code>:</p>
        <pre>${workerBase}/play/https://example.com/game/</pre>
    </div>
    
    <h2>What Works</h2>
    <ul>
        <li>✅ HTML5 Canvas games</li>
        <li>✅ Most Construct 2/3 games</li>
        <li>✅ Most Phaser/PixiJS games</li>
        <li>✅ Simple Unity WebGL (without SharedArrayBuffer)</li>
        <li>✅ Flash emulated games (Ruffle)</li>
        <li>✅ Static asset loading (images, audio, JS, CSS)</li>
    </ul>
    
    <h2>What May Not Work</h2>
    <ul>
        <li>❌ Games requiring SharedArrayBuffer (multi-threaded Unity)</li>
        <li>❌ WebRTC multiplayer (peer-to-peer)</li>
        <li>❌ Games with domain-locked licenses</li>
        <li>❌ Games using Service Workers</li>
    </ul>
</body>
</html>`;
}
