import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Health endpoint
    if (path === '/klaro-api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Register endpoint
    if (path === '/klaro-api/register' && req.method === 'POST') {
      const { email, domain, name, plan = 'tier1' } = await req.json();

      if (!email || !domain || !name) {
        return new Response(JSON.stringify({
          error: 'Missing required fields',
          message: 'Email, domain, and name are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const apiKey = `klaro_${crypto.randomUUID().replace(/-/g, '')}`;

      const { data, error } = await supabase
        .from('clients')
        .insert({
          email,
          domain,
          name,
          api_key: apiKey,
          plan,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({
          error: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        message: 'Client registered successfully',
        client: {
          id: data.id,
          email: data.email,
          domain: data.domain,
          name: data.name,
          apiKey: data.api_key,
          status: data.status
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Query endpoint
    if (path === '/klaro-api/query' && req.method === 'POST') {
      const apiKey = req.headers.get('X-API-Key');
      
      if (!apiKey) {
        return new Response(JSON.stringify({
          error: 'API key required'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('api_key', apiKey)
        .single();

      if (!client) {
        return new Response(JSON.stringify({
          error: 'Invalid API key'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { query, url: targetUrl } = await req.json();

      if (!query || !targetUrl) {
        return new Response(JSON.stringify({
          error: 'Query and URL are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Simple AI response
      const response = {
        message: `I'll help you find: ${query}. Look for relevant elements on ${targetUrl}.`,
        highlight: 'button, a[href], input[type="submit"]',
        steps: ['Look for the highlighted elements', 'Click on the relevant one'],
        confidence: 0.75,
        processingTime: 1000
      };

      // Save query
      await supabase.from('queries').insert({
        client_id: client.id,
        query,
        url: targetUrl,
        response: response,
        confidence: response.confidence,
        processing_time: response.processingTime
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default response
    return new Response(JSON.stringify({
      message: 'Klaro AI API',
      endpoints: ['/health', '/register', '/query']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});