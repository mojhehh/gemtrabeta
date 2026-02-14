# Gemtra Games - Cloudflare Worker Proxy Setup

This proxy makes all game traffic go through your Cloudflare Worker. Your school's HTTPS inspection will only see requests to `yourworker.workers.dev`, not the actual game URLs.

## How It Works

1. Game URLs are **encoded** (XOR cipher + base64) in the browser
2. Requests go to your Cloudflare Worker: `worker.dev/proxy/ENCODED_URL`
3. Worker **decodes** the URL and fetches the game
4. Game content is served back through the worker
5. School only sees: `gemtra-proxy.yourname.workers.dev` ✅
6. School doesn't see: `lolygames.github.io` ❌

## Setup Instructions

### 1. Create Cloudflare Account
- Go to https://dash.cloudflare.com/sign-up
- Sign up for free (Workers free tier = 100k requests/day)

### 2. Create Worker
1. Go to **Workers & Pages** in sidebar
2. Click **Create Application**
3. Click **Create Worker**
4. Name it something like `gemtra-proxy`
5. Click **Deploy**

### 3. Add Worker Code
1. Click **Edit code** (or Quick Edit)
2. Delete all default code
3. Copy/paste everything from `worker.js`
4. Click **Save and Deploy**

### 4. Get Your Worker URL
After deploying, you'll see your URL like:
```
https://gemtra-proxy.YOUR_SUBDOMAIN.workers.dev
```

### 5. Update Your Site
Edit `script.js` and change line 6:
```javascript
const WORKER_URL = 'https://gemtra-proxy.YOUR_SUBDOMAIN.workers.dev';
```

### 6. Test It
1. Open your site
2. Click a game
3. Check browser DevTools Network tab
4. All requests should go to `workers.dev`, not game hosts

## Security Notes

- **Change the ENCODE_KEY** in both `worker.js` and `script.js` to something unique
- The encoding isn't encryption - it just makes URLs unreadable to casual inspection
- Works for privacy, not for bypassing actual blocks

## Troubleshooting

### Games not loading?
- Check browser console for errors
- Make sure WORKER_URL doesn't have trailing slash
- Verify the worker is deployed and running

### CORS errors?
- The worker has CORS headers, but some games might block iframe embedding
- Try a different game to test

### Worker errors?
- Check Cloudflare Workers dashboard for logs
- Some complex games with websockets may not work through proxy

## Files

- `worker.js` - The Cloudflare Worker code
- `script.js` - Updated with proxy support (set WORKER_URL)

## Free Tier Limits

Cloudflare Workers free tier:
- 100,000 requests per day
- 10ms CPU time per request
- More than enough for personal use!
