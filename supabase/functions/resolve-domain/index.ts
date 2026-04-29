import "@supabase/functions-js/edge-runtime.d.ts"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const { domain } = await req.json().catch(() => ({}));
  if (!domain) {
    return new Response(JSON.stringify({ error: 'domain required' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(
    `https://api.unstoppabledomains.com/resolve/domains/${encodeURIComponent(domain)}`,
    { headers: { Authorization: `Bearer ${Deno.env.get('UD_API_KEY')}` } }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ address: null }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  const address: string = data?.records?.['crypto.ETH.address'] ?? '';
  return new Response(JSON.stringify({ address: address || null }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
