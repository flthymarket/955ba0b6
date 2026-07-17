// Shared Shopify Storefront helper for MCP tools.
// Uses the PUBLIC Storefront API token — safe for an unauthenticated MCP server.

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_DOMAIN = "archive-curated-space-3cl85.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "de7a6b056442663f558d046ceaaa3469";

export async function storefront<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Shopify Storefront API error [${res.status}]: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

export const STOREFRONT_URL = `https://flthy.lovable.app`;
