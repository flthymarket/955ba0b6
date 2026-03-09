import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'archive-curated-space-3cl85.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_ADMIN_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ADMIN_ACCESS_TOKEN');
    if (!SHOPIFY_ADMIN_ACCESS_TOKEN) {
      throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not configured');
    }

    const { operation, variables } = await req.json();

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: operation,
          variables: variables || {},
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify Admin API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Shopify Admin API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
