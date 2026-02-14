/**
 * Gemtra Games - Cloudflare Worker Proxy
 * 
 * This worker proxies game content for privacy.
 * Deploy to Cloudflare Workers, then update WORKER_URL in your site.
 */

// Simple encoding key - change this to something unique!
const ENCODE_KEY = 'gemtra2026';

// Decode the URL (simple XOR cipher)
function decodeUrl(encoded) {
    try {
        // First base64 decode
        const decoded = atob(encoded);
        // Then XOR with key
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(
                decoded.charCodeAt(i) ^ ENCODE_KEY.charCodeAt(i % ENCODE_KEY.length)
            );
        }
        return result;
    } catch (e) {
        return null;
    }
}

// Encode URL (for reference - this runs client-side)
function encodeUrl(url) {
    let encoded = '';
    for (let i = 0; i < url.length; i++) {
        encoded += String.fromCharCode(
            url.charCodeAt(i) ^ ENCODE_KEY.charCodeAt(i % ENCODE_KEY.length)
        );
    }
    return btoa(encoded);
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                }
            });
        }

        // Get the encoded URL from path (e.g., /proxy/ENCODED_URL)
        const path = url.pathname;
        
        // IMAGE PROXY - simple passthrough for images (no encoding needed)
        if (path.startsWith('/img/')) {
            const imageUrl = decodeURIComponent(path.slice(5)); // Remove '/img/'
            
            if (!imageUrl || !imageUrl.startsWith('http')) {
                return new Response('Invalid image URL', { status: 400 });
            }

            try {
                const response = await fetch(imageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                        'Referer': new URL(imageUrl).origin + '/',
                    },
                });

                const imageData = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/png';

                return new Response(imageData, {
                    status: response.status,
                    headers: {
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=86400',
                    }
                });
            } catch (error) {
                return new Response('Image fetch failed', { status: 500 });
            }
        }
        
        if (path.startsWith('/proxy/')) {
            const encodedUrl = path.slice(7); // Remove '/proxy/'
            const targetUrl = decodeUrl(decodeURIComponent(encodedUrl));
            
            if (!targetUrl || !targetUrl.startsWith('http')) {
                return new Response('Invalid request', { status: 400 });
            }

            try {
                // Fetch the target URL
                const response = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
                        'Accept': request.headers.get('Accept') || '*/*',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    redirect: 'follow'
                });

                // Get the content
                let content = await response.text();
                const contentType = response.headers.get('content-type') || 'text/html';

                // For HTML content, rewrite relative URLs to go through proxy
                if (contentType.includes('text/html')) {
                    const baseUrl = new URL(targetUrl);
                    const workerBase = url.origin;
                    
                    // Rewrite src and href attributes to proxy through worker
                    content = rewriteUrls(content, baseUrl, workerBase);
                }

                // Return with CORS headers - remove restrictive headers
                const responseHeaders = new Headers();
                responseHeaders.set('Content-Type', contentType);
                responseHeaders.set('Access-Control-Allow-Origin', '*');
                
                return new Response(content, {
                    status: response.status,
                    headers: responseHeaders
                });

            } catch (error) {
                return new Response(`Proxy error: ${error.message}`, { status: 500 });
            }
        }

        // For /encode endpoint - helper to encode URLs
        if (path.startsWith('/encode/')) {
            const urlToEncode = decodeURIComponent(path.slice(8));
            const encoded = encodeUrl(urlToEncode);
            return new Response(JSON.stringify({ 
                original: urlToEncode,
                encoded: encoded,
                proxyUrl: `${url.origin}/proxy/${encoded}`
            }, null, 2), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Root path - show info
        return new Response(`
            Gemtra Games Proxy Worker
            
            Usage:
            - /proxy/[encoded_url] - Proxy a game
            - /encode/[url] - Get encoded URL for a game
            
            Example:
            /encode/https://example.com/game/
        `, { 
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};

// Rewrite URLs in HTML to go through proxy
function rewriteUrls(html, baseUrl, workerBase) {
    const ENCODE_KEY = 'gemtra2026';
    
    function encodeUrl(url) {
        let encoded = '';
        for (let i = 0; i < url.length; i++) {
            encoded += String.fromCharCode(
                url.charCodeAt(i) ^ ENCODE_KEY.charCodeAt(i % ENCODE_KEY.length)
            );
        }
        return btoa(encoded);
    }

    function makeAbsolute(src) {
        if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('javascript:')) {
            return src;
        }
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
    }

    // Rewrite src attributes
    html = html.replace(/(src=["'])([^"']+)(["'])/gi, (match, pre, src, post) => {
        const absoluteUrl = makeAbsolute(src);
        if (absoluteUrl.startsWith('http')) {
            const encoded = encodeUrl(absoluteUrl);
            return `${pre}${workerBase}/proxy/${encoded}${post}`;
        }
        return match;
    });

    // Rewrite href for stylesheets
    html = html.replace(/(href=["'])([^"']+\.css[^"']*)(["'])/gi, (match, pre, href, post) => {
        const absoluteUrl = makeAbsolute(href);
        if (absoluteUrl.startsWith('http')) {
            const encoded = encodeUrl(absoluteUrl);
            return `${pre}${workerBase}/proxy/${encoded}${post}`;
        }
        return match;
    });

    // Add base tag for remaining relative URLs
    if (!html.includes('<base')) {
        html = html.replace('<head>', `<head><base href="${baseUrl.origin}/">`);
    }

    return html;
}
