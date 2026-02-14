# Cloudflare Worker Game Proxy - Technical Documentation

## Overview

This Cloudflare Worker acts as a **full reverse proxy** for HTML5 games, routing all network requests through your domain to bypass school network filters that block known game CDNs and domains.

## How School Filtering Works (and Why This Helps)

### What School Filters Typically Block

1. **Domain-based blocking**: Filters maintain lists of known game domains (e.g., `*.coolmathgames.com`, `*.kongregate.com`, CDNs like `cdn.cloudflare.steamstatic.com`)
2. **Category-based blocking**: DNS-level blocking of domains categorized as "Games"
3. **URL pattern matching**: Blocking URLs containing `/games/`, `/play/`, etc.

### How This Proxy Bypasses Filtering

When a student visits `https://your-worker.workers.dev/play/https://blocked-game.com/game/`:

1. **Browser only sees your domain** - All requests go to `your-worker.workers.dev`
2. **DNS only resolves your domain** - The blocked game domain is never queried from the school network
3. **URLs are encoded** - The original URLs are XOR-encoded so they don't appear in plaintext logs
4. **All assets routed through proxy** - Images, JS, CSS, audio all come from your domain

```
[Student Browser] → [School Network] → [Your Cloudflare Worker] → [Game Server]
                     
                     ↑ Filter sees requests to your domain only
                     ↑ Never sees "game.com" in DNS or HTTP
```

## What Works ✅

### Fully Supported

| Content Type | How It's Proxied |
|--------------|------------------|
| **HTML Pages** | Fetched, all `src`/`href` attributes rewritten to proxy URLs |
| **CSS Files** | Fetched, all `url()` and `@import` rewritten |
| **JavaScript** | Fetched, obvious URL strings rewritten (limited) |
| **Images** | Binary passthrough with proper MIME types |
| **Audio/Video** | Binary passthrough with streaming support |
| **Fonts** | Binary passthrough (WOFF, WOFF2, TTF, etc.) |
| **Fetch/XHR** | Intercepted by injected script, redirected to proxy |
| **Dynamic Images** | `new Image().src` intercepted at runtime |
| **Iframes** | Content proxied and rewritten recursively |

### Game Engines That Work Well

- **Construct 2/3** - Excellent compatibility
- **Phaser** - Excellent compatibility
- **PixiJS** - Excellent compatibility
- **GameMaker HTML5** - Good compatibility
- **GDevelop** - Good compatibility
- **Simple Unity WebGL** - Works if single-threaded
- **Ruffle (Flash emulation)** - Works
- **Most .io games** - Works if not using WebRTC

## What Doesn't Work ❌

### Browser Security Limitations

#### 1. SharedArrayBuffer / Multi-threaded Unity WebGL

**Problem**: Modern Unity WebGL games use `SharedArrayBuffer` for multi-threading, which requires:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**Why it fails**: Setting these headers means ALL resources must either:
- Be same-origin, OR
- Have `Cross-Origin-Resource-Policy: cross-origin` header

Since we're proxying third-party content that doesn't set these headers, enabling COOP/COEP breaks resource loading.

**Workaround**: None that's fully compatible. The game must be rebuilt without multi-threading, or all resources must be served from the same origin with proper headers.

#### 2. WebRTC (Multiplayer Games)

**Problem**: WebRTC establishes peer-to-peer connections directly between browsers using STUN/TURN servers to discover IP addresses.

**Why it fails**: 
- Peer connections bypass our proxy entirely
- The connection negotiation may work through the proxy, but actual game data flows directly
- School firewalls often block WebRTC entirely (UDP ports, TURN servers)

**What partially works**: Games using WebRTC only for voice chat may work for gameplay but not voice.

#### 3. Service Workers

**Problem**: Service Workers can only be registered for the same origin they're served from.

**Why it fails**: If a game at `game.com` tries to register `game.com/sw.js`, it can't work because the page is actually served from `your-proxy.com`.

**Impact**: Games using Service Workers for offline caching, background sync, or push notifications won't work correctly.

#### 4. WebSockets (Partial Support)

**Status**: Partially implemented but unreliable.

**What works**: Simple WebSocket connections for turn-based games.

**What fails**: 
- High-frequency real-time games (latency issues)
- Binary WebSocket protocols may break
- Some games detect WebSocket URL mismatch and refuse to connect

#### 5. Domain-Locked Content

**Problem**: Some games verify they're running on authorized domains.

**Detection methods**:
- Checking `window.location.hostname`
- Checking `document.domain`
- Server-side license validation
- Checking `Referer` header

**Our mitigations**:
- We set `Referer` to the original domain
- We can't override `window.location` without breaking the page

### Technical Impossibilities

#### 1. Hardcoded URLs in Minified JavaScript

```javascript
// Original (readable)
fetch("https://api.game.com/scores")

// Minified (common)
a.fetch("https://api.game.com/scores")

// String concatenation (impossible to rewrite statically)
fetch("https://api." + config.domain + "/scores")

// Template literals
fetch(`https://${host}/api/data`)
```

**Why we can't fix this**: Static rewriting can't understand JavaScript execution. We inject runtime overrides for `fetch` and `XHR`, but some games use patterns we can't intercept.

#### 2. Cookies and Sessions

**Problem**: Cookies are domain-specific. A cookie set for `game.com` won't be sent to `your-proxy.com`.

**Impact**: 
- Game progress saved to cookies is lost
- Login sessions don't persist
- Anti-cheat systems may flag proxy users

#### 3. Deep Packet Inspection (DPI)

**Problem**: Enterprise-grade firewalls can:
- Inspect HTTPS traffic (with their own certificate)
- Detect encoded patterns in URLs
- Identify game traffic by behavior analysis

**This proxy does NOT bypass**: 
- DPI firewalls that terminate TLS
- AI-based traffic analysis
- Bandwidth throttling by content type

## URL Encoding System

The proxy uses simple XOR encoding to obscure target URLs:

```javascript
// Encoding (client or server)
function encodeTargetUrl(url) {
    let encoded = '';
    for (let i = 0; i < url.length; i++) {
        encoded += String.fromCharCode(
            url.charCodeAt(i) ^ ENCODE_KEY.charCodeAt(i % ENCODE_KEY.length)
        );
    }
    return encodeURIComponent(btoa(encoded));
}
```

**This is NOT encryption** - it's obfuscation to prevent:
- Simple grep searches in logs
- URL pattern matching by filters
- Casual inspection

Anyone with the encode key can decode the URLs. Change `ENCODE_KEY` to something unique.

## Request Flow

```
1. User visits: /play/https://game.com/

2. Worker fetches: https://game.com/
   └─> Returns HTML

3. Worker processes HTML:
   ├─> Rewrites <script src="game.js"> to <script src="/p/[encoded:game.com/game.js]">
   ├─> Rewrites <img src="sprite.png"> to <img src="/p/[encoded:game.com/sprite.png]">
   ├─> Rewrites <link href="style.css"> to <link href="/p/[encoded:game.com/style.css]">
   └─> Injects override script for fetch/XHR

4. Browser loads rewritten HTML:
   ├─> Requests /p/[encoded:game.com/game.js]
   │   └─> Worker fetches game.com/game.js, returns it
   ├─> Requests /p/[encoded:game.com/sprite.png]
   │   └─> Worker fetches game.com/sprite.png, returns it
   └─> Game JS calls fetch("https://api.game.com/data")
       └─> Injected override rewrites to /p/[encoded:api.game.com/data]
           └─> Worker fetches api.game.com/data, returns it

5. All network traffic from browser goes to your worker domain only
```

## Deployment

### Prerequisites
- Cloudflare account (free tier works)
- Wrangler CLI installed: `npm install -g wrangler`

### Deploy

```bash
cd cloudflare-worker

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy game-proxy.js --name gemtra-proxy
```

### Configuration

Edit `game-proxy.js` CONFIG section:

```javascript
const CONFIG = {
    WORKER_BASE: '',           // Auto-detected, or set to 'https://your-worker.workers.dev'
    ENCODE_URLS: true,         // Set to false for debugging
    ENCODE_KEY: 'your-secret', // Change this!
    CACHE_TTL: { ... }         // Adjust caching as needed
};
```

### Using a Custom Domain

1. Add a custom domain in Cloudflare Dashboard
2. Set up DNS to point to the worker
3. Update `WORKER_BASE` if needed

## Integration with Your Website

### Embedding a Proxied Game

```html
<iframe 
    src="https://your-worker.workers.dev/play/https://game-site.com/game/"
    width="800" 
    height="600"
    allow="autoplay; fullscreen"
></iframe>
```

### JavaScript Game Loader

```javascript
function playGame(gameUrl) {
    const workerUrl = 'https://your-worker.workers.dev';
    const proxiedUrl = `${workerUrl}/play/${gameUrl}`;
    
    // Open in new tab
    window.open(proxiedUrl, '_blank');
    
    // Or load in iframe
    document.getElementById('game-frame').src = proxiedUrl;
}
```

### URL Encoding Helper

```javascript
async function getProxyUrl(gameUrl) {
    const response = await fetch(
        `https://your-worker.workers.dev/encode?url=${encodeURIComponent(gameUrl)}`
    );
    const data = await response.json();
    return data.playUrl;
}
```

## Troubleshooting

### Game loads but assets are missing

**Cause**: Some URLs weren't rewritten correctly.

**Debug**:
1. Open browser DevTools → Network tab
2. Look for failed requests (red)
3. Check if they're going to the original domain instead of proxy
4. If JS is building URLs dynamically, the runtime override may not catch them

### Game shows blank/white screen

**Cause**: JavaScript error, often from failed fetch/XHR.

**Debug**:
1. Open DevTools → Console
2. Look for CORS errors or fetch failures
3. Check if `[Proxy]` messages show URL rewrites happening

### WebSocket connection fails

**Cause**: WebSocket URL not being proxied, or connection failing.

**Check**:
- Console for `[Proxy] WebSocket:` messages
- Network tab → WS filter for connection status

### Game says "Not authorized" or "Invalid domain"

**Cause**: Game has domain checking.

**Options**:
- Find a different source for the game
- Some games have "embed" versions without domain locks
- Nothing can be done if server-side validation

### Extremely slow loading

**Cause**: Every request goes through the worker, adding latency.

**Mitigations**:
- Enable Cloudflare caching for static assets
- Use a worker location close to most users
- Consider self-hosting frequently-played games

## Security Considerations

1. **This proxy can access any URL** - Consider adding an allowlist for production
2. **Encoded URLs are not secure** - Don't rely on encoding for access control
3. **Cookies are forwarded** - Be careful with authenticated content
4. **No rate limiting** - Add rate limiting for production use

## Limitations Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Static HTML/CSS/JS | ✅ Full | URL rewriting |
| Images/Audio/Video | ✅ Full | Binary passthrough |
| fetch() / XHR | ✅ Full | Runtime override |
| Dynamic createElement | ✅ Partial | Intercepted but not 100% |
| WebSockets | ⚠️ Partial | Basic support only |
| WebRTC | ❌ None | P2P bypasses proxy |
| SharedArrayBuffer | ❌ None | Requires COOP/COEP |
| Service Workers | ❌ None | Same-origin requirement |
| Domain-locked games | ❌ None | Can't spoof location |

## Version History

- **v1.0** - Initial release with HTML/CSS/JS rewriting
- **v1.1** - Added fetch/XHR runtime override injection
- **v1.2** - Added WebSocket proxy support
- **v1.3** - Improved CSS url() rewriting, srcset support
