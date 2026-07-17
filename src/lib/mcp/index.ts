import { defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listBrands from "./tools/list-brands";

export default defineMcp({
  name: "flthymrkt-mcp",
  title: "FlthyMrkt",
  version: "0.1.0",
  instructions:
    "Public tools for the FlthyMrkt storefront. Use `search_products` to find items by keyword, brand, or product type; `get_product` to fetch full details for a product handle; and `list_brands` to see the brands currently in stock.",
  tools: [searchProducts, getProduct, listBrands],
});
