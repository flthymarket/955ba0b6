import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { storefront, STOREFRONT_URL } from "../shopify";

const QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      vendor
      productType
      tags
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      variants(first: 25) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

export default defineTool({
  name: "get_product",
  title: "Get product",
  description:
    "Fetch full public details for a single FlthyMrkt product by its Shopify handle (URL slug), including variants, images, price, and availability.",
  inputSchema: {
    handle: z
      .string()
      .trim()
      .min(1)
      .describe("Product handle / URL slug, e.g. `vintage-denim-jacket`."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ handle }) => {
    const data = await storefront<{ productByHandle: any }>(QUERY, { handle });
    const p = data.productByHandle;
    if (!p) {
      return {
        content: [{ type: "text", text: `No product found for handle: ${handle}` }],
        isError: true,
      };
    }
    const product = {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description,
      brand: p.vendor,
      productType: p.productType,
      tags: p.tags,
      price: `${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`,
      images: p.images.edges.map((e: any) => ({ url: e.node.url, alt: e.node.altText })),
      variants: p.variants.edges.map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        available: e.node.availableForSale,
        price: `${e.node.price.amount} ${e.node.price.currencyCode}`,
        options: e.node.selectedOptions,
      })),
      url: `${STOREFRONT_URL}/product/${p.handle}`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
