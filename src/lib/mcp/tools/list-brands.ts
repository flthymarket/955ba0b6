import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { storefront } from "../shopify";

const QUERY = `
  query BrandVendors($first: Int!) {
    products(first: $first) {
      edges { node { vendor } }
    }
  }
`;

export default defineTool({
  name: "list_brands",
  title: "List brands",
  description:
    "Return the distinct set of brand names (Shopify vendors) currently carried on the FlthyMrkt storefront.",
  inputSchema: {
    sample: z
      .number()
      .int()
      .min(50)
      .max(250)
      .default(250)
      .describe("How many products to scan when building the brand list."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ sample }) => {
    const data = await storefront<{ products: { edges: { node: { vendor: string } }[] } }>(
      QUERY,
      { first: sample },
    );
    const brands = Array.from(
      new Set(
        data.products.edges
          .map((e) => (e.node.vendor || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return {
      content: [{ type: "text", text: JSON.stringify(brands, null, 2) }],
      structuredContent: { brands },
    };
  },
});
