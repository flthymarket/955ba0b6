import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SHOPIFY_ADMIN_ACCESS_TOKEN) {
      throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not configured');
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFilter = sevenDaysAgo.toISOString();

    // Query Shopify for products created in last 7 days
    const query = `
      query GetRecentProducts($query: String!) {
        products(first: 100, query: $query) {
          edges {
            node {
              id
              handle
              title
              createdAt
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            query: `created_at:>=${dateFilter}`,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${errorText}`);
    }

    const shopifyData = await response.json();
    
    if (shopifyData.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(shopifyData.errors)}`);
    }

    const recentProducts = shopifyData.data?.products?.edges || [];
    
    // Connect to Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Clear existing new arrivals and replace with fresh data
    await supabase.from('new_arrivals').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new arrivals
    const newArrivals = recentProducts.map((edge: any) => ({
      shopify_handle: edge.node.handle,
      product_title: edge.node.title,
      added_at: edge.node.createdAt,
    }));

    if (newArrivals.length > 0) {
      const { error: insertError } = await supabase
        .from('new_arrivals')
        .insert(newArrivals);

      if (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: newArrivals.length,
        products: newArrivals.map((p: any) => p.product_title)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
