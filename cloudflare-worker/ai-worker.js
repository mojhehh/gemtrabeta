/**
 * Gemtra AI Cloudflare Worker
 * Proxies requests to Cerebras AI API
 * 
 * Deploy: wrangler deploy
 */

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_API_KEY = 'csk-9r8dj8me9c3mywnec6ed2wm9rhkc4hd6yc8tx5nkx98kcprd';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Health check endpoint
        if (request.method === 'GET' && url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Only allow POST for chat
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const body = await request.json();

            // Validate request
            if (!body.messages || !Array.isArray(body.messages)) {
                return new Response(JSON.stringify({ error: 'Invalid request: messages required' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Make request to Cerebras API - use llama3.1-8b which is available
            const response = await fetch(CEREBRAS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.CEREBRAS_API_KEY || CEREBRAS_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama3.1-8b',
                    messages: body.messages,
                    max_tokens: body.max_tokens || 500,
                    temperature: body.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Cerebras API error:', response.status, errorText);
                return new Response(JSON.stringify({ 
                    error: 'AI service error',
                    status: response.status 
                }), {
                    status: response.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const data = await response.json();

            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
