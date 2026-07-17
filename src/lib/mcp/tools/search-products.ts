import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { storefront, STOREFRONT_URL } from "../shopify";

const QUERY = `
  query SearchProducts($query: String, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          vendor
          productType
          description
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
        }
      }
    }
  }
`;

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the FlthyMrkt storefront catalog by keyword, brand, or product type. Returns public product listings with price, image, and a link to the product page.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .default("")
      .describe(
        "Free-text search. Supports Shopify query syntax such as `vendor:Nike` or `product_type:Tops`. Empty string returns recent products.",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of products to return (1–50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const data = await storefront<{ products: { edges: any[] } }>(QUERY, {
      query: query || null,
      first: limit,
    });
    const products = data.products.edges.map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      brand: node.vendor,
      productType: node.productType,
      price: `${node.priceRange.minVariantPrice.amount} ${node.priceRange.minVariantPrice.currencyCode}`,
      image: node.images.edges[0]?.node.url ?? null,
      url: `${STOREFRONT_URL}/product/${node.handle}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
      structuredContent: { products },
    };
  },
});
